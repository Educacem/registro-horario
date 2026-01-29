/**
 * PDFKit genera un PDF como stream de bytes. Esta función acumula esos bytes y devuelve un Buffer final
 * para poder responder desde un endpoint (Next/Node) con un PDF.
 */

export async function pdfDocToBuffer(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    let totalBytes = 0;
    let chunkCount = 0;

    doc.on("data", (chunk) => {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      chunks.push(buf);

      chunkCount += 1;
      totalBytes += buf.length;

      // 👇 logs didácticos
      /* console.log(
        `[pdf] chunk #${chunkCount} size=${buf.length} bytes total=${totalBytes}`,
      ); */
    });

    doc.on("end", () => {
      /*       console.log(`[pdf] end: chunks=${chunkCount} totalBytes=${totalBytes}`);
       */ resolve(Buffer.concat(chunks));
    });

    doc.on("error", (err) => {
      /*       console.log("[pdf] error:", err);
       */ reject(err);
    });

    doc.end();
  });
}
