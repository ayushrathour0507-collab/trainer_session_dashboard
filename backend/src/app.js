// Purpose: Configures Express middleware, API routes, health checks, and global error handling.
import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import evaluationRoutes from "./routes/evaluation.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";
import leaderboardRoutes from "./routes/leaderboard.routes.js";
import announcementRoutes from "./routes/announcement.routes.js";
import { dashboardRouter, trainerRouter } from "./routes/dashboard.routes.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "BytesAndBeyond API is healthy",
    data: { service: "bytesandbeyond-api" },
    error: null,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/evaluations", evaluationRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/trainers", trainerRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
