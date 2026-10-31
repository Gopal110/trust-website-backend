const https = require('https');

/**
 * Send SMS using configured provider
 * Supports:
 *  - Twilio (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)
 *  - MSG91 (MSG91_AUTH_KEY, MSG91_TEMPLATE_ID / MSG91_SENDER_ID)
 *  - Fast2SMS (FAST2SMS_API_KEY)
 *  - Generic Webhook (SMS_WEBHOOK_URL)
 *
 * @param {string} mobile 10-digit Indian mobile number
 * @param {string} otp 6-digit OTP
 * @returns {Promise<{success: boolean, message: string, provider: string}>}
 */
async function sendOtpSms(mobile, otp) {
  const cleanMobile = String(mobile).replace(/\D/g, '').slice(-10);
  const messageText = `Your OTP for Shri Shivcharan Trust admin password reset is ${otp}. Valid for 5 minutes. Do not share with anyone.`;

  // 1. Twilio
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    return new Promise((resolve) => {
      const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
      const postData = new URLSearchParams({
        To: `+91${cleanMobile}`,
        From: process.env.TWILIO_PHONE_NUMBER,
        Body: messageText
      }).toString();

      const options = {
        hostname: 'api.twilio.com',
        path: `/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ success: true, message: 'OTP sent via Twilio', provider: 'twilio' });
          } else {
            console.error('Twilio SMS error:', data);
            resolve({ success: false, message: 'Twilio delivery failed', provider: 'twilio' });
          }
        });
      });

      req.on('error', (err) => {
        console.error('Twilio request error:', err.message);
        resolve({ success: false, message: err.message, provider: 'twilio' });
      });

      req.write(postData);
      req.end();
    });
  }

  // 2. MSG91
  if (process.env.MSG91_AUTH_KEY) {
    return new Promise((resolve) => {
      const payload = JSON.stringify({
        template_id: process.env.MSG91_TEMPLATE_ID || '',
        short_url: '0',
        recipients: [
          {
            mobiles: `91${cleanMobile}`,
            otp: otp
          }
        ]
      });

      const options = {
        hostname: 'control.msg91.com',
        path: '/api/v5/flow/',
        method: 'POST',
        headers: {
          'authkey': process.env.MSG91_AUTH_KEY,
          'content-type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ success: true, message: 'OTP sent via MSG91', provider: 'msg91' });
          } else {
            console.error('MSG91 SMS error:', data);
            resolve({ success: false, message: 'MSG91 delivery failed', provider: 'msg91' });
          }
        });
      });

      req.on('error', (err) => {
        console.error('MSG91 request error:', err.message);
        resolve({ success: false, message: err.message, provider: 'msg91' });
      });

      req.write(payload);
      req.end();
    });
  }

  // 3. Fast2SMS
  if (process.env.FAST2SMS_API_KEY) {
    return new Promise((resolve) => {
      const postData = JSON.stringify({
        route: 'otp',
        variables_values: otp,
        numbers: cleanMobile
      });

      const options = {
        hostname: 'www.fast2sms.com',
        path: '/dev/bulkV2',
        method: 'POST',
        headers: {
          'authorization': process.env.FAST2SMS_API_KEY,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ success: true, message: 'OTP sent via Fast2SMS', provider: 'fast2sms' });
          } else {
            console.error('Fast2SMS error:', data);
            resolve({ success: false, message: 'Fast2SMS delivery failed', provider: 'fast2sms' });
          }
        });
      });

      req.on('error', (err) => {
        console.error('Fast2SMS request error:', err.message);
        resolve({ success: false, message: err.message, provider: 'fast2sms' });
      });

      req.write(postData);
      req.end();
    });
  }

  // If no SMS gateway is configured
  console.warn('⚠️ No SMS gateway configured. (Set TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN/TWILIO_PHONE_NUMBER or MSG91_AUTH_KEY or FAST2SMS_API_KEY in Render environment variables).');
  return {
    success: false,
    message: 'SMS Gateway is not configured on the server. Please configure MSG91 or Twilio credentials in your Render environment variables.',
    provider: 'none'
  };
}

module.exports = { sendOtpSms };
