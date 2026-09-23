import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /r/ bloqueado pra robôs nem abrirem os links dos QRs (não indexar
      // destino de terceiros nem inflar scans). /login fica liberado de
      // propósito: ele tem noindex, e o robô só enxerga o noindex se puder entrar.
      disallow: ["/r/", "/api/", "/dashboard"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
