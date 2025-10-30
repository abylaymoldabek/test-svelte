<script lang="ts">
  export let dateFrom: string = "";
  export let dateTo: string = "";
  
  let isOpen = false;
  let currentMonth = new Date();
  let selectedStart: Date | null = null;
  let selectedEnd: Date | null = null;
  let hoveredDate: Date | null = null;
  let calendarElement: HTMLDivElement;
  
  // Установить текущий месяц на основе выбранных дат
  $: {
    if (selectedStart && !isOpen) {
      currentMonth = new Date(selectedStart.getFullYear(), selectedStart.getMonth(), 1);
    }
  }
  
  // Закрытие при клике вне календаря
  function handleClickOutside(event: MouseEvent) {
    if (calendarElement && !calendarElement.contains(event.target as Node)) {
      isOpen = false;
    }
  }
  
  $: if (isOpen) {
    document.addEventListener('click', handleClickOutside);
  } else {
    document.removeEventListener('click', handleClickOutside);
  }
  
  // Форматирование даты для отображения
  function formatDisplayDate(date: string) {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("ru-RU", { 
      day: "2-digit", 
      month: "2-digit", 
      year: "numeric" 
    });
  }
  
  // Преобразование в формат YYYY-MM-DD
  function formatDateValue(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Получить дни месяца
  function getDaysInMonth(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay() === 0 ? 7 : firstDay.getDay(); // Понедельник = 1
    
    const days = [];
    
    // Добавляем пустые ячейки для дней предыдущего месяца
    for (let i = 1; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Добавляем дни текущего месяца
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  }
  
  // Проверить, является ли дата начальной
  function isStartDate(date: Date) {
    if (!selectedStart) return false;
    return date.getTime() === selectedStart.getTime();
  }
  
  // Проверить, является ли дата конечной
  function isEndDate(date: Date) {
    if (!selectedEnd) return false;
    return date.getTime() === selectedEnd.getTime();
  }
  
  // Проверить, находится ли дата в выбранном диапазоне
  function isInRange(date: Date) {
    if (!selectedStart || !selectedEnd) return false;
    const start = selectedStart < selectedEnd ? selectedStart : selectedEnd;
    const end = selectedStart < selectedEnd ? selectedEnd : selectedStart;
    return date > start && date < end;
  }
  
  // Проверить, находится ли дата в диапазоне hover
  function isInHoverRange(date: Date) {
    if (!selectedStart || !hoveredDate || selectedEnd) return false;
    const start = selectedStart < hoveredDate ? selectedStart : hoveredDate;
    const end = selectedStart < hoveredDate ? hoveredDate : selectedStart;
    return date > start && date < end;
  }
  
  // Обработка клика по дате
  function handleDateClick(date: Date) {
    if (!selectedStart || selectedEnd) {
      // Начинаем новый выбор
      selectedStart = date;
      selectedEnd = null;
      dateFrom = formatDateValue(date);
      dateTo = "";
    } else {
      // Завершаем выбор диапазона
      if (date < selectedStart) {
        selectedEnd = selectedStart;
        selectedStart = date;
      } else {
        selectedEnd = date;
      }
      dateFrom = formatDateValue(selectedStart);
      dateTo = formatDateValue(selectedEnd);
      isOpen = false;
    }
  }
  
  // Навигация по месяцам
  function previousMonth() {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
  }
  
  function nextMonth() {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
  }
  
  // Получить название месяца
  function getMonthName(date: Date) {
    return date.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
  }
  
  // Сброс выбора
  function clearSelection() {
    selectedStart = null;
    selectedEnd = null;
    dateFrom = "";
    dateTo = "";
  }
  
  // Создать дату из строки без проблем с временной зоной
  function createDateFromString(dateString: string) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  
  // Инициализация из переданных значений
  $: {
    if (dateFrom && (!selectedStart || formatDateValue(selectedStart) !== dateFrom)) {
      selectedStart = createDateFromString(dateFrom);
    }
    if (dateTo && (!selectedEnd || formatDateValue(selectedEnd) !== dateTo)) {
      selectedEnd = createDateFromString(dateTo);
    }
    if (!dateFrom && selectedStart) {
      selectedStart = null;
    }
    if (!dateTo && selectedEnd) {
      selectedEnd = null;
    }
  }
</script>

<div class="date-range-picker" bind:this={calendarElement}>
  <div class="input-container">
    <input
      type="text"
      readonly
      placeholder="Выбери диапазон 📅"
      value={dateFrom && dateTo ? `${formatDisplayDate(dateFrom)} - ${formatDisplayDate(dateTo)}` : dateFrom ? formatDisplayDate(dateFrom) : ""}
      on:click={() => isOpen = !isOpen}
      class="date-input"
    />
    <button type="button" class="calendar-icon" on:click={() => isOpen = !isOpen}>
      📅
    </button>
  </div>
  
  {#if isOpen}
    <div class="calendar-dropdown">
      <div class="calendar-header">
        <button type="button" on:click={previousMonth} class="nav-button">❮</button>
        <span class="month-title">{getMonthName(currentMonth)}</span>
        <button type="button" on:click={nextMonth} class="nav-button">❯</button>
      </div>
      
      <div class="weekdays">
        <span>Пн</span>
        <span>Вт</span>
        <span>Ср</span>
        <span>Чт</span>
        <span>Пт</span>
        <span>Сб</span>
        <span>Вс</span>
      </div>
      
      <div class="calendar-grid">
        {#each getDaysInMonth(currentMonth) as day}
          {#if day}
            <button
              type="button"
              class="day-button"
              class:selected={isStartDate(day)}
              class:selected-end={isEndDate(day)}
              class:in-range={isInRange(day)}
              class:hover-range={isInHoverRange(day)}
              on:click={() => handleDateClick(day)}
              on:mouseenter={() => hoveredDate = day}
              on:mouseleave={() => hoveredDate = null}
            >
              {day.getDate()}
            </button>
          {:else}
            <span class="empty-day"></span>
          {/if}
        {/each}
      </div>
      
      <div class="calendar-footer">
        <div class="selected-range-text">
          {#if selectedStart && selectedEnd}
            {formatDisplayDate(formatDateValue(selectedStart))} - {formatDisplayDate(formatDateValue(selectedEnd))}
          {:else if selectedStart}
            Выберите конечную дату
          {:else}
            Выберите диапазон дат
          {/if}
        </div>
        <button type="button" on:click={clearSelection} class="clear-button">
          Очистить
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .date-range-picker {
    position: relative;
    width: 100%;
  }
  
  .input-container {
    position: relative;
    display: flex;
    align-items: center;
  }
  
  .date-input {
    width: 100%;
    padding: 0.75rem 2.5rem 0.75rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 6px;
    font-size: 0.875rem;
    background: white;
    cursor: pointer;
    outline: none;
    transition: border-color 0.2s;
    min-height: 44px;
    font-weight: 500;
  }
  
  .date-input:focus,
  .date-input:hover {
    border-color: #3b82f6;
  }
  
  .calendar-icon {
    position: absolute;
    right: 0.75rem;
    background: none;
    border: none;
    font-size: 1.125rem;
    cursor: pointer;
    padding: 0.375rem;
    border-radius: 4px;
    transition: background-color 0.2s;
  }
  
  .calendar-icon:hover {
    background-color: #f3f4f6;
  }
  
  .calendar-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 1000;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    padding: 0.75rem;
    margin-top: 0.25rem;
    min-width: 280px;
  }
  
  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }
  
  .nav-button {
    background: none;
    border: none;
    font-size: 1rem;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    transition: background-color 0.2s;
    color: #6b7280;
  }
  
  .nav-button:hover {
    background-color: #f3f4f6;
    color: #374151;
  }
  
  .month-title {
    font-weight: 600;
    font-size: 0.875rem;
    text-transform: capitalize;
    color: #374151;
  }
  
  .weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
    margin-bottom: 0.5rem;
    justify-items: center;
  }
  
  .weekdays span {
    text-align: center;
    font-size: 0.75rem;
    font-weight: 600;
    color: #6b7280;
    padding: 0.375rem 0;
    text-transform: uppercase;
    width: 32px;
  }
  
  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
    justify-items: center;
  }
  
  .day-button {
    aspect-ratio: 1;
    border: none;
    background: white;
    cursor: pointer;
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s;
    position: relative;
    min-height: 32px;
    width: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #374151;
    margin: 0 auto;
    line-height: 1;
    box-sizing: border-box;
  }
  
  .day-button:hover {
    background-color: #e0f2fe;
    color: #0369a1;
  }
  
  .day-button.selected {
    background-color: #3b82f6 !important;
    color: white !important;
    font-weight: 600;
  }
  
  .day-button.selected-end {
    background-color: #3b82f6 !important;
    color: white !important;
    font-weight: 600;
  }
  
  .day-button.in-range {
    background-color: #dbeafe !important;
    color: #1e40af !important;
  }
  
  .day-button.hover-range {
    background-color: #e0f2fe !important;
    color: #0369a1 !important;
  }
  
  .empty-day {
    aspect-ratio: 1;
    min-height: 32px;
    width: 32px;
  }
  
  .calendar-footer {
    margin-top: 0.75rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .clear-button {
    background: none;
    border: 1px solid #e2e8f0;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
    color: #6b7280;
  }
  
  .clear-button:hover {
    background-color: #f3f4f6;
    border-color: #d1d5db;
    color: #374151;
  }
  
  .selected-range-text {
    font-size: 0.75rem;
    color: #6b7280;
  }
</style>