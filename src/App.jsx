import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Dashboard from './pages/host/Dashboard';
import Players from './pages/host/Players';
import QuizList from './pages/host/QuizList';
import QuizEditor from './pages/host/QuizEditor';
import Sessions from './pages/host/Sessions';
import Monitor from './pages/host/Monitor';
import Leaderboard from './pages/host/Leaderboard';
import Join from './pages/player/Join';
import Lobby from './pages/player/Lobby';
import Quiz from './pages/player/Quiz';
import ThankYou from './pages/player/ThankYou';

function App() {
    return (
        <>
            <Toaster position="bottom-right" reverseOrder={false} />
            <Routes>
                {/* Host/Admin routes */}
                <Route path="/" element={<><Navbar /><Dashboard /></>} />
                <Route path="/players" element={<><Navbar /><Players /></>} />
                <Route path="/quizzes" element={<><Navbar /><QuizList /></>} />
                <Route path="/quizzes/:quizId/questions" element={<><Navbar /><QuizEditor /></>} />
                <Route path="/sessions" element={<><Navbar /><Sessions /></>} />
                <Route path="/sessions/:sessionId/monitor" element={<><Navbar /><Monitor /></>} />
                <Route path="/sessions/:sessionId/leaderboard" element={<><Navbar /><Leaderboard /></>} />

                {/* Player routes */}
                <Route path="/join/:sessionId" element={<Join />} />
                <Route path="/lobby/:sessionId" element={<Lobby />} />
                <Route path="/quiz/:sessionId" element={<Quiz />} />
                <Route path="/thankyou" element={<ThankYou />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
}

export default App;
