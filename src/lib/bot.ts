// Robôs que abrem links sem ser uma pessoa escaneando: buscadores, geradores de
// prévia de link (WhatsApp, Telegram, redes sociais — não leem robots.txt e
// disparam toda vez que alguém compartilha o link), monitores e clientes HTTP.
//
// Falsos positivos já tratados: celulares Cubot ("CUBOT X30" contém "bot") e o
// navegador embutido do Pinterest ("[Pinterest/Android]") — o robô do Pinterest
// continua pego pelo "bot" de "Pinterestbot" / "pinterest.com/bot.html".
const BOT_UA =
  /(?<!cu)bot|crawl|spider|slurp|mediapartners|facebookexternalhit|facebookcatalog|meta-externalagent|whatsapp|telegram|skypeuripreview|embedly|vkshare|preview|headless|lighthouse|pagespeed|uptime|monitor|curl|wget|python-requests|python-urllib|httpx|aiohttp|go-http-client|okhttp|axios|node-fetch|undici|java\/|libwww|scrapy/i;

/** true quando o acesso quase certamente não é uma pessoa (inclui user agent vazio). */
export function isBotUserAgent(userAgent: string): boolean {
  return !userAgent.trim() || BOT_UA.test(userAgent);
}
