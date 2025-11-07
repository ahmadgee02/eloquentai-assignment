# eloquentai-assignment

I approached the challenge as a full-stack production deployment problem. My goal was to build a system that could realistically run in a secure, scalable, and cloud-ready environment. I began by mapping the functional flow:

User → Frontend (Next.js) → FastAPI Backend → MongoDB → Pincone → LLM (Ollama / Serverless)

#### Frontend Development (Next.js):
- I built a responsive Next.js interface to handle user authentication and chat interactions.
- Integrated JWT-based login so that authenticated requests could securely reach the backend.
- Used reduxSlice to store global aap context.

#### Backend Development (FastAPI):
- Designed REST endpoints for authentication, chat completion, and embedding retrieval.
- Implemented a clean service layer pattern, separating business logic from API routes.
- Used dependency injection for JWT user verification.

#### Database (MongoDB):
- Used MongoDB Atlas for persistence due to its flexibility and serverless scaling.
- Created collections for users and chat sessions.

#### LLM Integration:
- Initially used Ollama for local inference and fast prototyping.
- Designed the backend to easily switch to serverless LLMs such as Amazon Bedrock or OpenAI APIs by abstracting the inference layer behind a common interface.


## 1. Embedding Model Discrepancy and Vector Dimension Mismatch
##### Context:
During the assessment phase, the dataset provided included pre-generated embeddings with a reference to the llama-text-embed-v2 model. The documentation mentioned 1024-dimensional vectors, which are consistent with many LLaMA-based embedding models.

##### Issue Observed:
Upon inspecting the actual dataset, I discovered that the embeddings contained 1536 dimensions, not 1024.
This raised an immediate concern. It meant that the embeddings weren’t actually generated using llama-text-embed-v2 but a different model (OpenAI’s text-embedding-3-small). The index schema and retrieval functions expect fixed-dimensional vectors. 
##### Resolution:

Instead of relying on inconsistent embeddings. I discarded the pre-provided embeddings. Created a new embedding pipeline to re-index the dataset from scratch. used Category and Question fields to create input embeddings.

## 2. Category-Aware Retrieval Optimization

##### Context:
In most fintech production environments (e.g., customer support or fraud detection bots), large knowledge bases are split into topic-specific indices. such as payments, KYC, technical support, and compliance.
This modular design reduces retrieval time and increases answer precision.

##### Resolution:
I implemented a two-stage pipeline for Data Retrival.
1. Classification stage (Prompt-based LLM routing):
A lightweight LLM prompt first determines the problem category (e.g., “payments”, “card issues”, “security”, etc.).

2. Retrieval stage (Category-specific search):
This reduces the vector search space dramatically. 

```
User Query
   ↓
LLM Prompt → Predict Category
   ↓
Route to Relevant Index
   ↓
Retrieve Top-k Embeddings
   ↓
Rerank the Retrieve Top-k Embeddings Without Category
   ↓
LLM Context Construction → Generate Final Answer
```