#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${BLUE}${BOLD}"
echo "  ______                 ____"
echo " / ____/___ ________  __/ __/___  ____"
echo "/ __/ / __ \`/ ___/ / / /\\__ \\/ _ \\/ __ \\"
echo "/ /___/ /_/ (__  ) /_/ /___/ /  __/ /_/ /"
echo "\\____/\\__,_/____/\\__, //____/\\___/\\____/"
echo "                /____/"
echo -e "${NC}"
echo -e "${BLUE}Setup du projet EasySeo - Microservices${NC}"
echo ""

# ─── Prerequisites ────────────────────────────────────────

echo -e "${BOLD}1. Verification des prerequis${NC}"
echo ""

HAS_ERROR=false

if command -v node &> /dev/null; then
    echo -e "  ${GREEN}OK${NC} Node.js $(node -v)"
else
    echo -e "  ${RED}MANQUANT${NC} Node.js (>= 20 LTS requis)"
    HAS_ERROR=true
fi

if command -v pnpm &> /dev/null; then
    echo -e "  ${GREEN}OK${NC} pnpm $(pnpm -v)"
else
    echo -e "  ${RED}MANQUANT${NC} pnpm (npm install -g pnpm)"
    HAS_ERROR=true
fi

if command -v docker &> /dev/null; then
    echo -e "  ${GREEN}OK${NC} Docker"
else
    echo -e "  ${RED}MANQUANT${NC} Docker"
    HAS_ERROR=true
fi

if docker compose version &> /dev/null; then
    echo -e "  ${GREEN}OK${NC} Docker Compose"
else
    echo -e "  ${RED}MANQUANT${NC} Docker Compose"
    HAS_ERROR=true
fi

if [ "$HAS_ERROR" = true ]; then
    echo ""
    echo -e "${RED}Installez les prerequis manquants avant de continuer.${NC}"
    exit 1
fi

echo ""

# ─── Generate shared secret ──────────────────────────────

GATEWAY_SECRET=$(openssl rand -hex 64)

# ─── Environment files ────────────────────────────────────

echo -e "${BOLD}2. Creation des fichiers .env${NC}"
echo ""

copy_env() {
    local src="$1"
    local dest="$2"
    local name="$3"

    if [ -f "$dest" ]; then
        echo -e "  ${YELLOW}EXISTE${NC} $name"
    elif [ -f "$src" ]; then
        cp "$src" "$dest"
        echo -e "  ${GREEN}CREE${NC}   $name"
    else
        echo -e "  ${RED}ERREUR${NC} $src introuvable"
    fi
}

# Root .env (Docker Compose)
copy_env "env.example" ".env" ".env (Docker Compose)"

# Backend services
copy_env "backend/api-gateway/.env.example" "backend/api-gateway/.env" "backend/api-gateway/.env"
copy_env "backend/users-api/.env.example" "backend/users-api/.env" "backend/users-api/.env"
copy_env "backend/shop-api/.env.example" "backend/shop-api/.env" "backend/shop-api/.env"
copy_env "backend/generations-api/.env.example" "backend/generations-api/.env" "backend/generations-api/.env"

# Frontend
if [ ! -f "frontend/.env.local" ]; then
    cat > frontend/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
EOF
    echo -e "  ${GREEN}CREE${NC}   frontend/.env.local"
else
    echo -e "  ${YELLOW}EXISTE${NC} frontend/.env.local"
fi

echo ""

# ─── Inject GATEWAY_SECRET ────────────────────────────────

echo -e "${BOLD}3. Configuration du GATEWAY_SECRET partage${NC}"
echo ""

inject_gateway_secret() {
    local file="$1"
    local name="$2"

    if [ -f "$file" ]; then
        if grep -q "^GATEWAY_SECRET=$" "$file"; then
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' "s|^GATEWAY_SECRET=$|GATEWAY_SECRET=$GATEWAY_SECRET|" "$file"
            else
                sed -i "s|^GATEWAY_SECRET=$|GATEWAY_SECRET=$GATEWAY_SECRET|" "$file"
            fi
            echo -e "  ${GREEN}INJECTE${NC} $name"
        else
            echo -e "  ${YELLOW}DEJA SET${NC} $name"
        fi
    fi
}

inject_gateway_secret "backend/api-gateway/.env" "api-gateway"
inject_gateway_secret "backend/users-api/.env" "users-api"
inject_gateway_secret "backend/shop-api/.env" "shop-api"
inject_gateway_secret "backend/generations-api/.env" "generations-api"

echo ""

# ─── Install dependencies ─────────────────────────────────

echo -e "${BOLD}4. Installation des dependances${NC}"
echo ""

pnpm install
if [ $? -ne 0 ]; then
    echo -e "${RED}Erreur lors de l'installation des dependances.${NC}"
    exit 1
fi
echo ""
echo -e "  ${GREEN}OK${NC} Dependances installees"
echo ""

# ─── Generate Prisma clients ──────────────────────────────

echo -e "${BOLD}5. Generation des clients Prisma${NC}"
echo ""

echo -e "  ${YELLOW}...${NC} users-api"
(cd backend/users-api && pnpm prisma:generate)
if [ $? -eq 0 ]; then
    echo -e "  ${GREEN}OK${NC} users-api"
else
    echo -e "  ${RED}ERREUR${NC} users-api prisma:generate"
fi

echo -e "  ${YELLOW}...${NC} shop-api"
(cd backend/shop-api && pnpm prisma:generate)
if [ $? -eq 0 ]; then
    echo -e "  ${GREEN}OK${NC} shop-api"
else
    echo -e "  ${RED}ERREUR${NC} shop-api prisma:generate"
fi

echo ""

# ─── Done ─────────────────────────────────────────────────

echo -e "${GREEN}${BOLD}Setup termine avec succes !${NC}"
echo ""
echo -e "${BOLD}Prochaines etapes :${NC}"
echo ""
echo -e "  ${BLUE}1.${NC} Lancez les services avec Docker :"
echo -e "     ${YELLOW}docker compose up --build${NC}"
echo ""
echo -e "  ${BLUE}2.${NC} Appliquez les schemas Prisma (apres que PostgreSQL soit pret) :"
echo -e "     ${YELLOW}cd backend/users-api && pnpm prisma:push${NC}"
echo -e "     ${YELLOW}cd backend/shop-api && pnpm prisma:push${NC}"
echo ""
echo -e "  ${BLUE}3.${NC} Ou en dev local (sans Docker) :"
echo -e "     ${YELLOW}pnpm run dev${NC}"
echo ""
echo -e "${BOLD}Variables a configurer manuellement :${NC}"
echo ""
echo -e "  ${YELLOW}backend/users-api/.env${NC}"
echo -e "    - DATABASE_URL         (connexion PostgreSQL)"
echo -e "    - BETTER_AUTH_SECRET   (secret JWT)"
echo -e "    - ENCRYPTION_KEY       (cle de chiffrement)"
echo ""
echo -e "  ${YELLOW}backend/shop-api/.env${NC}"
echo -e "    - SHOPIFY_CLIENT_SECRET (secret de l'app Shopify EasySeo)"
echo ""
echo -e "  ${YELLOW}.env (racine)${NC}"
echo -e "    - OPENAI_API_KEY       (pour le worker)"
echo -e "    - ANTHROPIC_API_KEY    (pour le worker)"
echo ""
echo -e "${BOLD}URLs d'acces :${NC}"
echo ""
echo -e "  Frontend             ${BLUE}http://localhost:3000${NC}"
echo -e "  API Gateway          ${BLUE}http://localhost:4000${NC}"
echo -e "  RabbitMQ Management  ${BLUE}http://localhost:15672${NC}  (guest/guest)"
echo -e "  Adminer (PostgreSQL) ${BLUE}http://localhost:8082${NC}"
echo -e "  Mongo Express        ${BLUE}http://localhost:8081${NC}"
echo ""
