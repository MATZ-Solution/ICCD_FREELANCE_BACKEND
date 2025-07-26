const express = require("express");
const notificationController = require("../controllers/notificationController");
const router = express.Router();
const { verifyToken } = require("../middleware/authenticate");

// router.post('/create', verifyToken,  CreateNotification);
// router.get('/all', verifyToken ,  GetNotifications);
// router.put('/read/:id', verifyToken,  MarkAsRead);

// router.patch("/read/:id", markAsRead); 

router.post('/create', verifyToken , notificationController.sendNotification);

router.get('/getNotification', verifyToken,  notificationController.getNotifications);
router.get("/unread-count", verifyToken, notificationController.countUnReadMesg)
router.put("/mark-read", verifyToken, notificationController.updateReadMesg)

module.exports = router;

