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


3. **Run FastAPI server**
```bash
uv run uvicorn src.main:app --reload --reload-dir=./ --reload-include='*.py'
```

## ⚙️ Environment Variables (.env)
Rename the .env.sample file to .env and config env variables.

```ini
[Paths]
DATABASE_URL=""
SECRET_KEY=""
ACCESS_TOKEN_EXPIRE_MINUTES=300

PINECONE_API_KEY=""
PINECONE_INDEX_NAME=""
PINECONE_NAME_SPACE=""
OLLAMA_MODEL=""
```

## 🗂️ Project Structure

```bash
backend/
├── logs/
├── src/
│   ├── api/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── chat.py
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
│   │   └── socket_connection.py
│   ├── __init__.py
│   ├── config.py
│   ├── database.py
│   ├── logger.py
│   ├── main.py
│   ├── ollama_support_bot.py
│   ├── pincone_support.py
│   ├── setup.py
├── .env
├── .env.sample
├── .gitignore
└── requirements.txt
```/

