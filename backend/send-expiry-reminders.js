const nodemailer = require('nodemailer');
const { getAll } = require('./database');
require('dotenv').config();
const cron = require('node-cron');

// Helper to calculate expiry date based on start_date and subscription_period
function getExpiryDate(startDate, subscriptionPeriod) {
  const start = new Date(startDate);
  const days = subscriptionPeriod === '0.5' ? 15 : 30;
  const expiry = new Date(start);
  expiry.setDate(start.getDate() + days);
  return expiry;
}

// Helper to format date as dd MMM yyyy
function formatDate(date) {
  return date.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

async function main() {
  // Find bookings expiring in 1 or 2 days
  const today = new Date();
  today.setHours(0,0,0,0);
  const oneDay = 24 * 60 * 60 * 1000;

  // Get all active bookings with user info
  const bookings = await getAll(`
    SELECT b.id, b.start_date, b.subscription_period, u.name, u.email
    FROM bookings b
    JOIN users u ON b.user_id = u.id
    WHERE b.status = 'active'
  `);

  const reminders = [];
  for (const booking of bookings) {
    const expiry = getExpiryDate(booking.start_date, booking.subscription_period);
    const daysLeft = Math.round((expiry - today) / oneDay);
    if (daysLeft === 1 || daysLeft === 2) {
      reminders.push({
        name: booking.name,
        email: booking.email,
        expiryDate: formatDate(expiry),
        daysLeft
      });
    }
  }

  if (reminders.length === 0) {
    return;
  }

  // Set up Nodemailer
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  for (const r of reminders) {
    const mailOptions = {
      from: `Study Point Library <${process.env.SMTP_USER}>`,
      to: r.email,
      subject: `Your Study Point Library booking expires on ${r.expiryDate}`,
      text:
        `Dear ${r.name},\n\n` +
        `We hope you are having a productive time at Study Point Library Jiran.\n\n` +
        `This is a gentle reminder that your current booking will expire on ${r.expiryDate}. ` +
        `To ensure uninterrupted access to your study space, please renew your booking before the expiry date.\n\n` +
        `If you have already renewed, kindly ignore this message.\n\n` +
        `For any assistance, feel free to contact us at thestudypointlibraryjeeran@gmail.com.\n\n` +
        `Thank you for choosing Study Point Library Jiran.\n\n` +
        `Best regards,\n` +
        `Study Point Library Jiran\n` +
        `Jiran, Neemuch District, Madhya Pradesh\n` +
        `Contact: thestudypointlibraryjeeran@gmail.com\n`
    };
    try {
      await transporter.sendMail(mailOptions);
    } catch (err) {
      console.error(`Failed to send to ${r.email}:`, err.message);
    }
  }
}

if (require.main === module) {
  // Schedule to run every day at 8:00 AM
  cron.schedule('0 8 * * *', () => {
    main();
  });
  // Also run immediately if script is started manually
  main();
}

main().catch(err => {
  console.error('Error running expiry reminder script:', err);
  process.exit(1);
}); 