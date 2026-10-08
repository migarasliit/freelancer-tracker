import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const linkClass = ({ isActive }) =>
    `block px-4 py-3 rounded-lg mb-1 transition ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'}`;

  return (
    <aside className="w-64 bg-white shadow-md min-h-screen p-4 hidden md:block">
      <nav className="mt-4">
        <NavLink to="/dashboard" className={linkClass}>📊 Dashboard</NavLink>
        <NavLink to="/clients" className={linkClass}>👥 Clients</NavLink>
        <NavLink to="/projects" className={linkClass}>📁 Projects</NavLink>
        <NavLink to="/income" className={linkClass}>💰 Income</NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;