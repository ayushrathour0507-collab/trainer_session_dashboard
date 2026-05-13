/**
 * Purpose: Displays a semi-transparent status badge with solid status text.
 */
import PropTypes from "prop-types";
import { statusTone } from "../../utils/colorUtils.js";

const StatusBadge = ({ status = "Pending", size = "sm" }) => (
  <span className={`status-badge badge-${statusTone(status)} ${size === "lg" ? "px-4 py-2 text-sm" : ""}`}>
    {status}
  </span>
);

StatusBadge.propTypes = {
  status: PropTypes.string,
  size: PropTypes.oneOf(["sm", "lg"]),
};

export default StatusBadge;
