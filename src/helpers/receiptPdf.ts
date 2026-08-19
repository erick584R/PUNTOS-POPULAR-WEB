"use client";

import jsPDF from "jspdf";

export interface ReceiptItem {
  campo: string;
  valor: string;
}

interface GenerateReceiptPdfProps {
  title: string;
  subtitle?: string;
  logoDataUrl?: string;
  items: ReceiptItem[];
  footerLeft?: string;
  footerRight?: string;
}

async function loadImageAsDataUrl(src: string): Promise<string> {
  const response = await fetch(src);
  const blob = await response.blob();

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function generateReceiptPdf({
  title,
  subtitle,
  logoDataUrl,
  items,
  footerLeft,
  footerRight,
}: GenerateReceiptPdfProps) {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const marginX = 18;
  let y = 14;

  // Logo
  if (logoDataUrl) {
    pdf.addImage(logoDataUrl, "PNG", pageWidth / 2 - 16, y, 32, 16);
    y += 22;
  }

  // Título
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.text(title, pageWidth / 2, y, { align: "center" });
  y += 7;

  // Subtítulo
  if (subtitle) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(subtitle, pageWidth / 2, y, { align: "center" });
    y += 10;
  }

  // Línea separadora
  pdf.setDrawColor(220);
  pdf.line(marginX, y, pageWidth - marginX, y);
  y += 8;

  // Tabla de campos
  pdf.setFontSize(10);

  for (const item of items) {
    const leftText = item.campo;
    const rightText = item.valor;

    const wrappedLeft = pdf.splitTextToSize(leftText, 62);
    const wrappedRight = pdf.splitTextToSize(rightText, 92);

    const rowHeight = Math.max(wrappedLeft.length, wrappedRight.length) * 5 + 4;

    pdf.setFont("helvetica", "bold");
    pdf.text(wrappedLeft, marginX, y + 3);

    pdf.setFont("helvetica", "normal");
    pdf.text(wrappedRight, marginX + 68, y + 3);

    y += rowHeight;

    pdf.setDrawColor(235);
    pdf.line(marginX, y - 1, pageWidth - marginX, y - 1);
  }

  // Más espacio para bajar las firmas
  y += 25;

  // Firmas centradas
  const centerX = pageWidth / 2;
  const lineWidth = 56;

  // Firma cliente
  const clientLineY = y;
  pdf.setDrawColor(180);
  pdf.line(centerX - lineWidth / 2, clientLineY, centerX + lineWidth / 2, clientLineY);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text("Firma Cliente", centerX, clientLineY + 5, { align: "center" });

  // Firma agente más abajo
  const agentLineY = clientLineY + 24;
  pdf.setDrawColor(180);
  pdf.line(centerX - lineWidth / 2, agentLineY, centerX + lineWidth / 2, agentLineY);
  pdf.text("Firma Agente", centerX, agentLineY + 5, { align: "center" });

  pdf.save(`${title.replace(/\s+/g, "_").toLowerCase()}.pdf`);
}

export async function getPopularLogoDataUrl(): Promise<string> {
  return loadImageAsDataUrl("/imgs/puntos-popular-logo.png");
}