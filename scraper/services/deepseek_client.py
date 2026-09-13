import json

import requests
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

API_URL = "https://api.deepseek.com/v1/chat/completions"


class RetryableError(Exception):
    """Fallo pasajero: saturación, error del servidor o respuesta vacía."""


class DeepSeekClient:
    def __init__(self, api_key: str, model: str, session: requests.Session | None = None):
        self.api_key = api_key
        self.model = model
        self.session = session or requests.Session()

    @retry(
        retry=retry_if_exception_type((RetryableError, requests.Timeout, requests.ConnectionError)),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=2, min=4, max=30),
        reraise=True,
    )
    def complete_json(self, messages: list[dict], max_tokens: int = 4000) -> dict:
        """Pide una respuesta en modo JSON y la devuelve ya parseada."""
        response = self.session.post(
            API_URL,
            headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"},
            json={
                "model": self.model,
                "messages": messages,
                "temperature": 0.1,
                "max_tokens": max_tokens,
                "response_format": {"type": "json_object"},
            },
            timeout=120,
        )
        if response.status_code == 429 or response.status_code >= 500:
            raise RetryableError(f"DeepSeek respondió {response.status_code}")
        response.raise_for_status()

        content = response.json()["choices"][0]["message"]["content"]
        # La documentación de DeepSeek avisa de que el modo JSON a veces devuelve vacío.
        if not content or not content.strip():
            raise RetryableError("DeepSeek devolvió una respuesta vacía")
        return json.loads(content)
