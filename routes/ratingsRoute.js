const express = require("express");
const router = express.Router();
const ratingController = require("../controllers/ratingController");
const { verifyToken } = require("../middleware/authenticate");

router.post("/addFreelancerRating", ratingController.addFreelancerRating);
// router.get("/session", stripeController.getSession);
// router.post("/process-order", stripeController.processOrder);
router.get("/getFreelancerGigRatings/:gig_id", ratingController.getFreelancerGigRatings);


router.get("/getFreelancerAverageRating/:freelancer_id", ratingController.getFreelancerAverageRating);

module.exports = router;
