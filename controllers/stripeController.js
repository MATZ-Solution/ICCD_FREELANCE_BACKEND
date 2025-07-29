const Stripe = require("stripe");
const stripe = Stripe(
  "sk_test_51QCl1eCDh3RtIJ6XOAYZzILYoBxvqCpnTuRhVr7IDCcCExq6cldGbuPSVmp1Ftd6psoxMidNp12erQi0XxDhcNsx004rxKaVIN"
);
const { queryRunner } = require("../helper/queryRunner");
const handleNotifications = require("../utils/sendnotification");

// === Create Checkout Session ===
exports.createCheckoutSession = async (req, res) => {
  try {
    const { orderDetails, customer_email } = req.body;

    if (!Array.isArray(orderDetails) || orderDetails.length === 0) {
      return res.status(400).json({ error: "Invalid order details" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: orderDetails.map((item) => ({
        price_data: {
          currency: "pkr",
          product_data: { name: item.name },
          unit_amount: Math.round(parseFloat(item.price) * 100),
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url:
        "http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:5173/cancel",
      ...(customer_email
        ? { customer_email }
        : {
            customer_creation: "always",
            billing_address_collection: "required",
          }),
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe session creation error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// === Retrieve Checkout Session ===
exports.getSession = async (req, res) => {
  const { session_id } = req.query;
  if (!session_id) {
    return res.status(400).json({ error: "session_id parameter is required" });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["customer", "customer_details"],
    });

    session.customer_email =
      session.customer_email ||
      session.customer_details?.email ||
      session.customer?.email ||
      null;

    res.json(session);
  } catch (error) {
    console.error("Stripe session retrieval error:", error.message);
    res
      .status(500)
      .json({ error: `Failed to retrieve session: ${error.message}` });
  }
};

// === Insert or Update Order ===
exports.processOrder = async (req, res) => {
  if (!queryRunner) {
    return res.status(500).json({ error: "Database connection not available" });
  }

  const {
    id,
    customer_email,
    amount_total,
    payment_status,
    client_id,
    freelancer_id,
    gig_id,
    quantity,
    basePrice,
    totalPrice,
    packageType,
    revisions,
  } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Session ID is required" });
  }

  try {
    const query = `
      INSERT INTO stripeorders 
  (session_id, email, amount, status, created_at, client_id, freelancer_id, gig_id, quantity, base_price, total_price, package_type, revisions)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON DUPLICATE KEY UPDATE 
  email = VALUES(email),
  amount = VALUES(amount),
  status = VALUES(status),
  client_id = VALUES(client_id),
  freelancer_id = VALUES(freelancer_id),
  gig_id = VALUES(gig_id),
  quantity = VALUES(quantity),
  base_price = VALUES(base_price),
  total_price = VALUES(total_price),
  package_type = VALUES(package_type),
  revisions = VALUES(revisions)
    `;

    const data = [
      id,
      customer_email || null,
      amount_total || 0,
      payment_status || "unknown",
      new Date().toISOString().slice(0, 19).replace("T", " "),
      client_id || null,
      freelancer_id || null,
      gig_id || null,
      quantity || null,
      basePrice || null,
      totalPrice || null,
      packageType || null,
      revisions || null,
    ];
    console.log("body", req.body);

    const result = await queryRunner(query, data);
    const wasInserted = result[0].affectedRows === 1;
   
    if (wasInserted) {
      let io = req.app.get("io");
      await handleNotifications(io, {
        sender_id: client_id,
        receiver_id: freelancer_id, // send client if from front-end
        title: "New Order",
        message: "New Order Has Been Placed",
        type: "freelancer",
      });

      // insert Intro message into database
      let messageQuery = ` INSERT INTO messages(senderId, receiverId, messages) VALUES(?, ?, ?)  `
      const result = await queryRunner(messageQuery, [client_id, freelancer_id, 'You are now communication each other']);
    }

    res.status(wasInserted ? 201 : 200).json({
      message: wasInserted
        ? "Order saved successfully"
        : "Order updated successfully",
      sessionId: id,
      isNew: wasInserted,
    });
  } catch (error) {
    console.error("Error in /process-order:", error.message);
    res.status(500).json({
      error: "Failed to process order",
      details: error.message,
    });
  }
};
