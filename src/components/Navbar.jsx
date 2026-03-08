import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function Navbar() {
    const { admin, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    return (
      <nav className="navbar">
        <NavLink to="/" className="navbar-brand">
          ⚡ QuizLive
        </NavLink>
        <div className="navbar-links">
          <NavLink to="/" end className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}>
            Dashboard
          </NavLink>
          <NavLink to="/quizzes" className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}>
            Quizzes
          </NavLink>
          <NavLink to="/players" className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}>
            Players
          </NavLink>
          <NavLink to="/sessions" className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}>
            Sessions
          </NavLink>
        </div>

        {admin && (
          <div className="navbar-user">
            {/* <span className="user-name mr-md">👤</span> */}
            <button onClick={handleLogout} className="btn btn-outline btn-sm ml-md">
              Logout
            </button>
          </div>
        )}
      </nav>
    );
}

export default Navbar;
