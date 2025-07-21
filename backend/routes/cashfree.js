const express = require('express');
const router = express.Router();
require('dotenv').config();

// Use the official Cashfree PG Node SDK
const { Cashfree } = require('cashfree-pg');

// Determine environment
const CF_ENV = process.env.CASHFREE_ENV === 'PROD' ? Cashfree.PRODUCTION : Cashfree.SANDBOX;
const CF_APP_ID = process.env.CASHFREE_APP_ID;
const CF_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;

const cashfree = new Cashfree(CF_ENV, CF_APP_ID, CF_SECRET_KEY);

router.post('/create-order', async (req, res) => {
  const { customerName, customerEmail, customerPhone, duration, subscriptionPeriod } = req.body;
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
    const request = {
      order_id: orderId,
      order_amount: orderAmount,
      order_currency: 'INR',
      customer_details: {
        customer_id: customerPhone, // must be alphanumeric, phone is safe
        customer_email: customerEmail,
        customer_phone: customerPhone,
        customer_name: customerName
      },
      order_meta: {
        return_url: 'https://yourdomain.com/booking-success?order_id={order_id}'
      }
    };
    const cfRes = await cashfree.PGCreateOrder(request);
    const payment_session_id = cfRes.data.payment_session_id;
    res.json({ success: true, order: { ...cfRes.data, payment_session_id } });
  } catch (err) {
    if (err.response) {
    res.status(500).json({
      success: false,
      error: err.message || err,
        cashfreeError: err.response.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: err.message || err
    });
    }
  }
});

module.exports = router;