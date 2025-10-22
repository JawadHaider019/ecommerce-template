import nodemailer from 'nodemailer';

// Simple transporter using only naturabliss99943@gmail.com
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  
  if (!emailUser || !emailPassword) {
    console.log('❌ Email configuration missing in .env');
    console.log('   Add these lines to your .env file:');
    console.log('   EMAIL_USER=naturabliss99943@gmail.com');
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
  });
};

// Send contact email to naturabliss99943@gmail.com
export const sendContactEmailToBusiness = async (contactData) => {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      console.log('❌ Cannot send email - check .env configuration');
      return false;
    }

    const businessEmail = process.env.EMAIL_USER; // naturabliss99943@gmail.com

    console.log('📧 Sending contact form to:', businessEmail);

    const mailOptions = {
      from: `"Natura Bliss Website" <${businessEmail}>`,
      to: businessEmail, // Send to the same email
      replyTo: contactData.email, // Customer can reply directly
      subject: `New Contact: ${contactData.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #000;">📨 New Contact Form Submission</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 5px;">
            <p><strong>Name:</strong> ${contactData.name}</p>
            <p><strong>Email:</strong> ${contactData.email}</p>
            <p><strong>Phone:</strong> ${contactData.phone || 'Not provided'}</p>
            <p><strong>Subject:</strong> ${contactData.subject}</p>
            <p><strong>Message:</strong></p>
            <div style="background: white; padding: 15px; border-radius: 5px;">
              ${contactData.message.replace(/\n/g, '<br>')}
            </div>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            Sent from Natura Bliss website on ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Contact email sent successfully to:', businessEmail);
    return true;

  } catch (error) {
    console.error('❌ Error sending contact email:', error);
    return false;
  }
};

// Send auto-reply to customer from naturabliss99943@gmail.com
export const sendAutoReplyToCustomer = async (contactData) => {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      console.log('❌ Cannot send auto-reply - check .env configuration');
      return false;
    }

    const businessEmail = process.env.EMAIL_USER; // naturabliss99943@gmail.com

    console.log('📧 Sending auto-reply to customer:', contactData.email);

    const mailOptions = {
      from: `"Natura Bliss" <${businessEmail}>`,
      to: contactData.email,
      subject: `Thank you for contacting Natura Bliss`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #000;">Thank You for Contacting Natura Bliss! ✨</h2>
          <p>Dear ${contactData.name},</p>
          <p>Thank you for reaching out to us. We have received your message and will get back to you within 24 hours.</p>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Your Message:</strong></p>
            <div style="background: white; padding: 10px; border-radius: 3px;">
              ${contactData.message.replace(/\n/g, '<br>')}
            </div>
          </div>

          <p style="margin-top: 20px;">
            Best regards,<br>
            <strong>The Natura Bliss Team</strong>
          </p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Auto-reply sent successfully');
    return true;

  } catch (error) {
    console.error('❌ Error sending auto-reply:', error);
    return false;
  }
};