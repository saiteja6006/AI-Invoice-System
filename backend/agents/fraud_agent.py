import re
from services.llm_service import ask_llm_async
from utils.response_parser import parse_llm_response

async def fraud_agent(data):

    
    amount_match = re.search(r"Amount:\s*(\d+)", data)

    if amount_match:
        amount = int(amount_match.group(1))

        if amount > 100000:
            return {
                "agent": "fraud",
                "status": "fail",
                "reason": "Amount exceeds threshold"
            }

    
    prompt = f"""
    Check if invoice looks suspicious.

    STRICT RULES:
    - Respond ONLY in JSON
    - No explanation
    - Format:
    {{ "status": "pass or fail", "reason": "..." }}

    Invoice:
    {data}
    """

    response = await ask_llm_async(prompt)
    result = parse_llm_response(response)

    return {
        "agent": "fraud",
        **result
    }