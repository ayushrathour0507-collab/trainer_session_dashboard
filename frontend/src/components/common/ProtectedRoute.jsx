// Purpose: Guards admin and trainer pages according to the current authenticated role.
import PropTypes from "prop-types";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import LoadingSpinner from "./LoadingSpinner.jsx";

const ProtectedRoute = ({ roles = [], children }) => {
  const { user, initialized } = useAuth();
  const location = useLocation();

  if (!initialized) {
    return <LoadingSpinner label="Checking access" />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles.length && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  roles: PropTypes.arrayOf(PropTypes.string),
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
