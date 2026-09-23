import Link from "next/link";
import { PixQrGenerator } from "@/components/PixQrGenerator";
import { PublicFooter, PublicHeader } from "@/components/PublicLayout";
import { jsonLd, pageMetadata, SITE_NAME, SITE_URL } from "@/lib/site";

const TITLE = "Gerador de QR Code Pix grátis, com ou sem valor";
const DESCRIPTION =
  "Gere o QR code Pix e o Pix copia e cola da sua chave em segundos, com ou sem valor definido. Grátis, sem cadastro e no padrão BR Code do Banco Central.";

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: "/qr-code-pix" });

const FAQ: { q: string; a: string }[] = [
  {
    q: "Preciso me cadastrar para gerar o QR code Pix?",
    a: "Não. O gerador desta página funciona sem login. O QR code é montado no seu navegador: a chave, o nome e os outros dados não são enviados nem guardados pelo qrcode-sys.",
  },
  {
    q: "Funciona em todos os bancos?",
    a: "O código segue o padrão BR Code (EMV) definido pelo Banco Central para o Pix, o mesmo que os apps dos bancos leem. Antes de imprimir, faça um teste pagando um valor pequeno pelo app do seu banco.",
  },
  {
    q: "Qual a diferença entre deixar o valor em branco e preencher?",
    a: "Sem valor, quem paga digita o valor no app do banco, e o mesmo QR serve para qualquer quantia (bom para doações, gorjetas e balcão). Com valor, o app já abre com a quantia preenchida.",
  },
  {
    q: "Qual tipo de chave Pix devo usar?",
    a: "Qualquer chave cadastrada funciona, mas quem ler o QR consegue ver a chave. Para QR codes expostos em público, prefira uma chave aleatória em vez de CPF ou telefone.",
  },
  {
    q: "O QR code Pix expira?",
    a: "Não. É um QR code estático: a chave fica gravada no próprio desenho e continua funcionando enquanto a chave estiver ativa no seu banco, mesmo sem o qrcode-sys no ar.",
  },
  {
    q: "Consigo saber se alguém pagou?",
    a: "O QR code Pix estático não avisa o recebedor. Confira os recebimentos no app do seu banco.",
  },
];

export default function PixQrCodePage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: `Gerador de QR Code Pix — ${SITE_NAME}`,
          url: `${SITE_URL}/qr-code-pix`,
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
          Gerador de QR Code Pix grátis
        </h1>
        <p className="mt-3 max-w-3xl leading-relaxed text-neutral-700">
          Preencha sua chave Pix, o nome e a cidade de quem recebe e baixe o QR code na hora, com
          ou sem valor. Você também recebe o <strong>Pix copia e cola</strong> para mandar por
          mensagem. Sem cadastro: tudo é gerado no seu navegador.
        </p>

        <div className="mt-8">
          <PixQrGenerator />
        </div>

        <section className="mt-12 rounded-lg border border-neutral-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-neutral-900">
            Quer saber quantas pessoas escanearam?
          </h2>
          <p className="mt-2 leading-relaxed text-neutral-700">
            Com uma conta grátis você cria QR codes <strong>dinâmicos</strong>: o destino pode
            ser alterado depois de impresso e você acompanha as estatísticas de scan. Além do Pix,
            dá para gerar QR code de link, Wi-Fi, WhatsApp, contato e outros tipos.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-block rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Criar conta grátis
          </Link>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-neutral-900">Como gerar o QR code Pix</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-6 leading-relaxed text-neutral-700">
            <li>Escolha o tipo de chave (CPF, CNPJ, email, telefone ou chave aleatória) e digite a chave.</li>
            <li>Informe o nome e a cidade de quem recebe, como aparecem no banco.</li>
            <li>Se quiser, defina um valor e uma descrição. Deixe o valor em branco para quem paga escolher.</li>
            <li>Personalize cores, logo e moldura e baixe em PNG ou SVG, ou copie o código Pix copia e cola.</li>
          </ol>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-neutral-900">Perguntas frequentes</h2>
          <div className="mt-4 divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
            {FAQ.map((item) => (
              <details key={item.q} className="group p-4">
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
