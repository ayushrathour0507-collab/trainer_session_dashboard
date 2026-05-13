/**
 * Purpose: Exports filtered session data as Excel-compatible HTML and PDF reports.
 */
import jsPDF from "jspdf";

const columns = [
  ["sessionNumber", "Session #"],
  ["date", "Date"],
  ["presenterName", "Presenter"],
  ["topic", "Topic"],
  ["status", "Status"],
  ["month", "Month"],
  ["attendees", "Attendees"],
  ["feedbackCount", "Feedback"],
  ["score", "Score"],
];

const scoreFor = (session) => Number(session.overallScore || session.totalScore || session.rating || 0);

const cellValue = (session, key) => {
  if (key === "date") return session.date ? String(session.date).slice(0, 10) : "TBD";
  if (key === "score") return scoreFor(session).toFixed(2);
  if (key === "presenterName") return session.presenterName || session.presenter?.name || "TBD";
  return session[key] ?? "TBD";
};

const escapeHtml = (value) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

const downloadBlob = (content, filename, type) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportSessionsToExcel = (sessions) => {
  const header = columns.map(([, label]) => `<th>${escapeHtml(label)}</th>`).join("");
  const rows = sessions.map((session) => `<tr>${columns.map(([key]) => `<td>${escapeHtml(cellValue(session, key))}</td>`).join("")}</tr>`).join("");
  const table = `<!doctype html><html><head><meta charset="utf-8" /></head><body><table border="1"><thead><tr>${header}</tr></thead><tbody>${rows}</tbody></table></body></html>`;
  downloadBlob(table, "bytesandbeyond-sessions.xls", "application/vnd.ms-excel;charset=utf-8");
};

export const exportSessionsToPdf = (sessions) => {
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const left = 10;
  let y = 16;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.text("BytesAndBeyond Sessions", left, y);
  y += 8;

  pdf.setFontSize(8);
  pdf.setTextColor(100);
  pdf.text(`Exported ${new Date().toLocaleString("en-IN")} | ${sessions.length} sessions`, left, y);
  y += 8;

  const widths = [16, 24, 40, 72, 26, 24, 20, 20, 18];
  pdf.setTextColor(0);
  pdf.setFont("helvetica", "bold");
  columns.forEach(([, label], index) => {
    const x = left + widths.slice(0, index).reduce((sum, width) => sum + width, 0);
    pdf.text(label, x, y);
  });
  y += 6;

  pdf.setFont("helvetica", "normal");
  sessions.forEach((session) => {
    if (y > pageHeight - 14) {
      pdf.addPage();
      y = 16;
    }
    columns.forEach(([key], index) => {
      const x = left + widths.slice(0, index).reduce((sum, width) => sum + width, 0);
      const value = String(cellValue(session, key));
      const text = pdf.splitTextToSize(value, Math.min(widths[index] - 2, pageWidth - x - 10)).slice(0, 2);
      pdf.text(text, x, y);
    });
    y += 9;
  });

  pdf.save("bytesandbeyond-sessions.pdf");
};
