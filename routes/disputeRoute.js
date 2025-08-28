const { verifyToken } = require("../middleware/authenticate");
const s3Upload = require('../middleware/s3Upload');
const disputeController = require("../controllers/disputeController");
const express = require("express");

const router = express.Router();

router.get('/getAllDisputeByClient/:userId',verifyToken, disputeController.getAllDisputeByClient);
router.get('/getAllDisputeByFreelancer/:userId',verifyToken, disputeController.getAllDisputeByFreelancer);
router.get('/getDisputeById/:id',verifyToken, disputeController.getDisputeById);

router.get('/getAllDisputeByAdmin',verifyToken, disputeController.getAllDisputeByAdmin);
router.get('/getDisputeAdminById/:id',verifyToken, disputeController.getDisputeAdminById);

router.post('/addDispute', verifyToken, s3Upload.array('files', 3), disputeController.addDispute);
router.post('/addResponseDispute', verifyToken, s3Upload.array('files', 3), disputeController.addResponseDispute);


module.exports = router;
