import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	return {
		base: env.VITE_BASE_URL,
		plugins: [react(), tailwindcss()],
		resolve: {
			alias: {
				'@': resolve(__dirname, './src'),
				'@axiom/components/ui': resolve(__dirname, './src/shared/ui'),
				'@axiom/hooks': resolve(__dirname, './src/core/hooks'),
				'@app-types': resolve(__dirname, './src/types'),
			},
		},
		server: {
			port: Number(env.PORT) || 5173,
		},
	};
});
