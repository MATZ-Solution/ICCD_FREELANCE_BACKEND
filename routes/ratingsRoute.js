const express = require("express");
const router = express.Router();
const ratingController = require("../controllers/ratingController");
const { verifyToken } = require("../middleware/authenticate");

router.post("/addFreelancerRating", ratingController.addFreelancerRating);
// router.get("/session", stripeController.getSession);
// router.post("/process-order", stripeController.processOrder);

module.exports = router;
