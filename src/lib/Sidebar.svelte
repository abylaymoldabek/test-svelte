<script lang="ts">
// Можно добавить логику авторизации или активного пункта
</script>

<nav class="sidebar">
  <ul>
    <li><a href="/dashboard">Первые шаги</a></li>
    <li><a href="/analytics">Аналитика производства</a></li>
    <li><a href="/products">Продукты</a></li>
    <li><a href="/orders">СУЗ заказы</a></li>
    <li><a href="/reports">Отчёты</a></li>
    <li><a href="/integrations">Интеграции</a></li>
    <li><a href="/production">Производство</a></li>
    <li><a href="/supplies">Поставки</a></li>
    <li><a href="/datamatrix">Data Matrix коды</a></li>
    <li><a href="/settings">Настройки компании</a></li>
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
}
.sidebar li {
  margin-bottom: 1.2rem;
}
.sidebar a {
  color: #fff;
  text-decoration: none;
  font-size: 1.1rem;
  padding: 0.7rem 2rem;
  display: block;
  border-radius: 6px;
  transition: background 0.2s;
}
.sidebar a:hover, .sidebar a.active {
  background: #6366f1;
}
</style>
