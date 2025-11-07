from typing import List, Literal
from pinecone import Pinecone
from dataclasses import dataclass
from .logger import logging
from .utils.data_classes import Doc

logger = logging.getLogger(__name__)

class PineconeEmbedder:
    """
    Class-based Minimal wrapper around Pinecone Inference.
    """

    def __init__(
        self,
        api_key: str,
        index_name: str,
        namespace: str,
        model: str = "llama-text-embed-v2",
    ) -> None:
        """
        Initialize the Pinecone client.

        Args:
            api_key: Pinecone API key.
            index_name: Name of your Pinecone index.
            namespace: Namespace for this dataset.
            model: Embedding model to use for queries.
        """        
        self.pc = Pinecone(api_key=api_key)
        self.model = model
        self.index = self.pc.Index(index_name)
        self.namespace = namespace

    def embed_query(self, query: str) -> List[float]:
        """
        Embed a single query string and return the embedding vector.
        Pinecone expects input_type="query" for queries.

        Returns:
            A list of floats representing the query embedding.
        """
        embed_out = self.embed_texts(
            texts=[query],
            input_type="query"
        )
        
        return embed_out[0]


    def embed_texts(
        self,
        texts: List[str],
        input_type: Literal["query", "document"] = "document",
    ) -> List[List[float]]:
        """
        Embed multiple texts in one call. Use input_type="document" for corpus chunks.

        Returns:
            A list of embedding vectors, one per input text.
        """
        embed_out = self.pc.inference.embed(
            model=self.model,
            inputs=texts,
            parameters={"input_type": input_type},
        )
        return [d.values for d in embed_out.data]

    # -----------------------------
    # Query Pinecone
    # -----------------------------
    def query_documents(
        self,
        query_vector: List[float],
        # category: Optional[str] = None,
        top_k: int = 5,
    ) -> List[Doc]:
        """
        Run similarity search on the Pinecone index and return a list of matched documents.

        Args:
            query_vector: Embedding vector from embed_query().
            category: Optional category filter.
            top_k: Number of top documents to retrieve.

        Returns:
            List of Docs: [{"id": ..., "chunk_text": ...}, ...]
        """
        # filter_clause = {"category": {"$eq": category}} if category else None

        results = self.index.query(
            namespace=self.namespace,
            vector=query_vector,
            top_k=top_k,
            include_metadata=True,
            include_values=False,
            # filter=filter_clause,
        )
        
        documents = [
            {
                "id": hit["id"],
                "question": hit["metadata"].get("question", ""),
                "answer": hit["metadata"].get("answer", "")
            }
            for hit in results.get("matches", [])
        ]
        
        
        return documents

    def rerank_results(self, 
            query_vector: str, 
            documents: list, 
            top_n: int = 1,
            model: str="bge-reranker-v2-m3"
        ):
        """
        Rerank Pinecone search results using the built-in reranker model.
        Args:
            query: user query text
            pinecone_results: list of Pinecone matches (with metadata)
            top_n: number of reranked results to return
        """

        # Call Pinecone inference reranker
        reranked = self.pc.inference.rerank(
            model=model,
            query=query_vector,
            documents=documents,
            top_n=top_n,
            rank_fields=["question"],
            return_documents=True,
            parameters={"truncate": "END"}
        )

        logger.info("Reranked results: %s", reranked)
        
        documents = [
            {
                "id": hit["document"].get("id", ""),
                "text": hit["document"].get("answer", "")
            }
            for hit in reranked.get("data", [])
        ]

        return documents