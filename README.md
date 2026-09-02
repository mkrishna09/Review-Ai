# ReviewAI

An intelligent, AI-powered codebase analysis and automated code review platform. ReviewAI connects to GitHub repositories, analyzes code architecture, security, performance, maintainability, and documentation using Google Gemini, and delivers actionable, prioritized insights in an interactive developer dashboard.

---

## Architecture

ReviewAI is built as a TypeScript monorepo powered by [Turborepo](https://turbo.build/):

```
review-ai/
├── apps/
│   ├── api/          # Express 5 backend with Prisma ORM, BullMQ workers, and Gemini AI
│   └── web/          # Next.js 16 frontend with Tailwind CSS v4, React Query, and Lucide icons
└── packages/
    ├── eslint-config # Shared ESLint configurations
    └── typescript-config # Shared TypeScript base configurations
```

### Key Technologies

- **Backend**: Express 5, TypeScript, Prisma ORM, PostgreSQL, Redis, BullMQ
- **AI Engine**: Google Gemini API (`@google/genai`) with token budget management & prompt engineering
- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, TanStack Query, Radix UI
- **Security**: OAuth 2.0 (GitHub), JWT authentication with Redis-backed revocation, AES-256-GCM token encryption at rest, CSRF protection, and rate limiting

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 10.0.0
- **PostgreSQL** instance (e.g. local Postgres or [Neon](https://neon.tech))
- **Redis** instance (e.g. local `redis-server` or Redis Cloud)
- **GitHub OAuth App** (Client ID & Client Secret)
- **Google Gemini API Key** (from [Google AI Studio](https://aistudio.google.com/))

### 1. Installation

Clone the repository and install all dependencies:

```bash
git clone https://github.com/mkrishna09/Review-Ai.git
cd review-ai
npm install
```

### 2. Environment Setup

Copy example environment files to their respective applications:

```bash
# API environment configuration
cp apps/api/.env.example apps/api/.env

# Web environment configuration
cp apps/web/.env.example apps/web/.env.local
```

Configure `apps/api/.env` with your credentials:

- `DATABASE_URL`: PostgreSQL connection URI
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`: From your GitHub Developer Settings
- `JWT_SECRET`: Random 32+ character string
- `ENCRYPTION_KEY`: Random 32+ character string used for encrypting GitHub tokens at rest
- `GEMINI_API_KEY`: Google Gemini API key (or set `USE_MOCK_AI=true` for local development without API calls)
- `REDIS_HOST` & `REDIS_PORT`: Redis host (default `127.0.0.1`) and port (default `6379`)

### 3. Database Migration & Setup

Run database migrations using Prisma:

```bash
npx prisma migrate dev --schema=apps/api/prisma/schema.prisma
```

### 4. Running Locally

Start both the backend API and frontend web application concurrently:

```bash
npm run dev
```

- **API**: [http://localhost:4000](http://localhost:4000) (Health check: [http://localhost:4000/api/v1/health](http://localhost:4000/api/v1/health))
- **Web**: [http://localhost:3000](http://localhost:3000)

---

## Available Scripts

- `npm run dev`: Start all apps in watch mode with Turbo
- `npm run build`: Compile and build all apps and packages
- `npm run check-types`: Static typecheck across all apps
- `npm run lint`: Run ESLint across the monorepo
- `npm run format`: Format source files with Prettier
- `npm run test --prefix apps/api`: Run backend test suites

---

## Security Best Practices

1. **Secrets Management**: Never commit `.env` or dump files to version control. Use `.env.example` as a template.
2. **Token Encryption**: All third-party access tokens (e.g. GitHub OAuth tokens) are encrypted with AES-256-GCM before writing to the database.
3. **Session Revocation**: JWT logout actively blacklists tokens in Redis for their remaining lifetime.
4. **Resilient Workers**: BullMQ worker processes utilize exponential backoff and retain failed jobs for inspection.
