// Purpose: Provides editable fields that update the poster preview live.
import PropTypes from "prop-types";

const PosterEditor = ({ fields, onChange }) => {
  const update = (key, value) => onChange({ ...fields, [key]: value });

  return (
    <div className="nexus-card space-y-3 p-4">
      <h2 className="text-lg font-black text-light-text dark:text-dark-text">Poster Fields</h2>
      {["topic", "presenter", "date", "startTime", "endTime", "meetingLink"].map((field) => (
        <label key={field} className="block">
          <span className="mb-1 block text-xs font-black uppercase text-light-subtext dark:text-dark-subtext">{field.replace(/([A-Z])/g, " $1")}</span>
          <input className="field" value={fields[field] || ""} onChange={(event) => update(field, event.target.value)} />
        </label>
      ))}
      <label className="block">
        <span className="mb-1 block text-xs font-black uppercase text-light-subtext dark:text-dark-subtext">Topics list</span>
        <textarea className="field min-h-[96px]" value={(fields.topics || []).join("\n")} onChange={(event) => update("topics", event.target.value.split("\n"))} />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-black uppercase text-light-subtext dark:text-dark-subtext">Requirements</span>
        <textarea className="field min-h-[80px]" value={(fields.requirements || []).join("\n")} onChange={(event) => update("requirements", event.target.value.split("\n"))} />
      </label>
    </div>
  );
};

PosterEditor.propTypes = {
  fields: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default PosterEditor;
