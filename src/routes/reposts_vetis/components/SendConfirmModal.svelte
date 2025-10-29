<script lang="ts">
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  function confirm() {
    dispatch("confirm");
  }

  function cancel() {
    dispatch("cancel");
  }
</script>

<div class="modal-overlay" role="dialog" aria-modal="true" tabindex="-1">
  <div class="modal-content" role="document">
    <div class="modal-header">
      <h3>Экран Подтверждения</h3>
    </div>
    <div class="modal-body">
      <p>Точно хотите отправить партию ВСД?</p>
    </div>
    <div class="modal-actions">
      <button class="btn-cancel" on:click={cancel}>Нет</button>
      <button class="btn-confirm" on:click={confirm}>Да</button>
    </div>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    min-width: 400px;
    max-width: 500px;
  }

  .modal-header {
    padding: 1.5rem 1.5rem 0;
    border-bottom: 1px solid #e5e7eb;
  }

  .modal-header h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #374151;
    margin: 0;
    padding-bottom: 1rem;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .modal-body p {
    color: #6b7280;
    line-height: 1.6;
    margin: 0;
  }

  .modal-actions {
    display: flex;
    gap: 0.75rem;
    padding: 1.5rem;
    justify-content: flex-end;
  }

  .btn-cancel {
    background: white;
    border: 1px solid #d1d5db;
    color: #374151;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-size: 0.875rem;
    cursor: pointer;
  }

  .btn-cancel:hover {
    background: #f9fafb;
  }

  .btn-confirm {
    background: #6366f1;
    border: none;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-size: 0.875rem;
    cursor: pointer;
  }

  .btn-confirm:hover {
    background: #5046e4;
  }
</style>
