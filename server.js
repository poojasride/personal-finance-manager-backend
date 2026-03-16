import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// ROUTES IMPORTS
import authRoutes from "./routes/authRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import forecastRoutes from "./routes/forecastRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import exportRoutes from "./routes/exportRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import "./utils/cronJobs.js";


dotenv.config();

connectDB();

const app = express();

// CORS
app.use(
  cors({
    origin: "https://personal-finance-manager-03.netlify.app",
    credentials: true,
  }),
);

// Body parser
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("API Running Successfully");
});

// ==========================
// REGISTER ALL ROUTES HERE
// ==========================

// Auth
app.use("/api/auth", authRoutes);

// Transactions (income + expense)
app.use("/api/transactions", transactionRoutes);

// Budgets
app.use("/api/budgets", budgetRoutes);

// Goals
app.use("/api/goals", goalRoutes);

// Forecast
app.use("/api/forecast", forecastRoutes);

// Reports
app.use("/api/reports", reportRoutes);

//Notifications
app.use("/api/notifications", notificationRoutes);

//Export Records
app.use("/api/export", exportRoutes);

//Profile Management
app.use("/api/profile", profileRoutes);

//For categories
app.use("/api/categories", categoryRoutes);


// ==========================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
