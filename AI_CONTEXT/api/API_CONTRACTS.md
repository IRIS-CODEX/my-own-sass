# API_CONTRACTS.md — Key REST API Endpoints & Specifications

All API routes are mounted under `/api` in `backend/routes/index.ts`.

---

## 📋 Stable Endpoint Summary

### 1. Agent Management & Generation (`backend/routes/agent.routes.ts`)

#### `POST /api/agents/synthesize`
Generates a complete governed AI Agent definition from a natural language prompt.
* **Input Request**:
  ```json
  {
    "prompt": "Create a creative fashion video ad director agent",
    "enabledCapabilities": ["video_generation", "google_search"],
    "modelPreference": "gemini-3.8-flash"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "name": "Creative-Fashion-Director",
    "description": "Autonomous video director for fashion brands",
    "archetype": "CREATIVE",
    "dailyBudgetUsd": 25.0,
    "systemPrompt": "...",
    "model": "gemini-3.8-flash",
    "capabilities": ["video_generation", "google_search"],
    "tools": ["create_video_veo", "search_knowledge_base"],
    "suggestedPrompts": ["Generate a 15s commercial for my cloth shop"],
    "welcomeMessage": "Hello! Ready to direct your fashion ad campaign."
  }
  ```

#### `POST /api/agent/chat`
Executes an interactive multi-tool chat turn with an autonomous agent.
* **Input Request**:
  ```json
  {
    "agentId": "agent-exec-pilot-1",
    "query": "generate a 15s ad video for my boutique shop",
    "tools": ["generate_video"],
    "temperature": 0.3
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "replyText": "### 🎬 Video Advertisement Rendered...",
    "thoughts": ["[Model Router] Dispatching prompt to Gemini model", "..."],
    "mediaUrl": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "mediaType": "video",
    "toolCallInfo": {
      "toolName": "generate_video",
      "params": { "prompt": "...", "model": "veo-3.1-fast-preview", "resolution": "720p" },
      "result": "Veo 3 video commercial rendered successfully."
    }
  }
  ```

---

### 2. Grounded Search & Maps (`backend/routes/gemini.routes.ts`)

#### `POST /api/gemini/grounded-chat`
* **Input Request**:
  ```json
  {
    "query": "Best coffee shops in Paris",
    "groundingType": "MAPS"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "content": "Here are top-rated cafes in Paris...",
    "groundingType": "MAPS",
    "places": [{ "title": "Café de Flore", "address": "...", "rating": 4.5 }]
  }
  ```

---

### 3. Binary Media Stream Proxy (`backend/routes/gemini.routes.ts`)

#### `GET /api/video/stream?url=<encoded_video_url>`
Proxies remote video streams with `Accept-Ranges: bytes` and `Content-Type: video/mp4` to bypass iframe sandbox restrictions.
* **Headers Returned**:
  - `Content-Type: video/mp4`
  - `Access-Control-Allow-Origin: *`
  - `Accept-Ranges: bytes`
  - `Cache-Control: public, max-age=86400`

---

### 4. Health & Status (`backend/routes/health.routes.ts`)

#### `GET /api/health`
* **Success Response (200 OK)**:
  ```json
  {
    "status": "HEALTHY",
    "timestamp": "2026-09-24T04:00:00Z",
    "uptimeSeconds": 1420
  }
  ```
