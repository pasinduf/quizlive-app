import { Link } from 'react-router-dom';

function NotFound() {
    return (
        <div className="page-container flex-center" style={{ minHeight: '100vh', textAlign: 'center' }}>
            <div className="card" style={{ maxWidth: '500px', padding: '3rem' }}>
                <h1 style={{ fontSize: '5rem', marginBottom: '1rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>404</h1>
                <h2 className="page-title">Page Not Found</h2>
                <p className="page-subtitle mt-md mb-lg">
                    The page you are looking for doesn't exist or you don't have permission to access it.
                </p>
                <Link to="/" className="btn btn-primary">
                    Return to Dashboard
                </Link>
            </div>
        </div>
    );
}

export default NotFound;
