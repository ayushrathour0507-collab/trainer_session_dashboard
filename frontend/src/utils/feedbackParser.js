// Purpose: Parses pasted Microsoft Forms feedback text on the client before admin import.
const parseLine = (line, delimiter) => {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
};

export const parseFeedbackText = (rawText = "") => {
  const text = rawText.trim();
  if (!text) return [];
  const delimiter = text.split(/\r?\n/)[0]?.includes("\t") ? "\t" : ",";
  const rows = text.split(/\r?\n/).filter(Boolean);
  const first = parseLine(rows[0], delimiter).map((value) => value.toLowerCase());
  const hasHeader = first.some((value) => value.includes("timestamp") || value.includes("rating"));
  return (hasHeader ? rows.slice(1) : rows).map((row) => {
    const [timestamp, name, presenterName, sessionDate, sessionTitle, rating, takeaways, improvements, suggestions] = parseLine(row, delimiter);
    return { timestamp, name, presenterName, sessionDate, sessionTitle, rating, takeaways, improvements, suggestions };
  });
};
