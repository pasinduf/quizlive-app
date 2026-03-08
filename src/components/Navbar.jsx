import { NavLink } from 'react-router-dom';

function Navbar() {
    return (
        <nav className="navbar">
            <NavLink to="/" className="navbar-brand">
                ⚡ QuizLive
            </NavLink>
            <div className="navbar-links">
                <NavLink to="/" end className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                    Dashboard
                </NavLink>
                <NavLink to="/quizzes" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                    Quizzes
                </NavLink>
                <NavLink to="/players" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                    Players
                </NavLink>
                <NavLink to="/sessions" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                    Sessions
                </NavLink>
            </div>
        </nav>
    );
}

export default Navbar;
