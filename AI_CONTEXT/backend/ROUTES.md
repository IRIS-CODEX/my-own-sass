# ROUTES.md — Backend Route Modules Specification

## 🛣️ Express Routes (`backend/routes/`)

### 1. `agent.routes.ts`
- `POST /api/agents/synthesize`: Prompt-to-Agent JSON synthesis.
- `GET /api/agents`: Retrieve active fleet agents list.
- `POST /api/agent/chat`: Process multi-tool chat execution, run Gemini reasoning loop, store chat message in DB.

### 2. `gemini.routes.ts`
- `POST /api/gemini/grounded-chat`: Google Search or Maps grounded queries.
- `POST /api/gemini/generate-image`: Image synthesis via Imagen/Gemini.
- `POST /api/gemini/generate-video`: Veo 3 commercial video script synthesis.
- `GET /api/video/stream`: Binary MP4 proxy stream returning `Accept-Ranges: bytes` & `Content-Type: video/mp4`.

### 3. `gateway.routes.ts`
- `POST /api/gateway/execute`: Proxy Virtual Key execution, verify key active state, enforce daily USD spend limit.

### 4. `users.routes.ts`
- `POST /api/users/profile`: Sync Firebase user profile to DB.

### 5. `health.routes.ts`
- `GET /api/health`: Server uptime & status check.
