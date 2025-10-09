const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken } = require("../middleware/authenticate");
const s3Upload = require('../middleware/s3Upload');
const googleController = require("../controllers/googleController");

//  s3Upload.array('files', 5)

router.get("/checkapi", verifyToken, userController.check);

router.post("/signUp", userController.signUp);
router.post("/signIn", userController.signIn);
router.post("/passwordReset", userController.passwordReset);
router.post("/sendOtp", userController.sendOtp);
router.post("/submitOtp", userController.submitOtp);
router.post("/addFreelancerDetails",verifyToken,s3Upload.array('files', 5), userController.addFreelancerDetails);
router.put("/changePasword", userController.changePasword);
router.get("/auth/google", googleController.googleLogin);
router.get("/auth/google/callback", googleController.googleCallback);

module.exports = router;
