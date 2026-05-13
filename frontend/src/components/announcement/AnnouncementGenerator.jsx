// Purpose: Controls announcement type selection and live message generation from a session.
import PropTypes from "prop-types";
import { ANNOUNCEMENT_TYPES, fillAnnouncementTemplate } from "../../utils/announcementTemplates.js";

const AnnouncementGenerator = ({ session, type, onTypeChange, content, onContentChange }) => (
  <div className="nexus-card p-4">
    <h2 className="text-lg font-black text-light-text dark:text-dark-text">Announcement Type</h2>
    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
      {ANNOUNCEMENT_TYPES.map((item) => (
        <button
          key={item.value}
          type="button"
          className={`rounded-button border px-3 py-2 text-sm font-black ${
            type === item.value ? "border-accent bg-accent/10 text-accent" : "border-light-border text-light-subtext dark:border-dark-border dark:text-dark-subtext"
          }`}
          onClick={() => {
            onTypeChange(item.value);
            onContentChange(fillAnnouncementTemplate(session, item.value));
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
    <p className="mt-3 text-sm font-bold text-light-subtext dark:text-dark-subtext">{content.split("\n")[0]}</p>
  </div>
);

AnnouncementGenerator.propTypes = {
  session: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  onTypeChange: PropTypes.func.isRequired,
  content: PropTypes.string.isRequired,
  onContentChange: PropTypes.func.isRequired,
};

export default AnnouncementGenerator;
