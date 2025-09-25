import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			// если нужно, можно добавить дополнительные настройки
			// runtime: 'edge', // если хотите использовать Edge Functions
			// regions: ['fra1'] // если нужно указать конкретные регионы
		})
	}
};

export default config;
