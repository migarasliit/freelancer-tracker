import { useState, useEffect } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '' });

  const fetchClients = async () => {
    const { data } = await API.get('/clients');
    setClients(data);
  };

  useEffect(() => { fetchClients(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error('Client name is required');
    try {
      if (editId) {
        await API.put(`/clients/${editId}`, form);
        toast.success('Client updated');
      } else {
        await API.post('/clients', form);
        toast.success('Client added');
      }
      setShowModal(false);
      setForm({ name: '', email: '', phone: '', company: '' });
      setEditId(null);
      fetchClients();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const handleEdit = (client) => {
    setForm({ name: client.name, email: client.email || '', phone: client.phone || '', company: client.company || '' });
    setEditId(client._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this client?')) return;
    await API.delete(`/clients/${id}`);
    toast.success('Client deleted');
    fetchClients();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clients</h1>
        <button onClick={() => { setForm({ name: '', email: '', phone: '', company: '' }); setEditId(null); setShowModal(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">+ Add Client</button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left hidden md:table-cell">Company</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c._id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{c.name}</td>
                <td className="px-4 py-3">{c.email}</td>
                <td className="px-4 py-3 hidden md:table-cell">{c.company}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleEdit(c)} className="text-blue-600 mr-2 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(c._id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editId ? 'Edit' : 'Add'} Client</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input placeholder="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border rounded" />
              <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border rounded" />
              <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded" />
              <input placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="w-full px-3 py-2 border rounded" />
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">{editId ? 'Update' : 'Add'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;