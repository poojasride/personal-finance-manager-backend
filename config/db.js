import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = "mongodb://localhost:27017/personal-finance-manager";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
