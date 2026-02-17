function escapePdfText(input: string): string {
  return input.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

export function buildSimplePdf(title: string, lines: string[]): Uint8Array {
  const safeTitle = escapePdfText(title);
  const contentLines = [safeTitle, ...lines.map((line) => escapePdfText(line))];

  const textOps: string[] = ["BT", "/F1 12 Tf", "50 780 Td", `(${contentLines[0]}) Tj`];
  let yStep = 20;

  for (let i = 1; i < contentLines.length; i += 1) {
    if (yStep > 730) {
      break;
    }
    textOps.push(`0 -16 Td (${contentLines[i]}) Tj`);
    yStep += 16;
  }
  textOps.push("ET");

  const stream = textOps.join("\n");

  const objects: string[] = [];
  objects.push("1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj");
  objects.push("2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj");
  objects.push(
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj"
  );
  objects.push("4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj");
  objects.push(`5 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`);

  let body = "%PDF-1.4\n";
  const offsets: number[] = [0];

  for (const obj of objects) {
    offsets.push(body.length);
    body += `${obj}\n`;
  }

  const xrefStart = body.length;
  body += `xref\n0 ${objects.length + 1}\n`;
  body += "0000000000 65535 f \n";

  for (let i = 1; i <= objects.length; i += 1) {
    body += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }

  body += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new TextEncoder().encode(body);
}
