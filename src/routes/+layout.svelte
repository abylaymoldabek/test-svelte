<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth.js';
	import favicon from '$lib/assets/favicon.svg';
	import Sidebar from '$lib/Sidebar.svelte';
	import { get } from 'svelte/store';

	let { children } = $props();
	let isAuthenticated = false;
	let isInitialized = false;

	const unsubscribe = authStore.subscribe(state => {
		isAuthenticated = state.isAuthenticated;
		isInitialized = state.isInitialized;
	});

	onMount(() => {
		authStore.init();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if $authStore.isInitialized}
  {#if $authStore.isAuthenticated}
    <div style="display: flex; min-height: 100vh;">
      <Sidebar />
      <main style="flex:1; margin-left:220px; padding:2rem 2rem 2rem 0;">
        {@render children?.()}
      </main>
    </div>
  {:else}
    {@render children?.()}
  {/if}
{/if}<style>
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
