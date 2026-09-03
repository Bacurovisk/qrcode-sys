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

## Deploy (self-hosted, Docker)

Pensado pra rodar atrás de um reverse proxy próprio (Nginx Proxy Manager, Traefik, Caddy etc.),
container próprio, sem porta pública exposta diretamente. Recomenda-se fixar `container_name`
no `app` e no `db` no `docker-compose.yml` — sem isso o compose gera nomes com sufixo
(`<projeto>-app-1`) que não são estáveis entre recriações, o que quebra referências por hostname
(proxy, scripts de backup, etc).

1. Ajuste o bloco `networks` do `docker-compose.yml` com o nome real da rede docker externa do
   seu reverse proxy (`docker network ls` no host).
2. Copie o código pro host (rsync/git, excluindo `node_modules`, `.next`, `.git`) e crie um `.env`
   de produção (nunca versionado) ao lado do `docker-compose.yml` — é esse nome que o
   `docker compose` lê automaticamente para as substituições `${...}`. **Não** nomeie esse
   arquivo `.env.production`: é um nome reservado do Next.js (carregado automaticamente em
   `next build`, inclusive dentro da imagem Docker).
3. Build e subida:
   ```bash
   docker compose build
   docker compose up -d
   ```
4. Rode as migrations (só necessário no primeiro deploy e após mudanças de schema):
   ```bash
   docker compose run --rm migrate
   ```
5. No reverse proxy, aponte pro **nome do container** do app (não `localhost`) na porta `3000`,
   com SSL via Let's Encrypt.
6. Inclua um `pg_dump` lógico do Postgres deste projeto no seu pipeline de backup.

Sempre que o `prisma/schema.prisma` mudar, rode `docker compose run --rm migrate` antes de subir
a nova versão do `app`.

## Doação

O botão de doação usa um link do PayPal configurável via `NEXT_PUBLIC_PAYPAL_DONATE_URL`
(PayPal.me ou botão hospedado do PayPal Donate) — sem SDK, sem backend.

## Licença

[MIT](LICENSE)
