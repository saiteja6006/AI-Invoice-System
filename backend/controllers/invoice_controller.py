from fastapi import APIRouter, UploadFile, File
from services.embedding_service import generate_embedding
from services.vector_db_service import store_embedding_data, search_similar_data
from agents.extraction_agent import extraction_agent

import asyncio
import os
import tempfile
import traceback

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
    try:
        print("Received file:", file.filename)

        if file.content_type != "application/pdf" or not file.filename.endswith(".pdf"):
            return {"error": "Only PDF files are allowed"}

        contents = await file.read()

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
            temp_file.write(contents)
            temp_file_path = temp_file.name

        try:
            print("Extracting text")
            text = extract_text(temp_file_path)
            print("Extracted text length:", len(text))

            extracted_data = await extraction_agent(text)
             
            print("Running agents")
            results = await asyncio.gather(
                invoice_agent(extracted_data),
                po_agent(extracted_data),
                fraud_agent(extracted_data),
                return_exceptions=True  
            )


            processed_results = []
            for r in results:
                if isinstance(r, Exception):
                    print("Agent error:", str(r))
                    processed_results.append({
                        "agent": "unknown",
                        "status": "fail",
                        "reason": str(r)
                    })
                else:
                    processed_results.append(r)

            results = processed_results

            decision = {
                "decision": "HOLD" if any(r["status"] == "fail" for r in results) else "APPROVE",
                "issues": [r for r in results if r["status"] == "fail"]
            }

            try:
                embedding = generate_embedding(text)
                similar_results = search_similar_data(embedding)
                similar_results = deduplicate_similar_results(similar_results)
            except Exception as e:
                print("Similarity failed:", str(e))
                similar_results = []

            invoice_data = {
                "text": text,
                "agent_results": results,
                "final_decision": decision
            }

            save_invoice(invoice_data)

            return {
                "text_preview": text[:200] if text else "",
                "agent_results": results,
                "final_decision": decision,
                "similar_invoices": [
                    {
                        "score": getattr(r, "score", 0),
                        "payload": getattr(r, "payload", {})
                    }
                    for r in similar_results
                ]
            }

        finally:
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)

    except Exception as e:
        print("ERROR OCCURRED:")
        traceback.print_exc()

        return {
            "text_preview": "",
            "agent_results": [],
            "final_decision": {
                "decision": "HOLD",
                "issues": [{"reason": str(e)}]
            },
            "similar_invoices": []
        }       


@router.get("/invoices")
def fetch_invoices():
    return get_all_invoices()


