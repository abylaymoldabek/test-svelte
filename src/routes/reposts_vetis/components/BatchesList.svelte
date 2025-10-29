<script lang="ts">
  import VetisStatusBadge from "./VetisStatusBadge.svelte";
  import BatchDetailsCard from "./BatchDetailsCard.svelte";

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
          <span class="label">Произведено:</span>
          <span class="value">{batch.produced.toLocaleString()}</span>
        </div>
        <div class="info-row">
          <span class="label">Данные ВетИС:</span>
          <span class="value">{batch.vetis.toLocaleString()}</span>
        </div>
        <div class="info-row">
          <span class="label">До отправки:</span>
          <span
            class="value deadline-value"
            class:deadline-overdue={getDeadlineStatus(batch.deadline, batch.status) === "overdue"}
            class:deadline-critical={getDeadlineStatus(batch.deadline, batch.status) === "critical"}
            class:deadline-warning={getDeadlineStatus(batch.deadline, batch.status) === "warning"}
          >
            {getTimeUntilDeadline(batch.deadline, batch.status)}
            <small>{formatDeadlineInTimezone(batch.deadline, deadlineTimezone)}</small>
          </span>
        </div>
      </div>
      <div class="card-footer">
        <VetisStatusBadge 
          status={batch.status} 
          reportsSentCount={batch.reportsSentCount}
          reportsAllCount={batch.reportsAllCount}
        />
        {#if batch.status === "На холде"}
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
    padding: 0.5rem 0;
  }

  .card-body .label {
    font-size: 0.875rem;
    color: #475569;
  }

  .card-body .value {
    font-weight: 500;
    color: #1e293b;
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

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 0.75rem;
    margin-top: 0.75rem;
    border-top: 1px solid #f1f5f9;
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
