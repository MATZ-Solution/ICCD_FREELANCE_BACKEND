const { verifyToken } = require("../middleware/authenticate");
const s3Upload = require('../middleware/s3Upload');
const superadminController = require("../controllers/superadminController");
const { getAllOrderByAdmin } = require("../controllers/orderController");

const express = require("express");

const router = express.Router();

router.get('/getAllUsers', verifyToken, superadminController.getAllUsers);
router.get("/getAllOrder", verifyToken, getAllOrderByAdmin);
router.get("/getAllFreelancers", verifyToken, superadminController.getAllFreelancers);
router.get("/getAllGigs", verifyToken, superadminController.getAllGigs);
router.get("/getAllProjects", verifyToken, superadminController.getAllProjects);
router.get("/getAllJobs", verifyToken, superadminController.getAllJob);
router.get("/statisticData", verifyToken, superadminController.statisticData);

router.put("/closeDispute/:id", verifyToken, superadminController.closedDispute);



module.exports = router;
