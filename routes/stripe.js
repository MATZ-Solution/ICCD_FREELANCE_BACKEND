const express = require("express");
const router = express.Router();
const stripeController = require("../controllers/stripeController");
const { verifyToken } = require("../middleware/authenticate");

router.post("/create-checkout-session", stripeController.createCheckoutSession);
router.get("/session", stripeController.getSession);
router.post("/process-order", stripeController.processOrder);

module.exports = router;
