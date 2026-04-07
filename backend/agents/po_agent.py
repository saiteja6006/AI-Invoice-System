from services.llm_service import ask_llm_async
import json

import re

async def po_agent(data):

    match = re.search(r"PO\d+", data)

    if match:
        return {
            "agent": "po",
            "status": "pass",
            "reason": ""
        }

    return {
        "agent": "po",
        "status": "fail",
        "reason": "Purchase Order not found"
    }