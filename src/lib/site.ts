import type { Metadata } from "next";

/**
 * URL pública canônica do site. NEXT_PUBLIC_ porque várias páginas (home,
 * robots.txt, sitemap.xml, imagem de compartilhamento) são geradas no build —
 * precisa ser passada como build arg no Docker, igual ao link do PayPal.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://qrcode.neojr.com").replace(/\/+$/, "");

export const SITE_NAME = "qrcode-sys";

export const DEFAULT_DESCRIPTION =
  "Crie QR codes grátis para link, Pix, Wi-Fi, WhatsApp e contato. Personalize cores, logo e moldura e acompanhe os scans com QR code dinâmico.";

/** Gerada por src/app/opengraph-image.tsx. */
const SHARE_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "qrcode-sys — Gerador de QR Code grátis",
};

/**
 * Metadata de uma página pública. O Next mescla `openGraph`/`twitter` de forma
 * rasa (a página substitui o objeto inteiro do layout, inclusive a imagem
 * herdada do opengraph-image.tsx), então tudo que é compartilhado é repetido aqui.
 */
export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
}: {
  title: string;
  description: string;
  path: string;
  /** true = título usado como está, sem o sufixo "| qrcode-sys" do layout. */
  absoluteTitle?: boolean;
}): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: SITE_NAME,
      url: path,
      title: fullTitle,
      description,
      images: [SHARE_IMAGE],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [SHARE_IMAGE] },
  };
}

/** Serializa JSON-LD para <script>, escapando "<" (evita fechar a tag com "</script>"). */
export function jsonLd(data: Record<string, unknown>): { __html: string } {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
