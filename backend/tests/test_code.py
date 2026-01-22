# test_code.py
from backend.server import app
from LLMIntegrations.llm.chat import LlmChat, UserMessage

import pytest
from fastapi.testclient import TestClient

client = TestClient(app)

def test_analyze_endpoint():
    response = client.post("/api/reviews/analyze", json={
        "code": "print('hello')",
        "language": "python"
    })
    assert response.status_code == 200
