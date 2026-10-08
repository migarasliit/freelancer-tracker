import { useState, useEffect } from 'react';
import API from '../services/api';
import IncomeChart from '../components/charts/IncomeChart';
import ProjectStatusChart from '../components/charts/ProjectStatusChart';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get('/income/dashboard');
        setStats(data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading dashboard...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Income</h3>
          <p className="text-3xl font-bold text-green-600">${stats?.totalIncome?.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Pending Payments</h3>
          <p className="text-3xl font-bold text-yellow-600">${stats?.pendingPayments?.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Active Projects</h3>
          <p className="text-3xl font-bold text-blue-600">{stats?.activeProjects}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <IncomeChart data={stats?.monthlyIncome || []} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <ProjectStatusChart data={stats?.projectStatuses || []} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;