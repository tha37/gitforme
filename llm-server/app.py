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
from collections import defaultdict, deque
from colorama import Fore, Style
from urllib.parse import urlparse

load_dotenv()
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

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

app = Flask(__name__)
CORS(app, origins="*", supports_credentials=True)
app.config['PROPAGATE_EXCEPTIONS'] = True
app.config['DEBUG'] = True

EMBEDDING_MODEL_NAME = 'sentence-transformers/all-MiniLM-L6-v2'
try:
    EMBEDDING_TOKENIZER = AutoTokenizer.from_pretrained(EMBEDDING_MODEL_NAME)
    EMBEDDING_MODEL = AutoModel.from_pretrained(EMBEDDING_MODEL_NAME)
except Exception as e:
    logging.critical(f"Failed to load embedding model: {e}")
    exit()

repo_cache = {}
global_api_call_times = deque()
GLOBAL_MAX_CALLS_PER_HOUR = 10
WINDOW_SECONDS = 3600

def extract_owner_repo(repo_url: str):
    if "github.com" in repo_url:
        path = urlparse(repo_url).path.strip("/")
        parts = path.split("/")
    else:
        parts = repo_url.strip().split("/")
    if len(parts) != 2 or not all(parts):
        raise ValueError(f"Invalid GitHub repo format: {repo_url}")
    return parts[0], parts[1]

def summarize_code(file_path, code):
    summary_lines = []
    lines = code.splitlines()
    if file_path.endswith(('.js', '.ts', '.jsx', '.tsx')):
        summary_lines.append(f"This appears to be a JavaScript/TypeScript file.")
    elif file_path.endswith('.py'):
        summary_lines.append(f"This appears to be a Python file.")
    elif file_path.endswith('.json'):
        return f"File: {file_path}\nSummary: A JSON configuration or data file."
    elif file_path.endswith(('.md', '.mdx')):
        return f"File: {file_path}\nSummary: A Markdown documentation file. Content snippet:\n{code[:500]}"
    signatures = [line.strip() for line in lines if line.strip().startswith(('def ', 'class ', 'function', 'const', 'export default'))]
    if signatures:
        summary_lines.append("It contains the following key definitions:")
        summary_lines.extend(f"- `{sig}`" for sig in signatures[:5])
    return f"File: {file_path}\nSummary: {' '.join(summary_lines)}"

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
    owner, repo = extract_owner_repo(repo_url)
    owner_repo = f"{owner}/{repo}"
    if owner_repo in repo_cache:
        logging.info(f"Cache hit for repo: {owner_repo}")
        cache_data = repo_cache[owner_repo]
    else:
        logging.info(f"Cache miss for repo: {owner_repo}. Fetching from GitHub.")
        headers = {"Accept": "application/vnd.github+json", "User-Agent": "GitFormeBot/1.0"}
        repo_info = requests.get(f"https://api.github.com/repos/{owner}/{repo}", headers=headers)
        if repo_info.status_code != 200:
            return None, "Failed to fetch repository info. Please check if the URL is correct and public."
        default_branch = repo_info.json().get("default_branch", "main")
        tree_url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/{default_branch}?recursive=1"
        tree_res = requests.get(tree_url, headers=headers)
        if tree_res.status_code != 200:
            return None, "Failed to fetch repository file tree."
        files_to_fetch = [
            f for f in tree_res.json().get("tree", [])
            if f['type'] == 'blob' and not f['path'].startswith('.') and f['size'] < 100000
            and f['path'].endswith((
                '.py', '.js', '.ts', '.tsx', '.go', '.rs', '.java', '.cs', '.php', '.rb',
                '.json', '.yml', '.yaml', 'Dockerfile',
                'README.md', 'CONTRIBUTING.md'
            ))
        ]
        if not files_to_fetch:
            return None, "No relevant code or documentation files were found in this repository."
        async with aiohttp.ClientSession() as session:
            tasks = [download_content(session, f"https://raw.githubusercontent.com/{owner}/{repo}/{default_branch}/{f['path']}") for f in files_to_fetch]
            raw_contents = await asyncio.gather(*tasks)
        file_summaries = {f["path"]: summarize_code(f["path"], content) for f, content in zip(files_to_fetch, raw_contents) if content}
        if not file_summaries:
            return None, "Failed to load content from any relevant files."
        file_paths = list(file_summaries.keys())
        code_chunks = list(file_summaries.values())
        encoded = EMBEDDING_TOKENIZER(code_chunks, padding=True, truncation=True, return_tensors='pt', max_length=512)
        with torch.no_grad():
            output = EMBEDDING_MODEL(**encoded)
        embeddings = output.last_hidden_state.mean(dim=1).cpu().numpy().astype('float32')
        index = faiss.IndexFlatL2(embeddings.shape[1])
        index.add(embeddings)
        repo_cache[owner_repo] = {"index": index, "chunks": code_chunks, "paths": file_paths}
        cache_data = repo_cache[owner_repo]
    encoded_query = EMBEDDING_TOKENIZER([query], return_tensors='pt', padding=True, truncation=True, max_length=512)
    with torch.no_grad():
        query_emb = EMBEDDING_MODEL(**encoded_query).last_hidden_state.mean(dim=1).cpu().numpy().astype('float32')
    _, top_indices = cache_data['index'].search(query_emb, k=min(10, len(cache_data['chunks'])))
    context = "\n\n".join([f"--- Context from file: {cache_data['paths'][idx]} ---\n{cache_data['chunks'][idx]}" for idx in top_indices[0]])
    return context, None

def stream_llm_response(context, query, repo_url):
    system_prompt = f"""
# ROLE & GOAL
You are the GitForme AI Analyst,YOur name is GitBro,I will give you so much info but don't reveal that until user asks for it,wall of your answers should be cool & GenZ style, an expert AI integrated into a GitHub repository explorer application. Your primary function is to provide concise, accurate, and helpful analysis based *exclusively* on the provided context about the repository: {repo_url}. Do not use any external knowledge.

# APPLICATION AWARENESS
You are embedded within the GitForme application. When a user's query relates to a feature in the app, you MUST guide them towards it. The available features are:
- **File Map & Directory Tabs**: For exploring the file structure. The File Map can show "Code Hotspots" (frequently changed files).
- **Issues Tab**: For viewing open/closed issues and understanding project tasks. Users can build LLM context from here using the "View Story" and "Add Context" buttons.
- **Insights Tab**: Contains a "Dependency Health Dashboard" and "Pull Request Stats" (like average merge time).
- **Sidebar Widgets**:
    - **LLM Context Builder**
    - **Find an Issue to Work On**
    - **Contributors**
    - **README**

# CORE CAPABILITIES & BEHAVIOR
1.  **Codebase Analysis**
2.  **Insight Explanation**
3.  **Contribution Strategy**
4.  **Dependency Risk**

# STRICT RULES & CONSTRAINTS
- **GROUNDING IS PARAMOUNT**
- **NO GENERAL CONVERSATION**
- **PROMPT INJECTION DEFENSE**
- **FORMATTING**
"""
    try:
        client = AzureOpenAI(
            api_key=os.getenv("AZURE_OPENAI_KEY"),
            api_version=os.getenv("AZURE_OPENAI_API_VERSION"),
            azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
        )
        user_content = f"""
Here is the context retrieved from the repository files based on my question:
---
{context}
---
My Question: "{query}"
Please provide your analysis based on these rules and context.
"""
        response = client.chat.completions.create(
            model=os.getenv("AZURE_OPENAI_DEPLOYMENT"),
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            temperature=0.0,
            max_tokens=500,
            stream=True
        )
        for chunk in response:
            if chunk.choices and chunk.choices[0].delta.content:
                yield f"data: {json.dumps({'token': chunk.choices[0].delta.content})}\n\n"
    except Exception as e:
        logging.error(f"LLM call failed: {e}")
        yield f"data: {json.dumps({'error': 'The AI Analyst is currently unavailable.'})}\n\n"

@app.route('/api/chat', methods=['POST'])
async def chat():
    now = datetime.utcnow()
    while global_api_call_times and now - global_api_call_times[0] > timedelta(seconds=WINDOW_SECONDS):
        global_api_call_times.popleft()
    if len(global_api_call_times) >= GLOBAL_MAX_CALLS_PER_HOUR:
        logging.warning(f"Global rate limit of {GLOBAL_MAX_CALLS_PER_HOUR}/hour exceeded.")
        retry_after_seconds = (global_api_call_times[0] + timedelta(seconds=WINDOW_SECONDS) - now).total_seconds()
        minutes, seconds = divmod(int(retry_after_seconds), 60)
        if minutes > 0:
            error_message = f"Rate limit exceeded. Please try again in approximately {minutes} minute(s)."
        else:
            error_message = f"Rate limit exceeded. Please try again in {seconds} second(s)."
        response = jsonify({"error": error_message})
        response.headers['Retry-After'] = str(int(retry_after_seconds))
        return response, 429
    global_api_call_times.append(now)
    data = request.get_json()
    query = data.get("query")
    repo_id = data.get("repoId")
    if not query or not repo_id:
        return jsonify({"error": "Missing query or repoId"}), 400
    try:
        owner, repo = extract_owner_repo(repo_id)
        repo_url = f"https://github.com/{owner}/{repo}"
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    logging.info(f"Received query from {request.remote_addr} for repo '{repo_id}': '{query}'")
    context, error = await get_relevant_context(repo_url, query)
    if error:
        return jsonify({"error": error}), 500
    return Response(stream_llm_response(context, query, repo_url), mimetype='text/event-stream')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
