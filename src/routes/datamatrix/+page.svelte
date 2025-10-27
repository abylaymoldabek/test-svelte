<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { tokenPayload } from '$lib/stores/token.js';
  import { useAuthGuard } from '$lib/utils/auth-guard.js';

  let authGuard: { isAuthorized: boolean; cleanup: () => void; checkAuth: () => Promise<boolean>; } | null = null;

  onMount(() => {
    authGuard = useAuthGuard('/datamatrix');
  });

  onDestroy(() => {
    if (authGuard) {
      authGuard.cleanup();
    }
  });
</script>

{#if $tokenPayload}
<div class="datamatrix-page">
  <div class="content">
    <p>Здесь будет содержимое страницы Data Matrix кодов</p>
  </div>
</div>
{:else}
<div class="loading-container">
  <div class="loading-spinner"></div>
  <p>Проверка авторизации...</p>
</div>
{/if}

<style>
  .loading-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: #f8fafc;
    gap: 1rem;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e5e7eb;
    border-top: 4px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-container p {
    color: #6b7280;
    font-size: 1rem;
    margin: 0;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>
