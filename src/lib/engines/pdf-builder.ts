// Zero-dependency PDF 1.4 builder — Doctor OS
// Generates A4 PDFs from markdown content with practice branding

export function buildPDF(title: string, content: string, practiceName: string, docType: string): Buffer {
  const PAGE_WIDTH = 595;
  const PAGE_HEIGHT = 842;
  const MARGIN = 50;
  const LINE_HEIGHT = 14;
  const MAX_LINE_WIDTH = PAGE_WIDTH - 2 * MARGIN;
  const CHARS_PER_LINE = 95;

  const lines = content.split("\n");
  const wrappedLines: { text: string; bold: boolean; size: number }[] = [];

  // Title
  wrappedLines.push({ text: title, bold: true, size: 14 });
  wrappedLines.push({ text: "", bold: false, size: 10 });

  for (const line of lines) {
    const isBold = line.startsWith("**") || line.startsWith("# ") || line.startsWith("## ");
    const cleanLine = line.replace(/^#+\s*/, "").replace(/\*\*/g, "");
    const size = line.startsWith("# ") ? 12 : line.startsWith("## ") ? 11 : 10;

    if (cleanLine.length <= CHARS_PER_LINE) {
      wrappedLines.push({ text: cleanLine, bold: isBold, size });
    } else {
      const words = cleanLine.split(" ");
      let currentLine = "";
      for (const word of words) {
        if ((currentLine + " " + word).trim().length > CHARS_PER_LINE) {
          wrappedLines.push({ text: currentLine.trim(), bold: isBold, size });
          currentLine = word;
        } else {
          currentLine = currentLine ? currentLine + " " + word : word;
        }
      }
      if (currentLine.trim()) {
        wrappedLines.push({ text: currentLine.trim(), bold: isBold, size });
      }
    }
  }

  // Calculate pages
  const linesPerPage = Math.floor((PAGE_HEIGHT - 2 * MARGIN - 60) / LINE_HEIGHT);
  const totalPages = Math.max(1, Math.ceil(wrappedLines.length / linesPerPage));

  // Build PDF objects
  const objects: string[] = [];
  let objCount = 0;
  const offsets: number[] = [];

  function addObj(content: string): number {
    objCount++;
    offsets.push(-1); // placeholder
    objects.push(`${objCount} 0 obj\n${content}\nendobj\n`);
    return objCount;
  }

  // Catalog
  addObj("<< /Type /Catalog /Pages 2 0 R >>");

  // Pages (placeholder — updated later)
  const pagesObjId = addObj("<< /Type /Pages /Kids [] /Count 0 >>");

  // Fonts
  const fontRegId = addObj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const fontBoldId = addObj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

  const pageObjIds: number[] = [];

  for (let pageNum = 0; pageNum < totalPages; pageNum++) {
    const startLine = pageNum * linesPerPage;
    const pageLines = wrappedLines.slice(startLine, startLine + linesPerPage);

    let streamContent = "";

    // Header (first page only)
    if (pageNum === 0) {
      streamContent += `BT /F2 12 Tf ${MARGIN} ${PAGE_HEIGHT - MARGIN} Td (${escapePdf(practiceName)}) Tj ET\n`;
      streamContent += `BT /F1 9 Tf ${MARGIN} ${PAGE_HEIGHT - MARGIN - 14} Td (${escapePdf(docType.toUpperCase())}) Tj ET\n`;
      streamContent += `BT /F1 8 Tf ${MARGIN} ${PAGE_HEIGHT - MARGIN - 26} Td (Generated: ${new Date().toLocaleDateString("en-ZA")}) Tj ET\n`;
      // Separator line
      streamContent += `${MARGIN} ${PAGE_HEIGHT - MARGIN - 35} m ${PAGE_WIDTH - MARGIN} ${PAGE_HEIGHT - MARGIN - 35} l S\n`;
    }

    const startY = pageNum === 0 ? PAGE_HEIGHT - MARGIN - 55 : PAGE_HEIGHT - MARGIN;

    for (let i = 0; i < pageLines.length; i++) {
      const line = pageLines[i];
      const y = startY - i * LINE_HEIGHT;
      if (y < MARGIN + 30) break;

      const font = line.bold ? "/F2" : "/F1";
      streamContent += `BT ${font} ${line.size} Tf ${MARGIN} ${y} Td (${escapePdf(line.text)}) Tj ET\n`;
    }

    // Footer
    const footerText = `Page ${pageNum + 1} of ${totalPages} | ${practiceName} | CONFIDENTIAL`;
    streamContent += `BT /F1 7 Tf ${MARGIN} 25 Td (${escapePdf(footerText)}) Tj ET\n`;

    const streamBytes = Buffer.from(streamContent, "utf-8");
    const streamObjId = addObj(`<< /Length ${streamBytes.length} >>\nstream\n${streamContent}endstream`);

    const pageObjId = addObj(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] ` +
      `/Contents ${streamObjId} 0 R ` +
      `/Resources << /Font << /F1 ${fontRegId} 0 R /F2 ${fontBoldId} 0 R >> >> >>`
    );
    pageObjIds.push(pageObjId);
  }

  // Update pages object
  const kidsStr = pageObjIds.map(id => `${id} 0 R`).join(" ");
  objects[pagesObjId - 1] = `${pagesObjId} 0 obj\n<< /Type /Pages /Kids [${kidsStr}] /Count ${totalPages} >>\nendobj\n`;

  // Build final PDF
  let pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";

  for (let i = 0; i < objects.length; i++) {
    offsets[i] = pdf.length;
    pdf += objects[i];
  }

  const xrefOffset = pdf.length;
  pdf += "xref\n";
  pdf += `0 ${objCount + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 0; i < objCount; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += "trailer\n";
  pdf += `<< /Size ${objCount + 1} /Root 1 0 R >>\n`;
  pdf += "startxref\n";
  pdf += `${xrefOffset}\n`;
  pdf += "%%EOF\n";

  return Buffer.from(pdf, "binary");
}

function escapePdf(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[^\x20-\x7E]/g, " ");
}
