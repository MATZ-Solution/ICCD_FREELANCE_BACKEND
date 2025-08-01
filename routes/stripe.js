const express = require("express");
const router = express.Router();
const stripeController = require("../controllers/stripeController");

router.post("/create-checkout-session", stripeController.createCheckoutSession);
router.get("/session", stripeController.getSession);
router.post("/process-order", stripeController.processOrder);
router.get("/getAllOrder", stripeController.getAllOrders);
router.get("/getAllOrderByFreelancer/:freelancerId", stripeController.getAllOrderByFreelancer);
router.get("/getSingleOrderByFreelancer/:orderId", stripeController.getSingleOrderByFreelancer);

module.exports = router;
