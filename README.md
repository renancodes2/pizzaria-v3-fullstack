# Pizzaria-v3

Este repositório contém o frontend (Next.js) e o backend (NestJS + Prisma + PostgreSQL) da Pizzaria.

Este README explica como rodar o projeto localmente usando Docker Compose, como executar testes e principais notas sobre desenvolvimento.

---

## Requisitos

- Docker Desktop (ou Docker Engine com Compose v2)
- Node.js & npm (apenas se quiser rodar localmente fora de containers)

---

## Estrutura

- `backend/` - NestJS backend (Prisma, Postgres, JWT, Stripe, etc.)
- `frontend/` - Next.js frontend
  - Observação: o frontend ainda será desenvolvido — a pasta contém o esqueleto e será preenchida em breve.
- `docker-compose.yml` - orquestra frontend, backend e banco (Postgres)
- `.env.example` - exemplo de variáveis de ambiente para copiar para `.env`

---

## Configuração inicial

1. Copie o arquivo de exemplo de variáveis de ambiente:

```powershell
Copy-Item .env.example .env
notepad .env
```

2. Edite `backend/.env` se precisar ajustar segredos (JWT, STRIPE, CLOUDINARY, DATABASE_URL). O Compose usa `backend/.env` para inicializar o container do banco.

---

## Rodando com Docker Compose

Subir (build + run):

```powershell
cd <path-to-repo-root>
docker compose up -d --build
```

Seguir logs (backend):

```powershell
docker compose logs -f backend
```

Parar e remover containers:

```powershell
docker compose down
```

Remover containers + volumes (reset do banco):

```powershell
docker compose down -v
```

Acessos padrão:

- Frontend: http://localhost:3001
- Backend API: http://localhost:3334
- Postgres: host `localhost`, porta `5433` (caso precise conectar externamente)

> Observação: as portas acima podem ser configuradas no `.env` da raiz (variáveis `HOST_FRONTEND_PORT`, `HOST_BACKEND_PORT`, `HOST_DB_PORT`).

---

## Notas sobre Prisma

- O schema do Prisma está em `backend/prisma/schema.prisma`.
- O `prisma generate` precisa rodar para gerar o Prisma Client com os binaryTargets corretos. O Dockerfile do backend já chama `npx prisma generate` durante o build e no CMD.
- Atenção: quando o `docker-compose.yml` monta `./backend:/app` como bind-mount, os arquivos gerados durante o build (incluindo `.prisma/client`) podem ser sobrescritos pelo conteúdo do host. Em desenvolvimento isso é útil; para produção remova a montagem e use a imagem construída.

Se precisar gerar o client manualmente (na host):

```powershell
cd backend
npm install
npx prisma generate
```

---

## Testes

No backend (Jest):

```powershell
cd backend
npm install
npm test
```

Eu já adicionei testes unitários para `pizzas.service` e `pizzas.controller`.

---

## Desenvolvimento local (sem Docker)

- Backend:
  - Entre na pasta `backend`, instale dependências e rode:

```powershell
cd backend
npm install
npm run start:dev
```

- Frontend:

> Observação: o frontend ainda está pendente de desenvolvimento. A seção abaixo mostra como você faria o fluxo quando o frontend estiver pronto.

```powershell
cd frontend
npm install
npm run dev
```

Se o frontend não estiver pronto, você pode testar apenas o backend via API (ex.: `GET /pizzas`).

### O que o backend faz

O backend é responsável por: 

- Autenticação (registro/login, JWT, refresh tokens)
- Gerenciamento de pizzas (CRUD, traduções, estoque)
- Gerenciamento de pedidos (criação, atualização de status)
- Integração com Stripe para pagamentos (criação de PaymentIntents e endpoint de webhook) **(alert(Em fase de teste!))**
- Upload de imagens via Cloudinary
- Gerenciamento de entregas (endereços, cálculo de distância/tempo)
- Reviews e controle de estoque (stock movements)

Estas responsabilidades estão implementadas nas rotas e serviços dentro da pasta `backend/src`.

Lembre-se de apontar `NEXT_PUBLIC_API_URL` para a URL do backend (ex: `http://localhost:3333` quando rodando localmente sem Docker).

---

## Recomendações

- Para produção, remova o bind-mount `./backend:/app` do `docker-compose.yml` e faça o deploy das imagens geradas.
- Se for usar o projeto em CI/CD, recomendo gerar o Prisma Client no pipeline (rodar `npx prisma generate`) e construir as imagens com cache para acelerar builds.

---

## Dúvidas / Problemas comuns

- Prisma Client errors relacionados a engines: verifique `prisma/schema.prisma` e confirme `binaryTargets` inclua `linux-musl-openssl-3.0.x` para containers Alpine.
- Se o Docker não inicia no Windows, abra o Docker Desktop e verifique a integração WSL2.

---
