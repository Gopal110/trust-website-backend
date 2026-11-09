const nodemailer = require('nodemailer');

/**
 * Send OTP via Email using Nodemailer
 * Supports standard SMTP (Gmail App Password, Brevo, SendGrid, etc.)
 *
 * Environment variables:
 *  - EMAIL_USER / SMTP_USER (e.g. sscdms.trust@gmail.com)
 *  - EMAIL_PASS / SMTP_PASS (App Password or SMTP password)
 *  - SMTP_HOST (default: 'smtp.gmail.com')
 *  - SMTP_PORT (default: 587)
 *
 * @param {string} toEmail Recipient email address
 * @param {string} otp 6-digit OTP
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function sendOtpEmail(toEmail, otp) {
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

  if (!user || !pass) {
    return {
      success: false,
      message: 'SMTP credentials not configured (Set EMAIL_USER and EMAIL_PASS).'
    };
  }

  try {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const secure = port === 465;

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass }
    });

    const mailOptions = {
      from: `"Shri Shivcharan Trust" <${user}>`,
      to: toEmail,
      subject: 'Password Reset OTP - Shri Shiv Charan Dharmarth Manav Seva Trust',
      text: `Your One-Time Password (OTP) for admin password reset is: ${otp}\n\nThis code is valid for 5 minutes. Do not share this code with anyone.\n\nShri Shiv Charan Dharmarth Manav Seva Trust\nhttps://shri-shiv-charan-dharmarth-manav-seva-trust.com`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #fed7aa; border-radius: 16px; background-color: #fff7ed;">
          <h2 style="color: #ea580c; margin-bottom: 8px;">श्री शिवचरण धर्मार्थ मानव सेवा ट्रस्ट</h2>
          <h3 style="color: #1f2937; margin-top: 0;">Admin Password Reset Request</h3>
          <p style="color: #4b5563; font-size: 14px;">You have requested to reset your password for the admin portal. Use the OTP below to complete the verification:</p>
          <div style="background-color: #ffffff; padding: 16px 24px; border-radius: 12px; text-align: center; margin: 24px 0; border: 2px dashed #f97316;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #ea580c; font-family: monospace;">${otp}</span>
          </div>
          <p style="color: #6b7280; font-size: 13px;">This OTP is valid for <strong>5 minutes</strong>. If you did not request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #ffedd5; margin: 20px 0;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">Shri Shiv Charan Dharmarth Manav Seva Trust &bull; Goverdhan, Mathura, U.P.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'OTP email sent successfully.' };
  } catch (err) {
    console.error('Nodemailer error:', err.message);
    return { success: false, message: `Failed to send email: ${err.message}` };
  }
}

module.exports = { sendOtpEmail };
