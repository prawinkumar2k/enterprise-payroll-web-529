import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

export default defineConfig({
    base: './', // Use relative paths for assets (critical for Electron file:// protocol)
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(process.cwd(), './'),
        },
    },
    server: {
        proxy: {
            '/api': 'http://127.0.0.1:5005',
        },
    },
});
