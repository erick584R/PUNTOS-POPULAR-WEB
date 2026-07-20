import type { Metadata } from "next";
import "./globals.css"; // <-- Esto cargará los estilos para todo el sitio

export const metadata: Metadata = {
  title: "Puntos Popular",
  description: "Portal de Agentes Corresponsales - Banco Popular Honduras",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}