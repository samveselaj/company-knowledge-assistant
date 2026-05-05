# Company Knowledge Assistant

AI-powered internal knowledge assistant with document upload, indexing, role-based access, grounded RAG answers, feedback, and citations.

Admins manage the knowledge base. Authenticated users ask questions against indexed company documents.

## Stack

- Frontend: Next.js, React, TypeScript, deployed on Vercel
- Backend: FastAPI and SQLAlchemy, deployed on Railway
- Database: PostgreSQL with pgvector, hosted on Railway
- AI: OpenAI embeddings, plus selectable chat providers for answers
- Local infrastructure: Docker Compose

## AI Providers and API Keys

OpenAI is used for document embeddings and retrieval. Chat answers can use OpenAI, Grok/xAI, or Claude/Anthropic.

Users can enter provider API keys in the browser from the AI provider modal in the topbar. Those keys are stored in that browser's `localStorage` and are sent to the API as request headers only when a request needs them:

- `x-openai-api-key` for OpenAI embeddings during indexing and retrieval
- `x-ai-provider`, `x-ai-api-key`, and `x-ai-chat-model` for chat answer generation

The app does not save user-provided provider keys to the database. For shared/server-side defaults, you can also configure provider keys as backend environment variables.

### Dynamic model list

The AI provider modal shows a curated list of known models immediately, then upgrades to the live list returned by each provider's `/v1/models` endpoint. The frontend calls `GET /providers/{provider}/models` on the backend, which proxies the provider using the same headers above (or the server fallback key) and caches results for one hour, keyed per provider/key pair. A "↻ Refresh" button in the modal busts the cache. If the call fails (no key, rate limit, etc.) the curated fallback stays in place — the UI never blocks on the network call.

## Required Environment Variables

Copy `.env.example` to `.env` for local development.

```bash
DATABASE_URL=postgresql://postgres:postgres@db:5432/rag_app
JWT_SECRET=replace_with_a_long_random_secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## AI Environment Variables

These are optional if users provide keys in the browser. Set them on the backend when you want server-side fallback keys.

```bash
OPENAI_API_KEY=your_openai_key
EMBEDDING_MODEL=text-embedding-3-small

CHAT_PROVIDER=openai
CHAT_MODEL=gpt-5.5

XAI_API_KEY=your_xai_key
GROK_API_KEY=your_xai_key
GROK_CHAT_MODEL=grok-4.3
XAI_BASE_URL=https://api.x.ai/v1

ANTHROPIC_API_KEY=your_anthropic_key
CLAUDE_API_KEY=your_anthropic_key
CLAUDE_CHAT_MODEL=claude-sonnet-4-6
```

These default model ids match the curated fallback list shown in the AI provider modal. They are placeholders — the modal also discovers models dynamically per-key, so users can pick whatever a provider currently exposes (see "Dynamic model list" above).

`OPENAI_API_KEY` is still needed somewhere, either in the backend environment or from the browser, because document indexing and retrieval use OpenAI embeddings.

Optional local/demo settings:

```bash
APP_ENV=development
SEED_DEMO_USERS=true
UPLOAD_DIR=uploads
```

For production, set a strong `JWT_SECRET`, set `APP_ENV=production`, and disable demo users unless you intentionally need them.

## Demo Credentials

When `APP_ENV=development` and `SEED_DEMO_USERS=true`, the API creates:

- Admin: `admin@example.com` / `admin123`
- User: `user@example.com` / `user123`

These are demo-only credentials. Do not use them in production.

## Local Setup

1. Configure environment:
   ```bash
   cp .env.example .env
   ```

2. Start the app:
   ```bash
   docker compose up --build
   ```

3. Open:
   - Frontend: http://localhost:3000
   - API: http://localhost:8000
   - API docs: http://localhost:8000/docs

Docker Compose exposes Postgres on host port `5433` and container port `5432`.

## Test Flow

1. Login as admin.
2. Open the AI provider modal from the topbar and add an OpenAI key if the backend does not already have one.
3. Upload PDFs, TXT files, or DOCX files.
4. Open Documents and index the uploaded documents.
5. Confirm status moves from `pending` to `processing` to `indexed` or `failed`.
6. Choose the chat provider/model you want to use.
7. Logout and login as user.
8. Ask questions in Chat.
9. Inspect citations under assistant answers.
10. Confirm normal users cannot upload, delete, index, or re-index documents.

Sample seed documents are in `docs/seed/`.

## RAG Flow

1. Admin uploads a document.
2. API saves the file and creates a document record.
3. Admin indexes or re-indexes the document.
4. API parses, chunks, embeds, and stores vectors in pgvector.
5. Authenticated user asks a question.
6. API embeds the question, retrieves relevant chunks, builds the prompt, and generates an answer with the selected chat provider.
7. API returns the answer with citations derived from retrieved chunks.

If the answer is not clearly present in retrieved context, the assistant should say:

```text
I could not find that in the uploaded documents.
```

## Role Permissions

Admin:

- Upload documents
- View documents
- Index or re-index documents
- Delete documents
- Use chat

User:

- View documents
- Use chat
- View citations

## Deployment Structure

- Vercel hosts the Next.js frontend.
- Railway hosts the FastAPI backend.
- Railway Postgres stores users, documents, chunks, vectors, chat metadata, and feedback.

Set `NEXT_PUBLIC_API_URL` in Vercel to the Railway API URL. Set backend environment variables in Railway.

If you rely on browser-entered AI keys, users must configure their provider settings per browser. If you want the app to work without per-user keys, configure backend fallback keys in Railway.

## API Endpoints

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/auth/register` | public | Register a user |
| POST | `/auth/login` | public | Login and receive JWT |
| GET | `/auth/me` | authenticated | Current user |
| GET | `/health` | public | Health check |
| GET | `/health/config` | public | Non-secret AI provider configuration status |
| GET | `/documents` | authenticated | List documents |
| GET | `/documents/{id}` | authenticated | Get one document |
| POST | `/documents/upload` | admin | Upload a document |
| POST | `/documents/{id}/index` | admin | Index a document |
| POST | `/documents/{id}/reindex` | admin | Re-index a document |
| DELETE | `/documents/{id}` | admin | Delete a document |
| POST | `/chat/ask` | authenticated | Ask a grounded RAG question |
| POST | `/feedback` | authenticated | Submit feedback |
| GET | `/admin/stats` | admin | Dashboard stats |
| GET | `/providers/{provider}/models` | public (uses request-scoped key) | List chat models from a provider's `/v1/models` (cached 1h, `?refresh=true` to bust) |
