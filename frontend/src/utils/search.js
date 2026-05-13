/**
 * Purpose: Shared helpers for module-level search filtering across list and dashboard pages.
 */
export const normalizeSearch = (value) => String(value || "").trim().toLowerCase();

export const matchesSearch = (query, values = []) => {
  const normalized = normalizeSearch(query);
  if (!normalized) return true;
  return values
    .flat()
    .filter((value) => value !== null && value !== undefined)
    .map((value) => String(value).toLowerCase())
    .some((value) => value.includes(normalized));
};
