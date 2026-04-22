# Company Knowledge Assistant

AI-powered internal knowledge assistant with RAG (Retrieval-Augmented Generation).

Upload internal documents, index them into vector search, ask questions in chat, and get grounded answers with citations.

## Stack

- **Backend**: Python, FastAPI, SQLAlchemy 2.0
- **Frontend**: Next.js 15, TypeScript
- **Database**: PostgreSQL + pgvector
- **AI**: OpenAI (embeddings + chat)
- **Infrastructure**: Docker Compose

## Quick Start

1. **Clone and configure:**
   ```bash
   cp .env.example .env
   # Edit .env with your OPENAI_API_KEY
   ```

2. **Start all services:**
   ```bash
   docker compose up --build
   ```

3. **Access the app:**
   - Frontend: http://localhost:3000
   - API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## Architecture

```
Frontend (Next.js :3000) → API (FastAPI :8000) → PostgreSQL + pgvector (:5432)
```

### RAG Flow
1. Upload document → Save to disk + DB
2. Index document → Parse → Chunk → Embed → Store vectors
3. Ask question → Embed query → Vector search → Build prompt → Generate answer → Return with citations

## Seed Documents

Sample documents are in `docs/seed/`. Upload them through the UI or API to test.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |
| POST | /documents/upload | Upload a document |
| GET | /documents | List documents |
| POST | /documents/{id}/index | Index a document |
| DELETE | /documents/{id} | Delete a document |
| POST | /chat/ask | Ask a question (RAG) |
| POST | /feedback | Submit feedback |
| GET | /admin/stats | Dashboard stats |
