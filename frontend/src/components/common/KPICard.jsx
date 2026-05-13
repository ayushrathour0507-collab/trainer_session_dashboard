// Purpose: Displays a single KPI with an icon, number, label, and optional trend.
import PropTypes from "prop-types";

const KPICard = ({ icon: Icon, value, label, tone = "accent", trend }) => {
  const toneClasses = {
    accent: "bg-accent/10 text-accent",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    danger: "bg-danger/10 text-danger",
    info: "bg-info/10 text-info",
  };

  return (
    <article className="nexus-card p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase text-light-subtext dark:text-dark-subtext">{label}</p>
          <p className="mt-1.5 text-2xl font-black text-light-text dark:text-dark-text">{value}</p>
          {trend ? <p className="mt-1 text-xs font-bold text-light-subtext dark:text-dark-subtext">{trend}</p> : null}
        </div>
        {Icon ? (
          <div className={`flex h-9 w-9 items-center justify-center rounded-button ${toneClasses[tone] || toneClasses.accent}`}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
        ) : null}
      </div>
    </article>
  );
};

KPICard.propTypes = {
  icon: PropTypes.elementType,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string.isRequired,
  tone: PropTypes.string,
  trend: PropTypes.string,
};

export default KPICard;
