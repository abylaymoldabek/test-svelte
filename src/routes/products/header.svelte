<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  function handleAdd() {
    dispatch('add');
  }
</script>

<div class="page-header">
  <h1 class="page-title">Товары</h1>
  <button class="btn-add" on:click={handleAdd}>
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
    Добавить товар
  </button>
</div>

<style>
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .page-title {
    font-size: 24px;
    color: #101828;
    font-weight: 500;
  }

  .btn-add {
    height: 44px;
    padding: 0 24px;
    background: #6366F1;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 400;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: background-color 0.2s ease;
  }

  .btn-add:hover {
    background: #5558d6;
  }

  .btn-add svg {
    width: 20px;
    height: 20px;
  }
</style>
