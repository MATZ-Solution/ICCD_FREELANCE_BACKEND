const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const stripe = Stripe('sk_test_51QCl1eCDh3RtIJ6XOAYZzILYoBxvqCpnTuRhVr7IDCcCExq6cldGbuPSVmp1Ftd6psoxMidNp12erQi0XxDhcNsx004rxKaVIN'); // Or keep the hardcoded one if needed

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { orderDetails } = req.body;

    //  Validate input
    if (!orderDetails || !Array.isArray(orderDetails)) {
      return res.status(400).json({ error: "Invalid order details" });
    }

    // Log the incoming data
    console.log("Received order:", orderDetails);

    //  Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: orderDetails.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: parseInt(item.price) * 100, // convert to cents
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: "http://localhost:5173/success",
      cancel_url: "http://localhost:5173/cancel",
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error.message); // log the real error
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;