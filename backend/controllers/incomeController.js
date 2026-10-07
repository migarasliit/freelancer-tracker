const Income = require('../models/Income');
const Project = require('../models/Project');

const getIncomes = async (req, res) => {
  try {
    const { paymentStatus, page = 1, limit = 10 } = req.query;
    const filter = { user: req.user._id };
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const skip = (page - 1) * limit;
    const total = await Income.countDocuments(filter);
    const incomes = await Income.find(filter)
      .populate('project', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ incomes, page: Number(page), totalPages: Math.ceil(total / limit), total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createIncome = async (req, res) => {
  try {
    const { project, amount, paymentStatus, paymentDate, description } = req.body;
    if (!project || !amount) return res.status(400).json({ message: 'Project and amount are required' });

    const income = await Income.create({
      user: req.user._id, project, amount, paymentStatus, paymentDate, description,
    });
    const populated = await Income.findById(income._id).populate('project', 'name');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);
    if (!income) return res.status(404).json({ message: 'Income record not found' });
    if (income.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: 'Not authorized' });

    const updated = await Income.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('project', 'name');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);
    if (!income) return res.status(404).json({ message: 'Income record not found' });
    if (income.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: 'Not authorized' });

    await income.deleteOne();
    res.json({ message: 'Income record removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalIncome = await Income.aggregate([
      { $match: { user: userId, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const pendingPayments = await Income.aggregate([
      { $match: { user: userId, paymentStatus: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const activeProjects = await Project.countDocuments({ user: userId, status: 'active' });

    // Monthly income for chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyIncome = await Income.aggregate([
      { $match: { user: userId, paymentStatus: 'paid', paymentDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$paymentDate' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Project status breakdown for pie chart
    const projectStatuses = await Project.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      totalIncome: totalIncome[0]?.total || 0,
      pendingPayments: pendingPayments[0]?.total || 0,
      activeProjects,
      monthlyIncome,
      projectStatuses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getIncomes, createIncome, updateIncome, deleteIncome, getDashboardStats };