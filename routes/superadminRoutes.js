const { verifyToken } = require("../middleware/authenticate");
const s3Upload = require('../middleware/s3Upload');
const superadminController = require("../controllers/superadminController");
const express = require("express");

const router = express.Router();

router.get('/getAllUsers',verifyToken, superadminController.getAllUsers);

module.exports = router;
