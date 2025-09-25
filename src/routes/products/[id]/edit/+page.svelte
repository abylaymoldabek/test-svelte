<script context="module">
  export const prerender = false;
</script>

<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  interface CustomField {
    name: string;
    type: string;
    default_value: string;
  }

  interface Product {
    id: string;
    name: string;
    gtin_number: string;
    gtin_package: string;
    url: string;
    document_type: string;
    document_number: string;
    document_date: string;
    tnved_group: string;
    tnved_code: string;
    custom_fields: CustomField[];
    content: {
      title: string;
      images: string[];
    };
    expiration_period: string;
    company_id: string;
  }

  const documentTypes = [
    'Сертификат',
    'Декларация',
    'Свидетельство',
    'Лицензия'
  ];

  const tnvedGroups = [
    '0401 - Молоко и сливки, несгущенные и без добавления сахара',
    '0402 - Молоко и сливки, сгущенные или с добавлением сахара',
    '0403 - Пахта, йогурт, кефир'
  ];

  const tnvedCodes = [
    '04010100 - Молочная продукция',
    '04010200 - Сливки',
    '04010300 - Пахта'
  ];

  const expirationPeriods = [
    { value: '3', label: '3 месяца' },
    { value: '6', label: '6 месяцев' },
    { value: '12', label: '12 месяцев' }
  ];

  let product: Product = {
    id: '',
    name: '',
    gtin_number: '',
    gtin_package: '',
    url: '',
    document_type: '',
    document_number: '',
    document_date: '',
    tnved_group: '',
    tnved_code: '',
    expiration_period: '',
    company_id: '',
    custom_fields: [],
    content: {
      title: '',
      images: []
    }
  };

  let isLoading = true;
  let error: string | null = null;

  async function saveProduct(event: Event) {
    event.preventDefault();
    isLoading = true;
    error = null;

    try {
      // Когда API будет готово:
      // const response = await fetch(`/api/v1/products/${product.id}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(product)
      // });
      // if (!response.ok) throw new Error('Failed to save product');
      
      // Пока нет API, просто перенаправляем на список продуктов
      await goto('/products');
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to save product';
      isLoading = false;
    }
  }

  function addCustomField() {
    product.custom_fields = [
      ...product.custom_fields,
      { name: '', type: 'string', default_value: '' }
    ];
  }

  function removeCustomField(index: number) {
    product.custom_fields = product.custom_fields.filter((_, i) => i !== index);
  }

  onMount(async () => {
    const productId = $page.params.id;
    if (!productId) {
      error = 'Product ID is required';
      isLoading = false;
      return;
    }

    try {
      // Пока нет API, используем моковые данные
      product = {
        id: productId,
        name: 'Бытовая химия',
        gtin_number: '04603721574018',
        gtin_package: '12345678901234',
        url: 'https://example.com/product',
        document_type: 'Сертификат',
        document_number: 'CERT-123456',
        document_date: '2025-09-25',
        tnved_group: '0401 - Молоко и сливки, несгущенные и без добавления сахара',
        tnved_code: '04010100 - Молочная продукция',
        expiration_period: '6',
        company_id: '123',
        custom_fields: [
          {
            name: 'Вес',
            type: 'number',
            default_value: '500'
          },
          {
            name: 'Цвет',
            type: 'string',
            default_value: 'Белый'
          }
        ],
        content: {
          title: 'Тестовый продукт',
          images: []
        }
      };

      // Когда API будет готово:
      // const response = await fetch(`/api/v1/products/${productId}`);
      // if (!response.ok) throw new Error('Failed to fetch product');
      // product = await response.json();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load product';
    } finally {
      isLoading = false;
    }
  });
</script>

<div class="edit-page">
  {#if isLoading}
    <div class="loading">Загрузка...</div>
  {:else if error}
    <div class="error">
      {error}
      <div class="error-actions">
        <a href="/products" class="back-button">← Вернуться к списку продуктов</a>
      </div>
    </div>
  {:else}
    <form on:submit|preventDefault={saveProduct} class="edit-form">
      <div class="header">
        <h1>Редактирование продукта</h1>
      </div>

      <section class="form-section">
        <h2>Общая информация</h2>
        
        <div class="form-group">
          <label for="name">Наименование</label>
          <input
            type="text"
            id="name"
            bind:value={product.name}
            required
          />
        </div>

        <div class="form-group">
          <label for="gtin">Номер GTIN (14-символьный)</label>
          <input
            type="text"
            id="gtin"
            bind:value={product.gtin_number}
            pattern="[0-9]{14}"
            required
          />
        </div>

        <div class="form-group">
          <label for="gtin_package">Номер GTIN (производитель упаковки)</label>
          <input
            type="text"
            id="gtin_package"
            bind:value={product.gtin_package}
            pattern="[0-9]{14}"
          />
        </div>

        <div class="form-group">
          <label for="url">URL</label>
          <input
            type="url"
            id="url"
            bind:value={product.url}
          />
        </div>
      </section>

      <section class="form-section">
        <h2>Документы</h2>
        
        <div class="form-group">
          <label for="document_type">Вид документа</label>
          <select id="document_type" bind:value={product.document_type}>
            <option value="">Выберите вид документа</option>
            {#each documentTypes as type}
              <option value={type}>{type}</option>
            {/each}
          </select>
        </div>

        <div class="form-group">
          <label for="document_number">Номер документа</label>
          <input
            type="text"
            id="document_number"
            bind:value={product.document_number}
          />
        </div>

        <div class="form-group">
          <label for="document_date">Дата документа</label>
          <input
            type="date"
            id="document_date"
            bind:value={product.document_date}
          />
        </div>
      </section>

      <section class="form-section">
        <h2>ТНВЭД</h2>
        
        <div class="form-group">
          <label for="tnved_group">Товарная позиция ТН ВЭД</label>
          <select id="tnved_group" bind:value={product.tnved_group}>
            <option value="">Выберите товарную позицию</option>
            {#each tnvedGroups as group}
              <option value={group}>{group}</option>
            {/each}
          </select>
        </div>

        <div class="form-group">
          <label for="tnved_code">Код ТН ВЭД</label>
          <select id="tnved_code" bind:value={product.tnved_code}>
            <option value="">Выберите код</option>
            {#each tnvedCodes as code}
              <option value={code}>{code}</option>
            {/each}
          </select>
        </div>

        <div class="form-group">
          <label for="expiration_period">Использовать срок годности продукта</label>
          <select id="expiration_period" bind:value={product.expiration_period}>
            <option value="">Выберите период</option>
            {#each expirationPeriods as period}
              <option value={period.value}>{period.label}</option>
            {/each}
          </select>
        </div>
      </section>

      <section class="form-section">
        <h2>
          <span>Дополнительные поля</span>
          <button type="button" class="add-field-btn" on:click={addCustomField}>
            + Добавить поле
          </button>
        </h2>
        
        {#each product.custom_fields as field, i}
          <div class="custom-field">
            <div class="form-group">
              <label for="field-name-{i}">Название поля</label>
              <input
                id="field-name-{i}"
                type="text"
                bind:value={field.name}
                required
              />
            </div>
            
            <div class="form-group">
              <fieldset>
                <legend>Тип</legend>
                <div class="type-buttons" role="radiogroup">
                  {#each ['string', 'number', 'boolean'] as type}
                    <label>
                      <input
                        type="radio"
                        name="field-type-{i}"
                        value={type}
                        bind:group={field.type}
                      />
                      <span>{type}</span>
                    </label>
                  {/each}
                </div>
              </fieldset>
            </div>

            <div class="form-group">
              <label for="field-default-{i}">Значение по умолчанию</label>
              <input
                id="field-default-{i}"
                type="text"
                bind:value={field.default_value}
              />
            </div>

            <button 
              type="button" 
              class="remove-field-btn" 
              on:click={() => removeCustomField(i)}
            >
              Удалить поле
            </button>
          </div>
        {/each}
      </section>

      <section class="form-section">
        <h2>Дополнительный контент</h2>
        
        <div class="form-group">
          <label for="content_title">Заголовок</label>
          <input
            type="text"
            id="content_title"
            bind:value={product.content.title}
          />
        </div>

        <div class="form-group">
          <label for="content_images">Изображения</label>
          <div class="image-upload">
            <button type="button" class="upload-btn">
              Загрузить изображение
            </button>
          </div>
        </div>
      </section>

      <div class="form-actions">
        <a href="/products" class="cancel-btn">Отмена</a>
        <button type="submit" class="save-btn">Сохранить</button>
      </div>
    </form>
  {/if}
</div>

<style>
  .edit-page {
    padding: 2rem;
    background: #f8fafc;
    min-height: 100vh;
  }

  .header {
    margin-bottom: 2rem;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid #e5e7eb;
  }

  h1 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }

  h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .edit-form {
    background: white;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  }

  .form-section {
    padding: 2rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .form-section:last-of-type {
    border-bottom: none;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-group:last-child {
    margin-bottom: 0;
  }

  label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.5rem;
  }

  input[type="text"],
  input[type="url"],
  input[type="date"],
  select {
    width: 100%;
    padding: 0.625rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.875rem;
    color: #1f2937;
    background: white;
    transition: all 0.2s;
  }

  input:focus,
  select:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  .custom-field {
    background: #f9fafb;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    position: relative;
  }

fieldset {
  border: none;
  padding: 0;
  margin: 0 0 15px 0;
}

legend {
  font-weight: 500;
  margin-bottom: 5px;
}

.type-buttons {
  display: flex;
  gap: 10px;
}

.type-buttons label {
  display: flex;
  align-items: center;
  gap: 5px;
}

.type-buttons input[type="radio"] {
  margin: 0;
}

.type-buttons input[type="radio"]:checked + span {
  font-weight: 500;
  color: #007bff;
}  .add-field-btn {
    padding: 0.5rem 1rem;
    background: none;
    border: 1px dashed #6366f1;
    color: #6366f1;
    border-radius: 6px;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .add-field-btn:hover {
    background: #e0e7ff;
  }

  .remove-field-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    padding: 0.5rem;
    background: none;
    border: none;
    color: #ef4444;
    font-size: 0.875rem;
    cursor: pointer;
    transition: color 0.2s;
  }

  .remove-field-btn:hover {
    color: #dc2626;
  }

  .image-upload {
    border: 2px dashed #e5e7eb;
    border-radius: 8px;
    padding: 2rem;
    text-align: center;
  }

  .upload-btn {
    padding: 0.625rem 1.25rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .upload-btn:hover {
    background: #4f46e5;
  }

  .form-actions {
    padding: 1.5rem 2rem;
    background: #f9fafb;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }

  .cancel-btn {
    padding: 0.625rem 1.25rem;
    background: white;
    color: #374151;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.2s;
  }

  .cancel-btn:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }

  .save-btn {
    padding: 0.625rem 1.25rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .save-btn:hover {
    background: #4f46e5;
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    color: #6b7280;
  }

  .error {
    padding: 2rem;
    background: white;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
    text-align: center;
    color: #991b1b;
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
</style>
