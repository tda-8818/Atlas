import { Resend } from 'resend';
import crypto from 'crypto';

// Lazy-load Resend client to ensure env vars are loaded
let resend = null;
const getResendClient = () => {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set in environment variables');
    }
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
};

/**
 * Generate a secure verification token
 * @returns {Object} { token: raw token, hashedToken: hashed version for DB }
 */
export const generateVerificationToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  return { token, hashedToken };
};

/**
 * Hash a token for comparison
 * @param {string} token - Raw token to hash
 * @returns {string} Hashed token
 */
export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generate HTML email template for verification
 * @param {string} verificationUrl - The verification URL
 * @param {string} userName - User's first name
 * @returns {string} HTML email content
 */
const getVerificationEmailTemplate = (verificationUrl, userName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - Atlas</title>
      <style>
        body {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #0a1929;
          background: linear-gradient(135deg, #f0f8ff 0%, #ffffff 50%, #e3f2fd 100%);
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(11, 128, 195, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #0b80c3 0%, #0d9ae6 100%);
          color: #ffffff;
          padding: 40px 20px;
          text-align: center;
        }
        .logo {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background-color: #ffffff;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          font-weight: bold;
          color: #0b80c3;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .header h1 {
          margin: 0;
          font-size: 32px;
          font-weight: bold;
        }
        .header p {
          margin: 8px 0 0 0;
          font-size: 14px;
          opacity: 0.9;
        }
        .content {
          padding: 40px 30px;
        }
        .content h2 {
          color: #0b80c3;
          margin-top: 0;
          font-size: 24px;
        }
        .content p {
          color: #546e7a;
          font-size: 16px;
        }
        .button-container {
          text-align: center;
          margin: 30px 0;
        }
        .button {
          display: inline-block;
          padding: 16px 40px;
          background: linear-gradient(135deg, #0b80c3 0%, #0d9ae6 100%);
          color: #ffffff;
          text-decoration: none;
          border-radius: 50px;
          font-weight: 600;
          font-size: 16px;
          box-shadow: 0 4px 15px rgba(11, 128, 195, 0.3);
          transition: transform 0.2s;
        }
        .button:hover {
          transform: scale(1.05);
        }
        .link-box {
          background-color: #f0f8ff;
          border: 2px dashed #bbdefb;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
          word-break: break-all;
          font-size: 13px;
          color: #546e7a;
        }
        .warning {
          background-color: #e3f2fd;
          border-left: 4px solid #0b80c3;
          padding: 15px;
          margin: 25px 0;
          font-size: 14px;
          border-radius: 4px;
        }
        .footer {
          background-color: #f0f8ff;
          padding: 30px 20px;
          text-align: center;
          font-size: 13px;
          color: #546e7a;
          border-top: 1px solid #bbdefb;
        }
        .footer p {
          margin: 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">A</div>
          <h1>Atlas</h1>
          <p>Navigate Your Work, Conquer Your Goals</p>
        </div>
        <div class="content">
          <h2>Welcome to Atlas, ${userName}!</h2>
          <p>Thanks for signing up! We're excited to have you on board. To get started and unlock all features, please verify your email address by clicking the button below:</p>

          <div class="button-container">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </div>

          <p style="text-align: center; color: #546e7a; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <div class="link-box">${verificationUrl}</div>

          <div class="warning">
            <strong style="color: #0b80c3;">Important:</strong> This verification link will expire in 24 hours. If you didn't create an account with Atlas, you can safely ignore this email.
          </div>
        </div>
        <div class="footer">
          <p><strong>Atlas by TDA Consulting</strong></p>
          <p>&copy; ${new Date().getFullYear()} Atlas. All rights reserved.</p>
          <p style="margin-top: 15px; font-size: 12px;">This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate HTML email template for password reset
 * @param {string} resetUrl - The password reset URL
 * @param {string} userName - User's first name
 * @returns {string} HTML email content
 */
const getPasswordResetEmailTemplate = (resetUrl, userName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - Atlas</title>
      <style>
        body {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #0a1929;
          background: linear-gradient(135deg, #f0f8ff 0%, #ffffff 50%, #e3f2fd 100%);
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(11, 128, 195, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #0b80c3 0%, #0d9ae6 100%);
          color: #ffffff;
          padding: 40px 20px;
          text-align: center;
        }
        .logo {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background-color: #ffffff;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          font-weight: bold;
          color: #0b80c3;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .header h1 {
          margin: 0;
          font-size: 32px;
          font-weight: bold;
        }
        .header p {
          margin: 8px 0 0 0;
          font-size: 14px;
          opacity: 0.9;
        }
        .content {
          padding: 40px 30px;
        }
        .content h2 {
          color: #0b80c3;
          margin-top: 0;
          font-size: 24px;
        }
        .content p {
          color: #546e7a;
          font-size: 16px;
        }
        .button-container {
          text-align: center;
          margin: 30px 0;
        }
        .button {
          display: inline-block;
          padding: 16px 40px;
          background: linear-gradient(135deg, #0b80c3 0%, #0d9ae6 100%);
          color: #ffffff;
          text-decoration: none;
          border-radius: 50px;
          font-weight: 600;
          font-size: 16px;
          box-shadow: 0 4px 15px rgba(11, 128, 195, 0.3);
          transition: transform 0.2s;
        }
        .button:hover {
          transform: scale(1.05);
        }
        .link-box {
          background-color: #f0f8ff;
          border: 2px dashed #bbdefb;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
          word-break: break-all;
          font-size: 13px;
          color: #546e7a;
        }
        .warning {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 25px 0;
          font-size: 14px;
          border-radius: 4px;
        }
        .footer {
          background-color: #f0f8ff;
          padding: 30px 20px;
          text-align: center;
          font-size: 13px;
          color: #546e7a;
          border-top: 1px solid #bbdefb;
        }
        .footer p {
          margin: 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">A</div>
          <h1>Atlas</h1>
          <p>Navigate Your Work, Conquer Your Goals</p>
        </div>
        <div class="content">
          <h2>Password Reset Request</h2>
          <p>Hi ${userName},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>

          <div class="button-container">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>

          <p style="text-align: center; color: #546e7a; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <div class="link-box">${resetUrl}</div>

          <div class="warning">
            <strong style="color: #856404;">Important:</strong> This password reset link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
          </div>
        </div>
        <div class="footer">
          <p><strong>Atlas by TDA Consulting</strong></p>
          <p>&copy; ${new Date().getFullYear()} Atlas. All rights reserved.</p>
          <p style="margin-top: 15px; font-size: 12px;">This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Send verification email to user
 * @param {Object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.userName - User's first name
 * @param {string} params.verificationToken - Raw verification token
 * @returns {Promise<Object>} Resend API response
 */
export const sendVerificationEmail = async ({ to, userName, verificationToken }) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
  const resendClient = getResendClient();

  try {
    const data = await resendClient.emails.send({
      from: process.env.EMAIL_FROM || 'Atlas <onboarding@resend.dev>',
      to: [to],
      subject: 'Verify your email address - Atlas',
      html: getVerificationEmailTemplate(verificationUrl, userName),
    });

    console.log('Verification email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

/**
 * Send password reset email to user
 * @param {Object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.userName - User's first name
 * @param {string} params.resetToken - Raw reset token
 * @returns {Promise<Object>} Resend API response
 */
export const sendPasswordResetEmail = async ({ to, userName, resetToken }) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  const resendClient = getResendClient();

  try {
    const data = await resendClient.emails.send({
      from: process.env.EMAIL_FROM || 'Atlas <onboarding@resend.dev>',
      to: [to],
      subject: 'Reset your password - Atlas',
      html: getPasswordResetEmailTemplate(resetUrl, userName),
    });

    console.log('Password reset email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

export default {
  sendVerificationEmail,
  sendPasswordResetEmail,
  generateVerificationToken,
  hashToken,
};
