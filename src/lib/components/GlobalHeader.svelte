<script lang="ts">
  import { tokenPayload } from '$lib/stores/token.js';
  import { authStore } from '$lib/stores/auth.js';
  
  // Функция выхода
  function logout() {
    authStore.logout();
  }
</script>

<header class="global-header">
  <div class="header-content">
    <!-- Логотип -->
    <div class="logo-section">
      <img src="/okto-logo-original.png" alt="OKTO" class="logo" />
    </div>
    
    <!-- Информация о пользователе -->
    {#if $tokenPayload}
      <div class="user-section">
        <div class="user-info">
          <span class="user-name">{$tokenPayload.name || 'Пользователь'}</span>
          <span class="user-role">{$tokenPayload.role || 'user'}</span>
        </div>
        <button class="logout-btn" on:click={logout} aria-label="Выйти" title="Выйти">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
        </button>
      </div>
    {/if}
  </div>
</header>

<style>
  .global-header {
    background: #1e40af;
    color: white;
    height: 60px;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    padding: 0 2rem;
    max-width: 100%;
  }

  .logo-section {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .logo {
    height: 32px;
    width: auto;
  }

  .logo-text {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
  }

  .user-section {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .user-info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    text-align: right;
  }

  .user-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: white;
  }

  .user-role {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.8);
    text-transform: capitalize;
  }

  .logout-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    padding: 0.5rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logout-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .logout-btn:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5);
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .header-content {
      padding: 0 1rem;
    }

    .logo-text {
      font-size: 1.25rem;
    }

    .user-info {
      display: none;
    }

    .user-section {
      gap: 0.5rem;
    }
  }

  @media (max-width: 480px) {
    .logo-section {
      gap: 0.5rem;
    }

    .logo {
      height: 24px;
    }

    .logo-text {
      font-size: 1rem;
    }
  }
</style>
