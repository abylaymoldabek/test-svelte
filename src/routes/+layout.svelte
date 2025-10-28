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

  /* Tablet and iPad responsive */
  @media (min-width: 769px) and (max-width: 1024px) {
    .main-content {
      margin-left: 200px; /* Увеличенный сайдбар на планшетах */
      padding: 1.5rem;
    }
  }

  /* iPad Portrait (768x1024) */
  @media (min-width: 768px) and (max-width: 1024px) and (orientation: portrait) {
    .main-content {
      margin-left: 0;
      padding: 1.25rem;
    }
  }

  /* iPad Landscape (1024x768) */
  @media (min-width: 1024px) and (max-width: 1366px) and (orientation: landscape) {
    .main-content {
      margin-left: 220px;
      padding: 2rem;
    }
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .main-content {
      margin-left: 0;
      margin-top: 60px;
      padding: 1rem;
    }
  }

  @media (max-width: 480px) {
    .main-content {
      padding: 0.75rem;
      margin-top: 50px;
    }
  }

  /* Глобальные планшетные стили */
  @media (min-width: 768px) and (max-width: 1024px) {
    :global(body) {
      font-size: 15px;
    }
    
    :global(h1) {
      font-size: 2rem;
    }
    
    :global(h2) {
      font-size: 1.5rem;
    }
    
    :global(h3) {
      font-size: 1.25rem;
    }
    
    :global(input, select, textarea) {
      font-size: 16px !important; /* Предотвращает зум на iPad */
      min-height: 44px; /* Комфортное касание на iPad */
    }
    
    :global(button) {
      min-height: 48px; /* Увеличенная область касания для планшетов */
      padding: 0.75rem 1.5rem;
    }
    
    :global(table) {
      font-size: 0.95rem; /* Оптимальный размер для планшетов */
    }

    /* Улучшенное сенсорное управление для iPad */
    :global(button, a, [role="button"]) {
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
    }

    :global(input, select, textarea) {
      appearance: none;
      -webkit-appearance: none;
      border-radius: 8px;
    }

    :global(input[type="range"]) {
      appearance: none;
      -webkit-appearance: none;
      height: 44px;
    }

    :global(*) {
      scrollbar-width: thin;
    }

    :global(*::-webkit-scrollbar) {
      width: 8px;
      height: 8px;
    }

    :global(*::-webkit-scrollbar-track) {
      background: #f1f1f1;
      border-radius: 4px;
    }

    :global(*::-webkit-scrollbar-thumb) {
      background: #c1c1c1;
      border-radius: 4px;
    }

    :global(*::-webkit-scrollbar-thumb:hover) {
      background: #a8a8a8;
    }
  }

  /* Глобальные мобильные стили */
  @media (max-width: 768px) {
    :global(body) {
      font-size: 14px;
    }
    
    :global(h1) {
      font-size: 1.5rem;
    }
    
    :global(h2) {
      font-size: 1.25rem;
    }
    
    :global(h3) {
      font-size: 1.125rem;
    }
    
    :global(input, select, textarea) {
      font-size: 16px !important; /* Предотвращает зум на iOS */
    }
    
    :global(button) {
      min-height: 44px; /* Минимальная область касания на мобильных */
    }
  }

  @media (max-width: 480px) {
    :global(h1) {
      font-size: 1.25rem;
    }
    
    :global(h2) {
      font-size: 1.125rem;
    }
    
    :global(h3) {
      font-size: 1rem;
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
