<script lang="ts">
import { onMount } from 'svelte';
import { productService } from '$lib/services/product';
import { slide } from 'svelte/transition';

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
let itemsPerPage = 10;
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
      params.append('search_by', 'name');
      params.append('search_value', search);
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

onMount(() => {
  fetchProducts();
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
}

.header {
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}

h1 {
  font-size: 1.25rem;
  font-weight: 500;
  color: #111827;
  margin-bottom: 1rem;
}

.filters {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.sort-buttons {
  display: flex;
  gap: 0.5rem;
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
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 2rem;
  height: fit-content;
  position: sticky;
  top: 2rem;
  margin-top: 2rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}

.product-details-card h2 {
  color: #111827;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.details-grid {
  display: grid;
  gap: 1.25rem;
}

.detail-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 1rem;
  align-items: center;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.detail-row:hover {
  background-color: #f8fafc;
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
  margin-top: 1.5rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.pagination-button {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  font-weight: 500;
  color: #4b5563;
  transition: all 0.2s;
}

.pagination-button:hover:not(:disabled) {
  border-color: #4f46e5;
  color: #4f46e5;
  background: #eff6ff;
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

.pagination-button.active:hover {
  background: #4338ca;
}

.pagination-info {
  color: #64748b;
  font-size: 0.875rem;
  padding: 0.5rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.active {
  background: #dcfce7;
  color: #166534;
}

.status-badge.blocked {
  background: #fee2e2;
  color: #991b1b;
}

.loading, .empty-list {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
}

.products-table {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background: #f8fafc;
  padding: 1.25rem 1rem;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
  text-align: left;
  white-space: nowrap;
}

td {
  padding: 1.25rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  color: #4b5563;
  transition: all 0.2s;
}

tbody tr {
  transition: all 0.2s;
  cursor: pointer;
}

tbody tr:hover {
  background: #f8fafc;
}

tbody tr:hover td {
  color: #1e293b;
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
  padding: 0.625rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  width: 100%;
  outline: none;
  background: #f8fafc;
  transition: all 0.2s;
  color: #1e293b;
}

.th-search-input:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  background: white;
}

.th-search-input::placeholder {
  color: #94a3b8;
  font-weight: 400;
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
</style>

<div class="products-page">
  <div class="header">
    <h1>Продукты</h1>
  </div>

  {#if isLoading}
    <div class="loading">Загрузка...</div>
  {:else if !products || products.length === 0}
    <div class="empty-list">
      Нет продуктов
      <pre>Debug: isLoading={isLoading}, products={JSON.stringify(products)}</pre>
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
                  on:click={() => activeSearch = activeSearch === 'name' ? '' : 'name'}
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
                      on:input={debouncedFetch}
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
            <th>Company ID</th>
          </tr>
        </thead>
        <tbody>
            {#each products as product (product.id)}
              <tr
                on:click={() => selectProduct(product)}
                on:keydown={(e) => e.key === 'Enter' && selectProduct(product)}
                role="button"
                tabindex="0"
              >
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{new Date(product.created_at).toLocaleString()}</td>
                <td>{product.gtin_number}</td>
                <td>{product.company_id}</td>
              </tr>
            {/each}
          </tbody>
        </table>
  
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
  {/if}
</div>