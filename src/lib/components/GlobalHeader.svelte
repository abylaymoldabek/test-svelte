<script lang="ts">
  import { tokenPayload } from '$lib/stores/token.js';
  import { authStore } from '$lib/stores/auth.js';
  import { page } from '$app/stores';
  
  let isMobileMenuOpen = false;
  
  // Функция выхода
  function logout() {
    authStore.logout();
  }
  
  // Переключение мобильного меню
  function toggleMobileMenu() {
    isMobileMenuOpen = !isMobileMenuOpen;
  }
  
  // Закрытие мобильного меню
  function closeMobileMenu() {
    isMobileMenuOpen = false;
  }
</script>

<header class="global-header">
  <div class="header-content">
    <!-- Burger меню для мобильных -->
    <button class="burger-menu" on:click={toggleMobileMenu} aria-label="Меню">
      <span class="burger-line" class:active={isMobileMenuOpen}></span>
      <span class="burger-line" class:active={isMobileMenuOpen}></span>
      <span class="burger-line" class:active={isMobileMenuOpen}></span>
    </button>
    
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
  
  <!-- Мобильное меню -->
  {#if isMobileMenuOpen}
    <div class="mobile-menu" class:open={isMobileMenuOpen}>
      <nav class="mobile-nav">
        <ul>
          <li>
            <a 
              href="/reposts_vetis" 
              class="mobile-nav-link"
              class:active={$page.url.pathname === '/reposts_vetis'}
              on:click={closeMobileMenu}
            >
              <span class="icon">📊</span>
              Отчеты ВетИС
            </a>
          </li>
          <li>
            <a 
              href="/settings" 
              class="mobile-nav-link"
              class:active={$page.url.pathname === '/settings'}
              on:click={closeMobileMenu}
            >
              <span class="icon">⚙️</span>
              Настройки компании
            </a>
          </li>
        </ul>
      </nav>
    </div>
  {/if}
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

  .burger-menu {
    display: none;
    flex-direction: column;
    justify-content: space-around;
    width: 24px;
    height: 20px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    z-index: 1001;
  }

  .burger-line {
    width: 100%;
    height: 2px;
    background-color: white;
    transition: all 0.3s ease;
    transform-origin: center;
  }

  .burger-line.active:nth-child(1) {
    transform: rotate(45deg) translate(5px, 5px);
  }

  .burger-line.active:nth-child(2) {
    opacity: 0;
  }

  .burger-line.active:nth-child(3) {
    transform: rotate(-45deg) translate(7px, -6px);
  }

  .mobile-menu {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    background: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 999;
    max-height: calc(100vh - 60px);
    overflow-y: auto;
    display: none;
  }

  .mobile-menu.open {
    display: block;
  }

  .mobile-nav ul {
    list-style: none;
    margin: 0;
    padding: 1rem;
  }

  .mobile-nav li {
    margin-bottom: 0.5rem;
  }

  .mobile-nav-link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #4b5563;
    text-decoration: none;
    padding: 1rem;
    border-radius: 8px;
    transition: all 0.2s ease;
    font-weight: 500;
    font-size: 1rem;
    min-height: 44px;
  }

  .mobile-nav-link:hover {
    background: #f3f4f6;
    color: #4b4bc7;
  }

  .mobile-nav-link.active {
    background: #4b4bc7;
    color: white;
  }

  .mobile-nav-link .icon {
    font-size: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  /* Tablet responsive */
  @media (min-width: 769px) and (max-width: 1024px) {
    .header-content {
      padding: 0 1.5rem;
    }
    
    .logo {
      height: 36px;
    }
    
    .user-info {
      display: flex; /* Показываем на планшетах */
    }
    
    .user-name {
      font-size: 1rem;
    }
    
    .logout-btn {
      padding: 0.625rem;
    }
  }

  /* iPad Portrait - показываем burger menu */
  @media (min-width: 768px) and (max-width: 1024px) and (orientation: portrait) {
    .burger-menu {
      display: flex;
    }
    
    .user-info {
      display: none;
    }
  }

  /* iPad Landscape - полный header */
  @media (min-width: 1024px) and (max-width: 1366px) and (orientation: landscape) {
    .header-content {
      padding: 0 2rem;
    }
    
    .logo {
      height: 38px;
    }
    
    .user-name {
      font-size: 1rem;
    }
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .header-content {
      padding: 0 1rem;
    }

    .burger-menu {
      display: flex;
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

    .global-header {
      height: 50px;
    }

    .mobile-menu {
      top: 50px;
      max-height: calc(100vh - 50px);
    }
  }
</style>
