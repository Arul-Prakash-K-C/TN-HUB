import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
export default defineConfig({
    plugins: [
        tailwindcss(),
        sveltekit({
            compilerOptions: {
                // Force runes mode for the project, except for libraries. Can be removed in svelte 6.
                runes: ({ filename }) => filename.split(/[/\\]/).includes('node_modules') ? undefined : true
            },
            adapter: adapter()
        })
    ],
    ssr: {
        // Firebase Admin and its deps must stay in Node.js-land.
        // Bundling them through Vite's SSR transform causes the 60 s
        // vite:invoke transport timeout on slow networks / cold starts.
        external: [
            'firebase-admin',
            'firebase-admin/app',
            'firebase-admin/auth',
            'firebase-admin/firestore',
            'firebase-admin/storage',
            'node-fetch',
            'undici'
        ]
    },
    optimizeDeps: {
        include: ['@lucide/svelte', 'svelte', 'svelte/store']
    },
    server: {
        watch: {
            ignored: [
                '**/.git/**',
                '**/.svelte-kit/**',
                '**/node_modules/**',
                '**/coverage/**',
                '**/tests/**',
                '**/.system_generated/**'
            ]
        },
        hmr: {
            timeout: 30000
        }
    },
    test: {
        environment: 'node',
        include: ['tests/**/*.test.js', 'src/**/*.test.js'],
        globals: false
    }
});
