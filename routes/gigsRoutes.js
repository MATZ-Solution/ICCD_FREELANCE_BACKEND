const express = require("express");
const router = express.Router();
const gigsController = require("../controllers/gigsController");
const { verifyToken } = require("../middleware/authenticate");
const s3Upload = require('../middleware/s3Upload');

//  s3Upload.array('files', 5)
// router.post("/addJob" ,verifyToken, s3Upload.array('files', 5), jobController.addJob);
router.post('/postGigs', gigsController.postGigs)

module.exports = router;