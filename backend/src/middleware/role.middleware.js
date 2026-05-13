// Purpose: Restricts protected endpoints to specific application roles.
import { sendError } from "../utils/response.utils.js";

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, "You do not have permission to perform this action", null, 403);
    }
    next();
  };
};
