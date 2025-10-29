<script lang="ts">
  import VetisStatusBadge from "./VetisStatusBadge.svelte";
  import BatchDetailsCard from "./BatchDetailsCard.svelte";
  import DateRangePicker from "./DateRangePicker.svelte";

  export let batches: any[];
  export let filters: any;
  export let sortField: string;
  export let sortOrder: "asc" | "desc";
  export let selectedBatch: any;
  export let deadlineTimezone: string;

  let activeSearch = "";

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
      if (status && status === "На холде") {
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
      if (status && status.includes("Отправлена")) return "normal";
      return "overdue";
    }
    if (diffHours <= 2) return "critical";
    if (diffHours <= 24) return "warning";
    return "normal";
  }

  function isCriticalDeviation(produced: number, vetis: number) {
    const criticalPercentage = 5; // This should be a prop
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
                if (activeSearch !== "party") {
                  filters.party = "";
                }
              }}
              on:keydown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  activeSearch = activeSearch === "party" ? "" : "party";
                  if (activeSearch !== "party") {
                    filters.party = "";
                  }
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
                if (activeSearch !== "product") {
                  filters.product = "";
                }
              }}
              on:keydown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  activeSearch = activeSearch === "product" ? "" : "product";
                  if (activeSearch !== "product") {
                    filters.product = "";
                  }
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
                if (activeSearch !== "date") {
                  filters.dateFrom = "";
                  filters.dateTo = "";
                }
              }}
              on:keydown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  activeSearch = activeSearch === "date" ? "" : "date";
                  if (activeSearch !== "date") {
                    filters.dateFrom = "";
                    filters.dateTo = "";
                  }
                }
              }}
            >
              <span
                style="display: inline-flex; align-items: center; gap: 0.25rem;"
              >
                Дата производства
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
              </span>
            </div>
            {#if activeSearch === "date"}
              <div class="th-search-dropdown">
                <DateRangePicker 
                  bind:dateFrom={filters.dateFrom}
                  bind:dateTo={filters.dateTo}
                />
              </div>
            {/if}
          </div>
        </th>
        <th>Дата срока годности</th>
        <th>Произведено</th>
        <th>Данные ВетИС</th>
        <th>Разница</th>
        <th>До отправки</th>
        <th>
          <div class="th-content">
            <div
              class="th-title"
              role="button"
              tabindex="0"
              on:click={() => {
                activeSearch = activeSearch === "status" ? "" : "status";
                if (activeSearch !== "status") {
                  filters.status = "";
                }
              }}
              on:keydown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  activeSearch = activeSearch === "status" ? "" : "status";
                  if (activeSearch !== "status") {
                    filters.status = "";
                  }
                }
              }}
            >
              <span>Статус 🔍</span>
            </div>
            {#if activeSearch === "status"}
              <div class="th-search-dropdown">
                <input
                  type="text"
                  placeholder=""
                  bind:value={filters.status}
                  class="th-search-input"
                />
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
          <td
            class:critical={isCriticalDeviation(batch.produced, batch.vetis)}
            class:positive={!isCriticalDeviation(batch.produced, batch.vetis) && calculatePercentage(batch.produced, batch.vetis) < 0}
            class:negative={!isCriticalDeviation(batch.produced, batch.vetis) && calculatePercentage(batch.produced, batch.vetis) > 0}
            class:neutral={!isCriticalDeviation(batch.produced, batch.vetis) && calculatePercentage(batch.produced, batch.vetis) === 0}
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
              {#if batch.status === "hold"}
                <button class="send-btn" on:click|stopPropagation={openConfirmModal}>
                  Отправить
                </button>
              {/if}
            </div>
          </td>
        </tr>
        {#if selectedBatch === batch}
          <tr class="batch-details">
            <td colspan="9">
              <BatchDetailsCard batch={selectedBatch} />
            </td>
          </tr>
        {/if}
      {/each}
    </tbody>
  </table>
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
    min-width: 1200px;
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
    padding: 1rem 0.75rem;
    text-align: left;
    font-size: 0.875rem;
    font-weight: 700;
    color: #1e293b;
    border-bottom: 2px solid #e2e8f0;
    vertical-align: top;
    position: relative;
    white-space: normal;
    line-height: 1.4;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .th-content {
    position: relative;
  }

  .reports-table th:nth-child(1) { width: 10%; }
  .reports-table th:nth-child(2) { width: 10%; }
  .reports-table th:nth-child(3) { width: 13%; }
  .reports-table th:nth-child(4) { width: 13%; }
  .reports-table th:nth-child(5) { width: 10%; }
  .reports-table th:nth-child(6) { width: 10%; }
  .reports-table th:nth-child(7) { width: 10%; }
  .reports-table th:nth-child(8) { width: 10%; }
  .reports-table th:nth-child(9) { width: 14%; }

  .reports-table th:first-child { border-top-left-radius: 12px; }
  .reports-table th:last-child { border-top-right-radius: 12px; }

  .sort-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    margin-left: 0.5rem;
    font-size: 0.875rem;
    color: #6b7280;
    border-radius: 8px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 32px;
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
    padding: 1rem 0.75rem;
    font-size: 0.875rem;
    color: #374151;
    border-bottom: 1px solid #f1f5f9;
    background: white;
    transition: all 0.2s ease;
    white-space: normal;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.4;
    font-weight: 500;
    word-wrap: break-word;
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

  .positive { color: #059669; font-weight: 600; }
  .negative { color: #dc2626; font-weight: 600; }
  .neutral { color: #6b7280; font-weight: 600; }
  .critical {
    color: #dc2626;
    background-color: #fef2f2;
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

  .th-search-input {
    padding: 0.875rem 0.3rem 0.675rem 2.5rem;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 0.875rem;
    width: 100%;
    outline: none;
    background: #f8fafc url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'/%3e%3c/svg%3e") no-repeat left 0.75rem center;
    background-size: 1.5rem;
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
</style>
