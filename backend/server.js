// Purpose: Starts the BytesAndBeyond Express API after establishing the MongoDB connection.
import dotenv from "dotenv";
import app from "./src/app.js";
import connectDB from "../database/config/mongo.connection.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`BytesAndBeyond API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start API server:", error.message);
    process.exit(1);
  }
};

startServer();
