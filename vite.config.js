import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/api': 'quizlive.up.railway.app', // 'http://localhost:8080',
            '/socket.io': {
                target: 'quizlive.up.railway.app', // 'http://localhost:8080',
                ws: true,
            },
        },
    },
});
