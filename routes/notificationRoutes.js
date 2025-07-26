const express = require("express");
const notificationController = require("../controllers/notificationController");
const router = express.Router();
const { verifyToken } = require("../middleware/authenticate");

// router.post('/create', verifyToken,  CreateNotification);
// router.get('/all', verifyToken ,  GetNotifications);
// router.put('/read/:id', verifyToken,  MarkAsRead);

// router.post('/create', verifyToken , sendNotification);
// router.patch("/read/:id", markAsRead); 

router.get('/getNotification/:id', verifyToken,  notificationController.getNotifications);
router.get("/unread-count", notificationController.countUnReadMesg)
router.put("/mark-read", notificationController.updateReadMesg)

module.exports = router;

