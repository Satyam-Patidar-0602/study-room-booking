const express = require('express');
const db = require('../database');
const router = express.Router();
const nodemailer = require('nodemailer');
require('dotenv').config();

// Helper to calculate expiry date
function getExpiryDate(startDate, subscriptionPeriod) {
  const start = new Date(startDate);
  if (subscriptionPeriod === '0.5') {
    start.setDate(start.getDate() + 14); // 15 days total
  } else {
    start.setMonth(start.getMonth() + 1);
    start.setDate(start.getDate() - 1); // 1 month (inclusive)
  }
  return start;
}

function calculateExpiryDate(startDate, subscriptionPeriod) {
  const start = new Date(startDate);
  if (subscriptionPeriod === '0.5') {
    start.setDate(start.getDate() + 14); // 15 days total
  } else {
    start.setMonth(start.getMonth() + 1);
    start.setDate(start.getDate() - 1); // 1 month (inclusive)
  }
  // Format as YYYY-MM-DD for SQL
  return start.toISOString().split('T')[0];
}

// Function to update status to 'expired' for bookings where expiry_date is before today
async function expireOldBookings(db) {
  const today = new Date();
  today.setHours(0,0,0,0);
  const todayStr = today.toISOString().split('T')[0];
  await db.query(
    `UPDATE bookings SET status = 'expired' WHERE expiry_date < $1 AND status != 'expired'`,
    [todayStr]
  );
}

// Admin route to trigger expiry update manually
router.post('/admin/expire-bookings', async (req, res) => {
  try {
    await expireOldBookings(db);
    res.json({ success: true, message: 'Expired bookings updated.' });
  } catch (error) {
    console.error('Error expiring bookings:', error);
    res.status(500).json({ success: false, error: 'Failed to update expired bookings.' });
  }
});

// Get all bookings
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        b.id,
        b.start_date,
        b.start_time,
        b.duration_type,
        b.subscription_period,
        b.total_amount,
        b.payment_status,
        b.created_at,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone,
        s.seat_number
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      LEFT JOIN seats s ON b.seat_id = s.id
      ORDER BY b.created_at DESC
    `;
    
    const result = await db.query(query);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
  }
});

// Get bookings for a specific date
router.get('/date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const query = `
      SELECT 
        b.id,
        b.start_date,
        b.start_time,
        b.duration_type,
        b.subscription_period,
        b.total_amount,
        b.status,
        b.payment_status,
        b.created_at,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone,
        s.seat_number
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      LEFT JOIN seats s ON b.seat_id = s.id
      WHERE b.start_date = ? AND b.status = 'active'
      ORDER BY b.start_time
    `;
    
    const result = await db.query(query, [date]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching bookings for date:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch bookings for date' });
  }
});

// Get booked seats for a specific date (consider full subscription period)
router.get('/booked-seats/:date', async (req, res) => {
  try {
    let { date } = req.params;
    // Ensure date is in YYYY-MM-DD format
    if (date.includes('T')) {
      date = date.split('T')[0];
    }
    const query = `
      SELECT 
        s.seat_number,
        b.start_date,
        b.subscription_period,
        b.start_time,
        b.duration_type,
        date(b.start_date, '+' || (CASE WHEN b.subscription_period = '0.5' THEN 15 ELSE 30 END) || ' days') as expiry_date
      FROM bookings b
      JOIN seats s ON b.seat_id = s.id
      WHERE b.status = 'active'
        AND b.seat_id IS NOT NULL
        AND b.duration_type = 'fulltime'
        AND date(?) BETWEEN date(b.start_date) AND date(b.start_date, '+' || 
          (CASE WHEN b.subscription_period = '0.5' THEN 15 ELSE 30 END) || ' days')
    `;
    const result = await db.query(query, [date]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching booked seats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch booked seats' });
  }
});

// Get booked seats for the next three days (aaj, kal, parso) for fulltime bookings
router.get('/booked-seats-next-three', async (req, res) => {
  try {
    // Get next three dates as yyyy-MM-dd
    const today = new Date();
    const dates = [0, 1, 2].map(i => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return d.toISOString().split('T')[0];
    });

    const query = `
      SELECT 
        s.seat_number,
        b.start_date,
        b.subscription_period,
        b.start_time,
        b.duration_type,
        (b.start_date + INTERVAL '1 day' * (CASE WHEN b.subscription_period = '0.5' THEN 15 ELSE 30 END)) as expiry_date
      FROM bookings b
      JOIN seats s ON b.seat_id = s.id
      WHERE b.status = 'active'
        AND b.seat_id IS NOT NULL
        AND b.duration_type = 'fulltime'
        AND (
          ($1 BETWEEN b.start_date AND (b.start_date + INTERVAL '1 day' * (CASE WHEN b.subscription_period = '0.5' THEN 15 ELSE 30 END)))
          OR ($2 BETWEEN b.start_date AND (b.start_date + INTERVAL '1 day' * (CASE WHEN b.subscription_period = '0.5' THEN 15 ELSE 30 END)))
          OR ($3 BETWEEN b.start_date AND (b.start_date + INTERVAL '1 day' * (CASE WHEN b.subscription_period = '0.5' THEN 15 ELSE 30 END)))
        )
    `;
    const result = await db.query(query, dates);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching booked seats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch booked seats' });
  }
});

// Check if a seat is available for a specific date and time
router.get('/check-availability/:seatId/:date', async (req, res) => {
  try {
    const { seatId, date } = req.params;
    const query = `
      SELECT COUNT(*) as count
      FROM bookings b
      JOIN seats s ON b.seat_id = s.id
      WHERE s.seat_number = $1 AND b.start_date = $2 AND b.status = 'active'
    `;
    
    const result = await db.query(query, [seatId, date]);
    const isAvailable = result.rows[0].count === 0;
    
    res.json({ 
      success: true, 
      data: { 
        seatId: parseInt(seatId), 
        date, 
        isAvailable 
      } 
    });
  } catch (error) {
    console.error('Error checking seat availability:', error);
    res.status(500).json({ success: false, error: 'Failed to check seat availability' });
  }
});

// Create a new booking
router.post('/', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      startDate,
      startTime,
      durationType,
      subscriptionPeriod,
      selectedSeats,
      totalAmount
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !startDate || !durationType || !subscriptionPeriod) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    // Check if user exists, if not create one
    let user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    let userId;

    if (!user.rows[0]) {
      const userResult = await db.query(
        'INSERT INTO users (name, email, phone) VALUES ($1, $2, $3) RETURNING id',
        [name, email, phone]
      );
      userId = userResult.rows[0].id;
    } else {
      userId = user.rows[0].id;
      // Update user info if needed
      await db.query(
        'UPDATE users SET name = $1, phone = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
        [name, phone, userId]
      );
    }

    // For 4-hour bookings, seat allocation is by owner (no specific seat)
    if (durationType === '4hours') {
      if (selectedSeats && selectedSeats.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Seat selection is not allowed for 4-hour bookings. Seat will be assigned by admin.'
        });
      }
      const expiryDate = calculateExpiryDate(startDate, subscriptionPeriod);
      const bookingResult = await db.query(
        `INSERT INTO bookings 
         (user_id, start_date, start_time, duration_type, subscription_period, total_amount, payment_status, expiry_date) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [userId, startDate, startTime, durationType, subscriptionPeriod, totalAmount, 'paid', expiryDate]
      );
      // Log booking insert
      res.json({
        success: true,
        data: {
          bookingId: bookingResult.rows[0].id,
          message: 'Booking created successfully. Seat will be allocated by owner.'
        }
      });
    } else {
      // For full-time bookings, validate seat selection
      if (!selectedSeats || selectedSeats.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Seat selection is required for full-time bookings'
        });
      }

      // Check if selected seats are available
      for (const seatNumber of selectedSeats) {
        const seat = await db.query('SELECT id FROM seats WHERE seat_number = $1', [seatNumber]);
        if (!seat.rows[0]) {
          return res.status(400).json({
            success: false,
            error: `Seat ${seatNumber} does not exist`
          });
        }

        const isBooked = await db.query(
          `SELECT COUNT(*) as count FROM bookings 
           WHERE seat_id = $1 AND start_date = $2 AND status = 'active'`,
          [seat.rows[0].id, startDate]
        );

        if (isBooked.rows[0].count > 0) {
          return res.status(400).json({
            success: false,
            error: `Seat ${seatNumber} is already booked for this date`
          });
        }
      }

      // Create bookings for each selected seat
      const bookingQueries = selectedSeats.map(seatNumber => {
        const expiryDate = calculateExpiryDate(startDate, subscriptionPeriod);
        return {
          query: `
          INSERT INTO bookings 
          (user_id, seat_id, start_date, start_time, duration_type, subscription_period, total_amount, payment_status, expiry_date) 
          VALUES ($1, (SELECT id FROM seats WHERE seat_number = $2), $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
          params: [userId, seatNumber, startDate, startTime, durationType, subscriptionPeriod, totalAmount, 'paid', expiryDate]
        };
      });

      const results = [];
      for (const booking of bookingQueries) {
        const result = await db.query(booking.query, booking.params);
        results.push(result);
      }

      // Log each booking inserted
      selectedSeats.forEach((seatNumber, idx) => {
        res.json({
          success: true,
          data: {
            bookingIds: results.map(r => r.rows[0].id),
            message: 'Bookings created successfully'
          }
        });
      });
    }
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ success: false, error: 'Failed to create booking' });
  }
});

// Update booking status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    await db.query(
      'UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );

    res.json({
      success: true,
      data: { message: 'Booking status updated successfully' }
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ success: false, error: 'Failed to update booking status' });
  }
});

// Update payment status
router.patch('/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    if (!['pending', 'paid', 'failed'].includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment status'
      });
    }

    await db.query(
      'UPDATE bookings SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [paymentStatus, id]
    );

    res.json({
      success: true,
      data: { message: 'Payment status updated successfully' }
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ success: false, error: 'Failed to update payment status' });
  }
});

// Assign or update seat for a booking (admin)
router.patch('/:id/assign-seat', async (req, res) => {
  try {
    const { id } = req.params;
    const { seatNumber } = req.body;
    if (!seatNumber) {
      return res.status(400).json({ success: false, error: 'seatNumber is required' });
    }
    // Get seat id from seat number
    const seat = await db.query('SELECT id FROM seats WHERE seat_number = $1', [seatNumber]);
    if (!seat.rows[0]) {
      return res.status(400).json({ success: false, error: 'Seat does not exist' });
    }
    // Update booking
    await db.query('UPDATE bookings SET seat_id = $1 WHERE id = $2', [seat.rows[0].id, id]);

    // Fetch booking and user info for email
    const booking = await db.query(`
      SELECT b.start_date, b.start_time, b.duration_type, b.subscription_period, u.name, u.email, u.phone, s.seat_number
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      LEFT JOIN seats s ON b.seat_id = s.id
      WHERE b.id = $1
    `, [id]);

    // Send email notification
    if (booking.rows[0]) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      const mailOptions = {
        from: `Study Point Library <${process.env.SMTP_USER}>`,
        to: booking.rows[0].email,
        subject: `Your Study Point Library Seat Assignment for ${booking.rows[0].start_date}`,
        text:
          `Dear ${booking.rows[0].name},\n\n` +
          `Your seat has been assigned for your booking at Study Point Library Jiran.\n\n` +
          `Booking Details:\n` +
          `Date: ${booking.rows[0].start_date}\n` +
          `Time: ${booking.rows[0].start_time || 'N/A'}\n` +
          `Duration: ${booking.rows[0].duration_type === '4hours' ? 'Morning/Evening (4 Hours)' : 'Full Time'}\n` +
          `Subscription: ${booking.rows[0].subscription_period === '0.5' ? '15 Days' : '1 Month'}\n` +
          `Assigned Seat: ${seatNumber}\n\n` +
          `If you have any questions, contact us at thestudypointlibraryjeeran@gmail.com.\n\n` +
          `Thank you for choosing Study Point Library Jiran.\n\n` +
          `Best regards,\n` +
          `Study Point Library Jiran\n` +
          `Jiran, Neemuch District, Madhya Pradesh\n` +
          `Contact: thestudypointlibraryjeeran@gmail.com\n`
      };
      try {
        await transporter.sendMail(mailOptions);
      } catch (err) {
        console.error('Failed to send seat assignment email:', err.message);
      }
    }

    res.json({ success: true, data: { message: 'Seat assigned/updated successfully' } });
  } catch (error) {
    console.error('Error assigning seat:', error);
    res.status(500).json({ success: false, error: 'Failed to assign seat' });
  }
});

// Get booking statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_bookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
        COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_bookings,
        SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as total_revenue
      FROM bookings
    `);

    res.json({ success: true, data: stats.rows[0] });
  } catch (error) {
    console.error('Error fetching booking stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch booking statistics' });
  }
});

module.exports = router; 