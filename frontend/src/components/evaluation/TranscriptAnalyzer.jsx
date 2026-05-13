/**
 * Purpose: Uploads DOCX/text meeting transcripts and previews auto-detected evaluation signals.
 */
import { FileText, Sparkles, Upload } from "lucide-react";
import PropTypes from "prop-types";
import toast from "react-hot-toast";

const metric = (label, value) => (
  <div className="rounded-lg border border-border bg-surface/50 p-2.5">
    <p className="label-tag">{label}</p>
    <p className="mt-1 text-lg font-black text-textPrimary">{value}</p>
  </div>
);

const isDocxFile = (file) => {
  const name = file.name.toLowerCase();
  return name.endsWith(".docx") || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
};

const readTranscriptFile = async (file) => {
  if (isDocxFile(file)) {
    const { default: mammoth } = await import("mammoth/mammoth.browser.js");
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value?.trim() || "";
    if (!text) throw new Error("The DOCX did not contain readable transcript text.");
    return text;
  }

  return file.text();
};

const TranscriptAnalyzer = ({ value, onChange, onAnalyze, analysis, fileName, onFileName }) => {
  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await readTranscriptFile(file);
      onChange(text);
      onFileName(file.name);
      toast.success(isDocxFile(file) ? "DOCX transcript loaded" : "Transcript loaded");
    } catch (error) {
      toast.error(error.message || "Unable to read transcript file");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <div className="nexus-card grid gap-3 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="label-tag text-accent">Transcript Assist</p>
          <h2 className="text-xl font-semibold">Auto-fill Evaluation</h2>
        </div>
        <label className="secondary-button cursor-pointer px-3">
          <Upload className="h-4 w-4" />
          Upload
          <input type="file" className="hidden" accept=".docx,.txt,.vtt,.csv,.srt" onChange={handleFile} />
        </label>
      </div>

      {fileName ? (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface/50 px-3 py-2 text-sm font-bold text-textSecondary">
          <FileText className="h-4 w-4 text-accent" />
          {fileName}
        </div>
      ) : null}

      <textarea
        className="field min-h-28 font-mono text-xs"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Upload a DOCX transcript or paste Teams transcript text here"
      />

      <button type="button" className="primary-button px-4" onClick={onAnalyze}>
        <Sparkles className="h-4 w-4" />
        Analyze Transcript
      </button>

      {analysis ? (
        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            {metric("Confidence", `${analysis.confidence}%`)}
            {metric("Speakers", analysis.speakerCount || "Unknown")}
            {metric("Questions", analysis.questionCount)}
            {metric("Duration", Number.isFinite(analysis.durationMinutes) ? `${Math.round(analysis.durationMinutes)} min` : "Unknown")}
          </div>
          <div className="rounded-lg border border-border bg-surface/50 p-3 text-sm font-bold text-textSecondary">
            Detected presenter: <span className="text-textPrimary">{analysis.presenter}</span>. Attendee turns: <span className="text-textPrimary">{analysis.attendeeTurns}</span>. Start delay: <span className="text-textPrimary">{Number.isFinite(analysis.startDelayMinutes) ? `${analysis.startDelayMinutes} min` : "Not found"}</span>.
          </div>
        </div>
      ) : null}
    </div>
  );
};

TranscriptAnalyzer.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onAnalyze: PropTypes.func.isRequired,
  analysis: PropTypes.object,
  fileName: PropTypes.string,
  onFileName: PropTypes.func.isRequired,
};

export default TranscriptAnalyzer;
