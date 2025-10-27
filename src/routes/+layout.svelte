<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth.js';
	import { initializeTokenPayload } from '$lib/stores/token.js';
	import favicon from '$lib/assets/favicon.svg';
	import Sidebar from '$lib/Sidebar.svelte';
	import GlobalHeader from '$lib/components/GlobalHeader.svelte';

	let isAuthenticated = false;
	let isInitialized = false;

	const unsubscribe = authStore.subscribe(state => {
		isAuthenticated = state.isAuthenticated;
		isInitialized = state.isInitialized;
	});

	onMount(() => {
		authStore.init();
		
		// Инициализируем токен payload при загрузке приложения
		const cleanupTokenListener = initializeTokenPayload();
		
		// Очищаем слушателя при размонтировании
		return () => {
			if (cleanupTokenListener) {
				cleanupTokenListener();
			}
		};
	});
</script>

<style>
  .app-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .content-container {
    display: flex;
    flex: 1;
  }

  .main-content {
    flex: 1;
    margin-left: 180px;
    margin-top: 60px; /* Отступ для глобального заголовка */
    padding: 1.5rem;
    background: #f8fafc;
    min-height: calc(100vh - 60px);
  }

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

  /* Mobile responsive */
  @media (max-width: 768px) {
    .main-content {
      margin-left: 0;
      padding: 1rem;
    }
  }
</style>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if isAuthenticated}
  <div class="app-container">
    <GlobalHeader />
    <div class="content-container">
      <Sidebar />
      <main class="main-content">
        <slot />
      </main>
    </div>
  </div>
{:else if isInitialized}
	<div class="app-container">
    	<slot />
  </div>
{/if}
