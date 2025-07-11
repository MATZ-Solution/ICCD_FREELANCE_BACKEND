const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const { verifyToken } = require("../middleware/authenticate");
const s3Upload = require('../middleware/s3Upload');

//  s3Upload.array('files', 5)
router.get("/getAllProject" , projectController.getAllProject);
router.get("/getProjectByUser" ,verifyToken, projectController.getProjectByUser);

router.post("/addProject" ,verifyToken, s3Upload.array('files', 5), projectController.addProject);

module.exports = router;