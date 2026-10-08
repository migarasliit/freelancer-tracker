import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const ProjectStatusChart = ({ data }) => {
  const colors = { pending: '#f59e0b', active: '#3b82f6', completed: '#10b981', cancelled: '#ef4444' };

  const chartData = {
    labels: data.map((d) => d._id),
    datasets: [{
      data: data.map((d) => d.count),
      backgroundColor: data.map((d) => colors[d._id] || '#6b7280'),
    }],
  };

  return <Pie data={chartData} options={{ responsive: true, plugins: { title: { display: true, text: 'Project Status' } } }} />;
};

export default ProjectStatusChart;