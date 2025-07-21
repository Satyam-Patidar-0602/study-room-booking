const express = require('express');
const { runQuery, getRow, getAll, runTransaction } = require('../database');
const router = express.Router();
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Get all students
router.get('/students', async (req, res) => {
  try {
    const students = await getAll(`
      SELECT id, name, email, phone, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    res.json({ success: true, students });
  } catch (error) {
    console.error('Error fetching students:', error);
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

    const result = await runQuery(`
      INSERT INTO users (name, email, phone) 
      VALUES (?, ?, ?)
    `, [name, email, phone]);

    const student = await getRow('SELECT * FROM users WHERE id = ?', [result.lastID]);
    
    res.json({ success: true, student });
  } catch (error) {
    console.error('Error adding student:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ success: false, error: 'Email already exists' });
    } else {
      res.status(500).json({ success: false, error: 'Failed to add student' });
    }
  }
});

// Update student
router.put('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;
    
    await runQuery(`
      UPDATE users 
      SET name = ?, email = ?, phone = ? 
      WHERE id = ?
    `, [name, email, phone, id]);

    const student = await getRow('SELECT * FROM users WHERE id = ?', [id]);
    
    res.json({ success: true, student });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ success: false, error: 'Failed to update student' });
  }
});

// Delete student
router.delete('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if student has any bookings
    const bookings = await getAll('SELECT id FROM bookings WHERE user_id = ?', [id]);
    if (bookings.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot delete student with existing bookings' 
      });
    }

    await runQuery('DELETE FROM users WHERE id = ?', [id]);
    
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ success: false, error: 'Failed to delete student' });
  }
});

// Get all bookings with user and seat details
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await getAll(`
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
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone,
        s.seat_number
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN seats s ON b.seat_id = s.id
      ORDER BY b.created_at DESC
    `);
    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
  }
});

// Add new booking
router.post('/bookings', async (req, res) => {
  try {
    const { 
      studentId, 
      seatId, 
      startDate, 
      endDate, 
      duration, 
      subscriptionPeriod, 
      totalAmount, 
      paymentStatus 
    } = req.body;
    
    if (!studentId || !seatId || !startDate || !endDate || !totalAmount) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    // Check if seat is available for the specific duration type
    const durationType = duration === 'full' ? 'fulltime' : '4hours';
    const seat = await getRow(`
      SELECT s.id, s.seat_number,
        CASE 
          WHEN b.id IS NOT NULL AND b.status = 'active' AND b.duration_type = ? THEN 'booked'
          ELSE 'available'
        END as status
      FROM seats s
      LEFT JOIN bookings b ON s.id = b.seat_id AND b.status = 'active' AND b.duration_type = ?
      WHERE s.id = ?
    `, [durationType, durationType, seatId]);
    
    if (!seat) {
      return res.status(400).json({ success: false, error: 'Seat not found' });
    }
    
    if (seat.status !== 'available') {
      return res.status(400).json({ success: false, error: 'Seat is not available for this duration type' });
    }

    // Check if student exists
    const student = await getRow('SELECT id FROM users WHERE id = ?', [studentId]);
    if (!student) {
      return res.status(400).json({ success: false, error: 'Student not found' });
    }

    // Create booking
    let bookingResult;
    try {
      bookingResult = await runQuery(`
        INSERT INTO bookings (user_id, seat_id, start_date, start_time, duration_type, subscription_period, total_amount, status, payment_status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [studentId, seatId, startDate, '09:00', duration === 'full' ? 'fulltime' : '4hours', subscriptionPeriod, totalAmount, 'active', paymentStatus]);
    } catch (insertErr) {
      console.error('Error during booking insert:', insertErr);
      return res.status(500).json({ success: false, error: 'Failed to insert booking', details: insertErr.message });
    }

    // Defensive: always fetch booking after insert
    const bookingFull = await getRow(`
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
      JOIN seats s ON b.seat_id = s.id
      WHERE b.id = ?
    `, [bookingResult.id]);
    if (!bookingFull) {
      console.error('Booking not found after insert, id:', bookingResult.id);
      return res.status(500).json({ success: false, error: 'Booking not found after insert.' });
    }
    // No backend PDF/email needed; handled by frontend
    res.json({ success: true, booking: bookingFull });
  } catch (error) {
    console.error('Error adding booking:', error);
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
    const seat = await getRow(`
      SELECT s.id, s.seat_number,
        CASE 
          WHEN b.id IS NOT NULL AND b.status = 'active' AND b.duration_type = ? THEN 'booked'
          ELSE 'available'
        END as status
      FROM seats s
      LEFT JOIN bookings b ON s.id = b.seat_id AND b.status = 'active' AND b.duration_type = ?
      WHERE s.id = ?
    `, [durationType, durationType, seatId]);
    
    if (!seat) {
      return res.status(400).json({ success: false, error: 'Seat not found' });
    }
    
    if (seat.status !== 'available') {
      return res.status(400).json({ success: false, error: 'Seat is not available for this duration type' });
    }

    // Check if student exists
    const student = await getRow('SELECT * FROM users WHERE id = ?', [studentId]);
    if (!student) {
      return res.status(400).json({ success: false, error: 'Student not found' });
    }

    // Create booking
    const bookingResult = await runQuery(`
      INSERT INTO bookings (user_id, seat_id, start_date, start_time, duration_type, subscription_period, total_amount, status, payment_status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [studentId, seatId, startDate, startTime, durationType, subscriptionPeriod, totalAmount, 'active', 'paid']);

    const booking = await getRow(`
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
      JOIN seats s ON b.seat_id = s.id
      WHERE b.id = ?
    `, [bookingResult.lastID]);

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

      // Here you would integrate with your email service
      // For now, we'll just log the email details
      // await sendEmail(student.email, emailSubject, emailBody);

    } catch (emailError) {
      console.error('Error sending email notification:', emailError);
      // Don't fail the request if email fails
    }
    
    res.json({ success: true, booking });
  } catch (error) {
    console.error('Error assigning seat:', error);
    res.status(500).json({ success: false, error: 'Failed to assign seat' });
  }
});

// Update booking
router.put('/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      startDate, 
      duration, 
      subscriptionPeriod, 
      totalAmount, 
      paymentStatus,
      status
    } = req.body;
    
    await runQuery(`
      UPDATE bookings 
      SET start_date = ?, duration_type = ?, subscription_period = ?, total_amount = ?, payment_status = ?, status = ? 
      WHERE id = ?
    `, [startDate, duration === 'full' ? 'fulltime' : '4hours', subscriptionPeriod, totalAmount, paymentStatus, status || 'active', id]);

    const booking = await getRow(`
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
      JOIN seats s ON b.seat_id = s.id
      WHERE b.id = ?
    `, [id]);
    
    res.json({ success: true, booking });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ success: false, error: 'Failed to update booking' });
  }
});

// Delete booking
router.delete('/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get booking details to free up the seat
    const booking = await getRow('SELECT seat_id FROM bookings WHERE id = ?', [id]);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    // Delete booking
    await runQuery('DELETE FROM bookings WHERE id = ?', [id]);
    
    res.json({ success: true, message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ success: false, error: 'Failed to delete booking' });
  }
});

// Get all seats with booking status
router.get('/seats', async (req, res) => {
  try {
    const seats = await getAll(`
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
    res.json({ success: true, seats });
  } catch (error) {
    console.error('Error fetching seats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch seats' });
  }
});

// Add new seat
router.post('/seats', async (req, res) => {
  try {
    const { seatNumber, status } = req.body;
    
    if (!seatNumber) {
      return res.status(400).json({ success: false, error: 'Seat number is required' });
    }

    // Check if seat number already exists
    const existingSeat = await getRow('SELECT id FROM seats WHERE seat_number = ?', [seatNumber]);
    if (existingSeat) {
      return res.status(400).json({ success: false, error: 'Seat number already exists' });
    }

    const result = await runQuery(`
      INSERT INTO seats (seat_number, status) 
      VALUES (?, ?)
    `, [seatNumber, status || 'available']);

    const seat = await getRow('SELECT * FROM seats WHERE id = ?', [result.lastID]);
    
    res.json({ success: true, seat });
  } catch (error) {
    console.error('Error adding seat:', error);
    res.status(500).json({ success: false, error: 'Failed to add seat' });
  }
});

// Update seat
router.put('/seats/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    await runQuery('UPDATE seats SET status = ? WHERE id = ?', [status, id]);

    const seat = await getRow('SELECT * FROM seats WHERE id = ?', [id]);
    
    res.json({ success: true, seat });
  } catch (error) {
    console.error('Error updating seat:', error);
    res.status(500).json({ success: false, error: 'Failed to update seat' });
  }
});

// Delete seat
router.delete('/seats/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if seat has any bookings
    const bookings = await getAll('SELECT id FROM bookings WHERE seat_id = ?', [id]);
    if (bookings.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot delete seat with existing bookings' 
      });
    }

    await runQuery('DELETE FROM seats WHERE id = ?', [id]);
    
    res.json({ success: true, message: 'Seat deleted successfully' });
  } catch (error) {
    console.error('Error deleting seat:', error);
    res.status(500).json({ success: false, error: 'Failed to delete seat' });
  }
});

// Expenses endpoints
// Get all expenses
router.get('/expenses', async (req, res) => {
  try {
    const expenses = await getAll('SELECT * FROM expenses ORDER BY created_at DESC');
    res.json({ success: true, expenses });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch expenses' });
  }
});
// Add new expense
router.post('/expenses', async (req, res) => {
  try {
    const { amount, description, admin_name } = req.body;
    if (!amount || !description || !admin_name) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }
    const result = await runQuery(
      'INSERT INTO expenses (amount, description, admin_name) VALUES (?, ?, ?)',
      [amount, description, admin_name]
    );
    const expense = await getRow('SELECT * FROM expenses WHERE id = ?', [result.lastID]);
    res.json({ success: true, expense });
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ success: false, error: 'Failed to add expense' });
  }
});

// Clean all bookings
router.post('/cleanup-bookings', async (req, res) => {
  try {
    await runQuery('DELETE FROM bookings');
    await runQuery('DELETE FROM sqlite_sequence WHERE name = "bookings"');
    res.json({ success: true, message: 'All bookings deleted.' });
  } catch (error) {
    console.error('Error cleaning bookings:', error);
    res.status(500).json({ success: false, error: 'Failed to clean bookings' });
  }
});

// Clean all users
router.post('/cleanup-users', async (req, res) => {
  try {
    await runQuery('DELETE FROM users');
    await runQuery('DELETE FROM sqlite_sequence WHERE name = "users"');
    res.json({ success: true, message: 'All users deleted.' });
  } catch (error) {
    console.error('Error cleaning users:', error);
    res.status(500).json({ success: false, error: 'Failed to clean users' });
  }
});

// Clean all expenses
router.post('/cleanup-expenses', async (req, res) => {
  try {
    await runQuery('DELETE FROM expenses');
    await runQuery('DELETE FROM sqlite_sequence WHERE name = "expenses"');
    res.json({ success: true, message: 'All expenses deleted.' });
  } catch (error) {
    console.error('Error cleaning expenses:', error);
    res.status(500).json({ success: false, error: 'Failed to clean expenses' });
  }
});

// Database cleanup
router.post('/cleanup-db', async (req, res) => {
  try {
    await runTransaction(async () => {
      await runQuery('DELETE FROM bookings');
      await runQuery('DELETE FROM users');
      await runQuery('DELETE FROM sqlite_sequence WHERE name IN ("bookings", "users")');
    });
    
    res.json({ success: true, message: 'Database cleaned successfully' });
  } catch (error) {
    console.error('Error cleaning database:', error);
    res.status(500).json({ success: false, error: 'Failed to clean database' });
  }
});

router.post('/cleanup-seats', async (req, res) => {
  try {
    await runQuery('DELETE FROM bookings');
    await runQuery('DELETE FROM sqlite_sequence WHERE name = "bookings"');
    res.json({ success: true, message: 'All seat bookings deleted. Seats remain.' });
  } catch (error) {
    console.error('Error cleaning seat bookings:', error);
    res.status(500).json({ success: false, error: 'Failed to clean seat bookings' });
  }
});


module.exports = router; 