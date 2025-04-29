const express = require('express');
const router = express.Router();
const claimController = require('../controllers/claim.controller');
const authMiddleware = require("../middleware/auth");


router.post('/', claimController.createClaim);
router.get('/', claimController.getAllClaims);
router.get('/by-user/:userId', claimController.getClaimByUser);
router.get('/:id', claimController.getClaimById);
router.get('/archived', claimController.getArchivedClaims);
router.put('/:id', claimController.updateClaimStatus);
router.delete('/:id', claimController.deleteClaim);

module.exports = router;