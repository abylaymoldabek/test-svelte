<script lang="ts">
  import { page } from '$app/stores';
</script>

<nav class="sidebar">
  <ul>
    <!-- <li>
      <a 
        href="/onboarding" 
        class="nav-link"
        class:active={$page.url.pathname === '/onboarding'}
      >
        <span class="icon">📊</span>
        Первые шаги
      </a>
    </li>
    <li>
      <a 
        href="/analytics" 
        class="nav-link"
        class:active={$page.url.pathname === '/analytics'}
      >
        <span class="icon">📈</span>
        Аналитика производства
      </a>
    </li>
    <li>
      <a 
        href="/products" 
        class="nav-link"
        class:active={$page.url.pathname.startsWith('/products')}
      >
        <span class="icon">📦</span>
        Продукты
      </a>
    </li>
    <li>
      <a 
        href="/orders" 
        class="nav-link"
        class:active={$page.url.pathname === '/orders'}
      >
        <span class="icon">📝</span>
        СУЗ заказы
      </a>
    </li>
    <li>
      <a 
        href="/reports" 
        class="nav-link"
        class:active={$page.url.pathname === '/reports'}
      >
        <span class="icon">📊</span>
        Отчёты
      </a>
    </li> -->
    <li>
      <a 
        href="/reposts_vetis" 
        class="nav-link"
        class:active={$page.url.pathname === '/reposts_vetis'}
      >
        <span class="icon">📊</span>
        Отчеты ветис
      </a>
    </li>
    <!-- <li>
      <a 
        href="/integrations" 
        class="nav-link"
        class:active={$page.url.pathname === '/integrations'}
      >
        <span class="icon">🔄</span>
        Интеграции
      </a>
    </li>
    <li>
      <a 
        href="/production" 
        class="nav-link"
        class:active={$page.url.pathname === '/production'}
      >
        <span class="icon">🏭</span>
        Производство
      </a>
    </li>
    <li>
      <a 
        href="/supplies" 
        class="nav-link"
        class:active={$page.url.pathname === '/supplies'}
      >
        <span class="icon">📦</span>
        Поставки
      </a>
    </li>
    <li>
      <a 
        href="/datamatrix" 
        class="nav-link"
        class:active={$page.url.pathname === '/datamatrix'}
      >
        <span class="icon">🔢</span>
        Data Matrix коды
      </a>
    </li>  -->
    <li>
      <a 
        href="/settings" 
        class="nav-link"
        class:active={$page.url.pathname === '/settings'}
      >
        <span class="icon">⚙️</span>
        Настройки компании
      </a>
    </li>
  </ul>
</nav>

<style>
  .sidebar {
    width: 180px;
    background: white;
    min-height: calc(100vh - 60px); /* Учитываем глобальный заголовок */
    padding: 1rem 0;
    position: fixed;
    left: 0;
    top: 60px; /* Начинаем под глобальным заголовком */
    z-index: 50;
    border-right: 1px solid #e5e7eb;
    box-shadow: 2px 0 4px rgba(0, 0, 0, 0.05);
  }

  .sidebar ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .sidebar li {
    margin-bottom: 0.125rem;
    padding: 0 0.5rem;
  }

  .nav-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #4b5563;
    text-decoration: none;
    font-size: 0.75rem;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    transition: all 0.2s ease;
    font-weight: 500;
    line-height: 1.2;
  }

  .nav-link:hover {
    background: #f3f4f6;
    color: #4b4bc7;
    transform: translateX(1px);
  }

  .nav-link.active {
    background: #4b4bc7;
    color: white;
    transform: translateX(1px);
  }

  .nav-link.active:hover {
    background: #4040b2;
  }

  .icon {
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.9;
    flex-shrink: 0;
  }

  /* Tablet responsive */
  @media (min-width: 769px) and (max-width: 1024px) {
    .sidebar {
      width: 200px; /* Увеличенная ширина на планшетах */
    }
    
    .nav-link {
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
    }
    
    .icon {
      font-size: 1.125rem;
    }
  }

  /* iPad Portrait */
  @media (min-width: 768px) and (max-width: 1024px) and (orientation: portrait) {
    .sidebar {
      display: none; /* Скрываем в портретной ориентации iPad */
    }
  }

  /* iPad Landscape */
  @media (min-width: 1024px) and (max-width: 1366px) and (orientation: landscape) {
    .sidebar {
      width: 220px;
    }
    
    .nav-link {
      padding: 0.875rem 1.25rem;
      font-size: 0.9rem;
    }
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .sidebar {
      display: none; /* Скрываем на мобильных устройствах */
    }
  }
</style>
