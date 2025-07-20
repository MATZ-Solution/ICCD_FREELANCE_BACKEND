const express = require("express");
const router = express.Router();
const gigsController = require("../controllers/gigsController");
const { verifyToken } = require("../middleware/authenticate");
const s3Upload = require('../middleware/s3Upload');


router.get('/getGigs', gigsController.getAllGigs)
router.get('/getSingleGigs/:gigID', gigsController.getSingleGigs)
router.get('/getGigsByUser/:id', verifyToken, gigsController.getGigsByUser)
router.get('/getGigsOverview/:gigID', verifyToken, gigsController.getGigsOverview)



router.post('/addGigs', verifyToken, s3Upload.array('files', 5), gigsController.addGigs)

router.put('/editGigs/:gigId', verifyToken, gigsController.editGigs)

router.post('/checkDeleteFile', gigsController.checkDeleteFile)


module.exports = router;