import sgMail from "@sendgrid/mail";

async function sendEmail(token, email) {
  try {
    // Validate inputs
    if (!token) {
      throw new Error("Reset token is missing");
    }

    if (!email) {
      throw new Error("Recipient email is missing");
    } 

    // Set SendGrid API Key
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // Email message
    const msg = {
      to: email,
      from: process.env.EMAIL_USER, // Verified sender email
      subject: "Password Reset Request",
      text: `Password Reset Request

We received a request to reset your password.

Click the link below to reset your password:
https://e-mart-web.netlify.app/reset-password/${token}

This link will expire in 1 hour.

If you did not request this, please ignore this email.

Regards,
E-mart Support Team`,
    };

    // Send email
    const response = await sgMail.send(msg);

    console.log(" Email sent successfully");

    return {
      success: true,
      message: "Email sent successfully",
      response,
    };

  } catch (error) {

    console.error(" Email sending failed:", error.message);

    return {
      success: false,
      message: "Failed to send email",
      error: error.message,
    };
  }
}

export default sendEmail;