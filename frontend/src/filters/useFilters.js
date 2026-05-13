/**
 * Purpose: Keeps filter state synced with URL query params and localStorage for shareable, persistent filtering.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FILTER_TYPES } from "./filterConfig.js";

export const parseFilterValue = (config, value) => {
  if (value == null) {
    if (config.type === FILTER_TYPES.MULTI) return [];
    if (config.type === FILTER_TYPES.RANGE) return [config.min, config.max];
    if (config.type === FILTER_TYPES.DATE_RANGE) return ["", ""];
    if (config.type === FILTER_TYPES.TOGGLE) return "Any";
    if (config.type === FILTER_TYPES.VIEW) return config.options?.[0] || "grid";
    return config.options?.[0] || "";
  }
  if (config.type === FILTER_TYPES.MULTI) return value ? value.split(",").filter(Boolean) : [];
  if (config.type === FILTER_TYPES.RANGE) {
    const [min, max] = value.split("-").map(Number);
    return [Number.isFinite(min) ? min : config.min, Number.isFinite(max) ? max : config.max];
  }
  if (config.type === FILTER_TYPES.DATE_RANGE) {
    const [start = "", end = ""] = value.split("..");
    return [start, end];
  }
  return value;
};

export const serializeFilterValue = (config, value) => {
  if (config.type === FILTER_TYPES.MULTI) return value?.length ? value.join(",") : "";
  if (config.type === FILTER_TYPES.RANGE) return `${value?.[0] ?? config.min}-${value?.[1] ?? config.max}`;
  if (config.type === FILTER_TYPES.DATE_RANGE) return value?.some(Boolean) ? `${value?.[0] || ""}..${value?.[1] || ""}` : "";
  return value || "";
};

export const isDefaultFilterValue = (config, value) => {
  if (config.type === FILTER_TYPES.MULTI) return !value?.length;
  if (config.type === FILTER_TYPES.RANGE) return Number(value?.[0]) === Number(config.min) && Number(value?.[1]) === Number(config.max);
  if (config.type === FILTER_TYPES.DATE_RANGE) return !value?.[0] && !value?.[1];
  if (config.type === FILTER_TYPES.SEARCH) return !value;
  if (config.type === FILTER_TYPES.TOGGLE) return value === "Any";
  return value === (config.options?.[0] || "");
};

export const useFilterState = (configs = [], storageKey = "bytesandbeyond-filters") => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryString = searchParams.toString();
  const previousQueryString = useRef(queryString);
  const baseDefaults = useMemo(() => Object.fromEntries(configs.map((config) => [
    config.key,
    parseFilterValue(config),
  ])), [configs]);
  const urlValues = useMemo(() => Object.fromEntries(configs
    .filter((config) => searchParams.has(config.key))
    .map((config) => [config.key, parseFilterValue(config, searchParams.get(config.key))])), [configs, queryString]);
  const defaults = useMemo(() => ({ ...baseDefaults, ...urlValues }), [baseDefaults, urlValues]);
  const [filters, setFilters] = useState(defaults);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      setFilters(defaults);
      return;
    }
    try {
      const storedValues = JSON.parse(stored);
      configs.filter((config) => config.type === FILTER_TYPES.SEARCH).forEach((config) => {
        delete storedValues[config.key];
      });
      setFilters({ ...baseDefaults, ...storedValues, ...urlValues });
    } catch {
      setFilters(defaults);
    }
  }, [baseDefaults, configs, defaults, storageKey, urlValues]);

  useEffect(() => {
    if (previousQueryString.current !== queryString) {
      previousQueryString.current = queryString;
      return;
    }

    localStorage.setItem(storageKey, JSON.stringify(filters));
    const nextParams = new URLSearchParams(queryString);
    configs.forEach((config) => {
      const value = filters[config.key];
      if (isDefaultFilterValue(config, value)) nextParams.delete(config.key);
      else nextParams.set(config.key, serializeFilterValue(config, value));
    });
    if (nextParams.toString() !== queryString) {
      previousQueryString.current = nextParams.toString();
      setSearchParams(nextParams, { replace: true });
    }
  }, [configs, filters, queryString, setSearchParams, storageKey]);

  const setFilter = useCallback((key, value) => setFilters((current) => ({ ...current, [key]: value })), []);
  const clearFilter = useCallback((key) => {
    const config = configs.find((item) => item.key === key);
    if (!config) return;
    const defaultValue = parseFilterValue(config);
    setFilters((current) => {
      const nextFilters = { ...current, [key]: defaultValue };
      localStorage.setItem(storageKey, JSON.stringify(nextFilters));
      return nextFilters;
    });
    const nextParams = new URLSearchParams(queryString);
    nextParams.delete(key);
    previousQueryString.current = nextParams.toString();
    setSearchParams(nextParams, { replace: true });
  }, [configs, queryString, setSearchParams, storageKey]);
  const clearAll = useCallback(() => {
    const nextFilters = Object.fromEntries(configs.map((config) => [config.key, parseFilterValue(config)]));
    setFilters(nextFilters);
    localStorage.setItem(storageKey, JSON.stringify(nextFilters));
    const nextParams = new URLSearchParams(queryString);
    configs.forEach((config) => nextParams.delete(config.key));
    previousQueryString.current = nextParams.toString();
    setSearchParams(nextParams, { replace: true });
  }, [configs, queryString, setSearchParams, storageKey]);
  const activeFilters = useMemo(() => configs.filter((config) => !isDefaultFilterValue(config, filters[config.key])), [configs, filters]);

  return { filters, setFilter, clearFilter, clearAll, activeFilters };
};

export const useFilters = (storageKey, configs = [], defaults = {}) => {
  const state = useFilterState(configs, `bytesandbeyond-${storageKey}-filters`);
  const mergedFilters = { ...defaults, ...state.filters };
  return { ...state, filters: mergedFilters };
};
