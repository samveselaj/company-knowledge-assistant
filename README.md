# Company Knowledge Assistant

AI-powered internal knowledge assistant with RAG, role-based access, document indexing, grounded answers, and citations.

Admins manage the knowledge base. Users ask questions against indexed company documents.

## Stack

- Frontend: Next.js, TypeScript, deployed on Vercel
- Backend: FastAPI, SQLAlchemy, deployed on Railway
- Database: PostgreSQL with pgvector, hosted on Railway
- AI: OpenAI embeddings with selectable chat provider support
- Local infrastructure: Docker Compose

## Required Environment Variables

Copy `.env.example` to `.env` for local development.

```bash
DATABASE_URL=postgresql://postgres:postgres@db:5432/rag_app
OPENAI_API_KEY=your_key_here
CHAT_MODEL=gpt-4o-mini
EMBEDDING_MODEL=text-embedding-3-small
JWT_SECRET=replace_with_a_long_random_secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
NEXT_PUBLIC_API_URL=http://localhost:8000
```

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

## Test Flow

1. Login as admin.
2. Upload PDFs or TXT/DOCX files.
3. Open Documents and index the uploaded documents.
4. Confirm status moves from `pending` to `processing` to `indexed` or `failed`.
5. Logout and login as user.
6. Ask questions in Chat.
7. Inspect citations under assistant answers.
8. Confirm normal users cannot upload, delete, index, or re-index documents.

Sample seed documents are in `docs/seed/`.

## RAG Flow

1. Admin uploads a document.
2. API saves the file and creates a document record.
3. Admin indexes or re-indexes the document.
4. API parses, chunks, embeds, and stores vectors in pgvector.
5. Authenticated user asks a question.
6. API embeds the question, retrieves relevant chunks, builds the prompt, and generates an answer.
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
- Railway Postgres stores documents, chat metadata, users, feedback, and pgvector embeddings.

Set `NEXT_PUBLIC_API_URL` in Vercel to the Railway API URL. Set backend environment variables in Railway.

## API Endpoints

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/auth/register` | public | Register a user |
| POST | `/auth/login` | public | Login and receive JWT |
| GET | `/auth/me` | authenticated | Current user |
| GET | `/health` | public | Health check |
| GET | `/documents` | authenticated | List documents |
| GET | `/documents/{id}` | authenticated | Get one document |
| POST | `/documents/upload` | admin | Upload a document |
| POST | `/documents/{id}/index` | admin | Index a document |
| POST | `/documents/{id}/reindex` | admin | Re-index a document |
| DELETE | `/documents/{id}` | admin | Delete a document |
| POST | `/chat/ask` | authenticated | Ask a grounded RAG question |
| POST | `/feedback` | authenticated | Submit feedback |
| GET | `/admin/stats` | admin | Dashboard stats |
