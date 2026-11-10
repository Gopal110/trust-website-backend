const https = require('https');

/**
 * Send OTP via Email using Resend HTTPS API
 * Environment variables:
 *   - RESEND_API_KEY (required)
 *   - EMAIL_FROM (verified sender address/domain in Resend)
 *
 * @param {string} toEmail Recipient email address
 * @param {string} otp 6-digit OTP
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function sendOtpEmail(toEmail, otp) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    return {
      success: false,
      message: 'Resend API not configured (set RESEND_API_KEY and EMAIL_FROM).'
    };
  }

  const subject = 'Password Reset OTP - Shri Shiv Charan Dharmarth Manav Seva Trust';
  const text = `Your One-Time Password (OTP) for admin password reset is: ${otp}\n\nThis code is valid for 5 minutes. Do not share this code with anyone.\n\nShri Shiv Charan Dharmarth Manav Seva Trust\nhttps://shri-shiv-charan-dharmarth-manav-seva-trust.com`;
  const html = `
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
  `;

  const payload = JSON.stringify({ from, to: toEmail, subject, text, html });

  const options = {
    hostname: 'api.resend.com',
    path: '/emails',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
      'Authorization': `Bearer ${apiKey}`
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, message: 'OTP email sent successfully.' });
        } else {
          console.error('Resend API error:', data);
          resolve({ success: false, message: `Failed to send email via Resend (status ${res.statusCode}).` });
        }
      });
    });
    req.on('error', (err) => {
      console.error('Resend request error:', err.message);
      resolve({ success: false, message: `Failed to send email: ${err.message}` });
    });
    req.write(payload);
    req.end();
  });
}

module.exports = { sendOtpEmail };

