import express from "express";
import {
  exportCSVReport,
  exportPDFReport,
} from "../controllers/exportController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/csv", protect, exportCSVReport);

router.get("/pdf", protect, exportPDFReport);

export default router;
