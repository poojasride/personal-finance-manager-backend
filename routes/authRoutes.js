import express from "express";

import {
  register,
  login,
  logout,
  getProfile,
  forgotPassword,
  updateProfile,
  changePassword,
  resetPassword,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", protect, getProfile);

router.put("/profile", protect, updateProfile);

router.put("/change-password", protect, changePassword);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
