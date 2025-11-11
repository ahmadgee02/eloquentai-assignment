## 🚀 Getting Started
Make sure you have the following installed:

- Python 3.8 or higher
- `pip` (Python package installer)
- Git (for cloning the repository)

### Installation

1. **Clone the Repository**
```bash
https://github.com/ahmadgee02/eloquentai-assignment.git
cd eloquentai-assignment/backend
```

# 2. Create and Run a virtual environment
```bash
python -m venv .venv
```

### Activate it
On Windows:
```bash
.venv\Scripts\activate
```

On macOS/Linux:
```bash
source .venv/bin/activate
```


2. **Install the Runtime Dependencies**
```bash
pip install -r requirements.txt
```


3. **Running Ollama Models Locally**
##### 1. Install Ollama

### macOS / Linux
```bash
curl -fsSL https://ollama.com/install.sh | sh
```
Windows

Download and install Ollama from https://ollama.com/download
Open the Ollama app once to initialize the background service.

##### 2. Verify Installation
```bash
ollama --version
ollama list
```

##### 3. Pull a Model (default model used for this assignment)
```bash
ollama pull llama3.2:3b
```

4. **Run FastAPI server**
```bash
uv run uvicorn src.main:app --reload --reload-dir=./ --reload-include='*.py'
```

5. **Environment Variables (.env)**
Rename the .env.sample file to .env and config env variables.

```ini
[Paths]
DATABASE_URL=""
SECRET_KEY=""
ACCESS_TOKEN_EXPIRE_MINUTES=

PINECONE_API_KEY=""
PINECONE_INDEX_NAME=""
PINECONE_NAME_SPACE=""
OLLAMA_MODEL=""
```


6. **Project Structure**

```bash
backend/
├── logs/
├── src/
│   ├── api/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   └── chat.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── langchain_client.py
│   │   ├── ollama_client.py
│   │   └── pincone_client.py
│   ├── models
│   │   ├── __init__.py
│   │   ├── chat.py
│   │   └── user.py
│   ├── schemas
│   │   ├── chat.py
│   │   └── user.py
│   ├── utils
│   │   ├── __init__.py
│   │   ├── data_classes.py
│   │   ├── jwt_bearer.py
│   │   ├── jwt_handler.py
│   ├── __init__.py
│   ├── config.py
│   ├── database.py
│   ├── logger.py
│   ├── main.py
│   ├── setup.py
├── .env
├── .env.sample
├── .gitignore
└── requirements.txt
```/

