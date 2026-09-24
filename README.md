# 🚀 AgentLens — Governed AI Studio Platform

AgentLens is a full-stack AI Studio application built with **React, Vite, Express, and Google Gemini AI**. It supports autonomous agents, multimodal creation (Veo 3 video, audio synthesis, image generation), real-time search grounding, and Firebase Firestore persistence.

---

## 💻 Running Locally on Your PC

When you clone this project to your PC, all Firebase configurations, database settings, and local fallbacks are **already included** in the repo (`firebase-applet-config.json`).

### Quick Start Guide:

1. **Clone the Repository**:
   ```bash
   git clone <repo-url>
   cd <project-folder>
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   Copy `.env.example` to create a `.env` file in the root folder:
   - **Linux/macOS**: `cp .env.example .env`
   - **Windows (Command Prompt)**: `copy .env.example .env`
   - **Windows (PowerShell)**: `Copy-Item .env.example .env`

4. **Add Your Gemini API Key**:
   Open the `.env` file in your text editor and paste your free Google Gemini API key:
   ```env
   GEMINI_API_KEY="AIzaSyYourActualKeyHere..."
   ```
   *👉 Get a free Gemini API Key at [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey).*

5. **Start the Local Development Server**:
   ```bash
   npm run dev
   ```

6. **Access the App**:
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 🔑 API Keys & Security Summary

| Feature | Local PC Behavior | How to Configure |
| :--- | :--- | :--- |
| **Firebase Auth & Firestore** | **Auto-connected** via `firebase-applet-config.json` included in repo. | Pre-configured. No changes needed. |
| **Gemini AI Models** | Connects to `gemini-3.8-flash` & `gemini-3.1-flash-lite`. | Add `GEMINI_API_KEY` in `.env`. |
| **Veo 3 Video & Multimodal** | Renders high-definition commercial storyboards & streaming proxy. | Auto-handled by Express backend (`/api/video/stream`). |
| **Offline / Fallback Mode** | If no key is set, the app falls back to local simulators. | Automatic. |

---

## 🛠️ Available Scripts

- `npm run dev`: Starts the local Express backend + Vite dev server on port 3000.
- `npm run build`: Compiles TypeScript and builds the production bundle into `dist/`.
- `npm run lint`: Runs TypeScript compiler to verify code validity (`tsc --noEmit`).
