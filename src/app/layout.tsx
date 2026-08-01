import type { Metadata } from "next";
import { SignalRProvider } from "@/providers/SignalRProvider";
import "./globals.css";

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
        <SignalRProvider>
          {children}
        </SignalRProvider>
      </body>
    </html>
  );
}