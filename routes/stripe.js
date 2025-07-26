const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const stripe = Stripe('sk_test_51QCl1eCDh3RtIJ6XOAYZzILYoBxvqCpnTuRhVr7IDCcCExq6cldGbuPSVmp1Ftd6psoxMidNp12erQi0XxDhcNsx004rxKaVIN');

let queryRunner;
try {
  queryRunner = require("../helper/queryRunner").queryRunner;
} catch (error) {
  console.error("Failed to import queryRunner:", error.message);
}

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { orderDetails, customer_email } = req.body;

    if (!orderDetails || !Array.isArray(orderDetails)) {
      return res.status(400).json({ error: "Invalid order details" });
    }

    const sessionConfig = {
      payment_method_types: ["card"],
      line_items: orderDetails.map((item) => ({
        price_data: {
          currency: "pkr",
          product_data: {
            name: item.name,
          },
          unit_amount: parseInt(item.price),
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: "http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:5173/cancel",
    };

    if (customer_email) {
      sessionConfig.customer_email = customer_email;
    } else {
      sessionConfig.customer_creation = 'always';
      sessionConfig.billing_address_collection = 'required';
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);
    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe session creation error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get("/session", async (req, res) => {
  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).json({ error: "session_id parameter is required" });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['customer', 'customer_details']
    });

    let email = session.customer_email ||
                (session.customer_details && session.customer_details.email) ||
                (session.customer && session.customer.email) ||
                null;

    if (email && !session.customer_email) {
      session.customer_email = email;
    }

    res.json(session);
  } catch (error) {
    console.error("Stripe session retrieval error:", error.message);
    res.status(500).json({ error: `Failed to retrieve session: ${error.message}` });
  }
});

router.post("/process-order", async (req, res) => {
  try {
    if (!queryRunner) {
      return res.status(500).json({ error: "Database connection not available" });
    }

    const { id, customer_email, amount_total, payment_status } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    const query = `
      INSERT IGNORE INTO stripeorders (session_id, email, amount, status, created_at)
      VALUES (?, ?, ?, ?, ?)
    `;

    const data = [
      id,
      customer_email || null,
      amount_total || 0,
      payment_status || 'unknown',
      new Date()
    ];

    const result = await queryRunner(query, data);
    const wasInserted = result.affectedRows > 0;

    res.status(wasInserted ? 201 : 200).json({
      message: wasInserted ? "Order saved successfully" : "Order already exists",
      orderId: result.insertId,
      sessionId: id,
      isNew: wasInserted
    });

  } catch (error) {
    console.error("Error in /process-order:", error.message);
    res.status(500).json({
      error: "Failed to process order",
      details: error.message
    });
  }
});

router.post("/upsert-order", async (req, res) => {
  try {
    if (!queryRunner) {
      return res.status(500).json({ error: "Database connection not available" });
    }

    const { id, customer_email, amount_total, payment_status } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    const query = `
      INSERT INTO stripeorders (session_id, email, amount, status, created_at)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        created_at = created_at
    `;

    const data = [
      id,
      customer_email || null,
      amount_total || 0,
      payment_status || 'unknown',
      new Date()
    ];

    const result = await queryRunner(query, data);
    const isNew = result.affectedRows === 1;

    res.status(isNew ? 201 : 200).json({
      message: isNew ? "Order saved successfully" : "Order already exists",
      sessionId: id,
      isNew
    });

  } catch (error) {
    console.error("Error in /upsert-order:", error.message);
    res.status(500).json({
      error: "Failed to process order",
      details: error.message
    });
  }
});

module.exports = router;
