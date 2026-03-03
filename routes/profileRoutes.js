import express from "express";

import {protect} from "../middleware/authMiddleware.js";

import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  enableMFA,
  disableMFA,
} from "../controllers/profileController.js";

const router = express.Router();


router.get("/", protect, getUserProfile);

router.put("/", protect, updateUserProfile);

router.put("/change-password", protect, changePassword);

router.put("/enable-mfa", protect, enableMFA);

router.put("/disable-mfa", protect, disableMFA);


export default router;