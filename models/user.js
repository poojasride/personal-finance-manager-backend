import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    // PROFILE FIELDS
    phone: {
      type: String,
      default: "",
    },

    profilePicture: {
      type: String,
      default: "",
    },

    currency: {
      type: String,
      default: "INR",
    },

    categories: {
      type: [String],
      default: [
        "Food",
        "Transport",
        "Shopping",
        "Bills",
        "Entertainment",
        "Health",
      ],
    },

    notificationPreferences: {
      budgetAlerts: {
        type: Boolean,
        default: true,
      },
      goalAlerts: {
        type: Boolean,
        default: true,
      },
      expenseAlerts: {
        type: Boolean,
        default: true,
      },
    },

    // MFA
    mfaEnabled: {
      type: Boolean,
      default: false,
    },

    mfaSecret: {
      type: String,
      default: "",
    },

    // RESET PASSWORD
    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;