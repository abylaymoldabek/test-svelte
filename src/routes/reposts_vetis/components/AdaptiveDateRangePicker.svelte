<script lang="ts">
  import { onMount } from 'svelte';
  
  /**
   * Адаптивный календарь для выбора диапазона дат
   * - На десктопе: выпадающий календарь
   * - На мобильных: модальное окно
   * - Поддержка свайпов для навигации по месяцам
   * - Минималистичный дизайн с крупными кликабельными областями
   */
  
  export let dateFrom: string = "";
  export let dateTo: string = "";
  export let placeholder: string = "Выберите период";
  export let disabled: boolean = false;
  
  // Состояние компонента
  let isOpen = false;
  let currentMonth = new Date();
  let selectedStart: Date | null = null;
  let selectedEnd: Date | null = null;
  let hoveredDate: Date | null = null;
  let containerElement: HTMLDivElement;
  let isMobile = false;
  let isTablet = false;
  
  // Определение мобильного устройства и инициализация
  onMount(() => {
    // Инициализация данных
    updateFromProps();
    
    // Определение мобильного устройства и планшетов
    const checkMobile = () => {
      const width = window.innerWidth;
      // Модальное окно для всех устройств меньше 1366px (включая планшеты)
      isMobile = width < 1366;
      // Планшет: 768px - 1366px
      isTablet = width >= 768 && width < 1366;
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  });
  
  // Синхронизация внешних значений с внутренним состоянием
  function updateFromProps() {
    if (dateFrom && !selectedStart) {
      selectedStart = new Date(dateFrom);
      currentMonth = new Date(selectedStart.getFullYear(), selectedStart.getMonth(), 1);
    }
    if (dateTo && !selectedEnd) {
      selectedEnd = new Date(dateTo);
    }
  }
  
  // Обновление внешних значений при изменении внутреннего состояния
  function updateProps() {
    const newDateFrom = selectedStart ? formatDateValue(selectedStart) : "";
    const newDateTo = selectedEnd ? formatDateValue(selectedEnd) : "";
    
    if (dateFrom !== newDateFrom) {
      dateFrom = newDateFrom;
    }
    if (dateTo !== newDateTo) {
      dateTo = newDateTo;
    }
  }
  
  // Вызываем обновления при необходимости
  $: selectedStart, selectedEnd, updateProps();
  
  /**
   * Форматирование даты в строку YYYY-MM-DD
   */
  function formatDateValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  /**
   * Форматирование даты для отображения
   */
  function formatDisplayDate(date: Date): string {
    return date.toLocaleDateString("ru-RU", { 
      day: "2-digit", 
      month: "short",
      year: "numeric" 
    });
  }
  
  /**
   * Получение дней текущего месяца для отображения в календаре
   */
  function getCalendarDays(): (Date | null)[] {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Первый день месяца
    const firstDay = new Date(year, month, 1);
    // Последний день месяца
    const lastDay = new Date(year, month + 1, 0);
    
    // Начинаем с понедельника (getDay() возвращает 0-6, где 0 - воскресенье)
    const startDate = new Date(firstDay);
    const dayOfWeek = (firstDay.getDay() + 6) % 7; // Преобразуем в 0-6, где 0 - понедельник
    startDate.setDate(firstDay.getDate() - dayOfWeek);
    
    const days: (Date | null)[] = [];
    const current = new Date(startDate);
    
    // Генерируем 42 дня (6 недель) для отображения календаря
    for (let i = 0; i < 42; i++) {
      if (current.getMonth() === month) {
        days.push(new Date(current));
      } else {
        days.push(null);
      }
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }
  
  /**
   * Навигация по месяцам
   */
  function previousMonth() {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
  }
  
  function nextMonth() {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
  }
  
  /**
   * Обработка клика по дате
   */
  function handleDateClick(date: Date) {
    if (!selectedStart || (selectedStart && selectedEnd)) {
      // Начинаем новый выбор
      selectedStart = date;
      selectedEnd = null;
      hoveredDate = null;
    } else if (selectedStart && !selectedEnd) {
      // Завершаем выбор диапазона
      if (date < selectedStart) {
        selectedEnd = selectedStart;
        selectedStart = date;
      } else {
        selectedEnd = date;
      }
      // Закрываем календарь после выбора диапазона
      setTimeout(() => {
        isOpen = false;
      }, 300);
    }
  }
  
  /**
   * Обработка наведения для предварительного просмотра диапазона
   */
  function handleDateHover(date: Date) {
    if (selectedStart && !selectedEnd) {
      hoveredDate = date;
    }
  }
  
  /**
   * Проверка, попадает ли дата в выбранный диапазон
   */
  function isInRange(date: Date): boolean {
    if (!selectedStart) return false;
    
    const end = selectedEnd || hoveredDate;
    if (!end) return false;
    
    const start = selectedStart < end ? selectedStart : end;
    const finish = selectedStart < end ? end : selectedStart;
    
    return date >= start && date <= finish;
  }
  
  /**
   * Проверка, является ли дата началом или концом диапазона
   */
  function isRangeEnd(date: Date): boolean {
    if (!selectedStart) return false;
    return (selectedStart && date.getTime() === selectedStart.getTime()) ||
           (selectedEnd && date.getTime() === selectedEnd.getTime()) || false;
  }
  
  /**
   * Закрытие календаря при клике вне него
   */
  function handleClickOutside(event: MouseEvent) {
    if (containerElement && !containerElement.contains(event.target as Node)) {
      isOpen = false;
    }
  }
  
  /**
   * Обработка свайпов для мобильных устройств
   */
  let touchStartX = 0;
  let touchEndX = 0;
  
  function handleTouchStart(event: TouchEvent) {
    touchStartX = event.changedTouches[0].screenX;
  }
  
  function handleTouchEnd(event: TouchEvent) {
    touchEndX = event.changedTouches[0].screenX;
    handleSwipe();
  }
  
  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        nextMonth(); // Свайп влево - следующий месяц
      } else {
        previousMonth(); // Свайп вправо - предыдущий месяц
      }
    }
  }
  
  /**
   * Быстрые фильтры для удобства
   */
  function setToday() {
    const today = new Date();
    selectedStart = today;
    selectedEnd = today;
    isOpen = false;
  }
  
  function setThisWeek() {
    const today = new Date();
    const startOfWeek = new Date(today);
    const dayOfWeek = (today.getDay() + 6) % 7; // Понедельник = 0
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    selectedStart = startOfWeek;
    selectedEnd = endOfWeek;
    isOpen = false;
  }
  
  function setThisMonth() {
    const today = new Date();
    selectedStart = new Date(today.getFullYear(), today.getMonth(), 1);
    selectedEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    isOpen = false;
  }
  
  function clearSelection() {
    selectedStart = null;
    selectedEnd = null;
    hoveredDate = null;
    dateFrom = "";
    dateTo = "";
  }
  
  // Добавляем и удаляем обработчики событий
  $: if (isOpen && typeof window !== 'undefined') {
    document.addEventListener('click', handleClickOutside);
  } else if (typeof window !== 'undefined') {
    document.removeEventListener('click', handleClickOutside);
  }
  
  // Очистка при уничтожении компонента
  import { onDestroy } from 'svelte';
  onDestroy(() => {
    if (typeof window !== 'undefined') {
      document.removeEventListener('click', handleClickOutside);
    }
  });
</script>

<div class="date-range-picker" bind:this={containerElement}>
  <!-- Триггер для открытия календаря -->
  <button 
    class="date-picker-trigger"
    class:disabled
    on:click={() => !disabled && (isOpen = !isOpen)}
    type="button"
  >
    <div class="trigger-content">
      <span class="date-display">
        {#if selectedStart && selectedEnd}
          {formatDisplayDate(selectedStart)} — {formatDisplayDate(selectedEnd)}
        {:else if selectedStart}
          {formatDisplayDate(selectedStart)} — ...
        {:else}
          {placeholder}
        {/if}
      </span>
      <svg class="calendar-icon" class:open={isOpen} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
    </div>
  </button>

  <!-- Календарь -->
  {#if isOpen}
    <div 
      class="calendar-container"
      class:mobile={isMobile}
      on:touchstart={handleTouchStart}
      on:touchend={handleTouchEnd}
    >
      <!-- Полноэкранный оверлей для мобильных устройств -->
      {#if isMobile}
        <div 
          class="modal-overlay" 
          role="button"
          tabindex="0"
          on:click={() => isOpen = false}
          on:keydown={(e) => e.key === 'Escape' && (isOpen = false)}
        ></div>
        
        <!-- Модальное окно для мобильных и планшетов -->
        <div class="mobile-modal" class:tablet={isTablet}>
          <!-- Заголовок модального окна -->
          <div class="modal-header">
            <h2 class="modal-title">Выберите период дат</h2>
            <button 
              class="modal-close" 
              on:click={() => isOpen = false}
              aria-label="Закрыть календарь"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Контент календаря для мобильных -->
          <div class="modal-content">
            <!-- Выбранный период -->
            {#if selectedStart || selectedEnd}
              <div class="selected-period">
                <div class="period-label">Выбранный период:</div>
                <div class="period-display">
                  {#if selectedStart && selectedEnd}
                    {formatDisplayDate(selectedStart)} — {formatDisplayDate(selectedEnd)}
                  {:else if selectedStart}
                    {formatDisplayDate(selectedStart)} — выберите конец периода
                  {:else}
                    Выберите начало периода
                  {/if}
                </div>
              </div>
            {/if}

            <!-- Быстрые фильтры -->
            <div class="quick-filters mobile">
              <button class="quick-filter-btn" on:click={setToday}>Сегодня</button>
              <button class="quick-filter-btn" on:click={setThisWeek}>Эта неделя</button>
              <button class="quick-filter-btn" on:click={setThisMonth}>Этот месяц</button>
              <button class="quick-filter-btn clear" on:click={clearSelection}>Очистить</button>
            </div>

            <!-- Навигация по месяцам -->
            <div class="calendar-header mobile">
              <button 
                class="nav-btn" 
                on:click={previousMonth} 
                type="button"
                aria-label="Предыдущий месяц"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="15,18 9,12 15,6"></polyline>
                </svg>
              </button>
              
              <h3 class="month-year mobile">
                {currentMonth.toLocaleDateString("ru-RU", { month: "long", year: "numeric" })}
              </h3>
              
              <button 
                class="nav-btn" 
                on:click={nextMonth} 
                type="button"
                aria-label="Следующий месяц"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9,6 15,12 9,18"></polyline>
                </svg>
              </button>
            </div>

            <!-- Дни недели -->
            <div class="weekdays mobile">
              {#each ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] as day}
                <div class="weekday mobile">{day}</div>
              {/each}
            </div>

            <!-- Календарная сетка -->
            <div class="calendar-grid mobile">
              {#each getCalendarDays() as day}
                {#if day}
                  <button
                    class="calendar-day mobile"
                    class:selected={isRangeEnd(day)}
                    class:in-range={isInRange(day)}
                    class:today={day.toDateString() === new Date().toDateString()}
                    on:click={() => handleDateClick(day)}
                    on:mouseenter={() => handleDateHover(day)}
                    type="button"
                  >
                    {day.getDate()}
                  </button>
                {:else}
                  <div class="calendar-day mobile empty"></div>
                {/if}
              {/each}
            </div>
          </div>

          <!-- Кнопки действий для мобильных -->
          <div class="mobile-actions">
            <button class="mobile-action-btn cancel" on:click={() => isOpen = false}>
              Отмена
            </button>
            <button class="mobile-action-btn apply" on:click={() => isOpen = false}>
              Применить
            </button>
          </div>
        </div>
      {:else}
        <!-- Десктопная версия календаря -->
        <div class="calendar">
          <!-- Быстрые фильтры -->
          <div class="quick-filters">
            <button class="quick-filter-btn" on:click={setToday}>Сегодня</button>
            <button class="quick-filter-btn" on:click={setThisWeek}>Эта неделя</button>
            <button class="quick-filter-btn" on:click={setThisMonth}>Этот месяц</button>
            <button class="quick-filter-btn clear" on:click={clearSelection}>Очистить</button>
          </div>

          <!-- Навигация по месяцам -->
          <div class="calendar-header">
            <button 
              class="nav-btn" 
              on:click={previousMonth} 
              type="button"
              aria-label="Предыдущий месяц"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15,18 9,12 15,6"></polyline>
              </svg>
            </button>
            
            <h3 class="month-year">
              {currentMonth.toLocaleDateString("ru-RU", { month: "long", year: "numeric" })}
            </h3>
            
            <button 
              class="nav-btn" 
              on:click={nextMonth} 
              type="button"
              aria-label="Следующий месяц"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9,6 15,12 9,18"></polyline>
              </svg>
            </button>
          </div>

          <!-- Дни недели -->
          <div class="weekdays">
            {#each ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] as day}
              <div class="weekday">{day}</div>
            {/each}
          </div>

          <!-- Календарная сетка -->
          <div class="calendar-grid">
            {#each getCalendarDays() as day}
              {#if day}
                <button
                  class="calendar-day"
                  class:selected={isRangeEnd(day)}
                  class:in-range={isInRange(day)}
                  class:today={day.toDateString() === new Date().toDateString()}
                  on:click={() => handleDateClick(day)}
                  on:mouseenter={() => handleDateHover(day)}
                  type="button"
                >
                  {day.getDate()}
                </button>
              {:else}
                <div class="calendar-day empty"></div>
              {/if}
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .date-range-picker {
    position: relative;
    display: inline-block;
    width: 100%;
  }

  /* Триггер */
  .date-picker-trigger {
    width: 100%;
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    padding: 0.75rem 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.875rem;
    min-height: 48px;
  }

  .date-picker-trigger:hover:not(.disabled) {
    border-color: #3b82f6;
  }

  .date-picker-trigger:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .date-picker-trigger.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .trigger-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .date-display {
    color: #374151;
    font-weight: 500;
  }

  .calendar-icon {
    color: #6b7280;
    transition: transform 0.2s ease;
  }

  .calendar-icon.open {
    transform: rotate(180deg);
  }

  /* Контейнер календаря */
  .calendar-container {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 1000;
    margin-top: 0.5rem;
  }

  .calendar-container.mobile {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(2px);
    z-index: 1000;
  }

  /* Мобильное модальное окно */
  .mobile-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: white;
    z-index: 1001;
    display: flex;
    flex-direction: column;
    animation: slideUpModal 0.3s ease-out;
  }

  @keyframes slideUpModal {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;
  }

  .modal-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
  }

  .modal-close {
    background: none;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
    color: #6b7280;
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  .modal-close:hover {
    background: #f3f4f6;
    color: #374151;
  }

  .modal-content {
    flex: 1;
    padding: 1.5rem;
    overflow-y: auto;
  }

  /* Планшетная версия модального окна */
  .mobile-modal.tablet {
    position: fixed;
    top: 50%;
    left: 50%;
    right: auto;
    bottom: auto;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: scaleUpModal 0.3s ease-out;
  }

  @keyframes scaleUpModal {
    from {
      transform: translate(-50%, -50%) scale(0.9);
      opacity: 0;
    }
    to {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }
  }

  .mobile-modal.tablet .modal-header {
    border-radius: 20px 20px 0 0;
  }

  .mobile-modal.tablet .modal-content {
    padding: 2rem;
  }

  .mobile-modal.tablet .mobile-actions {
    border-radius: 0 0 20px 20px;
    padding: 1.5rem 2rem;
  }

  /* Выбранный период */
  .selected-period {
    background: #f0f9ff;
    border: 1px solid #bfdbfe;
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 1.5rem;
  }

  .period-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #1e40af;
    margin-bottom: 0.5rem;
  }

  .period-display {
    font-size: 1rem;
    font-weight: 500;
    color: #1e40af;
  }

  /* Мобильные версии компонентов */
  .quick-filters.mobile {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .quick-filters.mobile .quick-filter-btn {
    padding: 0.875rem;
    font-size: 0.95rem;
    font-weight: 600;
    border-radius: 10px;
  }

  .calendar-header.mobile {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding: 0.75rem;
    background: #f9fafb;
    border-radius: 12px;
  }

  .calendar-header.mobile .nav-btn {
    padding: 0.75rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .month-year.mobile {
    font-size: 1.125rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
    text-transform: capitalize;
  }

  .weekdays.mobile {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.25rem;
    margin-bottom: 0.75rem;
  }

  .weekday.mobile {
    text-align: center;
    font-size: 0.875rem;
    font-weight: 700;
    color: #6b7280;
    padding: 0.75rem 0.5rem;
    text-transform: uppercase;
    background: #f9fafb;
    border-radius: 8px;
  }

  .calendar-grid.mobile {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .calendar-day.mobile {
    aspect-ratio: 1;
    border: none;
    background: #f9fafb;
    cursor: pointer;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 500;
    color: #374151;
    transition: all 0.2s ease;
    position: relative;
    min-height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid transparent;
  }

  .calendar-day.mobile:hover:not(.empty) {
    background: #e5e7eb;
    transform: scale(1.05);
  }

  .calendar-day.mobile.today {
    background: #dbeafe;
    color: #1d4ed8;
    font-weight: 700;
    border-color: #93c5fd;
  }

  .calendar-day.mobile.selected {
    background: #3b82f6;
    color: white;
    font-weight: 700;
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }

  .calendar-day.mobile.in-range {
    background: #dbeafe;
    color: #1d4ed8;
    border-color: #bfdbfe;
  }

  .calendar-day.mobile.empty {
    cursor: default;
    background: transparent;
  }

  .mobile-actions {
    display: flex;
    gap: 1rem;
    padding: 1.5rem;
    border-top: 1px solid #e5e7eb;
    background: #f9fafb;
  }

  .mobile-action-btn {
    flex: 1;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    transition: all 0.2s ease;
    border: none;
    cursor: pointer;
    min-height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mobile-action-btn.cancel {
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
  }

  .mobile-action-btn.cancel:hover {
    background: #e5e7eb;
    color: #1f2937;
  }

  .mobile-action-btn.apply {
    background: #3b82f6;
    color: white;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  }

  .mobile-action-btn.apply:hover {
    background: #2563eb;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    transform: translateY(-1px);
  }

  /* Календарь */
  .calendar {
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    padding: 1.5rem;
    min-width: 320px;
    max-width: 400px;
    position: relative;
    animation: slideDown 0.2s ease-out;
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

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Быстрые фильтры */
  .quick-filters {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }

  .quick-filter-btn {
    background: #f3f4f6;
    border: none;
    border-radius: 8px;
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #374151;
  }

  .quick-filter-btn:hover {
    background: #e5e7eb;
  }

  .quick-filter-btn.clear {
    background: #fef2f2;
    color: #dc2626;
  }

  .quick-filter-btn.clear:hover {
    background: #fee2e2;
  }

  /* Заголовок календаря */
  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .nav-btn {
    background: none;
    border: none;
    padding: 0.5rem;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s ease;
    color: #6b7280;
  }

  .nav-btn:hover {
    background: #f3f4f6;
  }

  .month-year {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
    text-transform: capitalize;
  }

  /* Дни недели */
  .weekdays {
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
    padding: 0.5rem;
    text-transform: uppercase;
  }

  /* Календарная сетка */
  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.25rem;
  }

  .calendar-day {
    aspect-ratio: 1;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    transition: all 0.2s ease;
    position: relative;
    min-height: 44px; /* Минимальный размер для тач-интерфейса */
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .calendar-day:hover:not(.empty) {
    background: #f3f4f6;
  }

  .calendar-day.today {
    background: #dbeafe;
    color: #1d4ed8;
    font-weight: 600;
  }

  .calendar-day.selected {
    background: #3b82f6;
    color: white;
    font-weight: 600;
  }

  .calendar-day.in-range {
    background: #dbeafe;
    color: #1d4ed8;
  }

  .calendar-day.empty {
    cursor: default;
  }

  /* Кнопки действий для мобильных */
  .mobile-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e5e7eb;
  }

  /* Адаптивность */
  @media (max-width: 768px) {
    .calendar {
      padding: 1rem;
    }

    .month-year {
      font-size: 1rem;
    }

    .calendar-day {
      min-height: 48px; /* Увеличенный размер для мобильных */
      font-size: 1rem;
    }

    .quick-filters {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
    }
  }

  @media (max-width: 480px) {
    .calendar {
      margin: 0.5rem;
    }

    .quick-filter-btn {
      padding: 0.75rem;
      font-size: 0.8rem;
    }
  }

  /* Очень маленькие экраны (телефоны менее 360px) */
  @media (max-width: 359px) {
    .calendar {
      margin: 0.25rem;
      padding: 0.75rem;
    }

    .quick-filters {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .quick-filter-btn {
      padding: 0.625rem 0.5rem;
      font-size: 0.75rem;
    }

    .month-year {
      font-size: 0.9rem;
    }

    .calendar-day {
      min-height: 40px;
      font-size: 0.85rem;
    }

    .weekday {
      font-size: 0.7rem;
      padding: 0.25rem;
    }

    .mobile-actions {
      gap: 0.75rem;
      margin-top: 1rem;
      padding-top: 1rem;
    }

    .nav-btn {
      padding: 0.375rem;
    }
  }

  /* Ландшафтная ориентация на телефонах */
  @media (max-width: 767px) and (orientation: landscape) {

    .quick-filters {
      margin-bottom: 1rem;
    }

    .calendar-grid {
      gap: 0.125rem;
    }

    .calendar-day {
      min-height: 36px;
      font-size: 0.8rem;
    }
  }

  /* Стили для больших экранов (компьютеры) */
  @media (min-width: 1024px) {
    .date-picker-trigger {
      padding: 1rem 1.25rem;
      font-size: 0.9rem;
      min-height: 52px;
    }

    .date-display {
      font-size: 0.9rem;
    }

    .calendar-icon {
      width: 22px;
      height: 22px;
    }
  }
</style>