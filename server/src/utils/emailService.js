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
      <title>Verify Your Email</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #F4F9F9;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          background-color: #1B4965;
          color: #ffffff;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        .content {
          padding: 40px 30px;
        }
        .content h2 {
          color: #1B4965;
          margin-top: 0;
        }
        .button {
          display: inline-block;
          padding: 14px 32px;
          background-color: #1B4965;
          color: #ffffff;
          text-decoration: none;
          border-radius: 50px;
          font-weight: 600;
          margin: 20px 0;
        }
        .button:hover {
          background-color: #153a52;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #6c757d;
          border-top: 1px solid #dee2e6;
        }
        .warning {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 12px;
          margin: 20px 0;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Atlas</h1>
        </div>
        <div class="content">
          <h2>Welcome to Atlas, ${userName}!</h2>
          <p>Thanks for signing up! To get started, please verify your email address by clicking the button below:</p>

          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </div>

          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #6c757d; font-size: 14px;">${verificationUrl}</p>

          <div class="warning">
            <strong>Note:</strong> This verification link will expire in 24 hours. If you didn't create an account with Atlas, you can safely ignore this email.
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Atlas. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
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
      <title>Reset Your Password</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #F4F9F9;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          background-color: #1B4965;
          color: #ffffff;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        .content {
          padding: 40px 30px;
        }
        .content h2 {
          color: #1B4965;
          margin-top: 0;
        }
        .button {
          display: inline-block;
          padding: 14px 32px;
          background-color: #1B4965;
          color: #ffffff;
          text-decoration: none;
          border-radius: 50px;
          font-weight: 600;
          margin: 20px 0;
        }
        .button:hover {
          background-color: #153a52;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #6c757d;
          border-top: 1px solid #dee2e6;
        }
        .warning {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 12px;
          margin: 20px 0;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Atlas</h1>
        </div>
        <div class="content">
          <h2>Password Reset Request</h2>
          <p>Hi ${userName},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>

          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>

          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #6c757d; font-size: 14px;">${resetUrl}</p>

          <div class="warning">
            <strong>Important:</strong> This password reset link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Atlas. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
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
