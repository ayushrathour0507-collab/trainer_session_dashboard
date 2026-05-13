// Purpose: Handles registration, login, token refresh, logout, and current-user lookup.
import User from "../models/User.model.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.utils.js";
import { sendError, sendSuccess } from "../utils/response.utils.js";

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
});

export const register = async (req, res) => {
  try {
    const { name, email, password, role = "viewer" } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return sendError(res, "A user with this email already exists", null, 409);
    }

    const user = await User.create({ name, email, password, role });
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return sendSuccess(res, "Registration successful", { user: publicUser(user), accessToken, refreshToken }, 201);
  } catch (error) {
    return sendError(res, "Registration failed", error.message, 500);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return sendError(res, "Invalid email or password", null, 401);
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return sendSuccess(res, "Login successful", { user: publicUser(user), accessToken, refreshToken });
  } catch (error) {
    return sendError(res, "Login failed", error.message, 500);
  }
};

export const refresh = async (req, res) => {
  try {
    const token = req.body.refreshToken || req.cookies?.refreshToken;
    if (!token) {
      return sendError(res, "Refresh token is required", null, 401);
    }

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id);
    if (!user) {
      return sendError(res, "Refresh token user does not exist", null, 401);
    }

    return sendSuccess(res, "Token refreshed", {
      accessToken: generateAccessToken(user),
      refreshToken: generateRefreshToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    return sendError(res, "Invalid refresh token", error.message, 401);
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return sendSuccess(res, "Logged out successfully", null);
  } catch (error) {
    return sendError(res, "Logout failed", error.message, 500);
  }
};

export const me = async (req, res) => {
  try {
    return sendSuccess(res, "Current user loaded", { user: req.user });
  } catch (error) {
    return sendError(res, "Unable to load current user", error.message, 500);
  }
};
