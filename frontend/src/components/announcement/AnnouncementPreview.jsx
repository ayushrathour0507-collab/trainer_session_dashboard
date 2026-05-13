// Purpose: Displays a formatted Teams announcement preview with copy-to-clipboard support.
import { Copy } from "lucide-react";
import PropTypes from "prop-types";
import toast from "react-hot-toast";

const AnnouncementPreview = ({ content, onChange }) => {
  const copy = async () => {
    await navigator.clipboard.writeText(content);
    toast.success("Announcement copied");
  };

  return (
    <div className="nexus-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-black text-light-text dark:text-dark-text">Teams Preview</h2>
        <button type="button" className="secondary-button px-3" onClick={copy}>
          <Copy className="h-4 w-4" /> Copy
        </button>
      </div>
      <textarea className="field min-h-[300px] whitespace-pre-wrap font-mono text-sm" value={content} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
};

AnnouncementPreview.propTypes = {
  content: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default AnnouncementPreview;
