import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

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
    // Vitest config (co-located with Vite to share the same resolve/alias config)
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/test-setup.js'],
        include: ['**/__tests__/**/*.{js,jsx}', '**/*.test.{js,jsx}'],
        exclude: ['node_modules', 'dist'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov'],
            include: ['pages/**', 'components/**', 'context/**', 'hooks/**', 'utils/**'],
            exclude: ['**/__tests__/**', '**/*.test.*'],
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    // Normalize to forward slashes for cross-platform matching
                    const nid = id.replace(/\\/g, '/');
                    // React core
                    if (nid.includes('node_modules/react/') ||
                        nid.includes('node_modules/react-dom/') ||
                        nid.includes('node_modules/react-router-dom/') ||
                        nid.includes('node_modules/scheduler/')) {
                        return 'react-vendor';
                    }
                    // Radix UI primitives
                    if (nid.includes('node_modules/@radix-ui/')) {
                        return 'radix-vendor';
                    }
                    // Animation & motion
                    if (nid.includes('node_modules/framer-motion/') ||
                        nid.includes('node_modules/embla-carousel')) {
                        return 'motion-vendor';
                    }
                    // Lucide icons (large icon set)
                    if (nid.includes('node_modules/lucide-react/')) {
                        return 'icons-vendor';
                    }
                    // Form handling
                    if (nid.includes('node_modules/react-hook-form/') ||
                        nid.includes('node_modules/@hookform/') ||
                        nid.includes('node_modules/zod/')) {
                        return 'forms-vendor';
                    }
                    // Data & utilities
                    if (nid.includes('node_modules/@tanstack/') ||
                        nid.includes('node_modules/axios/') ||
                        nid.includes('node_modules/date-fns/') ||
                        nid.includes('node_modules/react-day-picker/')) {
                        return 'data-vendor';
                    }
                    // Misc small libs
                    if (nid.includes('node_modules/class-variance-authority/') ||
                        nid.includes('node_modules/clsx/') ||
                        nid.includes('node_modules/tailwind-merge/') ||
                        nid.includes('node_modules/cmdk/') ||
                        nid.includes('node_modules/sonner/') ||
                        nid.includes('node_modules/next-themes/') ||
                        nid.includes('node_modules/input-otp/') ||
                        nid.includes('node_modules/react-resizable-panels/')) {
                        return 'ui-utils-vendor';
                    }
                },
            },
        },
    },
});
