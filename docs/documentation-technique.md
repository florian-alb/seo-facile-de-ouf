# Document Technique - EasySeo

**Plateforme SaaS d'automatisation SEO pour E-commerce**

Albora Florian - Fravalo Killian | Ynov Toulouse 2026-2027

---

## Table des matières

- [1. Introduction](#1-introduction)
  - [1.1 Présentation du projet](#11-présentation-du-projet)
  - [1.2 Contexte et problématique](#12-contexte-et-problématique)
  - [1.3 Objectifs](#13-objectifs)
  - [1.4 Public cible](#14-public-cible)
- [2. Analyse du besoin](#2-analyse-du-besoin)
  - [2.1 Problèmes des e-commerçants](#21-problèmes-des-e-commerçants)
  - [2.2 Étude de la concurrence](#22-étude-de-la-concurrence)
  - [2.3 Valeur ajoutée d'EasySeo](#23-valeur-ajoutée-deasyseo)
  - [2.4 Cas d'usage principaux](#24-cas-dusage-principaux)
- [3. Architecture globale](#3-architecture-globale)
  - [3.1 Vue d'ensemble](#31-vue-densemble)
  - [3.2 Pourquoi des microservices ?](#32-pourquoi-des-microservices-)
  - [3.3 Le rôle de l'API Gateway](#33-le-rôle-de-lapi-gateway)
  - [3.4 Communication synchrone vs asynchrone](#34-communication-synchrone-vs-asynchrone)
  - [3.5 Diagramme d'architecture](#35-diagramme-darchitecture)
- [4. Stack technique](#4-stack-technique)
  - [4.1 TypeScript partout](#41-typescript-partout)
  - [4.2 Backend - Node.js et Express](#42-backend---nodejs-et-express)
  - [4.3 Frontend - Next.js et React](#43-frontend---nextjs-et-react)
  - [4.4 Bases de données](#44-bases-de-données)
  - [4.5 RabbitMQ - le broker de messages](#45-rabbitmq---le-broker-de-messages)
  - [4.6 Intelligence Artificielle](#46-intelligence-artificielle)
  - [4.7 UI/UX - Tailwind et Shadcn/ui](#47-uiux---tailwind-et-shadcnui)
  - [4.8 Docker et pnpm](#48-docker-et-pnpm)
- [5. Architecture Backend détaillée](#5-architecture-backend-détaillée)
  - [5.1 API Gateway](#51-api-gateway)
  - [5.2 Microservice Users](#52-microservice-users)
  - [5.3 Microservice Generations](#53-microservice-generations)
  - [5.4 Microservice Shop](#54-microservice-shop)
  - [5.5 Worker](#55-worker)
- [6. Gestion des données](#6-gestion-des-données)
  - [6.1 PostgreSQL - Users](#61-postgresql---users)
  - [6.2 PostgreSQL - Shop](#62-postgresql---shop)
  - [6.3 MongoDB - Generations](#63-mongodb---generations)
- [7. Frontend et expérience utilisateur](#7-frontend-et-expérience-utilisateur)
  - [7.1 Pages et parcours utilisateur](#71-pages-et-parcours-utilisateur)
  - [7.2 Gestion des états et appels API](#72-gestion-des-états-et-appels-api)
  - [7.3 Sécurité côté client](#73-sécurité-côté-client)
- [8. Intelligence Artificielle - en détail](#8-intelligence-artificielle---en-détail)
  - [8.1 Pipeline de génération](#81-pipeline-de-génération)
  - [8.2 Prompt engineering](#82-prompt-engineering)
  - [8.3 Types de génération](#83-types-de-génération)
  - [8.4 Gestion des erreurs et retries](#84-gestion-des-erreurs-et-retries)
- [9. Authentification et sécurité](#9-authentification-et-sécurité)
  - [9.1 Better Auth](#91-better-auth)
  - [9.2 Flux d'authentification](#92-flux-dauthentification)
  - [9.3 Chiffrement des données sensibles](#93-chiffrement-des-données-sensibles)
  - [9.4 Sécurité inter-services](#94-sécurité-inter-services)
- [10. Déploiement et environnement](#10-déploiement-et-environnement)
  - [10.1 Environnement local](#101-environnement-local)
  - [10.2 Docker Compose](#102-docker-compose)
  - [10.3 Variables d'environnement](#103-variables-denvironnement)
- [11. Endpoints API](#11-endpoints-api)

---

## 1. Introduction

### 1.1 Présentation du projet

EasySeo est une plateforme SaaS B2B qui aide les e-commerçants à générer du contenu SEO optimisé pour leurs produits et collections, le tout en quelques secondes grâce à l'Intelligence Artificielle.

Concrètement, au lieu de passer des heures à écrire des descriptions produits à la main, un commerçant connecte sa boutique Shopify à EasySeo, et l'IA lui génère des descriptions, des meta-titres, des meta-descriptions et des slugs optimisés pour le référencement Google.

### 1.2 Contexte et problématique

Le marché e-commerce est de plus en plus concurrentiel. Les prix de la publicité en ligne (Google Ads, Facebook Ads) augmentent constamment, ce qui pousse les boutiques en ligne à miser davantage sur le SEO (référencement naturel) pour être visibles.

Le problème, c'est que le SEO demande des compétences techniques et rédactionnelles que beaucoup de marchands n'ont pas. Rédiger une fiche produit optimisée prend entre 20 et 60 minutes. Pour une boutique avec des centaines de produits, ça représente des semaines de travail.

EasySeo répond à ce besoin en automatisant la génération de contenu SEO via l'IA.

### 1.3 Objectifs

**Fonctionnels :**

- Permettre la génération automatique de descriptions produits SEO
- Supporter la génération en masse (bulk) pour des dizaines/centaines de produits
- Offrir un suivi en temps réel de l'avancement des générations
- Permettre la publication directe vers Shopify
- Gérer un historique complet des générations

**Techniques :**

- Architecture scalable pour absorber les pics de charge
- Traitement asynchrone pour ne pas bloquer l'interface
- Support de plusieurs modèles d'IA (OpenAI, Anthropic)
- Sécurisation des données et des échanges

### 1.4 Public cible

EasySeo vise principalement les e-commerçants utilisant Shopify. Le but est qu'un gérant de boutique puisse générer son contenu SEO sans aucune connaissance technique, juste en sélectionnant ses produits et en cliquant sur "Générer".

---

## 2. Analyse du besoin

### 2.1 Problèmes des e-commerçants

Les marchands en ligne font face à plusieurs défis :

- **Le temps** : rédiger une fiche produit prend 20-60 minutes. Pour 200 produits, ça fait facilement un mois de travail à temps plein.
- **Le SEO** : sans optimisation sémantique, une boutique est invisible sur Google. Et maîtriser le SEO demande des compétences spécifiques.
- **La répétitivité** : écrire des descriptions uniques pour chaque produit est fastidieux et les marchands finissent souvent par copier-coller, ce qui est pénalisé par Google.

### 2.2 Étude de la concurrence

| Concurrent     | Points forts                                                                | Limites                                                          |
| -------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| **Describely** | Génération de descriptions, meta-titres et tags SEO à grande échelle        | Pas d'historique centralisé, pas de workflow personnalisé        |
| **Kaatalog**   | Fiches produits SEO, scraping concurrents, import automatique de catalogues | Orienté quantité plutôt que qualité, pas de pipeline IA complexe |
| **Shopifast**  | Boilerplate Shopify, en cours de développement                              | Pas d'intégration avec Shopify                                   |

### 2.3 Valeur ajoutée d'EasySeo

Ce qui différencie EasySeo :

- **Multi-IA** : utilisation de GPT-4o et Claude selon le type de contenu, pour optimiser le rapport qualité/prix
- **Pipeline asynchrone** : génération parallèle grâce à RabbitMQ, avec suivi en temps réel via SSE
- **Interface simple** : pensée pour des non-techniciens, pas besoin de comprendre le SEO pour l'utiliser
- **Historique complet** : chaque génération est sauvegardée et consultable
- **Intégration directe** : connexion Shopify et publication en un clic

### 2.4 Cas d'usage principaux

**Cas 1 - Génération unitaire :**
Un marchand veut optimiser un produit spécifique. Il se connecte, sélectionne le produit, clique sur "Générer" sur le champ voulu (description, meta-titre...). En quelques secondes, le contenu SEO est prêt et peut être publié sur Shopify.

**Cas 2 - Génération en masse :**
Le marchand a une nouvelle collection de 50 produits. Il sélectionne la collection, définit les règles globales (langue, ton, longueur) dans les paramètres du store, puis lance la génération bulk. RabbitMQ distribue les jobs en parallèle sur 3 workers, et en quelques minutes tout est généré.

---

## 3. Architecture globale

### 3.1 Vue d'ensemble

EasySeo utilise une architecture microservices orientée événements. Au lieu d'avoir un seul gros serveur qui fait tout, on a plusieurs petits services spécialisés qui communiquent entre eux.

Le système est composé de :

| Composant                 | Rôle                                                 |
| ------------------------- | ---------------------------------------------------- |
| **Frontend** (Next.js)    | Interface utilisateur, dashboard                     |
| **API Gateway** (Express) | Point d'entrée unique, routage vers les services     |
| **Users API**             | Authentification, gestion des utilisateurs           |
| **Shop API**              | Gestion des boutiques Shopify, produits, collections |
| **Generations API**       | Gestion des jobs de génération IA                    |
| **Worker** (x3 replicas)  | Traitement asynchrone des générations via IA         |
| **RabbitMQ**              | Broker de messages pour les jobs asynchrones         |
| **PostgreSQL**            | Données relationnelles (users, shops)                |
| **MongoDB**               | Données de génération (jobs, contenus)               |

### 3.2 Pourquoi des microservices ?

EasySeo n'est pas une simple application CRUD. On doit gérer des tâches longues (appels IA qui peuvent prendre plusieurs secondes), des pics de charge (un marchand qui lance 200 générations d'un coup) et des domaines métier bien distincts.

L'architecture microservices nous apporte :

- **Séparation des responsabilités** : chaque service gère son domaine (users, shops, generations). Le code est plus lisible et plus facile à maintenir.
- **Scalabilité indépendante** : si la génération IA est surchargée, on peut augmenter le nombre de workers sans toucher au reste. Dans le `docker-compose.yml`, le worker est configuré avec 3 replicas par défaut.
- **Résilience** : si le service de génération tombe, l'authentification et la gestion des boutiques continuent de fonctionner normalement.
- **Évolutivité** : on peut facilement ajouter un nouveau service (ex: analytics, facturation) sans impacter l'existant.

### 3.3 Le rôle de l'API Gateway

L'API Gateway est le seul point d'entrée pour le frontend. Le frontend ne parle jamais directement aux microservices, tout passe par la Gateway.

Ça nous donne :

- **Une seule URL** à connaître côté frontend (`http://localhost:4000`)
- **L'abstraction** de l'architecture interne : si on déplace un service sur un autre port, le frontend n'en sait rien
- **La centralisation** de l'authentification et du routage

La Gateway utilise `http-proxy-middleware` pour rediriger les requêtes. Concrètement, quand le frontend fait un appel à `/stores/xxx`, la Gateway le redirige vers le Shop API sur le port 5003.

### 3.4 Communication synchrone vs asynchrone

On utilise deux types de communication selon le besoin :

**Synchrone (HTTP)** - pour les opérations rapides :

- Authentification
- Lecture des produits/collections
- Mise à jour des paramètres du store
- Déclenchement d'une génération

**Asynchrone (RabbitMQ + SSE)** - pour les opérations longues :

- Génération de contenu IA (peut prendre plusieurs secondes)
- Génération en masse (bulk)

Le flux asynchrone fonctionne comme ceci :

```
1. Le frontend POST /generations/generate
2. L'API crée un job en MongoDB (status: "pending") et le publie dans RabbitMQ
3. L'API répond immédiatement avec le jobId (HTTP 202)
4. Le frontend ouvre une connexion SSE sur /generations/job/{id}/stream
5. Un worker consomme le job depuis RabbitMQ
6. Le worker appelle l'API OpenAI/Anthropic
7. Le worker met à jour le job en MongoDB (status: "completed")
8. Le MongoDB Change Stream détecte la mise à jour
9. L'événement est envoyé au frontend via SSE
10. Le frontend affiche le résultat en temps réel
```

> IMAGE-ICI : Schéma du flux asynchrone de génération montrant les étapes 1 à 10 ci-dessus, avec les flèches entre Frontend, API Gateway, Generations API, RabbitMQ, Worker, MongoDB et les APIs d'IA

L'avantage principal : l'API n'est jamais bloquée. Même si la génération prend 30 secondes, le frontend reste réactif et l'utilisateur voit l'avancement en temps réel.

### 3.5 Diagramme d'architecture

![Architecture globale](architecture.png)

Le schéma montre le frontend qui communique uniquement avec l'API Gateway, qui redirige vers les 3 microservices (Users, Shop, Generations). Le service Generations publie dans RabbitMQ, consommé par les workers qui mettent à jour MongoDB.

---

## 4. Stack technique

### 4.1 TypeScript partout

Tout le projet est en TypeScript, du frontend au backend en passant par le worker. Ça nous apporte :

- Le **typage statique** qui réduit les bugs à l'exécution
- Le **partage de types** entre front et back via le package `shared` du monorepo
- Une **meilleure autocomplétion** dans l'IDE, ce qui accélère le dev

Par exemple, les types de génération (`GenerationFieldType`, `GenerationStatus`, `GenerationContent`) sont définis dans `shared/src/generation.ts` et utilisés aussi bien par le frontend que par le backend.

### 4.2 Backend - Node.js et Express

- **Node.js** : moteur JavaScript côté serveur, idéal pour les applications avec beaucoup d'I/O asynchrone (appels API, requêtes BDD)
- **Express 5.1** : framework web léger pour créer des API REST. On l'utilise pour chaque microservice

Le pattern suivi dans chaque service est toujours le même :

```
routes → controllers → services → base de données
```

C'est un pattern classique qui garde le code organisé et facile à comprendre.

### 4.3 Frontend - Next.js et React

- **Next.js 16** avec l'App Router et React 19
- **SSR** (Server-Side Rendering) pour les pages critiques
- **Routing basé sur les fichiers** (`app/dashboard/store/[storeId]/products/[productId]/page.tsx`)

Les hooks custom dans `frontend/hooks/` encapsulent toute la logique de fetch et de gestion d'état. Par exemple, `useFieldGeneration` gère tout le flux SSE de génération IA.

### 4.4 Bases de données

On utilise 2 types de bases de données selon les besoins :

**PostgreSQL** (2 instances) :

- `users_db` : utilisateurs, sessions, comptes OAuth. Données relationnelles classiques.
- `seo_facile_shops` : boutiques, paramètres, collections, produits Shopify. Beaucoup de relations (un store a des produits, des collections, des settings...).
- Géré via **Prisma 7.0** qui nous donne un ORM typé et des migrations automatiques.

**MongoDB** (1 instance en Replica Set) :

- `generations-db` : jobs de génération IA, contenus générés, historique.
- Les documents de génération contiennent des objets imbriqués (contenu, contexte produit, settings du store) avec un schéma flexible.
- Le **Replica Set** est obligatoire car on utilise les **Change Streams** pour le SSE en temps réel. Sans replica set, les Change Streams ne fonctionnent pas.
- Géré via **Mongoose 9.0**.

### 4.5 RabbitMQ - le broker de messages

RabbitMQ sert de file d'attente entre l'API Generations et les workers.

Fonctionnement :

1. Quand un utilisateur demande une génération, l'API publie un message dans la queue `ai-generation-jobs`
2. Les workers (3 replicas) écoutent cette queue et traitent les messages un par un (`prefetch: 1`)
3. Si un worker plante, le message retourne dans la queue et est repris par un autre worker

La queue est configurée comme **durable**, ce qui signifie que les messages survivent à un redémarrage de RabbitMQ.

### 4.6 Intelligence Artificielle

EasySeo intègre actuellement **OpenAI GPT-4o** pour toutes les générations :

- **Descriptions produit** : génération de texte HTML riche et optimisé SEO
- **Meta-tags** (titre + description + slug) : génération en JSON structuré
- **Descriptions de collections** : adapté au contexte des collections Shopify

Le système est conçu pour supporter **plusieurs fournisseurs d'IA**. L'intégration de **Claude (Anthropic)** est prévue pour les contenus longs nécessitant un ton plus naturel et une meilleure qualité rédactionnelle.

Chaque appel IA reçoit le contexte complet : informations produit (titre, tags, prix, vendeur), paramètres du store (niche, langue, persona client, nombre de mots souhaité) et les mots-clés fournis par l'utilisateur.

### 4.7 UI/UX - Tailwind et Shadcn/ui

- **Tailwind CSS 4** : classes utilitaires directement dans le JSX, pas de fichiers CSS à gérer
- **Shadcn/ui** : composants accessibles et personnalisables, basés sur Radix. On les copie dans le projet et on les adapte, ce qui donne un contrôle total sur le style
- **Tiptap 3** : éditeur de texte riche pour les descriptions produit
- **@tanstack/react-table** : tables de données pour les listes de produits/collections
- **Recharts** : graphiques pour le dashboard
- **next-themes** : dark/light mode
- **Sonner** : notifications toast
- **Lucide React** : icônes

> IMAGE-ICI : Capture d'écran du dashboard principal montrant la sidebar avec les boutiques, la liste des collections avec le tableau (nom, nombre de produits, statut, bouton générer)

### 4.8 Docker et pnpm

**Docker** :

- Chaque service a son propre `Dockerfile` et tourne dans un conteneur isolé
- `docker-compose.yml` orchestre tout : les 6 services applicatifs + les 4 services d'infrastructure
- Le worker est configuré avec `deploy.replicas: 3` pour le scaling horizontal

**pnpm** :

- Gestionnaire de paquets avec support des workspaces
- Structure monorepo : `backend/*`, `frontend`, `shared`
- Le package `shared` est référencé par les autres workspaces via `@seo-facile-de-ouf/shared`

---

## 5. Architecture Backend détaillée

### 5.1 API Gateway

**Port** : 4000

L'API Gateway est un simple reverse proxy. Elle ne contient aucune logique métier, juste du routage et de la sécurité.

**Table de routage :**

| Route             | Service cible          | Auth requise |
| ----------------- | ---------------------- | ------------ |
| `/api/auth/*`     | Users API (5001)       | Non          |
| `/auth/*`         | Users API (5001)       | Non          |
| `/users/*`        | Users API (5001)       | Oui          |
| `/stores/*`       | Shop API (5003)        | Oui          |
| `/shopify/auth/*` | Shop API (5003)        | Non          |
| `/shops/*`        | Shop API (5003)        | Oui          |
| `/generations/*`  | Generations API (5002) | Oui          |

Pour les routes avec auth requise, la Gateway vérifie le token JWT de l'utilisateur (via Better Auth) avant de proxy la requête vers le service.

La Gateway utilise `http-proxy-middleware` pour le proxy. Elle ajoute un header `X-Gateway-Secret` à chaque requête proxifiée, que les microservices vérifient pour s'assurer que la requête vient bien de la Gateway et non d'un appel direct.

### 5.2 Microservice Users

**Port** : 5001 | **BDD** : PostgreSQL (`users_db`)

Ce service gère tout ce qui touche aux utilisateurs :

- Inscription et connexion (email/password + OAuth)
- Sessions utilisateur
- Comptes liés (GitHub, Google, Roblox)

L'authentification repose sur **Better Auth**, qui gère :

- Le hachage des mots de passe
- La création et validation des JWT
- Les sessions avec IP et user agent
- L'intégration OAuth avec les providers sociaux

Le schéma Prisma définit 5 tables : `user`, `session`, `account`, `verification` et `jwks` (stockage des clés JWT).

### 5.3 Microservice Generations

**Port** : 5002 | **BDD** : MongoDB (`generations-db`)

C'est le cœur du système. Ce service :

- Reçoit les demandes de génération via l'API REST
- Crée un document en MongoDB avec le status `pending`
- Publie un message dans la queue RabbitMQ `ai-generation-jobs`
- Expose un endpoint SSE pour le suivi en temps réel
- Fournit l'historique des générations

**Endpoints principaux :**

```
POST   /generate              → Créer un job de génération (répond 202)
POST   /generate/bulk         → Génération en masse (max 50 items)
GET    /job/:id/stream        → Stream SSE en temps réel
GET    /job/:id               → Status d'un job
GET    /                      → Toutes les générations de l'utilisateur
GET    /product/:productId    → Historique d'un produit
GET    /collection/:collectionId → Historique d'une collection
GET    /jobs                  → Liste filtrable (par shop, status, etc.)
```

**Le SSE (Server-Sent Events)** fonctionne grâce aux MongoDB Change Streams :

- Quand le frontend ouvre une connexion SSE, l'API crée un watcher sur le document MongoDB
- Dès que le worker met à jour le document (status, contenu...), le Change Stream détecte le changement
- L'API envoie l'événement au frontend via la connexion SSE ouverte

C'est ce mécanisme qui permet à l'utilisateur de voir le résultat apparaître en temps réel sans rafraîchir la page.

### 5.4 Microservice Shop

**Port** : 5003 | **BDD** : PostgreSQL (`seo_facile_shops`)

Ce service gère :

- Les boutiques Shopify (ajout, modification, suppression)
- La synchronisation des produits et collections depuis Shopify
- Les paramètres SEO de chaque boutique
- La publication des modifications vers Shopify

**Connexion Shopify :**
L'utilisateur fournit ses identifiants API Shopify (Client ID et Client Secret) qui sont **chiffrés en AES-256-GCM** avant d'être stockés en base. Le service utilise l'API GraphQL de Shopify pour synchroniser les produits et collections.

**Store Settings :**
Chaque boutique a des paramètres SEO personnalisables :

- Mot-clé de niche et description de niche
- Langue de génération
- Nombre de mots souhaité (produits et collections séparément)
- Persona client (description du client type)

Ces paramètres sont envoyés à l'IA avec chaque demande de génération pour personnaliser le contenu.

### 5.5 Worker

**Replicas** : 3 | **BDD** : MongoDB (même instance que Generations API)

Le worker est un processus indépendant qui :

1. Se connecte à MongoDB et RabbitMQ au démarrage
2. Écoute la queue `ai-generation-jobs` avec un `prefetch` de 1 (traite un seul job à la fois par worker)
3. Pour chaque message : récupère le job en MongoDB, le passe en `processing`, appelle l'API OpenAI, puis met à jour le document avec le résultat

**Gestion des erreurs :**

- Si un appel IA échoue, le worker retente jusqu'à 3 fois avec un **backoff exponentiel** (le temps entre chaque retry augmente)
- Si après 3 tentatives ça échoue toujours, le job passe en status `failed` avec le message d'erreur
- Le `retryCount` est stocké dans le document MongoDB pour le suivi

**Types de génération supportés :**

| Type               | Ce que ça génère                                        |
| ------------------ | ------------------------------------------------------- |
| `description`      | Description HTML du produit/collection                  |
| `seoTitle`         | Meta-titre optimisé SEO                                 |
| `seoDescription`   | Meta-description optimisé SEO                           |
| `full_description` | Description + meta-titre + meta-description + slug      |
| `meta_only`        | Meta-titre + meta-description + slug (sans description) |
| `slug_only`        | Uniquement le slug URL                                  |

Pour les types combinés (`full_description`), le worker lance les générations en parallèle (description + meta) puis assemble les résultats.

---

## 6. Gestion des données

### 6.1 PostgreSQL - Users

> IMAGE-ICI : Schéma de la base de données Users (reproduire le diagramme dbdiagram.io du PDF avec les tables user, session, account, verification, jwks et leurs relations)

**Table `user`** :
| Champ | Type | Description |
|---|---|---|
| id | uuid (PK) | Identifiant unique |
| name | varchar | Nom de l'utilisateur |
| email | varchar (unique, NN) | Email |
| generationIds | text[] | IDs des générations liées |
| createdAt | timestamp | Date de création |
| emailVerified | boolean | Email vérifié ou non |
| image | varchar | URL avatar |
| updatedAt | timestamp | Dernière modification |

**Table `session`** :
| Champ | Type | Description |
|---|---|---|
| id | uuid (PK) | Identifiant unique |
| expiresAt | timestamp | Date d'expiration |
| token | varchar (unique, NN) | Token de session |
| ipAddress | varchar | IP de connexion |
| userAgent | varchar | Navigateur utilisé |
| userId | uuid (FK → user) | Utilisateur lié |

**Table `account`** :
Stocke les comptes OAuth (GitHub, Google, Roblox). Chaque provider crée une entrée avec `providerId`, `accountId`, les tokens d'accès et de refresh.

**Table `jwks`** :
Stocke les clés publiques/privées pour la signature JWT (utilisées par Better Auth).

**Table `verification`** :
Stocke les tokens de vérification email avec une date d'expiration.

### 6.2 PostgreSQL - Shop

> IMAGE-ICI : Schéma de la base de données Shop (reproduire le diagramme dbdiagram.io du PDF avec les tables store, store_settings, shopify_collection, shopify_product et leurs relations)

**Table `store`** :
| Champ | Type | Description |
|---|---|---|
| id | uuid (PK) | Identifiant unique |
| userId | uuid (NN) | Propriétaire du store |
| name | varchar (NN) | Nom de la boutique |
| url | varchar (NN) | URL du site |
| shopifyDomain | varchar (unique, NN) | Domaine Shopify (xxx.myshopify.com) |
| language | varchar | Langue par défaut |
| status | varchar | Statut de connexion |
| clientId | varchar (NN) | Client ID Shopify (chiffré) |
| clientSecret | varchar (NN) | Client Secret Shopify (chiffré) |
| accessToken | text | Token d'accès Shopify (chiffré) |
| tokenExpiresAt | timestamp | Expiration du token |
| lastSyncedAt | timestamp | Dernière synchronisation |

**Table `store_settings`** :
| Champ | Type | Description |
|---|---|---|
| id | uuid (PK) | Identifiant unique |
| storeId | uuid (unique, FK) | Store lié |
| nicheKeyword | varchar | Mot-clé de niche (ex: "puzzle en bois") |
| nicheDescription | text | Description de la niche |
| language | varchar | Langue pour la génération |
| collectionWordCount | int | Nombre de mots pour les collections |
| productWordCount | int | Nombre de mots pour les produits |
| customerPersona | text | Description du client cible |

**Table `shopify_collection`** :
Stocke les collections synchronisées depuis Shopify avec les champs SEO (seoTitle, seoDescription) et les métadonnées (image, nombre de produits, etc.).

**Table `shopify_product`** :
Stocke les produits avec toutes les infos Shopify (titre, prix, vendor, tags, images) et les champs SEO éditables.

### 6.3 MongoDB - Generations

> IMAGE-ICI : Schéma du document MongoDB Generation (reproduire le diagramme du PDF montrant la structure avec les objets imbriqués content, storeSettings, productContext)

Un document de génération ressemble à ça :

```json
{
  "_id": "ObjectId",
  "entityType": "product",
  "productId": "uuid-du-produit",
  "productName": "Puzzle 3D Voiture",
  "keywords": ["puzzle", "3D", "voiture", "jouet"],
  "fieldType": "full_description",
  "status": "completed",
  "content": {
    "title": "Puzzle 3D Voiture - Jouet éducatif...",
    "description": "<p>Découvrez notre puzzle 3D...</p>",
    "metaTitle": "Puzzle 3D Voiture | Jouet Éducatif",
    "metaDescription": "Explorez notre puzzle 3D voiture...",
    "slug": "puzzle-3d-voiture-jouet-educatif"
  },
  "storeSettings": {
    "nicheKeyword": "puzzles et maquettes",
    "nicheDescription": "Boutique spécialisée...",
    "language": "fr",
    "productWordCount": 200,
    "customerPersona": "Parents de 25-45 ans..."
  },
  "productContext": {
    "title": "Puzzle 3D Voiture",
    "tags": ["puzzle", "3D", "voiture"],
    "vendor": "PuzzleCorp",
    "productType": "Jouet",
    "price": 29.99,
    "currentDescription": "Un puzzle en 3D..."
  },
  "retryCount": 0,
  "userId": "uuid-de-l-utilisateur",
  "shopId": "uuid-du-store",
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-01-15T10:30:05Z",
  "completedAt": "2026-01-15T10:30:05Z"
}
```

Les **index** sont définis sur :

- `status + createdAt` : pour lister les jobs par statut
- `userId + shopId` : pour filtrer par utilisateur et boutique
- `productId + userId + createdAt` : pour l'historique produit
- `collectionId + userId + createdAt` : pour l'historique collection

---

## 7. Frontend et expérience utilisateur

### 7.1 Pages et parcours utilisateur

Le parcours est volontairement simple et linéaire :

**1. Authentification**

L'utilisateur peut s'inscrire/se connecter via :

- Email + mot de passe classique
- OAuth : GitHub, Google

> IMAGE-ICI : Capture de la page de création de compte montrant le formulaire (Name, Email, Password, Confirm Password) avec les boutons OAuth (GitHub, Google) en bas

**2. Dashboard principal**

C'est la vue centrale. La sidebar à gauche liste les boutiques connectées avec leurs sections (Collections, Produits). Le contenu principal affiche les tableaux de données.

> IMAGE-ICI : Capture du dashboard principal montrant la sidebar avec la boutique "Maketo" déployée (Collections, Produits), le tableau des collections avec colonnes (Nom, Nombre de produits, Statut, Action rapide)

**3. Ajout d'une boutique**

Un dialog permet de connecter une boutique Shopify en renseignant :

- Nom et URL de la boutique
- Domaine Shopify (xxx.myshopify.com)
- Langue
- Client ID et Client Secret / Access Token Shopify

> IMAGE-ICI : Capture du dialog "Ajouter une boutique" avec les champs de formulaire (nom, URL, domaine Shopify, langue, Client ID, Client Secret)

**4. Page produit / collection**

Chaque produit ou collection a sa page de détail avec :

- Un formulaire d'édition (description, meta-titre, meta-description, slug)
- Des boutons "Générer" sur chaque champ pour lancer l'IA
- Un indicateur de chargement pendant la génération
- Un compteur de mots/caractères
- Un bouton "Publier sur Shopify" pour pousser les modifications

> IMAGE-ICI : Capture de la page de détail d'un produit montrant les champs éditables avec les boutons "Générer" et l'éditeur de texte riche Tiptap pour la description

**5. Historique des générations**

Chaque produit/collection dispose d'un onglet historique qui liste toutes les générations passées avec leur date, statut et contenu.

> IMAGE-ICI : Capture de l'onglet historique montrant la liste des générations passées avec date, type et statut

**6. Paramètres du store**

La page settings permet de configurer les paramètres SEO globaux du store (niche, langue, persona client, nombre de mots). Ces paramètres sont envoyés à l'IA pour personnaliser les générations.

> IMAGE-ICI : Capture de la page paramètres du store montrant les champs de configuration SEO (niche, description, langue, nombre de mots, persona)

### 7.2 Gestion des états et appels API

Le frontend utilise des **hooks custom** pour toute la logique métier :

| Hook                                          | Rôle                            |
| --------------------------------------------- | ------------------------------- |
| `useShopifyProducts(storeId)`                 | Liste des produits, sync        |
| `useShopifyCollections(storeId)`              | Liste des collections, sync     |
| `useShopifyProduct(storeId, productId)`       | CRUD + publish d'un produit     |
| `useShopifyCollection(storeId, collectionId)` | CRUD + publish d'une collection |
| `useStoreSettings(storeId)`                   | Lecture/écriture des paramètres |
| `useFieldGeneration(storeId)`                 | Génération IA avec SSE          |
| `useGenerationHistory(...)`                   | Historique des générations      |

Tous les appels API passent par `apiFetch()` dans `frontend/lib/api.ts`, qui :

- Ajoute automatiquement les credentials (cookies) pour l'auth
- Définit le `Content-Type: application/json`
- Gère les erreurs avec une classe `ApiError` (code + message)

Le hook `useFieldGeneration` est le plus complexe. Il gère un état par type de champ (description, seoTitle, seoDescription), avec pour chaque champ : le jobId, le status, le résultat et l'erreur éventuelle. Quand on lance une génération, il POST la requête, ouvre une connexion SSE, écoute les mises à jour et ferme la connexion quand le job est terminé ou en erreur.

### 7.3 Sécurité côté client

- Les tokens d'auth sont stockés dans des **cookies HTTP-only** gérés par Better Auth (pas accessibles en JavaScript)
- Les routes du dashboard sont protégées : si l'utilisateur n'est pas connecté, il est redirigé vers la page de login
- **Aucune clé API** n'est exposée côté client. Toutes les requêtes IA passent par le backend
- Les erreurs backend sont interceptées et affichées sous forme de messages lisibles (pas de stack traces)

---

## 8. Intelligence Artificielle - en détail

### 8.1 Pipeline de génération

Voici le flux complet quand un utilisateur clique sur "Générer" :

```
[Frontend]  POST /generations/generate
               ↓
[Generations API]  Crée le document MongoDB (status: pending)
                   Publie dans RabbitMQ
                   Répond HTTP 202 + jobId
               ↓
[Frontend]  Ouvre EventSource sur /generations/job/{jobId}/stream
               ↓
[RabbitMQ]  Le message attend dans la queue "ai-generation-jobs"
               ↓
[Worker]    Consomme le message
            Récupère le job en MongoDB
            Met à jour le status → "processing"
               ↓
[Worker]    Appelle l'API OpenAI (GPT-4o)
            - Envoie le prompt avec le contexte complet
            - Reçoit le contenu généré
               ↓
[Worker]    Met à jour MongoDB (status: "completed", content: {...})
               ↓
[MongoDB Change Stream]  Détecte la modification
               ↓
[Generations API]  Envoie l'événement SSE au frontend
               ↓
[Frontend]  Reçoit le résultat, ferme la connexion SSE
            Affiche le contenu généré dans le formulaire
```

### 8.2 Prompt engineering

Chaque appel IA est construit avec un contexte riche pour obtenir des résultats pertinents. Le prompt inclut :

- **Les informations produit** : titre, tags, vendeur, type de produit, prix, description actuelle
- **Les paramètres du store** : mot-clé de niche, description de la niche, persona client, nombre de mots souhaité
- **Les mots-clés** fournis par l'utilisateur
- **La langue** cible

Pour les **descriptions** (format HTML), le prompt demande un texte riche, structuré avec des balises HTML, optimisé pour le SEO avec les mots-clés fournis.

Pour les **meta-tags** (format JSON), le prompt demande un objet JSON structuré avec `metaTitle`, `metaDescription` et `slug`, et OpenAI est configuré avec `response_format: "json_object"` pour garantir un JSON valide en sortie.

Les langues supportées sont : français, anglais, espagnol, allemand et italien.

### 8.3 Types de génération

Le système supporte 6 types de génération, adaptés aux différents besoins :

| Type               | Cible                 | Ce qui est généré                          |
| ------------------ | --------------------- | ------------------------------------------ |
| `description`      | Produit ou Collection | Description HTML complète                  |
| `seoTitle`         | Produit ou Collection | Meta-titre (< 60 caractères)               |
| `seoDescription`   | Produit ou Collection | Meta-description (< 160 caractères)        |
| `full_description` | Produit ou Collection | Description + meta + slug (tout d'un coup) |
| `meta_only`        | Produit ou Collection | Meta-titre + meta-description + slug       |
| `slug_only`        | Produit ou Collection | Uniquement le slug URL optimisé            |

Pour `full_description`, le worker lance en parallèle la génération de la description et des meta-tags, puis assemble les résultats. Ça permet de gagner du temps par rapport à 3 appels séquentiels.

### 8.4 Gestion des erreurs et retries

Si un appel IA échoue (timeout, erreur API, etc.) :

1. Le worker **retente automatiquement** jusqu'à 3 fois
2. Le temps d'attente entre chaque retry **augmente exponentiellement** (backoff exponentiel)
3. Le `retryCount` est incrémenté dans le document MongoDB à chaque tentative
4. Si après 3 tentatives ça échoue toujours, le job passe en status `failed` avec le message d'erreur
5. L'utilisateur voit l'erreur dans le frontend et peut relancer la génération manuellement

---

## 9. Authentification et sécurité

### 9.1 Better Auth

L'authentification repose sur **Better Auth**, une librairie TypeScript qui gère :

- **L'inscription** : l'email est vérifié, le mot de passe est haché avant stockage
- **La connexion** : email/password ou OAuth (GitHub, Google, Roblox)
- **Les sessions** : token JWT stocké dans un cookie HTTP-only, avec suivi de l'IP et du user agent
- **Le JWT** : clés de signature stockées dans la table `jwks` de PostgreSQL

Les plugins Better Auth utilisés :

- **JWT** : pour la génération et validation des tokens
- **Bearer** : pour le support des tokens Bearer dans les headers

### 9.2 Flux d'authentification

```
[Frontend]  L'utilisateur s'inscrit / se connecte
               ↓
[Frontend]  Appel POST /api/auth/sign-up ou /api/auth/sign-in
               ↓
[API Gateway]  Proxy vers Users API (pas d'auth requise sur ces routes)
               ↓
[Users API]  Better Auth valide les credentials
             Crée une session + un JWT
             Retourne le JWT dans un cookie HTTP-only
               ↓
[Frontend]  Le cookie est automatiquement inclus dans les requêtes suivantes
               ↓
[API Gateway]  Pour les routes protégées, vérifie le JWT
               Ajoute les infos user dans les headers
               Proxy vers le microservice cible
```

### 9.3 Chiffrement des données sensibles

Les credentials Shopify (Client ID, Client Secret, Access Token) sont **chiffrés en AES-256-GCM** avant d'être stockés en base.

Le chiffrement fonctionne ainsi :

- La clé de chiffrement est dérivée de la variable d'environnement `ENCRYPTION_KEY` via un hash SHA-256
- Chaque valeur chiffrée contient 3 parties : l'**IV** (vecteur d'initialisation, 12 bytes), les **données chiffrées** et le **tag d'authentification**
- Le tout est stocké en JSON dans la base : `{iv, data, tag}` en hexadécimal
- Le déchiffrement utilise les mêmes éléments pour retrouver la valeur originale

Ce chiffrement garantit que même si la base de données est compromise, les credentials Shopify ne sont pas exploitables sans la clé.

### 9.4 Sécurité inter-services

Les microservices ne sont pas exposés directement. Plusieurs mécanismes de sécurité sont en place :

- **Gateway Guard** : chaque microservice vérifie le header `X-Gateway-Secret` pour s'assurer que la requête vient bien de l'API Gateway. Un appel direct au microservice sans ce header est rejeté.
- **Auth Middleware** : les routes protégées vérifient le JWT de l'utilisateur et injectent son `userId` dans la requête
- **Isolation Docker** : les microservices ne sont accessibles que via le réseau Docker interne, seuls la Gateway et le frontend exposent des ports

---

## 10. Déploiement et environnement

### 10.1 Environnement local

**Prérequis :**

- Node.js 20 LTS ou supérieur
- pnpm >= 10.14.0
- Docker et Docker Compose

**Setup rapide :**

```bash
# 1. Cloner le repo
git clone <repo-url>
cd florian-et-kiki

# 2. Lancer le script de setup
./setup.sh

# 3. Lancer tous les services
docker-compose up --build
```

Le script `setup.sh` :

- Vérifie que pnpm est installé
- Crée les fichiers `.env` à partir des `.env.example` pour chaque service
- Installe les dépendances de tout le monorepo
- Génère les clients Prisma pour Users API et Shop API

**Accès aux services :**

| Service              | URL                                  |
| -------------------- | ------------------------------------ |
| Frontend             | http://localhost:3000                |
| API Gateway          | http://localhost:4000                |
| RabbitMQ Management  | http://localhost:15672 (guest/guest) |
| Adminer (PostgreSQL) | http://localhost:8082                |
| Mongo Express        | http://localhost:8081                |

**Mode développement sans Docker :**

```bash
pnpm run dev    # Lance tout en mode concurrent (frontend + tous les backends)
```

Dans ce cas, il faut avoir PostgreSQL, MongoDB (en Replica Set) et RabbitMQ installés et lancés localement.

### 10.2 Docker Compose

Le `docker-compose.yml` définit 10 services :

**Services applicatifs :**
| Service | Image | Port | Replicas |
|---|---|---|---|
| frontend | Build local | 3000 | 1 |
| api-gateway | Build local | 4000 | 1 |
| users-api | Build local | 5001 | 1 |
| shop-api | Build local | 5003 | 1 |
| generations-api | Build local | 5002 | 1 |
| worker | Build local | - | 3 |

**Services d'infrastructure :**
| Service | Image | Port | Rôle |
|---|---|---|---|
| postgres | postgres:17 | 5432 | BDD relationnelle (2 databases) |
| mongodb | mongo:8 | 27017 | BDD documents (Replica Set rs0) |
| rabbitmq | rabbitmq:4-management | 5672 / 15672 | Broker de messages |
| mongo-express | mongo-express | 8081 | Interface admin MongoDB |
| adminer | adminer | 8082 | Interface admin PostgreSQL |

Le worker est le seul service avec plusieurs replicas, ce qui permet de traiter plusieurs générations IA en parallèle.

### 10.3 Variables d'environnement

**Organisation :**

- Un `.env` à la racine pour Docker Compose
- Un `.env` par service pour le dev local
- Des `.env.example` versionnés servant de templates

**Variables critiques :**

| Variable             | Service(s)                           | Rôle                                 |
| -------------------- | ------------------------------------ | ------------------------------------ |
| `GATEWAY_SECRET`     | API Gateway + tous les microservices | Secret partagé pour le gateway guard |
| `BETTER_AUTH_SECRET` | Users API                            | Signature des JWT                    |
| `ENCRYPTION_KEY`     | Shop API                             | Chiffrement des credentials Shopify  |
| `DATABASE_URL`       | Users API, Shop API                  | Connexion PostgreSQL                 |
| `MONGO_URI`          | Generations API, Worker              | Connexion MongoDB                    |
| `RABBITMQ_URL`       | Generations API, Worker              | Connexion RabbitMQ                   |
| `OPENAI_API_KEY`     | Worker                               | Clé API OpenAI                       |
| `ANTHROPIC_API_KEY`  | Worker                               | Clé API Anthropic (futur)            |

Les fichiers `.env` ne sont **jamais commités** (exclus via `.gitignore`). Les secrets doivent être générés avec des valeurs fortes et cohérentes entre les services qui les partagent.

**Côté frontend**, Next.js distingue les variables exposées au client (`NEXT_PUBLIC_*`) de celles réservées au serveur. Seule `NEXT_PUBLIC_API_URL` est exposée (l'URL de l'API Gateway).

---

## 11. Endpoints API

Voici le récapitulatif complet des endpoints exposés par l'API Gateway :

### Authentification (Users API - pas d'auth requise)

| Méthode | Route                | Description               |
| ------- | -------------------- | ------------------------- |
| POST    | `/api/auth/sign-up`  | Inscription               |
| POST    | `/api/auth/sign-in`  | Connexion                 |
| POST    | `/api/auth/sign-out` | Déconnexion               |
| GET     | `/auth/me`           | Info utilisateur connecté |

### Stores (Shop API - auth requise)

| Méthode | Route                       | Description                          |
| ------- | --------------------------- | ------------------------------------ |
| GET     | `/stores`                   | Liste des boutiques de l'utilisateur |
| POST    | `/stores`                   | Ajouter une boutique                 |
| GET     | `/stores/:storeId`          | Détail d'une boutique                |
| PUT     | `/stores/:storeId`          | Modifier une boutique                |
| DELETE  | `/stores/:storeId`          | Supprimer une boutique               |
| GET     | `/stores/:storeId/settings` | Paramètres SEO du store              |
| PUT     | `/stores/:storeId/settings` | Modifier les paramètres SEO          |

### Produits (Shop API - auth requise)

| Méthode | Route                                        | Description                 |
| ------- | -------------------------------------------- | --------------------------- |
| GET     | `/shops/:shopId/products`                    | Liste des produits          |
| GET     | `/shops/:shopId/products/:productId`         | Détail d'un produit         |
| POST    | `/shops/:shopId/products/sync`               | Synchroniser depuis Shopify |
| PATCH   | `/shops/:shopId/products/:productId`         | Modifier un produit         |
| POST    | `/shops/:shopId/products/:productId/publish` | Publier sur Shopify         |

### Collections (Shop API - auth requise)

| Méthode | Route                                              | Description                 |
| ------- | -------------------------------------------------- | --------------------------- |
| GET     | `/shops/:shopId/collections`                       | Liste des collections       |
| GET     | `/shops/:shopId/collections/:collectionId`         | Détail d'une collection     |
| POST    | `/shops/:shopId/collections/sync`                  | Synchroniser depuis Shopify |
| PATCH   | `/shops/:shopId/collections/:collectionId`         | Modifier une collection     |
| POST    | `/shops/:shopId/collections/:collectionId/publish` | Publier sur Shopify         |

### Générations (Generations API - auth requise)

| Méthode | Route                                   | Description                             |
| ------- | --------------------------------------- | --------------------------------------- |
| GET     | `/generations`                          | Toutes les générations de l'utilisateur |
| POST    | `/generations/generate`                 | Créer un job de génération (202)        |
| POST    | `/generations/generate/bulk`            | Génération en masse (max 50)            |
| GET     | `/generations/job/:id`                  | Status d'un job                         |
| GET     | `/generations/job/:id/stream`           | Stream SSE temps réel                   |
| GET     | `/generations/product/:productId`       | Historique produit                      |
| GET     | `/generations/collection/:collectionId` | Historique collection                   |
| GET     | `/generations/jobs`                     | Liste avec filtres                      |

---

_Document technique EasySeo - Albora Florian & Fravalo Killian - Ynov Toulouse 2026-2027_
