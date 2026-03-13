import Transaction from "../models/transaction.js";
import { exportCSV } from "../utils/csvExport.js";
import { exportPDF } from "../utils/pdfExport.js";

// ===============================
// EXPORT CSV REPORT
// ===============================
export const exportCSVReport = async (req, res) => {

  try {

    const { from, to } = req.query;

    const filter = {
      user: req.user._id
    };

    // Date filter
    if (from && to) {
      filter.date = {
        $gte: new Date(from),
        $lte: new Date(to)
      };
    }

    const data = await Transaction.find(filter).lean();

    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "No records found"
      });
    }

    const csv = exportCSV(data);

    res.header("Content-Type", "text/csv");
    res.attachment("transactions-report.csv");

    return res.send(csv);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};


// ===============================
// EXPORT PDF REPORT
// ===============================
export const exportPDFReport = async (req, res) => {

  try {

    const { from, to } = req.query;

    const filter = {
      user: req.user._id
    };

    if (from && to) {
      filter.date = {
        $gte: new Date(from),
        $lte: new Date(to)
      };
    }

    const data = await Transaction.find(filter).lean();

    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "No records found"
      });
    }

    exportPDF(res, data);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

