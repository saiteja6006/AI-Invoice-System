from services.llm_router import route_llm
import json

async def extraction_agent(text):
    prompt = f"""
    Extract strucutred invoice data from below text.

    Text:
    {text}
    Return STRICT JSON:
    {{
        "invoice_number": "",
        "po_number": "",
        "vendor": "",
        "amount": "",
        "date": ""
    }}
    """

    result = route_llm("extraction", prompt)

    try:
        return json.load(result)
    except:
        return{}