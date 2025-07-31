import { defineConfig } from 'vitest/config';

// https://vite.dev/config/
// eslint-disable-next-line import/no-default-export
export default defineConfig({
    server: {
        port: 8080,
        open: true,
    },
    test: {
        projects: [{
            test: {
                name: 'Client Side',
                environment: 'jsdom',
                root: './src',
                include: [
                    'src/client/**/*.test.ts',
                    'src/engine/Renderer/**/*.test.ts',
                ],
            },
        }, {
            test: {
                name: 'Server Side',
                environment: 'node',
                root: './src',
                exclude: [
                    'src/client/**/*.test.ts',
                    'src/engine/Renderer/**/*.test.ts',
                ],
            },
        }],
    },
});
