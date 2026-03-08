import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { admin, loading } = useAuth();

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    if (!admin) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default PrivateRoute;
