const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedbackController");
const { verifyToken } = require("../middleware/authenticate");
const s3Upload = require('../middleware/s3Upload');

//  s3Upload.array('files', 5)
router.get("/getAllFeedback" ,verifyToken, feedbackController.getAllFeedback);
// router.get("/checkIsFreelancer" ,verifyToken, freelancerController.checkIsFreelancer);
// router.get("/getFreelancerDashboardData" , verifyToken ,freelancerController.getFreelancerDashboardData);

router.post("/addFeedback", feedbackController.addFeedback);

// router.put("/editProfile/:freelancerId" ,verifyToken,s3Upload.array('files', 1), freelancerController.editProfile);

module.exports = router;