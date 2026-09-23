import { z } from "zod";
import { normalizeWhatsappNumber, WHATSAPP_COUNTRY_CODES, WHATSAPP_MESSAGE_MAX } from "@/lib/whatsapp";

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal("")).transform((v) => v || undefined);

// Rejects `javascript:`/`data:`/etc. — these values get rendered as <a href>
// or used as redirect targets on pages served to whoever scans someone
// else's QR code, so only http(s) may ever reach that point.
const httpUrl = z.string().trim().url().refine((v) => /^https?:\/\//i.test(v), {
  message: "A URL precisa começar com http:// ou https://",
});
const optionalHttpUrl = z
  .string()
  .trim()
  .max(500)
  .optional()
  .or(z.literal(""))
  .transform((v) => v || undefined)
  .refine((v) => !v || /^https?:\/\//i.test(v), {
    message: "A URL precisa começar com http:// ou https://",
  });

export const urlPayloadSchema = z.object({
  kind: z.literal("URL"),
  payload: z.object({ url: httpUrl }),
});

export const textPayloadSchema = z.object({
  kind: z.literal("TEXT"),
  payload: z.object({ text: z.string().trim().min(1).max(2000) }),
});

export const contactPayloadSchema = z.object({
  kind: z.literal("CONTACT"),
  payload: z.object({
    firstName: z.string().trim().min(1).max(80),
    lastName: optionalText(80),
    org: optionalText(120),
    title: optionalText(120),
    phone: optionalText(30),
    cellPhone: optionalText(30),
    email: z.string().trim().email().optional().or(z.literal("")).transform((v) => v || undefined),
    website: optionalHttpUrl,
    street: optionalText(150),
    city: optionalText(80),
    state: optionalText(80),
    zip: optionalText(20),
    country: optionalText(80),
  }),
});

export const socialPayloadSchema = z.object({
  kind: z.literal("SOCIAL"),
  payload: z.object({
    platform: z.enum(["instagram", "facebook", "whatsapp", "x", "linkedin", "tiktok", "youtube"]),
    url: httpUrl,
  }),
});

export const whatsappPayloadSchema = z.object({
  kind: z.literal("WHATSAPP"),
  payload: z
    .object({
      country: z.enum(WHATSAPP_COUNTRY_CODES, "Escolha o país"),
      phone: z.string().trim().min(1, "Informe o número do WhatsApp").max(30),
      message: optionalText(WHATSAPP_MESSAGE_MAX),
    })
    // Guarda o número já normalizado (só a parte nacional, só dígitos).
    .transform((p, ctx) => {
      const phone = normalizeWhatsappNumber(p.country, p.phone);
      if (!phone) {
        ctx.addIssue({
          code: "custom",
          path: ["phone"],
          message: "Número inválido: confira o código de área (DDD) e o número",
        });
        return z.NEVER;
      }
      return { country: p.country, phone, message: p.message };
    }),
});

export const appPayloadSchema = z.object({
  kind: z.literal("APP"),
  payload: z
    .object({
      androidUrl: optionalHttpUrl,
      iosUrl: optionalHttpUrl,
      fallbackUrl: optionalHttpUrl,
    })
    .refine((p) => p.androidUrl || p.iosUrl || p.fallbackUrl, {
      message: "Informe pelo menos um link (Android, iOS ou fallback)",
    }),
});

export const locationPayloadSchema = z.object({
  kind: z.literal("LOCATION"),
  payload: z.object({
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
    label: optionalText(120),
  }),
});

export const smsPayloadSchema = z.object({
  kind: z.literal("SMS"),
  payload: z.object({
    phone: z.string().trim().min(1).max(30),
    message: optionalText(300),
  }),
});

export const emailPayloadSchema = z.object({
  kind: z.literal("EMAIL"),
  payload: z.object({
    to: z.string().trim().email(),
    subject: optionalText(200),
    body: optionalText(1000),
  }),
});

export const phonePayloadSchema = z.object({
  kind: z.literal("PHONE"),
  payload: z.object({ phone: z.string().trim().min(1).max(30) }),
});

export const wifiPayloadSchema = z.object({
  kind: z.literal("WIFI"),
  payload: z.object({
    ssid: z.string().trim().min(1).max(64),
    password: optionalText(64),
    encryption: z.enum(["WPA", "WEP", "nopass"]),
    hidden: z.boolean().default(false),
  }),
});

/**
 * Valor digitado no campo do Pix → número (ou undefined). Campo vazio = valor
 * livre; aceita vírgula decimal ("10,50", "1.234,56") além de ponto ("10.50").
 * Sem vírgula, ponto seguido de grupos de exatamente 3 dígitos é milhar, no
 * costume brasileiro: "1.234" = 1234 (não R$ 1,23), "1.234.567" = 1234567.
 */
export function normalizePixAmountInput(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.includes(",")) return trimmed.replace(/\./g, "").replace(",", ".");
  if (/^\d{1,3}(\.\d{3})+$/.test(trimmed)) return trimmed.replace(/\./g, "");
  return trimmed;
}

/** O campo 54 (valor) do BR Code tem no máximo 13 caracteres: "9999999999.99". */
export const PIX_MAX_AMOUNT = 9_999_999_999.99;

export const pixPayloadSchema = z.object({
  kind: z.literal("PIX"),
  payload: z.object({
    keyType: z.enum(["CPF", "CNPJ", "EMAIL", "PHONE", "RANDOM"]),
    key: z.string().trim().min(1).max(140),
    name: z.string().trim().min(1).max(80),
    city: z.string().trim().min(1).max(80),
    amount: z.preprocess(
      normalizePixAmountInput,
      z.coerce
        .number({ error: "Valor inválido: use só números, como 10,50" })
        // Não só positive(): "0,001" passaria e viraria "0.00" no BR Code, que os bancos recusam.
        .min(0.01, "O valor mínimo é R$ 0,01")
        .max(PIX_MAX_AMOUNT, "O valor máximo de um Pix é R$ 9.999.999.999,99")
        .optional()
    ),
    description: optionalText(60),
  }),
});

export const qrPayloadSchema = z.discriminatedUnion("kind", [
  urlPayloadSchema,
  textPayloadSchema,
  contactPayloadSchema,
  socialPayloadSchema,
  whatsappPayloadSchema,
  appPayloadSchema,
  locationPayloadSchema,
  smsPayloadSchema,
  emailPayloadSchema,
  phonePayloadSchema,
  wifiPayloadSchema,
  pixPayloadSchema,
]);

export type QrPayloadInput = z.infer<typeof qrPayloadSchema>;
