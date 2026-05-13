// Purpose: Parses Microsoft Forms CSV or TSV exports into feedback records that can be matched to sessions.
const parseDelimitedLine = (line, delimiter) => {
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

const detectDelimiter = (text) => {
  const firstLine = text.split(/\r?\n/).find(Boolean) || "";
  return firstLine.includes("\t") ? "\t" : ",";
};

export const parseFeedbackText = (rawText = "") => {
  const trimmed = rawText.trim();
  if (!trimmed) return [];

  const delimiter = detectDelimiter(trimmed);
  const lines = trimmed.split(/\r?\n/).filter(Boolean);
  const maybeHeader = parseDelimitedLine(lines[0], delimiter).map((value) => value.toLowerCase());
  const hasHeader = maybeHeader.some((value) => value.includes("timestamp") || value.includes("rating"));
  const dataLines = hasHeader ? lines.slice(1) : lines;

  return dataLines.map((line) => {
    const [
      timestamp,
      name,
      presenterName,
      sessionDate,
      sessionTitle,
      rating,
      takeaways,
      improvements,
      suggestions,
      email,
    ] = parseDelimitedLine(line, delimiter);

    return {
      submittedAt: timestamp ? new Date(timestamp) : new Date(),
      responderName: name || "Anonymous",
      email: email || "",
      isAnonymous: true,
      presenterName: presenterName || "",
      sessionDate: sessionDate ? new Date(sessionDate) : null,
      sessionTitle: sessionTitle || "",
      attendeeRating: Number(rating) || 3,
      keyTakeaways: takeaways || "",
      improvements: improvements || "",
      futureSuggestions: suggestions || "",
    };
  });
};

export const summarizeFeedback = (feedback = []) => {
  const averageRating = feedback.length
    ? Math.round((feedback.reduce((sum, item) => sum + Number(item.attendeeRating || 0), 0) / feedback.length) * 100) / 100
    : 0;

  return {
    count: feedback.length,
    averageRating,
    comments: feedback.map((item) => item.keyTakeaways).filter(Boolean).slice(0, 6),
    improvements: feedback.map((item) => item.improvements).filter(Boolean).slice(0, 6),
    futureSuggestions: feedback.map((item) => item.futureSuggestions).filter(Boolean).slice(0, 6),
  };
};
