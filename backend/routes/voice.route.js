const express = require('express');
const router = express.Router();
const voiceController = require('../controllers/voice.controller');
const authMiddleware = require("../middleware/auth");


router.post('/', voiceController.booking);
router.post('/dialogflow', voiceController.dialogflow);

module.exports = router;