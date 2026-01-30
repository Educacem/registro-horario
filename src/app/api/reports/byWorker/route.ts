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
  parseToCorrectString,
  sumDurations,
} from "@/helper/functions/functions";
import PDFDocument from "pdfkit";

import { NextRequest, NextResponse } from "next/server";
import { pdfDocToBuffer } from "@/helper/pdf/pdfBuffer";
import { getWorkerByName } from "@/lib/workers/workers.services";
import { getCompanyByWorkerId } from "@/lib/company/company.services";
import { WorkerLike, WorkTimeLike } from "@/helper/types/types";
import {
  getWorkerTimeById,
  getWorkerTimeByWorkerId,
} from "@/lib/workTime/workTime.services";
type ReportBodyByWorker = {
  name: string;
  from?: string | undefined;
  to?: string | undefined;
};

export async function POST(req: NextRequest) {
  try {
    const auth = checkApiKey(req);
    if (auth) return auth;

    const body = (await req.json()) as ReportBodyByWorker;
    console.log("Body received in byWorker report:", body);

    const workerName = parseToCorrectString(body.name);
    if (!workerName) {
      return NextResponse.json(
        { error: "Invalid worker name" },
        { status: 400 },
      );
    }
    const fromDate = parseOptionalDate(body.from);
    const toDate = parseOptionalDate(body.to);

    const doc = new PDFDocument({ size: "A4", margin: 50 });

    //Check if worker exists in the database
    const worker = (await getWorkerByName(workerName)) as WorkerLike;
    if (!worker) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    const company = await getCompanyByWorkerId(worker.id);
    if (!company) {
      return NextResponse.json(
        { error: "Company for the worker not found" },
        { status: 404 },
      );
    }
    const workTimes = (await getWorkerTimeByWorkerId(
      worker.id,
    )) as WorkTimeLike[];

    const filteredWorkTimes = workTimes.filter((wt) => {
      const t = wt.clockIn.getTime();
      if (fromDate && t < fromDate.getTime()) return false;
      if (toDate && t > toDate.getTime()) return false;
      return true;
    });

    //========== Cabecera ===========
    doc
      .font("Helvetica-Bold")
      .fontSize(18)
      .text("Reporte de fichajes", { align: "left" });
    doc.moveDown(0.5);

    drawKeyValue(doc, "Empresa", `${company.name}`);
    drawKeyValue(doc, "Generado", formatDateTime(new Date()));
    drawKeyValue(doc, "Trabajadores", "1");
    drawKeyValue(doc, "Nº Fichajes", String(filteredWorkTimes.length));

    if (fromDate || toDate) {
      drawKeyValue(
        doc,
        "Rango",
        `${fromDate ? formatDateOnly(fromDate) : "—"}  a  ${toDate ? formatDateOnly(toDate) : "—"}`,
      );
    }
    const totalMs = sumDurations(workTimes);
    drawKeyValue(doc, "Horas totales", `${formatDurationMs(totalMs)}`);

    // ========= Seccion trabajadores =========
    drawSectionTitle(doc, "Trabajador");

    if (workTimes.length === 0) {
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
      y = ensureSpace(doc, y);
      y = drawTableRow(doc, y, [
        { x: cols[0].x, w: cols[0].w, text: String(worker.id) },
        {
          x: cols[1].x,
          w: cols[1].w,
          text: `${worker.lastName}, ${worker.name}`,
        },
        { x: cols[2].x, w: cols[2].w, text: worker.dni },
        {
          x: cols[3].x,
          w: cols[3].w,
          text: worker.active ? "Sí" : "No",
          align: "right",
        },
      ]);
      doc.x = doc.page.margins.left;
      doc.y = y;
      doc.moveDown(0.8);
    }
    // ====== Seccion de fichajes ========
    drawSectionTitle(doc, "Fichajes del trabajador");
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(`${worker.lastName}, ${worker.name}`);
    doc.font("Helvetica").fontSize(10).fillColor("#333");

    doc.fillColor("#000");
    doc.moveDown(0.3);
    if (workTimes.length === 0) {
      doc
        .font("Helvetica-Oblique")
        .fontSize(10)
        .fillColor("#666")
        .text("Sin fichajes en el periodo seleccionado.");
      doc.fillColor("#000");
      doc.moveDown(0.6);
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

    for (const wt of workTimes) {
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

    //======= Footer  ==============
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
        "Content-Disposition": `inline; filename="report_by_worker_${workerName}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    console.error("Error generating report by worker:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal Server Error", message },
      { status: 500 },
    );
  }
}
