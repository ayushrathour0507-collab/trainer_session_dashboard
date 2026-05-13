/**
 * Purpose: Shows active filter chips with individual remove controls and a clear-all action.
 */
import PropTypes from "prop-types";
import { X } from "lucide-react";

const valueLabel = (value) => {
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
};

const FilterChips = ({ configs, filters, activeFilters, onClear, onClearAll }) => {
  if (!activeFilters.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {activeFilters.map((config) => (
        <button
          key={config.key}
          type="button"
          className="status-badge border-accent/40 bg-accent/10 text-accent"
          onClick={() => onClear(config.key)}
        >
          {config.label}: {valueLabel(filters[config.key])}
          <X className="h-3 w-3" />
        </button>
      ))}
      <button type="button" className="ghost-button h-8 min-h-8 px-3 text-xs" onClick={onClearAll}>
        Clear All
      </button>
    </div>
  );
};

FilterChips.propTypes = {
  configs: PropTypes.array.isRequired,
  filters: PropTypes.object.isRequired,
  activeFilters: PropTypes.array.isRequired,
  onClear: PropTypes.func.isRequired,
  onClearAll: PropTypes.func.isRequired,
};

export default FilterChips;
