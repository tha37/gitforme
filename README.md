<div align="center">
  <img src="https://raw.githubusercontent.com/herin7/gitforme/main/gitforme/logo.png" alt="GitForMe Logo" width="150"/>
  <h1>GitForMe</h1>
  <p><strong>Supercharge your open-source journey. Understand any codebase in minutes.</strong></p>
  
  <p>
    <a href="https://github.com/herin7/gitforme/actions/workflows/main_gfm-backend.yml"><img src="https://github.com/herin7/gitforme/actions/workflows/main_gfm-backend.yml/badge.svg" alt="Backend CI"></a>
    <a href="https://github.com/herin7/gitforme/actions/workflows/azure-static-web-apps-thankful-dune-02c682800.yml"><img src="https://github.com/herin7/gitforme/actions/workflows/azure-static-web-apps-thankful-dune-02c682800.yml/badge.svg" alt="Frontend CI"></a>
    <a href="https://github.com/herin7/gitforme/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT"></a>
    <a href="https://github.com/herin7/gitforme/releases"><img src="https://img.shields.io/github/v/release/herin7/gitforme" alt="GitHub release"></a>
    <a href="https://github.com/herin7/gitforme/issues"><img src="https://img.shields.io/github/issues/herin7/gitforme" alt="Issues"></a>
  </p>
</div>

---

## 🚀 What is GitForMe?

GitForMe is an intelligent code exploration platform designed to help open-source developers and contributors rapidly understand and engage with any GitHub repository. By leveraging Large Language Models (LLMs), it creates a "superfast context" of a codebase, offering insights, answering questions, and providing a clear path to making your first contribution.

Simply paste a repository URL, and GitForMe generates a comprehensive, interactive dashboard that demystifies the architecture, identifies key areas, and helps you navigate the code with an AI-powered assistant, **GitBro**.

## ✨ Key Features

Based on the core components `gitformeUi.jsx` and `app.py`, GitForMe offers:

* **🤖 AI-Powered Chatbot (GitBro)**: Ask questions about the codebase in natural language. GitBro uses context from the repository files to give you accurate, grounded answers.
* **🌐 Interactive Repository Dashboard**: A centralized view that includes:
    * **Code Hotspots**: Visualize the most frequently changed files.
    * **Dependency Health**: Analyze project dependencies for risks and outdated packages.
    * **File & Directory Explorer**: Navigate the repository structure with ease.
    * **Issue Tracking**: View and understand open issues to find contribution opportunities.
* **🧠 LLM Context Builder**: Select specific files or issues to build a focused context for the LLM, allowing for deeper, more specific analysis.
* **Seamless GitHub Integration**: Log in with your GitHub account to get a personalized experience.
* **Dynamic UI**: A fluid and responsive interface built with React and Framer Motion for a modern user experience.

## 🏛️ Architecture Overview

GitForMe operates on a modern, distributed architecture:

* **Frontend**: A responsive web application built with **React** and **Vite**, using TailwindCSS for styling. It's responsible for the user interface and all client-side interactions.
* **Backend Server**: A **Node.js** and **Express** server that handles user authentication, interacts with the GitHub API to fetch repository data, and manages application logic.
* **LLM Server**: A **Python** and **Flask** server that powers the AI capabilities. It uses `sentence-transformers` to generate embeddings, `FAISS` for efficient similarity search, and streams responses from an Azure-hosted OpenAI model.


## 🛠️ Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

* Node.js and npm
* Python 3.8+ and pip
* Git
* An Azure OpenAI API Key (or other LLM provider)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/herin7/gitforme.git](https://github.com/herin7/gitforme.git)
    cd gitforme
    ```

2.  **Setup the Backend Server:**
    ```sh
    cd server
    npm install
    # Create a .env file and add your GitHub credentials
    npm start
    ```

3.  **Setup the LLM Server:**
    ```sh
    cd ../llm-server
    pip install -r requirements.txt
    # Create a .env file and add your AZURE_OPENAI_KEY and other credentials
    flask run
    ```

4.  **Setup the Frontend:**
    ```sh
    cd ../gitforme
    npm install
    # Create a .env file with VITE_API_URL pointing to your backend server
    npm run dev
    ```

## 💖 How to Contribute

We welcome contributions from the open-source community! If you're looking to help, here’s how you can get started:

1.  **Fork the Project.**
2.  **Create your Feature Branch** (`git checkout -b feature/AmazingFeature`).
3.  **Commit your Changes** (`git commit -m 'Add some AmazingFeature'`).
4.  **Push to the Branch** (`git push origin feature/AmazingFeature`).
5.  **Open a Pull Request.**

### Good First Issues

Looking for a place to start? Check out these areas:
* **Improve UI/UX**: Enhance the styling of components or improve the mobile responsiveness.
* **Add More File Parsers**: Extend the `summarize_code` function in `app.py` to support more languages.
* **Enhance Error Handling**: Improve error messages and user feedback across the application.
* **Write Unit/Integration Tests**: We always need more tests!

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📧 Contact

Herin - [@herin7](https://github.com/herin7)

Project Link: [https://github.com/herin7/gitforme](https://github.com/herin7/gitforme)

---
