# SEO FACILE DE OUF

**Plateforme SaaS d'automatisation de contenu SEO pour e-commerçants, basée sur une architecture Microservices.**

## 📖 À propos du projet

Ce projet est un SaaS B2B conçu pour aider les e-commerçants (Shopify, WooCommerce) à rédiger des fiches produits optimisées pour le référencement (SEO) en quelques secondes grâce à l'Intelligence Artificielle.

Contrairement aux solutions classiques de rédaction manuelle, cette application permet de générer, stocker et gérer des centaines de descriptions uniques et optimisées.

### 🎯 Pourquoi cet outil ?

La rédaction de fiches produits est la tâche la plus chronophage et la moins aimée des e-commerçants :

1.  **Le problème du temps :** Rédiger une bonne fiche prend 20 à 60 minutes. Pour une boutique de 100 produits, cela représente des semaines de travail.
2.  **Le problème du SEO :** Sans optimisation sémantique, une boutique est invisible sur Google.
3.  **Le problème du coût :** Embaucher des rédacteurs coûte cher.

**Notre solution :** Une interface simple où le marchand rentre ses mots-clés, et notre moteur asynchrone génère un contenu vendeur et optimisé SEO instantanément.

### Concurrence:

- https://describely.ai/
- https://www.kaatalog.ai/
- https://shopifast.io/landing

---

## 🛠 Stack Technique

Ce projet met en œuvre une architecture **Microservices** moderne et typée :

- **Backend :** Node.js avec **Express** & **TypeScript**.
- **Communication :** Messaging asynchrone avec **RabbitMQ**.
- **Persistence Hybride (Polyglot Persistence) :**
  - **PostgreSQL + Prisma :** Données relationnelles critiques (Utilisateurs, Auth, Crédits, Tokens Shopify).
  - **MongoDB + Mongoose :** Données non structurées (Historique des générations IA, Logs, Contenu riche).
- **Intelligence Artificielle :** OpenAI API (GPT-5) + Claude (sonnet 4.5)
- **Frontend :** Next.js / React.

## 📁 Structure

```
├── api-gateway/     # Gateway principal (port 3000)
├── public-api/      # API publique (port 5050)
└── private-api/     # API privée (port 5555)
```

## 🚀 Installation

```bash
# Installer les dépendances pour chaque service
cd api-gateway && pnpm install
cd ../public-api && pnpm install
cd ../private-api && pnpm install
```

## 💻 Lancer le projet

Ouvrir 3 terminaux :

**Terminal 1 - API Gateway**

```bash
cd api-gateway
pnpm dev
```

**Terminal 2 - Public API**

```bash
cd public-api
pnpm dev
```

**Terminal 3 - Private API**

```bash
cd private-api
pnpm dev
```

## 📍 Routes disponibles

### Via API Gateway (http://localhost:3000)

- `GET /` - Status du gateway
- `GET /public/*` - Proxy vers Public API
- `GET /private/*` - Proxy vers Private API

### Public API (http://localhost:5050)

- `GET /` - Status
- `GET /users` - Liste des utilisateurs

### Private API (http://localhost:5555)

- `GET /` - Status
- `GET /admin` - Données admin

## 🧪 Tester

```bash
# Via le gateway
curl http://localhost:3000/public/users
curl http://localhost:3000/private/admin

# Directement
curl http://localhost:5050/users
curl http://localhost:5555/admin
```

## 🛠️ Stack

- TypeScript
- Express
- http-proxy-middleware
- tsx (dev)
