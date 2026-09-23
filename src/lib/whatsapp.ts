// Monta o link https://wa.me/<número internacional> a partir do país + número
// digitado do jeito que a pessoa está acostumada ("(11) 98765-4321").

export type WhatsappCountry = {
  code: string; // ISO 3166-1 alfa-2 — EUA e Canadá compartilham o +1
  name: string;
  dial: string;
  flag: string;
  example: string;
  hint?: string;
};

// Brasil primeiro (público principal), depois lusófonos e vizinhos.
export const WHATSAPP_COUNTRIES: WhatsappCountry[] = [
  { code: "BR", name: "Brasil", dial: "55", flag: "🇧🇷", example: "(11) 98765-4321" },
  { code: "PT", name: "Portugal", dial: "351", flag: "🇵🇹", example: "912 345 678" },
  { code: "AO", name: "Angola", dial: "244", flag: "🇦🇴", example: "923 123 456" },
  { code: "MZ", name: "Moçambique", dial: "258", flag: "🇲🇿", example: "82 123 4567" },
  { code: "CV", name: "Cabo Verde", dial: "238", flag: "🇨🇻", example: "991 12 34" },
  {
    code: "AR",
    name: "Argentina",
    dial: "54",
    flag: "🇦🇷",
    example: "9 11 1234-5678",
    hint: "Celular da Argentina: comece com 9 e o código de área, sem o 0 e sem o 15.",
  },
  { code: "BO", name: "Bolívia", dial: "591", flag: "🇧🇴", example: "71234567" },
  { code: "CL", name: "Chile", dial: "56", flag: "🇨🇱", example: "9 1234 5678" },
  { code: "CO", name: "Colômbia", dial: "57", flag: "🇨🇴", example: "321 1234567" },
  { code: "EC", name: "Equador", dial: "593", flag: "🇪🇨", example: "99 123 4567" },
  { code: "MX", name: "México", dial: "52", flag: "🇲🇽", example: "55 1234 5678" },
  { code: "PY", name: "Paraguai", dial: "595", flag: "🇵🇾", example: "961 456789" },
  { code: "PE", name: "Peru", dial: "51", flag: "🇵🇪", example: "912 345 678" },
  { code: "UY", name: "Uruguai", dial: "598", flag: "🇺🇾", example: "94 231 234" },
  { code: "VE", name: "Venezuela", dial: "58", flag: "🇻🇪", example: "412 1234567" },
  { code: "US", name: "Estados Unidos", dial: "1", flag: "🇺🇸", example: "(201) 555-0123" },
  { code: "CA", name: "Canadá", dial: "1", flag: "🇨🇦", example: "(506) 234-5678" },
  { code: "ES", name: "Espanha", dial: "34", flag: "🇪🇸", example: "612 34 56 78" },
  { code: "FR", name: "França", dial: "33", flag: "🇫🇷", example: "06 12 34 56 78" },
  { code: "IT", name: "Itália", dial: "39", flag: "🇮🇹", example: "312 345 6789" },
  { code: "DE", name: "Alemanha", dial: "49", flag: "🇩🇪", example: "01512 3456789" },
  { code: "GB", name: "Reino Unido", dial: "44", flag: "🇬🇧", example: "07400 123456" },
  { code: "IE", name: "Irlanda", dial: "353", flag: "🇮🇪", example: "085 012 3456" },
  { code: "CH", name: "Suíça", dial: "41", flag: "🇨🇭", example: "078 123 45 67" },
  { code: "JP", name: "Japão", dial: "81", flag: "🇯🇵", example: "090-1234-5678" },
  { code: "AU", name: "Austrália", dial: "61", flag: "🇦🇺", example: "0412 345 678" },
];

export const WHATSAPP_COUNTRY_CODES = WHATSAPP_COUNTRIES.map((c) => c.code) as [string, ...string[]];

export function findWhatsappCountry(code: string): WhatsappCountry | undefined {
  return WHATSAPP_COUNTRIES.find((c) => c.code === code);
}

/**
 * Número digitado → parte nacional só com dígitos, pronta pra ir depois do
 * código do país. Retorna null se não der pra montar um número plausível.
 */
export function normalizeWhatsappNumber(countryCode: string, raw: string): string | null {
  const country = findWhatsappCountry(countryCode);
  if (!country) return null;
  let digits = raw.replace(/\D/g, "");

  if (country.code === "BR") {
    // "0 11 9..." (prefixo de longa distância) → sem o 0.
    digits = digits.replace(/^0+/, "");
    // Já veio com o 55 do país? Só dá pra saber pelo tamanho: 12/13 dígitos.
    // (10/11 dígitos começando com 55 é o DDD 55 do RS, não o país.)
    if ((digits.length === 12 || digits.length === 13) && digits.startsWith("55")) {
      digits = digits.slice(2);
    }
    // DDD (11–99, sem zero) + celular de 9 dígitos começando com 9, ou fixo de 8 (2–8).
    return /^[1-9][1-9](9\d{8}|[2-8]\d{7})$/.test(digits) ? digits : null;
  }

  if (country.dial === "1") {
    // EUA/Canadá: 10 dígitos; aceita o 1 do país na frente.
    if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
    return /^[2-9]\d{9}$/.test(digits) ? digits : null;
  }

  // Demais países: tira o 0 de discagem nacional (na Itália o 0 faz parte do número).
  if (country.code !== "IT") digits = digits.replace(/^0+/, "");
  // E.164: no máximo 15 dígitos contando o código do país.
  const total = country.dial.length + digits.length;
  return digits.length >= 6 && total <= 15 ? digits : null;
}

/** Número já normalizado → texto legível: "+55 (11) 98765-4321"; demais países "+351 912345678". */
export function formatWhatsappNumber(p: { country: string; phone: string }): string {
  const country = findWhatsappCountry(p.country);
  if (!country) return p.phone;
  const m = country.code === "BR" ? p.phone.match(/^(\d{2})(\d{4,5})(\d{4})$/) : null;
  return m ? `+55 (${m[1]}) ${m[2]}-${m[3]}` : `+${country.dial} ${p.phone}`;
}

/**
 * Limite da mensagem pronta: cada caractere entra no QR (acentos e emojis
 * ocupam mais), e QR muito denso fica difícil de ler impresso pequeno.
 */
export const WHATSAPP_MESSAGE_MAX = 200;

/**
 * Link wa.me do número (com a mensagem pronta em ?text=, se houver), ou null
 * se o número não for válido.
 */
export function buildWhatsappLink(p: { country: string; phone: string; message?: string }): string | null {
  const country = findWhatsappCountry(p.country);
  const national = normalizeWhatsappNumber(p.country, p.phone);
  if (!country || !national) return null;
  const message = p.message?.trim();
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${country.dial}${national}${query}`;
}
