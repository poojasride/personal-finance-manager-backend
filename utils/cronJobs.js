import cron from "node-cron";
import User from "../models/user.js";
import {
  checkUpcomingBills,
  checkRecurringExpenses,
} from "../services/notificationService.js";
import mongoose from "mongoose";

cron.schedule("45 14 * * *", async () => {

  console.log("Running daily finance reminders...");

  const users = await User.find();

  for (const user of users) {
    await checkUpcomingBills(new mongoose.Types.ObjectId(user._id));
    await checkRecurringExpenses(new mongoose.Types.ObjectId(user._id));
  }
});
