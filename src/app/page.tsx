import Link from "next/link";
import { PublicFooter, PublicHeader } from "@/components/PublicLayout";
import { DEFAULT_DESCRIPTION, jsonLd, pageMetadata, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Gerador de QR Code grátis: dinâmico, com logo e Pix | qrcode-sys",
  description: DEFAULT_DESCRIPTION,
  path: "/",
  absoluteTitle: true,
});

const QR_TYPES: { name: string; text: string; href?: string }[] = [
  { name: "Link (URL)", text: "Leve para um site, cardápio, formulário ou qualquer página." },
  {
    name: "Pix",
    text: "Receba pagamentos com QR code Pix e copia e cola, com ou sem valor.",
    href: "/qr-code-pix",
  },
  { name: "Wi-Fi", text: "Conecte visitantes à rede sem precisar digitar a senha." },
  { name: "WhatsApp e redes sociais", text: "Abra uma conversa, um perfil do Instagram, TikTok, YouTube e outros." },
  { name: "Contato (vCard)", text: "Salve nome, telefone, email e endereço direto na agenda." },
  { name: "Localização", text: "Abra um local, pela latitude e longitude, no app de mapas." },
  { name: "Aplicativo", text: "Mande para a App Store ou a Play Store conforme o celular." },
  { name: "SMS, email e telefone", text: "Inicie uma mensagem, um email ou uma ligação pronta." },
  { name: "Texto", text: "Mostre um texto livre, como instruções ou um recado." },
];

const FAQ: { q: string; a: string }[] = [
  {
    q: "O qrcode-sys é grátis mesmo?",
    a: "Sim. Criar, personalizar, baixar e acompanhar as estatísticas não custa nada e não há plano pago. O projeto é mantido de forma independente e aceita doações voluntárias, que não desbloqueiam nada extra.",
  },
  {
    q: "Preciso criar conta?",
    a: "Para o gerador de QR code Pix, não. Para salvar QR codes, criar QR codes dinâmicos e ver estatísticas, você entra com sua conta Google ou Microsoft, sem cadastro de senha.",
  },
  {
    q: "Qual a diferença entre QR code estático e dinâmico?",
    a: "No estático, o conteúdo fica gravado no próprio desenho: não dá para mudar depois, mas ele funciona para sempre, independente do site. No dinâmico, o QR aponta para um link curto do qrcode-sys, então você pode trocar o destino depois de impresso e ver quantas vezes foi escaneado. Pix e Wi-Fi são sempre estáticos, porque o app do banco e a câmera precisam ler os dados direto na imagem.",
  },
  {
    q: "O QR code expira?",
    a: "O estático não expira. O dinâmico continua funcionando enquanto o qrcode-sys estiver no ar, porque o redirecionamento passa pelo nosso servidor.",
  },
  {
    q: "Posso colocar meu logo no QR code?",
    a: "Sim. Envie uma imagem (PNG, JPEG, WebP ou SVG, até 500 KB) ou use um dos ícones prontos, e ajuste cores, formato dos pontos e moldura com texto.",
  },
  {
    q: "Quais dados das pessoas que escaneiam são coletados?",
    a: "Só nos QR codes dinâmicos: data e hora, navegador, página de origem e um hash do IP, nunca o IP em si. Acessos de robôs não contam. Os detalhes estão na Política de Privacidade.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: SITE_NAME,
          url: SITE_URL,
          description: DEFAULT_DESCRIPTION,
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Web",
          inLanguage: "pt-BR",
          isAccessibleForFree: true,
          offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
          featureList: [
            "QR code estático e dinâmico",
            "QR code Pix com ou sem valor",
            "Logo, cores, formatos e moldura personalizados",
            "Download em PNG e SVG",
            "Estatísticas de scan",
          ],
        })}
      />
      <PublicHeader />

      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-4 py-16 text-center sm:py-20">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
            Gerador de QR Code grátis
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-neutral-600">
            Crie QR codes para link, Pix, Wi-Fi, WhatsApp e muito mais. Personalize com cores,
            logo e moldura e, nos QR codes dinâmicos, acompanhe os scans em tempo real. Grátis, sem
            pegadinha.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/login"
              className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Criar QR code grátis
            </Link>
            <Link
              href="/qr-code-pix"
              className="rounded-md border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 hover:bg-neutral-100"
            >
              Gerar QR code Pix sem cadastro
            </Link>
          </div>
        </section>

        <section className="border-t border-neutral-200 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-14">
            <h2 className="text-2xl font-semibold text-neutral-900">Tipos de QR code</h2>
            <p className="mt-2 text-neutral-600">
              Escolha o que o QR code deve fazer quando alguém apontar a câmera do celular.
            </p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {QR_TYPES.map((t) => (
                <li key={t.name} className="rounded-lg border border-neutral-200 p-4">
                  <h3 className="font-medium text-neutral-900">
                    {t.href ? (
                      <Link href={t.href} className="underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900">
                        {t.name}
                      </Link>
                    ) : (
                      t.name
                    )}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-600">{t.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14">
          <h2 className="text-2xl font-semibold text-neutral-900">QR code com a cara da sua marca</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="font-medium text-neutral-900">Cores, formatos e modelos</h3>
              <p className="mt-1 leading-relaxed text-neutral-600">
                Escolha as cores do fundo, dos pontos e dos cantos, o formato dos pontos (clássico,
                arredondado, círculos…) ou comece por um modelo pronto.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-neutral-900">Logo no centro</h3>
              <p className="mt-1 leading-relaxed text-neutral-600">
                Envie o logo da sua empresa ou use ícones prontos de WhatsApp, Instagram, Pix, Wi-Fi
                e &quot;scan me&quot;.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-neutral-900">Moldura com chamada</h3>
              <p className="mt-1 leading-relaxed text-neutral-600">
                Adicione uma moldura com texto como &quot;Escaneie&quot; ou &quot;Cardápio&quot; para
                convidar as pessoas a apontar a câmera.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-neutral-900">PNG e SVG em alta resolução</h3>
              <p className="mt-1 leading-relaxed text-neutral-600">
                Baixe em PNG para usar na hora ou em SVG, que não perde qualidade na impressão de
                banners e cartazes.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-neutral-200 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-14">
            <h2 className="text-2xl font-semibold text-neutral-900">Estático ou dinâmico?</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-neutral-200 p-5">
                <h3 className="font-medium text-neutral-900">QR code estático</h3>
                <p className="mt-2 leading-relaxed text-neutral-600">
                  O conteúdo fica gravado no desenho. Não dá para editar depois, mas funciona para
                  sempre, mesmo se o qrcode-sys sair do ar. QR codes de Pix e Wi-Fi são sempre
                  estáticos: o app do banco e a câmera precisam ler os dados direto na imagem.
                </p>
              </div>
              <div className="rounded-lg border border-neutral-200 p-5">
                <h3 className="font-medium text-neutral-900">QR code dinâmico</h3>
                <p className="mt-2 leading-relaxed text-neutral-600">
                  Aponta para um link curto: você troca o destino depois de impresso e acompanha
                  quantas vezes foi escaneado, quando e de onde veio o acesso. Disponível para
                  link, WhatsApp e redes sociais, contato, localização, SMS, email, telefone,
                  texto e aplicativo.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14">
          <h2 className="text-2xl font-semibold text-neutral-900">Perguntas frequentes</h2>
          <div className="mt-6 divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
            {FAQ.map((item) => (
              <details key={item.q} className="p-4">
                <summary className="cursor-pointer font-medium text-neutral-900">{item.q}</summary>
                <p className="mt-2 leading-relaxed text-neutral-700">{item.a}</p>
              </details>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/login"
              className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Criar meu primeiro QR code
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
