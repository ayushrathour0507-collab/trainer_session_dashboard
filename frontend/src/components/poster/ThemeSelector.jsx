/**
 * Purpose: Poster theme swatch selector for the enhanced Poster Studio.
 */
import PropTypes from "prop-types";

export const posterThemes = [
  { key: "navy-gold", label: "Nexus Blue", swatch: "linear-gradient(135deg, var(--accent), #1530c4)" },
  { key: "teal-multicolor", label: "Teal Multi", swatch: "linear-gradient(135deg, var(--teal), var(--info), var(--purple))" },
  { key: "purple-indigo", label: "Purple Indigo", swatch: "linear-gradient(135deg, var(--purple), var(--info))" },
  { key: "teal-blue", label: "Teal Blue", swatch: "linear-gradient(135deg, var(--teal), var(--info))" },
  { key: "google-multicolor", label: "Google Cloud", swatch: "linear-gradient(135deg, var(--info), var(--success), var(--warning), var(--danger))" },
  { key: "gold-orange", label: "Amber Focus", swatch: "linear-gradient(135deg, var(--warning), var(--orange))" },
];

const ThemeSelector = ({ value, onChange }) => (
  <div className="grid gap-3">
    <p className="label-tag text-accent">Poster Theme</p>
    <div className="grid grid-cols-2 gap-2">
      {posterThemes.map((theme) => (
        <button
          key={theme.key}
          type="button"
          className={`flex items-center gap-2 rounded-lg border p-2 text-left text-xs font-bold ${value === theme.key ? "border-accent bg-accent/10 text-accent" : "border-border text-textSecondary"}`}
          onClick={() => onChange(theme.key)}
        >
          <span className="h-6 w-6 rounded-full border border-border" style={{ background: theme.swatch }} />
          {theme.label}
        </button>
      ))}
    </div>
  </div>
);

ThemeSelector.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default ThemeSelector;
