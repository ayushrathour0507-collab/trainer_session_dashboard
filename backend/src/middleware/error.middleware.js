// Purpose: Handles unmatched routes and converts thrown errors into the platform response format.
import { sendError } from "../utils/response.utils.js";

export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || res.statusCode || 500;
  const message = err.message || "Unexpected server error";
  const details = process.env.NODE_ENV === "production" ? null : err.stack;
  return sendError(res, message, details, statusCode);
};
