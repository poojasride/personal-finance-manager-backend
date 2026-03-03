import mongoose from "mongoose";

const notificationSchema =
new mongoose.Schema(
{
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  title: String,

  message: String,

  type: {
    type: String,
    enum: [
      "budget",
      "goal",
      "expense",
      "income",
      "system",
    ],
  },

  read: {
    type: Boolean,
    default: false,
  },
},
{ timestamps: true }
);

export default mongoose.model(
  "Notification",
  notificationSchema
);