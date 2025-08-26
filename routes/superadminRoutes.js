const { verifyToken } = require("../middleware/authenticate");
const s3Upload = require('../middleware/s3Upload');
const superadminController = require("../controllers/superadminController");
const express = require("express");

const router = express.Router();

router.get('/getAllUsers',verifyToken, superadminController.getAllUsers);
router.get('/getAllDispute',verifyToken, superadminController.getAllDispute);
router.get('/getDisputeById/:gigId',verifyToken, superadminController.getDisputeById);


router.post('/addDispute', verifyToken, s3Upload.array('files', 3), superadminController.addDispute);


module.exports = router;
