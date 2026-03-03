import Notification from "../models/Notification.js";


// CREATE notification
export const createNotification =
async (userId, title, message, type) => {

  await Notification.create({
    user: userId,
    title,
    message,
    type,
  });
};


// GET notifications
export const getNotifications =
async (req, res) => {

  const notifications =
    await Notification.find({
      user: req.user._id,
    });

  res.json(notifications);
};


// MARK READ
export const markRead =
async (req, res) => {

  const notification =
    await Notification.findById(
      req.params.id
    );

  notification.read = true;

  await notification.save();

  res.json(notification);
};