import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Só páginas públicas com conteúdo próprio. Sem lastModified/priority: o Google
// ignora changefreq/priority e desconfia de lastmod que muda a cada build.
const PUBLIC_PATHS = ["/", "/qr-code-pix", "/qr-code-whatsapp", "/doar", "/termos-uso", "/politica-privacidade"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHS.map((path) => ({ url: `${SITE_URL}${path === "/" ? "" : path}` }));
}
