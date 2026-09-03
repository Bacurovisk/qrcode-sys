# qrcode-sys

Sistema de QR codes estáticos e dinâmicos com contas de usuário, personalização visual gratuita
(cores, formato dos pontos, logo) e estatísticas de scan para QR dinâmicos. 100% self-hosted.

## Stack

- Next.js 16 (App Router, TypeScript)
- Postgres + Prisma 7 (driver adapter `@prisma/adapter-pg`)
- Auth.js (NextAuth v4), provider Credentials, sessão em JWT
- `qr-code-styling` para a arte do QR (client-side, gratuita)

## Desenvolvimento local

Requer um Postgres acessível (local, ou via `docker compose up -d db` se tiver Docker).

```bash
cp .env.example .env      # preencha DATABASE_URL, NEXTAUTH_SECRET (openssl rand -base64 32), etc.
npm install                # roda `prisma generate` automaticamente (postinstall)
npx prisma migrate dev --name init   # cria as tabelas (primeira vez, precisa de Postgres acessível)
npm run dev
```

## Estrutura

- `src/app` — rotas (App Router): landing page, `/login`, `/register`, `/dashboard/*`, rotas de API
- `src/app/r/[slug]` — rota pública de redirect dos QR dinâmicos; grava o evento de scan antes de redirecionar
- `prisma/schema.prisma` — modelos `User`, `QrCode`, `ScanEvent`
- `prisma.config.ts` — config do Prisma 7 (connection string para o CLI de migrations)
- `src/generated/prisma` — client do Prisma gerado (não versionado, gerado por `prisma generate`)

## Deploy na VPS

Segue o mesmo padrão dos outros serviços: container próprio, sem porta pública exposta,
atrás do Nginx Proxy Manager.

1. Ajuste `docker-compose.yml`: o nome da rede `npm_proxy` no bloco `networks` deve bater com a
   rede docker externa usada pelo Nginx Proxy Manager na VPS (`docker network ls` para conferir).
2. Copie `.env.example` para `.env` na VPS e preencha os valores de produção
   (`NEXTAUTH_URL=https://qrcode.rbacuri.dpdns.org`, `NEXTAUTH_SECRET`, senha do Postgres, etc).
3. Suba o banco e rode as migrations (só necessário no primeiro deploy e após mudanças de schema):
   ```bash
   docker compose up -d db
   docker compose run --rm migrate
   ```
4. Suba a aplicação:
   ```bash
   docker compose up -d --build app
   ```
5. No Nginx Proxy Manager, crie um Proxy Host novo apontando para o container `app` na porta
   `3000` (rede interna), com SSL via Let's Encrypt — ex.: `qrcode.rbacuri.dpdns.org`.
6. Inclua o volume `qrcode_db_data` (Postgres) no pipeline de backup diário já existente na VPS.

Sempre que o `prisma/schema.prisma` mudar, rode `docker compose run --rm migrate` antes de subir
a nova versão do `app`.

## Doação

O botão de doação usa um link do PayPal configurável via `NEXT_PUBLIC_PAYPAL_DONATE_URL`
(PayPal.me ou botão hospedado do PayPal Donate) — sem SDK, sem backend.
