const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientControllers");
const { verifyToken } = require("../middleware/authenticate");
const s3Upload = require('../middleware/s3Upload');

//  s3Upload.array('files', 5)
router.get("/getClientDashboardData" , verifyToken ,clientController.getClientDashboardData);
router.put("/clientEditProfile" ,verifyToken,s3Upload.array('files', 1), clientController.clientEditProfile);

module.exports = router;