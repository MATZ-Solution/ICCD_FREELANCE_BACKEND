const express = require("express");
const router = express.Router();
const freelancerController = require("../controllers/freelancerController");
const { verifyToken } = require("../middleware/authenticate");
const s3Upload = require('../middleware/s3Upload');

//  s3Upload.array('files', 5)
router.get("/getFreelancerProfile" ,verifyToken, freelancerController.getFreelancerProfile);
router.get("/checkIsFreelancer" ,verifyToken, freelancerController.checkIsFreelancer);

router.put("/editProfile" ,verifyToken, s3Upload.array('files', 5), freelancerController.editProfile);

module.exports = router;