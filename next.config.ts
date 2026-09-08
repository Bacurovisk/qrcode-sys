import type { NextConfig } from "next";

// challenges.cloudflare.com é o widget/iframe do Turnstile (desafio exibido
// quando o rate limit de scan ou de criação de QR é excedido — veja
// src/lib/turnstile.ts). 'unsafe-inline' em script/style continua necessário
// porque src/app/r/[slug]/route.ts monta HTML com <style>/<script> inline;
// o que protege contra XSS ali é o escapeHtml() em todo valor interpolado,
// não a CSP — a CSP é só defesa em profundidade (bloqueia scripts externos
// não previstos, framing, etc).
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "frame-src https://challenges.cloudflare.com",
  "connect-src 'self' https://challenges.cloudflare.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingIncludes: {
    "/**/*": ["./node_modules/@prisma/client/runtime/*.wasm*"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Sem efeito em HTTP puro (o browser ignora); inofensivo em dev,
          // e é o proxy reverso (Nginx Proxy Manager) que termina o TLS em
          // produção — a diretiva vale porque é ele quem repassa a resposta.
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
    ];
  },
};

export default nextConfig;
