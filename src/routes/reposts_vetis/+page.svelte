<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { checkAuthAndRedirect } from "$lib/utils/auth-guard.js";
  import { russianTimeZones } from "$lib/utils/timezone.js";
  import { createVetisStore } from "$lib/services/vetis";
  import { tokenPayload } from "$lib/stores/token.js";

  import BatchesTable from "./components/BatchesTable.svelte";
  import BatchesList from "./components/BatchesList.svelte";
  import SendConfirmModal from "./components/SendConfirmModal.svelte";
  import AdaptiveDateRangePicker from "./components/AdaptiveDateRangePicker.svelte";

  const vetisStore = createVetisStore();
  const { batches, loading, error, deadlineTimezone, loadBatches, sendToVetis, cleanup } = vetisStore;

  let isMobile = false;
  let showMobileFilters = false;
  let showConfirmModal = false;
  let selectedBatch: any = null;
  let criticalPercentage = 5; // Значение по умолчанию

  // Доступные статусы для фильтрации
  const availableStatuses = [
    { value: "", label: "Все статусы" },
    { value: "new", label: "Новая" },
    { value: "producing", label: "Производится" },
    { value: "produced", label: "Произведено" },
    { value: "hold", label: "Требует корректировки" },
    { value: "resumed", label: "Возобновлено" },
    { value: "sending", label: "Отправляется" },
    { value: "done", label: "Отправлена" }
  ];

  let filters = {
    party: "",
    product: "",
    status: "",
    dateFrom: "",
    dateTo: "",
  };

  let sortField = "productionDate";
  let sortOrder: "asc" | "desc" = "desc";

  // Функция для загрузки настроек компании
  async function fetchCompanySettings() {
    try {
      const token = $tokenPayload;
      if (!token?.company_id) return;

      const accessToken = token.token;
      const response = await fetch(`/api/v1/companies/${token.company_id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.vetis_critical_discrepancy_percent !== undefined) {
          criticalPercentage = data.vetis_critical_discrepancy_percent;
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек компании:', error);
    }
  }

  // Функции для работы с URL параметрами
  function saveFiltersToURL() {
    const url = new URL(window.location.href);
    const params = new URLSearchParams();
    
    // Добавляем только непустые фильтры
    if (filters.party) params.set('party', filters.party);
    if (filters.product) params.set('product', filters.product);
    if (filters.status) params.set('status', filters.status);
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);
    
    // Обновляем URL без перезагрузки страницы
    const newUrl = params.toString() ? `${url.pathname}?${params.toString()}` : url.pathname;
    goto(newUrl, { replaceState: true, noScroll: true });
  }

  function loadFiltersFromURL() {
    if (browser) {
      const urlParams = new URLSearchParams(window.location.search);
      
      const newFilters = {
        party: urlParams.get('party') || '',
        product: urlParams.get('product') || '',
        status: urlParams.get('status') || '',
        dateFrom: urlParams.get('dateFrom') || '',
        dateTo: urlParams.get('dateTo') || ''
      };
      
      // Проверяем, отличаются ли новые фильтры от текущих
      if (JSON.stringify(newFilters) !== JSON.stringify(filters)) {
        isLoadingFromURL = true;
        filters = newFilters;
        setTimeout(() => {
          isLoadingFromURL = false;
        }, 100); // Сбрасываем флаг через 100мс
      }
    }
  }

  function clearFilters() {
    filters = {
      party: "",
      product: "",
      status: "",
      dateFrom: "",
      dateTo: "",
    };
    // Очищаем URL
    goto($page.url.pathname, { replaceState: true, noScroll: true });
    // loadBatches будет вызван автоматически через реактивность
  }

  // Реактивно сохраняем фильтры в URL при изменении
  let saveTimeout: ReturnType<typeof setTimeout> | undefined;
  let loadTimeout: ReturnType<typeof setTimeout> | undefined;
  let isLoadingFromURL = false;
  let lastFiltersString = '';
  let isInitialLoad = true;
  
  $: if (filters && !isLoadingFromURL) {
    const currentFiltersString = JSON.stringify(filters);
    if (currentFiltersString !== lastFiltersString) {
      lastFiltersString = currentFiltersString;
      
      // Сохраняем фильтры в URL
      if (saveTimeout) clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        saveFiltersToURL();
      }, 1000); // Дебаунсинг 1000мс
      
      // Загружаем данные из API
      if (!isInitialLoad) { // Не загружаем при первой инициализации, это сделается в onMount
        if (loadTimeout) clearTimeout(loadTimeout);
        loadTimeout = setTimeout(() => {
          loadBatches(filters);
        }, 500); // Дебаунсинг 500мс для загрузки данных
      }
    }
  }

  onMount(() => {
    setTimeout(() => {
      checkAuthAndRedirect($page.url.pathname);
    }, 100);

    loadFiltersFromURL(); // Загружаем фильтры из URL
    
    loadBatches(filters);
    fetchCompanySettings(); // Загружаем настройки компании
    
    // Разрешаем автоматическую загрузку после инициализации
    setTimeout(() => {
      isInitialLoad = false;
    }, 200);

    const checkScreenSize = () => {
      isMobile = window.innerWidth <= 768;
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
      if (saveTimeout) clearTimeout(saveTimeout);
      if (loadTimeout) clearTimeout(loadTimeout);
      cleanup(); // Stop the timer from the store
    };
  });

  // Реактивно обновляем фильтры при изменении URL (например, кнопки назад/вперед браузера)
  $: if ($page.url.searchParams && browser) {
    loadFiltersFromURL();
  }

  function handleSort(event: any) {
    const field = event.detail;
    if (sortField === field) {
      sortOrder = sortOrder === "asc" ? "desc" : "asc";
    } else {
      sortField = field;
      sortOrder = "asc";
    }
  }

  function handleSelect(event: any) {
    const batch = event.detail;
    if (selectedBatch === batch) {
      selectedBatch = null;
    } else {
      selectedBatch = batch;
    }
  }

  function openConfirmModal() {
    showConfirmModal = true;
  }

  async function confirmSend() {
    if (!selectedBatch) return;
    const result = await sendToVetis(selectedBatch.id);
    if (result.success) {
      // Optionally show a success notification
    } else {
      // Optionally show an error notification
      console.error(result.error);
    }
    showConfirmModal = false;
    selectedBatch = null; // Deselect after action
  }

  $: sortedBatches = $batches.slice().sort((a: any, b: any) => {
    const aValue = new Date(a[sortField]);
    const bValue = new Date(b[sortField]);
    let comparison = 0;
    if (aValue > bValue) comparison = 1;
    else if (aValue < bValue) comparison = -1;
    return sortOrder === "asc" ? comparison : -comparison;
  });

</script>

<div class="reports-container">
  <div class="main-content">
    <div class="page-header">
      <div class="header-content">
        <h1>Отчеты ВетИС</h1>
        <div class="timezone-selector">
          <label for="timezone-select">Таймзона:</label>
          <select id="timezone-select" bind:value={$deadlineTimezone}>
            {#each russianTimeZones as tz}
              <option value={tz.value}>{tz.label}</option>
            {/each}
          </select>
        </div>
      </div>
    </div>

    {#if $loading}
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>Загрузка данных партий...</p>
      </div>
    {:else if $error}
        <div class="error-container">
            <div class="error-card">
                <div class="error-icon">⚠️</div>
                <h3>Не удалось загрузить данные</h3>
                <p>Возникла проблема при подключении к серверу. Проверьте интернет-соединение и попробуйте еще раз.</p>
                <div class="error-actions">
                    <button class="retry-button" on:click={() => loadBatches(filters)}>
                        🔄 Попробовать снова
                    </button>
                </div>
                <details class="error-details">
                    <summary>Техническая информация</summary>
                    <code>{$error}</code>
                </details>
            </div>
        </div>
    {/if}

    <!-- Показываем интерфейс всегда, независимо от наличия данных -->
    {#if isMobile}
       <div class="mobile-filters">
        <button
          class="mobile-filter-toggle"
          on:click={() => (showMobileFilters = !showMobileFilters)}
        >
          Фильтры {showMobileFilters ? "▲" : "▼"}
        </button>

        {#if showMobileFilters}
          <div class="mobile-filter-panel">
            <div class="mobile-filter-section">
              <label class="mobile-filter-label" for="mobile-filter-party">Партия</label>
              <input
                id="mobile-filter-party"
                type="text"
                placeholder=""
                bind:value={filters.party}
                class="mobile-filter-input"
              />
            </div>

            <div class="mobile-filter-section">
              <label class="mobile-filter-label" for="mobile-filter-product">Продукт</label>
              <input
                id="mobile-filter-product"
                type="text"
                placeholder=""
                bind:value={filters.product}
                class="mobile-filter-input"
              />
            </div>

            <div class="mobile-filter-section">
              <label class="mobile-filter-label" for="mobile-filter-status">Статус</label>
              <select
                id="mobile-filter-status"
                bind:value={filters.status}
                class="mobile-filter-input"
              >
                {#each availableStatuses as statusOption}
                  <option value={statusOption.value}>{statusOption.label}</option>
                {/each}
              </select>
            </div>

            <div class="mobile-filter-section">
              <label class="mobile-filter-label">Дата производства</label>
              <div class="mobile-date-picker">
                <AdaptiveDateRangePicker 
                  bind:dateFrom={filters.dateFrom}
                  bind:dateTo={filters.dateTo}
                  placeholder="Выберите период производства"
                />
              </div>
            </div>

            <div class="mobile-filter-actions">
              <button class="clear-filters-btn" on:click={clearFilters}>
                Очистить фильтры
              </button>
            </div>
          </div>
        {/if}
      </div>
      <BatchesList
        batches={sortedBatches}
        bind:selectedBatch
        on:select={handleSelect}
        on:openConfirm={openConfirmModal}
        deadlineTimezone={$deadlineTimezone}
        {criticalPercentage}
      />
    {:else}
      <BatchesTable
        batches={sortedBatches}
        bind:filters
        bind:selectedBatch
        {sortField}
        {sortOrder}
        on:sort={handleSort}
        on:select={handleSelect}
        on:openConfirm={openConfirmModal}
        deadlineTimezone={$deadlineTimezone}
        {criticalPercentage}
      />
    {/if}

    {#if showConfirmModal}
      <SendConfirmModal
        on:confirm={confirmSend}
        on:cancel={() => (showConfirmModal = false)}
      />
    {/if}
  </div>
</div>

<style>
  .reports-container {
    padding: 1rem;
    background-color: #f9fafb;
    min-height: 100vh;
  }

  .main-content {
    max-width: 1600px;
    margin: 0 auto;
  }

  .page-header {
    margin-bottom: 1.5rem;
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .header-content h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #111827;
  }

  .timezone-selector {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .timezone-selector label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #4b5563;
  }

  .timezone-selector select {
    padding: 0.5rem;
    border-radius: 8px;
    border: 1px solid #d1d5db;
    background-color: white;
    font-size: 0.875rem;
  }

  .loading-container, .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem;
    text-align: center;
    color: #4b5563;
  }

  .loading-spinner {
    border: 4px solid #e5e7eb;
    border-top: 4px solid #3b82f6;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .mobile-filters {
    margin-bottom: 1rem;
  }

  .mobile-filter-toggle {
    width: 100%;
    padding: 0.75rem;
    background-color: white;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-weight: 500;
    text-align: left;
    cursor: pointer;
  }

  .mobile-filter-panel {
    padding: 1rem;
    background-color: white;
    border: 1px solid #d1d5db;
    border-top: none;
    border-radius: 0 0 8px 8px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .mobile-filter-input {
     width: 100%;
     padding: 0.5rem;
     border: 1px solid #d1d5db;
     border-radius: 6px;
     background: white;
     font-size: 1rem;
     transition: all 0.2s ease;
  }

  .mobile-filter-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  /* Стили для select в мобильной версии */
  select.mobile-filter-input {
    appearance: none;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 1rem;
    padding-right: 2.5rem;
  }

  .mobile-date-picker {
    width: 100%;
  }

  .mobile-date-picker :global(.date-picker-input) {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 1rem;
  }

  .mobile-filter-actions {
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
    margin-top: 1rem;
  }

  .clear-filters-btn {
    width: 100%;
    background: #ef4444;
    color: white;
    border: none;
    padding: 0.75rem 1rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .clear-filters-btn:hover {
    background: #dc2626;
  }

  /* Красивые стили для ошибки */
  .error-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
    padding: 2rem;
  }

  .error-card {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    text-align: center;
    max-width: 500px;
    width: 100%;
    border-left: 4px solid #f59e0b;
  }

  .error-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .error-card h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 0.5rem;
  }

  .error-card p {
    color: #6b7280;
    margin-bottom: 1.5rem;
    line-height: 1.6;
  }

  .error-actions {
    margin-bottom: 1.5rem;
  }

  .retry-button {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .retry-button:hover {
    background: #2563eb;
  }

  .error-details {
    text-align: left;
    margin-top: 1rem;
  }

  .error-details summary {
    cursor: pointer;
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 0.5rem;
  }

  .error-details code {
    background: #f3f4f6;
    padding: 0.75rem;
    border-radius: 6px;
    font-size: 0.75rem;
    color: #374151;
    display: block;
    word-break: break-all;
    border: 1px solid #e5e7eb;
  }

</style>
```
