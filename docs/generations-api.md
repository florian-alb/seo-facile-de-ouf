# Generations API - Documentation

## Vue d'ensemble

Le systeme de generation IA permet de generer automatiquement du contenu SEO optimise pour les produits Shopify. Il repose sur une architecture **asynchrone** avec file d'attente de messages (RabbitMQ) et un worker qui appelle les APIs d'IA (OpenAI GPT-4o).

## Architecture

```
Frontend (Next.js)
    |
    | POST /generations/generate
    v
API Gateway (Express, port 4000)
    |
    | Auth + headers (X-Gateway-Secret, X-User-ID)
    v
Generations API (Express, port 5002)
    |
    |-- Cree un document MongoDB (status: pending)
    |-- Publie un job dans RabbitMQ (queue: ai-generation-jobs)
    |-- Retourne 202 { jobId, status: "pending" }
    |
    v
RabbitMQ (queue: ai-generation-jobs)
    |
    v
Worker (Node.js, service separe)
    |
    |-- Consomme le job
    |-- Met a jour MongoDB (status: processing)
    |-- Appelle OpenAI GPT-4o (ou Claude)
    |-- Sauvegarde le resultat dans MongoDB (status: completed)
    |
    v
Frontend (polling GET /generations/job/:id toutes les 2s)
    |
    v
Affichage du contenu genere
```

## Services impliques

| Service | Port | Role |
|---------|------|------|
| `generations-api` | 5002 | Reception des demandes, creation des jobs |
| `worker` | - | Traitement des jobs, appel IA |
| `rabbitmq` | 5672 (AMQP) / 15672 (UI) | File d'attente de messages |
| `mongodb` | 27017 | Stockage des generations |
| `api-gateway` | 4000 | Proxy authentifie |

## Structure des fichiers

```
backend/generations-api/
├── src/
│   ├── index.ts                           # Point d'entree
│   ├── app.ts                             # Config Express
│   ├── types.ts                           # Interfaces TypeScript
│   ├── controllers/
│   │   └── generations.controller.ts      # Handlers HTTP
│   ├── services/
│   │   └── generation.service.ts          # Requetes MongoDB
│   ├── models/
│   │   └── generation.model.ts            # Schema Mongoose
│   ├── routes/
│   │   └── generation.routes.ts           # Endpoints (generate, job, jobs)
│   ├── middlewares/
│   │   ├── gateway-guard.ts               # Verification du secret gateway
│   │   ├── auth.middleware.ts             # Re-export gateway-guard
│   │   └── error.middleware.ts            # Gestion d'erreurs globale
│   └── lib/
│       ├── mongoose.ts                    # Connexion MongoDB + init RabbitMQ
│       └── rabbitmq.ts                    # Connexion RabbitMQ & publication

backend/worker/
├── src/
│   ├── index.ts                           # Point d'entree (connect + consume)
│   ├── consumer.ts                        # Consumer RabbitMQ, logique de retry
│   ├── models/
│   │   └── generation.model.ts            # Meme schema Mongoose
│   └── services/
│       ├── openai.service.ts              # Integration OpenAI GPT-4o
│       └── claude.service.ts              # Integration Claude (TODO)
```

## Schema MongoDB (Generation)

```typescript
{
  productId: string;          // ID Shopify du produit
  productName: string;        // Nom du produit
  keywords: string[];         // Mots-cles SEO

  status: "pending" | "processing" | "completed" | "failed";

  content?: {
    title: string;            // Titre SEO optimise
    description: string;      // Description produit complete
    metaTitle: string;        // Meta title (<60 caracteres)
    metaDescription: string;  // Meta description (<155 caracteres)
    slug: string;             // URL-friendly slug
  };

  error?: string;             // Message d'erreur si echec
  retryCount: number;         // Nombre de tentatives (max 3)
  userId: string;             // Utilisateur demandeur
  shopId: string;             // ID du shop Shopify

  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;         // Date de fin de generation
}
```

## Endpoints API

Tous les endpoints passent par le gateway (`/generations/*` -> `http://localhost:5002`).

| Methode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `POST` | `/generations/generate` | Oui | Creer un job de generation |
| `POST` | `/generations/generate/bulk` | Oui | Creer jusqu'a 50 jobs en batch |
| `GET` | `/generations/job/:id` | Non | Statut et resultat d'un job |
| `GET` | `/generations/jobs` | Oui | Lister les jobs (filtrable) |
| `GET` | `/generations/` | Oui | Toutes les generations de l'utilisateur |
| `GET` | `/generations/:id` | Oui | Une generation specifique |

### POST /generations/generate

**Request body :**
```json
{
  "productId": "gid://shopify/Product/123",
  "productName": "Chaussures de running bleues",
  "keywords": ["chaussures running", "sport"],
  "userId": "user-123",
  "shopId": "shop-456",
  "type": "full_description"
}
```

**Types de generation :**
- `full_description` : Titre + description + meta tags + slug (prevu pour Claude)
- `meta_only` : Meta title + meta description (OpenAI GPT-4o)
- `slug_only` : Slug SEO uniquement (OpenAI GPT-4o)

**Response (202 Accepted) :**
```json
{
  "success": true,
  "jobId": "65f8a2b3c4d5e6f7g8h9i0j1",
  "status": "pending",
  "message": "Generation queued successfully"
}
```

### GET /generations/job/:id

**Response :**
```json
{
  "jobId": "65f8a2b3c4d5e6f7g8h9i0j1",
  "status": "completed",
  "content": {
    "title": "Chaussures Running Bleues - Performance et Confort",
    "description": "Decouvrez nos chaussures de running...",
    "metaTitle": "Chaussures Running Bleues | Performance Sport",
    "metaDescription": "Chaussures de running bleues...",
    "slug": "chaussures-running-bleues-performance"
  },
  "createdAt": "2025-01-15T10:30:00Z",
  "completedAt": "2025-01-15T10:30:12Z"
}
```

## Logique de retry du Worker

Le worker gere les erreurs avec un mecanisme de retry :

1. En cas d'erreur, `retryCount` est incremente
2. Si `retryCount < 3` : le message est remis en queue (NACK + requeue)
3. Apres 3 echecs : le job passe en `failed` et le message est acquitte
4. Delai exponentiel : `5s * retryCount`

## Frontend - Flux utilisateur

Le hook `use-generation.ts` gere le cycle complet :

1. L'utilisateur clique sur "Generer" sur un produit
2. `startGeneration()` envoie la requete POST
3. Le frontend demarre un **polling** toutes les 2 secondes sur `GET /job/:id`
4. L'UI affiche un spinner pendant `pending` / `processing`
5. Quand `status: completed`, le contenu genere est affiche
6. Le polling s'arrete automatiquement

Le composant `generatable-field.tsx` fournit le bouton de generation avec compteurs de mots/caracteres.

---

## Mise en place

### Prerequis

- Docker et Docker Compose installes
- Une cle API OpenAI valide (GPT-4o)

### Etape 1 : Variables d'environnement

**`backend/generations-api/.env`** :
```bash
PORT=5002
MONGO_URI=mongodb://localhost:27017/generations-service
GATEWAY_SECRET=<meme valeur que dans api-gateway>
FRONTEND_URL=http://localhost:3000
RABBITMQ_URL=amqp://guest:guest@localhost:5672
```

**`backend/worker/.env`** (ou via docker-compose) :
```bash
MONGO_URI=mongodb://mongodb:27017/generations-db
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# ANTHROPIC_API_KEY=sk-ant-xxxxx   # Pour quand Claude sera implemente
```

Le `GATEWAY_SECRET` doit etre **identique** dans `api-gateway`, `generations-api`, `users-api`, et `shop-api`.

### Etape 2 : Demarrer les services avec Docker

```bash
docker-compose up --build
```

Cela demarre tous les services dont :
- `rabbitmq` : file de messages (UI dispo sur http://localhost:15672, user: guest/guest)
- `mongo` : base de donnees des generations
- `generations-api` : API de soumission
- `worker` : traitement IA

### Etape 3 : Verifier que RabbitMQ fonctionne

Ouvrir http://localhost:15672 (guest/guest) et verifier que la queue `ai-generation-jobs` existe.

### Etape 4 : Tester une generation

```bash
# 1. Se connecter et recuperer un cookie de session
# (via le frontend ou directement via /api/auth)

# 2. Envoyer une demande de generation
curl -X POST http://localhost:4000/generations/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_session=<votre-session>" \
  -d '{
    "productId": "gid://shopify/Product/123",
    "productName": "Chaussures de running bleues",
    "keywords": ["chaussures", "running", "sport"],
    "type": "meta_only"
  }'

# 3. Reponse attendue : { "success": true, "jobId": "...", "status": "pending" }

# 4. Verifier le statut
curl http://localhost:4000/generations/job/<jobId>
```

### Etape 5 : Obtenir une cle API OpenAI

1. Aller sur https://platform.openai.com/api-keys
2. Creer une nouvelle cle API
3. Ajouter la cle dans la variable `OPENAI_API_KEY` du worker
4. Redemarrer le service worker

### Resume des actions necessaires

| Action | Statut | Detail |
|--------|--------|--------|
| Configurer `GATEWAY_SECRET` | A faire | Meme valeur partout |
| Configurer `OPENAI_API_KEY` | A faire | Cle OpenAI valide pour GPT-4o |
| Configurer `RABBITMQ_URL` | A faire | URL de connexion RabbitMQ |
| Configurer `MONGO_URI` | A faire | URL MongoDB pour les generations |
| Lancer `docker-compose up` | A faire | Demarre tous les services |
| Verifier RabbitMQ UI | Optionnel | http://localhost:15672 |
| Tester via curl ou frontend | A faire | Valider le flux complet |
| Implementer Claude service | Optionnel | `backend/worker/src/services/claude.service.ts` est vide |

### Points d'attention

- Le worker est un service **separe** de generations-api. Il doit tourner pour que les jobs soient traites.
- Sans `OPENAI_API_KEY` valide, les jobs resteront en `pending` puis passeront en `failed` apres 3 retries.
- Le `GATEWAY_SECRET` doit etre identique entre tous les services backend, sinon les requetes seront rejetees avec 403.
- Le type `full_description` est prevu pour appeler Claude mais le service n'est **pas encore implemente** (`claude.service.ts` est vide). Utiliser `meta_only` ou `slug_only` pour l'instant.
