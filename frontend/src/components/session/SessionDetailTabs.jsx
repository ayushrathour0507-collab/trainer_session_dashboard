/**
 * Purpose: Provides accessible tab controls for session detail sections.
 */
import PropTypes from "prop-types";

const SessionDetailTabs = ({ tabs, active, onChange }) => (
  <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-surface/60 p-1">
    {tabs.map((tab) => (
      <button
        key={tab}
        type="button"
        className={`rounded-md px-4 py-2 text-sm font-bold ${active === tab ? "bg-accent text-white" : "text-textSecondary hover:bg-accent/10 hover:text-accent"}`}
        onClick={() => onChange(tab)}
      >
        {tab}
      </button>
    ))}
  </div>
);

SessionDetailTabs.propTypes = {
  tabs: PropTypes.array.isRequired,
  active: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default SessionDetailTabs;
