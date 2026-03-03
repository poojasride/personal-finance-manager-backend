import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },

    limitAmount: {
      type: Number,
      required: true,
    },

    period: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Budget", budgetSchema);