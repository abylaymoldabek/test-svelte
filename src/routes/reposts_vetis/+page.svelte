<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { page } from "$app/stores";
  import { checkAuthAndRedirect } from "$lib/utils/auth-guard.js";
  import { russianTimeZones } from "$lib/utils/timezone.js";
  import { createVetisStore } from "$lib/services/vetis";

  import BatchesTable from "./components/BatchesTable.svelte";
  import BatchesList from "./components/BatchesList.svelte";
  import SendConfirmModal from "./components/SendConfirmModal.svelte";

  const vetisStore = createVetisStore();
  const { batches, loading, error, deadlineTimezone, loadBatches, sendToVetis, cleanup } = vetisStore;

  let isMobile = false;
  let showMobileFilters = false;
  let showConfirmModal = false;
  let selectedBatch: any = null;

  let filters = {
    party: "",
    product: "",
    status: "",
    dateFrom: "",
    dateTo: "",
  };

  let sortField = "productionDate";
  let sortOrder: "asc" | "desc" = "desc";

  onMount(() => {
    setTimeout(() => {
      checkAuthAndRedirect($page.url.pathname);
    }, 100);

    loadBatches(filters);

    const checkScreenSize = () => {
      isMobile = window.innerWidth <= 768;
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
      cleanup(); // Stop the timer from the store
    };
  });

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
            <p>Ошибка загрузки данных: {$error}</p>
            <button on:click={() => loadBatches(filters)}>Попробовать снова</button>
        </div>
    {:else}
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
                <input
                  id="mobile-filter-status"
                  type="text"
                  placeholder=""
                  bind:value={filters.status}
                  class="mobile-filter-input"
                />
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
        />
      {/if}
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
  }

</style>
