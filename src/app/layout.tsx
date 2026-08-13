import type { Metadata } from "next";
import "./globals.css";
import AlertPanel from "@/components/feedback/AlertPanel";

export const metadata: Metadata = {
  title: "Puntos Popular",
  description: "Sistema de Puntos Popular",
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
        <AlertPanel />
      </body>
    </html>
  );
}