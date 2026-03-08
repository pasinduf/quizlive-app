import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Dashboard from './pages/host/Dashboard';
import Players from './pages/host/Players';
import QuizList from './pages/host/QuizList';
import QuizEditor from './pages/host/QuizEditor';
import Sessions from './pages/host/Sessions';
import Monitor from './pages/host/Monitor';
import Leaderboard from './pages/host/Leaderboard';
import Login from './pages/host/Login';
import NotFound from './pages/NotFound';
import Join from './pages/player/Join';
import Lobby from './pages/player/Lobby';
import Quiz from './pages/player/Quiz';
import ThankYou from './pages/player/ThankYou';

function App() {
    return (
        <AuthProvider>
            <Toaster position="bottom-right" reverseOrder={false} />
            <Routes>
                {/* Auth routes */}
                <Route path="/login" element={<Login />} />

                {/* Host/Admin routes (Protected) */}
                <Route path="/" element={<PrivateRoute><Navbar /><Dashboard /></PrivateRoute>} />
                <Route path="/players" element={<PrivateRoute><Navbar /><Players /></PrivateRoute>} />
                <Route path="/quizzes" element={<PrivateRoute><Navbar /><QuizList /></PrivateRoute>} />
                <Route path="/quizzes/:quizId/questions" element={<PrivateRoute><Navbar /><QuizEditor /></PrivateRoute>} />
                <Route path="/sessions" element={<PrivateRoute><Navbar /><Sessions /></PrivateRoute>} />
                <Route path="/sessions/:sessionId/monitor" element={<PrivateRoute><Navbar /><Monitor /></PrivateRoute>} />
                <Route path="/sessions/:sessionId/leaderboard" element={<PrivateRoute><Navbar /><Leaderboard /></PrivateRoute>} />

                {/* Player routes */}
                <Route path="/join/:sessionId" element={<Join />} />
                <Route path="/lobby/:sessionId" element={<Lobby />} />
                <Route path="/quiz/:sessionId" element={<Quiz />} />
                <Route path="/thankyou" element={<ThankYou />} />

                {/* Fallback */}
                <Route path="/not-found" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/not-found" replace />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;
