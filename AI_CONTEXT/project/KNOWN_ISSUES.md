# KNOWN_ISSUES.md — Verified Issues, Technical Edge Cases & Active Mitigations

This document details verified technical edge cases, environmental constraints, and active code mitigations in AgentLens.

---

### Issue 1: Upstream Gemini API High Demand Spikes (503 / 429 Errors)
* **Status**: Mitigated & Active in Codebase
* **Observed Behavior**: During global Google AI Studio traffic peaks, direct API requests to `gemini-3.8-flash` may return `503 UNAVAILABLE` or `429 RESOURCE_EXHAUSTED`.
* **Relevant Code Area**: `backend/routes/gemini.routes.ts`, `backend/routes/agent.routes.ts`, `backend/services/toolDispatcher.service.ts`
* **Active Mitigation**: Implemented an automated multi-model fallback chain:
  `gemini-3.8-flash` ──► `gemini-3.1-flash-lite` ──► `performDeepWebResearch`
  The backend transparently tries the secondary model without throwing raw unhandled exceptions to the client UI.

---

### Issue 2: Cross-Origin Video Streaming Block in Sandboxed Preview IFrames
* **Status**: Mitigated & Active in Codebase
* **Observed Behavior**: Browsers render `"No video with supported format and MIME type found"` when HTML5 `<video>` tags attempt to stream sample MP4 files directly from external Google Cloud Storage buckets inside sandboxed preview iframes (`AIS Dev Preview`).
* **Relevant Code Area**: `src/components/chat/AgentChat.tsx`, `backend/routes/gemini.routes.ts` (`/api/video/stream`)
* **Active Mitigation**: Route video preview requests through Express binary stream proxy `/api/video/stream?url=<encoded_url>`. The proxy fetches the video stream server-side and responds with `Accept-Ranges: bytes` and `Content-Type: video/mp4` directly from the same origin.

---

### Issue 3: Long Polling Firestore Real-Time Synchronization in IFrame Environments
* **Status**: Mitigated & Active in Codebase
* **Observed Behavior**: WebSockets used by standard Firestore client listeners may be closed or throttled in sandboxed iframe environments.
* **Relevant Code Area**: `src/lib/firebase.ts`
* **Active Mitigation**: Configured `initializeFirestore` with `experimentalForceLongPolling: true` and `ignoreUndefinedProperties: true` to guarantee reliable real-time document synchronization over HTTPS long polling.
