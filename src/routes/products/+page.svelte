<script lang="ts">
import { onMount, onDestroy } from 'svelte';
import { slide } from 'svelte/transition';
import { tokenPayload } from '$lib/stores/token.js';
import { useAuthGuard } from '$lib/utils/auth-guard.js';
import PageHeader from '$lib/components/PageHeader.svelte';

interface Product {
  id: string;
  name: string;
  created_at: string;
  gtin_number: string;
  company_id: string;
}

interface Page {
  Total: number;
  Limit: number;
  Offset: number;
  HasMore: boolean;
}

interface ProductResponse {
  products: Product[];
  page: Page;
}

let products: Product[] = [];
let currentPage = 1;
let itemsPerPage = 100;
let totalItems = 0;
let isLoading = false;
let hasMore = false;

async function fetchProducts() {
  isLoading = true;
  try {
    const params = new URLSearchParams({
      limit: itemsPerPage.toString(),
      offset: ((currentPage - 1) * itemsPerPage).toString()
    });
    
    // Add search filters
    if (search) {
      params.append('name', search);
    }

    if (gtinSearch) {
      params.append('gtin', gtinSearch);
    }

    // Handle sorting
    if (sortField) {
      params.append('sort_by', sortField === 'name' ? 'name' : 'created_at');
      params.append('sort_desc', sortOrder === 'Я-А' ? 'true' : 'false');
    }

    const response = await fetch(`/api/v1/products?${params.toString()}`);
    const data: ProductResponse = await response.json();
    
    if (data?.products && Array.isArray(data.products)) {
      products = data.products;
      totalItems = data.page.Total;
      hasMore = data.page.HasMore;
    } else {
      console.error('Unexpected data format:', data);
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

let authGuard: { isAuthorized: boolean; cleanup: () => void; checkAuth: () => Promise<boolean>; } | null = null;

onMount(() => {
  // Initialize auth guard
  authGuard = useAuthGuard('/products');
  
  fetchProducts();
});

onDestroy(() => {
  if (authGuard) {
    authGuard.cleanup();
  }
});

let search = '';
let gtinSearch = '';
let sortField = 'name';
let sortOrder: 'А-Я' | 'Я-А' = 'А-Я';
let activeSearch = '';

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
  window.location.href = `/products/${product.id}`;
}

function editProduct(product: Product) {
  window.location.href = `/products/${product.id}/edit`;
}

async function deleteProduct(product: Product) {
  if (!confirm(`Вы уверены, что хотите удалить продукт "${product.name}"?`)) {
    return;
  }

  try {
    const response = await fetch(`/api/v1/products/${product.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      // Удаляем продукт из локального массива
      products = products.filter(p => p.id !== product.id);
      // Обновляем общее количество
      totalItems--;
    } else {
      const errorData = await response.text();
      alert(`Ошибка при удалении продукта: ${errorData}`);
    }
  } catch (error) {
    console.error('Ошибка при удалении продукта:', error);
    alert('Произошла ошибка при удалении продукта');
  }
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
  background: #f8fafc;
  min-height: 100vh;
  max-width: 1400px;
  margin: 0 auto;
}

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

.btn-add {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #4b4bc7;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.btn-add:hover {
  background: #4040b2;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(75, 75, 199, 0.2);
}

.btn-add svg {
  transition: transform 0.2s ease;
}

.btn-add:hover svg {
  transform: scale(1.1);
}

.sort-button {
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  color: #374151;
  font-size: 0.875rem;
}

.sort-button:hover {
  background: #f9fafb;
}

.sort-button.active {
  background: #6366f1;
  color: white;
  border-color: #6366f1;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.pagination-button {
  padding: 0.625rem 1.25rem;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2.75rem;
  font-weight: 500;
  color: #4b5563;
  transition: all 0.2s ease;
}

.pagination-button:hover:not(:disabled) {
  border-color: #4b4bc7;
  color: #4b4bc7;
  background: #f8fafc;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(75, 75, 199, 0.1);
}

.pagination-button:disabled {
  background: #f1f5f9;
  cursor: not-allowed;
  color: #94a3b8;
  border-color: #e2e8f0;
}

.pagination-button.active {
  background: #4b4bc7;
  color: white;
  border-color: #4b4bc7;
  box-shadow: 0 2px 4px rgba(75, 75, 199, 0.2);
}

.pagination-button.active:hover {
  background: #4040b2;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(75, 75, 199, 0.2);
}

.pagination-info {
  color: #64748b;
  font-size: 0.875rem;
  padding: 0.5rem;
}

.loading, .empty-list {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
}

.empty-search {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: white;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.empty-search-content {
  text-align: center;
  padding: 2rem;
}

.empty-search-content .search-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: inline-block;
  opacity: 0.5;
}

.empty-search-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.empty-search-content p {
  color: #6b7280;
  font-size: 0.875rem;
}

.products-table {
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

.products-table:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 15px rgba(0, 0, 0, 0.1);
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

th {
  background: #f8fafc;
  padding: 1.5rem 1.25rem;
  font-weight: 600;
  color: #1f2937;
  border-bottom: 2px solid #e5e7eb;
  text-align: left;
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 10;
  transition: background-color 0.2s ease;
}

th:hover {
  background: #f1f5f9;
}

td {
  padding: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  color: #4b5563;
  transition: all 0.2s ease;
}

tbody tr {
  transition: all 0.2s ease;
  cursor: pointer;
}

tbody tr:hover {
  background: #f8fafc;
  transform: translateY(-1px);
}

tbody tr:hover td {
  color: #1e293b;
  border-bottom-color: #d1d5db;
}

tbody tr:last-child td {
  border-bottom: none;
}



.th-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
  min-width: 200px;
}

.th-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  transition: all 0.2s;
  user-select: none;
  font-weight: 500;
  color: #374151;
  position: relative;
}

.th-title:hover {
  background: #f1f5f9;
  color: #4f46e5;
}

.th-title:active {
  background: #e0e7ff;
}

.th-search-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background: white;
  padding: 0.75rem;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  z-index: 10;
  border: 1px solid #e5e7eb;
  backdrop-filter: blur(8px);
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.th-search-input {
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.875rem;
  width: 100%;
  outline: none;
  background: #f8fafc url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'/%3e%3c/svg%3e") no-repeat left 0.75rem center;
  background-size: 1.25rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #1e293b;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.th-search-input:hover {
  border-color: #3b82f6;
  background-color: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.th-search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  background-color: white;
  transform: translateY(-1px);
}

.th-search-input::placeholder {
  color: #94a3b8;
  font-weight: 400;
  font-style: italic;
}

th .sort-button {
  padding: 0.5rem;
  border: none;
  background: none;
  cursor: pointer;
  color: #64748b;
  font-size: 1rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  margin-left: auto;
}

th .sort-button:hover {
  color: #4f46e5;
  background: #e0e7ff;
  transform: scale(1.1);
}

th .sort-button.active {
  color: #4f46e5;
  background: #e0e7ff;
  font-weight: 600;
}

.button-group {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  display: inline-block;
  padding: 0.625rem 1.25rem;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.edit-button {
  background: #4b4bc7;
}

.edit-button:hover {
  background: #4040b2;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(75, 75, 199, 0.2);
}

.delete-button {
  background: #dc2626;
  border: none;
  cursor: pointer;
}

.delete-button:hover {
  background: #b91c1c;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(220, 38, 38, 0.2);
}
</style>

{#if $tokenPayload}
<div class="products-page">
  <PageHeader title="Продукты">
    <button class="btn-add" on:click={() => window.location.href = '/products/new'}>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
      Добавить продукт
    </button>
  </PageHeader>

  {#if isLoading}
    <div class="loading">Загрузка...</div>
  {:else if !products || products.length === 0}
    <div class="empty-list">
      <div class="empty-list-content">
        <span class="list-icon">📦</span>
        <h3>Список продуктов пуст</h3>
        <p>На данный момент нет добавленных продуктов</p>
      </div>
    </div>
  {:else}
        {#if products.length === 0 && (search || gtinSearch)}
      <div class="empty-search">
        <div class="empty-search-content">
          <span class="search-icon">🔍</span>
          <h3>Ничего не найдено</h3>
          {#if search}
            <p>По запросу "{search}" ничего не найдено</p>
          {:else if gtinSearch}
            <p>По GTIN "{gtinSearch}" ничего не найдено</p>
          {/if}
        </div>
      </div>
    {:else}
      <div class="products-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>
                <div class="th-content">
                  <div 
                  class="th-title" 
                  on:click={() => {
                    activeSearch = activeSearch === 'name' ? '' : 'name';
                    if (activeSearch !== 'name') {
                      search = '';
                      debouncedFetch();
                    }
                  }}
                >
                  <span>Name</span>
                  <button 
                    class="sort-button" 
                    class:active={sortField === 'name'}
                    on:click|stopPropagation={() => setSortField('name')}
                  >
                    {sortOrder === 'А-Я' ? '↓' : '↑'}
                  </button>
                </div>
                {#if activeSearch === 'name'}
                  <div class="th-search-dropdown" transition:slide>
                    <input
                      type="text"
                      placeholder="Поиск по имени..."
                      bind:value={search}
                      on:input={() => {
                        currentPage = 1;
                        debouncedFetch();
                      }}
                      class="th-search-input"
                    />
                  </div>
                {/if}
              </div>
            </th>
            <th>
              <div class="th-content">
                <div class="th-title">
                  <span>Created at</span>
                  <button 
                    class="sort-button" 
                    class:active={sortField === 'created_at'}
                    on:click={() => setSortField('created_at')}
                  >
                    {sortOrder === 'А-Я' ? '↓' : '↑'}
                  </button>
                </div>
              </div>
            </th>
            <th>
              <div class="th-content">
                <div 
                  class="th-title" 
                  on:click={() => activeSearch = activeSearch === 'gtin' ? '' : 'gtin'}
                >
                  <span>GTIN</span>
                </div>
                {#if activeSearch === 'gtin'}
                  <div class="th-search-dropdown" transition:slide>
                    <input
                      type="text"
                      placeholder="Поиск по GTIN..."
                      bind:value={gtinSearch}
                      on:input={debouncedFetch}
                      class="th-search-input"
                    />
                  </div>
                {/if}
              </div>
            </th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
            {#each products as product (`${product.id}-${product.company_id}`)}
              <tr>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{new Date(product.created_at).toLocaleString()}</td>
                <td>{product.gtin_number}</td>
                <td>
                  <div class="button-group">
                    <a 
                      href={`/products/${product.id}/edit?company_id=${product.company_id}`}
                      class="action-button edit-button"
                    >
                      Редактировать
                    </a>
                    <button 
                      class="action-button delete-button"
                      on:click={() => deleteProduct(product)}
                    >
                      Удалить
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
  
        {#if products.length > 0}
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
        {/if}
      </div>
    {/if}
  {/if}
</div>
{:else}
<div class="loading-container">
  <div class="loading-spinner"></div>
  <p>Проверка авторизации...</p>
</div>
{/if}