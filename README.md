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

## 🛠 Stack Technique

- **TypeScript** - Typage statique
- **Express** - Framework web
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM pour MongoDB
- **http-proxy-middleware** - Proxy pour API Gateway
- **tsx** - Exécution TypeScript avec hot-reload
- **Docker** - Conteneurisation
- **pnpm** - Gestionnaire de paquets

Ce projet met en œuvre une architecture **Microservices** moderne et typée :

- **Backend :** Node.js avec **Express** & **TypeScript**.
- **Communication :** Messaging asynchrone avec **RabbitMQ**.
- **Persistence Hybride (Polyglot Persistence) :**
  - **PostgreSQL + Prisma :** Données relationnelles critiques (Utilisateurs, Auth, Crédits, Tokens Shopify).
  - **MongoDB + Mongoose :** Données non structurées (Historique des générations IA, Logs, Contenu riche).
- **Intelligence Artificielle :** OpenAI API (GPT-5) + Claude (sonnet 4.5)
- **Frontend :** Next.js / React.
- **UX :** Shad/cn / tailwind

## 🧠 Justification des choix techniques

### **TypeScript**

TypeScript apporte une sécurité de typage.Il permet de réduire les erreurs, améliore la maintenabilité et permet un partage cohérent des modèles entre backend et frontend. Il offre une base plus fiable que JavaScript.

---

### **RabbitMQ**

RabbitMQ est utilisé comme broker de messages pour gérer les tâches longues (génération IA).
Il permet un traitement **asynchrone**, une bonne **scalabilité**, et une gestion propre des files d’attente et des _workers_ sans bloquer l’API principale.

---

### **Persistence Hybride : MongoDB + PostgreSQL**

- **PostgreSQL** : idéal pour les données critiques, structurées et relationnelles (authentification, crédits, intégrations Shopify…).
- **MongoDB** : parfait pour les données flexibles et volumineuses comme les contenus générés par l’IA.

Cette approche _polyglot persistence_ permet d’utiliser chaque base pour ce qu’elle fait le mieux et optimise performances + coût.

---

### **Next.js**

Next.js est choisi pour son écosystème moderne, son rendu serveur (SSR) et sa simplicité.
Next offre un excellent DX, un routage intégré et une intégration naturelle avec TypeScript et React.
Contrairement à Angular, Next est plus adapté pour notre projet car moins lourd et structurant pour un projet "simple".

---

### **GPT-5 et Claude (via API IA)**

L'application utilise GPT-5 et Claude Sonnet pour générer des descriptions produits riches et optimisées SEO.
Claude est meilleur dans la rédaction "humaine" et sera prévilégié pour les descriptions longues. Nous utiliserons GPT-5 pour les taches de mise en forme, et de rédaction plus courte (slugs, meta-titres, baslises alt) car moins cher.

---

### **Tailwind CSS & Shadcn/ui**

Tailwind permet un développement rapide avec des classes utilitaires, évitant la gestion de fichiers CSS séparés.
Shadcn/ui fournit des composants accessibles et personnalisables (pas une librairie, mais des templates copiables). Cette approche offre flexibilité et contrôle total sur le code, tout en accélérant le développement avec des composants modernes et bien conçus.

## 📁 Architecture

![Architecture Microservices](./docs/architecture.png)

Le projet utilise une architecture microservices avec :

- **Frontend** (port 3000) : Interface React/Next.js
- **API Gateway** (port 4000) : Point d'entrée unique pour router les requêtes
- **3 Microservices Backend** :
  - `/users` (port 5001) : Gestion utilisateurs avec PostgreSQL
  - `/generation` (port 5002) : Génération de contenu IA avec MongoDB
  - `/shop` (port 5003) : Gestion boutique avec PostgreSQL

Chaque service est indépendant, dockerisé, et communique via l'API Gateway.

## 🚀 Installation

Le projet comprend un script `setup.sh` à la racine du projet qui permet d'initialiser le projet et configurer les variables d'environnement.

```bash
chmod +x setup.sh
./setup.sh
```

Le script va :

- ✅ Créer le fichier `.env` à la racine (pour Docker Compose) depuis `env.example`
- ✅ Créer les fichiers `.env` pour chaque microservice
- ✅ Installer toutes les dépendances avec `pnpm`

**Note :** Les fichiers `.env` ne sont PAS versionnés (dans `.gitignore`). Seul `env.example` est commité comme template.

## 💻 Lancer le projet

### Option 1 : Avec Docker (Recommandé)

```bash
docker-compose up --build
```

Tous les services démarrent automatiquement avec hot-reload !

### Option 2 : En local (développement)

Ouvrir plusieurs terminaux :

**Terminal 1 - API Gateway (port 4000)**

```bash
cd backend/api-gateway && pnpm dev
```

**Terminal 2 - Users API (port 5001)**

```bash
cd backend/users-api && pnpm dev
```

**Terminal 3 - Generations API (port 5002)**

```bash
cd backend/generations-api && pnpm dev
```

**Terminal 4 - Shop API (port 5003)**

```bash
cd backend/shop-api && pnpm dev
```

**Terminal 5 - Frontend (port 3000)**

```bash
cd frontend && pnpm dev
```

## 📍 Routes disponibles

### Via API Gateway (http://localhost:4000)

- `GET /api/` - Status du gateway
- `GET /api/generation/*` - Proxy vers Generations API
- `GET /api/users/*` - Proxy vers Users API
- `GET /api/shop/*` - Proxy vers Shop API

### Users API (http://localhost:5001)

- Gestion des utilisateurs, authentification
- Base de données : PostgreSQL

### Generations API (http://localhost:5002)

- Génération de contenu IA
- Base de données : MongoDB

### Shop API (http://localhost:5003)

- Gestion des boutiques et intégrations
- Base de données : PostgreSQL

## 🧪 Tester

```bash
# Via le gateway
curl http://localhost:4000/api/users/
curl http://localhost:4000/api/generation/
curl http://localhost:4000/api/shop/

# Directement les microservices
curl http://localhost:5001/
curl http://localhost:5002/
curl http://localhost:5003/
```

## 🗄️ Bases de données

### MongoDB (Generations)

**Avec MongoDB Compass :**

1. Téléchargez [MongoDB Compass](https://www.mongodb.com/try/download/compass)
2. Connectez-vous à : `mongodb://localhost:27017`
3. Accédez à la base `generations-db`

**Avec CLI :**

```bash
mongosh mongodb://localhost:27017/generations-db
```

### PostgreSQL (Users & Shop)

**Connexion :**

```bash
psql -h localhost -U postgres -d users_db
psql -h localhost -U postgres -d shop_db
```

**Migrations Prisma :**

```bash
cd backend/users-api && pnpm prisma migrate dev
cd backend/shop-api && pnpm prisma migrate dev
```

## 🔧 Configuration

Les variables d'environnement sont dans les fichiers `.env` de chaque service.
Des fichiers `.env.example` sont fournis comme templates.

### Variables importantes :

- `PORT` - Port d'écoute du service
- `DATABASE_URL` - URI PostgreSQL (Users & Shop)
- `MONGO_URI` - URI MongoDB (Generations)
- `USERS_API_URL` - URL de l'API Users (pour le gateway)
- `GENERATIONS_API_URL` - URL de l'API Generations (pour le gateway)
- `SHOP_API_URL` - URL de l'API Shop (pour le gateway)

## 📝 Notes

- En **Docker** : Les services utilisent les noms de conteneurs (`http://generations-api:5002`)
- En **local** : Les services utilisent `localhost` (`http://localhost:5002`)
- Le script `setup.sh` configure automatiquement les `.env` pour Docker
