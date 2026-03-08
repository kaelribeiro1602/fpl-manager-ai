# FPL Manager AI - Project Rules

This is an AI-powered Fantasy Premier League management application.

## Project Structure

- `backend/` - Python FastAPI application
- `frontend/` - React/Next.js application
- `docs/` - Architecture and design documents
- `scripts/` - Utility scripts

## Tech Stack

- **Backend:** Python with FastAPI, managed via `uv`
- **Frontend:** Next.js, React, Tailwind CSS, ShadCN UI
- **Database:** (Add your DB here)
- **Hosting:** Vercel (frontend), (backend hosting)

## Code Standards

Follow global standards in `~/.config/opencode/AGENTS.md`. Additional project-specific rules:

1. **FPL API Integration:** Handle rate limiting gracefully. Cache responses where possible.
2. **Player Data:** Store FPL player IDs and metadata in database, not hardcoded.
3. **API Routes:** Use `/api/v1/` prefix for all backend endpoints.
4. **Frontend:** Use React Query for server state management.

## Testing

- Backend: pytest with fixtures for FPL API responses
- Frontend: Playwright for E2E tests
- Run tests before submitting PR: `make test` or `pytest`

## Environment Variables

Required:
- `FPL_API_KEY` - Fantasy Premier League API token
- `OPENROUTER_API_KEY` - For AI features
- Database connection string

See `.env.example` for all required variables.
