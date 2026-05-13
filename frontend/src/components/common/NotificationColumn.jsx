// Purpose: Renders a compact notification column for admin and trainer dashboard updates.
import { Bell, Clock3, Info, Megaphone, ShieldAlert } from "lucide-react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { formatLongDate } from "../../utils/dateUtils.js";

const iconMap = {
  action: ShieldAlert,
  feedback: Megaphone,
  upcoming: Clock3,
  info: Info,
};

const toneMap = {
  action: "text-warning bg-warning/10",
  feedback: "text-accent bg-accent/10",
  upcoming: "text-info bg-info/10",
  info: "text-light-subtext bg-light-secondary dark:text-dark-subtext dark:bg-dark-secondary",
};

const NotificationColumn = ({ notifications = [], title = "Notifications", className = "" }) => (
  <aside className={`nexus-card flex min-h-0 flex-col p-3.5 ${className}`}>
    <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-black text-light-text dark:text-dark-text">{title}</h2>
        <p className="text-sm font-bold text-light-subtext dark:text-dark-subtext">{notifications.length} updates</p>
      </div>
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
        <Bell className="h-5 w-5" />
      </span>
    </div>
    <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
      {notifications.map((item) => {
        const Icon = iconMap[item.type] || Info;
        const content = (
          <div className="flex gap-2.5 rounded-card border border-light-border/70 p-2.5 transition hover:border-accent/30 dark:border-dark-border">
            <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${toneMap[item.type] || toneMap.info}`}>
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-black text-light-text dark:text-dark-text">{item.title}</p>
              <p className="mt-1 text-xs font-bold text-light-subtext dark:text-dark-subtext">{item.message}</p>
              {item.date ? <p className="mt-1.5 font-mono text-xs font-black text-accent">{formatLongDate(item.date)}</p> : null}
            </div>
          </div>
        );

        return item.href ? (
          <Link key={item.id || `${item.title}-${item.date}`} to={item.href} className="block">
            {content}
          </Link>
        ) : (
          <div key={item.id || `${item.title}-${item.date}`}>{content}</div>
        );
      })}
      {!notifications.length ? (
        <div className="rounded-card border border-light-border/70 p-4 text-sm font-bold text-light-subtext dark:border-dark-border dark:text-dark-subtext">
          No updates right now.
        </div>
      ) : null}
    </div>
  </aside>
);

NotificationColumn.propTypes = {
  notifications: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    type: PropTypes.string,
    title: PropTypes.string,
    message: PropTypes.string,
    date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    href: PropTypes.string,
  })),
  title: PropTypes.string,
  className: PropTypes.string,
};

export default NotificationColumn;
