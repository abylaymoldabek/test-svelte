import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 5175,
		proxy: {
			'/api': {
				target: 'http://localhost:8082',
				changeOrigin: true
			}
		}
	}
});
