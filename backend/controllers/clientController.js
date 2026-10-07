const Client = require('../models/Client');

const getClients = async (req, res) => {
  try {
    const clients = await Client.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    if (client.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: 'Not authorized' });
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createClient = async (req, res) => {
  try {
    const { name, email, phone, company } = req.body;
    if (!name) return res.status(400).json({ message: 'Client name is required' });

    const client = await Client.create({
      user: req.user._id,
      name, email, phone, company,
    });
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    if (client.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: 'Not authorized' });

    const updated = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    if (client.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: 'Not authorized' });

    await client.deleteOne();
    res.json({ message: 'Client removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getClients, getClient, createClient, updateClient, deleteClient };