/**
 * Purpose: Defines reusable filter types and page-specific filter configurations for shareable URL-synced filters.
 */

export const FILTER_TYPES = {
  SELECT: "select",
  MULTI: "multi",
  TOGGLE: "toggle",
  RANGE: "range",
  DATE_RANGE: "date_range",
  SEARCH: "search",
  SORT: "sort",
  VIEW: "view",
};

export const topicTagOptions = ["Backend", "Frontend", "Cloud", "AI/ML", "Data", "Automation", "System Design", "Power BI", "DevOps"];

export const createSessionFilters = (presenters = []) => [
  { type: FILTER_TYPES.SEARCH, key: "q", label: "Search", placeholder: "Search topic or presenter..." },
  { type: FILTER_TYPES.SELECT, key: "status", label: "Status", options: ["All", "Completed", "Upcoming", "Pending", "Confirmed", "Postponed", "Cancelled"] },
  { type: FILTER_TYPES.DATE_RANGE, key: "dateRange", label: "Date Range" },
  { type: FILTER_TYPES.MULTI, key: "presenters", label: "Presenter", options: presenters },
  { type: FILTER_TYPES.MULTI, key: "tags", label: "Tags", options: topicTagOptions },
  { type: FILTER_TYPES.SORT, key: "sort", label: "Sort", options: ["Latest First", "Oldest First", "Highest Score", "Lowest Score", "Most Attendees"] },
  { type: FILTER_TYPES.VIEW, key: "view", label: "View", options: ["grid", "list", "table"] },
];

export const leaderboardFilters = [
  { type: FILTER_TYPES.SEARCH, key: "q", label: "Search", placeholder: "Search trainer or verdict..." },
  { type: FILTER_TYPES.SELECT, key: "month", label: "Month", options: ["All Time", "March", "April", "May", "June", "July"] },
  { type: FILTER_TYPES.SELECT, key: "metric", label: "Metric Focus", options: ["Overall", "Start On Time", "Structure", "Interaction", "Clarity", "Hands-on", "Attendee Feedback", "Time Efficiency"] },
  { type: FILTER_TYPES.SELECT, key: "minSessions", label: "Min Sessions", options: ["Any", "1+", "2+", "3+"] },
];

export const adminExtraFilters = [
  { type: FILTER_TYPES.TOGGLE, key: "hasEvaluation", label: "Has Evaluation" },
  { type: FILTER_TYPES.TOGGLE, key: "hasPoster", label: "Has Poster" },
  { type: FILTER_TYPES.TOGGLE, key: "hasLink", label: "Has Meeting Link" },
];
