from __future__ import annotations
from typing import List, Dict, Optional
from ..models.chat import MessageModel
import ollama
import time
from ..utils.data_classes import PromptConfig, Doc
from ..logger import logging

logger = logging.getLogger(__name__)

class OllamaClient:
    """
    Class-based wrapper for a customer support RAG flow using Ollama.
    """

    def __init__(self, model: str):
        self.model = model
        self.config = PromptConfig()

    # -----------------------------
    # Public API
    # -----------------------------
    def classify_category(self, user_query: str) -> str:
        """
        Classify the user query into a predefined category.
        If the model returns 'unknown', retry up to 5 times before giving up.
        """
        max_retries = 5
        wait_seconds = 1 

        for attempt in range(1, max_retries + 1):
            prompt = self.config.classifier_template.format(query=user_query)

            try:
                resp = ollama.generate(model=self.model, prompt=prompt)
                category = resp["response"].strip().lower()  # ensure normalized text

                if category != "unknown" and category != "":
                    return category  # valid classification
                else:
                    time.sleep(wait_seconds)

            except Exception as e:
                logger.error(f"[Attempt {attempt}] Error while classifying: {e}")
                time.sleep(wait_seconds)

        # After all retries, return fallback
        logger.info("All 5 attempts failed to classify. Returning 'unknown'.")
        return None
    
    def answer(
        self,
        user_query: str,
        docs: List[Doc],
        prev_messages=List[MessageModel],
        *,
        options: Optional[Dict] = None,
    ) -> str:
        """
        Non-streaming answer. Returns the system message text.
        """
        messages = self._make_messages(user_query, docs, prev_messages)
        
        logger.info("Messages sent to Ollama: %s", messages)  # Debug print
        
        kwargs: Dict = {}
        if options:
            kwargs["options"] = options

        resp = ollama.chat(model=self.model, messages=messages, **kwargs)

        return resp["message"]["content"]

    # -----------------------------
    # Internal helpers
    # -----------------------------
    def _make_messages(self, user_query: str, docs: List[Doc], prev_messages: List[MessageModel]=[]) -> List[Dict[str, str]]:
        system = self.config.system_template.format(
            brand=self.config.brand, tone=self.config.tone, max_tokens=self.config.max_tokens_hint
        )
        
        context_block = self._build_context_block(docs)
        
        user_prompt = self.config.user_template.format(
            user_query=user_query, k=len(docs), context_block=context_block
        )
        
        messages = [{"role": "system", "content": system}]
        
        # Add previous conversation messages
        for msg in prev_messages:
            messages.append({"role": msg["role"], "content": msg["text"]})
            
        # Add current user query
        messages.append({"role": "user", "content": user_prompt})
        
        return messages

    @staticmethod
    def _build_context_block(docs: List[Doc]) -> str:
        
        lines: List[str] = []
        for _, d in enumerate(docs, start=1):
            # logger.info("Building context block from docs: %s", d)  # Debug print
            
            lines.append(
                f"id: {d['id']}\n"
                "chunk: |\n"
                f"  {d['text']}\n"
            )
        return "\n".join(lines).strip()