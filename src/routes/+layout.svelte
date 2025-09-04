<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth.js';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	onMount(() => {
		authStore.init();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
		line-height: 1.6;
		background: #f8fafc;
	}
	
	:global(*) {
		box-sizing: border-box;
	}
	
	:global(h1, h2, h3, h4, h5, h6) {
		margin: 0;
		font-weight: 600;
	}
	
	:global(p) {
		margin: 0;
	}
	
	:global(a) {
		color: inherit;
		text-decoration: none;
	}
	
	:global(button) {
		font-family: inherit;
	}
</style>
