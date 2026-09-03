const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.EMAIL_FROM_ADDRESS;
  const fromName = process.env.EMAIL_FROM_NAME ?? "qrcode-sys";

  if (!apiKey || !fromEmail) {
    throw new Error("BREVO_API_KEY ou EMAIL_FROM_ADDRESS não configurados");
  }

  const res = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: { email: fromEmail, name: fromName },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Falha ao enviar email via Brevo (${res.status}): ${body}`);
  }
}

function appUrl(): string {
  return process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}

function layout(title: string, bodyHtml: string): string {
  return `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #171717;">
      <h1 style="font-size: 20px; margin: 0 0 16px;">${title}</h1>
      ${bodyHtml}
      <p style="margin-top: 32px; font-size: 12px; color: #737373;">qrcode-sys</p>
    </div>
  `;
}

function button(href: string, label: string): string {
  return `
    <a href="${href}"
       style="display: inline-block; margin-top: 16px; padding: 10px 20px; background: #171717; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px;">
      ${label}
    </a>
  `;
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const link = `${appUrl()}/verify-email?token=${token}`;
  await sendEmail({
    to: email,
    subject: "Confirme sua conta no qrcode-sys",
    html: layout(
      "Confirme seu email",
      `<p>Falta pouco. Clique no botão abaixo para confirmar sua conta.</p>
       ${button(link, "Confirmar email")}
       <p style="margin-top: 16px; font-size: 13px; color: #737373;">O link expira em 24 horas. Se não foi você quem criou essa conta, ignore este email.</p>`
    ),
  });
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const link = `${appUrl()}/reset-password?token=${token}`;
  await sendEmail({
    to: email,
    subject: "Redefinir sua senha no qrcode-sys",
    html: layout(
      "Redefinir senha",
      `<p>Recebemos um pedido para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha.</p>
       ${button(link, "Redefinir senha")}
       <p style="margin-top: 16px; font-size: 13px; color: #737373;">O link expira em 1 hora. Se não foi você quem pediu, ignore este email — sua senha continua a mesma.</p>`
    ),
  });
}
