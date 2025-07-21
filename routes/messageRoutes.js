const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const { verifyToken } = require("../middleware/authenticate");
const s3Upload = require('../middleware/s3Upload');

//  s3Upload.array('files', 5)
router.get("/getMessageByUser", verifyToken, messageController.getMessageByUser);
router.get("/getAllMessage", verifyToken, messageController.getAllMessage);

router.post("/addMessageByUser", verifyToken, messageController.addMessageByUser);




module.exports = router;