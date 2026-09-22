import type { Metadata } from "next";

// La página es un componente de cliente y no puede exportar metadata.
export const metadata: Metadata = { title: "Entrar" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
