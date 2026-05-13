// Purpose: Authenticates API requests with a bearer access token and attaches the user to the request.
import User from "../models/User.model.js";
import { verifyAccessToken } from "../utils/jwt.utils.js";
import { sendError } from "../utils/response.utils.js";

export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : req.cookies?.accessToken;

    if (!token) {
      return sendError(res, "Authentication token is required", null, 401);
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select("-password").lean();

    if (!user) {
      return sendError(res, "Authenticated user no longer exists", null, 401);
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, "Invalid or expired access token", error.message, 401);
  }
};
