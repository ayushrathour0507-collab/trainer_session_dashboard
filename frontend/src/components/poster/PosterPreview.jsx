// Purpose: Renders a downloadable live poster from the selected session and editable poster fields.
import PropTypes from "prop-types";
import { formatLongDate } from "../../utils/dateUtils.js";

const initials = (name = "TBD") => name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "TD";

const PosterPreview = ({ session, fields }) => {
  const topics = fields.topics?.filter(Boolean) || session.posterTopics || [];
  const requirements = fields.requirements?.filter(Boolean) || session.requirements || [];
  const visibleTopics = topics.slice(0, 4);
  const hiddenTopicCount = Math.max(0, topics.length - visibleTopics.length);
  const requirementsText = requirements.join(" - ") || "Laptop - Stable internet - Ready to learn";

  return (
    <div id="poster-preview" className="aspect-[4/5] w-full max-w-[560px] overflow-hidden rounded-card bg-navy p-4 text-white shadow-glow sm:p-5">
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-card border border-border bg-surface p-4 sm:p-5">
        <div className="min-h-0">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-black uppercase text-textSecondary">BytesAndBeyond</p>
              <p className="text-xs font-bold text-textSecondary">Loading knowledge into the system.</p>
            </div>
            <span className="shrink-0 rounded-full bg-info px-3 py-1 text-xs font-black">{session.status || "Pending"}</span>
          </div>
          <h2 className="mt-6 line-clamp-3 break-words text-[2rem] font-black leading-[1.05] sm:text-4xl">{fields.topic || session.topic || "TBD"}</h2>
          <div className="mt-5 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-info text-lg font-black sm:h-14 sm:w-14">
              {initials(fields.presenter || session.presenterName)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase text-textSecondary">Presenter</p>
              <p className="truncate text-xl font-black">{fields.presenter || session.presenterName || "TBD"}</p>
            </div>
          </div>
        </div>
        <div className="mt-auto grid min-h-0 gap-2.5 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="min-w-0 rounded-card bg-white/5 p-3">
              <p className="text-xs font-black uppercase text-textSecondary">Date</p>
              <p className="mt-1 break-words text-sm font-black sm:text-base">{fields.date || formatLongDate(session.date)}</p>
            </div>
            <div className="min-w-0 rounded-card bg-white/5 p-3">
              <p className="text-xs font-black uppercase text-textSecondary">Time</p>
              <p className="mt-1 break-words text-sm font-black sm:text-base">{fields.startTime || session.startTime} - {fields.endTime || session.endTime}</p>
            </div>
          </div>
          <div className="min-w-0 rounded-card bg-white/5 p-3">
            <p className="text-xs font-black uppercase text-textSecondary">Topics</p>
            <div className="mt-2 flex max-h-[58px] flex-wrap gap-2 overflow-hidden">
              {visibleTopics.map((topic) => <span key={topic} className="rounded-full bg-info/20 px-3 py-1 text-xs font-black">{topic}</span>)}
              {hiddenTopicCount ? <span className="rounded-full bg-info/20 px-3 py-1 text-xs font-black">+{hiddenTopicCount}</span> : null}
            </div>
          </div>
          <div className="min-w-0 rounded-card bg-white/5 p-3">
            <p className="text-xs font-black uppercase text-textSecondary">Requirements</p>
            <p className="mt-1 line-clamp-2 break-words text-sm font-bold leading-snug">{requirementsText}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

PosterPreview.propTypes = {
  session: PropTypes.object.isRequired,
  fields: PropTypes.object.isRequired,
};

export default PosterPreview;
