<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { tokenPayload, isAuthenticated } from '$lib/stores/token.js';
  import { checkAuthAndRedirect } from '$lib/utils/auth-guard.js';

  // Проверяем авторизацию при монтировании
  onMount(() => {
    // Небольшая задержка, чтобы дать stores инициализироваться
    setTimeout(() => {
      checkAuthAndRedirect($page.url.pathname);
    }, 100);

    // Таймер для обновления времени до дедлайна каждую минуту
    const interval = setInterval(() => {
      // Обновляем текущее время для пересчета дедлайнов
      currentTime = Date.now();
    }, 60000); // Обновляем каждые 60 секунд

    return () => {
      clearInterval(interval);
    };
  });

  // Проверяем роль пользователя
  $: isSuperAdmin = $tokenPayload?.role === 'superadmin' || $tokenPayload?.role === 'super_admin';

  // Данные для боковой панели
  let companies = [
    { id: 5, name: 'Критичный процент расхождения с ВетИС' },
    { id: 15, name: 'Отложенные отчеты DRY' },
    { id: 15, name: 'Отложенные отчеты WET' },
    { id: 15, name: 'Принудительная отправка отчетов DRY' },
    { id: 15, name: 'Принудительная отправка отчетов WET' }
  ];

  let timezones = [
    { value: 'Asia/Almaty', label: 'Алматы (UTC+5)' },
    { value: 'Europe/Moscow', label: 'Москва (UTC+3)' },
    { value: 'UTC', label: 'UTC (Универсальное время)' }
  ];

  // Состояние редактирования
  let isEditMode = false;
  let editingCompanies = [...companies];

  // Данные для таблицы партий
  let batches = [
    {
      party: '542A1LUZ74',
      product: '1110101',
      productionDate: '2025-10-14',
      expiryDate: '2027-10-13',
      produced: 100000,
      vetis: 120000,
      difference: 20000,
      status: 'Произведено',
      deadline: '2025-10-28T15:30:00Z' // Дедлайн отправки
    },
    {
      party: '541A1LUZ33',
      product: '1110109',
      productionDate: '2025-10-13',
      expiryDate: '2027-10-13',
      produced: 110000,
      vetis: 110000,
      difference: 0,
      status: 'Отправлена (20 из 20)',
      deadline: '2025-10-26T12:00:00Z' // Уже отправлена
    },
    {
      party: '542A1LUZ33',
      product: '1110109',
      productionDate: '2025-10-13',
      expiryDate: '2027-10-13',
      produced: 50000,
      vetis: 110000,
      difference: -60000,
      status: 'На холде',
      deadline: '2025-10-29T09:45:00Z' // Критический дедлайн
    },
    {
      party: '541A1LUZ33',
      product: '2110109',
      productionDate: '2025-10-13',
      expiryDate: '2027-10-13',
      produced: 110000,
      vetis: 110000,
      difference: 0,
      status: 'Отправляется (10 из 20)',
      deadline: '2025-10-27T18:20:00Z' // В процессе отправки
    },
    {
      party: '541A1LUZ33',
      product: '2110110',
      productionDate: '2025-10-13',
      expiryDate: '2027-10-13',
      produced: 100000,
      vetis: 110000,
      difference: 0,
      status: 'Отправляется (15 из 20)',
      deadline: '2025-10-22T18:20:00Z' // В процессе отправки
    }
  ];

  let currentPage = 1;
  let totalPages = 100;
  let showConfirmModal = false;
  let selectedBatch: any = null; // Выбранная партия для отображения в процессе

  // Фильтры для поиска
  let filters = {
    party: '',
    product: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  };

  // Сортировка
  let sortField = '';
  let sortOrder: 'asc' | 'desc' = 'asc';

  // Таймзона
  let selectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone; // По умолчанию таймзона браузера

  let deadlineTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone; // Инициализируем с той же таймзоной
  
  // Переменная для принудительного обновления времени
  let currentTime = Date.now();

  // Реактивность для обновления времени при изменении часового пояса
  $: if (selectedTimezone) {
    // Сохраняем выбранную таймзону в deadlineTimezone
    deadlineTimezone = selectedTimezone;
    // Принудительно обновляем расчеты времени при изменении часового пояса
    currentTime = Date.now();
  }

  // Состояние календаря
  let showDatePicker = false;
  let selectingFrom = true; // true = выбираем "от", false = выбираем "до"

  // Активный поиск (какое поле поиска открыто)
  let activeSearch = '';

  // Форматирование отображения диапазона дат
  $: dateDisplayText = (() => {
    if (filters.dateFrom && filters.dateTo) {
      return `${filters.dateFrom} — ${filters.dateTo}`;
    } else if (filters.dateFrom) {
      return `От ${filters.dateFrom}`;
    } else if (filters.dateTo) {
      return `До ${filters.dateTo}`;
    }
    return '';
  })();

  function formatDateInTimezone(date: string) {
    if (!date) return '';
    try {
      const dateObj = new Date(date);
      return new Intl.DateTimeFormat('ru-RU', {
        timeZone: selectedTimezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(dateObj);
    } catch (error) {
      return date; // Fallback to original date if formatting fails
    }
  }

  // Функции для работы с дедлайном
  function formatDeadlineInTimezone(deadline: string, timezone: string) {
    if (!deadline) return '';
    try {
      const deadlineObj = new Date(deadline);
      return new Intl.DateTimeFormat('ru-RU', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(deadlineObj);
    } catch (error) {
      return deadline;
    }
  }

  function getTimeUntilDeadline(deadline: string, status: string = '') {
    if (!deadline) return '';
    
    try {
      // Используем currentTime для реактивности
      const now = new Date(currentTime);
      const deadlineObj = new Date(deadline);
      
      // Получаем время сейчас и дедлайн в выбранном часовом поясе как строки
      const nowFormatter = new Intl.DateTimeFormat('sv-SE', {
        timeZone: selectedTimezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      
      const deadlineFormatter = new Intl.DateTimeFormat('sv-SE', {
        timeZone: selectedTimezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      
      // Получаем локальные представления времени в выбранном часовом поясе
      const nowInTimezone = new Date(nowFormatter.format(now));
      const deadlineInTimezone = new Date(deadlineFormatter.format(deadlineObj));
      
      const diffMs = deadlineInTimezone.getTime() - nowInTimezone.getTime();
      
      if (diffMs <= 0) {
        // Если партия уже отправлена, не показываем "Просрочено"
        if (status && status.includes('Отправлена')) {
          return 'Отправлена';
        }
        return 'Просрочено';
      }
      
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        return `${days}д ${hours}ч`;
      } else if (hours > 0) {
        return `${hours}ч ${minutes}м`;
      } else {
        return `${minutes}м`;
      }
    } catch (error) {
      return 'Ошибка';
    }
  }

  function getDeadlineStatus(deadline: string, status: string = '') {
    if (!deadline) return 'normal';
    
    try {
      // Используем currentTime для реактивности
      const now = new Date(currentTime);
      const deadlineObj = new Date(deadline);
      
      // Получаем время сейчас и дедлайн в выбранном часовом поясе как строки
      const nowFormatter = new Intl.DateTimeFormat('sv-SE', {
        timeZone: selectedTimezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      
      const deadlineFormatter = new Intl.DateTimeFormat('sv-SE', {
        timeZone: selectedTimezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      
      // Получаем локальные представления времени в выбранном часовом поясе
      const nowInTimezone = new Date(nowFormatter.format(now));
      const deadlineInTimezone = new Date(deadlineFormatter.format(deadlineObj));
      
      const diffMs = deadlineInTimezone.getTime() - nowInTimezone.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      
      if (diffMs <= 0) {
        // Если партия уже отправлена, возвращаем normal статус
        if (status && status.includes('Отправлена')) {
          return 'normal';
        }
        return 'overdue'; // Просрочено
      } else if (diffHours <= 2) {
        return 'critical'; // Критично (менее 2 часов)
      } else if (diffHours <= 24) {
        return 'warning'; // Предупреждение (менее суток)
      } else {
        return 'normal'; // Нормально
      }
    } catch (error) {
      return 'normal';
    }
  }

  // Функция очистки всех фильтров
  function clearAllFilters() {
    filters = {
      party: '',
      product: '',
      status: '',
      dateFrom: '',
      dateTo: ''
    };
    activeSearch = '';
    showDatePicker = false;
  }

  // Функции для календаря
  function openDatePicker() {
    showDatePicker = true;
    selectingFrom = true;
  }

  function closeDatePicker() {
    showDatePicker = false;
  }

  function selectDate(date: any) {
    // Используем локальную дату без UTC конверсии
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    if (selectingFrom || !filters.dateFrom) {
      filters.dateFrom = dateStr;
      filters.dateTo = ''; // Сброс конечной даты
      selectingFrom = false;
    } else {
      if (new Date(dateStr) >= new Date(filters.dateFrom)) {
        filters.dateTo = dateStr;
        closeDatePicker();
      } else {
        // Если выбрана дата раньше начальной, меняем местами
        filters.dateTo = filters.dateFrom;
        filters.dateFrom = dateStr;
        closeDatePicker();
      }
    }
  }

  function clearDateRange() {
    filters.dateFrom = '';
    filters.dateTo = '';
    closeDatePicker();
  }

  // Генерация календаря
  function generateCalendar(year: number, month: number) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Получаем день недели для первого дня месяца (0 = воскресенье, 1 = понедельник, ...)
    // Преобразуем в формат где 0 = понедельник, 1 = вторник, ..., 6 = воскресенье
    let startingDayOfWeek = firstDay.getDay();
    startingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    
    const days = [];
    
    // Добавляем пустые дни для выравнивания (дни предыдущего месяца)
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Добавляем дни текущего месяца
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  }

  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();
  
  $: calendarDays = generateCalendar(currentYear, currentMonth);

  // Функция сортировки (только для дат)
  function sortBy(field: string) {
    // Разрешаем сортировку только по датам
    if (field === 'productionDate' || field === 'expiryDate') {
      if (sortField === field) {
        // Если уже сортируем по этому полю, меняем направление
        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        // Если новое поле, устанавливаем ascending
        sortField = field;
        sortOrder = 'asc';
      }
    }
  }

  // Сортированные и отфильтрованные данные
  $: sortedBatches = (() => {
    // Сначала применяем фильтры
    let filtered = batches.filter(batch => {
      // Фильтр по партии
      if (filters.party && !batch.party.toLowerCase().includes(filters.party.toLowerCase())) {
        return false;
      }
      
      // Фильтр по продукту
      if (filters.product && !batch.product.toLowerCase().includes(filters.product.toLowerCase())) {
        return false;
      }
      
      // Фильтр по статусу
      if (filters.status && batch.status !== filters.status) {
        return false;
      }
      
      // Фильтр по дате производства
      if (filters.dateFrom || filters.dateTo) {
        const batchDate = new Date(batch.productionDate);
        
        if (filters.dateFrom && batchDate < new Date(filters.dateFrom)) {
          return false;
        }
        
        if (filters.dateTo && batchDate > new Date(filters.dateTo)) {
          return false;
        }
      }
      
      return true;
    });
    
    // Затем применяем сортировку (только для дат)
    if (sortField === 'productionDate' || sortField === 'expiryDate') {
      filtered.sort((a: any, b: any) => {
        const aValue = new Date(a[sortField]);
        const bValue = new Date(b[sortField]);
        
        let comparison = 0;
        if (aValue > bValue) {
          comparison = 1;
        } else if (aValue < bValue) {
          comparison = -1;
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }
    
    return filtered;
  })();

  // Массивы для селектов
  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  
  // Генерируем годы (от 2020 до 2030)
  const years = Array.from({length: 11}, (_, i) => 2020 + i);

  function prevMonth() {
    if (currentMonth === 0) {
      currentMonth = 11;
      currentYear--;
    } else {
      currentMonth--;
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      currentMonth = 0;
      currentYear++;
    } else {
      currentMonth++;
    }
  }

  function onMonthChange(event: Event) {
    currentMonth = parseInt((event.target as HTMLSelectElement).value);
  }

  function onYearChange(event: Event) {
    currentYear = parseInt((event.target as HTMLSelectElement).value);
  }

  function isDateInRange(date: any) {
    if (!date || !filters.dateFrom) return false;
    // Используем локальную дату без UTC конверсии
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const fromDate = new Date(filters.dateFrom);
    const toDate = filters.dateTo ? new Date(filters.dateTo) : fromDate;
    
    return date >= fromDate && date <= toDate;
  }

  function isDateSelected(date: any) {
    if (!date) return false;
    // Используем локальную дату без UTC конверсии
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    return dateStr === filters.dateFrom || dateStr === filters.dateTo;
  }



  function previousPage() {
    if (currentPage > 1) {
      currentPage--;
    }
  }

  function nextPage() {
    if (currentPage < totalPages) {
      currentPage++;
    }
  }

  function openConfirmModal() {
    showConfirmModal = true;
  }

  function closeConfirmModal() {
    showConfirmModal = false;
  }

  function confirmSend() {
    // Логика отправки
    closeConfirmModal();
  }

  // Функции для редактирования настроек (только для суперадмина)
  function startEdit() {
    if (isSuperAdmin) return;
    isEditMode = true;
    editingCompanies = [...companies];
  }

  function cancelEdit() {
    isEditMode = false;
    editingCompanies = [...companies];
  }

  function saveChanges() {
    companies = [...editingCompanies];
    isEditMode = false;
    // Здесь можно добавить отправку изменений на сервер
    console.log('Сохранены изменения:', companies);
  }

  function addNewItem() {
    editingCompanies = [...editingCompanies, { id: 0, name: '' }];
  }

  function removeItem(index: number) {
    editingCompanies = editingCompanies.filter((_, i) => i !== index);
  }

  // Функция для выбора партии
  function selectBatch(batch: any) {
    // Если кликнули на уже выбранную партию, закрываем детали
    if (selectedBatch === batch) {
      selectedBatch = null;
    } else {
      // Иначе открываем детали для новой партии
      selectedBatch = batch;
    }
  }

  // Функция для вычисления процента отклонения от плана
  function calculatePercentage(produced: number, vetis: number) {
    if (vetis === 0) return 0; // Избегаем деления на ноль
    // Формула: (план - произведено)/план * 100%
    return Math.round(((vetis - produced) / vetis) * 100);
  }

  // Функция для вычисления абсолютной разницы
  function calculateDifference(produced: number, vetis: number) {
    return produced - vetis;
  }

  // Функция для форматирования разницы с знаком
  function formatDifference(difference: number) {
    const sign = difference > 0 ? '+' : '';
    return sign + difference.toLocaleString();
  }

  // Получаем критичный процент из настроек
  $: criticalPercentage = companies.find(c => c.name === 'Критичный процент расхождения с ВетИС')?.id || 5;

  // Функция для проверки критичного расхождения
  function isCriticalDeviation(produced: number, vetis: number) {
    const deviationPercentage = Math.abs(calculatePercentage(produced, vetis));
    return deviationPercentage > criticalPercentage;
  }

  // Функция для определения статуса партии в процессе
  function getBatchStatus(batch: any) {
    if (!batch) return 'Произведено';
    
    switch (batch.status) {
      case 'Производится':
        return 'Производится';
      case 'Произведено':
        return 'Произведено';
      case 'На холде':
        return 'На холде';
      case 'Отправляется (10 из 20)':
        return 'Отправляется';
      case 'Отправлена (20 из 20)':
        return 'Отправлена';
      default:
        return 'Произведено';
    }
  }
</script>

{#if $tokenPayload}
<div class="reports-container">
  <div class="sidebar-panel">
    <div class="sidebar-header">
      <h3>Настройки отчетов ВетИС</h3>
      {#if !isSuperAdmin}
        <div class="admin-controls">
          {#if !isEditMode}
            <button class="edit-btn" on:click={startEdit} title="Редактировать настройки">
              ✏️
            </button>
          {:else}
            <div class="edit-actions">
              <button class="save-btn" on:click={saveChanges} title="Сохранить">
                ✅
              </button>
              <button class="cancel-btn" on:click={cancelEdit} title="Отмена">
                ❌
              </button>
            </div>
          {/if}
        </div>
      {/if}
    </div>
    
    <div class="company-section">
      <h4>Компания Лужники</h4>
      
      <div class="company-list">
        {#if !isEditMode}
          {#each companies as company}
            <div class="company-item">
              <span class="company-count">{company.id}</span>
              <span class="company-name">{company.name}</span>
            </div>
          {/each}
        {:else}
          {#each editingCompanies as company, index}
            <div class="company-item-edit">
              <input
                type="number"
                bind:value={company.id}
                class="edit-count"
                placeholder="ID"
                min="0"
              />
              <input
                type="text"
                bind:value={company.name}
                class="edit-name"
                placeholder="Название"
              />
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>

  <div class="main-content">
    <div class="page-header">
      <div class="header-content">
        <h1>Отчеты ВетИС</h1>
        <div class="timezone-selector">
          <label for="timezone-select">Выберите таймзону:</label>
          <select id="timezone-select" bind:value={selectedTimezone}>
            {#each timezones as tz}
              <option value={tz.value}>{tz.label}</option>
            {/each}
          </select>
        </div>
      </div>
    </div>

    <div class="table-container">
      <table class="reports-table">
        <thead>
          <tr>
            <th>
              <div class="th-content">
                <div 
                  class="th-title" 
                  role="button"
                  tabindex="0"
                  on:click={() => {
                    activeSearch = activeSearch === 'party' ? '' : 'party';
                    if (activeSearch !== 'party') {
                      filters.party = '';
                    }
                  }}
                  on:keydown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      activeSearch = activeSearch === 'party' ? '' : 'party';
                      if (activeSearch !== 'party') {
                        filters.party = '';
                      }
                    }
                  }}
                >
                  <span>Партия</span>
                </div>
                {#if activeSearch === 'party'}
                  <div class="th-search-dropdown">
                    <input
                      type="text"
                      placeholder="Поиск по партии..."
                      bind:value={filters.party}
                      class="th-search-input"
                    />
                  </div>
                {/if}
              </div>
            </th>
            <th>
              <div class="th-content">
                <div 
                  class="th-title" 
                  role="button"
                  tabindex="0"
                  on:click={() => {
                    activeSearch = activeSearch === 'product' ? '' : 'product';
                    if (activeSearch !== 'product') {
                      filters.product = '';
                    }
                  }}
                  on:keydown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      activeSearch = activeSearch === 'product' ? '' : 'product';
                      if (activeSearch !== 'product') {
                        filters.product = '';
                      }
                    }
                  }}
                >
                  <span>Продукт</span>
                </div>
                {#if activeSearch === 'product'}
                  <div class="th-search-dropdown">
                    <input
                      type="text"
                      placeholder="Поиск по продукту..."
                      bind:value={filters.product}
                      class="th-search-input"
                    />
                  </div>
                {/if}
              </div>
            </th>
            <th>
              <div class="th-content">
                <div 
                  class="th-title" 
                  role="button"
                  tabindex="0"
                  on:click={() => {
                    activeSearch = activeSearch === 'date' ? '' : 'date';
                    if (activeSearch !== 'date') {
                      filters.dateFrom = '';
                      filters.dateTo = '';
                    }
                  }}
                  on:keydown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      activeSearch = activeSearch === 'date' ? '' : 'date';
                      if (activeSearch !== 'date') {
                        filters.dateFrom = '';
                        filters.dateTo = '';
                      }
                    }
                  }}
                >
                  <span style="display: inline-flex; align-items: center; gap: 0.25rem;">
                    Дата производства
                    <button 
                      class="sort-button"
                      class:active={sortField === 'productionDate'}
                      on:click|stopPropagation={() => sortBy('productionDate')}
                      type="button"
                      tabindex="0"
                      on:keydown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          sortBy('productionDate');
                        }
                      }}
                    >
                      {#if sortField === 'productionDate'}
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      {:else}
                        ↕
                      {/if}
                    </button>
                  </span>
                </div>
                {#if activeSearch === 'date'}
                  <div class="th-search-dropdown">
                    <div class="date-range-display">
                      {dateDisplayText}
                    </div>
                    <button
                      class="date-picker-trigger-inline"
                      on:click={openDatePicker}
                    >
                      Выбрать диапазон
                    </button>
                    
                    {#if showDatePicker}
                      <!-- svelte-ignore a11y-click-events-have-key-events -->
                      <!-- svelte-ignore a11y-no-static-element-interactions -->
                      <div class="date-picker-overlay" on:click={closeDatePicker}>
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                        <div class="date-picker-popup" on:click|stopPropagation>
                          <div class="date-picker-header">
                            <button class="nav-btn" on:click={prevMonth}>‹</button>
                            <div class="month-year-selectors">
                              <select 
                                value={currentMonth} 
                                on:change={onMonthChange}
                                class="month-select"
                              >
                                {#each months as month, index}
                                  <option value={index}>{month}</option>
                                {/each}
                              </select>
                              <select 
                                value={currentYear} 
                                on:change={onYearChange}
                                class="year-select"
                              >
                                {#each years as year}
                                  <option value={year}>{year}</option>
                                {/each}
                              </select>
                            </div>
                            <button class="nav-btn" on:click={nextMonth}>›</button>
                          </div>
                          
                          <div class="date-picker-calendar">
                            <div class="calendar-weekdays">
                              {#each ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as day}
                                <div class="weekday">{day}</div>
                              {/each}
                            </div>
                            
                            <div class="calendar-days">
                              {#each calendarDays as day}
                                {#if day}
                                  <button
                                    class="calendar-day"
                                    class:selected={isDateSelected(day)}
                                    class:in-range={isDateInRange(day)}
                                    on:click={() => selectDate(day)}
                                  >
                                    {day.getDate()}
                                  </button>
                                {:else}
                                  <div class="calendar-day empty"></div>
                                {/if}
                              {/each}
                            </div>
                          </div>
                          
                          <div class="date-picker-actions">
                            <button class="clear-dates-btn" on:click={clearDateRange}>Очистить</button>
                            <button class="close-picker-btn" on:click={closeDatePicker}>Готово</button>
                          </div>
                        </div>
                      </div>
                    {/if}
                  </div>
                {/if}
              </div>
            </th>
            <th>Дата срока годности</th>
            <th>Произведено</th>
            <th>Данные ВетИС</th>
            <th>Разница</th>
            <th>До отправки</th>
            <th>
              <div class="th-content">
                <div 
                  class="th-title" 
                  role="button"
                  tabindex="0"
                  on:click={() => {
                    activeSearch = activeSearch === 'status' ? '' : 'status';
                    if (activeSearch !== 'status') {
                      filters.status = '';
                    }
                  }}
                  on:keydown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      activeSearch = activeSearch === 'status' ? '' : 'status';
                      if (activeSearch !== 'status') {
                        filters.status = '';
                      }
                    }
                  }}
                >
                  <span>Статус</span>
                </div>
                {#if activeSearch === 'status'}
                  <div class="th-search-dropdown">
                    <input
                      type="text"
                      placeholder="Поиск по статусу..."
                      bind:value={filters.status}
                      class="th-search-input"
                    />
                  </div>
                {/if}
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {#each sortedBatches as batch}
            <tr 
              class="batch-row" 
              class:selected={selectedBatch === batch}
              on:click={() => selectBatch(batch)}
            >
              <td>{batch.party}</td>
              <td>{batch.product}</td>
              <td>{formatDateInTimezone(batch.productionDate)}</td>
              <td>{formatDateInTimezone(batch.expiryDate)}</td>
              <td>{batch.produced.toLocaleString()}</td>
              <td>{batch.vetis.toLocaleString()}</td>
              <td class:critical={isCriticalDeviation(batch.produced, batch.vetis)}
                  class:positive={!isCriticalDeviation(batch.produced, batch.vetis) && calculatePercentage(batch.produced, batch.vetis) < 0} 
                  class:negative={!isCriticalDeviation(batch.produced, batch.vetis) && calculatePercentage(batch.produced, batch.vetis) > 0}
                  class:neutral={!isCriticalDeviation(batch.produced, batch.vetis) && calculatePercentage(batch.produced, batch.vetis) === 0}>
                <div class="difference-display">
                  <div class="absolute-diff">{formatDifference(calculateDifference(batch.produced, batch.vetis))}</div>
                  <div class="percentage">({calculatePercentage(batch.produced, batch.vetis)}%)</div>
                </div>
              </td>
              <td class="deadline-cell" class:deadline-overdue={getDeadlineStatus(batch.deadline, batch.status) === 'overdue'}
                  class:deadline-critical={getDeadlineStatus(batch.deadline, batch.status) === 'critical'}
                  class:deadline-warning={getDeadlineStatus(batch.deadline, batch.status) === 'warning'}
                  class:deadline-normal={getDeadlineStatus(batch.deadline, batch.status) === 'normal'}>
                <div class="deadline-display">
                  <div class="time-remaining">{getTimeUntilDeadline(batch.deadline, batch.status)}</div>
                  <div class="deadline-date">{formatDeadlineInTimezone(batch.deadline, deadlineTimezone)}</div>
                </div>
              </td>
              <td>
                <div style="display: flex; flex-direction: column; align-items: flex-start;">
                  <span class="status-badge" class:produced={batch.status === 'Произведено'}>
                    {batch.status}
                  </span>
                  {#if batch.status === 'На холде'}
                    <button class="send-btn" style="margin-top: 0.5rem;" on:click|stopPropagation={openConfirmModal}>Отправить</button>
                  {/if}
                </div>
              </td>
            </tr>
            {#if selectedBatch === batch}
              <tr class="batch-details">
                <td colspan="9">
                  <div class="batch-info-card">
                    <div class="batch-info-header">
                      <strong>Партия: {batch.party}</strong>
                      <span class="batch-info-meta">Продукт: {batch.product} | Произведено: {batch.produced.toLocaleString()}</span>
                    </div>
                    <div class="process-flow-mini">
                      <div class="flow-item-mini" class:completed={getBatchStatus(batch) === 'Производится'} class:active={getBatchStatus(batch) === 'Производится'}>
                        <div class="flow-circle-mini">1</div>
                        <span>Производится</span>
                      </div>
                      <div class="flow-arrow-mini">→</div>
                      <div class="flow-item-mini" class:completed={getBatchStatus(batch) === 'Произведено'} class:active={getBatchStatus(batch) === 'Произведено'}>
                        <div class="flow-circle-mini">2</div>
                        <span>Произведено</span>
                      </div>
                      <div class="flow-arrow-mini">→</div>
                      <div class="flow-item-mini" class:completed={['Отправляется', 'Отправлена'].includes(getBatchStatus(batch))} class:active={getBatchStatus(batch) === 'На холде'} class:hold={getBatchStatus(batch) === 'На холде'}>
                        <div class="flow-circle-mini">3</div>
                        <span>На холде</span>
                      </div>
                      <div class="flow-arrow-mini">→</div>
                      <div class="flow-item-mini" class:completed={getBatchStatus(batch) === 'Отправлена'} class:active={getBatchStatus(batch) === 'Отправляется'}>
                        <div class="flow-circle-mini">4</div>
                        <span>Отправляется</span>
                      </div>
                      <div class="flow-arrow-mini">→</div>
                      <div class="flow-item-mini" class:completed={getBatchStatus(batch) === 'Отправлена'} class:active={getBatchStatus(batch) === 'Отправлена'}>
                        <div class="flow-circle-mini">5</div>
                        <span>Отправлена</span>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            {/if}
          {/each}
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <button on:click={previousPage} disabled={currentPage === 1}>‹</button>
      <span>{currentPage}</span>
      <span>2</span>
      <span>3</span>
      <span>...</span>
      <span>{totalPages}</span>
      <button on:click={nextPage} disabled={currentPage === totalPages}>›</button>
    </div>

  </div>

  <!-- Confirmation Modal -->
  {#if showConfirmModal}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="modal-overlay" role="dialog" aria-modal="true" tabindex="-1">
      <button class="modal-overlay-button" on:click={closeConfirmModal}>
        <span class="sr-only">Close modal</span>
      </button>
      <div class="modal-content" role="document">
        <div class="modal-header">
          <h3>Экран Подтверждения</h3>
        </div>
        <div class="modal-body">
          <p>Точно хотите отправить партию ВСД?</p>
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" on:click={closeConfirmModal}>Нет</button>
          <button class="btn-confirm" on:click={confirmSend}>Да</button>
        </div>
      </div>
    </div>
  {/if}
</div>
{:else}
<div class="loading-container">
  <div class="loading-spinner"></div>
  <p>Проверка авторизации...</p>
</div>
{/if}

<style>
  .reports-container {
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem;
    background: #f8fafc;
    min-height: 100vh;
    max-width: 100vw;
    overflow-x: hidden;
    box-sizing: border-box;
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

  .sidebar-panel {
    width: 100%;
    max-width: 350px;
    background: #fff;
    padding: 1.5rem 2rem 2rem 2rem;
    border-radius: 18px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.08), 0 1.5px 4px rgba(0,0,0,0.04);
    margin: 0 auto 2rem auto;
    border: none;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .sidebar-panel h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 1.25rem;
    padding-bottom: 0.5rem;
    border-bottom: 1.5px solid #e5e7eb;
    line-height: 1.2;
    text-align: center;
    letter-spacing: 0.01em;
  }

  .sidebar-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 1.25rem;
    gap: 0.5rem;
  }

  .sidebar-header h3 {
    margin: 0;
  }

  .admin-controls {
    display: flex;
    gap: 0.75rem;
    margin-top: 0.25rem;
  }

  .edit-btn, .save-btn, .cancel-btn {
    background: #f3f4f6;
    border: 1.5px solid #e5e7eb;
    padding: 0.25rem 0.75rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1.25rem;
    transition: all 0.2s;
    margin-top: 0.125rem;
    box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  }

  .edit-btn:hover {
    background: #e0e7ef;
    border-color: #6366f1;
  }

  .save-btn:hover {
    background: #bbf7d0;
    border-color: #16a34a;
  }

  .cancel-btn:hover {
    background: #fecaca;
    border-color: #dc2626;
  }

  .edit-actions {
    display: flex;
    gap: 0.5rem;
  }

  .company-section h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #475569;
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    text-align: center;
  }

  .company-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
    align-items: center;
  }

  .company-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    background: #f1f5f9;
    text-align: left;
    width: 100%;
    box-shadow: 0 1px 2px rgba(0,0,0,0.03);
    border: 1px solid #e5e7eb;
  }

  .company-count {
    background: #6366f1;
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    font-size: 1rem;
    font-weight: 700;
    min-width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    margin-right: 0.5rem;
    box-shadow: 0 1px 2px rgba(99,102,241,0.08);
  }

  .company-name {
    font-size: 1rem;
    color: #334155;
    line-height: 1.3;
    word-break: break-word;
    text-align: left;
    hyphens: auto;
    font-weight: 500;
  }

  .company-item-edit {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    background: #f1f5f9;
    border: 1px solid #e5e7eb;
    width: 100%;
    box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  }

  .edit-count {
    width: 60px;
    padding: 0.25rem 0.5rem;
    border: 1.5px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.55rem;
    text-align: center;
    background: #fff;
    margin-right: 0.5rem;
  }

  .edit-name {
    flex: 1;
    padding: 0.35rem 0.rem;
    border: 1.5px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.55rem;
    text-align: left;
    background: #fff;
  }

  .edit-count:focus, .edit-name:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15);
  }

  .main-content {
    flex: 1;
    min-width: 0; /* Это важно для правильного сжатия flex элемента */
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .page-header {
  background: linear-gradient(to right, #f8fafc, #f1f5f9);
  border-bottom: 2px solid #e2e8f0;
  padding: 0.25rem 0.5rem;
  }

  .header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.2rem;
  }

  .header-content h1 {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  }

  .timezone-selector {
  display: flex;
  align-items: center;
  gap: 0.15rem;
  }

  .timezone-selector label {
  font-size: 0.7rem;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
  }

  .timezone-selector select {
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.18rem 0.3rem;
  font-size: 0.7rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;
  max-width: 110px;
  }

  .timezone-selector select:hover {
    border-color: #3b82f6;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .timezone-selector select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }





  .table-container {
    overflow-x: auto;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    background: white;
    margin-bottom: 1rem;
    max-width: 100%;
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 #f1f5f9;
  }

  .table-container::-webkit-scrollbar {
    height: 6px;
  }

  .table-container::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }

  .table-container::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }

  .table-container::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }

  .reports-table {
  width: 100%;
  min-width: 800px;
  border-collapse: separate;
  border-spacing: 0;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  }

  .reports-table th {
  background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
  padding: 0.12rem 0.04rem;
  text-align: left;
  font-size: 0.5rem;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e2e8f0;
  vertical-align: top;
  position: relative;
  white-space: normal;
  line-height: 1.02;
  }

  .reports-table th:first-child {
    border-top-left-radius: 12px;
  }

  .reports-table th:last-child {
    border-top-right-radius: 12px;
  }

  .sort-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    margin-left: 0.5rem;
    font-size: 0.875rem;
    color: #6b7280;
    border-radius: 8px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 32px;
  }

  .sort-button:hover {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .sort-button:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .sort-button.active {
    color: #4b4bc7;
    background: #ede7ff;
  }

  .sort-button:focus {
    outline: 2px solid #4b4bc7;
    outline-offset: 2px;
  }

  .date-range-display {
    padding: 0.5rem;
    background: #f8fafc;
    border-radius: 6px;
    font-size: 0.75rem;
    color: #4b5563;
    margin-bottom: 0.5rem;
    text-align: center;
  }

  .date-picker-trigger-inline {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 0.75rem;
    background: #4b4bc7;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
  }

  .date-picker-trigger-inline:hover {
    background: #4040b2;
    border-color: #4b4bc7;
  }

  .date-picker-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .date-picker-popup {
    background: white;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    padding: 1rem;
    min-width: 280px;
  }

  .date-picker-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .nav-btn {
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    font-size: 1rem;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .nav-btn:hover {
    background: #e5e7eb;
  }

  .month-year-selectors {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .month-select,
  .year-select {
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    padding: 0.375rem 0.5rem;
    font-size: 0.875rem;
    cursor: pointer;
    font-weight: 600;
    color: #374151;
  }

  .month-select {
    min-width: 100px;
  }

  .year-select {
    min-width: 70px;
  }

  .month-select:focus,
  .year-select:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
  }

  .date-picker-header button {
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
  }

  .calendar-weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.25rem;
    margin-bottom: 0.5rem;
  }

  .weekday {
    text-align: center;
    font-size: 0.75rem;
    font-weight: 600;
    color: #6b7280;
    padding: 0.25rem;
  }

  .calendar-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.25rem;
  }

  .calendar-day {
    aspect-ratio: 1;
    border: 1px solid transparent;
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
    font-size: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .calendar-day:hover {
    background: #f3f4f6;
  }

  .calendar-day.selected {
    background: #6366f1;
    color: white;
  }

  .calendar-day.in-range {
    background: #e0e7ff;
    color: #6366f1;
  }

  .calendar-day.empty {
    cursor: default;
  }

  .date-picker-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
    gap: 0.5rem;
  }

  .clear-dates-btn,
  .close-picker-btn {
    padding: 0.5rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.75rem;
  }

  .clear-dates-btn {
    background: #f9fafb;
    color: #6b7280;
  }

  .close-picker-btn {
    background: #6366f1;
    color: white;
    border-color: #6366f1;
  }

  .reports-table td {
  padding: 0.12rem 0.04rem;
  font-size: 0.5rem;
  color: #374151;
  border-bottom: 1px solid #f1f5f9;
  background: white;
  transition: all 0.2s ease;
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 70px;
  line-height: 1.02;
  }

  .reports-table tr:hover {
    background: linear-gradient(to right, #f8fafc, #f1f5f9);
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .reports-table tr:hover td {
    background: transparent;
  }

  .reports-table tbody tr:last-child td:first-child {
    border-bottom-left-radius: 12px;
  }

  .reports-table tbody tr:last-child td:last-child {
    border-bottom-right-radius: 12px;
  }

  .reports-table tbody tr:last-child td {
    border-bottom: none;
  }

  .batch-row {
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .batch-row:hover {
    background: #f0f9ff !important;
    transform: translateX(2px);
  }

  .batch-row.selected {
    background: #dbeafe !important;
    border-left: 3px solid #3b82f6;
  }

  .batch-row.selected:hover {
    background: #bfdbfe !important;
  }

  .positive {
    color: #059669;
    font-weight: 600;
  }

  .negative {
    color: #dc2626;
    font-weight: 600;
  }

  .neutral {
    color: #6b7280;
    font-weight: 600;
  }

  .critical {
    color: #dc2626;
    background-color: #fef2f2;
    font-weight: 700;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    border: 2px solid #fecaca;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4);
    }
    50% {
      box-shadow: 0 0 0 8px rgba(220, 38, 38, 0);
    }
  }

  /* Стили для отображения разницы */
  .difference-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .absolute-diff {
    font-size: 0.625rem;
    font-weight: 600;
    line-height: 1.2;
  }

  .percentage {
    font-size: 0.5rem;
    opacity: 0.8;
    font-weight: 500;
    line-height: 1.2;
  }

  .status-badge {
  background: #f3f4f6;
  color: #374151;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.625rem;
  font-weight: 500;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 110px;
  max-width: 100%;
  display: inline-block;
  }

  .status-badge.produced {
    background: #dcfce7;
    color: #166534;
  }

  .send-btn {
    background: #6366f1;
    color: white;
    border: none;
    padding: 0.125rem 0.5rem;
    border-radius: 4px;
    font-size: 0.625rem;
    cursor: pointer;
    margin-left: 0.25rem;
    line-height: 1.2;
  }

  .send-btn:hover {
    background: #5046e4;
  }

  /* Стили для деталей партии под строкой */
  .batch-details {
    background: #f8fafc;
    animation: slideDown 0.3s ease-out;
  }

  .batch-details td {
    padding: 0;
  }

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

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.12rem;
  padding: 0.3rem 0.1rem;
  font-size: 0.7rem;
  background: white;
  border-top: 1px solid #f1f5f9;
  }

  .pagination button {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 0.18rem 0.3rem;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  min-width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  }

  .pagination button:hover:not(:disabled) {
    background: #3b82f6;
    border-color: #3b82f6;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .pagination button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    background: #f1f5f9;
    border-color: #e2e8f0;
  }

  .pagination span {
  padding: 0.18rem 0.3rem;
  color: #6b7280;
  font-weight: 500;
  }

  /* Modal Styles */
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

  /* Стили для больших экранов и масштаба 100% */
  @media (min-width: 1400px) {
    .reports-container {
      gap: 1.5rem;
      padding: 1.5rem;
    }

    .sidebar-panel {
      width: 260px;
      min-width: 240px;
      max-width: 280px;
      padding: 1rem;
    }

    .sidebar-panel h3 {
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }

    .sidebar-header {
      margin-bottom: 1rem;
    }

    .company-section h4 {
      font-size: 0.75rem;
      margin-bottom: 0.75rem;
    }

    .company-list {
      gap: 0.5rem;
    }

    .company-item {
      padding: 0.375rem;
      gap: 0.5rem;
    }

    .company-count {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      min-width: 24px;
    }

    .company-name {
      font-size: 0.75rem;
    }

    .page-header {
      padding: 1rem 1.5rem;
    }

    .header-content h1 {
      font-size: 1.25rem;
    }

    .header-content {
      gap: 0.75rem;
    }

    .timezone-selector {
      gap: 0.75rem;
    }

    .timezone-selector label {
      font-size: 0.875rem;
    }

    .timezone-selector select {
      font-size: 0.875rem;
      padding: 0.5rem 0.75rem;
      min-width: 160px;
    }

    .reports-table th {
      padding: 0.75rem 0.5rem;
      font-size: 0.75rem;
    }

    .reports-table td {
      padding: 0.75rem 0.5rem;
      font-size: 0.75rem;
      max-width: 150px;
    }

    .deadline-cell {
      min-width: 130px;
      max-width: 150px;
    }

    .time-remaining {
      font-size: 0.75rem;
    }

    .deadline-date {
      font-size: 0.625rem;
    }

    .status-badge {
      font-size: 0.55rem;
      padding: 0.25rem 0.55rem;
    }

    .send-btn {
      font-size: 0.55rem;
      padding: 0.25rem 0.55rem;
      margin-left: 0.5rem;
    }
  }

  @media (min-width: 1600px) {
    .reports-container {
      gap: 2rem;
      padding: 2rem;
    }

    .sidebar-panel {
      width: 300px;
      min-width: 280px;
      max-width: 320px;
      padding: 1.5rem;
    }

    .sidebar-panel h3 {
      font-size: 1rem;
      margin-bottom: 1.25rem;
    }

    .reports-table th {
      padding: 1rem 0.75rem;
      font-size: 0.875rem;
    }

    .reports-table td {
      padding: 1rem 0.75rem;
      font-size: 0.875rem;
      max-width: 200px;
    }
  }

  /* Mobile Responsive Styles */
  @media (max-width: 768px) {
    .reports-container {
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
    }

    .sidebar-panel {
      width: 100%;
      padding: 1rem;
    }

    .sidebar-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .sidebar-header h3 {
      font-size: 0.875rem;
    }

    .company-section h4 {
      font-size: 0.75rem;
    }

    .company-name {
      font-size: 0.75rem;
    }

    .main-content {
      border-radius: 8px;
    }

    .page-header {
      padding: 1rem;
    }

    .header-content {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .header-content h1 {
      font-size: 1.25rem;
    }

    .timezone-selector {
      align-self: stretch;
    }

    .timezone-selector select {
      flex: 1;
      min-width: auto;
    }

    .table-container {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    .reports-table {
      min-width: 600px;
    }

    .reports-table th,
    .reports-table td {
      padding: 0.5rem;
      font-size: 0.75rem;
    }

    .date-picker-popup {
      min-width: 260px;
      padding: 0.75rem;
    }

    .month-select,
    .year-select {
      font-size: 0.75rem;
      padding: 0.25rem 0.375rem;
    }

    .month-select {
      min-width: 80px;
    }

    .year-select {
      min-width: 60px;
    }

    .nav-btn {
      width: 28px;
      height: 28px;
      font-size: 0.875rem;
    }

    .calendar-day {
      font-size: 0.625rem;
    }

    .reports-table th {
      white-space: nowrap;
    }

    .batch-row:hover {
      transform: none;
    }

    .batch-info-card {
      margin: 0.25rem;
      padding: 0.75rem;
    }

    .batch-info-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
      font-size: 0.75rem;
    }

    .process-flow-mini {
      gap: 0.25rem;
      flex-wrap: wrap;
      justify-content: flex-start;
    }

    .flow-item-mini {
      font-size: 0.5rem;
      gap: 0.125rem;
    }

    .flow-circle-mini {
      width: 16px;
      height: 16px;
      font-size: 0.5rem;
    }

    .flow-arrow-mini {
      font-size: 0.75rem;
    }

    .pagination {
      padding: 0.5rem;
      font-size: 0.75rem;
      gap: 0.25rem;
    }

    .pagination button,
    .pagination span {
      padding: 0.375rem 0.5rem;
      font-size: 0.75rem;
    }

    .modal-content {
      min-width: 280px;
      max-width: 90vw;
      margin: 1rem;
    }

    .modal-header,
    .modal-body,
    .modal-actions {
      padding: 1rem;
    }

    .modal-actions {
      flex-direction: column;
      gap: 0.5rem;
    }

    .btn-cancel,
    .btn-confirm {
      width: 100%;
      padding: 0.75rem;
    }

    .send-btn {
      padding: 0.125rem 0.5rem;
      font-size: 0.625rem;
      margin-left: 0.25rem;
    }

    .status-badge {
      padding: 0.125rem 0.5rem;
      font-size: 0.56rem;
      min-width: 90px;
    }
  }

  @media (max-width: 480px) {
    .reports-container {
      padding: 0.5rem;
    }

    .sidebar-panel {
      padding: 0.75rem;
    }

    .company-item,
    .company-item-edit {
      padding: 0.375rem;
      gap: 0.5rem;
    }

    .company-count {
      padding: 0.125rem 0.375rem;
      font-size: 0.625rem;
      min-width: 20px;
    }

    .company-name {
      font-size: 0.625rem;
    }

    .edit-count {
      width: 50px;
      font-size: 0.525rem;
    }

    .edit-name {
      font-size: 0.625rem;
    }

    .reports-table th,
    .reports-table td {
      padding: 0.375rem;
      font-size: 0.625rem;
    }

    .batch-info-card {
      padding: 0.5rem;
    }

    .batch-info-header {
      font-size: 0.625rem;
    }

    .batch-info-meta {
      font-size: 0.625rem;
    }

    .process-flow-mini {
      gap: 0.125rem;
    }

    .flow-item-mini {
      font-size: 0.375rem;
    }

    .flow-circle-mini {
      width: 14px;
      height: 14px;
      font-size: 0.375rem;
    }

    .flow-arrow-mini {
      font-size: 0.625rem;
    }

    .modal-content {
      min-width: 260px;
    }

    .modal-header h3 {
      font-size: 1rem;
    }

    .modal-body p {
      font-size: 0.875rem;
    }
  }

  /* Стили для поля поиска */
  .th-search-input {
    padding: 0.875rem 0.3rem 0.675rem 2.0rem;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 0.575rem;
    width: 100%;
    outline: none;
    background: #f8fafc url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'/%3e%3c/svg%3e") no-repeat left 0.75rem center;
    background-size: 1.25rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    color: #1e293b;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .th-search-input:hover {
    border-color: #3b82f6;
    background-color: white;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
  }

  .th-search-input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    background-color: white;
    transform: translateY(-1px);
  }

  .th-search-input::placeholder {
    color: #94a3b8;
    font-weight: 400;
    font-style: italic;
  }

  /* Стили для столбца дедлайна */
  .deadline-cell {
    min-width: 100px;
    max-width: 120px;
    text-align: center;
  }

  .deadline-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .time-remaining {
    font-size: 0.625rem;
    font-weight: 600;
    line-height: 1.2;
  }

  .deadline-date {
    font-size: 0.5rem;
    opacity: 0.8;
    font-weight: 400;
    line-height: 1.2;
  }

  /* Цветовая индикация дедлайна */
  .deadline-normal .time-remaining {
    color: #059669;
  }

  .deadline-warning .time-remaining {
    color: #d97706;
  }

  .deadline-critical .time-remaining {
    color: #f51404;
    animation: pulse-deadline 2s infinite;
  }

  .deadline-overdue .time-remaining {
    color: #991b1b;
    font-weight: 700;
    animation: pulse-deadline 1s infinite;
  }

  .deadline-overdue .deadline-date {
    color: #991b1b;
    text-decoration: line-through;
  }

  @keyframes pulse-deadline {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }
</style>
