import { z } from "zod";

// Valida no servidor a aparência (coluna `style`, JSON livre no banco) — o
// limite de 500 KB do logo em QrEditor é só do navegador; sem isto qualquer
// usuário logado poderia gravar um JSON de vários MB direto pela API.

export const FRAME_TYPE_VALUES = [
  "none",
  "circle",
  "text-bottom",
  "box-bottom",
  "box-top",
  "button-bottom",
  "bubble-top",
] as const;

export const FRAME_TEXT_MAX = 20;

/** 500 KB de imagem viram ~667 KB em base64; o resto do estilo é pequeno. */
export const STYLE_MAX_BYTES = 700 * 1024;

const DOT_TYPES = ["dots", "rounded", "classy", "classy-rounded", "square", "extra-rounded"] as const;
const CORNER_SQUARE_TYPES = [...DOT_TYPES, "dot"] as const;
const CORNER_DOT_TYPES = [...DOT_TYPES, "dot"] as const;

const color = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida");

// Só imagem embutida em base64 — nunca URL externa (o QR seria desenhado
// buscando um recurso de terceiros) nem outro tipo de data URI.
const imageDataUri = z
  .string()
  .max(STYLE_MAX_BYTES, "Logo muito grande (máx. 500 KB)")
  .regex(
    /^data:image\/(png|jpeg|webp|svg\+xml);base64,[A-Za-z0-9+/]+={0,2}$/,
    "Logo inválido: envie uma imagem PNG, JPEG, WebP ou SVG",
  );

// z.object descarta chaves desconhecidas, então nada fora disto chega ao banco.
export const qrStyleSchema = z
  .object({
    dotsOptions: z.object({ type: z.enum(DOT_TYPES).optional(), color: color.optional() }).optional(),
    backgroundOptions: z.object({ color: color.optional() }).optional(),
    cornersSquareOptions: z
      .object({ type: z.enum(CORNER_SQUARE_TYPES).optional(), color: color.optional() })
      .optional(),
    cornersDotOptions: z
      .object({ type: z.enum(CORNER_DOT_TYPES).optional(), color: color.optional() })
      .optional(),
    image: imageDataUri.optional(),
    frame: z
      .object({
        type: z.enum(FRAME_TYPE_VALUES),
        text: z.string().max(FRAME_TEXT_MAX).optional(),
        color: color.optional(),
      })
      .optional(),
  })
  .refine((style) => JSON.stringify(style).length <= STYLE_MAX_BYTES, {
    message: "Aparência muito grande — use um logo menor (máx. 500 KB)",
  });
