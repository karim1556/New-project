type WeeklyReportPdfData = {
  generatedAt: string;
  mostActiveTeam: string;
  tasksCompleted: number;
  attendancePct: number;
  hackathonsParticipated: number;
  topContributor: string;
  teamPerformance: Array<{
    teamName: string;
    tasksCompleted: number;
    attendancePct: number;
    hackathons: number;
  }>;
  memberPerformance: Array<{
    memberName: string;
    teamName: string;
    logsCount: number;
  }>;
};

function esc(input: string): string {
  return input.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrap(text: string, max = 88): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > max && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

class PdfCanvas {
  private ops: string[] = [];
  private y = 790;

  yPos(): number {
    return this.y;
  }

  text(text: string, size = 11, x = 48): this {
    this.ops.push("BT");
    this.ops.push(`/F1 ${size} Tf`);
    this.ops.push(`1 0 0 1 ${x} ${this.y} Tm`);
    this.ops.push(`(${esc(text)}) Tj`);
    this.ops.push("ET");
    return this;
  }

  title(text: string, x = 48): this {
    this.ops.push("BT");
    this.ops.push("/F2 23 Tf");
    this.ops.push(`1 0 0 1 ${x} ${this.y} Tm`);
    this.ops.push(`(${esc(text)}) Tj`);
    this.ops.push("ET");
    return this;
  }

  down(px: number): this {
    this.y -= px;
    return this;
  }

  rect(x: number, y: number, w: number, h: number, fillRgb?: [number, number, number]): this {
    if (fillRgb) {
      this.ops.push("q");
      this.ops.push(`${fillRgb[0]} ${fillRgb[1]} ${fillRgb[2]} rg`);
      this.ops.push(`${x} ${y} ${w} ${h} re f`);
      this.ops.push("Q");
    }

    this.ops.push("q");
    this.ops.push("0.82 0.86 0.93 RG");
    this.ops.push("1 w");
    this.ops.push(`${x} ${y} ${w} ${h} re S`);
    this.ops.push("Q");
    return this;
  }

  stream(): string {
    return this.ops.join("\n");
  }
}

export function buildCorporateReportPdf(data: WeeklyReportPdfData): Uint8Array {
  const c = new PdfCanvas();

  c.rect(40, 760, 515, 54, [0.92, 0.96, 1]);
  c.title("Weekly Club Performance Report", 52);
  c.down(28).text(`Generated: ${data.generatedAt}`, 11, 52);
  c.down(28);

  // KPI row
  const kpis = [
    ["Most Active Team", data.mostActiveTeam],
    ["Tasks Completed", String(data.tasksCompleted)],
    ["Attendance", `${data.attendancePct}%`],
    ["Hackathons", String(data.hackathonsParticipated)],
    ["Top Contributor", data.topContributor]
  ];

  let x = 40;
  for (const [label, value] of kpis) {
    c.rect(x, 680, 98, 62, [0.98, 0.99, 1]);
    c.text(label, 8, x + 8).down(16).text(value, 12, x + 8).down(-16);
    x += 104;
  }

  c.down(95);
  c.text("Team Performance", 14).down(20);

  c.rect(40, 555, 515, 24, [0.95, 0.97, 1]);
  c.text("Team", 9, 48).text("Tasks", 9, 280).text("Attendance", 9, 360).text("Hackathons", 9, 470);
  c.down(22);

  for (const row of data.teamPerformance.slice(0, 7)) {
    c.rect(40, c.yPos() - 4, 515, 22, [1, 1, 1]);
    c.text(row.teamName, 9, 48)
      .text(String(row.tasksCompleted), 9, 285)
      .text(`${row.attendancePct}%`, 9, 370)
      .text(String(row.hackathons), 9, 482)
      .down(22);
  }

  c.down(8).text("Top Member Activity", 14).down(20);
  c.rect(40, c.yPos() - 4, 515, 24, [0.95, 0.97, 1]);
  c.text("Member", 9, 48).text("Team", 9, 300).text("Logs (7d)", 9, 470).down(22);

  for (const row of data.memberPerformance.slice(0, 8)) {
    c.rect(40, c.yPos() - 4, 515, 22, [1, 1, 1]);
    c.text(row.memberName, 9, 48)
      .text(row.teamName, 9, 300)
      .text(String(row.logsCount), 9, 490)
      .down(22);
  }

  c.down(12).text("Executive Summary", 14).down(18);
  const summary = wrap(
    `This week the club recorded ${data.tasksCompleted} tasks with ${data.attendancePct}% attendance. ` +
      `${data.mostActiveTeam} led execution while ${data.topContributor} delivered top individual output.`
  );
  for (const line of summary.slice(0, 4)) {
    c.text(line, 10, 48).down(14);
  }

  const stream = c.stream();

  const objects: string[] = [];
  objects.push("1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj");
  objects.push("2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj");
  objects.push(
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >> endobj"
  );
  objects.push("4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj");
  objects.push("5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj");
  objects.push(`6 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`);

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
