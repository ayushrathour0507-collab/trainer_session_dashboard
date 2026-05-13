// Purpose: Runs Zod validation before controller handlers receive request data.
import { sendError } from "../utils/response.utils.js";

const formatZodIssues = (issues) => {
  return issues.map((issue) => `${issue.path.join(".") || "value"}: ${issue.message}`);
};

export const validate = (schema) => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      req.body = parsed.body ?? req.body;
      req.params = parsed.params ?? req.params;
      if (parsed.query) {
        Object.defineProperty(req, "query", {
          value: parsed.query,
          enumerable: true,
          configurable: true,
          writable: true,
        });
      }
      next();
    } catch (error) {
      return sendError(res, "Validation failed", formatZodIssues(error.issues || []), 400);
    }
  };
};
