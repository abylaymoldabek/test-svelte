<!--
  @component
  Navigation bar component that appears on all pages
-->
<script lang="ts">
  import { page } from '$app/stores';
</script>

<nav>
  <div class="nav-container">
    <div class="logo">
      <a href="/">
        <img src="/okto-logo.svg" alt="Okto Logo" />
      </a>
    </div>
    <div class="nav-links">
      <a 
        href="/" 
        class="nav-link" 
        class:active={$page.url.pathname === '/'}
      >
        Главная
      </a>
      <a 
        href="/products" 
        class="nav-link" 
        class:active={$page.url.pathname.startsWith('/products')}
      >
        Продукты
      </a>
    </div>
  </div>
</nav>

<style>
  nav {
    background: white;
    border-bottom: 1px solid #e5e7eb;
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .nav-container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 1rem 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .logo {
    height: 2rem;
  }

  .logo img {
    height: 100%;
    width: auto;
  }

  .nav-links {
    display: flex;
    gap: 2rem;
  }

  .nav-link {
    text-decoration: none;
    color: #4b5563;
    font-weight: 500;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    transition: all 0.2s;
  }

  .nav-link:hover {
    color: #4f46e5;
    background: #f3f4f6;
  }

  .nav-link.active {
    color: #4f46e5;
    background: #eff6ff;
  }
</style>
