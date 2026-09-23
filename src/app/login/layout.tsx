import type { Metadata } from "next";
import type { ReactNode } from "react";

// A página de login é client component (não pode exportar metadata), então fica aqui.
// noindex, mas follow: o robô pode seguir os links pros Termos e a Privacidade.
export const metadata: Metadata = {
  title: "Entrar",
  description: "Entre no qrcode-sys com sua conta Google ou Microsoft.",
  robots: { index: false, follow: true },
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}
