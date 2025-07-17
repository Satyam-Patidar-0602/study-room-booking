const express = require('express');
const router = express.Router();
// const Razorpay = require('razorpay');
require('dotenv').config(); // Load environment variables from .env

// Cashfree integration
const axios = require('axios');

router.post('/create-order', async (req, res) => {
  const { customerName, customerEmail, customerPhone, duration, subscriptionPeriod } = req.body;
  console.log('Received booking:', { customerName, customerEmail, customerPhone, duration, subscriptionPeriod });
  const orderId = 'order_' + Date.now();

  // Calculate order amount based on booking type and period
  let orderAmount = 0;
  const dur = String(duration).trim();
  const sub = String(subscriptionPeriod).trim();
  if (dur === 'full') {
    orderAmount = sub === '0.5' ? 300 : 600;
  } else if (dur === '4') {
    orderAmount = 400;
  }

  if (orderAmount <= 0) {
    return res.status(400).json({ success: false, error: 'Invalid booking details for amount calculation.' });
  }

  try {
    // Create Cashfree order
    const cashfreeRes = await axios.post(
      'https://sandbox.cashfree.com/pg/orders',
      {
        order_id: orderId,
        order_amount: orderAmount,
        order_currency: 'INR',
        customer_details: {
          customer_id: customerEmail,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          customer_name: customerName
        }
      },
      {
        headers: {
          'x-client-id': process.env.CASHFREE_APP_ID,
          'x-client-secret': process.env.CASHFREE_SECRET_KEY,
          'x-api-version': '2022-09-01',
          'Content-Type': 'application/json'
        }
      }
    );
    const order = cashfreeRes.data;
    res.json({ success: true, order });
  } catch (err) {
    console.error('Cashfree order error:', err.response?.data || err);
    res.status(500).json({
      success: false,
      error: err.message || err,
    });
  }
});

module.exports = router;