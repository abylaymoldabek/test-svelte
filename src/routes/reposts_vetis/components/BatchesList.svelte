<script lang="ts">
  import VetisStatusBadge from "./VetisStatusBadge.svelte";
  import BatchDetailsCard from "./BatchDetailsCard.svelte";
  import { authStore } from "$lib/stores/auth";
  import { isSuperAdmin } from "$lib/utils/role-guard";

  export let batches: any[];
  export let selectedBatch: any;
  export let deadlineTimezone: string;

  // Event dispatchers
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  function selectBatch(batch: any) {
    dispatch("select", batch);
  }

  function openConfirmModal() {
    dispatch("openConfirm");
  }

  // Helper functions for date formatting
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

  // Функции для расчета разности
  function isCriticalDeviation(produced: number, vetis: number) {
    const criticalPercentage = 5;
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

  // Helper functions
  function getTimeUntilDeadline(deadline: string, status: string = "") {
    if (!deadline) return "";
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
</script>

<div class="cards-container">
  {#each batches as batch}
    <div
      class="batch-card"
      class:selected={selectedBatch === batch}
      role="button"
      tabindex="0"
      on:click={() => selectBatch(batch)}
      on:keydown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectBatch(batch);
        }
      }}
    >
      <div class="card-header">
        <span class="product-name">{batch.product}</span>
        <span class="party-id">Партия: {batch.party}</span>
      </div>
      <div class="card-body">
        <div class="info-row">
          <span class="label">Дата производства:</span>
          <span class="value">{formatDateInTimezone(batch.productionDate, deadlineTimezone)}</span>
        </div>
        <div class="info-row">
          <span class="label">Срок годности:</span>
          <span class="value">{formatDateInTimezone(batch.expiryDate, deadlineTimezone)}</span>
        </div>
        <div class="info-row">
          <span class="label">Произведено:</span>
          <span class="value">{batch.produced.toLocaleString()}</span>
        </div>
        <div class="info-row">
          <span class="label">Данные ВетИС:</span>
          <span class="value">{batch.vetis.toLocaleString()}</span>
        </div>
        <div class="info-row">
          <span class="label">Разница:</span>
          <span 
            class="value difference-value"
            class:critical={isCriticalDeviation(batch.produced, batch.vetis)}
            class:positive={!isCriticalDeviation(batch.produced, batch.vetis) && calculatePercentage(batch.produced, batch.vetis) < 0}
            class:negative={!isCriticalDeviation(batch.produced, batch.vetis) && calculatePercentage(batch.produced, batch.vetis) > 0}
            class:neutral={!isCriticalDeviation(batch.produced, batch.vetis) && calculatePercentage(batch.produced, batch.vetis) === 0}
          >
            {formatDifference(calculateDifference(batch.produced, batch.vetis))}
            ({calculatePercentage(batch.produced, batch.vetis)}%)
          </span>
        </div>
        <div class="info-row">
          <span class="label">До отправки:</span>
          <span
            class="value deadline-value"
            class:deadline-overdue={getDeadlineStatus(batch.sent_at, batch.status) === "overdue"}
            class:deadline-critical={getDeadlineStatus(batch.sent_at, batch.status) === "critical"}
            class:deadline-warning={getDeadlineStatus(batch.sent_at, batch.status) === "warning"}
          >
            {getTimeUntilDeadline(batch.sent_at, batch.status)}
            <small>{formatDeadlineInTimezone(batch.sent_at, deadlineTimezone)}</small>
          </span>
        </div>
      </div>
      <div class="card-footer">
        <div class="status-section">
          <span class="status-label">Статус:</span>
          <VetisStatusBadge 
            status={batch.status} 
            reportsSentCount={batch.reportsSentCount}
            reportsAllCount={batch.reportsAllCount}
          />
        </div>
        {#if batch.status === "На холде" && isSuperAdmin($authStore.user)}
          <button class="send-btn-mobile" on:click|stopPropagation={openConfirmModal}>
            Отправить
          </button>
        {/if}
      </div>

      {#if selectedBatch === batch}
        <div class="details-container-mobile">
          <BatchDetailsCard batch={selectedBatch} />
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .cards-container {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }

  .batch-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    padding: 1rem;
    transition: all 0.2s ease-in-out;
    border: 1px solid #e2e8f0;
  }

  .batch-card.selected {
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
    border-color: #3b82f6;
    transform: translateY(-2px);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .product-name {
    font-weight: 600;
    color: #1e293b;
  }

  .party-id {
    font-size: 0.8rem;
    color: #64748b;
  }

  .card-body .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.375rem 0;
    border-bottom: 1px solid #f1f5f9;
  }

  .card-body .info-row:last-child {
    border-bottom: none;
  }

  .card-body .label {
    font-size: 0.8rem;
    color: #475569;
    font-weight: 500;
  }

  .card-body .value {
    font-weight: 600;
    color: #1e293b;
    font-size: 0.875rem;
    text-align: right;
    flex-shrink: 0;
    max-width: 60%;
  }

  .deadline-value {
    text-align: right;
  }
  .deadline-value small {
    display: block;
    font-size: 0.75rem;
    color: #64748b;
  }

  .deadline-warning { color: #d97706; }
  .deadline-critical { color: #dc2626; font-weight: 600; }
  .deadline-overdue { color: #b91c1c; font-weight: 700; }

  /* Стили для разности */
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
    font-weight: 500;
  }
  .difference-value.critical {
    color: #dc2626;
    background-color: #fef2f2;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    font-weight: 700;
    font-size: 0.8rem;
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 0.75rem;
    margin-top: 0.75rem;
    border-top: 1px solid #f1f5f9;
  }

  .status-section {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .status-label {
    font-size: 0.8rem;
    color: #475569;
    font-weight: 500;
  }

  .send-btn-mobile {
    background: #4f46e5;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
  }

  .details-container-mobile {
    margin-top: 1rem;
    border-top: 1px dashed #cbd5e1;
    padding-top: 1rem;
  }
</style>
