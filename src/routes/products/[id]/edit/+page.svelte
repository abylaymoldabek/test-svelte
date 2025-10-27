<script context="module">
    export const prerender = false;
</script>

<script lang="ts">
    import { page } from "$app/stores";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";

    interface Product {
        id?: string;
        general: {
            name: string;
            gtin: string;
        };
        regulatory_doc: {
            type: Array<{
                value: string;
                label: string;
            }>;
            number: string;
            date: string | null;
        };
        shelf_life: {
            mode: string;
            product_days: number;
            mark_code_days: number;
        };
        packaging: {
            units_per_box: number;
            boxes_per_pallet: number;
        };
    }

    const documentTypes = [
        "Выберите тип документа",
        "Сертификат",
        "Декларация",
        "Свидетельство",
        "Лицензия",
    ];

    let product: Product = {
        id: "",
        general: {
            name: "",
            gtin: "",
        },
        regulatory_doc: {
            type: [{
                value: "Выберите тип документа",
                label: ""
            }],
            number: "",
            date: null,
        },
        shelf_life: {
            mode: "1",
            product_days: 0,
            mark_code_days: 30,
        },
        packaging: {
            units_per_box: 1,
            boxes_per_pallet: 1,
        },
    };

    let isLoading = true;
    let error: string | null = null;
    let productId: string;
    let companyId: string;

    onMount(async () => {
        productId = $page.params.id ?? "";
        companyId = $page.url.searchParams.get("company_id") ?? "";

        if (!companyId) {
            error = "Company ID is required";
            return;
        }

        await fetchProduct();
    });

    async function fetchProduct() {
        isLoading = true;
        error = null;

        try {
            const response = await fetch(
                `/api/v1/products/${productId}?company_id=${companyId}`,
                {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                },
            );

            if (!response.ok) {
                throw new Error("Failed to fetch product");
            }

            const data = await response.json();
            if (data.value) {
                // Преобразуем regulatory_doc.type из строк в объекты, если нужно
                const responseData = { ...data.value };
                if (responseData.regulatory_doc && responseData.regulatory_doc.type) {
                    if (typeof responseData.regulatory_doc.type[0] === 'string') {
                        // Преобразуем массив строк в массив объектов
                        responseData.regulatory_doc.type = responseData.regulatory_doc.type.map((typeValue: string) => ({
                            value: typeValue,
                            label: ""
                        }));
                    }
                }
                
                product = {
                    ...product, // сохраняем дефолтные значения для полей, которых может не быть в ответе
                    ...responseData,
                };
            } else {
                throw new Error("Invalid response format");
            }
        } catch (err) {
            error =
                err instanceof Error ? err.message : "Failed to fetch product";
            console.error("Error fetching product:", err);
        } finally {
            isLoading = false;
        }
    }

    async function saveProduct(event: Event) {
        event.preventDefault();
        isLoading = true;
        error = null;

        try {
            const response = await fetch(`/api/v1/products/${productId}`, {
                method: "PUT",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    value: product,
                    company_id: companyId,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to save product");
            }

            const updatedProduct = await response.json();
            await goto("/products");
        } catch (err) {
            error =
                err instanceof Error ? err.message : "Failed to save product";
            isLoading = false;
        }
    }

    function handleError(err: unknown) {
        const message =
            err instanceof Error ? err.message : "An unexpected error occurred";
        error = message;
        console.error("Error:", message);
    }
</script>

<div class="edit-page">
    {#if isLoading}
        <div class="loading">Загрузка...</div>
    {:else if error}
        <div class="error">
            {error}
            <div class="error-actions">
                <a href="/products" class="back-button"
                    >← Вернуться к списку продуктов</a
                >
            </div>
        </div>
    {:else}
        <div class="header">
            <h1>Редактирование продукта</h1>
            <a href="/products" class="btn btn-secondary"
                >← К списку продуктов</a
            >
        </div>

        <form on:submit|preventDefault={saveProduct} class="edit-form">
            <section class="form-section">
                <h2>Общая информация</h2>
                <div class="form-content">
                    <div class="form-group">
                        <label for="name">Наименование</label>
                        <input
                            type="text"
                            id="name"
                            bind:value={product.general.name}
                            placeholder="Введите наименование продукта"
                        />
                    </div>

                    <!-- <div class="form-group">
                        <label for="gtin_number">Номер GTIN</label>
                        <input
                            type="text"
                            id="gtin_number"
                            bind:value={product.general.gtin}
                            placeholder="Введите 14-значный GTIN"
                            pattern="[0-9]{14}"
                            maxlength="14"
                        />
                    </div> -->
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
                                bind:value={product.regulatory_doc.type[0].value}
                            >
                                {#each documentTypes as type}
                                    <option value={type}>{type}</option>
                                {/each}
                            </select>
                            <div class="select-icon">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <polyline points="6 9 12 15 18 9"
                                    ></polyline>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="document_number">Номер документа</label>
                        <input
                            type="text"
                            id="document_number"
                            bind:value={product.regulatory_doc.number}
                        />
                    </div>

                    <div class="form-group">
                        <label for="document_date">Дата документа</label>
                        <input
                            type="date"
                            id="document_date"
                            bind:value={product.regulatory_doc.date}
                        />
                    </div>
                </div>
            </section>

            <section class="form-section">
                <h2>Срок годности</h2>
                <div class="form-content">
                    <div class="form-group">
                        <label for="shelf_life_mode">Режим срока годности</label
                        >
                        <select
                            id="shelf_life_mode"
                            bind:value={product.shelf_life.mode}
                        >
                            <option value="1">Месяцы</option>
                            <option value="2">Дни</option>
                        </select>
                    </div>

                    {#if product.shelf_life.mode === "1"}
                        <div class="form-group">
                            <label for="product_days">Срок годности (дни)</label
                            >
                            <input
                                type="number"
                                id="product_days"
                                bind:value={product.shelf_life.product_days}
                                min="0"
                            />
                        </div>
                    {:else}
                        <div class="form-group">
                            <label for="product_days">Срок годности (дни)</label
                            >
                            <input
                                type="number"
                                id="product_days"
                                bind:value={product.shelf_life.product_days}
                                min="0"
                            />
                        </div>
                    {/if}

                    <div class="form-group">
                        <label for="mark_code_days"
                            >Срок годности кода маркировки (дни)</label
                        >
                        <input
                            type="number"
                            id="mark_code_days"
                            bind:value={product.shelf_life.mark_code_days}
                            min="0"
                        />
                    </div>
                </div>
            </section>

            <section class="form-section">
                <h2>Упаковка</h2>
                <div class="form-content">
                    <div class="form-group">
                        <label for="units_per_box">Единиц в коробке</label>
                        <input
                            type="number"
                            id="units_per_box"
                            bind:value={product.packaging.units_per_box}
                            min="1"
                        />
                    </div>

                    <div class="form-group">
                        <label for="boxes_per_pallet">Коробок на паллете</label>
                        <input
                            type="number"
                            id="boxes_per_pallet"
                            bind:value={product.packaging.boxes_per_pallet}
                            min="1"
                        />
                    </div>
                    <footer class="form-actions">
                        <button
                            type="button"
                            class="btn btn-secondary"
                            on:click={() => window.history.back()}
                        >
                            Отмена
                        </button>
                        <button type="submit" class="btn btn-primary">
                            Сохранить
                        </button>
                    </footer>
                </div>
            </section>
        </form>
    {/if}
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
        box-shadow:
            0 1px 2px rgba(0, 0, 0, 0.03),
            0 1px 6px -1px rgba(0, 0, 0, 0.02);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .header:hover {
        box-shadow:
            0 4px 12px -2px rgba(0, 0, 0, 0.05),
            0 4px 16px -2px rgba(0, 0, 0, 0.05);
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
        box-shadow:
            0 4px 6px rgba(0, 0, 0, 0.05),
            0 10px 15px rgba(0, 0, 0, 0.1);
    }

    .form-section {
        padding: 1.75rem 2rem;
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

    .form-section {
        padding: 1.75rem 2rem;
        border-bottom: 1px solid #f1f5f9;
        transition: background-color 0.2s ease;
    }

    .form-section:hover {
        background-color: #fafbff;
    }

    .form-section .form-group {
        margin-bottom: 1.25rem;
    }

    .form-content {
        display: grid;
        gap: 1.25rem;
    }

    @media (min-width: 768px) {
        .form-content {
            grid-template-columns: repeat(2, 1fr);
        }

        .form-section .form-group:last-child {
            margin-bottom: 0;
        }
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

    .form-group input,
    .form-group select,
    .form-group textarea {
        width: 100%;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
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

    input:disabled,
    select:disabled,
    textarea:disabled {
        background-color: #f8fafc;
        cursor: not-allowed;
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

    .select-wrapper select option {
        padding: 8px;
        font-size: 0.875rem;
    }

    select[multiple] {
        min-height: 120px;
        padding: 0.5rem;
    }

    select[multiple] option {
        padding: 0.375rem 0.75rem;
        border-radius: 4px;
    }

    select[multiple] option:checked {
        background: #4f46e5;
        color: white;
    }

    input:focus,
    select:focus,
    textarea:focus {
        outline: none;
        border-color: #6366f1;
        background: white;
        box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
    }

    input:hover,
    select:hover,
    textarea:hover {
        border-color: #cbd5e1;
        background: white;
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
    }
    .add-field-btn {
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
        font-family:
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Roboto,
            Oxygen,
            Ubuntu,
            Cantarell,
            "Open Sans",
            "Helvetica Neue",
            sans-serif;
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
        background: #6366f1;
        color: white;
        border: none;
    }

    .edit-form .btn-primary:hover {
        background: #5558d6;
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
