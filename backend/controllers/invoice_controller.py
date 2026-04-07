from fastapi import APIRouter, UploadFile, File
from services.embedding_service import generate_embedding
from services.vector_db_service import store_embedding_data, search_similar_data

import asyncio
import os
import tempfile

# Agents
from agents.invoice_agent import invoice_agent
from agents.po_agent import po_agent
from agents.fraud_agent import fraud_agent

# Services
from services.db_service import save_invoice, get_all_invoices

# Utils
from utils.pdf_extractor import extract_text

router = APIRouter()

DUPLICATE_SCORE_THRESHOLD = 0.999


def deduplicate_similar_results(results):
    unique_results = []
    seen_keys = set()

    for result in results:
        payload = result.payload or {}
        key = payload.get("text_preview", "")

        if key in seen_keys:
            continue

        seen_keys.add(key)
        unique_results.append(result)

    return unique_results


@router.post("/process-invoice")
async def process_invoice(file: UploadFile = File(...)):
    if file.content_type != "application/pdf" or not file.filename.endswith(".pdf"):
        return {"error": "Only PDF files are allowed"}

    contents = await file.read()

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
        temp_file.write(contents)
        temp_file_path = temp_file.name

    try:
        text = extract_text(temp_file_path)

        results = await asyncio.gather(
            invoice_agent(text),
            po_agent(text),
            fraud_agent(text)
        )

        decision = {
            "decision": "HOLD" if any(r["status"] == "fail" for r in results) else "APPROVE",
            "issues": [r for r in results if r["status"] == "fail"]
        }

        embedding = generate_embedding(text)
        similar_results = search_similar_data(embedding)
        similar_results = deduplicate_similar_results(similar_results)

        is_exact_duplicate = any(r.score >= DUPLICATE_SCORE_THRESHOLD for r in similar_results)

        if not is_exact_duplicate:
            store_embedding_data(
                embedding,
                payload={
                    "text_preview": text[:200],
                    "decision": decision["decision"]
                }
            )

        invoice_data = {
            "text": text,
            "agent_results": results,
            "final_decision": decision
        }

        save_invoice(invoice_data)

        return {
            "text_preview": text[:200],
            "agent_results": results,
            "final_decision": decision,
            "similar_invoices": [
                {
                    "score": r.score,
                    "payload": r.payload
                }
                for r in similar_results
            ]
        }

    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)


@router.get("/invoices")
def fetch_invoices():
    return get_all_invoices()
