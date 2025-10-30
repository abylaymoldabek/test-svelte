<script lang="ts">
  import VetisStatusBadge from "./VetisStatusBadge.svelte";
  import BatchDetailsCard from "./BatchDetailsCard.svelte";
  import AdaptiveDateRangePicker from "./AdaptiveDateRangePicker.svelte";
  import { authStore } from "$lib/stores/auth";
  import { isAdmin } from "$lib/utils/role-guard";

  export let batches: any[];
  export let filters: any;
  export let sortField: string;
  export let sortOrder: "asc" | "desc";
  export let selectedBatch: any;
  export let deadlineTimezone: string;
  export let criticalPercentage: number = 5; // Значение по умолчанию

  let activeSearch = "";

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

  // Event dispatchers
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  function sortBy(field: string) {
    dispatch("sort", field);
  }

  function selectBatch(batch: any) {
    dispatch("select", batch);
  }

  function openConfirmModal() {
    dispatch("openConfirm");
  }

  function clearAllFilters() {
    filters.party = "";
    filters.product = "";
    filters.status = "";
    filters.dateFrom = "";
    filters.dateTo = "";
    activeSearch = "";
  }

  // Helper functions that were in the parent component
  function formatDateInTimezone(date: string, timezone: string) {
    if (!date) return "";
    try {
      const dateObj = new Date(date);
      return new Intl.DateTimeFormat("ru-RU", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(dateObj);
    } catch (error) {
      return date; // Fallback
    }
  }

  function formatDeadlineInTimezone(deadline: string, timezone: string) {
    if (!deadline) return "";
    try {
      const deadlineObj = new Date(deadline);
      return new Intl.DateTimeFormat("ru-RU", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(deadlineObj);
    } catch (error) {
      return deadline;
    }
  }

  function getTimeUntilDeadline(deadline: string, status: string = "") {
    if (!deadline) return "";
    // This function needs the reactive `currentTime` from the parent.
    // For now, we'll just pass it as a prop or handle it differently later.
    // Let's assume for now it's just showing a static value.
    const now = new Date();
    const deadlineObj = new Date(deadline);
    const diffMs = deadlineObj.getTime() - now.getTime();

    if (diffMs <= 0) {
      if (status && status === "hold") {
        return "Просрочено";
      }
      return "Отправлено";
    }
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days}д ${hours}ч`;
    if (hours > 0) return `${hours}ч ${minutes}м`;
    return `${minutes}м`;
  }

  function getDeadlineStatus(deadline: string, status: string = "") {
    if (!deadline) return "normal";
    const now = new Date();
    const deadlineObj = new Date(deadline);
    const diffMs = deadlineObj.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffMs <= 0) {
      if (status && status.includes("done")) return "normal";
      return "overdue";
    }
    if (diffHours <= 2) return "critical";
    if (diffHours <= 24) return "warning";
    return "normal";
  }

  function isCriticalDeviation(produced: number, vetis: number) {
    const deviationPercentage = Math.abs(calculatePercentage(produced, vetis));
    return deviationPercentage > criticalPercentage;
  }

  function calculatePercentage(produced: number, vetis: number) {
    if (vetis === 0) return 0;
    return Math.round(((vetis - produced) / vetis) * 100);
  }

  function calculateDifference(produced: number, vetis: number) {
    return produced - vetis;
  }

  function formatDifference(difference: number) {
    const sign = difference > 0 ? "+" : "";
    return sign + difference.toLocaleString();
  }
</script>

<!-- Кнопка очистки фильтров для десктопа -->
<div class="desktop-filter-controls">
  <button 
    class="desktop-clear-filters-btn" 
    on:click={clearAllFilters}
    type="button"
  >
    🗑️ Очистить все фильтры
  </button>
</div>

<div class="table-container">
  <table class="reports-table">
    <thead>
      <tr>
        <th>
          <div class="th-content">
            <div
              class="th-title"
              role="button"
              tabindex="0"
              on:click={() => {
                activeSearch = activeSearch === "party" ? "" : "party";
              }}
              on:keydown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  activeSearch = activeSearch === "party" ? "" : "party";
                }
              }}
            >
              <span>Партия 🔍</span>
            </div>
            {#if activeSearch === "party"}
              <div class="th-search-dropdown">
                <input
                  type="text"
                  placeholder=""
                  bind:value={filters.party}
                  class="th-search-input"
                />
              </div>
            {/if}
          </div>
        </th>
        <th>
          <div class="th-content">
            <div
              class="th-title"
              role="button"
              tabindex="0"
              on:click={() => {
                activeSearch = activeSearch === "product" ? "" : "product";
              }}
              on:keydown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  activeSearch = activeSearch === "product" ? "" : "product";
                }
              }}
            >
              <span>Продукт 🔍</span>
            </div>
            {#if activeSearch === "product"}
              <div class="th-search-dropdown">
                <input
                  type="text"
                  placeholder=""
                  bind:value={filters.product}
                  class="th-search-input"
                />
              </div>
            {/if}
          </div>
        </th>
        <th>
          <div class="th-content">
            <div
              class="th-title"
              role="button"
              tabindex="0"
              on:click={() => {
                activeSearch = activeSearch === "date" ? "" : "date";
              }}
              on:keydown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  activeSearch = activeSearch === "date" ? "" : "date";
                }
              }}
            >
              <div class="th-multiline-with-sort">
                <div class="multiline-text">
                  <div>Дата</div>
                  <div>производства</div>
                </div>
                <button
                  class="sort-button"
                  class:active={sortField === "productionDate"}
                  on:click|stopPropagation={() => sortBy("productionDate")}
                  type="button"
                  tabindex="0"
                  on:keydown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      sortBy("productionDate");
                    }
                  }}
                >
                  {#if sortField === "productionDate"}
                    {sortOrder === "asc" ? "↑" : "↓"}
                  {:else}
                    ↕
                  {/if}
                </button>
              </div>
            </div>
            {#if activeSearch === "date"}
              <div class="th-search-dropdown">
                <AdaptiveDateRangePicker 
                  bind:dateFrom={filters.dateFrom}
                  bind:dateTo={filters.dateTo}
                  placeholder="Выберите период"
                />
              </div>
            {/if}
          </div>
        </th>
        <th>
          <div class="th-multiline">
            <div>Дата срока</div>
            <div>годности</div>
          </div>
        </th>
        <th class="single-line">Произведено</th>
        <th>
          <div class="th-multiline">
            <div>Данные</div>
            <div>ВетИС</div>
          </div>
        </th>
        <th>
          <div class="th-multiline">
            <div>Не</div>
            <div>отправленные</div>
          </div>
        </th>
        <th class="single-line">Разница</th>
        <th>
          <div class="th-multiline">
            <div>До</div>
            <div>отправки</div>
          </div>
        </th>
        <th>
          <div class="th-content">
            <div
              class="th-title"
              role="button"
              tabindex="0"
              on:click={() => {
                activeSearch = activeSearch === "status" ? "" : "status";
              }}
              on:keydown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  activeSearch = activeSearch === "status" ? "" : "status";
                }
              }}
            >
              <span>Статус 🔍</span>
            </div>
            {#if activeSearch === "status"}
              <div class="th-search-dropdown">
                <select
                  bind:value={filters.status}
                  class="th-search-select"
                >
                  {#each availableStatuses as statusOption}
                    <option value={statusOption.value}>{statusOption.label}</option>
                  {/each}
                </select>
                <button
                  class="clear-filters-btn"
                  on:click={clearAllFilters}
                  type="button"
                >
                  Очистить все фильтры
                </button>
              </div>
            {/if}
          </div>
        </th>
      </tr>
    </thead>
    <tbody>
      {#each batches as batch}
        <tr
          class="batch-row"
          class:selected={selectedBatch === batch}
          on:click={() => selectBatch(batch)}
        >
          <td>{batch.party}</td>
          <td>{batch.product}</td>
          <td>{formatDateInTimezone(batch.productionDate, deadlineTimezone)}</td>
          <td>{formatDateInTimezone(batch.expiryDate, deadlineTimezone)}</td>
          <td>{batch.produced.toLocaleString()}</td>
          <td>{batch.vetis.toLocaleString()}</td>
          <td>{(batch.produced - batch.reports_sent_count).toLocaleString()}</td>
          <td
            class:critical={isCriticalDeviation(batch.produced, batch.vetis)}
            class:positive={!isCriticalDeviation(batch.produced, batch.vetis) && calculateDifference(batch.produced, batch.vetis) > 0}
            class:negative={!isCriticalDeviation(batch.produced, batch.vetis) && calculateDifference(batch.produced, batch.vetis) < 0}
            class:neutral={!isCriticalDeviation(batch.produced, batch.vetis) && calculateDifference(batch.produced, batch.vetis) === 0}
          >
            <div class="difference-display">
              {formatDifference(calculateDifference(batch.produced, batch.vetis))}
              ({calculatePercentage(batch.produced, batch.vetis)}%)
            </div>
          </td>
          <td
            class="deadline-cell"
            class:deadline-overdue={getDeadlineStatus(batch.sent_at, batch.status) === "overdue"}
            class:deadline-critical={getDeadlineStatus(batch.sent_at, batch.status) === "critical"}
            class:deadline-warning={getDeadlineStatus(batch.sent_at, batch.status) === "warning"}
            class:deadline-normal={getDeadlineStatus(batch.sent_at, batch.status) === "normal"}
          >
            <div class="deadline-display">
              <div class="time-remaining">
                {getTimeUntilDeadline(batch.sent_at, batch.status)}
              </div>
              <div class="deadline-date">
                {formatDeadlineInTimezone(batch.sent_at, deadlineTimezone)}
              </div>
            </div>
          </td>
          <td>
            <div style="display: flex; flex-direction: row; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
              <VetisStatusBadge 
                status={batch.status} 
                reportsSentCount={batch.reports_sent_count}
                reportsAllCount={batch.reports_total_count}
              />
              {#if batch.status === "hold" && isAdmin($authStore.user)}
                <button class="send-btn" on:click|stopPropagation={openConfirmModal}>
                  Отправить
                </button>
              {/if}
            </div>
          </td>
        </tr>
        {#if selectedBatch === batch}
          <tr class="batch-details">
            <td colspan="10">
              <BatchDetailsCard batch={selectedBatch} />
            </td>
          </tr>
        {/if}
      {:else}
        <tr class="no-data-row">
          <td colspan="10" class="no-data-cell">
            <div class="no-data-message">
              <div class="no-data-icon">📦</div>
              <h3>Нет данных для отображения</h3>
              <p>Попробуйте изменить фильтры или проверьте подключение к серверу</p>
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<!-- Карточная версия для планшетов -->
<div class="tablet-card-view">
  <!-- Фильтры для карточной версии -->
  <div class="tablet-filters">
    <div class="filter-group">
      <div class="filter-item">
        <label for="filter-party">Партия</label>
        <input id="filter-party" type="text" bind:value={filters.party} placeholder="Поиск по партии">
      </div>
      <div class="filter-item">
        <label for="filter-product">Продукт</label>
        <input id="filter-product" type="text" bind:value={filters.product} placeholder="Поиск по продукту">
      </div>
      <div class="filter-item">
        <label for="filter-date">Дата производства</label>
        <div id="filter-date">
          <AdaptiveDateRangePicker 
            bind:dateFrom={filters.dateFrom}
            bind:dateTo={filters.dateTo}
            placeholder="Выберите период производства"
          />
        </div>
      </div>
      <div class="filter-item">
        <label for="filter-status">Статус</label>
        <select id="filter-status" bind:value={filters.status} class="filter-select">
          {#each availableStatuses as statusOption}
            <option value={statusOption.value}>{statusOption.label}</option>
          {/each}
        </select>
      </div>
    </div>
    
    <!-- Кнопка очистки фильтров -->
    <div class="filter-actions">
      <button class="clear-all-filters-btn" on:click={clearAllFilters} type="button">
        Очистить все фильтры
      </button>
    </div>
  </div>

  <!-- Карточки партий -->
  <div class="tablet-cards-container">
    {#each batches as batch}
      <div 
        class="batch-card"
        class:selected={selectedBatch === batch}
        on:click={() => selectBatch(batch)}
        role="button"
        tabindex="0"
        on:keydown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            selectBatch(batch);
          }
        }}
      >
        <div class="card-header">
          <div class="card-title">
            <h3>{batch.party}</h3>
            <VetisStatusBadge 
              status={batch.status} 
              reportsSentCount={batch.reports_sent_count}
              reportsAllCount={batch.reports_total_count}
            />
          </div>
          {#if batch.status === "hold" && isAdmin($authStore.user)}
            <button class="card-send-btn" on:click|stopPropagation={openConfirmModal}>
              Отправить
            </button>
          {/if}
        </div>

        <div class="card-content">
          <div class="card-row">
            <div class="card-field">
              <span class="field-label">Продукт:</span>
              <span class="field-value">{batch.product}</span>
            </div>
          </div>

          <div class="card-row">
            <div class="card-field">
              <span class="field-label">Дата производства:</span>
              <span class="field-value">{formatDateInTimezone(batch.productionDate, deadlineTimezone)}</span>
            </div>
            <div class="card-field">
              <span class="field-label">Срок годности:</span>
              <span class="field-value">{formatDateInTimezone(batch.expiryDate, deadlineTimezone)}</span>
            </div>
          </div>

          <div class="card-row">
            <div class="card-field">
              <span class="field-label">Произведено:</span>
              <span class="field-value">{batch.produced.toLocaleString()}</span>
            </div>
            <div class="card-field">
              <span class="field-label">Данные ВетИС:</span>
              <span class="field-value">{batch.vetis.toLocaleString()}</span>
            </div>
            <div class="card-field">
              <span class="field-label">Не отправленные:</span>
              <span class="field-value">{(batch.produced - batch.reports_sent_count).toLocaleString()}</span>
            </div>
          </div>

          <div class="card-row">
            <div class="card-field">
              <span class="field-label">Разница:</span>
              <span 
                class="field-value difference-value"
                class:critical={isCriticalDeviation(batch.produced, batch.vetis)}
                class:positive={!isCriticalDeviation(batch.produced, batch.vetis) && calculateDifference(batch.produced, batch.vetis) > 0}
                class:negative={!isCriticalDeviation(batch.produced, batch.vetis) && calculateDifference(batch.produced, batch.vetis) < 0}
                class:neutral={!isCriticalDeviation(batch.produced, batch.vetis) && calculateDifference(batch.produced, batch.vetis) === 0}
              >
                {formatDifference(calculateDifference(batch.produced, batch.vetis))}
                ({calculatePercentage(batch.produced, batch.vetis)}%)
              </span>
            </div>
            <div class="card-field">
              <span class="field-label">До отправки:</span>
              <span 
                class="field-value deadline-value"
                class:deadline-overdue={getDeadlineStatus(batch.sent_at, batch.status) === "overdue"}
                class:deadline-critical={getDeadlineStatus(batch.sent_at, batch.status) === "critical"}
                class:deadline-warning={getDeadlineStatus(batch.sent_at, batch.status) === "warning"}
                class:deadline-normal={getDeadlineStatus(batch.sent_at, batch.status) === "normal"}
              >
                <div>{getTimeUntilDeadline(batch.sent_at, batch.status)}</div>
                <div class="deadline-date-small">{formatDeadlineInTimezone(batch.sent_at, deadlineTimezone)}</div>
              </span>
            </div>
          </div>
        </div>

        {#if selectedBatch === batch}
          <div class="card-details">
            <BatchDetailsCard batch={selectedBatch} />
          </div>
        {/if}
      </div>
    {:else}
      <div class="no-data-card">
        <div class="no-data-message">
          <div class="no-data-icon">📦</div>
          <h3>Нет данных для отображения</h3>
          <p>Попробуйте изменить фильтры или проверьте подключение к серверу</p>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .table-container {
    overflow-x: auto;
    border-radius: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    background: white;
    margin-bottom: 1rem;
    max-width: 100%;
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 #f1f5f9;
  }

  .table-container::-webkit-scrollbar {
    height: 6px;
  }

  .table-container::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }

  .table-container::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }

  .table-container::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }

  .reports-table {
    width: 100%;
    min-width: 1000px;
    border-collapse: separate;
    border-spacing: 0;
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1);
    table-layout: fixed;
  }

  .reports-table th {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    padding: 0.5rem 0.75rem;
    text-align: left;
    font-size: 0.75rem;
    font-weight: 700;
    color: #1e293b;
    border-bottom: 2px solid #e2e8f0;
    vertical-align: top;
    position: relative;
    white-space: nowrap;
    line-height: 1.2;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .th-content {
    position: relative;
    display: flex;
    align-items: center;
    min-height: 16px;
  }

  .th-multiline {
    line-height: 1.1;
    text-align: center;
    white-space: normal;
  }

  .th-multiline div {
    font-size: 0.7rem;
    font-weight: 700;
    color: #1e293b;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .th-multiline div:first-child {
    margin-bottom: 0.125rem;
  }

  .th-multiline-with-sort {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    line-height: 1.1;
    white-space: normal;
  }

  .multiline-text {
    text-align: center;
  }

  .multiline-text div {
    font-size: 0.7rem;
    font-weight: 700;
    color: #1e293b;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .multiline-text div:first-child {
    margin-bottom: 0.125rem;
  }

  /* Стили для однострочных заголовков */
  .reports-table th.single-line {
    font-size: 0.65rem;
    text-align: center;
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
  }

  /* Уменьшение размера для заголовка "Статус" */
  .th-title span {
    font-size: 0.65rem;
  }

  .th-title {
    display: flex;
    align-items: center;
    width: 100%;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 0.25rem;
    border-radius: 6px;
  }

  .th-title:hover {
    background-color: rgba(59, 130, 246, 0.1);
    transform: translateY(-1px);
  }

  .reports-table th:nth-child(1) { width: 8%; }
  .reports-table th:nth-child(2) { width: 8%; }
  .reports-table th:nth-child(3) { width: 10%; }
  .reports-table th:nth-child(4) { width: 10%; }
  .reports-table th:nth-child(5) { width: 8%; }
  .reports-table th:nth-child(6) { width: 8%; }
  .reports-table th:nth-child(7) { width: 9%; }
  .reports-table th:nth-child(8) { width: 8%; }
  .reports-table th:nth-child(9) { width: 10%; }
  .reports-table th:nth-child(10) { width: 21%; }

  .reports-table th:first-child { border-top-left-radius: 12px; }
  .reports-table th:last-child { border-top-right-radius: 12px; }

  .sort-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.2rem;
    margin-left: 0.4rem;
    font-size: 0.75rem;
    color: #6b7280;
    border-radius: 4px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    flex-shrink: 0;
  }

  .sort-button:hover {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .sort-button.active {
    color: #4b4bc7;
    background: #ede7ff;
  }

  .reports-table td {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
    color: #374151;
    border-bottom: 1px solid #f1f5f9;
    background: white;
    transition: all 0.2s ease;
    white-space: normal;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.2;
    font-weight: 500;
    word-wrap: break-word;
  }

  /* Уменьшенный шрифт для числовых колонок */
  .reports-table td:nth-child(5),  /* Произведено */
  .reports-table td:nth-child(6),  /* Данные ВетИС */
  .reports-table td:nth-child(7),  /* Не отправленные */
  .reports-table td:nth-child(8) { /* Разница */
    font-size: 0.65rem !important;
    font-weight: 600;
    text-align: center;
  }

  .reports-table tbody tr:hover {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    transform: translateY(-1px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  .batch-row {
    cursor: pointer;
  }

  .batch-row.selected {
    background: #dbeafe !important;
    border-left: 3px solid #3b82f6;
  }

  .positive { color: #059669 !important; font-weight: 600; }
  .negative { color: #7b26dc !important; font-weight: 600; }
  .neutral { color: #6b7280 !important; font-weight: 600; }
  .critical {
    color: #dc2626 !important;
    background-color: #fef2f2 !important;
    font-weight: 700;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
  }

  .difference-display {
    display: inline-block;
    text-align: center;
    font-size: 0.75rem;
    font-weight: 600;
    line-height: 1.3;
    white-space: nowrap;
  }

  .send-btn {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    border: none;
    padding: 0.3rem 0.8rem;
    border-radius: 8px;
    font-size: 0.7rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .send-btn:hover {
    transform: translateY(-2px);
  }

  .batch-details {
    background: #f8fafc;
  }

  .batch-details td {
    padding: 0;
  }

  /* Стили для сообщения "Нет данных" */
  .no-data-row {
    background: white;
  }

  .no-data-row:hover {
    background: white !important;
    transform: none !important;
    box-shadow: none !important;
  }

  .no-data-cell {
    padding: 3rem 2rem !important;
    text-align: center !important;
    border-bottom: none !important;
  }

  .no-data-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    max-width: 400px;
    margin: 0 auto;
  }

  .no-data-icon {
    font-size: 3rem;
    opacity: 0.6;
  }

  .no-data-message h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #374151;
  }

  .no-data-message p {
    margin: 0;
    font-size: 0.875rem;
    color: #6b7280;
    line-height: 1.5;
  }

  /* Стили для карточки "Нет данных" в планшетной версии */
  .no-data-card {
    background: white;
    border-radius: 12px;
    padding: 3rem 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 2px solid #f1f5f9;
    text-align: center;
    grid-column: 1 / -1; /* Занимает всю ширину грида */
  }

  .th-search-input {
    padding: 0.625rem 0.25rem 0.5rem 2rem;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    font-size: 0.8rem;
    width: 100%;
    outline: none;
    background: #f8fafc url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'/%3e%3c/svg%3e") no-repeat left 0.5rem center;
    background-size: 1.25rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .th-search-input:hover {
    border-color: #cbd5e1;
    background-color: #ffffff;
    cursor: text;
  }

  .th-search-input:focus {
    border-color: #3b82f6;
    background-color: #ffffff;
    cursor: text;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .th-search-select {
    padding: 0.625rem;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    font-size: 0.8rem;
    width: 100%;
    outline: none;
    background: #f8fafc;
    cursor: pointer;
    transition: all 0.2s ease;
    appearance: none;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 1rem;
    padding-right: 2.5rem;
  }

  .th-search-select:hover {
    border-color: #cbd5e1;
    background-color: #ffffff;
  }

  .th-search-select:focus {
    border-color: #3b82f6;
    background-color: #ffffff;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .clear-filters-btn {
    width: 100%;
    background: #ef4444;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 0.75rem;
  }

  .clear-filters-btn:hover {
    background: #dc2626;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
  }

  .th-search-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 100;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 0.75rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    margin-top: 0.25rem;
    min-width: 280px;
  }

  /* Переопределяем стили для адаптивного календаря в таблице */
  .th-search-dropdown :global(.date-range-picker) {
    width: 100%;
  }

  .th-search-dropdown :global(.date-picker-trigger) {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 0.7rem;
    padding: 0.5rem 0.75rem;
    min-height: 40px;
  }

  .th-search-dropdown :global(.date-display) {
    font-size: 0.7rem;
  }

  .th-search-dropdown :global(.calendar-icon) {
    width: 16px;
    height: 16px;
  }

  .th-search-dropdown :global(.calendar-container) {
    position: fixed;
    top: auto;
    left: auto;
    right: auto;
    bottom: auto;
    transform: translateX(-50%);
    left: 50%;
    margin-top: 0.5rem;
  }

  .deadline-cell {
    min-width: 100px;
    max-width: 120px;
    text-align: center;
  }

  .deadline-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .time-remaining {
    font-size: 0.625rem;
    font-weight: 600;
  }

  .deadline-date {
    font-size: 0.5rem;
    opacity: 0.8;
  }

  .deadline-normal .time-remaining { color: #059669; }
  .deadline-warning .time-remaining { color: #d97706; }
  .deadline-critical .time-remaining { color: #f51404; animation: pulse-deadline 2s infinite; }
  .deadline-overdue .time-remaining { color: #991b1b; font-weight: 700; animation: pulse-deadline 1s infinite; }

  @keyframes pulse-deadline {
    50% { opacity: 0.6; }
  }

  /* Скрыть карточную версию на десктопе */
  .tablet-card-view {
    display: none;
  }

  /* Стили для кнопки очистки фильтров на десктопе */
  .desktop-filter-controls {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 0.75rem;
    padding: 0 0.25rem;
  }

  .desktop-clear-filters-btn {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    border: none;
    padding: 0.375rem 0.75rem;
    border-radius: 6px;
    font-size: 0.7rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    gap: 0.25rem;
    box-shadow: 0 1px 3px -1px rgba(239, 68, 68, 0.25), 0 1px 2px -1px rgba(239, 68, 68, 0.1);
  }

  .desktop-clear-filters-btn:hover {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    transform: translateY(-0.5px);
    box-shadow: 0 2px 6px -1px rgba(239, 68, 68, 0.35), 0 1px 3px -1px rgba(239, 68, 68, 0.15);
  }

  .desktop-clear-filters-btn:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px -1px rgba(239, 68, 68, 0.3);
  }

  /* Медиа-запросы для адаптивности */
  @media (max-width: 1024px) {
    .desktop-filter-controls {
      display: none;
    }
    
    .table-container {
      display: none;
    }
    
    .tablet-card-view {
      display: block;
    }
  }

  /* Стили для карточной версии */
  .tablet-filters {
    background: white;
    padding: 1rem;
    border-radius: 12px;
    margin-bottom: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .filter-group {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .filter-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .filter-item label {
    font-weight: 600;
    font-size: 0.875rem;
    color: #374151;
    cursor: pointer;
    transition: color 0.2s ease;
  }

  .filter-item label:hover {
    color: #3b82f6;
  }

  .filter-item input {
    padding: 0.75rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 0.875rem;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .filter-item input:hover {
    border-color: #cbd5e1;
    background-color: #f8fafc;
    cursor: text;
  }

  .filter-item input:focus {
    outline: none;
    border-color: #3b82f6;
    background-color: #ffffff;
    cursor: text;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .filter-select {
    padding: 0.75rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 0.875rem;
    transition: all 0.2s ease;
    cursor: pointer;
    background: white;
    appearance: none;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 1rem;
    padding-right: 2.5rem;
  }

  .filter-select:hover {
    border-color: #cbd5e1;
    background-color: #f8fafc;
  }

  .filter-select:focus {
    outline: none;
    border-color: #3b82f6;
    background-color: #ffffff;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .filter-actions {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
  }

  .clear-all-filters-btn {
    width: 100%;
    background: #ef4444;
    color: white;
    border: none;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .clear-all-filters-btn:hover {
    background: #dc2626;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  }

  /* Стили для адаптивного календаря в планшетных фильтрах */
  .filter-item :global(.date-range-picker) {
    width: 100%;
  }

  .filter-item :global(.date-picker-trigger) {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    font-size: 0.875rem;
    transition: border-color 0.2s, box-shadow 0.2s;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 48px;
  }

  .filter-item :global(.date-picker-trigger:hover) {
    border-color: #d1d5db;
  }

  .filter-item :global(.date-picker-trigger:focus) {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .filter-item :global(.trigger-content) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .filter-item :global(.date-display) {
    color: #374151;
    font-weight: 500;
  }

  .filter-item :global(.calendar-icon) {
    width: 20px;
    height: 20px;
    color: #6b7280;
    transition: transform 0.2s;
    flex-shrink: 0;
    margin-left: 0.5rem;
  }

  .filter-item :global(.calendar-icon.open) {
    transform: rotate(180deg);
  }

  .tablet-cards-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1rem;
  }

  .batch-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 2px solid transparent;
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .batch-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  .batch-card.selected {
    border-color: #3b82f6;
    background: #f0f9ff;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .card-title {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .card-title h3 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 700;
    color: #1f2937;
  }

  .card-send-btn {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .card-send-btn:hover {
    transform: translateY(-1px);
  }

  .card-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .card-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .card-row:first-child {
    grid-template-columns: 1fr;
  }

  .card-field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .field-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .field-value {
    font-size: 0.875rem;
    font-weight: 500;
    color: #1f2937;
  }

  .difference-value.positive { color: #059669 !important; }
  .difference-value.negative { color: #6c26dc !important; }
  .difference-value.neutral { color: #6b7280 !important; }
  .difference-value.critical {
    color: #dc2626 !important;
    background-color: #fef2f2 !important;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-weight: 700;
  }

  .deadline-value {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .deadline-value.deadline-normal { color: #059669; }
  .deadline-value.deadline-warning { color: #d97706; }
  .deadline-value.deadline-critical { color: #dc2626; font-weight: 700; }
  .deadline-value.deadline-overdue { color: #991b1b; font-weight: 700; }

  .deadline-date-small {
    font-size: 0.7rem;
    opacity: 0.7;
  }

  .card-details {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
  }

  /* Адаптивные заголовки для обычных мониторов */
  @media (min-width: 1367px) and (max-width: 1600px) {
    .th-multiline div {
      font-size: 0.65rem;
    }
    .multiline-text div {
      font-size: 0.65rem;
    }
    .reports-table th.single-line {
      font-size: 0.6rem;
    }
    .th-title span {
      font-size: 0.6rem;
    }
  }

  @media (min-width: 1200px) and (max-width: 1366px) {
    .th-multiline div {
      font-size: 0.6rem;
    }
    .multiline-text div {
      font-size: 0.6rem;
    }
    .reports-table th.single-line {
      font-size: 0.55rem;
    }
    .th-title span {
      font-size: 0.55rem;
    }
  }

  /* Планшеты в ландшафтной ориентации (1024px - 1366px) - iPad Pro */
  @media (max-width: 1366px) and (min-width: 1024px) {
    .table-container {
      display: none;
    }
    
    .tablet-card-view {
      display: block;
    }
    
    .tablet-filters {
      padding: 1.25rem;
      margin-bottom: 1.5rem;
    }
    
    .filter-group {
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.25rem;
    }
    
    .filter-item {
      gap: 0.75rem;
    }
    
    .filter-item label {
      font-size: 0.95rem;
      font-weight: 600;
    }
    
    .filter-item input {
      padding: 1rem;
      font-size: 0.95rem;
      min-height: 48px;
    }

    /* Улучшенные стили календаря для больших планшетов */
    .filter-item :global(.date-picker-trigger) {
      padding: 1rem;
      font-size: 0.95rem;
      min-height: 48px;
      border-radius: 10px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .filter-item :global(.date-picker-trigger:hover) {
      border-color: #9ca3af;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    }
    
    .filter-item :global(.calendar-icon) {
      width: 22px;
      height: 22px;
    }
    
    .tablet-cards-container {
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 1.25rem;
    }
    
    .batch-card {
      padding: 1.5rem;
      border-radius: 16px;
      transition: all 0.3s ease;
    }
    
    .batch-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
    
    .card-header {
      margin-bottom: 1.25rem;
      padding-bottom: 1.25rem;
    }
    
    .card-title h3 {
      font-size: 1.25rem;
      margin-bottom: 0.75rem;
    }
    
    .card-send-btn {
      padding: 0.75rem 1.25rem;
      font-size: 0.95rem;
      border-radius: 10px;
    }
    
    .card-content {
      gap: 1rem;
    }
    
    .card-row {
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }
    
    .card-row:first-child {
      grid-template-columns: 1fr;
    }
    
    .card-field {
      gap: 0.5rem;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      transition: all 0.2s ease;
    }
    
    .card-field:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
    }
    
    .field-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: #64748b;
    }
    
    .field-value {
      font-size: 1rem;
      font-weight: 500;
      line-height: 1.4;
    }
    
    .difference-value.positive { 
      color: #059669; 
      font-weight: 600;
    }
    
    .difference-value.negative { 
      color: #4e26dc; 
      font-weight: 600;
    }
    
    .difference-value.critical {
      color: #dc2626;
      background-color: #fef2f2;
      padding: 0.75rem;
      border-radius: 8px;
      font-weight: 700;
      border: 1px solid #fecaca;
    }
    
    .deadline-value.deadline-normal { 
      color: #059669; 
      font-weight: 600;
    }
    
    .deadline-value.deadline-warning { 
      color: #d97706; 
      font-weight: 600;
    }
    
    .deadline-value.deadline-critical { 
      color: #dc2626; 
      font-weight: 700;
    }
    
    .deadline-value.deadline-overdue { 
      color: #991b1b; 
      font-weight: 700;
    }
    
    .deadline-date-small {
      font-size: 0.85rem;
      opacity: 0.75;
      margin-top: 0.25rem;
    }
    
    /* Улучшения для адаптивного календаря на больших планшетах */
    .filter-item :global(.date-picker-trigger) {
      padding: 1rem;
      font-size: 0.95rem;
      min-height: 48px;
      border-radius: 10px;
    }
    
    .filter-item :global(.calendar-icon) {
      width: 20px;
      height: 20px;
    }
  }

  /* iPad Pro в портретной ориентации (1024px высота) */
  @media (max-width: 1024px) and (min-width: 768px) and (orientation: portrait) {
    .tablet-cards-container {
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1rem;
    }
    
    .batch-card {
      padding: 1.25rem;
    }
    
    .card-title h3 {
      font-size: 1.1rem;
    }
    
    .field-value {
      font-size: 0.95rem;
    }
  }

  /* Планшеты в портретной ориентации (768px - 1023px) */
  @media (max-width: 1023px) and (min-width: 768px) {
    .table-container {
      display: none;
    }
    
    .tablet-card-view {
      display: block;
    }
    
    .tablet-cards-container {
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    }
    
    .batch-card {
      padding: 1.25rem;
    }
    
    .card-title h3 {
      font-size: 1rem;
    }
    
    .field-label {
      font-size: 0.7rem;
    }
    
    .field-value {
      font-size: 0.8rem;
    }

    /* Стили календаря для средних планшетов */
    .filter-item :global(.date-picker-trigger) {
      padding: 0.875rem;
      font-size: 0.875rem;
      min-height: 44px;
      border-radius: 8px;
    }
    
    .filter-item :global(.calendar-icon) {
      width: 18px;
      height: 18px;
    }
  }

  /* Маленькие планшеты (480px - 767px) */
  @media (max-width: 767px) and (min-width: 480px) {
    .table-container {
      display: none;
    }
    
    .tablet-card-view {
      display: block;
    }
    
    .filter-group {
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    }
    
    .tablet-cards-container {
      grid-template-columns: 1fr;
    }
    
    .batch-card {
      padding: 1rem;
    }
    
    .card-row {
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }
    
    .card-title h3 {
      font-size: 0.95rem;
    }
    
    .field-label {
      font-size: 0.65rem;
    }
    
    .field-value {
      font-size: 0.75rem;
    }
    
    .card-send-btn {
      padding: 0.4rem 0.8rem;
      font-size: 0.8rem;
    }

    /* Стили календаря для маленьких планшетов */
    .filter-item :global(.date-picker-trigger) {
      padding: 0.75rem;
      font-size: 0.8rem;
      min-height: 42px;
      border-radius: 8px;
    }
    
    .filter-item :global(.calendar-icon) {
      width: 16px;
      height: 16px;
    }
  }

  /* Телефоны (менее 480px) */
  @media (max-width: 479px) {
    .table-container {
      display: none;
    }
    
    .tablet-card-view {
      display: block;
    }
    
    .tablet-filters {
      padding: 0.75rem;
      margin-bottom: 0.75rem;
    }
    
    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .filter-item input {
      padding: 0.875rem;
      font-size: 1rem; /* Увеличенный шрифт для мобильных */
    }
    
    .tablet-cards-container {
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }
    
    .batch-card {
      padding: 1rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .card-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }
    
    .card-title {
      width: 100%;
    }
    
    .card-title h3 {
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
    }
    
    .card-send-btn {
      width: 100%;
      padding: 0.75rem;
      font-size: 1rem;
      font-weight: 600;
    }
    
    .card-content {
      gap: 1rem;
    }
    
    .card-row {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .card-field {
      gap: 0.25rem;
      padding: 0.75rem;
      background: #f8fafc;
      border-radius: 8px;
    }
    
    .field-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .field-value {
      font-size: 1rem;
      font-weight: 500;
      color: #1f2937;
      line-height: 1.4;
    }
    
    .difference-value.positive { 
      color: #059669; 
      font-weight: 600;
    }
    
    .difference-value.negative { 
      color: #dc2626; 
      font-weight: 600;
    }
    
    .difference-value.neutral { 
      color: #6b7280; 
      font-weight: 600;
    }
    
    .difference-value.critical {
      color: #dc2626;
      background-color: #fef2f2;
      padding: 0.5rem;
      border-radius: 8px;
      font-weight: 700;
      border: 1px solid #fecaca;
    }
    
    .deadline-value {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    
    .deadline-value.deadline-normal { 
      color: #059669; 
      font-weight: 600;
    }
    
    .deadline-value.deadline-warning { 
      color: #d97706; 
      font-weight: 600;
    }
    
    .deadline-value.deadline-critical { 
      color: #dc2626; 
      font-weight: 700;
      animation: pulse-mobile 2s infinite;
    }
    
    .deadline-value.deadline-overdue { 
      color: #991b1b; 
      font-weight: 700;
      animation: pulse-mobile 1s infinite;
    }
    
    @keyframes pulse-mobile {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    
    .deadline-date-small {
      font-size: 0.8rem;
      opacity: 0.8;
      margin-top: 0.25rem;
    }
    
    .card-details {
      margin-top: 1rem;
      padding: 1rem;
      background: #f1f5f9;
      border-radius: 8px;
      border-top: none;
    }
    
    /* Улучшения для адаптивного календаря на мобильных */
    .filter-item :global(.date-range-picker) {
      width: 100%;
    }
    
    .filter-item :global(.date-picker-trigger) {
      padding: 0.875rem 1rem;
      font-size: 1rem;
      min-height: 48px; /* Минимальная высота для тач-интерфейса */
    }
    
    .filter-item :global(.calendar-icon) {
      width: 24px;
      height: 24px;
    }
  }

  /* Очень маленькие экраны (менее 360px) */
  @media (max-width: 359px) {
    .tablet-filters {
      padding: 0.5rem;
      margin-bottom: 0.5rem;
    }
    
    .tablet-cards-container {
      gap: 0.5rem;
    }
    
    .batch-card {
      padding: 0.75rem;
      margin: 0;
    }
    
    .card-header {
      margin-bottom: 0.75rem;
    }
    
    .card-title h3 {
      font-size: 1rem;
    }
    
    .card-content {
      gap: 0.75rem;
    }
    
    .card-field {
      padding: 0.5rem;
    }
    
    .field-label {
      font-size: 0.7rem;
    }
    
    .field-value {
      font-size: 0.9rem;
    }
    
    .card-send-btn {
      padding: 0.625rem;
      font-size: 0.9rem;
    }
    
    .filter-item input {
      padding: 0.75rem;
      font-size: 0.95rem;
    }
    
    .filter-item :global(.date-picker-trigger) {
      padding: 0.75rem;
      font-size: 0.95rem;
      min-height: 44px;
    }
  }
</style>
