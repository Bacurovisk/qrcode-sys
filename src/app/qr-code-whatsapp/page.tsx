import Link from "next/link";
import { PublicFooter, PublicHeader } from "@/components/PublicLayout";
import { WhatsappQrGenerator } from "@/components/WhatsappQrGenerator";
import { jsonLd, pageMetadata, SITE_NAME, SITE_URL } from "@/lib/site";

const TITLE = "Gerador de QR Code para WhatsApp grátis";
const DESCRIPTION =
  "Crie o QR code do seu WhatsApp em segundos: escolha o país, digite o número com DDD e baixe. Abre a conversa direto no app. Grátis e sem cadastro.";

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: "/qr-code-whatsapp" });

const FAQ: { q: string; a: string }[] = [
  {
    q: "Preciso me cadastrar para gerar o QR code do WhatsApp?",
    a: "Não. O gerador desta página funciona sem login e monta o QR code no seu navegador: o número não é enviado nem guardado pelo qrcode-sys.",
  },
  {
    q: "Como a pessoa fala comigo depois de escanear?",
    a: "O QR code abre um link wa.me com o seu número. No celular, a câmera oferece abrir o WhatsApp direto na conversa com você, sem precisar salvar o contato.",
  },
  {
    q: "Como digito o número?",
    a: "Escolha o país e digite o número do jeito que você já usa, com DDD: por exemplo (11) 98765-4321. O sistema tira espaços, traços e parênteses, remove o 0 de longa distância e junta o código do país sozinho.",
  },
  {
    q: "Posso deixar uma mensagem já escrita?",
    a: "Sim. Preencha o campo \"Mensagem pronta\" (até 200 caracteres) com algo como \"Olá, vim pelo QR code do cardápio\". Quem escanear abre a conversa com o texto já digitado e só precisa tocar em enviar, e você já sabe de onde veio o contato.",
  },
  {
    q: "Funciona com WhatsApp Business?",
    a: "Sim. O link wa.me funciona com contas pessoais e do WhatsApp Business, inclusive número fixo cadastrado no Business.",
  },
  {
    q: "O QR code do WhatsApp expira?",
    a: "Não. O link fica gravado na própria imagem e funciona enquanto o número tiver WhatsApp, mesmo sem o qrcode-sys no ar.",
  },
  {
    q: "Dá para ver quantas pessoas escanearam?",
    a: "Não neste gerador sem cadastro, porque o QR leva direto ao WhatsApp sem passar pelo qrcode-sys. Com uma conta grátis você cria um QR code de WhatsApp dinâmico, que conta os scans e permite trocar o número depois de impresso.",
  },
];

export default function WhatsappQrCodePage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: `Gerador de QR Code para WhatsApp — ${SITE_NAME}`,
          url: `${SITE_URL}/qr-code-whatsapp`,
          description: DESCRIPTION,
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Web",
          inLanguage: "pt-BR",
          isAccessibleForFree: true,
          offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
        })}
      />
      <PublicHeader />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
          Gerador de QR Code para WhatsApp
        </h1>
        <p className="mt-3 max-w-3xl leading-relaxed text-neutral-700">
          Escolha o país, digite o número com DDD e pronto: quem escanear abre uma conversa com
          você no WhatsApp, sem precisar salvar o contato, e pode até vir com uma mensagem
          pronta. Ideal para cartão de visita, balcão, cardápio e embalagens. Sem cadastro: tudo
          é gerado no seu navegador.
        </p>

        <div className="mt-8">
          <WhatsappQrGenerator />
        </div>

        <section className="mt-12 rounded-lg border border-neutral-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-neutral-900">
            Quer contar os scans ou trocar o número depois?
          </h2>
          <p className="mt-2 leading-relaxed text-neutral-700">
            Com uma conta grátis você cria o QR code do WhatsApp como <strong>dinâmico</strong>:
            dá para trocar o número depois de impresso e acompanhar quantas vezes ele foi
            escaneado.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-block rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Criar conta grátis
          </Link>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-neutral-900">Como criar o QR code do WhatsApp</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-6 leading-relaxed text-neutral-700">
            <li>Escolha o país do número (Brasil já vem selecionado).</li>
            <li>Digite o número com DDD, do jeito que preferir: com ou sem espaços, traços e parênteses.</li>
            <li>Se quiser, escreva uma mensagem pronta para abrir já digitada na conversa.</li>
            <li>Confira o link gerado e, se quiser, toque em &quot;Testar no WhatsApp&quot;.</li>
            <li>Personalize cores, logo e moldura e baixe em PNG ou SVG.</li>
          </ol>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-neutral-900">Perguntas frequentes</h2>
          <div className="mt-4 divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
            {FAQ.map((item) => (
              <details key={item.q} className="p-4">
                <summary className="cursor-pointer font-medium text-neutral-900">{item.q}</summary>
                <p className="mt-2 leading-relaxed text-neutral-700">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
