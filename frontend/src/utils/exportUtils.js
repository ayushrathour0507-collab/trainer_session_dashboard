/**
 * Purpose: Exports filtered table data to CSV files for admin and public reporting workflows.
 */

const escapeCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

export const exportCsv = (filename, rows = []) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.map(escapeCell).join(","),
    ...rows.map((row) => headers.map((header) => escapeCell(row[header])).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
