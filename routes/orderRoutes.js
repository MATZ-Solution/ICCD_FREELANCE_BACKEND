const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { verifyToken } = require("../middleware/authenticate");
const s3Upload = require('../middleware/s3Upload');


// router.get("/checkapi", verifyToken, userController.check);

router.post("/createOrder",verifyToken, orderController.createOrder);
router.get("/getAllOrderByFreelancer/:freelancerID",verifyToken, orderController.getAllOrderByFreelancer);
router.get("/getSingleOrderByFreelancer/:orderId",verifyToken, orderController.getSingleOrderByFreelancer);
router.get("/getAllOrderByClient/:clientID",verifyToken, orderController.getAllOrderByClient);
router.get("/getAllOrderByAdmin", verifyToken, orderController.getAllOrderByAdmin);
// router.get("/getSingleOrderByFreelancer/:orderId",verifyToken, orderController.getSingleOrderByFreelancer);

module.exports = router;
