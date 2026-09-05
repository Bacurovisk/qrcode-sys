export type QrKind =
  | "URL"
  | "TEXT"
  | "CONTACT"
  | "SOCIAL"
  | "APP"
  | "LOCATION"
  | "SMS"
  | "EMAIL"
  | "PHONE"
  | "WIFI"
  | "PIX";

export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "whatsapp"
  | "x"
  | "linkedin"
  | "tiktok"
  | "youtube";

export type WifiEncryption = "WPA" | "WEP" | "nopass";

export type PixKeyType = "CPF" | "CNPJ" | "EMAIL" | "PHONE" | "RANDOM";

export type UrlPayload = { url: string };
export type TextPayload = { text: string };
export type ContactPayload = {
  firstName: string;
  lastName?: string;
  org?: string;
  title?: string;
  phone?: string;
  cellPhone?: string;
  email?: string;
  website?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
};
export type SocialPayload = { platform: SocialPlatform; url: string };
export type AppPayload = { androidUrl?: string; iosUrl?: string; fallbackUrl?: string };
export type LocationPayload = { lat: number; lng: number; label?: string };
export type SmsPayload = { phone: string; message?: string };
export type EmailPayload = { to: string; subject?: string; body?: string };
export type PhonePayload = { phone: string };
export type WifiPayload = {
  ssid: string;
  password?: string;
  encryption: WifiEncryption;
  hidden: boolean;
};
export type PixPayload = {
  keyType: PixKeyType;
  key: string;
  name: string;
  city: string;
  amount?: number;
  description?: string;
};

export type QrPayloadMap = {
  URL: UrlPayload;
  TEXT: TextPayload;
  CONTACT: ContactPayload;
  SOCIAL: SocialPayload;
  APP: AppPayload;
  LOCATION: LocationPayload;
  SMS: SmsPayload;
  EMAIL: EmailPayload;
  PHONE: PhonePayload;
  WIFI: WifiPayload;
  PIX: PixPayload;
};

export const QR_KINDS: { value: QrKind; label: string }[] = [
  { value: "URL", label: "URL" },
  { value: "TEXT", label: "Texto simples" },
  { value: "CONTACT", label: "Contato" },
  { value: "SOCIAL", label: "Rede social" },
  { value: "APP", label: "Aplicativo" },
  { value: "LOCATION", label: "Localização" },
  { value: "SMS", label: "SMS" },
  { value: "EMAIL", label: "Email" },
  { value: "PHONE", label: "Telefone" },
  { value: "WIFI", label: "Wifi" },
  { value: "PIX", label: "Pix" },
];

export const SOCIAL_PLATFORMS: { value: SocialPlatform; label: string }[] = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "x", label: "X (Twitter)" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
];

export const PIX_KEY_TYPES: { value: PixKeyType; label: string }[] = [
  { value: "CPF", label: "CPF" },
  { value: "CNPJ", label: "CNPJ" },
  { value: "EMAIL", label: "Email" },
  { value: "PHONE", label: "Telefone" },
  { value: "RANDOM", label: "Chave aleatória" },
];

/** Kinds where a QR image only makes sense as a redirect-through-us dynamic link. */
export const DYNAMIC_ONLY_KINDS: QrKind[] = ["APP"];

function escapeVCard(value: string): string {
  return value.replace(/([\\,;])/g, "\\$1").replace(/\n/g, "\\n");
}

export function buildVCard(p: ContactPayload): string {
  const lines = ["BEGIN:VCARD", "VERSION:3.0"];
  lines.push(`N:${escapeVCard(p.lastName ?? "")};${escapeVCard(p.firstName)};;;`);
  lines.push(`FN:${escapeVCard([p.firstName, p.lastName].filter(Boolean).join(" "))}`);
  if (p.org) lines.push(`ORG:${escapeVCard(p.org)}`);
  if (p.title) lines.push(`TITLE:${escapeVCard(p.title)}`);
  if (p.phone) lines.push(`TEL;TYPE=WORK,VOICE:${p.phone}`);
  if (p.cellPhone) lines.push(`TEL;TYPE=CELL:${p.cellPhone}`);
  if (p.email) lines.push(`EMAIL:${p.email}`);
  if (p.website) lines.push(`URL:${p.website}`);
  if (p.street || p.city || p.state || p.zip || p.country) {
    lines.push(
      `ADR;TYPE=WORK:;;${escapeVCard(p.street ?? "")};${escapeVCard(p.city ?? "")};${escapeVCard(
        p.state ?? ""
      )};${escapeVCard(p.zip ?? "")};${escapeVCard(p.country ?? "")}`
    );
  }
  lines.push("END:VCARD");
  return lines.join("\r\n");
}

function escapeWifi(value: string): string {
  return value.replace(/([\\;,":])/g, "\\$1");
}

export function buildWifi(p: WifiPayload): string {
  const security = p.encryption === "nopass" ? "nopass" : p.encryption;
  const passwordSegment = p.encryption === "nopass" ? "" : `P:${escapeWifi(p.password ?? "")};`;
  return `WIFI:T:${security};S:${escapeWifi(p.ssid)};${passwordSegment}H:${p.hidden ? "true" : "false"};;`;
}

export function buildMailto(p: EmailPayload): string {
  const params = new URLSearchParams();
  if (p.subject) params.set("subject", p.subject);
  if (p.body) params.set("body", p.body);
  const qs = params.toString();
  return `mailto:${p.to}${qs ? `?${qs}` : ""}`;
}

export function buildTel(p: PhonePayload): string {
  return `tel:${p.phone}`;
}

/** Format recognized by both Android and iOS camera QR scanners directly. */
export function buildSmsStatic(p: SmsPayload): string {
  return `SMSTO:${p.phone}:${p.message ?? ""}`;
}

/** `sms:` URI scheme, for use as an actual HTTP redirect target. */
export function buildSmsRedirect(p: SmsPayload): string {
  const params = new URLSearchParams();
  if (p.message) params.set("body", p.message);
  const qs = params.toString();
  return `sms:${p.phone}${qs ? `?${qs}` : ""}`;
}

/** `geo:` URI — works offline, recognized directly by camera QR scanners. */
export function buildGeoStatic(p: LocationPayload): string {
  const label = p.label ? `?q=${p.lat},${p.lng}(${encodeURIComponent(p.label)})` : "";
  return `geo:${p.lat},${p.lng}${label}`;
}

/** Google Maps link — used as the dynamic redirect target (real https URL). */
export function buildMapsUrl(p: LocationPayload): string {
  return `https://www.google.com/maps?q=${p.lat},${p.lng}`;
}

function stripAccents(value: string): string {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

/** Pix text fields must be plain ASCII (banks reject accented/special chars). */
function sanitizePixText(value: string): string {
  return stripAccents(value).replace(/[^A-Za-z0-9 ]/g, "");
}

export function normalizePixKey(keyType: PixKeyType, rawKey: string): string {
  if (keyType === "CPF" || keyType === "CNPJ") return rawKey.replace(/\D/g, "");
  if (keyType === "PHONE") {
    const digits = rawKey.replace(/\D/g, "");
    return digits.startsWith("55") ? `+${digits}` : `+55${digits}`;
  }
  if (keyType === "RANDOM") return rawKey.trim().toLowerCase();
  return rawKey.trim();
}

// CRC-16/CCITT-FALSE: poly 0x1021, init 0xFFFF, no reflection. Verified
// against the official check value ("123456789" -> 0x29B1) and against a
// production Pix implementation (php_qrcode_pix, tested against 10+
// Brazilian banks) that uses the identical algorithm.
function crc16CcittFalse(input: string): string {
  let crc = 0xffff;
  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function emvField(id: string, value: string): string {
  return `${id}${value.length.toString().padStart(2, "0")}${value}`;
}

/**
 * Builds a Pix "BR Code" (EMV Merchant Presented Mode) payload — the same
 * string used for both a scannable QR image and "Pix Copia e Cola" text.
 * Field layout verified against the Banco Central-published structure and
 * cross-checked against a bank-tested reference implementation.
 */
export function buildPix(p: PixPayload): string {
  const key = normalizePixKey(p.keyType, p.key);
  const name = sanitizePixText(p.name).slice(0, 25).toUpperCase() || "RECEBEDOR";
  const city = sanitizePixText(p.city).slice(0, 15).toUpperCase() || "BRASIL";

  let merchantAccount = emvField("00", "BR.GOV.BCB.PIX") + emvField("01", key);
  if (p.description) {
    const description = sanitizePixText(p.description).slice(0, 25);
    if (description) merchantAccount += emvField("02", description);
  }

  const parts = [
    emvField("00", "01"), // Payload Format Indicator
    emvField("26", merchantAccount), // Merchant Account Info (Pix)
    emvField("52", "0000"), // Merchant Category Code
    emvField("53", "986"), // Currency: BRL
    p.amount ? emvField("54", p.amount.toFixed(2)) : "",
    emvField("58", "BR"), // Country
    emvField("59", name), // Merchant name
    emvField("60", city), // Merchant city
    emvField("62", emvField("05", "***")), // No reconciliation txid
  ].join("");

  const withCrcTag = `${parts}6304`;
  return withCrcTag + crc16CcittFalse(withCrcTag);
}

/** Short human-readable summary of a QR's content, for list views. */
export function summarizePayload<K extends QrKind>(kind: K, payload: QrPayloadMap[K]): string {
  switch (kind) {
    case "URL":
      return (payload as UrlPayload).url;
    case "TEXT":
      return (payload as TextPayload).text;
    case "CONTACT": {
      const p = payload as ContactPayload;
      return [p.firstName, p.lastName].filter(Boolean).join(" ");
    }
    case "SOCIAL": {
      const p = payload as SocialPayload;
      const label = SOCIAL_PLATFORMS.find((s) => s.value === p.platform)?.label ?? p.platform;
      return `${label} — ${p.url}`;
    }
    case "APP": {
      const p = payload as AppPayload;
      return [p.androidUrl && "Android", p.iosUrl && "iOS"].filter(Boolean).join(" + ") || "—";
    }
    case "LOCATION": {
      const p = payload as LocationPayload;
      return p.label || `${p.lat}, ${p.lng}`;
    }
    case "SMS":
      return (payload as SmsPayload).phone;
    case "EMAIL":
      return (payload as EmailPayload).to;
    case "PHONE":
      return (payload as PhonePayload).phone;
    case "WIFI":
      return (payload as WifiPayload).ssid;
    case "PIX": {
      const p = payload as PixPayload;
      return p.amount ? `${p.name} — R$ ${p.amount.toFixed(2)}` : p.name;
    }
    default:
      return "";
  }
}

/** The literal string encoded into a STATIC QR image for this kind/payload. */
export function getStaticContent<K extends QrKind>(kind: K, payload: QrPayloadMap[K]): string {
  switch (kind) {
    case "URL":
      return (payload as UrlPayload).url;
    case "TEXT":
      return (payload as TextPayload).text;
    case "CONTACT":
      return buildVCard(payload as ContactPayload);
    case "SOCIAL":
      return (payload as SocialPayload).url;
    case "APP": {
      const p = payload as AppPayload;
      return p.androidUrl || p.iosUrl || p.fallbackUrl || "";
    }
    case "LOCATION":
      return buildGeoStatic(payload as LocationPayload);
    case "SMS":
      return buildSmsStatic(payload as SmsPayload);
    case "EMAIL":
      return buildMailto(payload as EmailPayload);
    case "PHONE":
      return buildTel(payload as PhonePayload);
    case "WIFI":
      return buildWifi(payload as WifiPayload);
    case "PIX":
      return buildPix(payload as PixPayload);
    default:
      return "";
  }
}
