const express = require('express');
const { getIncomes, createIncome, updateIncome, deleteIncome, getDashboardStats } = require('../controllers/incomeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/dashboard', getDashboardStats);
router.route('/').get(getIncomes).post(createIncome);
router.route('/:id').put(updateIncome).delete(deleteIncome);

module.exports = router;