import os
import aiohttp
from dataclasses import dataclass
from typing import Optional

@dataclass
class UserMessage:
    text: str

class LlmChat:
    def __init__(self, api_key: str, session_id: Optional[str] = None, system_message: Optional[str] = None):
        self.api_key = api_key
        self.session_id = session_id
        self.system_message = system_message
        self.provider = None
        self.model = None

    def with_model(self, provider: str, model: str):
        self.provider = provider.lower()
        self.model = model
        return self

    async def send_message(self, message) -> str:
        if isinstance(message, UserMessage):
            text = message.text
        elif isinstance(message, str):
            text = message
        else:
            raise ValueError("Message must be a string or UserMessage")

        if not self.provider or not self.model:
            raise ValueError("Model not configured. Call with_model().")

        if self.provider == "gemini":
            return await self._send_gemini(text)

        raise NotImplementedError(f"Provider '{self.provider}' not supported")

    async def _send_gemini(self, prompt: str) -> str:
        """
        Correct Gemini v1beta payload format
        """
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateMessage?key={self.api_key}"

        messages = []

        if self.system_message:
            messages.append({
                "author": "system",
                "content": [
                    {"type": "text", "text": self.system_message}
                ]
            })

        messages.append({
            "author": "user",
            "content": [
                {"type": "text", "text": prompt}
            ]
        })

        payload = {
            "prompt": {"messages": messages},
            "temperature": 0.0
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, timeout=60) as resp:
                if resp.status != 200:
                    text = await resp.text()
                    raise RuntimeError(f"Gemini API error: {text}")
                data = await resp.json()

        try:
            return data["candidates"][0]["content"][0]["text"]
        except (KeyError, IndexError):
            raise RuntimeError("Invalid Gemini response format")
