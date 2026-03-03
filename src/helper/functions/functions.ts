import { WorkTimeLike } from "../types/types";

// Parsea un valor como un entero positivo. Retorna null si no es válido.
export function parsePositiveInt(value: unknown): number | null {
  const n =
    typeof value === "string" || typeof value === "number"
      ? Number(value)
      : NaN;
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

// Parsea un valor como una fecha opcional. Retorna null si no es válida o no está presente.
export function parseOptionalDate(value: unknown): Date | null {
  if (typeof value !== "string") return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

// Dibuja un par clave-valor en el documento PDF de la cabecera
export function drawKeyValue(
  doc: PDFKit.PDFDocument,
  key: string,
  value: string,
): void {
  doc.font("Helvetica-Bold").text(`${key}: `, { continued: true });
  doc.font("Helvetica").text(value);
}

// Formatea una fecha como cadena legible en formato ES local
export function formatDateTime(d: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

// Formatea una fecha solo con la parte de fecha en formato ES local
export function formatDateOnly(d: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}
// Formatea una duración en milisegundos como "HH:MM"
export function formatDurationMs(ms: number): string {
  if (ms <= 0 || Number.isNaN(ms)) return "00:00";
  const totalMinutes = Math.floor(ms / 60000);
  const hh = Math.floor(totalMinutes / 60);
  const mm = totalMinutes % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}
// Suma las duraciones de los workTimes dados en milisegundos
export function sumDurations(workTimes: WorkTimeLike[]): number {
  let total = 0;
  for (const wt of workTimes) {
    if (!wt.clockOut) continue;
    total += wt.clockOut.getTime() - wt.clockIn.getTime();
  }
  return total;
}
// Dibuja un título de sección en el documento PDF
export function drawSectionTitle(doc: PDFKit.PDFDocument, title: string): void {
  doc.moveDown(0.6);
  doc.font("Helvetica-Bold").fontSize(13).text(title);
  doc.moveDown(0.2);
  doc
    .moveTo(doc.page.margins.right, doc.y)
    .lineTo(doc.page.width - doc.page.margins.left, doc.y)
    .stroke();
  doc.moveDown(0.4);
}
// Dibuja la cabecera de una tabla en el documento PDF
export function drawTableHeader(
  doc: PDFKit.PDFDocument,
  y: number,
  cols: {
    x: number;
    w: number;
    label: string;
    align?: PDFKit.Mixins.TextOptions["align"];
  }[],
): number {
  const h = 18;
  doc.save();
  doc
    .rect(
      doc.page.margins.left,
      y - 2,
      doc.page.width - doc.page.margins.left - doc.page.margins.right,
      h,
    )
    .fill("#F2F2F2");
  doc.fillColor("#000").font("Helvetica-Bold").fontSize(10);

  for (const c of cols) {
    doc.text(c.label, c.x, y, { width: c.w, align: c.align ?? "left" });
  }

  doc.restore();
  return y + h;
}

// Asegura que haya espacio suficiente en la página PDF, agregando una nueva página si es necesario
export function ensureSpace(
  doc: PDFKit.PDFDocument,
  y: number,
  bottomMargin = 80,
): number {
  if (y > doc.page.height - bottomMargin) {
    doc.addPage();
    return doc.y;
  }
  return y;
}
// Dibuja una fila de tabla en el documento PDF
export function drawTableRow(
  doc: PDFKit.PDFDocument,
  y: number,
  cols: {
    x: number;
    w: number;
    text: string;
    align?: PDFKit.Mixins.TextOptions["align"];
  }[],
): number {
  const h = 16;
  doc.font("Helvetica").fontSize(10).fillColor("#000");

  for (const c of cols) {
    doc.text(c.text, c.x, y, { width: c.w, align: c.align ?? "left" });
  }

  return y + h;
}
// Parsea y valida un nombre de trabajador desde un valor desconocido
export const parseToCorrectString = (name: unknown): string | null => {
  if (typeof name === "string") {
    const trimmed = name.trim();

    return trimmed.length > 0 ? trimmed : null;
  }
  return null;
};
