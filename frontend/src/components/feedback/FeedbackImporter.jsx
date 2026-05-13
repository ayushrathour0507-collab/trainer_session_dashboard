// Purpose: Parses pasted Microsoft Forms text and submits it through the feedback service layer.
import { UploadCloud } from "lucide-react";
import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { parseFeedbackText } from "../../utils/feedbackParser.js";

const FeedbackImporter = ({ sessions = [], onImport }) => {
  const [rawText, setRawText] = useState("");
  const [sessionId, setSessionId] = useState("");
  const parsed = useMemo(() => parseFeedbackText(rawText), [rawText]);

  const submit = async () => {
    await onImport({ rawText, sessionId: sessionId || undefined });
    toast.success("Feedback imported");
    setRawText("");
  };

  return (
    <div className="nexus-card p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-light-text dark:text-dark-text">Feedback Importer</h2>
          <p className="text-sm font-bold text-light-subtext dark:text-dark-subtext">{parsed.length} rows detected</p>
        </div>
        <button type="button" className="primary-button px-4" onClick={submit} disabled={!rawText.trim()}>
          <UploadCloud className="h-4 w-4" /> Import
        </button>
      </div>
      <select className="field mb-3" value={sessionId} onChange={(event) => setSessionId(event.target.value)}>
        <option value="">Auto-match by date</option>
        {sessions.map((session) => (
          <option key={session._id} value={session._id}>{session.sessionNumber} · {session.topic}</option>
        ))}
      </select>
      <textarea
        className="field min-h-[220px] font-mono text-sm"
        value={rawText}
        onChange={(event) => setRawText(event.target.value)}
        placeholder="timestamp, name, presenterName, sessionDate, sessionTitle, rating, takeaways, improvements, suggestions"
      />
    </div>
  );
};

FeedbackImporter.propTypes = {
  sessions: PropTypes.array,
  onImport: PropTypes.func.isRequired,
};

export default FeedbackImporter;
