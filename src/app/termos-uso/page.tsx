import type { Metadata } from "next";
import { LegalPageLayout, LegalH2, LegalP, LegalUl } from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Termos de Uso — qrcode-sys",
};

export default function TermsOfUsePage() {
  return (
    <LegalPageLayout title="Termos de Uso" lastUpdated="4 de setembro de 2026">
      <LegalP>
        Estes termos regem o uso do qrcode-sys. Ao criar uma conta ou usar o serviço, você
        concorda com eles.
      </LegalP>

      <LegalH2>1. O serviço</LegalH2>
      <LegalP>
        O qrcode-sys permite criar QR codes estáticos e dinâmicos com personalização visual
        gratuita, e acompanhar estatísticas de scan para os dinâmicos. O serviço é gratuito e
        mantido por uma pessoa física como projeto pessoal — aceita doações voluntárias via
        PayPal, que não desbloqueiam nenhuma funcionalidade extra.
      </LegalP>

      <LegalH2>2. Conta e login</LegalH2>
      <LegalP>
        O login é feito exclusivamente via Google ou Microsoft (OAuth) — não existe cadastro com
        senha própria. Você é responsável por manter o acesso à sua conta Google/Microsoft
        segura; quem tiver acesso a ela terá acesso à sua conta no qrcode-sys.
      </LegalP>

      <LegalH2>3. Uso aceitável</LegalH2>
      <LegalP>Ao usar o qrcode-sys, você concorda em não criar QR codes que apontem para:</LegalP>
      <LegalUl>
        <li>Conteúdo ilegal, phishing, malware ou golpes;</li>
        <li>Spam ou distribuição de conteúdo não solicitado;</li>
        <li>Conteúdo que viole direitos autorais ou de propriedade intelectual de terceiros;</li>
        <li>Qualquer atividade que viole a lei brasileira ou os direitos de terceiros.</li>
      </LegalUl>
      <LegalP>
        Contas usadas para esses fins podem ter os QR codes removidos e o acesso suspenso ou
        encerrado, sem aviso prévio.
      </LegalP>

      <LegalH2>4. Seu conteúdo</LegalH2>
      <LegalP>
        Você é o único responsável pelo conteúdo, URLs de destino e materiais dos QR codes que
        cria. O qrcode-sys não revisa ativamente o destino de cada QR code criado.
      </LegalP>

      <LegalH2>5. Disponibilidade do serviço</LegalH2>
      <LegalP>
        O qrcode-sys é fornecido &quot;como está&quot;, sem garantias de disponibilidade contínua. Por ser
        um projeto pessoal e gratuito, não há SLA (acordo de nível de serviço) — o serviço pode
        sair do ar para manutenção, ou em último caso ser descontinuado, sem compromisso de aviso
        prévio.
      </LegalP>
      <LegalP>
        QR codes <strong>dinâmicos</strong> dependem do serviço estar no ar pra funcionar (o
        redirecionamento passa pelos nossos servidores). QR codes <strong>estáticos</strong>{" "}
        continuam funcionando independente do qrcode-sys, já que o conteúdo fica gravado
        diretamente no desenho do QR.
      </LegalP>

      <LegalH2>6. Limitação de responsabilidade</LegalH2>
      <LegalP>
        Na máxima extensão permitida por lei, o qrcode-sys não se responsabiliza por danos
        indiretos, perda de dados ou prejuízos decorrentes do uso ou da indisponibilidade do
        serviço, nem pelo conteúdo dos destinos apontados pelos QR codes criados por usuários.
      </LegalP>

      <LegalH2>7. Encerramento de conta</LegalH2>
      <LegalP>
        Você pode parar de usar o serviço a qualquer momento. Para excluir sua conta e os dados
        associados, entre em contato pelo email abaixo — veja também a{" "}
        <a href="/politica-privacidade" className="underline">
          Política de Privacidade
        </a>
        .
      </LegalP>

      <LegalH2>8. Alterações nestes termos</LegalH2>
      <LegalP>
        Podemos atualizar estes termos de tempos em tempos. A data no topo desta página sempre
        reflete a versão mais recente.
      </LegalP>

      <LegalH2>9. Lei aplicável</LegalH2>
      <LegalP>Estes termos são regidos pela legislação brasileira.</LegalP>

      <LegalH2>10. Contato</LegalH2>
      <LegalP>
        Dúvidas sobre estes termos:{" "}
        <a href="mailto:contato@rbacuri.dpdns.org" className="underline">
          contato@rbacuri.dpdns.org
        </a>
        .
      </LegalP>
    </LegalPageLayout>
  );
}
