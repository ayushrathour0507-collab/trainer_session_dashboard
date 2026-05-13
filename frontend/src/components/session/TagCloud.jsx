/**
 * Purpose: Renders a frequency-weighted clickable cloud of topic tags.
 */
import PropTypes from "prop-types";

const TagCloud = ({ sessions, onSelect }) => {
  const counts = sessions.flatMap((session) => session.tags || []).reduce((map, tag) => map.set(tag, (map.get(tag) || 0) + 1), new Map());
  const max = Math.max(...counts.values(), 1);
  return (
    <div className="nexus-card flex flex-wrap gap-2 p-4">
      {[...counts.entries()].map(([tag, count]) => (
        <button
          key={tag}
          type="button"
          className="rounded-pill border border-border bg-accent/10 px-3 py-1 font-bold text-accent"
          style={{ fontSize: `${12 + (count / max) * 8}px` }}
          onClick={() => onSelect?.(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
};

TagCloud.propTypes = {
  sessions: PropTypes.array.isRequired,
  onSelect: PropTypes.func,
};

export default TagCloud;
