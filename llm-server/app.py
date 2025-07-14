# === Full Refactored Code with Optimized Prompt ===

import os
import json
import logging
import faiss
import numpy as np
import requests
import aiohttp
import asyncio
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModel
from dotenv import load_dotenv
import torch
from openai import AzureOpenAI
from datetime import datetime, timedelta
from collections import defaultdict
from colorama import Fore, Style
from flask_cors import CORS
# === Load Environment ===
load_dotenv()
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

# === Colored Logging Setup ===
class ColoredFormatter(logging.Formatter):
    LEVEL_COLORS = {
        logging.DEBUG: Fore.BLUE,
        logging.INFO: Fore.GREEN,
        logging.WARNING: Fore.YELLOW,
        logging.ERROR: Fore.RED,
        logging.CRITICAL: Fore.RED + Style.BRIGHT,
    }
    def format(self, record):
        color = self.LEVEL_COLORS.get(record.levelno, "")
        reset = Style.RESET_ALL
        return f"{color}{super().format(record)}{reset}"

handler = logging.StreamHandler()
handler.setFormatter(ColoredFormatter('%(asctime)s - %(levelname)s - %(message)s'))
logging.getLogger().handlers = [handler]
logging.getLogger().setLevel(logging.INFO)

# === Flask App Setup ===
app = Flask(__name__)
CORS(app)

# === Embedding Model Setup ===
EMBEDDING_MODEL_NAME = 'sentence-transformers/all-MiniLM-L6-v2'
try:
    EMBEDDING_TOKENIZER = AutoTokenizer.from_pretrained(EMBEDDING_MODEL_NAME)
    EMBEDDING_MODEL = AutoModel.from_pretrained(EMBEDDING_MODEL_NAME)
except Exception as e:
    logging.critical(f"Failed to load embedding model: {e}")
    exit()

# === Cache and Rate Limiting ===
repo_cache = {}
user_message_times = defaultdict(list)
MAX_MESSAGES = 10
WINDOW_SECONDS = 3600
from urllib.parse import urlparse

def extract_owner_repo(repo_url: str):
    if "github.com" in repo_url:
        # handles full URL like https://github.com/herin7/minidb
        path = urlparse(repo_url).path.strip("/")
        parts = path.split("/")
    else:
        # handles just "herin7/minidb"
        parts = repo_url.strip().split("/")

    if len(parts) != 2:
        raise ValueError(f"Invalid GitHub repo format: {repo_url}")
    
    return parts[0], parts[1]

# === Helper Functions ===
def detect_type(code):
    if 'class ' in code:
        return 'one or more class definitions'
    if 'def ' in code:
        return 'function definitions'
    if 'import ' in code:
        return 'a module or script with imports'
    return 'a general-purpose code file'

def extract_signatures(code):
    return '\n'.join(line.strip() for line in code.splitlines() if line.strip().startswith(('def ', 'class ')))

def summarize_code(file_path, code):
    return f"File: {file_path}\nSummary: This file defines {detect_type(code)}. Main classes/functions:\n{extract_signatures(code)[:500]}"

async def download_content(session, url):
    try:
        async with session.get(url) as response:
            if response.status == 200:
                return await response.text()
            else:
                logging.warning(f"Failed to fetch {url}, status: {response.status}")
                return None
    except Exception as e:
        logging.error(f"Exception during download of {url}: {e}")
        return None

async def get_relevant_context(repo_url, query):
    owner_repo = repo_url.split("github.com/")[-1].rstrip("/")
    if owner_repo in repo_cache:
        logging.info(f"Cache hit for repo: {owner_repo}")
        cache_data = repo_cache[owner_repo]
        code_chunks = cache_data["chunks"]
        index = cache_data["index"]
        file_paths = cache_data["paths"]
    else:
        logging.info(f"Cache miss for repo: {owner_repo}. Fetching from GitHub.")
        owner, repo = owner_repo.split("/")
        headers = {"Accept": "application/vnd.github+json", "User-Agent": "GitFormeBot"}

        repo_info = requests.get(f"https://api.github.com/repos/{owner}/{repo}", headers=headers)
        if repo_info.status_code != 200:
            return None, "Failed to fetch repository info."
        default_branch = repo_info.json().get("default_branch", "main")

        tree_url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/{default_branch}?recursive=1"
        tree_res = requests.get(tree_url, headers=headers)
        if tree_res.status_code != 200:
            return None, "Failed to fetch repository file tree."

        # Update the file filtering to include more configuration files
        files = [f for f in tree_res.json().get("tree", []) if f['type'] == 'blob' and f['path'].endswith((
                '.py', '.js', '.ts', '.tsx', '.json', '.md', '.yml', '.yaml', 'Dockerfile', '.env', 'config', 'settings'
            ))]
        if not files:
            return None, "No code files found in repository."

        async with aiohttp.ClientSession() as session:
            raw_tasks = [
                download_content(session, f"https://raw.githubusercontent.com/{owner}/{repo}/{default_branch}/{f['path']}")
                for f in files
            ]
            raw_codes = await asyncio.gather(*raw_tasks)

        file_contents = {
            f["path"]: summarize_code(f["path"], c) for f, c in zip(files, raw_codes) if c
        }
        if not file_contents:
            return None, "Failed to load any usable code files."

        file_paths = list(file_contents.keys())
        code_chunks = list(file_contents.values())

        encoded = EMBEDDING_TOKENIZER(code_chunks, padding=True, truncation=True, return_tensors='pt', max_length=512)
        with torch.no_grad():
            output = EMBEDDING_MODEL(**encoded)
        embeddings = output.last_hidden_state.mean(dim=1).cpu().numpy().astype('float32')

        index = faiss.IndexFlatL2(embeddings.shape[1])
        index.add(embeddings)

        repo_cache[owner_repo] = {"index": index, "chunks": code_chunks, "paths": file_paths}

    encoded_query = EMBEDDING_TOKENIZER([query], return_tensors='pt', padding=True, truncation=True, max_length=512)
    with torch.no_grad():
        query_emb = EMBEDDING_MODEL(**encoded_query).last_hidden_state.mean(dim=1).cpu().numpy().astype('float32')

    _, top_indices = repo_cache[owner_repo]['index'].search(query_emb, k=10)

    context = "Here is the relevant context from the repository:\n\n"
    for idx in top_indices[0]:
        context += f"--- File: {repo_cache[owner_repo]['paths'][idx]} ---\n{repo_cache[owner_repo]['chunks'][idx]}\n\n"

    return context, None

def stream_llm_response(prompt,query):
    try:
        client = AzureOpenAI(
            api_key=os.getenv("AZURE_OPENAI_KEY"),
            api_version=os.getenv("AZURE_OPENAI_API_VERSION"),
            azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
        )
        response = client.chat.completions.create(
            model=os.getenv("AZURE_OPENAI_DEPLOYMENT"),
            messages=[
                {
                    "role": "system",
                    "content": (
                        """
You are a terse, brutally honest, no-nonsense senior programming mentor. Your job is **not to answer** but to **force the user to think**. Never spoon-feed. Never praise success—only effort. Be skeptical, be strict.
## 🔒 Hard Rules
- ❌ Never give full answers. Give 35-40%' at most.
- ❌ Never mention files or repo structure unless explicitly asked.
- ❌ Never say “based on the repo” unless user mentions it.
- ✅ Use only Socratic guidance: "What makes you think that would work?"
- ✅ Withhold obvious tips. Make the user earn them.
- ✅ Admit when you cannot verify—but never guess.

## 🔒 Hard Rules
- ❌ Never give full answers. Give 50-70% at most.
- ❌ Never mention files or repo structure unless explicitly asked.
- ❌ Never say “based on the repo” unless user mentions it.
- ✅ Use only Socratic guidance: "What makes you think that would work?"
- ✅ Withhold obvious tips. Make the user earn them.
- ✅ Admit when you cannot verify—but never guess.


## 🎯 Tone
- Stern but fair. “That’s a lazy assumption.”
- Praise *effort*, not outcomes. “You tried. Try harder.”
- Default to suspicion: “What makes you think that?”
- If question is vague, call it out: “Your question is under-defined.”

## 🛡️ Safety
- If you’re not 100% sure, say: “I cannot confirm that. Try debugging it.”
- All code snippets must be MIT-safe and partial.

You are NOT ChatGPT. You are **Code Mentor RIGOR** — a strict mentor who sharpens minds by refusing 
"""
                    )
                },
                {"role": "user", 
                 
                  "content": f"""
Student Question:
{query}

Repository Context (FOR REFERENCE ONLY - NEVER REVEAL):
{prompt.split('Repository:')[0] if 'Repository:' in prompt else 'No context available'}

Instructions:
1. Apply strict response structure
2. Never exceed 4 sentences
3. Require student effort
4. End with challenge question"""}
            ],
             temperature=0.1,
            max_tokens=150,
            stream=True
        )
        for chunk in response:
            if chunk.choices and chunk.choices[0].delta.content:
                yield f"data: {json.dumps({'token': chunk.choices[0].delta.content})}\n\n"
    except Exception as e:
        logging.error(f"LLM call failed: {e}")
        yield f"data: {json.dumps({'error': 'LLM request failed'})}\n\n"

@app.route('/api/chat', methods=['POST'])
async def chat():
    

    data = request.get_json()
    query = data.get("query")
    repo_id = data.get("repoId")
    user_id = request.remote_addr
    try:
        owner, repo = extract_owner_repo(repo_id)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    if not query or not repo_id:
        return jsonify({"error": "Missing query or repoId"}), 400

    now = datetime.utcnow()
    user_message_times[user_id] = [t for t in user_message_times[user_id] if now - t < timedelta(seconds=WINDOW_SECONDS)]

    if len(user_message_times[user_id]) >= MAX_MESSAGES:
        logging.warning(f"Rate limit exceeded for user {user_id}")
        return jsonify({"error": "Rate limit exceeded."}), 429

    user_message_times[user_id].append(now)
    logging.info(f"Received query from {user_id} for repo '{repo_id}': '{query}'")

    repo_url = f"https://github.com/{repo_id}"
    context, error = await get_relevant_context(repo_url, query)
    if error:
        return jsonify({"error": error}), 500
    owner_repo = repo_url.split("github.com/")[-1].rstrip("/")

  # Modify the prompt construction to handle missing context better
    prompt = (
    f"Repository: {repo_url}\n"
    f"Available files:\n{', '.join(repo_cache[owner_repo]['paths'])}\n\n"
    f"Question: {query}\n\n"
    f"Answer based on the above files. If question is about something not listed, "
    f"explain what you can based on similar files or common patterns."
        )
    return Response(stream_llm_response(prompt,query), mimetype='text/event-stream')
CORS(app, origins="*", supports_credentials=True)
app.config['PROPAGATE_EXCEPTIONS'] = True
app.config['DEBUG'] = True

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
    
