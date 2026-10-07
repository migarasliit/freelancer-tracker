const Project = require('../models/Project');

const getProjects = async (req, res) => {
  try {
    const { status, client, search, page = 1, limit = 10 } = req.query;
    const filter = { user: req.user._id };

    if (status) filter.status = status;
    if (client) filter.client = client;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const skip = (page - 1) * limit;
    const total = await Project.countDocuments(filter);
    const projects = await Project.find(filter)
      .populate('client', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      projects,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProject = async (req, res) => {
  try {
    const { client, name, description, status, fee, startDate, endDate } = req.body;
    if (!client || !name) return res.status(400).json({ message: 'Client and project name are required' });

    const project = await Project.create({
      user: req.user._id, client, name, description, status, fee, startDate, endDate,
    });
    const populated = await Project.findById(project._id).populate('client', 'name');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: 'Not authorized' });

    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('client', 'name');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: 'Not authorized' });

    await project.deleteOne();
    res.json({ message: 'Project removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProjects, createProject, updateProject, deleteProject };