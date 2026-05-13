/**
 * Purpose: Displays recent admin and trainer activity in a concise timeline feed.
 */
import PropTypes from "prop-types";
import { Clock3 } from "lucide-react";

const ActivityFeed = ({ items = [] }) => (
  <section className="nexus-card p-4">
    <p className="label-tag text-accent">Recent Activity</p>
    <h2 className="mb-4 text-2xl font-semibold">Activity Feed</h2>
    <div className="grid gap-3">
      {items.map((item, index) => (
        <div key={`${item.title}-${index}`} className="flex gap-3 rounded-lg border border-border bg-surface/40 p-3">
          <Clock3 className="mt-0.5 h-4 w-4 text-accent" />
          <div>
            <p className="text-sm font-bold text-textPrimary">{item.title}</p>
            <p className="text-xs text-textSecondary">{item.time || "Just now"}</p>
          </div>
        </div>
      ))}
      {!items.length ? <p className="text-sm font-bold text-textSecondary">No recent actions yet.</p> : null}
    </div>
  </section>
);

ActivityFeed.propTypes = {
  items: PropTypes.array,
};

export default ActivityFeed;
