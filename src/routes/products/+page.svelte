<script lang="ts">
import { onMount } from 'svelte';
import { productService } from '$lib/services/product';

interface Product {
  id: string;
  name: string;
  created_at: string;
  gtin_number: string;
  company_id: string;
  updated_at: string;
  picture?: string;
}

interface ProductResponse {
  items: Product[];
  total: number;
}

let products: Product[] = [];
let totalItems = 0;
let isLoading = false;

async function fetchProducts() {
  isLoading = true;
  try {
    const params = new URLSearchParams({
      limit: itemsPerPage.toString(),
      offset: ((currentPage - 1) * itemsPerPage).toString()
    });
    
    if (search) {
      params.append('name', search);
    }

    if (sortField === 'name') {
      params.append('sort', sortOrder === 'А-Я' ? 'name_asc' : 'name_desc');
    } else if (sortField === 'date') {
      params.append('sort', sortOrder === 'А-Я' ? 'date_asc' : 'date_desc');
    }

    const response = await fetch(`/api/v1/products`);
    const allData = await response.json();
    
    if (Array.isArray(allData)) {
      totalItems = allData.length;
      
      // Фильтрация по поиску
      let filteredData = allData;
      if (search) {
        filteredData = allData.filter(item => 
          item.name.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      // Сортировка
      if (sortField === 'name') {
        filteredData.sort((a, b) => {
          const comp = a.name.localeCompare(b.name);
          return sortOrder === 'А-Я' ? comp : -comp;
        });
      } else if (sortField === 'date') {
        filteredData.sort((a, b) => {
          const comp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          return sortOrder === 'А-Я' ? comp : -comp;
        });
      }
      
      // Пагинация
      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      products = filteredData.slice(start, end);
      totalItems = filteredData.length;
    } else {
      console.error('Unexpected data format:', allData);
      products = [];
      totalItems = 0;
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    products = [];
    totalItems = 0;
  } finally {
    isLoading = false;
  }
}

let debounceTimer: number;
function debouncedFetch() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    fetchProducts();
  }, 300);
}

onMount(() => {
  fetchProducts();
});

let selected: Product | null = null;
let search = '';
let sortField = 'name';
let sortOrder: 'А-Я' | 'Я-А' = 'А-Я';
let currentPage = 1;
let itemsPerPage = 10;

$: totalPages = Math.ceil(totalItems / itemsPerPage);

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages) {
    currentPage = page;
    fetchProducts();
  }
}

function nextPage() {
  goToPage(currentPage + 1);
}

function prevPage() {
  goToPage(currentPage - 1);
}

function generatePagination(current: number, total: number) {
  const pages = [];
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  
  if (current <= 3) {
    pages.push(1, 2, 3, '...', total - 1, total);
  } else if (current >= total - 2) {
    pages.push(1, '...', total - 2, total - 1, total);
  } else {
    pages.push(1, '...', current - 1, current, current + 1, '...', total);
  }
  
  return pages;
}

$: {
  debouncedFetch();
}

function selectProduct(product: Product) {
  selected = product;
}

function setSortField(field: string) {
  if (sortField === field) {
    sortOrder = sortOrder === 'А-Я' ? 'Я-А' : 'А-Я';
  } else {
    sortField = field;
    sortOrder = 'А-Я';
  }
  currentPage = 1;
  fetchProducts();
}
</script>

<style>
.products-page {
  padding: 2rem;
}

.header {
  margin-bottom: 2rem;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  align-items: center;
}

.search-input {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  min-width: 300px;
}

.sort-buttons {
  display: flex;
  gap: 0.5rem;
}

.sort-button {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.sort-button.active {
  background: #4f46e5;
  color: white;
  border-color: #4f46e5;
}

.products-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.products-list {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 1rem;
  max-height: 80vh;
  overflow-y: auto;
}

.product-item {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.product-item:hover {
  background: #f8fafc;
}

.product-item.selected {
  background: #f0f7ff;
}

.product-item-content {
  display: flex;
  gap: 1rem;
}

.product-image {
  width: 64px;
  height: 64px;
  background: #f0f0f0;
  border-radius: 8px;
  flex-shrink: 0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.product-info {
  flex: 1;
}

.product-name {
  font-weight: 600;
  margin-bottom: 0.5rem;
  word-break: break-word;
}

.product-details {
  font-size: 0.875rem;
  color: #666;
  display: grid;
  gap: 0.25rem;
}

.product-details-card {
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 2rem;
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.details-grid {
  display: grid;
  gap: 1rem;
  margin-top: 1.5rem;
}

.detail-row {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem;
  align-items: center;
}

.label {
  color: #666;
  font-weight: 500;
}

.empty-details {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 2rem;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 1rem;
  border-top: 1px solid #eee;
}

.pagination-button {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
}

.pagination-button:disabled {
  background: #f1f5f9;
  cursor: not-allowed;
  color: #94a3b8;
}

.pagination-button.active {
  background: #4f46e5;
  color: white;
  border-color: #4f46e5;
}

.pagination-info {
  color: #64748b;
  font-size: 0.875rem;
}

.loading, .empty-list {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
}
</style>

<div class="products-page">
  <div class="header">
    <h1>Продукты</h1>
    <div class="filters">
      <input
        type="text"
        placeholder="Поиск по названию..."
        bind:value={search}
        class="search-input"
      />
      <div class="sort-buttons">
        <button
          class="sort-button"
          class:active={sortField === 'name'}
          on:click={() => setSortField('name')}
        >
          Название {sortField === 'name' ? (sortOrder === 'А-Я' ? '↓' : '↑') : ''}
        </button>
        <button
          class="sort-button"
          class:active={sortField === 'date'}
          on:click={() => setSortField('date')}
        >
          Дата {sortField === 'date' ? (sortOrder === 'А-Я' ? '↓' : '↑') : ''}
        </button>
      </div>
    </div>
  </div>

  {#if isLoading}
    <div class="loading">Загрузка...</div>
  {:else if !products || products.length === 0}
    <div class="empty-list">
      Нет продуктов
      <pre>Debug: isLoading={isLoading}, products={JSON.stringify(products)}</pre>
    </div>
  {:else}
    <div class="products-container">
      <div class="products-list">
        {#each products as product (product.id)}
          <div
            class="product-item"
            class:selected={selected?.id === product.id}
            on:click={() => selectProduct(product)}
          >
            <div class="product-item-content">
              <div class="product-image">
                {#if product.picture}
                  <img src={product.picture} alt={product.name} />
                {/if}
              </div>
              <div class="product-info">
                <div class="product-name">{product.name}</div>
                <div class="product-details">
                  <div>GTIN: {product.gtin_number}</div>
                  <div>
                    Создан: {new Date(product.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        {/each}

        <div class="pagination">
          <button
            class="pagination-button"
            disabled={currentPage === 1}
            on:click={prevPage}
          >
            ←
          </button>

          {#if totalPages <= 7}
            {#each Array(totalPages) as _, i}
              <button
                class="pagination-button"
                class:active={currentPage === i + 1}
                on:click={() => goToPage(i + 1)}
              >
                {i + 1}
              </button>
            {/each}
          {:else}
            {#each generatePagination(currentPage, totalPages) as page}
              {#if page === '...'}
                <span class="pagination-info">...</span>
              {:else}
                <button
                  class="pagination-button"
                  class:active={currentPage === page}
                  on:click={() => typeof page === 'number' && goToPage(page)}
                >
                  {page}
                </button>
              {/if}
            {/each}
          {/if}

          <button
            class="pagination-button"
            disabled={currentPage === totalPages}
            on:click={nextPage}
          >
            →
          </button>
        </div>
      </div>

      <div class="product-details-card">
        {#if selected}
          <h2>{selected.name}</h2>
          <div class="details-grid">
            <div class="detail-row">
              <span class="label">ID:</span>
              <span>{selected.id}</span>
            </div>
            <div class="detail-row">
              <span class="label">GTIN:</span>
              <span>{selected.gtin_number}</span>
            </div>
            <div class="detail-row">
              <span class="label">Компания:</span>
              <span>{selected.company_id}</span>
            </div>
            <div class="detail-row">
              <span class="label">Создан:</span>
              <span
                >{new Date(selected.created_at).toLocaleDateString()} {new Date(
                  selected.created_at
                ).toLocaleTimeString()}</span>
            </div>
            {#if selected.updated_at && selected.updated_at !== '0001-01-01T00:00:00Z'}
              <div class="detail-row">
                <span class="label">Обновлен:</span>
                <span
                  >{new Date(selected.updated_at).toLocaleDateString()} {new Date(
                    selected.updated_at
                  ).toLocaleTimeString()}</span>
              </div>
            {/if}
            {#if selected.picture}
              <div class="detail-row">
                <span class="label">Изображение:</span>
                <img
                  src={selected.picture}
                  alt={selected.name}
                  style="max-width: 200px; border-radius: 8px;"
                />
              </div>
            {/if}
          </div>
        {:else}
          <div class="empty-details">
            Выберите продукт для просмотра подробной информации
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>