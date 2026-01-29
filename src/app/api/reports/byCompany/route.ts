// src/app/api/reports/hello/route.ts
import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { pdfDocToBuffer } from "@/helper/pdf/pdfBuffer";
import checkApiKey, {
  drawKeyValue,
  drawSectionTitle,
  drawTableHeader,
  drawTableRow,
  ensureSpace,
  formatDateOnly,
  formatDateTime,
  formatDurationMs,
  parseOptionalDate,
  parsePositiveInt,
  sumDurations,
} from "@/helper/functions/functions";
import {
  getCompanyById,
  getWorkersByCompanyId,
} from "@/lib/company/company.services";
import { findWorkdTimesByCompanyId } from "@/lib/workTime/workTime.services";
import {
  ReportBody,
  WorkerLike,
  WorkTimeLike,
} from "../../../../helper/types/types";
export const runtime = "nodejs";

/* export async function GET() {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  doc.fontSize(20).text("Hola PDFKit 👋", { align: "left" });
  doc.moveDown();
  doc.fontSize(12).text(`Generado: ${new Date().toISOString()}`);

  const buffer = await pdfDocToBuffer(doc);

  // ✅ TS-friendly: convertir Buffer -> Uint8Array (BodyInit válido)
  const body = new Uint8Array(buffer);

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="hello.pdf"',
      "Cache-Control": "no-store",
    },
  });
} */

export async function POST(req: NextRequest) {
  try {
    const auth = checkApiKey(req);
    if (auth) return auth;

    //We need to get the company id from the context params
    const body = (await req.json()) as ReportBody;

    //Parseamos el id por que no sabemos que nos estan enviando
    const companyId = parsePositiveInt(body.companyId);
    if (!companyId) {
      return NextResponse.json(
        { error: "Company id is required also like (positive int)" },
        { status: 400 },
      );
    }

    //Filtramos por fechas si las hay
    const from = parseOptionalDate(body.from);
    const to = parseOptionalDate(body.to);

    //Creamos el doc para ir metiendo datos si los hay
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    //Check if company exists with the companyId
    const company = await getCompanyById(companyId);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const workers = (await getWorkersByCompanyId(companyId)) as WorkerLike[];
    const workTimes = (await findWorkdTimesByCompanyId(
      companyId,
    )) as WorkTimeLike[];

    // (Opcional) filtrar por rango en memoria si tu query aún no filtra.
    const filteredWorkTimes = workTimes.filter((wt) => {
      const t = wt.clockIn.getTime();
      if (from && t < from.getTime()) return false;
      if (to && t > to.getTime()) return false;
      return true;
    });

    // Agrupar fichajes por workerId
    const timesByWorker = new Map<number, WorkTimeLike[]>();
    for (const wt of filteredWorkTimes) {
      const arr = timesByWorker.get(wt.workerId) ?? [];
      arr.push(wt);
      timesByWorker.set(wt.workerId, arr);
    }
    for (const [wid, arr] of timesByWorker) {
      arr.sort((a, b) => a.clockIn.getTime() - b.clockIn.getTime());
      timesByWorker.set(wid, arr);
    }
    // ===== Cabecera =====
    doc
      .font("Helvetica-Bold")
      .fontSize(18)
      .text("Reporte de fichajes", { align: "left" });
    doc.moveDown(0.4);

    //Con esta funcion lo que hacemos es dibujar las cabeceras.
    drawKeyValue(doc, "Empresa", `${company.name}`);
    drawKeyValue(doc, "Generado", formatDateTime(new Date()));
    drawKeyValue(doc, "Trabajadores", String(workers.length));
    drawKeyValue(doc, "Nº Fichajes", String(filteredWorkTimes.length));

    //Solo si hay rango lo dibujamos
    if (from || to) {
      drawKeyValue(
        doc,
        "Rango",
        `${from ? formatDateOnly(from) : "—"}  →  ${to ? formatDateOnly(to) : "—"}`,
      );
    }

    const totalMs = sumDurations(filteredWorkTimes);
    drawKeyValue(doc, "Horas totales", formatDurationMs(totalMs));

    // ===== Sección trabajadores =====
    drawSectionTitle(doc, "Trabajadores");
    if (workers.length === 0) {
      doc
        .font("Helvetica")
        .fontSize(11)
        .text("No hay trabajadores registrados para esta empresa.");
    } else {
      const startX = doc.page.margins.left;
      let y = doc.y;

      const cols = [
        { x: startX + 0, w: 45, label: "ID" },
        { x: startX + 45, w: 220, label: "Nombre" },
        { x: startX + 265, w: 120, label: "DNI" },
        { x: startX + 385, w: 80, label: "Activo", align: "right" as const },
      ];
      y = drawTableHeader(doc, y, cols);

      for (const w of workers) {
        y = ensureSpace(doc, y);
        y = drawTableRow(doc, y, [
          { x: cols[0].x, w: cols[0].w, text: String(w.id) },
          { x: cols[1].x, w: cols[1].w, text: `${w.lastName}, ${w.name}` },
          { x: cols[2].x, w: cols[2].w, text: w.dni },
          {
            x: cols[3].x,
            w: cols[3].w,
            text: w.active ? "Sí" : "No",
            align: "right",
          },
        ]);
      }
      doc.x = doc.page.margins.left;
      doc.y = y;
      doc.moveDown(0.8);
    }

    // ===== Sección fichajes (agrupados por trabajador) =====
    drawSectionTitle(doc, "Fichajes por trabajador");

    for (const w of workers) {
      const workerTimes = timesByWorker.get(w.id) ?? [];

      doc.font("Helvetica-Bold").fontSize(12).text(`${w.lastName}, ${w.name}`);
      doc.font("Helvetica").fontSize(10).fillColor("#333");

      doc.fillColor("#000");
      doc.moveDown(0.3);
      if (workerTimes.length === 0) {
        doc
          .font("Helvetica-Oblique")
          .fontSize(10)
          .fillColor("#666")
          .text("Sin fichajes en el periodo seleccionado.");
        doc.fillColor("#000");
        doc.moveDown(0.6);
        continue;
      }
      const startX = doc.page.margins.left;
      let y = doc.y;

      const cols = [
        { x: startX + 0, w: 85, label: "Fecha" },
        { x: startX + 85, w: 150, label: "Entrada" },
        { x: startX + 235, w: 150, label: "Salida" },
        { x: startX + 385, w: 80, label: "Duración", align: "right" as const },
      ];
      y = drawTableHeader(doc, y, cols);

      let subtotalMs = 0;

      for (const wt of workerTimes) {
        y = ensureSpace(doc, y);

        const outText = wt.clockOut ? formatDateTime(wt.clockOut) : "EN CURSO";

        const durMs = wt.clockOut
          ? wt.clockOut.getTime() - wt.clockIn.getTime()
          : 0;
        if (durMs > 0) subtotalMs += durMs;

        y = drawTableRow(doc, y, [
          { x: cols[0].x, w: cols[0].w, text: formatDateOnly(wt.clockIn) },
          { x: cols[1].x, w: cols[1].w, text: formatDateTime(wt.clockIn) },
          { x: cols[2].x, w: cols[2].w, text: outText },
          {
            x: cols[3].x,
            w: cols[3].w,
            text: formatDurationMs(durMs),
            align: "right",
          },
        ]);
        console.log("");
      }
      y = ensureSpace(doc, y);
      doc.moveDown(0.2);
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(`Subtotal: ${formatDurationMs(subtotalMs)}`, {
          align: "right",
        });
      doc.font("Helvetica").fontSize(10);
      doc.x = doc.page.margins.left;
      doc.y = y;
      doc.moveDown(0.8);
    }
    // Footer
    doc.moveDown(1);
    doc
      .font("Helvetica-Oblique")
      .fontSize(9)
      .fillColor("#666")
      .text("· Reporte generado automáticamente", {
        align: "right",
      });
    doc.fillColor("#000");

    const buffer = await pdfDocToBuffer(doc);
    const bodyBuffer = new Uint8Array(buffer);

    return new Response(bodyBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="report_company_${companyId}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error generating report";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
