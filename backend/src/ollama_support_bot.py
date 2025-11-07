from __future__ import annotations
from dataclasses import dataclass, field
from typing import List, Dict, Iterable, Optional
import ollama
import time
from .utils.data_classes import PromptConfig, Doc


class OllamaSupportBot:
    """
    Class-based wrapper for a customer support RAG flow using Ollama.
    """

    def __init__(self, model: str = "llama3.2:3b"):
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
            print(f"\n[Attempt {attempt}] Classification prompt sent to Ollama:\n{prompt}\n")

            try:
                resp = ollama.generate(model=self.model, prompt=prompt)
                category = resp["response"].strip().lower()  # ensure normalized text
                print(f"[Attempt {attempt}] Classification response: {category}\n")

                if category != "unknown" and category != "":
                    return category  # valid classification
                else:
                    print(f"[Attempt {attempt}] Category was 'unknown' — retrying...\n")
                    time.sleep(wait_seconds)

            except Exception as e:
                print(f"[Attempt {attempt}] Error while classifying: {e}")
                time.sleep(wait_seconds)

        # After all retries, return fallback
        print("All 5 attempts failed to classify. Returning 'unknown'.")
        return None
    
    def answer(
        self,
        user_query: str,
        docs: List[Doc],
        *,
        options: Optional[Dict] = None,
    ) -> str:
        """
        Non-streaming answer. Returns the assistant message text.
        """
        messages = self._make_messages(user_query, docs)
        
        print("Messages sent to Ollama:", messages)  # Debug print
        
        kwargs: Dict = {}
        if options:
            kwargs["options"] = options

        resp = ollama.chat(model=self.model, messages=messages, **kwargs)
        
        print("Response received from Ollama:", resp)  # Debug print
        
        return resp["message"]["content"]

    # def answer_json(
    #     self,
    #     user_query: str,
    #     docs: List[Doc],
    #     *,
    #     options: Optional[Dict] = None,
    # ) -> str:
    #     """
    #     Non-streaming answer that requests strict JSON output.
    #     You should pair this with a JSON-only system instruction if you need hard guarantees.
    #     """
    #     messages = self._make_messages(user_query, docs)
    #     kwargs: Dict = {"format": "json"}
    #     if options:
    #         kwargs["options"] = options

    #     resp = ollama.chat(model=self.model, messages=messages, **kwargs)
    #     return resp["message"]["content"]

    # def stream_answer(
    #     self,
    #     user_query: str,
    #     docs: List[Doc],
    #     *,
    #     options: Optional[Dict] = None,
    # ) -> Iterable[str]:
    #     """
    #     Streaming answer. Yields text chunks.
    #     """
    #     messages = self._make_messages(user_query, docs)
    #     kwargs: Dict = {"stream": True}
    #     if options:
    #         kwargs["options"] = options

    #     for part in ollama.chat(model=self.model, messages=messages, **kwargs):
    #         chunk = part.get("message", {}).get("content", "")
    #         if chunk:
    #             yield chunk

    # -----------------------------
    # Internal helpers
    # -----------------------------
    def _make_messages(self, user_query: str, docs: List[Doc]) -> List[Dict[str, str]]:
        system = self.config.system_template.format(
            brand=self.config.brand, tone=self.config.tone, max_tokens=self.config.max_tokens_hint
        )
        
        context_block = self._build_context_block(docs)
        
        user_prompt = self.config.user_template.format(
            user_query=user_query, k=len(docs), context_block=context_block
        )
        return [
            {"role": "system", "content": system},
            {"role": "user", "content": user_prompt},
        ]

    @staticmethod
    def _build_context_block(docs: List[Doc]) -> str:
        
        lines: List[str] = []
        for i, d in enumerate(docs, start=1):
            print("Building context block from docs:", d)  # Debug print
            lines.append(
                f"[D{i}]\n"
                f"id: {d['id']}\n"
                "chunk: |\n"
                f"  {d['text']}\n"
            )
        return "\n".join(lines).strip()


# -----------------------------
# Example usage
# -----------------------------
# if __name__ == "__main__":
    
    # # Configure the bot
    # cfg = PromptConfig(
    #     brand="Acme Cloud",
    #     tone="friendly, professional",
    #     max_tokens_hint=180,
    # )
    
    # bot = OllamaSupportBot(config=cfg)

    # # Your reranked top-K docs
    # topk_docs: List[Doc] = [
    #     Doc(
    #         id="42",
    #         chunk_text="Refunds are available within 30 days for unused subscriptions. "
    #               "Prorated refunds apply after 7 days. Enterprise plans require account manager approval.",
    #     ),
    #     Doc(
    #         id="77",
    #         chunk_text="For severity-1 incidents, initial response within 1 hour. "
    #               "Escalate to on-call SRE after 60 minutes without mitigation.",
    #     ),
    # ]

    # user_q = "When The Eiffel Tower was completed?"

    # classify_category = bot.classify_category(user_q)
    # print(f"\n=== CLASSIFIED CATEGORY ===\n{classify_category}\n")
    
    # Non-streaming
    # answer = bot.answer(
    #     user_q,
    #     topk_docs,
    #     options={"temperature": 0.2, "num_ctx": 8192},
    # )
    # print("\n=== ANSWER ===\n")
    # print(answer)