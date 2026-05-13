/**
 * Purpose: Provides a consistent empty-state card for filters, dashboards, and trainer self-service pages.
 */
import PropTypes from "prop-types";

const EmptyState = ({ title, message, action }) => (
  <div className="nexus-card p-5 text-center">
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="mx-auto mt-2 max-w-md text-sm text-textSecondary">{message}</p>
    {action ? <div className="mt-4">{action}</div> : null}
  </div>
);

EmptyState.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  action: PropTypes.node,
};

export default EmptyState;
