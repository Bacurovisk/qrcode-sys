import type { Metadata } from "next";
import { LegalPageLayout, LegalH2, LegalP, LegalUl } from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Política de Privacidade — qrcode-sys",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Política de Privacidade" lastUpdated="4 de setembro de 2026">
      <LegalP>
        O qrcode-sys é um serviço gratuito para criar e gerenciar QR codes estáticos e dinâmicos.
        Esta página explica quais dados coletamos, para que usamos e quais direitos você tem
        sobre eles.
      </LegalP>

      <LegalH2>1. Quais dados coletamos</LegalH2>
      <LegalP>
        <strong>Dados da conta:</strong> quando você entra com Google ou Microsoft, recebemos do
        provedor seu nome, endereço de email e foto de perfil (se disponível). Não temos acesso à
        sua senha do Google/Microsoft nem a qualquer outro dado da sua conta nesses provedores —
        o login usa OAuth, o qrcode-sys nunca vê sua senha.
      </LegalP>
      <LegalP>
        <strong>Conteúdo que você cria:</strong> nome, URL de destino e opções de personalização
        visual (cor, formato dos pontos, logo) de cada QR code que você cria.
      </LegalP>
      <LegalP>
        <strong>Dados de uso dos QR codes dinâmicos:</strong> cada vez que alguém escaneia um QR
        dinâmico seu, registramos data/hora, o &quot;user agent&quot; do navegador, a página de referência
        (se houver) e um hash do endereço IP de quem escaneou — nunca guardamos o IP em texto
        puro, só uma versão embaralhada usada apenas para estatísticas agregadas. QR codes
        estáticos não passam por nenhum servidor nosso ao serem escaneados, então não geram
        nenhum dado de uso.
      </LegalP>

      <LegalH2>2. Como usamos os dados</LegalH2>
      <LegalUl>
        <li>Autenticar você e manter sua sessão logada;</li>
        <li>Exibir e gerenciar os QR codes da sua conta;</li>
        <li>Mostrar as estatísticas de scan dos seus QR codes dinâmicos;</li>
        <li>Manter o serviço no ar e investigar abuso ou uso indevido.</li>
      </LegalUl>
      <LegalP>Não usamos seus dados para publicidade, e não vendemos dados a ninguém.</LegalP>

      <LegalH2>3. Cookies</LegalH2>
      <LegalP>
        Usamos apenas um cookie essencial de sessão (via NextAuth/Auth.js) para manter você
        logado. Não usamos cookies de publicidade, rastreamento entre sites ou analytics de
        terceiros.
      </LegalP>

      <LegalH2>4. Com quem compartilhamos dados</LegalH2>
      <LegalUl>
        <li>
          <strong>Google e Microsoft</strong> — apenas para o processo de login (OAuth); eles não
          recebem seus QR codes nem dados de scan.
        </li>
        <li>
          <strong>PayPal</strong> — só se você clicar no botão de doação, que te leva pro site do
          PayPal; o qrcode-sys não envia nenhum dado seu ao PayPal nesse processo.
        </li>
      </LegalUl>
      <LegalP>
        O serviço roda em infraestrutura própria (self-hosted), não terceirizamos o banco de
        dados a nenhum provedor de nuvem.
      </LegalP>

      <LegalH2>5. Retenção e exclusão</LegalH2>
      <LegalP>
        Mantemos sua conta e seus QR codes enquanto ela existir. Hoje a exclusão de conta ainda
        não é self-service — para apagar sua conta e todos os dados associados, entre em contato
        pelo email abaixo. Você pode excluir QR codes individuais a qualquer momento pelo painel.
      </LegalP>

      <LegalH2>6. Seus direitos (LGPD)</LegalH2>
      <LegalP>
        Como usuário no Brasil, você tem direito a acessar, corrigir, portar ou solicitar a
        exclusão dos seus dados pessoais, conforme a Lei Geral de Proteção de Dados (LGPD).
        Entre em contato pelo email abaixo para exercer qualquer um desses direitos.
      </LegalP>

      <LegalH2>7. Crianças</LegalH2>
      <LegalP>O qrcode-sys não é direcionado a menores de 13 anos.</LegalP>

      <LegalH2>8. Alterações nesta política</LegalH2>
      <LegalP>
        Podemos atualizar esta política de tempos em tempos. A data no topo desta página sempre
        reflete a versão mais recente.
      </LegalP>

      <LegalH2>9. Contato</LegalH2>
      <LegalP>
        Dúvidas sobre privacidade ou pedidos relacionados aos seus dados:{" "}
        <a href="mailto:contato@rbacuri.dpdns.org" className="underline">
          contato@rbacuri.dpdns.org
        </a>
        .
      </LegalP>
    </LegalPageLayout>
  );
}
