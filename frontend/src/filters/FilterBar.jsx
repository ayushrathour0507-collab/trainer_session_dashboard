/**
 * Purpose: Renders search, select, multi-select, range, toggle, sort, and view filters with URL/localStorage sync.
 */
import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Grid2X2, List, Search, Table2 } from "lucide-react";
import { FILTER_TYPES } from "./filterConfig.js";
import FilterChips from "./FilterChips.jsx";
import { isDefaultFilterValue, parseFilterValue, useFilterState } from "./useFilters.js";

const EMPTY_FILTER_CONFIGS = [];

const controlGridSpan = (config) => {
  const wideKeys = ["q", "status", "dateRange"];
  if (wideKeys.includes(config.key)) return "xl:col-span-4";
  if ([FILTER_TYPES.MULTI, FILTER_TYPES.RANGE].includes(config.type)) return "xl:col-span-4";
  if (config.type === FILTER_TYPES.SORT) return "xl:col-span-2";
  if (config.type === FILTER_TYPES.VIEW) return "xl:col-span-2";
  return "xl:col-span-3";
};

const DateRangeControl = ({ config, value = ["", ""], onChange }) => {
  const update = (index, nextValue) => {
    const nextRange = [...(value || ["", ""])];
    nextRange[index] = nextValue;
    onChange(nextRange);
  };

  return (
    <label className="block min-w-0">
      <span className="label-tag mb-1 block">{config.label}</span>
      <div className="grid gap-1.5 sm:grid-cols-2">
        <input className="field" type="date" aria-label="Start date" value={value?.[0] || ""} onChange={(event) => update(0, event.target.value)} />
        <input className="field" type="date" aria-label="End date" value={value?.[1] || ""} onChange={(event) => update(1, event.target.value)} />
      </div>
    </label>
  );
};

const ToggleOptions = ({ value, onChange }) => (
  <select className="field" value={value || "Any"} onChange={(event) => onChange(event.target.value)}>
    {["Any", "Yes", "No"].map((option) => <option key={option}>{option}</option>)}
  </select>
);

const numberText = (value, fallback) => String(Number.isFinite(Number(value)) ? value : fallback);

const RangeControl = ({ config, value, onChange }) => {
  const current = value || [config.min, config.max];
  const [draft, setDraft] = useState([numberText(current[0], config.min), numberText(current[1], config.max)]);

  useEffect(() => {
    setDraft([numberText(current[0], config.min), numberText(current[1], config.max)]);
  }, [config.max, config.min, current[0], current[1]]);

  const updateDraft = (index, nextValue) => {
    const nextDraft = [...draft];
    nextDraft[index] = nextValue;
    setDraft(nextDraft);

    if (nextValue === "" || nextValue === "-" || nextValue === ".") return;
    const parsed = Number(nextValue);
    if (!Number.isFinite(parsed)) return;

    const nextRange = [...current];
    nextRange[index] = parsed;
    onChange(nextRange);
  };

  const commit = (index) => {
    const fallback = index === 0 ? config.min : config.max;
    const parsed = Number(draft[index]);
    const nextValue = Number.isFinite(parsed) ? parsed : fallback;
    const nextRange = [...current];
    nextRange[index] = nextValue;
    setDraft((existing) => {
      const nextDraft = [...existing];
      nextDraft[index] = String(nextValue);
      return nextDraft;
    });
    onChange(nextRange);
  };

  return (
    <label className="block min-w-0">
      <span className="label-tag mb-1 block">{config.label}: {draft[0] || config.min} - {draft[1] || config.max}</span>
      <div className="flex gap-1.5">
        {[0, 1].map((index) => (
          <input
            key={index}
            className="field"
            type="number"
            inputMode="decimal"
            min={config.min}
            max={config.max}
            step={config.step}
            value={draft[index]}
            onChange={(event) => updateDraft(index, event.target.value)}
            onBlur={() => commit(index)}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
            }}
          />
        ))}
      </div>
    </label>
  );
};

const MultiSelect = ({ config, value = [], onChange }) => {
  const [open, setOpen] = useState(false);
  const [optionQuery, setOptionQuery] = useState("");
  const wrapperRef = useRef(null);
  const popoverRef = useRef(null);
  const [popoverStyle, setPopoverStyle] = useState({ left: 0, top: 0, width: 288 });
  const selectedLabel = value.length ? `${value.length} selected` : "All";
  const filteredOptions = config.options.filter((option) => option.toLowerCase().includes(optionQuery.trim().toLowerCase()));

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      const insideTrigger = wrapperRef.current?.contains(event.target);
      const insidePopover = popoverRef.current?.contains(event.target);
      if (!insideTrigger && !insidePopover) setOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const placePopover = () => {
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (!rect) return;
      const gap = 8;
      const viewportPadding = 16;
      const width = Math.min(Math.max(rect.width, 288), window.innerWidth - (viewportPadding * 2));
      const left = Math.min(Math.max(rect.left, viewportPadding), window.innerWidth - width - viewportPadding);
      const top = Math.min(rect.bottom + gap, window.innerHeight - 280 - viewportPadding);
      setPopoverStyle({ left, top: Math.max(viewportPadding, top), width });
    };

    placePopover();
    window.addEventListener("resize", placePopover);
    window.addEventListener("scroll", placePopover, true);

    return () => {
      window.removeEventListener("resize", placePopover);
      window.removeEventListener("scroll", placePopover, true);
    };
  }, [open]);

  const dropdown = open ? createPortal(
    <div
      ref={popoverRef}
      className="fixed z-[9999] rounded-md border border-border bg-surface p-2 shadow-high"
      style={popoverStyle}
    >
      <label className="relative mb-2 block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textSecondary" />
        <input
          className="field min-h-9 py-2 pl-9 text-sm"
          value={optionQuery}
          placeholder={`Search ${config.label.toLowerCase()}`}
          onChange={(event) => setOptionQuery(event.target.value)}
        />
      </label>
      {value.length ? (
        <div className="mb-2 flex items-center justify-between rounded-md border border-border bg-[var(--surface-field)] px-2 py-1.5">
          <span className="text-xs font-bold text-textSecondary">{value.length} selected</span>
          <button
            type="button"
            className="text-xs font-black text-accent hover:text-textPrimary"
            onClick={() => onChange([])}
          >
            Clear selected
          </button>
        </div>
      ) : null}
      <div className="max-h-56 space-y-1 overflow-auto">
        {filteredOptions.map((option) => {
          const selected = value.includes(option);
          return (
            <label key={option} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm font-semibold hover:bg-accent/10">
              <input
                type="checkbox"
                checked={selected}
                onChange={() => onChange(selected ? value.filter((item) => item !== option) : [...value, option])}
              />
              <span className="truncate">{option}</span>
            </label>
          );
        })}
        {!filteredOptions.length ? <p className="px-2 py-3 text-sm font-bold text-textSecondary">No matches found.</p> : null}
      </div>
    </div>,
    document.body,
  ) : null;

  return (
    <div className={`relative min-w-0 ${open ? "z-[120]" : "z-0"}`} ref={wrapperRef}>
      <span className="label-tag mb-1 block">{config.label}</span>
      <button
        type="button"
        className="field flex items-center justify-between gap-3 text-left"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        <span className="block min-w-0 truncate text-sm font-bold text-textPrimary">{selectedLabel}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-textSecondary transition ${open ? "rotate-180" : ""}`} />
      </button>
      {dropdown}
    </div>
  );
};

const FilterControl = ({ config, value, onChange }) => {
  if (config.type === FILTER_TYPES.SEARCH) {
    return (
      <label className="block min-w-0">
        <span className="label-tag mb-1 block">{config.label}</span>
        <span className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textSecondary" />
          <input className="field pl-9" value={value || ""} placeholder={config.placeholder} onChange={(event) => onChange(event.target.value)} />
        </span>
      </label>
    );
  }

  if ([FILTER_TYPES.SELECT, FILTER_TYPES.SORT].includes(config.type)) {
    return (
      <label className="block min-w-0">
        <span className="label-tag mb-1 block">{config.label}</span>
        <select className="field" value={value || config.options[0]} onChange={(event) => onChange(event.target.value)}>
          {config.options.map((option) => <option key={option}>{option}</option>)}
        </select>
      </label>
    );
  }

  if (config.type === FILTER_TYPES.MULTI) {
    return <MultiSelect config={config} value={value} onChange={onChange} />;
  }

  if (config.type === FILTER_TYPES.TOGGLE) {
    return (
      <label className="block min-w-0">
        <span className="label-tag mb-1 block">{config.label}</span>
        <ToggleOptions value={value} onChange={onChange} />
      </label>
    );
  }

  if (config.type === FILTER_TYPES.RANGE) {
    return <RangeControl config={config} value={value} onChange={onChange} />;
  }

  if (config.type === FILTER_TYPES.DATE_RANGE) {
    return <DateRangeControl config={config} value={value} onChange={onChange} />;
  }

  if (config.type === FILTER_TYPES.VIEW) {
    return (
      <div className="w-max max-w-full min-w-0">
        <span className="label-tag mb-1 block">{config.label}</span>
        <div className="inline-flex max-w-full rounded-md border border-border bg-[var(--surface-field)] p-1">
          {config.options.map((option) => (
            <button
              key={option}
              type="button"
              className={`flex h-9 w-10 items-center justify-center rounded-md ${value === option ? "bg-accent text-white" : "text-textSecondary hover:bg-accent/10 hover:text-accent"}`}
              onClick={() => onChange(option)}
              aria-label={`${option} view`}
            >
              {option === "grid" ? <Grid2X2 className="h-4 w-4" /> : option === "table" ? <Table2 className="h-4 w-4" /> : <List className="h-4 w-4" />}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

const FilterBar = ({ config, configs, storageKey = "bytesandbeyond-filters", values, onChange, onClear, onClearAll, resultCount, totalCount, embedded = false, showResultCount = true }) => {
  const filterConfigs = configs || config || [];
  const controlled = Boolean(values);
  const state = useFilterState(controlled ? EMPTY_FILTER_CONFIGS : filterConfigs, storageKey);
  const filters = controlled ? values : state.filters;
  const activeFilters = controlled
    ? filterConfigs.filter((item) => !isDefaultFilterValue(item, filters[item.key]))
    : state.activeFilters;

  const setAndNotify = (key, value) => {
    const itemConfig = filterConfigs.find((item) => item.key === key);
    if (itemConfig && isDefaultFilterValue(itemConfig, value)) {
      if (controlled) {
        onChange?.(key, value);
        onClear?.(key);
      } else {
        state.clearFilter(key);
      }
      return;
    }

    if (controlled) {
      onChange?.(key, value);
      return;
    }
    state.setFilter(key, value);
    onChange?.({ ...filters, [key]: value });
  };

  const clearOne = (key) => {
    if (!controlled) {
      state.clearFilter(key);
      return;
    }

    const itemConfig = filterConfigs.find((item) => item.key === key);
    if (itemConfig) onChange?.(key, parseFilterValue(itemConfig));
    onClear?.(key);
  };
  const clearEverything = () => (controlled ? onClearAll?.() : state.clearAll());

  return (
    <div className={`${embedded ? "relative z-30 space-y-2.5 overflow-visible" : "nexus-card relative z-30 space-y-3 overflow-visible p-3.5"}`}>
      {showResultCount && Number.isFinite(resultCount) && Number.isFinite(totalCount) ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-textSecondary">Showing {resultCount} of {totalCount} items</p>
        </div>
      ) : null}
      <div className="relative z-20 grid items-end gap-2.5 md:grid-cols-2 xl:grid-cols-12">
        {filterConfigs.map((config) => (
          <div key={config.key} className={controlGridSpan(config)}>
            <FilterControl key={config.key} config={config} value={filters[config.key]} onChange={(value) => setAndNotify(config.key, value)} />
          </div>
        ))}
      </div>
      <FilterChips configs={filterConfigs} filters={filters} activeFilters={activeFilters} onClear={clearOne} onClearAll={clearEverything} />
    </div>
  );
};

ToggleOptions.propTypes = { value: PropTypes.string, onChange: PropTypes.func.isRequired };
RangeControl.propTypes = { config: PropTypes.object.isRequired, value: PropTypes.array, onChange: PropTypes.func.isRequired };
DateRangeControl.propTypes = { config: PropTypes.object.isRequired, value: PropTypes.array, onChange: PropTypes.func.isRequired };
MultiSelect.propTypes = { config: PropTypes.object.isRequired, value: PropTypes.array, onChange: PropTypes.func.isRequired };
FilterControl.propTypes = { config: PropTypes.object.isRequired, value: PropTypes.any, onChange: PropTypes.func.isRequired };
FilterBar.propTypes = {
  config: PropTypes.array,
  configs: PropTypes.array,
  storageKey: PropTypes.string,
  values: PropTypes.object,
  onChange: PropTypes.func,
  onClear: PropTypes.func,
  onClearAll: PropTypes.func,
  resultCount: PropTypes.number,
  totalCount: PropTypes.number,
  embedded: PropTypes.bool,
  showResultCount: PropTypes.bool,
};

export default FilterBar;
