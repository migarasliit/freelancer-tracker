import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center shadow-lg">
      <Link to="/dashboard" className="text-xl font-bold">💼 Freelancer Tracker</Link>
      {user && (
        <div className="flex items-center gap-4">
          <span className="text-sm">Hi, {user.name}</span>
          <button onClick={handleLogout}
            className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 text-sm">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;