<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { tokenPayload } from '$lib/stores/token.js';
  import { useAuthGuard } from '$lib/utils/auth-guard.js';
  import PageHeader from '$lib/components/PageHeader.svelte';

  let authGuard: { isAuthorized: boolean; cleanup: () => void; checkAuth: () => Promise<boolean>; } | null = null;
  let companyName = 'OKTO';
  let expirationDate = '27 марта, 2024';
  let timezone = '(GMT+03:00) Moscow';
  let industry = 'Молочная промышленность';
  let gln = '000011112';
  let linePrefix = '';
  let palletLabels = 1;
  let boxLabels = 1;
  let printBatchNumber = false;
  let shipInBoxes = true;
  let shipInPallets = true;
  let useProductionDate = true;
  let useForcedProductionDate = false;
  let useTestContour = false;
  let use24hPeriod = true;
  let useIndividParameters = true;
  let sendBatchNumber = true;
  let tokenPeriod = 'За все время';
  let interfaceColor = '#4b4bc7';

  onMount(() => {
    // Initialize auth guard
    authGuard = useAuthGuard('/settings');
  });

  onDestroy(() => {
    if (authGuard) {
      authGuard.cleanup();
    }
  });

  function saveSettings() {
    // TODO: Implement settings save
    console.log('Saving settings...');
  }
</script>

{#if $tokenPayload}
<div class="settings-page">
  <PageHeader title="Настройки компании">
    <div class="expiration-info">
      <span class="expiration-label">Дата истечения плана</span>
      <span class="expiration-date">{expirationDate}</span>
      <button class="renew-button">Обновить</button>
    </div>
  </PageHeader>

  <div class="settings-grid">
    <!-- Основные настройки -->
    <section class="settings-section">
      <h2>Основные настройки</h2>
      <div class="form-grid">
        <div class="form-group">
          <label for="company-name">Название</label>
          <input type="text" id="company-name" bind:value={companyName} />
        </div>

        <div class="form-group">
          <label for="timezone">Часовой пояс</label>
          <select id="timezone" bind:value={timezone}>
            <option value="(GMT+03:00) Moscow">(GMT+03:00) Moscow</option>
          </select>
        </div>

        <div class="form-group">
          <label for="industry">Товарная группа</label>
          <select id="industry" bind:value={industry}>
            <option value="Молочная промышленность">Молочная промышленность</option>
          </select>
        </div>
      </div>
    </section>

    <!-- Настройки этикетки -->
    <section class="settings-section">
      <h2>Настройки этикетки</h2>
      <div class="form-grid">
        <div class="form-group">
          <label for="gln">Глобальный номер места нахождения</label>
          <input type="text" id="gln" bind:value={gln} />
        </div>

        <div class="form-group">
          <label for="line-prefix">Префикс линии</label>
          <input type="text" id="line-prefix" bind:value={linePrefix} />
        </div>

        <div class="form-group">
          <label for="pallet-labels">Печать этикеток палета (шт)</label>
          <div class="number-input">
            <button on:click={() => palletLabels = Math.max(0, palletLabels - 1)}>-</button>
            <input type="number" id="pallet-labels" bind:value={palletLabels} min="0" />
            <button on:click={() => palletLabels++}>+</button>
          </div>
        </div>

        <div class="form-group">
          <label for="box-labels">Печать этикеток короба (шт)</label>
          <div class="number-input">
            <button on:click={() => boxLabels = Math.max(0, boxLabels - 1)}>-</button>
            <input type="number" id="box-labels" bind:value={boxLabels} min="0" />
            <button on:click={() => boxLabels++}>+</button>
          </div>
        </div>
      </div>

      <div class="shipping-options">
        <h3>Отгрузки</h3>
        <div class="checkbox-group">
          <label class="checkbox-label">
            <input type="checkbox" bind:checked={shipInBoxes} />
            <span>В коробах</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" bind:checked={shipInPallets} />
            <span>В палетах</span>
          </label>
        </div>
      </div>
    </section>

    <!-- Дополнительные настройки -->
    <section class="settings-section">
      <h2>Дополнительные настройки</h2>
      <div class="checkbox-list">
        <label class="checkbox-label">
          <input type="checkbox" bind:checked={useProductionDate} />
          <span>Использовать дату производства при создании кодов и агрегации</span>
        </label>

        <label class="checkbox-label">
          <input type="checkbox" bind:checked={useForcedProductionDate} />
          <span>Не использовать принудительную дату производства</span>
        </label>

        <label class="checkbox-label">
          <input type="checkbox" bind:checked={useTestContour} />
          <span>Использовать тестовый контур для получения динамического токена и отправки отчетов</span>
        </label>

        <label class="checkbox-label">
          <input type="checkbox" bind:checked={use24hPeriod} />
          <span>Использовать период в СУЗ и ИС МТ отчетах в пределах 24 часов</span>
        </label>

        <label class="checkbox-label">
          <input type="checkbox" bind:checked={useIndividParameters} />
          <span>Использовать параметры индивида при создании кодов</span>
        </label>

        <label class="checkbox-label">
          <input type="checkbox" bind:checked={sendBatchNumber} />
          <span>Отправлять номер партии в СУЗ отчете о нанесении</span>
        </label>
      </div>

      <div class="form-group">
        <label for="token-period">Период отображения кодов</label>
        <select id="token-period" bind:value={tokenPeriod}>
          <option>За все время</option>
        </select>
      </div>

      <div class="form-group">
        <label for="interface-color">Цвет интерфейса</label>
        <input type="color" id="interface-color" bind:value={interfaceColor} />
        <button class="reset-color">Цвет по умолчанию</button>
      </div>
    </section>
  </div>

  <div class="form-actions">
    <button class="save-button" on:click={saveSettings}>Сохранить</button>
  </div>
</div>
{:else}
<div class="loading-container">
  <div class="loading-spinner"></div>
  <p>Проверка авторизации...</p>
</div>
{/if}

<style>
  .settings-page {
    padding: 2rem;
    background: #f8fafc;
    min-height: 100vh;
    max-width: 1200px;
    margin: 0 auto;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: #f8fafc;
    gap: 1rem;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e5e7eb;
    border-top: 4px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-container p {
    color: #6b7280;
    font-size: 1rem;
    margin: 0;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }



  .expiration-info {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    background: #f8fafc;
    padding: 0.75rem 1.25rem;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
  }

  .expiration-label {
    color: #6b7280;
    font-size: 0.875rem;
  }

  .expiration-date {
    font-weight: 600;
    color: #111827;
  }

  .renew-button {
    padding: 0.625rem 1.25rem;
    background: #4b4bc7;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(75, 75, 199, 0.1);
  }

  .renew-button:hover {
    background: #4040b2;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(75, 75, 199, 0.2);
  }

  .settings-grid {
    display: grid;
    gap: 2rem;
  }

  .settings-section {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.3s ease;
  }

  .settings-section:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 15px rgba(0, 0, 0, 0.1);
  }

  h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #f1f5f9;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
    position: relative;
  }

  label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #4b5563;
    margin-bottom: 0.75rem;
    transition: color 0.2s ease;
  }

  .form-group:focus-within label {
    color: #4b4bc7;
  }

  input[type="text"],
  select {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 0.875rem;
    transition: all 0.2s ease;
    background: #f8fafc;
  }

  input[type="text"]:hover,
  select:hover {
    border-color: #d1d5db;
  }

  input[type="text"]:focus,
  select:focus {
    outline: none;
    border-color: #4b4bc7;
    background: white;
    box-shadow: 0 0 0 4px rgba(75, 75, 199, 0.1);
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 6px;
    transition: background-color 0.2s ease;
  }

  .checkbox-label:hover {
    background: #f8fafc;
  }

  .checkbox-label input[type="checkbox"] {
    appearance: none;
    width: 1.25rem;
    height: 1.25rem;
    border: 2px solid #d1d5db;
    border-radius: 4px;
    margin: 0;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
  }

  .checkbox-label input[type="checkbox"]:checked {
    background: #4b4bc7;
    border-color: #4b4bc7;
  }

  .checkbox-label input[type="checkbox"]:checked::after {
    content: "✓";
    position: absolute;
    color: white;
    font-size: 0.875rem;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  .checkbox-label:focus-within {
    outline: 2px solid #4b4bc7;
    outline-offset: 2px;
  }

  .number-input {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #f8fafc;
    padding: 0.25rem;
    border-radius: 8px;
    border: 2px solid #e5e7eb;
  }

  .number-input input {
    width: 80px;
    text-align: center;
    border: none;
    padding: 0.5rem;
    font-size: 0.875rem;
    background: white;
    border-radius: 4px;
  }

  .number-input button {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    cursor: pointer;
    color: #4b5563;
    font-size: 1.125rem;
    transition: all 0.2s ease;
  }

  .number-input button:hover {
    background: #4b4bc7;
    border-color: #4b4bc7;
    color: white;
  }

  .shipping-options {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 2px solid #f1f5f9;
  }

  .shipping-options h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 1rem;
  }

  .checkbox-group {
    display: flex;
    gap: 2rem;
  }

  .checkbox-list {
    display: grid;
    gap: 0.75rem;
  }

  .form-actions {
    margin-top: 3rem;
    display: flex;
    justify-content: flex-end;
    padding: 2rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .save-button {
    padding: 0.875rem 2.5rem;
    background: #22c55e;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(34, 197, 94, 0.1);
  }

  .save-button:hover {
    background: #16a34a;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(34, 197, 94, 0.2);
  }

  .reset-color {
    margin-left: 1rem;
    padding: 0.75rem 1.5rem;
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    color: #4b5563;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .reset-color:hover {
    border-color: #d1d5db;
    background: #f8fafc;
  }
</style>
