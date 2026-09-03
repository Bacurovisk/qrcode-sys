# qrcode-sys

Sistema de QR codes estáticos e dinâmicos com contas de usuário, personalização visual gratuita
(cores, formato dos pontos, logo) e estatísticas de scan para QR dinâmicos. 100% self-hosted.

Em produção em [qrcode.rbacuri.dpdns.org](https://qrcode.rbacuri.dpdns.org).

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

Segue o mesmo padrão dos outros serviços (`~/docker/<nome>` na VPS): container próprio, sem
porta pública exposta, atrás do Nginx Proxy Manager, com `container_name` fixo pro app e pro
Postgres — sem isso o compose gera nomes com sufixo (`qrcode-sys-app-1`) que não são estáveis
entre recriações, e tanto o NPM quanto o script de backup dependem de um hostname previsível.

1. Confirme o nome real da rede docker externa do Nginx Proxy Manager (`docker network ls` na
   VPS — neste servidor é `npm_default`) e ajuste o bloco `networks` do `docker-compose.yml` se
   for diferente.
2. Envie o código pra `~/docker/qrcode-sys` na VPS via `rsync` (excluindo `node_modules`, `.next`,
   `.git`) e copie o `.env` de produção separadamente (nunca versionado) para
   `~/docker/qrcode-sys/.env` — é esse nome que o `docker compose` lê automaticamente para as
   substituições `${...}`. **Não** nomeie esse arquivo `.env.production`: é um nome reservado do
   Next.js (carregado automaticamente em `next build`, inclusive dentro da imagem Docker).
3. Build e subida:
   ```bash
   docker compose build
   docker compose up -d
   ```
4. Rode as migrations (só necessário no primeiro deploy e após mudanças de schema):
   ```bash
   docker compose run --rm migrate
   ```
5. Crie um registro DNS (A) do subdomínio apontando pro IP da VPS — não é wildcard, cada
   subdomínio precisa do próprio registro. No Nginx Proxy Manager, crie o Proxy Host apontando
   para o **nome do container** do app (não `localhost`) na porta `3000`, com SSL via Let's
   Encrypt.
6. O `pg_dump` lógico deste projeto já está integrado ao script de backup diário existente na
   VPS (`~/backups/make-backup.sh`) — não precisa configurar nada a mais em deploys futuros.

Sempre que o `prisma/schema.prisma` mudar, rode `docker compose run --rm migrate` antes de subir
a nova versão do `app`.

## Doação

O botão de doação usa um link do PayPal configurável via `NEXT_PUBLIC_PAYPAL_DONATE_URL`
(PayPal.me ou botão hospedado do PayPal Donate) — sem SDK, sem backend.
