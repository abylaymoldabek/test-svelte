<script lang="ts">
  import { page } from '$app/stores';
</script>

<nav class="sidebar">
  <ul>
    <li>
      <a 
        href="/dashboard" 
        class="nav-link"
        class:active={$page.url.pathname === '/dashboard'}
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
    </li>
    <li>
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
    </li>
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
    width: 220px;
    background: #4f46e5;
    color: #fff;
    min-height: 100vh;
    padding: 2rem 0 2rem 0;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 10;
  }

  .sidebar ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .sidebar li {
    margin-bottom: 1.2rem;
    padding: 0 1rem;
  }

  .nav-link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #fff;
    text-decoration: none;
    font-size: 1.1rem;
    padding: 0.7rem 2rem;
    border-radius: 6px;
    transition: background 0.2s;
    font-weight: 500;
  }

  .nav-link:hover, .nav-link.active {
    background: #6366f1;
  }

  .icon {
    font-size: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
