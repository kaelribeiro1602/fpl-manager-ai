# 🌿 Software Engineering Standards

**Status:** Active
**Owner:** Kael (Lead) & Yohahn (Creator)
**Tags:** #engineering #standards #best-practices #workflow

## 🎯 Purpose
This document is the "Source of Truth" for how we build, test, and deploy software. It ensures consistency across projects (like FPL Manager AI) and provides clear guidelines for sub-agents (Artie, Quin, etc.).

## 🏗️ Core Principles
1.  **Keep it DRY & Composable:** Code should be reusable, well-designed, and of medium complexity. Avoid copy-pasting; build composable utilities.
2.  **Pragmatic SOLID:** Use SOLID as a guideline, not a religion. Prioritize interfaces, strict typing, and composability. If a pattern adds confusion, drop it.
3.  **Simplicity First:** Simple code > Complex architecture. Avoid over-engineering.
4.  **High Cohesion, Low Coupling:** Architectural elements should stand alone but work well together.
5.  **Clear Naming:** Variables and methods must tell you exactly what they do. No cryptic abbreviations.
6.  **Functional Testing:** Focus on "Happy Path" and medium-level integration tests that verify core requirements. We test *behavior*, not implementation details.

## 📂 Repository Structure (Standard Monorepo)
Every project repository should follow this structure:

```text
/
├── .github/workflows/    # CI/CD pipelines (Test/Lint on PR)
├── docs/                 # Architecture, Decisions, Notes
├── backend/              # Python (Default), Rust/Go (Performance)
│   ├── pyproject.toml    # Dependency management (via uv)
│   └── src/              # Source code
├── frontend/             # Next.js 14+, React, Tailwind, ShadCN
│   ├── package.json
│   └── src/              # Components, Pages, Lib
└── README.md
```

## 🛠️ Tech Stack & Tools
- **Backend:** Python (Primary) managed via `uv`. Rust/Go for high-performance bottlenecks.
- **Frontend:** Next.js, Tailwind CSS, ShadCN UI, React.
- **Linting:** Mandatory for both `/backend` (e.g., ruff) and `/frontend` (e.g., eslint, prettier).
- **CI/CD:** GitHub Actions.
    - **Trigger:** Pull Requests to `main`.
    - **Jobs:** Lint, Build, Test (Functional).
    - **Rule:** No direct pushes to `main`. All code via PR.

## 🔄 Development Workflow
1.  **Branching:** Enforced for all changes. No direct pushes to `main`. Use prefixes: `feat/`, `fix/`, `refactor/` (e.g., `feat/api-client`).
2.  **Pull Requests:** Mandatory for all merges to `main`. All code must be reviewed and pass CI (where applicable) before merging.
3.  **Dependency Management:**
    - Python: Use `uv` (fast, modern).
    - Node: Use `npm` or `pnpm`.

## 🧪 Testing Strategy
- **Scope:** Verify functional requirements.
- **Type:** Integration/E2E "Happy Path" tests.
- **Avoid:** Brittle unit tests for internal implementation details or mocking everything.
