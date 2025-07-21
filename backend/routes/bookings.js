const express = require('express');
const router = express.Router();
const { runQuery, getRow, getAll, runTransaction } = require('../database');
const nodemailer = require('nodemailer');
require('dotenv').config();

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
    
    const bookings = await getAll(query);
    res.json({ success: true, data: bookings });
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
    
    const bookings = await getAll(query, [date]);
    res.json({ success: true, data: bookings });
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
    const bookedSeats = await getAll(query, [date]);
    res.json({ success: true, data: bookedSeats });
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
        date(b.start_date, '+' || (CASE WHEN b.subscription_period = '0.5' THEN 15 ELSE 30 END) || ' days') as expiry_date
      FROM bookings b
      JOIN seats s ON b.seat_id = s.id
      WHERE b.status = 'active'
        AND b.seat_id IS NOT NULL
        AND b.duration_type = 'fulltime'
        AND b.start_date IN (?, ?, ?)
    `;
    const bookedSeats = await getAll(query, dates);
    res.json({ success: true, data: bookedSeats });
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
      WHERE s.seat_number = ? AND b.start_date = ? AND b.status = 'active'
    `;
    
    const result = await getRow(query, [seatId, date]);
    const isAvailable = result.count === 0;
    
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
    let user = await getRow('SELECT * FROM users WHERE email = ?', [email]);
    let userId;

    if (!user) {
      const userResult = await runQuery(
        'INSERT INTO users (name, email, phone) VALUES (?, ?, ?)',
        [name, email, phone]
      );
      userId = userResult.id;
    } else {
      userId = user.id;
      // Update user info if needed
      await runQuery(
        'UPDATE users SET name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, phone, userId]
      );
    }

    // For 4-hour bookings, seat allocation is by owner (no specific seat)
    if (durationType === '4hours') {
      const bookingResult = await runQuery(
        `INSERT INTO bookings 
         (user_id, start_date, start_time, duration_type, subscription_period, total_amount, payment_status) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, startDate, startTime, durationType, subscriptionPeriod, totalAmount, 'paid']
      );
      // Log booking insert
      res.json({
        success: true,
        data: {
          bookingId: bookingResult.id,
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
        const seat = await getRow('SELECT id FROM seats WHERE seat_number = ?', [seatNumber]);
        if (!seat) {
          return res.status(400).json({
            success: false,
            error: `Seat ${seatNumber} does not exist`
          });
        }

        const isBooked = await getRow(
          `SELECT COUNT(*) as count FROM bookings 
           WHERE seat_id = ? AND start_date = ? AND status = 'active'`,
          [seat.id, startDate]
        );

        if (isBooked.count > 0) {
          return res.status(400).json({
            success: false,
            error: `Seat ${seatNumber} is already booked for this date`
          });
        }
      }

      // Create bookings for each selected seat
      const bookingQueries = selectedSeats.map(seatNumber => ({
        query: `
          INSERT INTO bookings 
          (user_id, seat_id, start_date, start_time, duration_type, subscription_period, total_amount, payment_status) 
          VALUES (?, (SELECT id FROM seats WHERE seat_number = ?), ?, ?, ?, ?, ?, ?)`,
        params: [userId, seatNumber, startDate, startTime, durationType, subscriptionPeriod, totalAmount, 'paid']
      }));

      const results = await runTransaction(bookingQueries);

      // Log each booking inserted
      selectedSeats.forEach((seatNumber, idx) => {
        res.json({
          success: true,
          data: {
            bookingIds: results.map(r => r.id),
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

    await runQuery(
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

    await runQuery(
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
    const seat = await getRow('SELECT id FROM seats WHERE seat_number = ?', [seatNumber]);
    if (!seat) {
      return res.status(400).json({ success: false, error: 'Seat does not exist' });
    }
    // Update booking
    await runQuery('UPDATE bookings SET seat_id = ? WHERE id = ?', [seat.id, id]);

    // Fetch booking and user info for email
    const booking = await getRow(`
      SELECT b.start_date, b.start_time, b.duration_type, b.subscription_period, u.name, u.email, u.phone, s.seat_number
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      LEFT JOIN seats s ON b.seat_id = s.id
      WHERE b.id = ?
    `, [id]);

    // Send email notification
    if (booking && booking.email) {
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
        to: booking.email,
        subject: `Your Study Point Library Seat Assignment for ${booking.start_date}`,
        text:
          `Dear ${booking.name},\n\n` +
          `Your seat has been assigned for your booking at Study Point Library Jiran.\n\n` +
          `Booking Details:\n` +
          `Date: ${booking.start_date}\n` +
          `Time: ${booking.start_time || 'N/A'}\n` +
          `Duration: ${booking.duration_type === '4hours' ? 'Morning/Evening (4 Hours)' : 'Full Time'}\n` +
          `Subscription: ${booking.subscription_period === '0.5' ? '15 Days' : '1 Month'}\n` +
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
    const stats = await getRow(`
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_bookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
        COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_bookings,
        SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as total_revenue
      FROM bookings
    `);

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching booking stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch booking statistics' });
  }
});

module.exports = router; 