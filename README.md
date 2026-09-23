# qrcode-sys

Sistema de QR codes estáticos e dinâmicos com contas de usuário, personalização visual gratuita
(cores, formato dos pontos, logo) e estatísticas de scan para QR dinâmicos. 100% self-hosted.

## Stack

- Next.js 16 (App Router, TypeScript)
- Postgres + Prisma 7 (driver adapter `@prisma/adapter-pg`)
- Auth.js (NextAuth v4) — login só via OAuth (Google e Microsoft), `@next-auth/prisma-adapter`
  pra persistir contas, sessão em JWT
- `qr-code-styling` para a arte do QR (client-side, gratuita)

## Desenvolvimento local

Requer um Postgres acessível (local, ou via `docker compose up -d db` se tiver Docker).

```bash
cp .env.example .env      # preencha DATABASE_URL, NEXTAUTH_SECRET (openssl rand -base64 32), etc.
npm install                # roda `prisma generate` automaticamente (postinstall)
npx prisma migrate deploy  # aplica as migrations existentes (precisa de Postgres acessível)
npm run dev
```

Pra testar o login de verdade em dev local, preencha `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`
e/ou `AZURE_AD_CLIENT_ID`/`AZURE_AD_CLIENT_SECRET` no `.env` (veja como gerar cada um nos
comentários do `.env.example`) — sem isso o botão de login retorna erro do provedor.

## Estrutura

- `src/app` — rotas (App Router): landing page, `/login` (OAuth), `/dashboard/*`, rotas de API
- `src/app/r/[slug]` — rota pública dos QR dinâmicos; grava o evento de scan e então redireciona
  ou renderiza uma página, dependendo do tipo de conteúdo (veja abaixo)
- `prisma/schema.prisma` — modelos `User`, `QrCode` (`kind` + `payload` Json), `ScanEvent`
- `prisma.config.ts` — config do Prisma 7 (connection string para o CLI de migrations)
- `src/generated/prisma` — client do Prisma gerado (não versionado, gerado por `prisma generate`)

## Tipos de QR code

Um `QrCode` tem um `kind` (URL, Texto, Contato, Rede social, Aplicativo, Localização, SMS,
Email, Telefone, Wifi, Pix) e um `payload` Json com os campos específicos daquele tipo — toda a
lógica de codificação fica centralizada em `src/lib/qrContent.ts`, usada tanto no preview do
editor (client) quanto na rota `/r/[slug]` (server), então as duas nunca divergem.

- **URL, Rede social, Telefone, Email, SMS, Localização** — sempre viram um redirect de verdade
  (`tel:`, `mailto:`, `sms:`, um link do Google Maps para localização). QR estático grava o
  conteúdo direto na imagem; dinâmico aponta pro `/r/[slug]`, que resolve e redireciona.
- **Aplicativo** — só existe como dinâmico: `/r/[slug]` detecta Android/iOS pelo `User-Agent` e
  manda pra loja certa; sem match (ou sem link daquele SO), cai no link de fallback ou numa
  página simples com os botões preenchidos.
- **Texto, Contato, Wifi, Pix** — não dá pra "redirecionar" pra esse conteúdo (não são uma URI
  navegável). Estático grava o formato padrão direto na imagem (vCard, `WIFI:...`, o BR Code do
  Pix — todos lidos nativamente por scanners de QR/apps de banco). Dinâmico renderiza uma página
  em `/r/[slug]`: Texto mostra o texto, Contato serve o `.vcf` direto (dispara "adicionar
  contato").
- **Pix e Wifi só existem como estáticos** (`STATIC_ONLY_KINDS`): o app do banco e o "conectar à
  rede" da câmera só leem os dados gravados na imagem, não um link. QRs Pix/Wifi dinâmicos criados
  antes dessa regra continuam funcionando em `/r/[slug]` (Wifi mostra SSID/senha para copiar, Pix
  mostra o copia e cola) e exibem um aviso na tela de edição.
- O Pix segue o padrão EMV "BR Code" do Banco Central (TLV + CRC-16/CCITT-FALSE) — a montagem dos
  campos e o CRC foram validados contra uma implementação real testada em mais de 10 bancos
  brasileiros antes de ir pro código.

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
   com SSL via Let's Encrypt, e limite o tamanho do corpo das requisições a 2 MB. No Nginx Proxy
   Manager: Proxy Hosts → Edit → aba **Advanced** → "Custom Nginx Configuration":
   ```nginx
   client_max_body_size 2m;
   ```
   (Traefik/Caddy têm equivalente.) O app recusa sozinho corpos acima de 1 MB
   (`src/lib/requestBody.ts`), mas quando o pedido chega sem `Content-Length` ele precisa ler o
   corpo inteiro antes de medir — o limite no proxy barra isso antes de chegar ao app. Essa
   configuração fica só no proxy, não neste repositório: refaça-a se o proxy host for recriado.
6. Inclua um `pg_dump` lógico do Postgres deste projeto no seu pipeline de backup.

Sempre que o `prisma/schema.prisma` mudar, rode `docker compose run --rm migrate` antes de subir
a nova versão do `app`.

## Doação

O botão de doação leva para a página pública `/doar` (`src/app/doar/page.tsx`), que oferece
duas opções — sem SDK, sem backend de pagamento:

- **Pix**: QR code + "copia e cola" gerados com `buildPix()` (`src/lib/qrContent.ts`). O padrão
  é **valor livre** (sem o campo 54 do BR Code, quem paga digita o valor no app do banco), com
  atalhos opcionais de R$ 5, 10 e 25. Configurado via `PIX_KEY_TYPE`, `PIX_KEY`, `PIX_NAME`,
  `PIX_CITY` e `PIX_DESCRIPTION` (opcional) — envs só do servidor, lidas em runtime (a página
  usa `connection()`), então trocar a chave não exige rebuild da imagem. Sem
  `PIX_KEY`/`PIX_NAME`/`PIX_CITY`, o cartão do Pix não aparece. Use uma **chave aleatória
  (EVP)**: a chave fica legível pra qualquer um que ler o QR.
- **PayPal**: link configurável via `NEXT_PUBLIC_PAYPAL_DONATE_URL` (PayPal.me ou botão
  hospedado do PayPal Donate).

## SEO

- URL canônica em `NEXT_PUBLIC_SITE_URL` (padrão `https://qrcode.neojr.com`), lida no **build**
  (build arg no `docker-compose.yml`): home, `/qr-code-pix`, `robots.txt`, `sitemap.xml` e a
  imagem de compartilhamento são geradas estaticamente.
- Título, descrição, canonical e Open Graph de cada página pública vêm de `pageMetadata()`
  (`src/lib/site.ts`); a imagem de compartilhamento é `src/app/opengraph-image.tsx`.
- `robots.txt` (`src/app/robots.ts`) bloqueia `/r/`, `/api/` e `/dashboard`. `/login` fica
  liberado de propósito, com `noindex` na própria página (o robô só lê o noindex se puder entrar).
- Scans de robôs (buscadores, prévia de link do WhatsApp/Telegram etc.) e requisições `HEAD` não
  são contados nas estatísticas (`src/lib/bot.ts`).
- Depois do deploy: cadastrar o domínio no Google Search Console (propriedade de domínio, TXT no
  DNS do Cloudflare), enviar `https://qrcode.neojr.com/sitemap.xml` e conferir se o `robots.txt`
  gerenciado do Cloudflare manteve as regras e a linha `Sitemap:` do app.

## Login (OAuth — Google e Microsoft)

Não existe cadastro/senha própria: login é só `signIn("google")` / `signIn("microsoft-entra-id")`
(`src/app/login/page.tsx`), com `@next-auth/prisma-adapter` (`src/lib/auth.ts`) persistindo
usuário e conta vinculada no Postgres. Decisão tomada porque emails transacionais próprios
(verificação de conta, reset de senha) esbarravam na reputação ruim do domínio de envio — ver
histórico do projeto — então a saída foi eliminar por completo a necessidade de o app mandar
email: o Google/Microsoft já garantem que o email da conta é válido.

Credenciais necessárias antes do próximo deploy:

- **Google**: crie em <https://console.cloud.google.com/apis/credentials> → "Create Credentials"
  → "OAuth client ID" → tipo "Web application". Redirect URI autorizado:
  `{NEXTAUTH_URL}/api/auth/callback/google`.
- **Microsoft**: crie em <https://portal.azure.com> → Microsoft Entra ID → App registrations →
  New registration. Em "Supported account types" escolha "Accounts in any organizational
  directory and personal Microsoft accounts" (aceita outlook.com/hotmail.com além de contas
  corporativas — é por isso que `tenantId` está fixo em `"common"` no provider). Redirect URI
  (tipo Web) em Authentication: `{NEXTAUTH_URL}/api/auth/callback/microsoft-entra-id` — o
  provider é registrado com `id: "microsoft-entra-id"` em `src/lib/auth.ts` (o default do
  NextAuth v4 seria `azure-ad`, mas a redirect URI cadastrada no Azure usa o nome do Auth.js v5).
  O client secret fica
  em Certificates & secrets.

Preencha `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AZURE_AD_CLIENT_ID` e
`AZURE_AD_CLIENT_SECRET` no `.env` — são server-only, não precisam de build arg no Docker.

## Marca (favicon e logo para BIMI)

A marca é um QR estilizado (os "olhos" de um QR code de verdade — três cantos com quadrados
aninhados) em preto e branco, mesma paleta do resto do app.

- `src/app/icon.svg`, `src/app/apple-icon.png`, `src/app/favicon.ico` — favicon do site
  (convenção de arquivo do Next, nenhuma config extra necessária).
- `public/bimi-logo.svg` — versão para BIMI: perfil **SVG Tiny-PS** (`version="1.2"
  baseProfile="tiny-ps"`, `<title>`, só formas sólidas, sem gradiente/filtro/script), servida em
  `https://{seu-dominio}/bimi-logo.svg` assim que for deployado.

Pra ativar o BIMI (independe deste app, é sobre a reputação/branding do domínio de email como um
todo — os passos abaixo valem pra qualquer provedor de DNS, não só Cloudflare):

1. Confirme que o DMARC do domínio está em `p=quarantine` ou `p=reject` (BIMI não funciona com
   `p=none` — é o motivo mais comum do selo não aparecer mesmo com tudo certo).
2. Crie um registro TXT em `default._bimi.{seu-dominio}` com o valor:
   ```
   v=BIMI1; l=https://{seu-dominio}/bimi-logo.svg;
   ```
3. Opcional (necessário pro Gmail exibir o selo hoje em dia): um **VMC** (Verified Mark
   Certificate, exige marca registrada) — sem ele o BIMI ainda funciona no Apple Mail, Yahoo e
   outros clientes que não exigem VMC.

O SVG segue as regras que consegui confirmar nas specs oficiais do BIMI Group (root com
`xmlns`/`version`/`baseProfile`, viewBox quadrado, `<title>` não-vazio, só `<rect>` com `fill`
sólido) — mas validadores de provedores de email variam, então vale rodar num validador BIMI
antes de considerar fechado.

## Licença

[MIT](LICENSE)
