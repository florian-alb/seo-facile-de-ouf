# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SEO Facile** - B2B SaaS platform for e-commerce SEO content generation. Helps merchants (Shopify, WooCommerce) auto-generate SEO-optimized product descriptions using AI (GPT-5, Claude).

## Quick Start

```bash
./setup.sh                    # Initialize env files and install deps
docker-compose up --build     # Run all services
```

**Access URLs:**
- Frontend: http://localhost:3000
- API Gateway: http://localhost:4000
- Adminer (PostgreSQL): http://localhost:8082
- Mongo Express: http://localhost:8081

## Architecture

Microservices monorepo using pnpm workspaces:

```
Frontend (3000) → API Gateway (4000) → Users API (5001) → PostgreSQL (users_db)
                                    → Generations API (5002) → MongoDB
                                    → Shop API (5003) → PostgreSQL (seo_facile_shops)
```

## Tech Stack

### Frontend
- **Next.js 16** with React 19
- **Tailwind 4** with @tailwindcss/postcss
- **Shadcn/ui** components (Radix primitives)
- **@tanstack/react-table** for data tables
- **React Hook Form** + **Zod** validation
- **Sonner** for toast notifications
- **Lucide React** icons
- **Better Auth** client

### Backend
- **Express 5.1** with TypeScript 5.7
- **Prisma 7.0** (PostgreSQL ORM)
- **Mongoose 9.0** (MongoDB ODM)
- **Better Auth** for authentication
- **@shopify/shopify-api** for Shopify integration
- **tsx** for development with hot reload

## Services

| Service | Port | Database | Purpose |
|---------|------|----------|---------|
| frontend | 3000 | - | Next.js web application |
| api-gateway | 4000 | - | Express proxy, routes to microservices |
| users-api | 5001 | PostgreSQL (users_db) | Auth, users, sessions via Better Auth |
| generations-api | 5002 | MongoDB | AI content generation history |
| shop-api | 5003 | PostgreSQL (seo_facile_shops) | Shopify stores, collections, products |

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

| Route | Target | Auth | Description |
|-------|--------|------|-------------|
| `/api/auth/*` | users-api | No | Better Auth routes |
| `/stores/*` | shop-api | Yes | Store CRUD operations |
| `/shops/:shopId/collections/*` | shop-api | Yes | Shopify collections sync |
| `/shops/:shopId/products/*` | shop-api | Yes | Shopify products sync |
| `/generations/*` | generations-api | Yes | AI content generation |

## Database Models

### PostgreSQL: users_db (users-api)
- **User** - User accounts
- **Session** - Active sessions
- **Account** - OAuth provider accounts

### PostgreSQL: seo_facile_shops (shop-api)
- **Store** - Shop credentials, OAuth tokens, sync status
- **ShopifyCollection** - Synced collections with SEO data
- **ShopifyProduct** - Synced products with pricing, tags, images

### MongoDB: generations-db (generations-api)
- **Generation** - AI generation history and results

## Key Files

### Users API
- `backend/users-api/src/lib/auth.ts` - Better Auth server config
- `backend/users-api/prisma/schema.prisma` - User/Session/Account models
- `backend/users-api/src/routes/auth.routes.ts` - Auth endpoints
- `backend/users-api/src/routes/user.routes.ts` - User endpoints

### Shop API
- `backend/shop-api/prisma/schema.prisma` - Store/Collection/Product models
- `backend/shop-api/src/lib/encryption.ts` - AES-256-GCM for credentials
- `backend/shop-api/src/lib/shopify.ts` - Shopify API client config
- `backend/shop-api/src/services/shopify-products.service.ts` - Product sync logic
- `backend/shop-api/src/services/shopify-collections.service.ts` - Collection sync
- `backend/shop-api/src/controllers/shopify-products.controller.ts` - Product handlers
- `backend/shop-api/src/routes/shopify-products.routes.ts` - Product endpoints
- `backend/shop-api/src/routes/shopify-collections.routes.ts` - Collection endpoints

### Generations API
- `backend/generations-api/src/models/generation.model.ts` - Mongoose schema
- `backend/generations-api/src/services/generation.service.ts` - Generation logic
- `backend/generations-api/src/routes/generation.routes.ts` - Generation endpoints

### API Gateway
- `backend/api-gateway/src/config/routes.ts` - Route definitions

### Frontend
- `frontend/lib/auth-client.ts` - Better Auth client
- `frontend/hooks/use-shopify-stores.ts` - Store data fetching
- `frontend/hooks/use-shopify-collections.ts` - Collections data fetching
- `frontend/hooks/use-shopify-products.ts` - Products data fetching
- `frontend/components/ui/data-table.tsx` - TanStack table wrapper
- `frontend/components/products/columns.tsx` - Product table columns
- `frontend/components/products/products-table.tsx` - Products table
- `frontend/components/collections/columns.tsx` - Collection table columns
- `frontend/components/collections/collections-table.tsx` - Collections table

### Shared Types
- `shared/src/user.ts` - User types
- `shared/src/session.ts` - Session types
- `shared/src/api.ts` - API response types
- `shared/src/shopify.ts` - Shopify types (products, collections, GraphQL)

## Frontend Patterns

### Custom Hooks
Data fetching hooks in `frontend/hooks/`:
```typescript
// Example: use-shopify-products.ts
const { products, loading, error, syncProducts } = useShopifyProducts(storeId);
```

### Data Tables
Feature tables follow this structure:
```
components/<feature>/
├── columns.tsx      # Column definitions with @tanstack/react-table
├── <feature>-table.tsx  # Table component with actions
└── <feature>-filters.tsx # Filter controls (optional)
```

### Form Handling
Forms use React Hook Form with Zod schemas:
```typescript
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

### Service Architecture
```
routes/*.routes.ts → controllers/*.controller.ts → services/*.service.ts → Prisma/Mongoose
```

### Controller Pattern
```typescript
export const getProducts = async (req: Request, res: Response) => {
  const { shopId } = req.params;
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
  }
};
```

## Authentication Flow

1. Frontend calls `authClient` methods (login, register, logout)
2. API Gateway proxies to users-api `/api/auth/*`
3. Better Auth handles authentication, returns JWT cookie
4. Subsequent requests include cookie, validated by middleware
5. Dashboard pages check session server-side before rendering

## Shopify Integration

### OAuth Flow
Uses client credentials grant (not user OAuth):
1. Store credentials (clientId, clientSecret) saved encrypted
2. Access token requested via client credentials
3. Token expires after 24h, auto-refreshed on API calls

### Data Sync
- **Collections**: Fetched via GraphQL, stored with SEO metadata
- **Products**: Fetched via GraphQL with pricing, images, tags, collection mappings

### Encryption
Credentials encrypted with AES-256-GCM (`backend/shop-api/src/lib/encryption.ts`):
- `encrypt(plaintext)` → `iv:authTag:encrypted`
- `decrypt(ciphertext)` → original value

## Environment

Docker uses container names, local dev uses localhost:
```
# Docker
USERS_API_URL=http://users-api:5001
SHOP_API_URL=http://shop-api:5003

# Local
USERS_API_URL=http://localhost:5001
SHOP_API_URL=http://localhost:5003
```

### Critical Variables
| Variable | Service | Description |
|----------|---------|-------------|
| `ENCRYPTION_KEY` | shop-api | AES-256 key for credential encryption |
| `SHOPIFY_HOST_NAME` | shop-api | Hostname for OAuth redirects |
| `DATABASE_URL` | users-api, shop-api | PostgreSQL connection string |
| `MONGO_URI` | generations-api | MongoDB connection string |

### Setup
The `setup.sh` script creates `.env` files from `env.example` templates.

## Database GUIs

- **Adminer** (PostgreSQL): http://localhost:8082
  - Server: `postgres`
  - Username: `postgres`
  - Password: `postgres`
  - Databases: `users_db`, `seo_facile_shops`

- **Mongo Express** (MongoDB): http://localhost:8081

## Conventions

### File Naming
- Routes: `<entity>.routes.ts`
- Controllers: `<entity>.controller.ts`
- Services: `<entity>.service.ts`
- Hooks: `use-<entity>.ts`
- Components: kebab-case directories, PascalCase files

### Code Organization
- Backend: routes → controllers → services → database
- Frontend: pages → components → hooks → lib

### Imports
Use workspace package for shared types:
```typescript
import { User, ShopifyProduct } from "@seo-facile-de-ouf/shared";
```

### Language
Allways code in english
