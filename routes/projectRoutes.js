const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const { verifyToken } = require("../middleware/authenticate");
const s3Upload = require('../middleware/s3Upload');

//  s3Upload.array('files', 5)
router.get("/getAllProject" , projectController.getAllProject);
router.get("/getProjectByClient" ,verifyToken, projectController.getProjectByClient);
router.get("/getProjectById/:projectId" ,verifyToken, projectController.getProjectById);
router.get("/getProjectPropsalByClient/:projectId" ,verifyToken, projectController.getProjectProposalsByClient);

router.post("/addProject" ,verifyToken, s3Upload.array('files', 5), projectController.addProject);
router.post("/submitProposals" ,verifyToken, s3Upload.array('files', 5), projectController.applyProject);

router.put("/editProject/:id" ,verifyToken, s3Upload.array('files', 5), projectController.editProject);

module.exports = router;