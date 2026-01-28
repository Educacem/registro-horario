// src/app/api/reports/hello/route.ts
import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { pdfDocToBuffer } from "@/lib/pdf/pdfBuffer";
import checkApiKey from "@/helper/functions";
import {
  getCompanyById,
  getWorkersByCompanyId,
} from "@/lib/company/company.function";
import { findWorkerTimeByWorkerId } from "@/lib/workTime/workTime.functions";

export const runtime = "nodejs";

export async function GET() {
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
}
type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(req: Request) {
  console.log("LLEGASTE");
  try {
    /*  const auth = checkApiKey(req);
  if (auth) return auth; */

    //We need to get the company id from the context params
    const body = await req.json();
    console.log("Body received", body);
    const { companyId } = body;
    const companyIdNumber = Number(companyId);
    console.log("Transformated to number", companyIdNumber);
    if (!companyIdNumber) {
      return NextResponse.json(
        { error: "Company id is required" },
        { status: 400 },
      );
    }
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    //Check if company exists with the companyId
    const existingCompany = await getCompanyById(companyId);
    console.log("Company", existingCompany);
    if (!existingCompany) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }
    doc
      .fontSize(20)
      .text(`Reporte de ${existingCompany.name}`, { align: "left" });
    doc.moveDown();

    //Now we get the workers of the company
    const workers = await getWorkersByCompanyId(companyId);
    console.log("Workers found by companyId", workers);
    if (!workers || workers.length === 0) {
      return NextResponse.json(
        { error: "No workers found for this company" },
        { status: 404 },
      );
    }
    doc.fontSize(16).text(`Trabajadores: ${workers.length}`);
    doc.moveDown();
    for (const worker of workers) {
      doc
        .fontSize(12)
        .text(`- ${worker.name} ${worker.lastName} (ID: ${worker.dni})`);
    }
    //Now we get work times of each worker
    const workersTimes = await findWorkerTimeByWorkerId(workers[0].id);
    console.log("Workers times", workersTimes);
    /*  if (!workersTimes || workersTimes.length === 0) {
      return NextResponse.json(
        { error: "No work times found for the workers of this company" },
        { status: 404 },
      );
    } */
    doc.fontSize(16).text(`Tiempos de trabajo del primer trabajador`);
    doc.moveDown();
    for (const workTime of workersTimes) {
      doc
        .fontSize(12)
        .text(
          `- Desde: ${workTime.clockIn.toISOString()} Hasta: ${workTime.clockOut.toISOString()}`,
        );
    }
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
