import { error } from "console";
import Transaction from "../models/transaction.js";
import { exportCSV } from "../utils/csvExport.js";
import { exportPDF } from "../utils/pdfExport.js";

// CSV export
export const exportCSVReport = async (req, res) => {
  const data = await Transaction.find({
    user: req.user._id,
  });

  if (!data || data.length === 0) {
    return res.status(401).json({ message: "No records found" });
  }

  const csv = exportCSV(data);

  res.header("Content-Type", "text/csv");

  res.attachment("report.csv");

  res.send(csv);
};

// PDF export
export const exportPDFReport = async (req, res) => {
  const data = await Transaction.find({
    user: req.user._id,
  });

  exportPDF(res, data);
};
