const express = require('express');
const router = express.Router();
const voiceController = require('../controllers/voice.controller');
const authMiddleware = require("../middleware/auth");


router.post('/',authMiddleware, voiceController.Parse);
module.exports = router;