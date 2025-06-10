const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const {verifyToken} = require('../middleware/authenticate')

router.post("/signUp", userController.signUp);
router.post("/signIn", userController.signIn);


router.get("/checkapi",verifyToken, userController.check); 

module.exports = router;
