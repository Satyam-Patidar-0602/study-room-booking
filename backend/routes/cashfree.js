const express = require("express");
const router = express.Router();
require("dotenv").config();

const { Cashfree } = require("cashfree-pg");

// ✅ Configure Cashfree globally
Cashfree.XClientId = process.env.CASHFREE_APP_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
Cashfree.XEnvironment =
  process.env.CASHFREE_ENV === "PROD"
    ? Cashfree.Environment.PRODUCTION
    : Cashfree.Environment.SANDBOX;

router.post("/create-order", async (req, res) => {
  const {
    customerName,
    customerEmail,
    customerPhone,
    duration,
    subscriptionPeriod,
  } = req.body;

  const orderId = "order_" + Date.now();

  // ✅ calculate amount
  let orderAmount = 0;
  if (String(duration).trim() === "full") {
    orderAmount = subscriptionPeriod === "0.5" ? 300 : 600;
  } else if (String(duration).trim() === "4") {
    orderAmount = 300;
  }

  if (orderAmount <= 0) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid booking details" });
  }

  try {
    const request = {
      order_id: orderId,
      order_amount: orderAmount,
      order_currency: "INR",
      customer_details: {
        customer_id: customerPhone,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        customer_name: customerName,
      },
      order_meta: {
        return_url: `${
          process.env.FRONTEND_URL || "https://your-ngrok-url"
        }/booking-success?order_id={order_id}`,
      },
    };

    console.log("Cashfree create order request:", request);

    const response = await Cashfree.PGCreateOrder("2023-08-01", request);

    console.log("Cashfree create order response:", response.data);

    res.json({
      success: true,
      orderId: response.data.order_id,
      payment_session_id: response.data.payment_session_id,
    });
  } catch (err) {
    console.error("Cashfree error:", err.message);
    if (err.response) {
      console.error("Cashfree error response:", err.response.data);
      res.status(500).json({
        success: false,
        error: err.message,
        cashfreeError: err.response.data,
      });
    } else {
      res.status(500).json({ success: false, error: err.message });
    }
  }
});

module.exports = router;
