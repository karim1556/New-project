import { ClubRegistration } from "@/lib/types";

export async function exportRegistrationsToExcel(registrations: ClubRegistration[], fileName = "Hackathon_Club_Registrations_2026.xlsx") {
  const XLSX = await import("xlsx");

  const formattedData = registrations.map((reg, idx) => ({
    "SR No": idx + 1,
    "Student Name": reg.name,
    "Student ID": reg.studentId,
    "Class": reg.class,
    "Division": reg.division,
    "Phone Number": reg.phone,
    "Email Address": reg.email,
    "Primary Language": reg.primaryLanguage,
    "Other Languages": reg.otherLanguages || "-",
    "Coding Level": `Level ${reg.codingLevel} / 5`,
    "Hackathon Experience": reg.hackathonExperience || "No",
    "GitHub / Portfolio": reg.githubPortfolio || "-",
    "Previous Projects": reg.previousProjects || "-",
    "Project Idea": reg.projectIdea || "-",
    "Registered At": new Date(reg.createdAt).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short"
    })
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  // Auto-fit column widths
  const colWidths = Object.keys(formattedData[0] || {}).map((key) => {
    let maxLen = key.length;
    formattedData.forEach((row) => {
      const val = String((row as any)[key] || "");
      if (val.length > maxLen) {
        maxLen = val.length;
      }
    });
    return { wch: Math.min(Math.max(maxLen + 3, 10), 40) };
  });

  worksheet["!cols"] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations 2026");

  XLSX.writeFile(workbook, fileName);
}

export async function exportRegistrationsToPdf(registrations: ClubRegistration[], fileName = "Hackathon_Club_Registrations_2026.pdf") {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4"
  });

  const generatedDate = new Date().toLocaleString("en-IN", {
    dateStyle: "full",
    timeStyle: "short"
  });

  // Modern Dark/Teal Header styling for PDF
  doc.setFillColor(15, 23, 42); // #0f172a
  doc.rect(0, 0, 297, 28, "F");

  doc.setTextColor(94, 234, 212); // #5eead4 accent
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("HACKATHON CLUB 2026", 14, 12);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Candidate Registrations Report", 14, 20);

  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // muted
  doc.text(`Generated: ${generatedDate}`, 283, 12, { align: "right" });
  doc.text(`Total Candidates: ${registrations.length}`, 283, 20, { align: "right" });

  const tableColumn = [
    "#",
    "Student Name",
    "Student ID",
    "Class/Div",
    "Phone",
    "Email",
    "Primary Lang",
    "Level",
    "Hackathon Exp",
    "Registered On"
  ];

  const tableRows = registrations.map((reg, idx) => [
    idx + 1,
    reg.name,
    reg.studentId,
    `${reg.class} - ${reg.division}`,
    reg.phone,
    reg.email,
    reg.primaryLanguage,
    `Lvl ${reg.codingLevel}/5`,
    reg.hackathonExperience || "No",
    new Date(reg.createdAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    })
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 32,
    theme: "grid",
    styles: {
      fontSize: 8.5,
      cellPadding: 3,
      valign: "middle"
    },
    headStyles: {
      fillColor: [17, 24, 39], // #111827
      textColor: [94, 234, 212], // #5eead4
      fontStyle: "bold",
      lineWidth: 0.1,
      lineColor: [55, 65, 81]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] // light grey tint for row contrast
    },
    bodyStyles: {
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" }, // #
      1: { cellWidth: 35, fontStyle: "bold" }, // Name
      2: { cellWidth: 26 }, // ID
      3: { cellWidth: 20 }, // Class/Div
      4: { cellWidth: 30 }, // Phone
      5: { cellWidth: 48 }, // Email
      6: { cellWidth: 26 }, // Lang
      7: { cellWidth: 18, halign: "center" }, // Level
      8: { cellWidth: 24, halign: "center" }, // Exp
      9: { cellWidth: 28 } // Date
    },
    didDrawPage: (data) => {
      // Footer page numbering
      const pageCount = (doc as any).internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        283,
        202,
        { align: "right" }
      );
      doc.text("Official Hackathon Club 2026 Admin Export", 14, 202);
    }
  });

  doc.save(fileName);
}

export function exportRegistrationsToCsv(registrations: ClubRegistration[], fileName = "Hackathon_Club_Registrations_2026.csv") {
  const headers = [
    "SR No",
    "Student Name",
    "Student ID",
    "Class",
    "Division",
    "Phone Number",
    "Email Address",
    "Primary Language",
    "Other Languages",
    "Coding Level",
    "Hackathon Experience",
    "GitHub Portfolio",
    "Previous Projects",
    "Project Idea",
    "Registered At"
  ];

  const escapeCsv = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = registrations.map((reg, idx) => [
    idx + 1,
    escapeCsv(reg.name),
    escapeCsv(reg.studentId),
    escapeCsv(reg.class),
    escapeCsv(reg.division),
    escapeCsv(reg.phone),
    escapeCsv(reg.email),
    escapeCsv(reg.primaryLanguage),
    escapeCsv(reg.otherLanguages || "-"),
    escapeCsv(`Level ${reg.codingLevel} / 5`),
    escapeCsv(reg.hackathonExperience || "No"),
    escapeCsv(reg.githubPortfolio || "-"),
    escapeCsv(reg.previousProjects || "-"),
    escapeCsv(reg.projectIdea || "-"),
    escapeCsv(new Date(reg.createdAt).toISOString())
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
