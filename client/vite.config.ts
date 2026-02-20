import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/expenses': {
                target: 'http://localhost:5000',
                changeOrigin: true,
            },
            '/approvals': {
                target: 'http://localhost:5000',
                changeOrigin: true,
            },
        },
    },
});
