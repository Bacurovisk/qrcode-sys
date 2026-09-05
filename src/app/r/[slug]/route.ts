import { createHash } from "crypto";
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  buildMailto,
  buildMapsUrl,
  buildPix,
  buildSmsRedirect,
  buildTel,
  buildVCard,
  type AppPayload,
  type ContactPayload,
  type EmailPayload,
  type LocationPayload,
  type PhonePayload,
  type PixPayload,
  type QrKind,
  type SmsPayload,
  type SocialPayload,
  type TextPayload,
  type UrlPayload,
  type WifiPayload,
} from "@/lib/qrContent";

function hashIp(ip: string): string {
  const salt = process.env.SCAN_IP_SALT ?? "qrcode-sys";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

// All of the HTML below interpolates user-supplied values (QR name, wifi
// password, pix payer name, free text, etc.) into a page served to whoever
// scans someone else's QR code — every such value MUST go through this
// before landing in the markup, or it's a stored XSS vector.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function page(title: string, bodyHtml: string): NextResponse {
  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>
  body { margin: 0; background: #fafafa; color: #171717; font-family: -apple-system, system-ui, sans-serif; }
  main { max-width: 420px; margin: 0 auto; padding: 48px 20px; text-align: center; }
  h1 { font-size: 20px; margin: 0 0 16px; }
  p { color: #525252; line-height: 1.5; }
  .card { background: #fff; border: 1px solid #e5e5e5; border-radius: 12px; padding: 20px; margin-top: 16px; text-align: left; }
  .row { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; border-bottom: 1px solid #f5f5f5; }
  .row:last-child { border-bottom: none; }
  .label { color: #737373; font-size: 13px; }
  .value { font-weight: 600; word-break: break-word; text-align: right; }
  button, a.btn { display: inline-block; margin-top: 16px; padding: 10px 20px; background: #171717; color: #fff; border: none; border-radius: 8px; font-size: 14px; text-decoration: none; cursor: pointer; width: 100%; box-sizing: border-box; }
  button + button, a.btn + a.btn { margin-top: 8px; }
  textarea { width: 100%; box-sizing: border-box; margin-top: 12px; padding: 10px; border-radius: 8px; border: 1px solid #d4d4d4; font-size: 12px; font-family: monospace; resize: none; }
</style>
</head>
<body><main>${bodyHtml}</main></body>
</html>`;
  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

function copyButtonScript(elementId: string, source: "text" | "value" = "text") {
  const read = source === "value" ? `.value` : `.textContent`;
  return `<script>
    document.getElementById('${elementId}-btn').addEventListener('click', function () {
      const text = document.getElementById('${elementId}')${read};
      navigator.clipboard.writeText(text).then(function () {
        var btn = document.getElementById('${elementId}-btn');
        btn.textContent = 'Copiado!';
        setTimeout(function () { btn.textContent = 'Copiar'; }, 1500);
      });
    });
  </script>`;
}

function detectOS(userAgent: string): "android" | "ios" | "other" {
  if (/android/i.test(userAgent)) return "android";
  if (/iphone|ipad|ipod/i.test(userAgent)) return "ios";
  return "other";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const qrCode = await prisma.qrCode.findUnique({ where: { slug } });
  if (!qrCode || qrCode.type !== "DYNAMIC") {
    return NextResponse.json({ error: "QR code não encontrado" }, { status: 404 });
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "";
  const userAgent = request.headers.get("user-agent") ?? "";

  await prisma.scanEvent.create({
    data: {
      qrCodeId: qrCode.id,
      userAgent: userAgent || undefined,
      referrer: request.headers.get("referer") ?? undefined,
      ipHash: ip ? hashIp(ip) : undefined,
    },
  });

  const kind = qrCode.kind as QrKind;
  const payload = qrCode.payload as Record<string, unknown>;

  switch (kind) {
    case "URL":
    case "SOCIAL": {
      const url = (payload as UrlPayload | SocialPayload).url;
      return NextResponse.redirect(url, { status: 302 });
    }

    case "PHONE":
      return NextResponse.redirect(buildTel(payload as PhonePayload), { status: 302 });

    case "EMAIL":
      return NextResponse.redirect(buildMailto(payload as EmailPayload), { status: 302 });

    case "SMS":
      return NextResponse.redirect(buildSmsRedirect(payload as SmsPayload), { status: 302 });

    case "LOCATION":
      return NextResponse.redirect(buildMapsUrl(payload as LocationPayload), { status: 302 });

    case "APP": {
      const p = payload as AppPayload;
      const os = detectOS(userAgent);
      const target = os === "android" ? p.androidUrl : os === "ios" ? p.iosUrl : undefined;
      if (target) return NextResponse.redirect(target, { status: 302 });
      if (p.fallbackUrl) return NextResponse.redirect(p.fallbackUrl, { status: 302 });

      const buttons = [
        p.androidUrl
          ? `<a class="btn" href="${escapeHtml(p.androidUrl)}">Baixar para Android</a>`
          : "",
        p.iosUrl ? `<a class="btn" href="${escapeHtml(p.iosUrl)}">Baixar para iPhone</a>` : "",
      ].join("");
      const name = escapeHtml(qrCode.name);
      return page(qrCode.name, `<h1>${name}</h1><p>Escolha sua plataforma:</p>${buttons}`);
    }

    case "TEXT": {
      const p = payload as TextPayload;
      const text = escapeHtml(p.text).replace(/\n/g, "<br/>");
      return page(
        qrCode.name,
        `<h1>${escapeHtml(qrCode.name)}</h1><div class="card"><p style="color:#171717">${text}</p></div>`
      );
    }

    case "CONTACT": {
      const vcard = buildVCard(payload as ContactPayload);
      return new NextResponse(vcard, {
        headers: {
          "Content-Type": "text/vcard; charset=utf-8",
          "Content-Disposition": 'attachment; filename="contato.vcf"',
        },
      });
    }

    case "WIFI": {
      const p = payload as WifiPayload;
      const ssid = escapeHtml(p.ssid);
      const password = p.password ? escapeHtml(p.password) : "";
      return page(
        qrCode.name,
        `<h1>Conectar ao Wifi</h1>
         <div class="card">
           <div class="row"><span class="label">Rede</span><span class="value">${ssid}</span></div>
           ${password ? `<div class="row"><span class="label">Senha</span><span class="value" id="wifi-pass">${password}</span></div>` : ""}
         </div>
         ${password ? `<button id="wifi-pass-btn">Copiar senha</button>` : ""}
         <p>Seu navegador não consegue entrar na rede automaticamente — copie a senha e conecte pelas configurações de Wifi do aparelho.</p>
         ${password ? copyButtonScript("wifi-pass") : ""}`
      );
    }

    case "PIX": {
      const p = payload as PixPayload;
      const code = buildPix(p);
      const name = escapeHtml(p.name);
      const description = p.description ? escapeHtml(p.description) : "";
      return page(
        qrCode.name,
        `<h1>Pagar com Pix</h1>
         <div class="card">
           <div class="row"><span class="label">Recebedor</span><span class="value">${name}</span></div>
           ${p.amount ? `<div class="row"><span class="label">Valor</span><span class="value">R$ ${p.amount.toFixed(2)}</span></div>` : `<div class="row"><span class="label">Valor</span><span class="value">A definir</span></div>`}
           ${description ? `<div class="row"><span class="label">Descrição</span><span class="value">${description}</span></div>` : ""}
         </div>
         <textarea id="pix-code" readonly rows="4">${escapeHtml(code)}</textarea>
         <button id="pix-code-btn">Copiar código Pix</button>
         <p>Copie o código e cole em "Pix Copia e Cola" no app do seu banco.</p>
         ${copyButtonScript("pix-code", "value")}`
      );
    }

    default:
      return NextResponse.json({ error: "Tipo de QR não suportado" }, { status: 500 });
  }
}
