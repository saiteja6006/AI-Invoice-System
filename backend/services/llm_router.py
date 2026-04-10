import os
from openai import OpenAI

client =  OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def route_llm(task: str, prompt: str):
    """
    task: extraction | validation | fraud
    """

    try:
        if task == "fraud":
            print("Using GPT-4o")
            model = "gpt-4o"
        else:
            print("Using GPT-4o-mini")
            model = "gpt-4o-mini"

        response = client.chat.completions.create(
            model = model,
            messages=[
                {"role": "system", "content": "You are an AI assistant for invoice processing."},
                {"role": "user", "content": prompt}
            
            ],
            temperature=0.2
        
        )   

        return response.choices[0].message.content
    except Exception as e:
        print("LLM Error:", str(e))
        return None


        