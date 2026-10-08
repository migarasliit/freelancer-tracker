import { NavLink } from 'react-router-dom';

const MobileNav = () => {
  const linkClass = ({ isActive }) =>
    `flex flex-col items-center text-xs ${isActive ? 'text-blue-600' : 'text-gray-500'}`;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2 z-50">
      <NavLink to="/dashboard" className={linkClass}>📊<span>Home</span></NavLink>
      <NavLink to="/clients" className={linkClass}>👥<span>Clients</span></NavLink>
      <NavLink to="/projects" className={linkClass}>📁<span>Projects</span></NavLink>
      <NavLink to="/income" className={linkClass}>💰<span>Income</span></NavLink>
    </nav>
  );
};

export default MobileNav;