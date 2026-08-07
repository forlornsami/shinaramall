import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE !== 'false', // true for port 465 (SSL)
  auth: {
    user: process.env.SMTP_USER || 'noreply@shinaramall.com',
    pass: process.env.SMTP_PASSWORD,
  },
});

const FROM_EMAIL = process.env.SMTP_FROM || 'Shinara Mall <noreply@shinaramall.com>';
const REPLY_TO  = process.env.SMTP_REPLY_TO || 'support@shinaramall.com';

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendVerificationEmail(
  to: string,
  firstName: string,
  verificationToken: string
): Promise<EmailResult> {
  const verificationUrl = `${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'https://shinaramall.com'}/verify-email?token=${verificationToken}`;

  try {
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      replyTo: REPLY_TO,
      subject: 'Verify Your Email - Shinara Mall',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Shinara Mall</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333;">Welcome, ${firstName || 'Valued Customer'}!</h2>
            <p>Thank you for creating an account with Shinara Mall. Please verify your email address to complete your registration.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
            <p style="color: #666; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} Shinara Mall. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `,
    });
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Email service error:', error);
    return { success: false, error: error.message };
  }
}

export async function sendOrderConfirmationEmail(
  to: string,
  firstName: string,
  orderId: string,
  orderTotal: string,
  paymentMethod: string
): Promise<EmailResult> {
  const orderUrl = `${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'https://shinaramall.com'}/orders/${orderId}`;

  try {
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      replyTo: REPLY_TO,
      subject: `Order Confirmation #${orderId.slice(-8).toUpperCase()} - Shinara Mall`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Shinara Mall</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333;">Order Confirmed!</h2>
            <p>Hi ${firstName || 'Valued Customer'},</p>
            <p>Thank you for your order! We've received it and will process it shortly.</p>
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Order ID:</strong> #${orderId.slice(-8).toUpperCase()}</p>
              <p style="margin: 5px 0;"><strong>Total:</strong> Rs. ${parseFloat(orderTotal).toLocaleString()}</p>
              <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${paymentMethod}</p>
            </div>
            ${paymentMethod !== 'cod' ? `
            <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;"><strong>Next Step:</strong> Please upload your payment screenshot in your order details to confirm payment.</p>
            </div>
            ` : ''}
            <div style="text-align: center; margin: 30px 0;">
              <a href="${orderUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                View Order Details
              </a>
            </div>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} Shinara Mall. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `,
    });
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Email service error:', error);
    return { success: false, error: error.message };
  }
}

export async function sendOrderStatusUpdateEmail(
  to: string,
  firstName: string,
  orderId: string,
  newStatus: string
): Promise<EmailResult> {
  const orderUrl = `${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'https://shinaramall.com'}/orders/${orderId}`;

  const statusMessages: Record<string, { title: string; message: string; color: string }> = {
    processing: { title: 'Order Processing', message: 'Your order is being processed and will be shipped soon.', color: '#17a2b8' },
    shipped:    { title: 'Order Shipped',    message: 'Great news! Your order has been shipped and is on its way.',       color: '#28a745' },
    delivered:  { title: 'Order Delivered',  message: 'Your order has been delivered. We hope you enjoy your purchase!', color: '#28a745' },
    cancelled:  { title: 'Order Cancelled',  message: 'Your order has been cancelled. If you have any questions, please contact us.', color: '#dc3545' },
  };

  const statusInfo = statusMessages[newStatus] || { title: 'Order Update', message: `Your order status has been updated to: ${newStatus}`, color: '#6c757d' };

  try {
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      replyTo: REPLY_TO,
      subject: `${statusInfo.title} - Order #${orderId.slice(-8).toUpperCase()}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Shinara Mall</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: ${statusInfo.color};">${statusInfo.title}</h2>
            <p>Hi ${firstName || 'Valued Customer'},</p>
            <p>${statusInfo.message}</p>
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Order ID:</strong> #${orderId.slice(-8).toUpperCase()}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: ${statusInfo.color}; font-weight: bold;">${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}</span></p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${orderUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                View Order Details
              </a>
            </div>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} Shinara Mall. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `,
    });
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Email service error:', error);
    return { success: false, error: error.message };
  }
}

export async function sendPaymentVerifiedEmail(
  to: string,
  firstName: string,
  orderId: string,
  orderTotal: string
): Promise<EmailResult> {
  const orderUrl = `${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'https://shinaramall.com'}/orders/${orderId}`;

  try {
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      replyTo: REPLY_TO,
      subject: `Payment Confirmed - Order #${orderId.slice(-8).toUpperCase()}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Shinara Mall</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="font-size: 48px;">✅</span>
            </div>
            <h2 style="color: #28a745; text-align: center;">Payment Verified!</h2>
            <p>Hi ${firstName || 'Valued Customer'},</p>
            <p>Great news! Your payment of <strong>Rs. ${parseFloat(orderTotal).toLocaleString()}</strong> has been verified successfully.</p>
            <p>Your order is now being processed and will be shipped soon.</p>
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Order ID:</strong> #${orderId.slice(-8).toUpperCase()}</p>
              <p style="margin: 5px 0;"><strong>Amount:</strong> Rs. ${parseFloat(orderTotal).toLocaleString()}</p>
              <p style="margin: 5px 0;"><strong>Payment Status:</strong> <span style="color: #28a745; font-weight: bold;">Verified</span></p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${orderUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                View Order Details
              </a>
            </div>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} Shinara Mall. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `,
    });
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Email service error:', error);
    return { success: false, error: error.message };
  }
}

export async function sendPasswordResetEmail(
  to: string,
  firstName: string,
  resetToken: string
): Promise<EmailResult> {
  const resetUrl = `${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'https://shinaramall.com'}/reset-password?token=${resetToken}`;

  try {
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      replyTo: REPLY_TO,
      subject: 'Reset Your Password - Shinara Mall',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Shinara Mall</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333;">Reset Your Password</h2>
            <p>Hi ${firstName || 'Valued Customer'},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email. Your password will remain unchanged.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} Shinara Mall. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `,
    });
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Email service error:', error);
    return { success: false, error: error.message };
  }
}
