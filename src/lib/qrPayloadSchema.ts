import { z } from "zod";

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

export const pixPayloadSchema = z.object({
  kind: z.literal("PIX"),
  payload: z.object({
    keyType: z.enum(["CPF", "CNPJ", "EMAIL", "PHONE", "RANDOM"]),
    key: z.string().trim().min(1).max(140),
    name: z.string().trim().min(1).max(80),
    city: z.string().trim().min(1).max(80),
    amount: z.coerce.number().positive().optional(),
    description: optionalText(60),
  }),
});

export const qrPayloadSchema = z.discriminatedUnion("kind", [
  urlPayloadSchema,
  textPayloadSchema,
  contactPayloadSchema,
  socialPayloadSchema,
  appPayloadSchema,
  locationPayloadSchema,
  smsPayloadSchema,
  emailPayloadSchema,
  phonePayloadSchema,
  wifiPayloadSchema,
  pixPayloadSchema,
]);

export type QrPayloadInput = z.infer<typeof qrPayloadSchema>;
