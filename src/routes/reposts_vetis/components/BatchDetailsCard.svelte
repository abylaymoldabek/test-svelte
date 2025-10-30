<script lang="ts">
  import VetisStatusBadge from './VetisStatusBadge.svelte';
  import type { Batch } from '$lib/types/batch';
  
  export let batch: Batch;

  function getBatchStatus(batch: Batch) {
    if (!batch) return "Произведено";

    // Статусы в порядке их выполнения (синхронизировано с VetisStatusBadge)
    const statusMapping: Record<string, string> = {
      'new': 'Новая',
      'producing': 'Производится',
      'produced': 'Произведено', 
      'hold': 'Требует корректировки',
      'resumed': 'Возобновлено',
      'sending': 'Отправляется',
      'done': 'Отправлена'
    };

    return statusMapping[batch.status] || 'Произведено';
  }

  function isStepCompleted(batch: Batch, step: string) {
    const currentStatus = getBatchStatus(batch);
    const statusOrder = [
      "Новая",
      "Производится", 
      "Произведено",
      "Требует корректировки",
      "Возобновлено",
      "Отправляется",
      "Отправлена",
    ];

    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(step);

    return stepIndex <= currentIndex;
  }
</script>

{#if batch}
<div class="batch-info-card">
  <div class="batch-info-header">
    <strong>Партия: {batch.party}</strong>
    <span class="batch-info-meta"
      >Продукт: {batch.product} | Произведено: {batch.produced.toLocaleString()}</span
    >
  </div>
  
  <div class="status-section">
    <VetisStatusBadge 
      status={batch.status} 
      reportsSentCount={batch.reports_sent_count}
      reportsAllCount={batch.reports_total_count}
    />
  </div>
  <div class="process-flow-mini">
    <div
      class="flow-item-mini"
      class:completed={isStepCompleted(batch, "Производится")}
      class:active={getBatchStatus(batch) === "Производится"}
    >
      <div class="flow-circle-mini">1</div>
      <span>Производится</span>
    </div>
    <div class="flow-arrow-mini">→</div>
    <div
      class="flow-item-mini"
      class:completed={isStepCompleted(batch, "Произведено")}
      class:active={getBatchStatus(batch) === "Произведено"}
    >
      <div class="flow-circle-mini">2</div>
      <span>Произведено</span>
    </div>
    <div class="flow-arrow-mini">→</div>
    <div
      class="flow-item-mini"
      class:completed={isStepCompleted(batch, "Требует корректировки")}
      class:active={getBatchStatus(batch) === "Требует корректировки"}
      class:hold={getBatchStatus(batch) === "Требует корректировки"}
    >
      <div class="flow-circle-mini">3</div>
      <span>Требует корректировки</span>
    </div>
    <div class="flow-arrow-mini">→</div>
    <div
      class="flow-item-mini"
      class:completed={isStepCompleted(batch, "Отправляется")}
      class:active={getBatchStatus(batch) === "Отправляется"}
    >
      <div class="flow-circle-mini">4</div>
      <span>Отправляется</span>
    </div>
    <div class="flow-arrow-mini">→</div>
    <div
      class="flow-item-mini"
      class:completed={isStepCompleted(batch, "Отправлена")}
      class:active={getBatchStatus(batch) === "Отправлена"}
    >
      <div class="flow-circle-mini">5</div>
      <span>Отправлена</span>
    </div>
  </div>
</div>
{/if}

<style>
  .batch-info-card {
    padding: 1rem;
    background: white;
    margin: 0.5rem;
    border-radius: 8px;
    border-left: 3px solid #3b82f6;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    max-height: 400px;
    overflow-y: auto;
    flex-shrink: 0;
    box-sizing: border-box;
  }

  .batch-info-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    font-size: 0.875rem;
  }

  .batch-info-meta {
    color: #64748b;
    font-weight: normal;
  }

  
  .status-section {
    margin-bottom: 1rem;
    display: flex;
    justify-content: center;
  }

  .process-flow-mini {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    justify-content: center;
  }

  .flow-item-mini {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.625rem;
    color: #6b7280;
  }

  .flow-circle-mini {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f3f4f6;
    color: #6b7280;
    font-size: 0.625rem;
    font-weight: 600;
  }

  .flow-item-mini.completed .flow-circle-mini {
    background: #059669;
    color: white;
  }

  .flow-item-mini.completed {
    color: #059669;
    font-weight: 600;
  }

  .flow-item-mini.active .flow-circle-mini {
    background: #6366f1;
    color: white;
  }

  .flow-item-mini.hold .flow-circle-mini {
    background: #dc2626;
    color: white;
  }

  .flow-arrow-mini {
    color: #d1d5db;
    font-size: 0.875rem;
  }

  /* Адаптивные стили для мобильных устройств */
  @media (max-width: 767px) {
    .batch-info-card {
      margin: 0.25rem;
      padding: 0.75rem;
      max-height: 350px;
    }

    .batch-info-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
      font-size: 0.8rem;
    }

    .batch-info-meta {
      font-size: 0.75rem;
    }

    .process-flow-mini {
      gap: 0.25rem;
      flex-wrap: nowrap;
      overflow-x: auto;
      padding: 0.5rem 0;
    }

    .flow-item-mini {
      gap: 0.125rem;
      font-size: 0.55rem;
      min-width: fit-content;
      flex-shrink: 0;
    }

    .flow-circle-mini {
      width: 18px;
      height: 18px;
      font-size: 0.55rem;
    }

    .flow-arrow-mini {
      font-size: 0.75rem;
      flex-shrink: 0;
    }
  }

  /* Стили для планшетов */
  @media (min-width: 768px) and (max-width: 1023px) {
    .batch-info-card {
      margin: 0.375rem;
      padding: 0.875rem;
      max-height: 375px;
    }

    .batch-info-header {
      font-size: 0.825rem;
    }

    .flow-item-mini {
      font-size: 0.6rem;
    }

    .flow-circle-mini {
      width: 19px;
      height: 19px;
      font-size: 0.6rem;
    }
  }
</style>
