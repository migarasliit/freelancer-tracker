import { useState, useEffect } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState({ paymentStatus: '', page: 1 });
  const [totalPages, setTotalPages] = useState(1);
  const [form, setForm] = useState({ project: '', amount: '', paymentStatus: 'pending', paymentDate: '', description: '' });

  const fetchData = async () => {
    const params = new URLSearchParams();
    if (filter.paymentStatus) params.append('paymentStatus', filter.paymentStatus);
    params.append('page', filter.page);
    const { data } = await API.get(`/income?${params}`);
    setIncomes(data.incomes);
    setTotalPages(data.totalPages);
  };

  const fetchProjects = async () => {
    const { data } = await API.get('/projects');
    setProjects(data.projects);
  };

  useEffect(() => { fetchProjects(); }, []);
  useEffect(() => { fetchData(); }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.project || !form.amount) return toast.error('Project and amount are required');
    try {
      if (editId) {
        await API.put(`/income/${editId}`, form);
        toast.success('Income updated');
      } else {
        await API.post('/income', form);
        toast.success('Income added');
      }
      setShowModal(false);
      setForm({ project: '', amount: '', paymentStatus: 'pending', paymentDate: '', description: '' });
      setEditId(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const handleEdit = (inc) => {
    setForm({
      project: inc.project?._id || inc.project, amount: inc.amount,
      paymentStatus: inc.paymentStatus, paymentDate: inc.paymentDate?.split('T')[0] || '',
      description: inc.description || '',
    });
    setEditId(inc._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this income record?')) return;
    await API.delete(`/income/${id}`);
    toast.success('Income record deleted');
    fetchData();
  };

  const statusColor = (s) => ({
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    overdue: 'bg-red-100 text-red-800',
  }[s]);

  const exportCSV = () => {
  const headers = ['Project', 'Amount', 'Status', 'Date', 'Description'];
  const rows = incomes.map((inc) => [
    inc.project?.name, inc.amount, inc.paymentStatus,
    inc.paymentDate ? new Date(inc.paymentDate).toLocaleDateString() : '', inc.description || '',
  ]);
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'income-report.csv';
  a.click();
  URL.revokeObjectURL(url);
  toast.success('CSV exported!');
};

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Income Tracker</h1>
        <button onClick={() => { setForm({ project: '', amount: '', paymentStatus: 'pending', paymentDate: '', description: '' }); setEditId(null); setShowModal(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">+ Add Income</button>
          <button onClick={exportCSV} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">📥 Export CSV</button>
      </div>

      <div className="mb-4">
        <select value={filter.paymentStatus} onChange={(e) => setFilter({ ...filter, paymentStatus: e.target.value, page: 1 })}
          className="px-3 py-2 border rounded-lg">
          <option value="">All Statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Project</th>
              <th className="px-4 py-3 text-left">Amount</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left hidden md:table-cell">Date</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {incomes.map((inc) => (
              <tr key={inc._id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{inc.project?.name}</td>
                <td className="px-4 py-3 font-semibold">${inc.amount?.toLocaleString()}</td>
                <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs ${statusColor(inc.paymentStatus)}`}>{inc.paymentStatus}</span></td>
                <td className="px-4 py-3 hidden md:table-cell">{inc.paymentDate ? new Date(inc.paymentDate).toLocaleDateString() : '-'}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleEdit(inc)} className="text-blue-600 mr-2 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(inc._id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editId ? 'Edit' : 'Add'} Income</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <select value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })} className="w-full px-3 py-2 border rounded">
                <option value="">Select Project *</option>
                {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
              <input type="number" placeholder="Amount ($) *" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full px-3 py-2 border rounded" />
              <select value={form.paymentStatus} onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })} className="w-full px-3 py-2 border rounded">
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
              <input type="date" value={form.paymentDate} onChange={(e) => setForm({ ...form, paymentDate: e.target.value })} className="w-full px-3 py-2 border rounded" />
              <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border rounded" />
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

export default Income;