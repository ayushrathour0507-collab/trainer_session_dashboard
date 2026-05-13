// Purpose: Creates and verifies short-lived access tokens and refresh tokens.
import jwt from "jsonwebtoken";

const accessSecret = () => process.env.JWT_SECRET || "dev_access_secret_change_me";
const refreshSecret = () => process.env.JWT_REFRESH_SECRET || "dev_refresh_secret_change_me";

export const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, accessSecret(), { expiresIn: "15m" });
};

export const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, refreshSecret(), { expiresIn: "7d" });
};

export const verifyAccessToken = (token) => jwt.verify(token, accessSecret());

export const verifyRefreshToken = (token) => jwt.verify(token, refreshSecret());
