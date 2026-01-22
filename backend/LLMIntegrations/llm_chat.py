class LlmChat:
    def __init__(self, model="gpt-4"):
        self.model = model

    async def chat(self, messages):
        return {"reply": "LLM response placeholder"}
