import User from "../models/user.js";
import bcrypt from "bcryptjs";


// GET PROFILE
export const getUserProfile = async (req, res) => {
  try {

    const user = await User.findById(req.user._id)
      .select("-password");

    res.json({
      success: true,
      user,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};



// UPDATE PROFILE
export const updateUserProfile = async (req, res) => {
  try {

    const {
      username,
      phone,
      currency,
      categories,
      notificationPreferences,
      profilePicture,
    } = req.body;

    const user =
      await User.findById(req.user._id);

    if (!user)
      return res.status(404).json({
        message: "User not found",
      });

    user.username =
      username || user.username;

    user.phone =
      phone || user.phone;

    user.currency =
      currency || user.currency;

    user.profilePicture =
      profilePicture || user.profilePicture;

    if (categories)
      user.categories = categories;

    if (notificationPreferences)
      user.notificationPreferences =
        notificationPreferences;

    await user.save();

    res.json({
      success: true,
      message: "Profile updated",
      user,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};



// CHANGE PASSWORD
export const changePassword = async (req, res) => {

  try {

    const {
      currentPassword,
      newPassword,
    } = req.body;

    const user =
      await User.findById(req.user._id);

    const isMatch =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!isMatch)
      return res.status(400).json({
        message: "Current password incorrect",
      });

    const salt =
      await bcrypt.genSalt(10);

    user.password =
      await bcrypt.hash(
        newPassword,
        salt
      );

    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};



// ENABLE MFA
export const enableMFA = async (req, res) => {

  try {

    const user =
      await User.findById(req.user._id);

    user.mfaEnabled = true;

    await user.save();

    res.json({
      success: true,
      message: "MFA enabled successfully",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};



// DISABLE MFA
export const disableMFA = async (req, res) => {

  try {

    const user =
      await User.findById(req.user._id);

    user.mfaEnabled = false;

    await user.save();

    res.json({
      success: true,
      message: "MFA disabled successfully",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};