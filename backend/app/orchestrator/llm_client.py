from __future__ import annotations

import json
from typing import Any

from openai import APIError, AuthenticationError, OpenAI
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import get_settings


class LlmClient:
    def __init__(self) -> None:
        self.settings = get_settings()
        self._client = None
        if self.settings.openai_api_key:
            kwargs: dict[str, Any] = {"api_key": self.settings.openai_api_key}
            if self.settings.openai_base_url:
                kwargs["base_url"] = self.settings.openai_base_url
            self._client = OpenAI(**kwargs)

    @retry(wait=wait_exponential(multiplier=1, min=1, max=8), stop=stop_after_attempt(3), reraise=True)
    def generate_text(self, system: str, user: str) -> str:
        if not self._client:
            return self._fallback_text(system, user)

        try:
            response = self._client.responses.create(
                model=self.settings.model_name,
                input=[
                    {"role": "system", "content": [{"type": "input_text", "text": system}]},
                    {"role": "user", "content": [{"type": "input_text", "text": user}]},
                ],
                temperature=0.5,
                max_output_tokens=600,
            )
            return (response.output_text or "").strip()
        except (AuthenticationError, APIError):
            return self._fallback_text(system, user)

    def generate_json(self, system: str, user: str, fallback: dict[str, Any]) -> dict[str, Any]:
        text = self.generate_text(system, user)
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            return fallback

    def _fallback_text(self, system: str, user: str) -> str:
        del system
        return (
            "No model API key configured. Placeholder strategic response: "
            f"{user[:280]}"
        )
