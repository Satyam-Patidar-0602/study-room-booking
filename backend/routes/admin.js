const express = require('express');
const db = require('../database');
const router = express.Router();
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Get all students
router.get('/students', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, phone, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, students: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch students' });
  }
});

// Add new student
router.post('/students', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Name and email are required' });
    }
    let student;
    try {
      const result = await db.query(
        'INSERT INTO users (name, email, phone) VALUES ($1, $2, $3) RETURNING *',
        [name, email, phone]
      );
      student = result.rows[0];
    } catch (err) {
      if (err.code === '23505') { // unique_violation
        return res.status(400).json({ success: false, error: 'Email already exists' });
      }
      throw err;
    }
    res.json({ success: true, student });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to add student' });
  }
});

// Update student
router.put('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;
    await db.query(
      'UPDATE users SET name = $1, email = $2, phone = $3 WHERE id = $4',
      [name, email, phone, id]
    );
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    res.json({ success: true, student: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update student' });
  }
});

// Delete student
router.delete('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Check if student has any bookings
    const bookings = await db.query('SELECT id FROM bookings WHERE user_id = $1', [id]);
    if (bookings.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot delete student with existing bookings' 
      });
    }
    await db.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete student' });
  }
});

// Get all bookings with user and seat details
router.get('/bookings', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        b.id,
        b.user_id,
        b.seat_id,
        b.start_date,
        b.start_time,
        b.duration_type,
        b.subscription_period,
        b.total_amount,
        b.status,
        b.payment_status,
        b.created_at,
        b.updated_at,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone,
        s.seat_number
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      LEFT JOIN seats s ON b.seat_id = s.id
      ORDER BY b.created_at DESC
    `);
    res.json({ success: true, bookings: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
  }
});

// Add new booking
router.post('/bookings', async (req, res) => {
  try {
    const { studentId, seatId, startDate, endDate, duration, subscriptionPeriod, totalAmount, paymentStatus } = req.body;
    if (!studentId || !seatId || !startDate || !endDate || !totalAmount) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }
    const durationType = duration === 'full' ? 'fulltime' : '4hours';
    // Check if seat is available for the specific duration type
    const seatResult = await db.query(
      `SELECT s.id, s.seat_number,
        CASE 
          WHEN b.id IS NOT NULL AND b.status = 'active' AND b.duration_type = $1 THEN 'booked'
          ELSE 'available'
        END as status
      FROM seats s
      LEFT JOIN bookings b ON s.id = b.seat_id AND b.status = 'active' AND b.duration_type = $1
      WHERE s.id = $2`,
      [durationType, seatId]
    );
    const seat = seatResult.rows[0];
    if (!seat) {
      return res.status(400).json({ success: false, error: 'Seat not found' });
    }
    if (seat.status !== 'available') {
      return res.status(400).json({ success: false, error: 'Seat is not available for this duration type' });
    }
    // Check if student exists
    const studentResult = await db.query('SELECT id FROM users WHERE id = $1', [studentId]);
    if (studentResult.rows.length === 0) {
      return res.status(400).json({ success: false, error: 'Student not found' });
    }
    // Create booking
    const bookingResult = await db.query(
      `INSERT INTO bookings (user_id, seat_id, start_date, start_time, duration_type, subscription_period, total_amount, status, payment_status) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [studentId, seatId, startDate, '09:00', durationType, subscriptionPeriod, totalAmount, 'active', paymentStatus]
    );
    const bookingFullResult = await db.query(
      `SELECT 
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
      JOIN seats s ON b.seat_id = s.id
      WHERE b.id = $1`,
      [bookingResult.rows[0].id]
    );
    res.json({ success: true, booking: bookingFullResult.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to add booking' });
  }
});

// Assign seat to student with email notification
router.post('/assign-seat', async (req, res) => {
  try {
    const { 
      studentId, 
      seatId, 
      startDate, 
      startTime, 
      durationType, 
      subscriptionPeriod, 
      totalAmount 
    } = req.body;
    
    if (!studentId || !seatId || !startDate || !totalAmount) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    // Check if seat is available for the specific duration type
    const seatResult = await db.query(
      `SELECT s.id, s.seat_number,
        CASE 
          WHEN b.id IS NOT NULL AND b.status = 'active' AND b.duration_type = $1 THEN 'booked'
          ELSE 'available'
        END as status
      FROM seats s
      LEFT JOIN bookings b ON s.id = b.seat_id AND b.status = 'active' AND b.duration_type = $1
      WHERE s.id = $2`,
      [durationType, seatId]
    );
    const seat = seatResult.rows[0];
    
    if (!seat) {
      return res.status(400).json({ success: false, error: 'Seat not found' });
    }
    
    if (seat.status !== 'available') {
      return res.status(400).json({ success: false, error: 'Seat is not available for this duration type' });
    }

    // Check if student exists
    const studentResult = await db.query('SELECT * FROM users WHERE id = $1', [studentId]);
    const student = studentResult.rows[0];
    if (!student) {
      return res.status(400).json({ success: false, error: 'Student not found' });
    }

    // Create booking
    const bookingResult = await db.query(
      `INSERT INTO bookings (user_id, seat_id, start_date, start_time, duration_type, subscription_period, total_amount, status, payment_status) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [studentId, seatId, startDate, startTime, durationType, subscriptionPeriod, totalAmount, 'active', 'paid']
    );

    const booking = await db.query(
      `SELECT 
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
      JOIN seats s ON b.seat_id = s.id
      WHERE b.id = $1`,
      [bookingResult.rows[0].id]
    );

    // Send email notification
    try {
      const assignmentType = durationType === 'fulltime' ? 'Full Time' : 
                           startTime === '09:00' ? 'Morning' : 'Evening';
      
      const emailSubject = `Seat Assignment Confirmation - Seat ${seat.seat_number}`;
      const emailBody = `
        Dear ${student.name},

        Your seat has been successfully assigned!

        Seat Details:
        - Seat Number: ${seat.seat_number}
        - Assignment Type: ${assignmentType}
        - Start Date: ${new Date(startDate).toLocaleDateString()}
        - Start Time: ${startTime}
        - Duration: ${durationType === 'fulltime' ? 'Full Time (9:00 AM - 10:00 PM)' : '4 Hours'}
        - Subscription Period: ${subscriptionPeriod} month(s)
        - Total Amount: ₹${totalAmount}

        Please arrive on time and bring your study materials.

        Best regards,
        Study Room Management Team
      `;

      // Set up Nodemailer transporter
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER || 'thestudypointlibraryjeeran@gmail.com',
          pass: process.env.SMTP_PASS || 'your_app_password_here', // Set this in your .env
        },
      });

      // Compose email
      const mailOptions = {
        from: `Study Point Library <${process.env.SMTP_USER || 'thestudypointlibraryjeeran@gmail.com'}>`,
        to: student.email,
        subject: emailSubject,
        text: emailBody,
      };

      await transporter.sendMail(mailOptions);

    } catch (emailError) {
      console.error('Error sending email notification:', emailError);
      // Don't fail the request if email fails
    }
    
    res.json({ success: true, booking: booking.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to assign seat' });
  }
});

// Update booking
router.put('/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const allowedFields = {
      start_date: req.body.startDate,
      duration_type: req.body.duration ? (req.body.duration === 'full' ? 'fulltime' : '4hours') : undefined,
      subscription_period: req.body.subscriptionPeriod,
      total_amount: req.body.totalAmount,
      payment_status: req.body.paymentStatus,
      status: req.body.status,
      seat_id: req.body.seatId
    };
    // Filter out undefined fields
    const fieldsToUpdate = Object.entries(allowedFields).filter(([_, v]) => v !== undefined);
    if (fieldsToUpdate.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid fields provided for update' });
    }
    // Build dynamic SQL
    const setClause = fieldsToUpdate.map(([k], i) => `${k} = $${i + 1}`).join(', ');
    const values = fieldsToUpdate.map(([_, v]) => v);
    values.push(id);
    const sql = `UPDATE bookings SET ${setClause} WHERE id = $${fieldsToUpdate.length + 1}`;
    await db.query(sql, values);
    const result = await db.query(
      `SELECT 
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
      JOIN seats s ON b.seat_id = s.id
      WHERE b.id = $1`,
      [id]
    );
    res.json({ success: true, booking: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update booking' });
  }
});

// Delete booking
router.delete('/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get booking details to free up the seat
    const booking = await db.query('SELECT seat_id FROM bookings WHERE id = $1', [id]);
    if (booking.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    // Delete booking
    await db.query('DELETE FROM bookings WHERE id = $1', [id]);
    
    res.json({ success: true, message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete booking' });
  }
});

// Cleanup all bookings
router.post('/cleanup-bookings', async (req, res) => {
  try {
    await db.query('DELETE FROM bookings');
    res.json({ success: true, message: 'All bookings deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to clean bookings.' });
  }
});
// Cleanup all users
router.post('/cleanup-users', async (req, res) => {
  try {
    await db.query('DELETE FROM users');
    res.json({ success: true, message: 'All users deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to clean users.' });
  }
});
// Cleanup all expenses
router.post('/cleanup-expenses', async (req, res) => {
  try {
    await db.query('DELETE FROM expenses');
    res.json({ success: true, message: 'All expenses deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to clean expenses.' });
  }
});
// Cleanup all seats
router.post('/cleanup-seats', async (req, res) => {
  try {
    await db.query('DELETE FROM seats');
    res.json({ success: true, message: 'All seats deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to clean seats.' });
  }
});

// Get all seats with booking status
router.get('/seats', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        s.id, 
        s.seat_number, 
        s.column_number,
        s.is_active,
        s.created_at,
        CASE 
          WHEN b_4h.id IS NOT NULL AND b_4h.status = 'active' THEN 'booked_4h'
          WHEN b_ft.id IS NOT NULL AND b_ft.status = 'active' THEN 'booked_ft'
          ELSE 'available'
        END as status,
        b_4h.duration_type as booking_4h_type,
        b_ft.duration_type as booking_ft_type
      FROM seats s
      LEFT JOIN bookings b_4h ON s.id = b_4h.seat_id AND b_4h.status = 'active' AND b_4h.duration_type = '4hours'
      LEFT JOIN bookings b_ft ON s.id = b_ft.seat_id AND b_ft.status = 'active' AND b_ft.duration_type = 'fulltime'
      ORDER BY s.seat_number
    `);
    res.json({ success: true, seats: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch seats' });
  }
});

// Get all expenses
router.get('/expenses', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM expenses ORDER BY created_at DESC');
    res.json({ success: true, expenses: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch expenses' });
  }
});

module.exports = {
  router
};