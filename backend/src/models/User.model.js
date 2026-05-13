// Purpose: Defines platform users and handles password hashing for admin, trainer, and viewer roles.
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { USER_ROLES } from "../config/constants.js";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@iamneo\.ai$/i, "Email must use the @iamneo.ai domain"],
    },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: USER_ROLES, default: "viewer" },
    avatar: { type: String, default: "" },
  },
  { timestamps: true },
);

userSchema.pre("save", async function hashPassword(next) {
  try {
    if (!this.isModified("password")) {
      return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
