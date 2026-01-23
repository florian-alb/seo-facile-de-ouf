# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

B2B SaaS platform for e-commerce SEO content generation. Helps merchants (Shopify, WooCommerce) auto-generate SEO-optimized product descriptions using AI (GPT-5, Claude).

## Commands

### Quick Start
```bash
./setup.sh              # Initialize env files and install deps
docker-compose up --build   # Run all services
```

### Development (Local)
```bash
# From root - run all services
pnpm run dev

# Individual services
pnpm run frontend         # Next.js (port 3000)
pnpm run api-gateway      # Express gateway (port 4000)
pnpm run users-api        # Users service (port 5001)
pnpm run generations-api  # Generations service (port 5002)
pnpm run shop-api         # Shop service (port 5003)
```

### Frontend
```bash
cd frontend
pnpm run dev      # Dev server
pnpm run build    # Production build
pnpm run lint     # ESLint
```

### Backend (same pattern for all services)
```bash
cd backend/<service>
pnpm run dev      # Dev with tsx watch
pnpm run build    # Compile TypeScript
pnpm run start    # Run compiled JS
```

### Prisma
```bash
# users-api
cd backend/users-api
pnpm run prisma:generate   # Generate client
pnpm run prisma:push       # Push schema to DB

# shop-api
cd backend/shop-api
pnpm run prisma:generate   # Generate client
pnpm run prisma:push       # Push schema to DB
```

## Architecture

Microservices monorepo using pnpm workspaces:

```
Frontend (3000) → API Gateway (4000) → Users API (5001) → PostgreSQL (users_db)
                                    → Generations API (5002) → MongoDB
                                    → Shop API (5003) → PostgreSQL (seo_facile_shops)
```

- **api-gateway**: Express proxy, routes requests to microservices
- **users-api**: Auth (Better Auth), users, sessions - PostgreSQL/Prisma
- **shop-api**: Shopify integration, stores, collections - PostgreSQL/Prisma
- **generations-api**: AI content generation - MongoDB/Mongoose
- **frontend**: Next.js 16, React 19, Tailwind 4, Shadcn/ui
- **shared**: TypeScript types shared across packages

## Key Files

- `backend/users-api/src/lib/auth.ts` - Better Auth server config
- `backend/users-api/prisma/schema.prisma` - User/Session/Account models
- `backend/shop-api/prisma/schema.prisma` - Store/ShopifyCollection models
- `backend/shop-api/src/lib/encryption.ts` - AES-256-GCM encryption for credentials
- `backend/shop-api/src/lib/shopify.ts` - Shopify API client config
- `frontend/lib/auth-client.ts` - Better Auth client
- `shared/src/` - Shared type definitions (user.ts, session.ts, api.ts)
- `backend/api-gateway/src/config/routes.ts` - API routing config

## Databases

- **PostgreSQL** (5432): Two databases - Adminer GUI at http://localhost:8082
  - `users_db`: Users, auth, sessions (users-api)
  - `seo_facile_shops`: Shopify stores, collections (shop-api)
- **MongoDB** (27017): Generations history - Mongo Express at http://localhost:8081

## Auth Flow

Better Auth handles authentication. Frontend calls `authClient`, gateway proxies to users-api, session stored as JWT cookie. Dashboard checks session server-side.

## Shopify Integration

Shop-api manages Shopify stores using client credentials grant flow:
- **Store credentials**: Encrypted using AES-256-GCM (clientId, clientSecret stored encrypted)
- **OAuth flow**: Client credentials grant - access tokens expire after 24h
- **Collections sync**: Fetches and stores Shopify collections with product counts
- **Models**: Store (shop credentials, status, tokens) and ShopifyCollection (synced collections)

## Environment

Docker uses container names (e.g., `http://users-api:5001`, `http://shop-api:5003`), local dev uses localhost. The `setup.sh` script creates `.env` files from `env.example` templates.

**Critical environment variables:**
- `ENCRYPTION_KEY`: Required for shop-api to encrypt/decrypt Shopify credentials
- `SHOPIFY_HOST_NAME`: Hostname for Shopify OAuth redirects (default: localhost:4000)
