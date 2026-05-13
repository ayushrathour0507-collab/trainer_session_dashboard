// Purpose: Displays color-coded KT session status labels.
import PropTypes from "prop-types";

const styles = {
  Completed: "bg-success/10 text-success border-success/30",
  Ongoing: "bg-success/10 text-success border-success/30",
  Pending: "bg-warning/10 text-warning border-warning/30",
  "Pending Approval": "bg-warning/10 text-warning border-warning/30",
  Confirmed: "bg-accent/10 text-accent border-accent/30",
  Approved: "bg-success/10 text-success border-success/30",
  Rejected: "bg-danger/10 text-danger border-danger/30",
  "Changes Requested": "bg-warning/10 text-warning border-warning/30",
  Postponed: "bg-muted/15 text-light-subtext dark:text-dark-subtext border-muted/30",
  Cancelled: "bg-danger/10 text-danger border-danger/30",
};

const StatusBadge = ({ status = "Pending" }) => (
  <span className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-extrabold ${styles[status] || styles.Pending}`}>
    {status}
  </span>
);

StatusBadge.propTypes = {
  status: PropTypes.string,
};

export default StatusBadge;
