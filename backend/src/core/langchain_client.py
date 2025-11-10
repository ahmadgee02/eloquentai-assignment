from __future__ import annotations
from typing import List, Dict, Optional
from ..models.chat import MessageModel
import time
from ..utils.data_classes import PromptConfig, Doc
from ..logger import logging

from langchain_ollama import ChatOllama
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

logger = logging.getLogger(__name__)

class LangchainClient:
    """
    Class-based wrapper for a customer support RAG flow using LangChain + Ollama.
    """

    def __init__(self, 
            model: str,
            *,
            options: Optional[Dict] = None
        ):
        try:
            if options:
                # Many Ollama runtime args (temperature, num_ctx, top_p, etc.) are accepted directly
                self.llm = ChatOllama(model=model, **options)
            else:
                self.llm = ChatOllama(model=model)
        except Exception as e:
            logger.warning(f"Failed to apply options to ChatOllama ({e}). Falling back to defaults.")
            self.llm = ChatOllama(model=model)
            
        self.config = PromptConfig()

    # -----------------------------
    # Public API
    # -----------------------------
    def classify_category(self, user_query: str) -> Optional[str]:
        """
        Classify the user query into a predefined category.
        If the model returns 'unknown', retry up to 5 times before giving up.
        Return value unchanged: Optional[str] (None on failure).
        """
        max_retries = 5
        wait_seconds = 1

        prompt = self.config.classifier_template.format(query=user_query)

        for attempt in range(1, max_retries + 1):
            try:
                
                # Single-turn prompt; expect plain text category in the response
                resp = self.llm.invoke(prompt)
                category = (resp.content or "").strip().lower()

                if category not in ("unknown", ""):
                    logger.info("Classified Category: %s", category)
                    return category
                else:
                    time.sleep(wait_seconds)
            except Exception as e:
                logger.error(f"[Attempt {attempt}] Error while classifying: {e}")
                time.sleep(wait_seconds)

        logger.info("All 5 attempts failed to classify. Returning 'unknown'.")
        return None

    def answer(
        self,
        user_query: str,
        docs: List[Doc],
        prev_messages=List[MessageModel],
    ) -> str:
        """
        Non-streaming answer. Returns the assistant message text unchanged: str.
        Mirrors previous behavior but routes through LangChain's ChatOllama.
        """
        messages_dicts = self._make_messages(user_query, docs, prev_messages)
        logger.info("Messages sent to LangChain/Ollama: %s", messages_dicts)


        lc_messages = self._to_langchain_messages(messages_dicts)
        resp = self.llm.invoke(lc_messages)

        # Match previous return type exactly (string content)
        return getattr(resp, "content", "") or ""

    # -----------------------------
    # Internal helpers
    # -----------------------------
    def _make_messages(self, user_query: str, docs: List[Doc], prev_messages: List[MessageModel] = []) -> List[Dict[str, str]]:
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
            lines.append(
                f"id: {d['id']}\n"
                "chunk: |\n"
                f"  {d['text']}\n"
            )
        return "\n".join(lines).strip()

    @staticmethod
    def _to_langchain_messages(messages: List[Dict[str, str]]):
        """
        Map your legacy role/content dicts to LangChain message objects.
        """
        lc_msgs = []
        for m in messages:
            role = m.get("role", "").lower()
            content = m.get("content", "")

            if role == "system":
                lc_msgs.append(SystemMessage(content=content))
            elif role == "user":
                lc_msgs.append(HumanMessage(content=content))
            elif role == "assistant":
                lc_msgs.append(AIMessage(content=content))
            else:
                # Default to HumanMessage for any unrecognized role to avoid failure
                lc_msgs.append(HumanMessage(content=content))
        return lc_msgs