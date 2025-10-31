<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { tokenPayload } from "$lib/stores/token.js";
  import { useAuthGuard } from "$lib/utils/auth-guard.js";
  import { authStore } from "$lib/stores/auth";
  import { isAdmin } from "$lib/utils/role-guard";
  import { authService } from "$lib/services/auth";

  let authGuard: {
    isAuthorized: boolean;
    cleanup: () => void;
    checkAuth: () => Promise<boolean>;
  } | null = null;
  let companyName = "";
  let expirationDate = "";
  let timezone = "";
  let industry = "";
  let gln = "";
  let linePrefix = "";
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
  let tokenPeriod = "За все время";
  let interfaceColor = "#4b4bc7";

  // Настройки ВетИС
  let criticalPercentage = 5;
  let delayedDryDays = 15;
  let delayedWetDays = 15;
  let forcedDryDays = 15;
  let forcedWetDays = 15;

  let loading = false;
  let notification = { show: false, type: 'success', message: '' };

  onMount(() => {
    // Initialize auth guard
    authGuard = useAuthGuard("/settings");

    // Загружаем настройки с бэка
    fetchCompanySettings();
  });

  function showNotification(type: 'success' | 'error', message: string) {
    notification = { show: true, type, message };
    setTimeout(() => {
      notification = { show: false, type: 'success', message: '' };
    }, 4000);
  }

  onDestroy(() => {
    if (authGuard) {
      authGuard.cleanup();
    }
  });

  // Получаем company_id из хранилища токена (safely)
  function getCompanyIdFromToken(): string | null {
    try {
      // Сначала пробуем взять из authService helper
      const cid = authService.getCompanyId();
      if (cid) return cid;
      // fallback: try read from tokenPayload store directly
      let payloadValue: any = null;
      tokenPayload.subscribe((v) => (payloadValue = v))();
      return payloadValue?.company_id || null;
    } catch (err) {
      console.error('getCompanyIdFromToken error', err);
      return null;
    }
  }

  async function fetchCompanySettings() {
    const companyId = getCompanyIdFromToken();
    if (!companyId) {
      console.warn('Company id not found in token, skipping fetch');
      return;
    }

    loading = true;
    try {
      // Use relative /api path so dev proxy (vite) or SvelteKit proxy can handle it
      const url = `/api/v1/companies/${companyId}`;
      const token = authService.getStoredToken();

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        }
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch company: ${res.status} ${text}`);
      }

      const data = await res.json();

      // Map response to local fields
      companyName = data.name || companyName;
      timezone = data.time_zone || timezone;
      // Vetis settings
      criticalPercentage = data.vetis_critical_discrepancy_percent ?? criticalPercentage;
      delayedDryDays = data.deferred_reports_dry_percent ?? delayedDryDays;
      delayedWetDays = data.deferred_reports_wet_percent ?? delayedWetDays;
      forcedDryDays = data.forced_reports_dry_percent ?? forcedDryDays;
      forcedWetDays = data.forced_reports_wet_percent ?? forcedWetDays;

    } catch (err: any) {
      console.error('fetchCompanySettings error', err);
      showNotification('error', 'Ошибка загрузки настроек: ' + (err?.message || 'неизвестная ошибка'));
    } finally {
      loading = false;
    }
  }

  // Сохраняем настройки на сервер (PUT)
  async function saveSettings() {
    try {
      const companyId = getCompanyIdFromToken();
      if (!companyId) {
        showNotification('error', 'Company ID не найден в токене');
        return;
      }

      const url = `/api/v1/companies/${companyId}`;
      const token = authService.getStoredToken();

      const payload = {
        name: companyName,
        time_zone: timezone || '',
        // created_at: keep same as before if available — backend usually ignores this when updating
        updated_at: new Date().toISOString(),
        vetis_critical_discrepancy_percent: Number(criticalPercentage),
        deferred_reports_dry_percent: Number(delayedDryDays),
        deferred_reports_wet_percent: Number(delayedWetDays),
        forced_reports_dry_percent: Number(forcedDryDays),
        forced_reports_wet_percent: Number(forcedWetDays)
      };

      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to save company: ${res.status} ${text}`);
      }

      const data = await res.json();

      // Update local fields with server response
      companyName = data.name || companyName;
      timezone = data.time_zone || timezone;
      criticalPercentage = data.vetis_critical_discrepancy_percent ?? criticalPercentage;
      delayedDryDays = data.deferred_reports_dry_percent ?? delayedDryDays;
      delayedWetDays = data.deferred_reports_wet_percent ?? delayedWetDays;
      forcedDryDays = data.forced_reports_dry_percent ?? forcedDryDays;
      forcedWetDays = data.forced_reports_wet_percent ?? forcedWetDays;

      showNotification('success', 'Настройки успешно сохранены!');
    } catch (err: any) {
      console.error('saveSettings error', err);
      showNotification('error', 'Ошибка при сохранении настроек: ' + (err?.message || 'неизвестная ошибка'));
    }
  }
</script>

{#if $tokenPayload}
  <!-- Notification Component -->
  {#if notification.show}
    <div class="notification notification-{notification.type}">
      <div class="notification-content">
        <div class="notification-icon">
          {#if notification.type === 'success'}
            ✓
          {:else}
            ⚠
          {/if}
        </div>
        <span class="notification-message">{notification.message}</span>
        <button class="notification-close" on:click={() => notification.show = false}>×</button>
      </div>
    </div>
  {/if}

  <div class="settings-page">
    <!-- <div class="expiration-info">
      <span class="expiration-label">Дата истечения плана</span>
      <span class="expiration-date">{expirationDate}</span>
      <button class="renew-button">Обновить</button>
    </div> -->

    <div class="settings-grid">
      <!-- Основные настройки -->
      <section class="settings-section">
        <h2>Основные настройки</h2>
        <div class="form-grid">
          <div class="form-group">
            <label for="company-name">Название</label>
            <input type="text" id="company-name" bind:value={companyName} />
          </div>

          <!-- <div class="form-group">
            <label for="timezone">Часовой пояс</label>
            <select id="timezone" bind:value={timezone}>
              <option value="(GMT+03:00) Moscow">(GMT+03:00) Moscow</option>
            </select>
          </div> -->

          <!-- <div class="form-group">
            <label for="industry">Товарная группа</label>
            <select id="industry" bind:value={industry}>
              <option value="Молочная промышленность"
                >Молочная промышленность</option
              >
            </select>
          </div> -->
        </div>
      </section>

      <!-- Настройки этикетки -->
      <!-- <section class="settings-section">
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
              <button
                on:click={() => (palletLabels = Math.max(0, palletLabels - 1))}
                >-</button
              >
              <input
                type="number"
                id="pallet-labels"
                bind:value={palletLabels}
                min="0"
              />
              <button on:click={() => palletLabels++}>+</button>
            </div>
          </div>

          <div class="form-group">
            <label for="box-labels">Печать этикеток короба (шт)</label>
            <div class="number-input">
              <button on:click={() => (boxLabels = Math.max(0, boxLabels - 1))}
                >-</button
              >
              <input
                type="number"
                id="box-labels"
                bind:value={boxLabels}
                min="0"
              />
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
      </section> -->

      <!-- Дополнительные настройки -->
      <!-- <section class="settings-section">
        <h2>Дополнительные настройки</h2>
        <div class="checkbox-list">
          <label class="checkbox-label">
            <input type="checkbox" bind:checked={useProductionDate} />
            <span
              >Использовать дату производства при создании кодов и агрегации</span
            >
          </label>

          <label class="checkbox-label">
            <input type="checkbox" bind:checked={useForcedProductionDate} />
            <span>Не использовать принудительную дату производства</span>
          </label>

          <label class="checkbox-label">
            <input type="checkbox" bind:checked={useTestContour} />
            <span
              >Использовать тестовый контур для получения динамического токена и
              отправки отчетов</span
            >
          </label>

          <label class="checkbox-label">
            <input type="checkbox" bind:checked={use24hPeriod} />
            <span
              >Использовать период в СУЗ и ИС МТ отчетах в пределах 24 часов</span
            >
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
          <input
            type="color"
            id="interface-color"
            bind:value={interfaceColor}
          />
          <button class="reset-color">Цвет по умолчанию</button>
        </div>
      </section> -->
      <section class="settings-vetis">
        <h2>Настройки ВетИС</h2>
        <div class="form-grid">
          <div class="form-group">
            <label for="critical-percentage"
              >Критичный процент расхождения с ВетИС (%)</label
            >
            <input
              type="number"
              id="critical-percentage"
              bind:value={criticalPercentage}
              min="0"
              max="100"
              disabled={!isAdmin($authStore.user)}
            />
          </div>

          <div class="form-group">
            <label for="delayed-dry">Отложенные отчеты DRY (%)</label>
            <input
              type="number"
              id="delayed-dry"
              bind:value={delayedDryDays}
              min="0"
              disabled={!isAdmin($authStore.user)}
            />
          </div>

          <div class="form-group">
            <label for="delayed-wet">Отложенные отчеты WET (%)</label>
            <input
              type="number"
              id="delayed-wet"
              bind:value={delayedWetDays}
              min="0"
              disabled={!isAdmin($authStore.user)}
            />
          </div>

          <div class="form-group">
            <label for="forced-dry"
              >Принудительная отправка отчетов DRY (%)</label
            >
            <input
              type="number"
              id="forced-dry"
              bind:value={forcedDryDays}
              min="0"
              disabled={!isAdmin($authStore.user)}
            />
          </div>

          <div class="form-group">
            <label for="forced-wet"
              >Принудительная отправка отчетов WET (%)</label
            >
            <input
              type="number"
              id="forced-wet"
              bind:value={forcedWetDays}
              min="0"
              disabled={!isAdmin($authStore.user)}
            />
          </div>
        </div>
      </section>
    </div>

    <div class="form-actions">
      {#if isAdmin($authStore.user)}
        <button class="save-button" on:click={saveSettings}>Сохранить</button>
      {/if}
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
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
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
    box-shadow:
      0 4px 6px rgba(0, 0, 0, 0.05),
      0 10px 15px rgba(0, 0, 0, 0.1);
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
  input[type="number"],
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
  input[type="number"]:hover,
  select:hover {
    border-color: #d1d5db;
  }

  input[type="text"]:focus,
  input[type="number"]:focus,
  select:focus {
    outline: none;
    border-color: #4b4bc7;
    background: white;
    box-shadow: 0 0 0 4px rgba(75, 75, 199, 0.1);
  }

  input[type="text"]:disabled,
  input[type="number"]:disabled,
  select:disabled {
    background: #f1f5f9;
    color: #64748b;
    cursor: not-allowed;
    border-color: #e2e8f0;
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

  .access-denied {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem 2rem;
    background: #fef2f2;
    border: 2px solid #fecaca;
    border-radius: 8px;
    color: #dc2626;
    font-weight: 500;
    font-size: 0.875rem;
    text-align: center;
  }

  .access-denied p {
    margin: 0;
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

  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type="number"] {
    appearance: textfield;
    -moz-appearance: textfield;
  }

  /* Планшетные стили для iPad */
  @media (min-width: 768px) and (max-width: 1024px) {
    .settings-page {
      padding: 1.5rem;
      max-width: 100%;
    }

    .expiration-info {
      gap: 2rem;
      padding: 1rem 1.5rem;
    }

    .renew-button {
      padding: 0.75rem 1.5rem;
      min-height: 48px;
    }

    .settings-section {
      padding: 2.5rem;
      border-radius: 16px;
    }

    .form-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 2.5rem;
    }

    .form-group {
      margin-bottom: 1.75rem;
    }

    label {
      font-size: 1rem;
      margin-bottom: 0.75rem;
    }

    input,
    select {
      font-size: 16px !important;
      padding: 0.875rem;
      min-height: 48px;
      border-radius: 8px;
    }

    input[type="color"] {
      height: 54px;
      margin-bottom: 1rem;
      border-radius: 8px;
    }

    .reset-color {
      padding: 0.75rem 1.5rem;
      min-height: 48px;
      border-radius: 8px;
    }

    .form-actions {
      margin-top: 3rem;
      padding: 1.5rem;
    }

    .save-button {
      padding: 1rem 2rem;
      font-size: 1rem;
      min-height: 52px;
      border-radius: 10px;
    }

    h2 {
      font-size: 1.375rem;
      margin-bottom: 2.5rem;
    }

    .settings-grid {
      gap: 2.5rem;
    }
  }

  /* iPad Portrait - одна колонка для форм */
  @media (min-width: 768px) and (max-width: 1024px) and (orientation: portrait) {
    .form-grid {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .settings-section {
      padding: 2rem;
    }
  }

  /* iPad Landscape - две колонки */
  @media (min-width: 1024px) and (max-width: 1366px) and (orientation: landscape) {
    .settings-page {
      padding: 2rem;
    }

    .form-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 3rem;
    }

    .settings-section {
      padding: 3rem;
    }

    h2 {
      font-size: 1.5rem;
    }
  }

  /* Медиа-запросы для мобильных устройств */
  @media (max-width: 768px) {
    .settings-page {
      padding: 1rem;
      margin: 0;
      max-width: 100%;
    }

    .expiration-info {
      flex-direction: column;
      align-items: stretch;
      gap: 1rem;
      text-align: center;
    }

    .renew-button {
      width: 100%;
    }

    .settings-section {
      padding: 1.5rem;
      border-radius: 12px;
    }

    .form-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    label {
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }

    input,
    select {
      font-size: 16px; /* Предотвращает зум на iOS */
    }

    input[type="color"] {
      width: 100%;
      height: 50px;
      margin-bottom: 1rem;
    }

    .reset-color {
      margin-left: 0;
      width: 100%;
    }

    .form-actions {
      margin-top: 2rem;
      padding: 1rem;
      position: sticky;
      bottom: 0;
      background: white;
      border-top: 1px solid #e5e7eb;
      border-radius: 0;
    }

    .save-button {
      width: 100%;
      padding: 1rem;
      font-size: 1rem;
    }

    h2 {
      font-size: 1.125rem;
      margin-bottom: 1.5rem;
    }

    .settings-grid {
      gap: 1.5rem;
    }
  }

  @media (max-width: 480px) {
    .settings-page {
      padding: 0.75rem;
    }

    .settings-section {
      padding: 1rem;
      border-radius: 8px;
    }

    .form-group {
      margin-bottom: 0.75rem;
    }

    label {
      font-size: 0.8rem;
    }

    input,
    select {
      padding: 0.75rem;
      font-size: 16px;
    }

    input[type="color"] {
      height: 45px;
    }

    h2 {
      font-size: 1rem;
      margin-bottom: 1rem;
    }

    .expiration-info {
      padding: 1rem;
      font-size: 0.875rem;
    }

    .expiration-label {
      font-size: 0.8rem;
    }

    .save-button {
      padding: 0.875rem;
      font-size: 0.9rem;
    }

    .settings-grid {
      gap: 1rem;
    }
  }

  /* Notification Styles */
  .notification {
    position: fixed;
    top: 2rem;
    right: 2rem;
    z-index: 1000;
    min-width: 320px;
    max-width: 500px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(10px);
    animation: slideIn 0.3s ease-out;
  }

  .notification-success {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    border-left: 4px solid #15803d;
  }

  .notification-error {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    border-left: 4px solid #b91c1c;
  }

  .notification-content {
    display: flex;
    align-items: center;
    padding: 1rem 1.25rem;
    color: white;
  }

  .notification-icon {
    font-size: 1.25rem;
    font-weight: bold;
    margin-right: 0.75rem;
    flex-shrink: 0;
  }

  .notification-message {
    flex: 1;
    font-weight: 500;
    line-height: 1.4;
  }

  .notification-close {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    margin-left: 0.75rem;
    opacity: 0.8;
    transition: opacity 0.2s ease;
    flex-shrink: 0;
  }

  .notification-close:hover {
    opacity: 1;
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  /* Mobile notification adjustments */
  @media (max-width: 768px) {
    .notification {
      top: 1rem;
      right: 1rem;
      left: 1rem;
      min-width: auto;
      max-width: none;
    }
  }
</style>
