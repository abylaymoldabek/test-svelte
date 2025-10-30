<script context="module">
  export const prerender = false;
</script>

<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { companyId, initializeTokenPayload } from '$lib/stores/token.js';
  import { authService } from '$lib/services/auth.js';

  interface Product {
    name?: string;
    description?: string;
    gtin_number?: string;
    gtin2_number?: string;
    url?: string;
    picture_url?: string;
    expiration_in?: string;
    expires_in_days?: number;
    expires_in_months?: number;
    identification_codes_expires_in_days?: number;
    bottles_in_batch?: number;
    batches_in_pallet?: number;
    pallets_in_container?: number;
    documents: {
      type: string;
      number: string;
      date: string;
    };
    company_using_two_gtins?: boolean;
    industry?: string;
    certificate_types?: any[];
    expiration_types?: any[];
  }

  const documentTypes = [
    'Выберите тип документа',
    'Сертификат',
    'Декларация',
    'Свидетельство',
    'Лицензия'
  ];

  let product: Product = {
    name: '',
    description: '',
    gtin_number: '',
    gtin2_number: '',
    url: '',
    picture_url: '',
    expiration_in: '1', // 1 - месяцы, 2 - дни
    expires_in_days: 0,
    expires_in_months: 0,
    identification_codes_expires_in_days: 30,
    bottles_in_batch: 1,
    batches_in_pallet: 1,
    pallets_in_container: 1,
    documents: {
      type: 'Выберите тип документа',
      number: '',
      date: ''
    },
    company_using_two_gtins: false,
    industry: '',
    certificate_types: [],
    expiration_types: []
  };

  let isLoading = false;
  let error: string | null = null;

  // Инициализируем токен при загрузке компонента
  onMount(async () => {
    // Проверяем, что мы в браузере
    if (typeof window === 'undefined') {
      return;
    }

    // Проверяем токен при загрузке страницы
    const token = authService.getStoredToken();
    
    if (!token || authService.isTokenExpired()) {
      if (!token) {
        console.log('Token is missing');
      } else {
        await authService.logout();
      }
      await goto('/login');
      return;
    }

    initializeTokenPayload();
  });

  async function createProduct(event: Event) {
    event.preventDefault();
    
    isLoading = true;
    error = null;

    try {
      // Получаем токен из localStorage для авторизации
      const token = authService.getStoredToken();
      if (!token) {
        await goto('/login');
        return;
      }

      // Проверяем, не истек ли токен
      if (authService.isTokenExpired()) {
        await authService.logout(); // Удаляем протухший токен
        await goto('/login');
        return;
      }

      const response = await fetch(
        `/api/v1/products`,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(product)
        }
      );

      if (!response.ok) {
        // Если получили 401 Unauthorized, токен недействителен
        if (response.status === 401) {
          await authService.logout();
          await goto('/login');
          return;
        }
        throw new Error('Failed to create product');
      }

      await goto('/products');
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to create product';
      isLoading = false;
    }
  }
</script>

<div class="edit-page">
  {#if error}
    <div class="error">
      {error}
      <div class="error-actions">
        <a href="/products" class="back-button">← Вернуться к списку продуктов</a>
      </div>
    </div>
  {/if}

  <div class="header">
    <div>
      <h1>Создание нового продукта</h1>
      {#if $companyId}
        <small style="color: #64748b;">Company ID: {$companyId}</small>
      {/if}
    </div>
    <a href="/products" class="btn btn-secondary">← К списку продуктов</a>
  </div>

  <form on:submit|preventDefault={createProduct} class="edit-form">
    <section class="form-section">
      <h2>Общая информация</h2>
      <div class="form-content">
        <div class="form-group">
          <label for="name">Наименование</label>
          <input
            type="text"
            id="name"
            bind:value={product.name}
            placeholder="Введите наименование продукта"
            required
          />
        </div>

        <!-- <div class="form-group">
          <label for="gtin_number">Номер GTIN</label>
          <input
            type="text"
            id="gtin_number"
            bind:value={product.gtin_number}
            placeholder="Введите 14-значный GTIN"
            pattern="[0-9]{14}"
            maxlength="14"
          />
        </div> -->

        <div class="form-group">
          <label for="gtin2_number">Номер GTIN 2 (опционально)</label>
          <input
            type="text"
            id="gtin2_number"
            bind:value={product.gtin2_number}
            placeholder="Введите второй GTIN"
            pattern="[0-9]{14}"
            maxlength="14"
          />
        </div>

        <div class="form-group">
          <label for="industry">Отрасль</label>
          <input
            type="text"
            id="industry"
            bind:value={product.industry}
            placeholder="Введите отрасль"
          />
        </div>

        <div class="form-group">
          <label>
            <input
              type="checkbox"
              bind:checked={product.company_using_two_gtins}
            />
            Компания использует два GTIN
          </label>
        </div>
      </div>
    </section>

    <section class="form-section">
      <h2>Документы</h2>
      <div class="form-content">
        <div class="form-group">
          <label for="document_type">Вид документа</label>
          <div class="select-wrapper">
            <select
              id="document_type"
              bind:value={product.documents.type}
            >
              {#each documentTypes as type}
                <option value={type}>{type}</option>
              {/each}
            </select>
            <div class="select-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="document_number">Номер документа</label>
          <input
            type="text"
            id="document_number"
            bind:value={product.documents.number}
            placeholder="Введите номер документа"
          />
        </div>

        <div class="form-group">
          <label for="document_date">Дата документа</label>
          <input
            type="date"
            id="document_date"
            bind:value={product.documents.date}
          />
        </div>
      </div>
    </section>

    <section class="form-section">
      <h2>Срок годности</h2>
      <div class="form-content">
        <div class="form-group">
          <label for="expiration_in">Режим срока годности</label>
          <div class="select-wrapper">
            <select id="expiration_in" bind:value={product.expiration_in}>
              <option value="1">Месяцы</option>
              <option value="2">Дни</option>
            </select>
            <div class="select-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
        </div>

        {#if product.expiration_in === "1"}
          <div class="form-group">
            <label for="expires_in_months">Срок годности (месяцы)</label>
            <input
              type="number"
              id="expires_in_months"
              bind:value={product.expires_in_months}
              min="0"
              placeholder="0"
            />
          </div>
        {:else}
          <div class="form-group">
            <label for="expires_in_days">Срок годности (дни)</label>
            <input
              type="number"
              id="expires_in_days"
              bind:value={product.expires_in_days}
              min="0"
              placeholder="0"
            />
          </div>
        {/if}

        <div class="form-group">
          <label for="identification_codes_expires_in_days">Срок годности кода маркировки (дни)</label>
          <input
            type="number"
            id="identification_codes_expires_in_days"
            bind:value={product.identification_codes_expires_in_days}
            min="0"
            placeholder="30"
          />
        </div>
      </div>
    </section>

    <section class="form-section">
      <h2>Описание</h2>
      <div class="form-content">
        <div class="form-group full-width">
          <label for="description">Описание продукта</label>
          <textarea
            id="description"
            bind:value={product.description}
            placeholder="Введите описание продукта"
            rows="4"
          ></textarea>
        </div>
      </div>
    </section>

    <section class="form-section">
      <h2>Упаковка</h2>
      <div class="form-content">
        <div class="form-group">
          <label for="bottles_in_batch">Бутылок в партии</label>
          <input
            type="number"
            id="bottles_in_batch"
            bind:value={product.bottles_in_batch}
            min="1"
            placeholder="1"
          />
        </div>

        <div class="form-group">
          <label for="batches_in_pallet">Партий на паллете</label>
          <input
            type="number"
            id="batches_in_pallet"
            bind:value={product.batches_in_pallet}
            min="1"
            placeholder="1"
          />
        </div>

        <div class="form-group">
          <label for="pallets_in_container">Паллет в контейнере</label>
          <input
            type="number"
            id="pallets_in_container"
            bind:value={product.pallets_in_container}
            min="1"
            placeholder="1"
          />
        </div>
      </div>
    </section>

    <footer class="form-actions">
      <button type="button" class="btn btn-secondary" on:click={() => window.history.back()}>
        Отмена
      </button>
      <button type="submit" class="btn btn-primary" disabled={isLoading}>
        {isLoading ? 'Создание...' : 'Создать продукт'}
      </button>
    </footer>
  </form>
</div>

<style>
  .edit-page {
    padding: 2rem;
    background: #f8fafc;
    min-height: 100vh;
    max-width: 1000px;
    margin: 0 auto;
  }

  .header {
    margin-bottom: 2rem;
    padding: 1.5rem 2rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header:hover {
    box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.05), 0 4px 16px -2px rgba(0, 0, 0, 0.05);
    transform: translateY(-1px);
  }

  h1 {
    font-size: 1.5rem;
    font-weight: 600;
    background: linear-gradient(135deg, #4f46e5, #6366f1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
    letter-spacing: -0.025em;
  }

  h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #f1f5f9;
    display: flex;
    justify-content: space-between;
    align-items: center;
    grid-column: 1 / -1;
  }

  .full-width {
    grid-column: 1 / -1;
  }

  .edit-form {
    background: white;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.3s ease;
    display: flex;
    flex-direction: column;
    gap: 1px;
    background-color: #f1f5f9;
  }

  .edit-form > * {
    background: white;
  }

  .edit-form:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 15px rgba(0, 0, 0, 0.1);
  }

  .form-section {
    padding: 1.75rem 2rem;
    border-bottom: 1px solid #f1f5f9;
    transition: background-color 0.2s ease;
  }

  .form-section:hover {
    background-color: #fafbff;
  }

  .form-section:last-of-type {
    border-bottom: none;
  }

  .form-section h2 {
    grid-column: 1 / -1;
    margin-bottom: 1.5rem;
    font-size: 1.125rem;
    color: #1e293b;
    letter-spacing: -0.025em;
  }

  .form-content {
    display: grid;
    gap: 1.25rem;
  }

  @media (min-width: 768px) {
    .form-content {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-group.full-width {
    grid-column: 1 / -1;
  }

  .form-group label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #475569;
    letter-spacing: -0.025em;
  }

  input[type="text"],
  input[type="url"],
  input[type="date"],
  input[type="number"],
  select,
  textarea {
    width: 100%;
    padding: 0.625rem 0.875rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.875rem;
    color: #1e293b;
    background: #ffffff;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    min-height: 42px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  }

  input[type="checkbox"] {
    width: auto;
    margin-right: 0.5rem;
    transform: scale(1.2);
  }

  input::placeholder,
  textarea::placeholder {
    color: #94a3b8;
  }

  textarea {
    min-height: 100px;
    resize: vertical;
    line-height: 1.5;
    padding: 0.75rem;
  }

  input:focus,
  select:focus,
  textarea:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  }

  input:hover,
  select:hover,
  textarea:hover {
    border-color: #cbd5e1;
  }

  .select-wrapper {
    position: relative;
    width: 100%;
  }

  .select-wrapper select {
    width: 100%;
    padding: 10px 16px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.875rem;
    color: #1e293b;
    background: #ffffff;
    transition: all 0.2s ease;
    appearance: none;
    cursor: pointer;
    height: 42px;
  }

  .select-icon {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #64748b;
    pointer-events: none;
  }

  .select-wrapper:hover select {
    border-color: #cbd5e1;
  }

  .select-wrapper select:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  }

  .edit-form .form-actions {
    margin-top: 2rem;
    padding: 24px 32px;
    background: white;
    border-top: 1px solid #eaecf0;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
    width: 100%;
    box-sizing: border-box;
  }

  .edit-form .btn {
    height: 44px;
    min-width: 120px;
    padding: 0 24px;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 400;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }

  .edit-form .btn-secondary {
    background: white;
    color: #000000;
    border: 1px solid #d0d5dd;
  }

  .edit-form .btn-secondary:hover {
    border-color: #b8bec8;
  }

  .edit-form .btn-primary {
    background: #6366F1;
    color: white;
    border: none;
  }

  .edit-form .btn-primary:hover {
    background: #5558d6;
  }

  .edit-form .btn-primary:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }

  .error {
    padding: 2rem;
    background: white;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
    text-align: center;
    color: #991b1b;
    margin-bottom: 2rem;
  }

  .error-actions {
    margin-top: 1.5rem;
  }

  .back-button {
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 1rem;
    background: #4f46e5;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    font-size: 0.875rem;
    transition: background-color 0.2s;
  }

  .back-button:hover {
    background: #4338ca;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 1rem;
    text-decoration: none;
    border-radius: 6px;
    font-size: 0.875rem;
    transition: all 0.2s;
    border: 1px solid transparent;
  }

  .btn-secondary {
    background: white;
    color: #374151;
    border-color: #d1d5db;
  }

  .btn-secondary:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
</style>