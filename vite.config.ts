import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 5175,
		proxy: {
			'/api': {
				target: process.env.VETIS_PROXY_TARGET || 'http://158.160.90.93:8082/',
				changeOrigin: true
			}
		}
	}
});
