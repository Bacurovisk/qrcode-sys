import { createHmac, timingSafeEqual } from "crypto";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** Cookie que marca "resolveu o desafio recentemente", escopado por IP. */
export const BYPASS_COOKIE_NAME = "ts_ok";
const BYPASS_TTL_MS = 10 * 60 * 1000;

export function isTurnstileConfigured(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}

export async function verifyTurnstileToken(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return false;

  const body = new URLSearchParams({ secret, response: token, remoteip: ip });
  try {
    const res = await fetch(VERIFY_URL, { method: "POST", body });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

// Assinado com o próprio TURNSTILE_SECRET_KEY (já é um segredo só do
// servidor) em vez de introduzir mais uma env var só pra isso.
function sign(payload: string): string {
  const secret = process.env.TURNSTILE_SECRET_KEY ?? "";
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function bypassCookieValue(ip: string): string {
  const expires = Date.now() + BYPASS_TTL_MS;
  const payload = `${ip}.${expires}`;
  return `${payload}.${sign(payload)}`;
}

export function isBypassCookieValid(cookieValue: string | undefined, ip: string): boolean {
  if (!cookieValue) return false;
  const [cookieIp, expiresStr, sig] = cookieValue.split(".");
  if (!cookieIp || !expiresStr || !sig) return false;
  if (cookieIp !== ip) return false;

  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || expires < Date.now()) return false;

  const expected = sign(`${cookieIp}.${expiresStr}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function getCookie(cookieHeader: string | null, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
}
