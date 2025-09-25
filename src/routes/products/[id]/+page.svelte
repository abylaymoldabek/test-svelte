<script lang="ts">
import { onMount } from 'svelte';

interface Product {
  id: string;
  name: string;
  created_at: string;
  gtin_number: string;
  company_id: string;
}

export let data;

let product: Product | null = null;
let isLoading = true;

async function fetchProduct(id: string) {
  isLoading = true;
  try {
    const response = await fetch(`/api/v1/products/${id}`);
    const data = await response.json();
    product = data;
  } catch (error) {
    console.error('Error fetching product:', error);
  } finally {
    isLoading = false;
  }
}

onMount(async () => {
  const id = window.location.pathname.split('/').pop();
  if (id) {
    await fetchProduct(id);
  }
});
</script>

<style>
.product-page {
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
}

.header {
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.edit-button {
  padding: 0.5rem 1rem;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
  font-weight: 500;
}

.edit-button:hover {
  background: #4338ca;
}

.back-button {
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  color: #374151;
  font-size: 0.875rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.back-button:hover {
  background: #f8fafc;
  border-color: #4f46e5;
  color: #4f46e5;
}

h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.product-details {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}

.details-grid {
  display: grid;
  gap: 1.5rem;
}

.detail-row {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  border-radius: 8px;
  background: #f8fafc;
  transition: background-color 0.2s;
}

.detail-row:hover {
  background: #f1f5f9;
}

.label {
  color: #4b5563;
  font-weight: 500;
}

.value {
  color: #111827;
  font-weight: 500;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #6b7280;
}
</style>

<div class="product-page">
  <div class="header">
    <div style="display: flex; align-items: center; gap: 1rem;">
      <a href="/products" class="back-button">
        ← Назад к списку
      </a>
      <h1>{product?.name || 'Загрузка...'}</h1>
    </div>
    <button class="edit-button" on:click={() => window.location.href = `/products/${product?.id}/edit`}>
      Редактировать
    </button>
  </div>

  {#if isLoading}
    <div class="loading">Загрузка...</div>
  {:else if product}
    <div class="product-details">
      <div class="details-grid">
        <div class="detail-row">
          <span class="label">ID</span>
          <span class="value">{product.id}</span>
        </div>
        <div class="detail-row">
          <span class="label">Название</span>
          <span class="value">{product.name}</span>
        </div>
        <div class="detail-row">
          <span class="label">GTIN</span>
          <span class="value">{product.gtin_number}</span>
        </div>
        <div class="detail-row">
          <span class="label">Компания</span>
          <span class="value">{product.company_id}</span>
        </div>
        <div class="detail-row">
          <span class="label">Создан</span>
          <span class="value">
            {new Date(product.created_at).toLocaleDateString()} 
            {new Date(product.created_at).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  {:else}
    <div class="error">
      Продукт не найден
    </div>
  {/if}
</div>
