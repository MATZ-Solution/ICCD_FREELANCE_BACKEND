const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");
const { verifyToken } = require("../middleware/authenticate");
const s3Upload = require('../middleware/s3Upload');

//  s3Upload.array('files', 5)
router.get("/getAllJob", jobController.getAllJob);
router.get("/getJobById/:id", jobController.getJobById);
router.get("/getJobByIdFreelancer", verifyToken, jobController.getJobByIdFreelancer);
router.get("/getJobsByClient" ,verifyToken, jobController.getJobByClient);
router.get("/getJobPropsalByClient" ,verifyToken, jobController.getJobProposalsByClient);

router.post("/addJob" ,verifyToken, jobController.addJob);
router.post("/applyJob" ,verifyToken, s3Upload.array('files', 1), jobController.applyJob);

router.put("/editJob/:id" ,verifyToken, jobController.editJob);
router.put("/closeJob/:id" ,verifyToken, jobController.closeJob);
router.put("/jobProposalAction" ,verifyToken, jobController.jobProposalsAction);


module.exports = router;