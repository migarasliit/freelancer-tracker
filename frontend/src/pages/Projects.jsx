import { useState, useEffect } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState({ status: '', search: '', page: 1 });
  const [totalPages, setTotalPages] = useState(1);
  const [form, setForm] = useState({ name: '', client: '', description: '', status: 'pending', fee: '', startDate: '', endDate: '' });

  const fetchData = async () => {
    const params = new URLSearchParams();
    if (filter.status) params.append('status', filter.status);
    if (filter.search) params.append('search', filter.search);
    params.append('page', filter.page);

    const { data } = await API.get(`/projects?${params}`);
    setProjects(data.projects);
    setTotalPages(data.totalPages);
  };

  const fetchClients = async () => {
    const { data } = await API.get('/clients');
    setClients(data);
  };

  useEffect(() => { fetchClients(); }, []);
  useEffect(() => { fetchData(); }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.client) return toast.error('Name and client are required');
    try {
      if (editId) {
        await API.put(`/projects/${editId}`, form);
        toast.success('Project updated');
      } else {
        await API.post('/projects', form);
        toast.success('Project added');
      }
      setShowModal(false);
      setForm({ name: '', client: '', description: '', status: 'pending', fee: '', startDate: '', endDate: '' });
      setEditId(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const handleEdit = (p) => {
    setForm({
      name: p.name, client: p.client?._id || p.client, description: p.description || '',
      status: p.status, fee: p.fee, startDate: p.startDate?.split('T')[0] || '', endDate: p.endDate?.split('T')[0] || '',
    });
    setEditId(p._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    await API.delete(`/projects/${id}`);
    toast.success('Project deleted');
    fetchData();
  };

  const statusColor = (s) => ({
    pending: 'bg-yellow-100 text-yellow-800',
    active: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }[s]);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Projects</h1>
        <button onClick={() => { setForm({ name: '', client: '', description: '', status: 'pending', fee: '', startDate: '', endDate: '' }); setEditId(null); setShowModal(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">+ Add Project</button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <input placeholder="Search projects..." value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value, page: 1 })}
          className="px-3 py-2 border rounded-lg flex-1" />
        <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value, page: 1 })}
          className="px-3 py-2 border rounded-lg">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Client</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Fee</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p._id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3">{p.client?.name}</td>
                <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs ${statusColor(p.status)}`}>{p.status}</span></td>
                <td className="px-4 py-3">${p.fee?.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleEdit(p)} className="text-blue-600 mr-2 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(p._id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setFilter({ ...filter, page: i + 1 })}
              className={`px-3 py-1 rounded ${filter.page === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editId ? 'Edit' : 'Add'} Project</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input placeholder="Project Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded" />
              <select value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} className="w-full px-3 py-2 border rounded">
                <option value="">Select Client *</option>
                {clients.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border rounded" rows="2" />
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border rounded">
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <input type="number" placeholder="Fee ($)" value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} className="w-full px-3 py-2 border rounded" />
              <div className="grid grid-cols-2 gap-3">
                <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="px-3 py-2 border rounded" />
                <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="px-3 py-2 border rounded" />
              </div>
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

export default Projects;