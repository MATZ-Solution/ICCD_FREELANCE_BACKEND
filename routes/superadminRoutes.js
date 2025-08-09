
const superadminController = require("../controllers/superadminController");

const express = require("express");

const router = express.Router();

router.get('/getAllUsers', superadminController.getAllUsers);


module.exports = router;
