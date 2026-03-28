import cron from "node-cron";
import User from "../models/user.js";
import {
  checkUpcomingBills,
  checkRecurringExpenses,
} from "../services/notificationService.js";

cron.schedule("45 7 * * *", async () => {

  console.log("Running daily finance reminders...");

  const users = await User.find();

  for (const user of users) {

    await checkUpcomingBills(user._id);
    await checkRecurringExpenses(user._id);

  }

});