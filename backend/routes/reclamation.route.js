const express = require('express');
const router = express.Router();
const reclamationController = require('../controllers/reclamation.controller');

router.post('/', reclamationController.createReclamation);
router.get('/', reclamationController.getAllReclamations);
router.get('/archived', reclamationController.getArchivedReclamations);
router.put('/:id', reclamationController.updateReclamationStatus);
router.delete('/:id', reclamationController.deleteReclamation);

module.exports = router;