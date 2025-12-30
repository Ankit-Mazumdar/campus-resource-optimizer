const nodemailer = require('nodemailer');

// Create transporter (Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Send booking confirmation email
 * NOTE: booking.resource and user MUST be populated
 */
const sendBookingConfirmation = async (booking, user) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: '✅ Booking Confirmed - Campus Resource Optimizer',
      html: `
        <h2>Booking Confirmed!</h2>
        <p>Dear ${user.name},</p>
        <p>Your booking has been confirmed with the following details:</p>
        
        <div style="background:#f5f5f5;padding:15px;border-radius:5px;">
          <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
          <p><strong>Resource:</strong> ${booking.resource.name}</p>
          <p><strong>Date:</strong> ${new Date(booking.bookingDate).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</p>
          <p><strong>Location:</strong> ${booking.resource.location}</p>
        </div>
        
        <p><strong>Important:</strong> Please check in on time to avoid penalties.</p>
        <p>You will receive a reminder 1 hour before your booking.</p>
        
        <p>Thank you,<br>Campus Resource Optimizer Team</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Booking confirmation email sent');
    return true;

  } catch (error) {
    console.error('❌ Booking confirmation email error:', error);
    return false;
  }
};

/**
 * Send booking reminder email
 */
const sendBookingReminder = async (booking, user) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: '⏰ Reminder: Your Booking Starts in 1 Hour',
      html: `
        <h2>Booking Reminder</h2>
        <p>Dear ${user.name},</p>
        <p>This is a reminder that your booking starts in 1 hour:</p>
        
        <div style="background:#fff3cd;padding:15px;border-radius:5px;">
          <p><strong>Resource:</strong> ${booking.resource.name}</p>
          <p><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</p>
          <p><strong>Location:</strong> ${booking.resource.location}</p>
        </div>
        
        <p>Please arrive on time!</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('⏰ Booking reminder email sent');
    return true;

  } catch (error) {
    console.error('❌ Reminder email error:', error);
    return false;
  }
};

/**
 * Send booking cancellation email
 */
const sendCancellationEmail = async (booking, user) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: '❌ Booking Cancelled - Campus Resource Optimizer',
      html: `
        <h2>Booking Cancelled</h2>
        <p>Dear ${user.name},</p>
        <p>Your booking has been cancelled:</p>
        
        <div style="background:#f8d7da;padding:15px;border-radius:5px;">
          <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
          <p><strong>Resource:</strong> ${booking.resource.name}</p>
          <p><strong>Date:</strong> ${new Date(booking.bookingDate).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</p>
        </div>
        
        <p>You can make a new booking anytime from your dashboard.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('❌ Booking cancellation email sent');
    return true;

  } catch (error) {
    console.error('❌ Cancellation email error:', error);
    return false;
  }
};

module.exports = {
  sendBookingConfirmation,
  sendBookingReminder,
  sendCancellationEmail
};
