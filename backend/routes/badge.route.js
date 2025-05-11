const express = require('express');
const router = express.Router();
const badgeController = require('../controllers/badge.controller');

router.post('/', badgeController.createBadge);
router.get('/', badgeController.getAllBadges);
router.get('/:id', badgeController.getBadgeById);

module.exports = router;
