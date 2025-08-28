const { verifyToken } = require("../middleware/authenticate");
const s3Upload = require('../middleware/s3Upload');
const superadminController = require("../controllers/superadminController");
const { getAllOrderByAdmin } = require("../controllers/orderController");

const express = require("express");

const router = express.Router();

router.get('/getAllUsers', superadminController.getAllUsers);
router.get("/getAllOrder", getAllOrderByAdmin);
router.get("/getAllFreelancers", superadminController.getAllFreelancers);
router.get("/getAllGigs", superadminController.getAllGigs);
router.get("/getAllProjects", superadminController.getAllProjects);


module.exports = router;
