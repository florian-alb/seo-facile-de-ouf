# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**EasySeo (EasySEO)** - B2B SaaS platform for e-commerce SEO content generation. Helps Shopify merchants auto-generate SEO-optimized product descriptions using AI (GPT-4o, Claude).

## Quick Start

```bash
./setup.sh                    # Initialize env files and install deps
docker-compose up --build     # Run all services
```

**Access URLs:**

- Frontend: http://localhost:3000
- API Gateway: http://localhost:4000
- RabbitMQ Management: http://localhost:15672
- Adminer (PostgreSQL): http://localhost:8082
- Mongo Express: http://localhost:8081

## Architecture

Microservices monorepo using pnpm workspaces with async job processing:

```
Frontend (3000) → API Gateway (4000) → Users API (5001) → PostgreSQL (users_db)
                                    → Generations API (5002) → MongoDB ← Change Streams (SSE)
                                    → Shop API (5003) → PostgreSQL (seo_facile_shops)
                                    ↓
                              Generations API → RabbitMQ → Worker → OpenAI / Anthropic
                                                                 → MongoDB (update job)
```

### Async Generation Pipeline

1. `POST /generations/generate` creates a job (status: `pending`), publishes to RabbitMQ, returns `jobId` (202)
2. Worker consumes the job, calls OpenAI/Anthropic, updates MongoDB
3. Frontend uses `GET /generations/job/:id/stream` (SSE via MongoDB Change Streams) for real-time updates

## Tech Stack

### Frontend

- **Next.js 16** with React 19
- **Tailwind 4** with @tailwindcss/postcss and @tailwindcss/typography
- **Shadcn/ui** components (Radix primitives)
- **@tanstack/react-table** for data tables
- **React Hook Form** + **Zod** validation
- **Tiptap 3** rich text editor
- **Recharts** for charts/analytics
- **next-themes** for dark/light mode
- **Sonner** for toast notifications
- **Lucide React** icons
- **Better Auth** client

### Backend

- **Express 5.1** with TypeScript 5.7
- **Prisma 7.0** (PostgreSQL ORM)
- **Mongoose 9.0** (MongoDB ODM)
- **Better Auth** for authentication
- **@shopify/shopify-api** for Shopify integration
- **amqplib** for RabbitMQ messaging
- **tsx** for development with hot reload

### Worker

- **@anthropic-ai/sdk** for Claude AI
- **openai** for OpenAI / GPT
- **amqplib** for RabbitMQ consumer
- **mongoose** for MongoDB updates

### Infrastructure

- **RabbitMQ** - Message broker for async job processing
- **MongoDB Replica Set** - Required for Change Streams (SSE)
- **PostgreSQL** - Relational data (users, shops)

## Services

| Service         | Port        | Database                      | Purpose                                                           |
| --------------- | ----------- | ----------------------------- | ----------------------------------------------------------------- |
| frontend        | 3000        | -                             | Next.js web application                                           |
| api-gateway     | 4000        | -                             | Express proxy, routes to microservices                            |
| users-api       | 5001        | PostgreSQL (users_db)         | Auth, users, sessions via Better Auth                             |
| generations-api | 5002        | MongoDB                       | AI generation jobs, SSE streaming                                 |
| shop-api        | 5003        | PostgreSQL (seo_facile_shops) | Shopify stores, collections, products, settings                   |
| worker (x3)     | -           | MongoDB                       | Async AI generation job processor (RabbitMQ consumer, 3 replicas) |
| rabbitmq        | 5672, 15672 | -                             | Message broker (management UI at :15672)                          |

## Development Commands

### Root Level

```bash
pnpm run dev              # Run all services concurrently
pnpm run frontend         # Next.js (port 3000)
pnpm run api-gateway      # Express gateway (port 4000)
pnpm run users-api        # Users service (port 5001)
pnpm run generations-api  # Generations service (port 5002)
pnpm run shop-api         # Shop service (port 5003)
pnpm run lint             # Lint all workspaces
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

### Prisma (users-api and shop-api)

```bash
pnpm run prisma:generate   # Generate Prisma client
pnpm run prisma:push       # Push schema to DB
```

## API Endpoints

Routes are configured in `backend/api-gateway/src/config/routes.ts`:

| Route                          | Target          | Auth | Description                               |
| ------------------------------ | --------------- | ---- | ----------------------------------------- |
| `/api/auth/*`                  | users-api       | No   | Better Auth routes                        |
| `/auth/*`                      | users-api       | No   | Plain auth routes (e.g., /auth/me)        |
| `/users/*`                     | users-api       | Yes  | User management                           |
| `/stores/*`                    | shop-api        | Yes  | Store CRUD + settings + reconnect         |
| `/shopify/auth/*`              | shop-api        | No   | Shopify OAuth callback                    |
| `/shops/:shopId/collections/*` | shop-api        | Yes  | Shopify collections sync, update, publish |
| `/shops/:shopId/products/*`    | shop-api        | Yes  | Shopify products sync, update, publish    |
| `/generations/*`               | generations-api | Yes  | AI content generation (async jobs)        |

### Notable Endpoints

**Stores:**

- `POST /stores` - Add store (returns `oauthUrl` for Shopify consent redirect)
- `POST /stores/:storeId/reconnect` - Relaunch OAuth flow (reconnection)
- `GET /stores/:storeId/settings` - Get store SEO settings
- `PUT /stores/:storeId/settings` - Update store SEO settings

**Generations (async):**

- `POST /generations/generate` - Create async generation job (returns jobId, 202)
- `GET /generations/job/:id/stream` - SSE stream for real-time job status
- `GET /generations/job/:id` - Get job status/result
- `POST /generations/generate/bulk` - Bulk generate (up to 50 products)
- `GET /generations/jobs` - List jobs by user/shop/status

**Products:**

- `PATCH /shops/:shopId/products/:productId` - Update product
- `POST /shops/:shopId/products/:productId/publish` - Publish product to Shopify

**Collections:**

- `PATCH /shops/:shopId/collections/:collectionId` - Update collection
- `POST /shops/:shopId/collections/:collectionId/publish` - Publish collection to Shopify

## Database Models

### PostgreSQL: users_db (users-api)

- **User** - User accounts
- **Session** - Active sessions
- **Account** - OAuth provider accounts

### PostgreSQL: seo_facile_shops (shop-api)

- **Store** - Shop credentials, OAuth tokens, sync status
- **StoreSettings** - SEO settings per store (niche, language, word counts, customer persona)
- **ShopifyCollection** - Synced collections with SEO data
- **ShopifyProduct** - Synced products with pricing, tags, images

### MongoDB: generations-db (generations-api + worker)

- **Generation** - AI generation jobs with:
  - `status`: `pending` | `processing` | `completed` | `failed`
  - `fieldType`: `description` | `seoTitle` | `seoDescription` | `full_description` | `meta_only` | `slug_only`
  - `content`: structured output (title, description, metaTitle, metaDescription, slug)
  - `storeSettings`: embedded store context for AI
  - `productContext`: embedded product context (title, tags, vendor, productType, price, currentDescription)
  - `retryCount`, `shopId`, `completedAt`

## Key Files

### Users API

- `backend/users-api/src/lib/auth.ts` - Better Auth server config
- `backend/users-api/prisma/schema.prisma` - User/Session/Account models
- `backend/users-api/src/routes/auth.routes.ts` - Auth endpoints
- `backend/users-api/src/routes/user.routes.ts` - User endpoints

### Shop API

- `backend/shop-api/prisma/schema.prisma` - Store/StoreSettings/Collection/Product models
- `backend/shop-api/src/lib/encryption.ts` - AES-256-GCM for credentials
- `backend/shop-api/src/lib/shopify.ts` - Shopify API client config
- `backend/shop-api/src/services/shopify-products.service.ts` - Product sync logic
- `backend/shop-api/src/services/shopify-collections.service.ts` - Collection sync
- `backend/shop-api/src/services/store-settings.service.ts` - Store SEO settings
- `backend/shop-api/src/services/store.service.ts` - Store CRUD
- `backend/shop-api/src/services/token.service.ts` - Token management
- `backend/shop-api/src/controllers/shopify-products.controller.ts` - Product handlers
- `backend/shop-api/src/controllers/stores.controller.ts` - Store handlers
- `backend/shop-api/src/controllers/store-settings.controller.ts` - Settings handlers
- `backend/shop-api/src/routes/shopify-products.routes.ts` - Product endpoints
- `backend/shop-api/src/routes/shopify-collections.routes.ts` - Collection endpoints
- `backend/shop-api/src/routes/store.routes.ts` - Store endpoints
- `backend/shop-api/src/routes/store-settings.routes.ts` - Settings endpoints

### Generations API

- `backend/generations-api/src/models/generation.model.ts` - Mongoose schema
- `backend/generations-api/src/services/generation.service.ts` - Generation logic
- `backend/generations-api/src/routes/generation.routes.ts` - Generation endpoints
- `backend/generations-api/src/lib/rabbitmq.ts` - RabbitMQ publisher
- `backend/generations-api/src/middlewares/gateway-guard.ts` - Gateway guard middleware

### Worker

- `backend/worker/src/index.ts` - Entry point (connects to MongoDB + RabbitMQ)
- `backend/worker/src/consumer.ts` - RabbitMQ consumer, processes AI generation jobs
- `backend/worker/src/services/claude.service.ts` - Anthropic Claude AI service
- `backend/worker/src/services/openai.service.ts` - OpenAI service
- `backend/worker/src/models/generation.model.ts` - Mongoose model (mirrors generations-api)
- `backend/worker/src/types/job.types.ts` - Job type definitions

### Backend Shared (`backend/shared/`)

- `backend/shared/src/middlewares/error.middleware.ts` - Express error handler
- `backend/shared/src/middlewares/gateway-guard.ts` - `X-Gateway-Secret` verification + userId extraction
- `backend/shared/src/lib/encryption.ts` - AES-256-GCM encrypt/decrypt
- `backend/shared/src/lib/app-factory.ts` - `createApp()` Express factory
- `backend/shared/src/lib/controller-utils.ts` - `getParam`, `getRequiredUserId`, `handleServiceError`

### API Gateway

- `backend/api-gateway/src/config/routes.ts` - Route definitions

### Frontend

- `frontend/lib/auth-client.ts` - Better Auth client
- `frontend/lib/api.ts` - API fetch utility (`apiFetch`, `ApiError`)
- `frontend/lib/format.ts` - Shared formatting utilities (`formatDate`, `formatPrice`)
- `frontend/lib/validations/` - Zod schemas (collection, product, store-settings, store)
- `frontend/hooks/use-shopify-stores.ts` - Store data fetching
- `frontend/hooks/use-shopify-collections.ts` - Collections data fetching
- `frontend/hooks/use-shopify-products.ts` - Products data fetching
- `frontend/hooks/use-shopify-product.ts` - Single product CRUD + publish
- `frontend/hooks/use-shopify-collection.ts` - Single collection CRUD + publish
- `frontend/hooks/use-store-settings.ts` - Store settings fetch/save
- `frontend/hooks/use-generation.ts` - SSE-based generation hook (`useFieldGeneration`)
- `frontend/components/ui/data-table.tsx` - TanStack table wrapper
- `frontend/components/ui/rich-text-editor.tsx` - Tiptap rich text editor
- `frontend/components/products/columns.tsx` - Product table columns
- `frontend/components/products/products-table.tsx` - Products table
- `frontend/components/products/product-form.tsx` - Product edit form
- `frontend/components/products/product-info-sidebar.tsx` - Product detail sidebar
- `frontend/components/products/tags-input.tsx` - Tags input component
- `frontend/components/collections/columns.tsx` - Collection table columns
- `frontend/components/collections/collections-table.tsx` - Collections table
- `frontend/components/collections/collection-form.tsx` - Collection edit form
- `frontend/components/collections/collection-info-sidebar.tsx` - Collection detail sidebar
- `frontend/components/settings/settings-form.tsx` - Store settings form
- `frontend/components/shared/generatable-field.tsx` - AI-generatable field component
- `frontend/components/shared/sync-button.tsx` - Sync button
- `frontend/components/shared/action-card.tsx` - Action card
- `frontend/components/sidebar/app-sidebar.tsx` - App sidebar
- `frontend/components/sidebar/stores-list.tsx` - Stores list
- `frontend/components/sidebar/stores-section.tsx` - Stores section
- `frontend/components/sidebar/add-store-dialog.tsx` - Add store dialog
- `frontend/components/sidebar/nav-user.tsx` - Nav user component
- `frontend/components/stores/edit-store-dialog.tsx` - Store edit dialog
- `frontend/components/stores/store-form.tsx` - Store form
- `frontend/components/dashboard/dashboard-header.tsx` - Dashboard header
- `frontend/components/dashboard/dashboard-shell.tsx` - Dashboard shell layout

### Frontend Pages (App Router)

- `app/dashboard/store/[storeId]/settings/page.tsx` - Store SEO settings
- `app/dashboard/store/[storeId]/products/[productId]/page.tsx` - Product detail
- `app/dashboard/store/[storeId]/collections/[collectionId]/page.tsx` - Collection detail

### Shared Types

- `shared/src/user.ts` - User types
- `shared/src/session.ts` - Session types
- `shared/src/api.ts` - API response types
- `shared/src/shopify-products.ts` - Shopify product types
- `shared/src/shopify-collections.ts` - Shopify collection types
- `shared/src/shopify-credentials.ts` - Shopify credential types
- `shared/src/store-settings.ts` - Store settings types

## Frontend Patterns

### Custom Hooks

Data fetching hooks in `frontend/hooks/` built on two generic hooks:

- **`useEntityList<T>`** - Generic paginated list with sync (used by products, collections)
- **`useEntityCRUD<T, U>`** - Generic CRUD with publish (used by single product, collection)

```typescript
// Example: use-shopify-products.ts (wraps useEntityList)
const { products, loading, error, syncProducts } = useShopifyProducts(storeId);

// Example: use-generation.ts (SSE streaming)
const { generate, isGenerating } = useFieldGeneration(storeId);
```

### API Utility

All hooks use `frontend/lib/api.ts`:

```typescript
import { apiFetch } from "@/lib/api";
const data = await apiFetch<Product>(`/shops/${storeId}/products/${productId}`);
```

### Data Tables

Feature tables follow this structure:

```
components/<feature>/
├── columns.tsx      # Column definitions with @tanstack/react-table
├── <feature>-table.tsx  # Table component with actions
└── <feature>-filters.tsx # Filter controls (optional)
```

### Detail Pages

Detail/edit pages follow this structure:

```
components/<feature>/
├── <feature>-form.tsx          # Edit form with React Hook Form + Zod
├── <feature>-info-sidebar.tsx  # Read-only info sidebar
└── generatable-field.tsx       # AI-powered field generation (shared)
```

### Form Handling

Forms use React Hook Form with Zod schemas from `frontend/lib/validations/`. SEO fields share a common base (`base-seo.ts`) extended by product and collection schemas:

```typescript
// frontend/lib/validations/base-seo.ts - shared SEO validation rules
export const baseSeoFields = {
  title: z.string().min(1).max(255),
  descriptionHtml: z.string().max(65535).optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
};

const form = useForm<FormData>({
  resolver: zodResolver(formSchema),
  defaultValues: { ... }
});
```

### Component Library

UI components from Shadcn/ui in `frontend/components/ui/`. Add new components:

```bash
npx shadcn@latest add <component>
```

## Backend Patterns

### Backend Shared Package (`@seo-facile-de-ouf/backend-shared`)

Centralized middleware and utilities used by all backend services:

| Module             | Role                                                           |
| ------------------ | -------------------------------------------------------------- |
| `error.middleware` | Express error handler                                          |
| `gateway-guard`    | `X-Gateway-Secret` verification + userId extraction            |
| `encryption`       | AES-256-GCM encrypt/decrypt                                    |
| `app-factory`      | `createApp()` factory to initialize Express apps               |
| `controller-utils` | Helpers: `getParam`, `getRequiredUserId`, `handleServiceError` |

### Express App Factory

Each microservice uses `createApp()` instead of manually setting up Express:

```typescript
import { createApp } from "@seo-facile-de-ouf/backend-shared";

export default () =>
  createApp({
    routes: [
      { path: "/collections", router: collectionsRouter },
      { path: "/products", router: productsRouter },
    ],
  });
```

Optional `beforeRoutes` callback for middleware before JSON parsing (needed by Better Auth in Users API).

### Service Architecture

```
routes/*.routes.ts → controllers/*.controller.ts → services/*.service.ts → Prisma/Mongoose
```

### Controller Pattern

Controllers use shared utilities from `controller-utils`:

```typescript
export const getProducts = async (req: Request, res: Response) => {
  const shopId = getParam(req, "shopId");
  const userId = getRequiredUserId(req, res);
  if (!userId) return;
  const products = await shopifyProductsService.getProducts(shopId);
  res.json({ success: true, data: products });
};
```

### Service Pattern

```typescript
export const shopifyProductsService = {
  async getProducts(storeId: string) {
    return prisma.shopifyProduct.findMany({ where: { storeId } });
  },
  async syncProducts(storeId: string) {
    // Fetch from Shopify GraphQL, upsert to DB
  },
};
```

### Async Job Pattern (Generations)

```typescript
// 1. API creates job and publishes to RabbitMQ
const job = await Generation.create({ status: "pending", ... });
await publishToQueue("ai-generation-jobs", job);

// 2. Worker consumes and processes (3 replicas, prefetch: 1)
channel.consume("ai-generation-jobs", async (msg) => {
  await Generation.updateOne({ _id: jobId }, { status: "processing" });
  const result = await openaiService.generate(prompt);
  await Generation.updateOne({ _id: jobId }, { status: "completed", content: result });
});
// Retry: up to 3 attempts with exponential backoff, then status: "failed"

// 3. Frontend streams via SSE (MongoDB Change Streams)
const stream = Generation.watch([{ $match: { "documentKey._id": jobId } }]);
```

### Worker Strategy Pattern

The worker uses a strategy pattern via `getGenerators()` to handle both products and collections with a single dispatch logic:

```typescript
const { generateDescription, generateMeta } = getGenerators(
  job.entityType,
  job,
);
switch (job.fieldType) {
  case "description":
    return { description: await generateDescription() };
  case "full_description":
    const [desc, meta] = await Promise.all([
      generateDescription(),
      generateMeta(),
    ]);
    return { description: desc, ...meta };
  // ...
}
```

## Authentication Flow

**Methods:** Email/password + OAuth (GitHub, Google, Roblox)

1. Frontend calls `authClient` methods (login, register, logout)
2. API Gateway proxies to users-api `/api/auth/*` (no auth required)
3. Better Auth handles authentication (password hashing, JWT creation, OAuth)
4. JWT returned in HTTP-only cookie, automatically included in subsequent requests
5. API Gateway verifies JWT on protected routes, adds `X-Gateway-Secret` header + user info
6. Microservices verify `X-Gateway-Secret` via gateway guard middleware
7. Dashboard pages check session server-side before rendering

## Shopify Integration

### OAuth Flow

Uses **OAuth Authorization Code Grant** with a single Shopify app for all merchants:

1. User creates a store → API returns an `oauthUrl` → user is redirected to Shopify consent screen
2. After authorization, Shopify redirects to `/shopify/auth/callback` with an authorization code
3. The callback verifies the **HMAC-SHA256 signature** (`crypto.timingSafeEqual`), exchanges the code for an **offline access token** (permanent, no refresh needed)
4. The access token is **encrypted with AES-256-GCM** before storage
5. Security: **signed state** parameter (storeId + nonce signed by HMAC) and **nonce** for CSRF protection

### Data Sync

- **Collections**: Fetched via GraphQL, stored with SEO metadata
- **Products**: Fetched via GraphQL with pricing, images, tags, collection mappings

### Publishing

- Products and collections can be updated locally then published back to Shopify
- `POST /shops/:shopId/products/:productId/publish` pushes changes to Shopify GraphQL

### Encryption

Shopify access token encrypted with AES-256-GCM (`backend/shop-api/src/lib/encryption.ts`):

- Encryption key derived from `ENCRYPTION_KEY` env var via SHA-256 hash
- `encrypt(plaintext)` → JSON `{iv, data, tag}` in hexadecimal
- `decrypt(ciphertext)` → original value

## Environment

Docker uses container names, local dev uses localhost:

```
# Docker
USERS_API_URL=http://users-api:5001
SHOP_API_URL=http://shop-api:5003
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672

# Local
USERS_API_URL=http://localhost:5001
SHOP_API_URL=http://localhost:5003
RABBITMQ_URL=amqp://guest:guest@localhost:5672
```

### Critical Variables

| Variable                | Service                    | Description                           |
| ----------------------- | -------------------------- | ------------------------------------- |
| `ENCRYPTION_KEY`        | shop-api                   | AES-256 key for credential encryption |
| `SHOPIFY_CLIENT_ID`     | shop-api                   | Shopify app client ID                 |
| `SHOPIFY_CLIENT_SECRET` | shop-api                   | Shopify app client secret             |
| `SHOPIFY_HOST_NAME`     | shop-api                   | Hostname for OAuth redirects          |
| `GATEWAY_SECRET`        | api-gateway + all services | Shared secret for gateway guard       |
| `BETTER_AUTH_SECRET`    | users-api                  | JWT signing secret                    |
| `DATABASE_URL`          | users-api, shop-api        | PostgreSQL connection string          |
| `MONGO_URI`             | generations-api, worker    | MongoDB connection string             |
| `RABBITMQ_URL`          | generations-api, worker    | RabbitMQ connection string            |
| `OPENAI_API_KEY`        | worker                     | OpenAI API key for GPT                |
| `ANTHROPIC_API_KEY`     | worker                     | Anthropic API key for Claude          |

### Setup

The `setup.sh` script creates `.env` files from `env.example` templates.

## Database GUIs

- **Adminer** (PostgreSQL): http://localhost:8082
  - Server: `postgres`
  - Username: `postgres`
  - Password: `postgres`
  - Databases: `users_db`, `seo_facile_shops`

- **Mongo Express** (MongoDB): http://localhost:8081

- **RabbitMQ Management**: http://localhost:15672
  - Username: `guest`
  - Password: `guest`

## Conventions

### File Naming

- Routes: `<entity>.routes.ts`
- Controllers: `<entity>.controller.ts`
- Services: `<entity>.service.ts`
- Hooks: `use-<entity>.ts`
- Validations: `frontend/lib/validations/<entity>.ts`
- Components: kebab-case directories, PascalCase files

### Code Organization

- Backend: routes → controllers → services → database
- Frontend: pages → components → hooks → lib
- Worker: consumer → services (AI) → database

### Imports

Use workspace package for shared types:

```typescript
import { User, ShopifyProduct } from "@seo-facile-de-ouf/shared";
```

### Language

Always code in english
