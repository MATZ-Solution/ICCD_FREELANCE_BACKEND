const express = require("express");
const { sendNotification , getNotifications ,markAsRead } = require("../controllers/notificationController");
const router = express.Router();
const { verifyToken } = require("../middleware/authenticate");

// router.post('/create', verifyToken,  CreateNotification);
// router.get('/all', verifyToken ,  GetNotifications);
// router.put('/read/:id', verifyToken,  MarkAsRead);

router.post('/create', verifyToken , sendNotification);
router.get('/get', verifyToken,  getNotifications);
router.patch("/read/:id", markAsRead); 

module.exports = router;

