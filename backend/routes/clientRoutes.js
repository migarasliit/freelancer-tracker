const express = require('express');
const { getClients, getClient, createClient, updateClient, deleteClient } = require('../controllers/clientController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All routes protected
router.route('/').get(getClients).post(createClient);
router.route('/:id').get(getClient).put(updateClient).delete(deleteClient);

module.exports = router;