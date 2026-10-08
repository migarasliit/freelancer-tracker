import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const IncomeChart = ({ data }) => {
  const chartData = {
    labels: data.map((d) => d._id),
    datasets: [{
      label: 'Monthly Income ($)',
      data: data.map((d) => d.total),
      backgroundColor: 'rgba(59, 130, 246, 0.6)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1,
    }],
  };

  return <Bar data={chartData} options={{ responsive: true, plugins: { title: { display: true, text: 'Monthly Income' } } }} />;
};

export default IncomeChart;