/**
 * Purpose: Big toggle-switch checklist for mandatory organiser observations that influence the final trainer rating.
 */
import PropTypes from "prop-types";

const items = [
  { key: "startedOnTime", label: "Started On Time", icon: "\u{1F550}" },
  { key: "icebreakerDone", label: "Icebreaker Done", icon: "\u{1F389}" },
  { key: "qaDone", label: "Q&A Conducted", icon: "\u{1F4AC}" },
];

const OrganiserChecklist = ({ value, onChange }) => (
  <div className="grid gap-3">
    {items.map((item) => {
      const checked = Boolean(value[item.key]);
      return (
        <button
          key={item.key}
          type="button"
          className={`flex items-center justify-between rounded-lg border p-4 text-left transition ${checked ? "border-accent bg-accent/10" : "border-border bg-surface/40 hover:bg-surface/70"}`}
          onClick={() => onChange({ ...value, [item.key]: !checked })}
        >
          <span className="font-semibold">{item.icon} {item.label}</span>
          <span className={`rounded-pill px-3 py-1 text-xs font-bold ${checked ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>{checked ? "Yes" : "No"}</span>
        </button>
      );
    })}
  </div>
);

OrganiserChecklist.propTypes = {
  value: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default OrganiserChecklist;
