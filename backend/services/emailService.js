// services/emailService.js
import nodemailer from 'nodemailer';

// Simple transporter using your email
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  
  if (!emailUser || !emailPassword) {
    console.log('❌ Email configuration missing in .env');
    console.log('   Add these lines to your .env file:');
    console.log('   EMAIL_USER=ahmed@pureclay.com');
    console.log('   EMAIL_PASSWORD=your_app_password_here');
    return null;
  }

  console.log('✅ Using email:', emailUser);
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
    pool: true,
    maxConnections: 1,
    rateDelta: 20000,
    rateLimit: 5
  });
};

// ============================================
// FORMATTING HELPER FUNCTIONS (for order emails)
// ============================================

// Format currency
const formatCurrency = (amount) => {
  return `PKR ${amount.toFixed(2)}`;
};

// Format date
const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Generate order items HTML
const generateOrderItemsHTML = (items) => {
  let itemsHTML = '';
  
  items.forEach(item => {
    const itemTotal = (item.price * item.quantity).toFixed(2);
    itemsHTML += `
      <tr style="border-bottom: 1px solid #e0e0e0;">
        <td style="padding: 12px; text-align: left;">
          <div style="font-weight: 600; color: #333;">${item.name}</div>
          ${item.isFromDeal ? '<div style="font-size: 12px; color: #b91c1c; margin-top: 4px;">Deal Item</div>' : ''}
        </td>
        <td style="padding: 12px; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right;">${formatCurrency(item.price)}</td>
        <td style="padding: 12px; text-align: right; font-weight: 600;">${formatCurrency(parseFloat(itemTotal))}</td>
      </tr>
    `;
  });
  
  return itemsHTML;
};

// Generate order summary HTML
const generateOrderSummaryHTML = (order) => {
  const subtotal = order.amount - (order.deliveryCharges || 0);
  
  return `
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #333; margin-top: 0; margin-bottom: 15px; font-size: 18px;">Order Summary</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #666;">Subtotal:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 500;">${formatCurrency(subtotal)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Delivery Charges:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 500;">${formatCurrency(order.deliveryCharges || 0)}</td>
        </tr>
        <tr style="border-top: 2px solid #ddd;">
          <td style="padding: 12px 0 0 0; font-weight: 700; font-size: 16px;">Total Amount:</td>
          <td style="padding: 12px 0 0 0; text-align: right; font-weight: 700; font-size: 18px; color: #2d5016;">${formatCurrency(order.amount)}</td>
        </tr>
      </table>
    </div>
  `;
};

// Generate delivery address HTML
const generateDeliveryAddressHTML = (address) => {
  return `
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #333; margin-top: 0; margin-bottom: 15px; font-size: 18px;">Delivery Address</h3>
      <p style="margin: 5px 0; color: #555;"><strong>Street:</strong> ${address.street}</p>
      <p style="margin: 5px 0; color: #555;"><strong>City:</strong> ${address.city}</p>
      <p style="margin: 5px 0; color: #555;"><strong>Province:</strong> ${address.state}</p>
      <p style="margin: 5px 0; color: #555;"><strong>ZIP Code:</strong> ${address.zipcode}</p>
    </div>
  `;
};

// ============================================
// PASSWORD RESET EMAILS
// ============================================

// Send password reset OTP email
export const sendPasswordResetEmail = async (email, otp, userName = 'there') => {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      console.log('❌ Cannot send password reset email - check email configuration');
      return false;
    }

    const mailOptions = {
      from: `"Pure Clay" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Password Reset OTP - Pure Clay',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #000; color: #fff; padding: 25px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 25px; border-radius: 0 0 8px 8px; }
                .otp-box { background: #fff; padding: 20px; text-align: center; border-radius: 8px; border: 2px dashed #000; margin: 20px 0; }
                .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #000; font-family: monospace; }
                .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; border-radius: 4px; }
                .footer { margin-top: 25px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">Password Reset Request</h1>
                    <p style="margin: 5px 0 0 0; opacity: 0.9;">Pure Clay</p>
                </div>
                <div class="content">
                    <p>Hi <strong>${userName}</strong>,</p>
                    
                    <p>You requested to reset your password for your Pure Clay account. Use the OTP below to proceed:</p>
                    
                    <div class="otp-box">
                        <div class="otp-code">${otp}</div>
                        <p style="margin: 10px 0 0; color: #666;">This OTP will expire in 10 minutes</p>
                    </div>
                    
                    <div class="warning">
                        <strong>⚠️ Security Notice:</strong>
                        <p style="margin: 5px 0 0;">If you didn't request this password reset, please ignore this email. Your account security is important to us.</p>
                    </div>
                    
                    <p>Need help? Contact our support team at <a href="mailto:${process.env.EMAIL_USER}">${process.env.EMAIL_USER}</a></p>
                </div>
                <div class="footer">
                    <p>This is an automated message. Please do not reply to this email.</p>
                    <p>&copy; ${new Date().getFullYear()} Pure Clay. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Password reset OTP sent to:', email);
    return true;

  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    return false;
  }
};

// Send password reset success email
export const sendPasswordResetSuccessEmail = async (email, userName = 'there') => {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      console.log('❌ Cannot send success email - check email configuration');
      return false;
    }

    const mailOptions = {
      from: `"Pure Clay" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '✅ Password Reset Successful - Pure Clay',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #000; color: #fff; padding: 25px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 25px; border-radius: 0 0 8px 8px; }
                .success-box { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 15px 0; border-radius: 4px; }
                .footer { margin-top: 25px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">Password Reset Successful</h1>
                    <p style="margin: 5px 0 0 0; opacity: 0.9;">Pure Clay</p>
                </div>
                <div class="content">
                    <p>Hi <strong>${userName}</strong>,</p>
                    
                    <div class="success-box">
                        <strong>✅ Success!</strong>
                        <p style="margin: 5px 0 0;">Your Pure Clay account password has been reset successfully.</p>
                    </div>
                    
                    <p>You can now login to your account using your new password.</p>
                    
                    <p>If you did not make this change, please contact our support team immediately at <a href="mailto:${process.env.EMAIL_USER}">${process.env.EMAIL_USER}</a></p>
                    
                    <p>Thank you for choosing Pure Clay!</p>
                </div>
                <div class="footer">
                    <p>This is an automated message. Please do not reply to this email.</p>
                    <p>&copy; ${new Date().getFullYear()} Pure Clay. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Password reset success email sent to:', email);
    return true;

  } catch (error) {
    console.error('❌ Error sending password reset success email:', error);
    return false;
  }
};

// ============================================
// ORDER CONFIRMATION EMAIL
// ============================================

// Send order confirmation email
export const sendOrderConfirmationEmail = async (order) => {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      console.log('❌ Cannot send order confirmation email - email configuration missing');
      return false;
    }

    const customerEmail = order.customerDetails?.email;
    const customerName = order.customerDetails?.name || 'Valued Customer';
    const orderId = order._id.toString().slice(-8).toUpperCase();
    const shortOrderId = order._id.toString().slice(-6);

    if (!customerEmail) {
      console.log(`⚠️ No email found for order ${order._id}. Skipping confirmation email.`);
      return false;
    }

    console.log(`📧 Sending order confirmation email to: ${customerEmail} for order ${order._id}`);

    // Generate items HTML
    const itemsHTML = generateOrderItemsHTML(order.items);

    const mailOptions = {
      from: `"Pure Clay" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `🎉 Order Confirmed #${orderId} - Pure Clay`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }
                .header {
                    background: #000;
                    color: white;
                    padding: 30px 20px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 28px;
                    font-weight: 600;
                    letter-spacing: 1px;
                }
                .header p {
                    margin: 10px 0 0;
                    opacity: 0.9;
                    font-size: 16px;
                }
                .content {
                    padding: 30px;
                    background: white;
                }
                .greeting {
                    font-size: 18px;
                    margin-bottom: 20px;
                }
                .order-details {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                    border-left: 4px solid #000;
                }
                .order-details p {
                    margin: 8px 0;
                    color: #555;
                }
                .order-details strong {
                    color: #333;
                }
                .items-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                    background: white;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                }
                .items-table th {
                    background: #000;
                    color: white;
                    padding: 12px;
                    text-align: left;
                    font-weight: 600;
                    font-size: 14px;
                }
                .items-table td {
                    padding: 12px;
                    border-bottom: 1px solid #e0e0e0;
                }
                .status-badge {
                    display: inline-block;
                    background: #2d5016;
                    color: white;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 14px;
                    font-weight: 600;
                    margin: 10px 0;
                }
                .tracking-info {
                    background: #fff3cd;
                    border: 1px solid #ffeeba;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 20px 0;
                    color: #856404;
                }
                .button {
                    display: inline-block;
                    background: #000;
                    color: white;
                    padding: 12px 30px;
                    text-decoration: none;
                    border-radius: 25px;
                    font-weight: 600;
                    margin: 20px 0;
                    transition: background 0.3s;
                }
                .button:hover {
                    background: #333;
                }
                .footer {
                    background: #f8f9fa;
                    padding: 25px;
                    text-align: center;
                    border-top: 1px solid #e0e0e0;
                    font-size: 14px;
                    color: #666;
                }
                hr {
                    border: none;
                    border-top: 1px solid #e0e0e0;
                    margin: 20px 0;
                }
                @media only screen and (max-width: 600px) {
                    .container { margin: 10px; }
                    .content { padding: 20px; }
                    .items-table th, .items-table td { padding: 8px; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✨ Order Confirmed!</h1>
                    <p>Thank you for choosing Pure Clay</p>
                </div>
                
                <div class="content">
                    <div class="greeting">
                        <p>Dear <strong>${customerName}</strong>,</p>
                        <p>Your order has been successfully placed and confirmed. We're preparing your items for delivery.</p>
                    </div>
                    
                    <div class="status-badge">
                        📦 Status: ${order.status}
                    </div>
                    
                    <div class="order-details">
                        <h3 style="margin-top: 0; color: #333;">Order Information</h3>
                        <p><strong>Order Number:</strong> #${orderId}</p>
                        <p><strong>Order Date:</strong> ${formatDate(order.date)}</p>
                        <p><strong>Payment Method:</strong> ${order.paymentMethod || 'Cash on Delivery'}</p>
                        <p><strong>Payment Status:</strong> <span style="color: ${order.payment ? '#28a745' : '#ffc107'};">${order.payment ? 'Paid' : 'Pending'}</span></p>
                    </div>
                    
                    <h3 style="color: #333; margin-bottom: 15px;">Order Items</h3>
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th style="text-align: center;">Qty</th>
                                <th style="text-align: right;">Price</th>
                                <th style="text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHTML}
                        </tbody>
                    </table>
                    
                    ${generateOrderSummaryHTML(order)}
                    ${generateDeliveryAddressHTML(order.address)}
                    
                    <div class="tracking-info">
                        <strong>🔔 Need to make changes?</strong>
                        <p style="margin: 8px 0 0;">You can track your order or request cancellations from your account dashboard. For guest orders, use your order ID and email to track.</p>
                    </div>
                    
                    <div style="text-align: center;">
                        <a href="${process.env.FRONTEND_URL}/orders" class="button">
                            Track Your Order
                        </a>
                    </div>
                    
                    <hr>
                    
                    <div style="text-align: center; color: #666;">
                        <p><strong>📍 Delivery Address</strong><br>
                        ${order.address.street}<br>
                        ${order.address.city}, ${order.address.state} ${order.address.zipcode}</p>
                        
                        <p><strong>📞 Contact</strong><br>
                        Phone: ${order.customerDetails?.phone || 'Not provided'}</p>
                    </div>
                </div>
                
                <div class="footer">
                    <p><strong>Pure Clay</strong> - Pakistan's Leading Organic Foods Brand</p>
                    <p>📍 Talagang, Punjab, Pakistan</p>
                    <p>📧 ${process.env.EMAIL_USER} | 📞 +92-324 1572294</p>
                    
                    <p style="font-size: 12px; margin-top: 15px;">
                        This email was sent to confirm your order with Pure Clay.<br>
                        If you didn't place this order, please contact us immediately.
                    </p>
                    <p style="font-size: 12px; color: #999;">
                        &copy; ${new Date().getFullYear()} Pure Clay. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Order confirmation email sent successfully to ${customerEmail}`);
    return true;

  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error);
    return false;
  }
};

// ============================================
// BLOG NOTIFICATION EMAIL
// ============================================

// Send new blog notification
export const sendNewBlogNotification = async (subscribers, blog) => {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      console.log('❌ Cannot send blog notification - check .env configuration');
      return 0;
    }

    if (!subscribers || subscribers.length === 0) {
      console.log('⚠️ No subscribers to send blog notification to');
      return 0;
    }

    const subject = `📚 New Blog: ${blog.title}`;
    
    let blogImage = '';
    if (blog.imageUrl) {
      blogImage = `
        <div style="text-align: center; margin: 20px 0;">
          <img src="${blog.imageUrl}" alt="${blog.title}" style="max-width: 100%; max-height: 300px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        </div>
      `;
    }

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #000; color: #fff; padding: 25px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 25px; border-radius: 0 0 8px 8px; }
              .blog-info { background: #fff; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #0f766e; }
              .excerpt { font-style: italic; color: #666; font-size: 16px; line-height: 1.6; }
              .btn { display: inline-block; background: #0f766e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 15px 0; }
              .footer { margin-top: 25px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1 style="margin: 0;">New Blog Post! 📖</h1>
                  <p style="margin: 5px 0 0 0; opacity: 0.9;">Pure Clay</p>
              </div>
              <div class="content">
                  <p style="font-size: 16px;">Expand your knowledge with our latest blog post about organic living and natural wellness.</p>
                  
                  ${blogImage}
                  
                  <div class="blog-info">
                      <h2 style="color: #0f766e; margin-top: 0;">${blog.title}</h2>
                      
                      ${blog.excerpt ? `<p class="excerpt">${blog.excerpt}</p>` : ''}
                      
                      ${blog.category && blog.category.length > 0 ? `
                          <p style="margin: 10px 0;">
                              <strong>Category:</strong> ${blog.category.join(', ')}
                          </p>
                      ` : ''}
                  </div>
                  
                  <p style="font-size: 16px;">Learn expert tips and discover new ways to enhance your natural lifestyle!</p>
                  
                  <div style="text-align: center;">
                      <a href="${process.env.FRONTEND_URL}/blog/${blog._id || blog.id}" class="btn">
                          Read Article
                      </a>
                  </div>
                  
                  ${blog.readTime ? `<p style="color: #718096; margin-top: 10px; text-align: center;">⏱️ ${blog.readTime} min read</p>` : ''}
              </div>
              <div class="footer">
                  <p><a href="${process.env.FRONTEND_URL}/unsubscribe" style="color: #666; text-decoration: none;">Unsubscribe from notifications</a></p>
                  <p>&copy; ${new Date().getFullYear()} Pure Clay. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
    `;

    console.log(`📨 Sending blog notification to ${subscribers.length} subscribers`);

    const emailPromises = subscribers.map(async (subscriber) => {
      try {
        const mailOptions = {
          from: `"Pure Clay" <${process.env.EMAIL_USER}>`,
          to: subscriber.email,
          subject: subject,
          html: content,
          headers: {
            'List-Unsubscribe': `<${process.env.FRONTEND_URL}/unsubscribe?email=${subscriber.email}>`
          }
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Blog notification sent to: ${subscriber.email}`);
        return { success: true, email: subscriber.email };
      } catch (error) {
        console.error(`❌ Failed to send to ${subscriber.email}:`, error.message);
        return { success: false, email: subscriber.email, error: error.message };
      }
    });

    const results = await Promise.allSettled(emailPromises);
    
    const successful = results.filter(result => 
      result.status === 'fulfilled' && result.value.success
    );
    const failed = results.filter(result => 
      result.status === 'rejected' || !result.value.success
    );

    console.log(`📊 Blog notification results: ${successful.length} successful, ${failed.length} failed`);
    console.log(`✅ New blog notification sent for: ${blog.title}`);

    return successful.length;

  } catch (error) {
    console.error('❌ Error in sendNewBlogNotification:', error);
    return 0;
  }
};

// ============================================
// CONTACT FORM EMAILS (Keep these)
// ============================================

// Send contact email to business
export const sendContactEmailToBusiness = async (contactData) => {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      console.log('❌ Cannot send email - check .env configuration');
      return false;
    }

    const businessEmail = process.env.EMAIL_USER;

    console.log('📧 Sending contact form to:', businessEmail);

    const mailOptions = {
      from: `"Pure Clay Website" <${businessEmail}>`,
      to: businessEmail,
      replyTo: contactData.email,
      subject: `New Contact Form: ${contactData.subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #000; color: #fff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 25px; border-radius: 0 0 8px 8px; }
                .field { margin-bottom: 15px; padding: 10px; background: #fff; border-radius: 5px; border-left: 4px solid #000; }
                .label { font-weight: bold; color: #000; display: block; margin-bottom: 5px; }
                .value { color: #666; }
                .message-box { background: #fff; padding: 15px; border-radius: 5px; border: 1px solid #ddd; margin-top: 10px; }
                .footer { margin-top: 25px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">📧 New Contact Form Submission</h1>
                    <p style="margin: 5px 0 0 0; opacity: 0.9;">Pure Clay</p>
                </div>
                <div class="content">
                    <div class="field">
                        <span class="label">👤 Name:</span>
                        <span class="value">${contactData.name}</span>
                    </div>
                    <div class="field">
                        <span class="label">📧 Email:</span>
                        <span class="value">
                            <a href="mailto:${contactData.email}" style="color: #007bff; text-decoration: none;">
                                ${contactData.email}
                            </a>
                        </span>
                    </div>
                    <div class="field">
                        <span class="label">📞 Phone:</span>
                        <span class="value">${contactData.phone || 'Not provided'}</span>
                    </div>
                    <div class="field">
                        <span class="label">📋 Subject:</span>
                        <span class="value" style="color: #000; font-weight: 500;">${contactData.subject}</span>
                    </div>
                    <div class="field">
                        <span class="label">💬 Message:</span>
                        <div class="message-box">
                            ${contactData.message.replace(/\n/g, '<br>')}
                        </div>
                    </div>
                </div>
                <div class="footer">
                    <p>This email was automatically sent from your website contact form.</p>
                    <p><strong>Pure Clay</strong> | Talagang, Pakistan</p>
                    <p>Received: ${new Date().toLocaleString()}</p>
                </div>
            </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Contact email sent successfully');
    return true;

  } catch (error) {
    console.error('❌ Error sending contact email:', error);
    return false;
  }
};

// Send auto-reply to customer
export const sendAutoReplyToCustomer = async (contactData) => {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      console.log('❌ Cannot send auto-reply - check .env configuration');
      return false;
    }

    console.log('📧 Sending auto-reply to:', contactData.email);

    const mailOptions = {
      from: `"Pure Clay" <${process.env.EMAIL_USER}>`,
      to: contactData.email,
      subject: `Thank you for contacting Pure Clay`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #000; color: #fff; padding: 25px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 25px; border-radius: 0 0 8px 8px; }
                .info-box { background: #fff; padding: 15px; border-radius: 5px; border-left: 4px solid #000; margin: 15px 0; }
                .footer { margin-top: 25px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">Thank You for Contacting Us!</h1>
                    <p style="margin: 5px 0 0 0; opacity: 0.9;">Pure Clay</p>
                </div>
                <div class="content">
                    <p>Dear <strong>${contactData.name}</strong>,</p>
                    
                    <p>Thank you for reaching out to us. We have received your message and our team will get back to you within 24 hours.</p>
                    
                    <div class="info-box">
                        <h3 style="margin-top: 0;">📋 Your Inquiry Details:</h3>
                        <p><strong>Subject:</strong> ${contactData.subject}</p>
                        <p><strong>Message:</strong> ${contactData.message.substring(0, 100)}${contactData.message.length > 100 ? '...' : ''}</p>
                        <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
                    </div>

                    <p>We appreciate your interest in Pure Clay and look forward to assisting you!</p>
                    
                    <p>Best regards,<br>
                    <strong>The Pure Clay Team</strong></p>
                </div>
                <div class="footer">
                    <p>This is an automated response. Please do not reply to this email.</p>
                    <p>&copy; ${new Date().getFullYear()} Pure Clay. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Auto-reply sent successfully');
    return true;

  } catch (error) {
    console.error('❌ Error sending auto-reply:', error);
    return false;
  }
};