<script lang="ts">
  import VetisStatusBadge from './VetisStatusBadge.svelte';
  import type { Batch } from '$lib/types/batch';
  
  export let batch: Batch;

  function getBatchStatus(batch: Batch) {
    if (!batch) return "Произведено";

    // Статусы в порядке их выполнения
    const statusMapping: Record<string, string> = {
      'in_progress': 'Производится',
      'produced': 'Произведено', 
      'on_hold': 'На холде',
      'submitting': 'Отправляется',
      'submitted': 'Отправлена'
    };

    return statusMapping[batch.status] || 'Произведено';
  }

  function isStepCompleted(batch: Batch, step: string) {
    const currentStatus = getBatchStatus(batch);
    const statusOrder = [
      "Производится",
      "Произведено",
      "На холде",
      "Отправляется",
      "Отправлена",
    ];

    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(step);

    return stepIndex <= currentIndex;
  }
</script>

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
      class:completed={isStepCompleted(batch, "На холде")}
      class:active={getBatchStatus(batch) === "На холде"}
      class:hold={getBatchStatus(batch) === "На холде"}
    >
      <div class="flow-circle-mini">3</div>
      <span>На холде</span>
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

<style>
  .batch-info-card {
    padding: 1rem;
    background: white;
    margin: 0.5rem;
    border-radius: 8px;
    border-left: 3px solid #3b82f6;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
</style>
