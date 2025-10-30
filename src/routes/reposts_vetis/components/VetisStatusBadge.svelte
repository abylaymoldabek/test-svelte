<script lang="ts">
  export let status: string;
  export let reportsSentCount: number = 0;
  export let reportsAllCount: number = 0;

  // Маппинг статусов с бэкенда на русские названия
  const statusMapping: { [key: string]: string } = {
    // Статусы с бэкенда
    'new': 'Новая',
    'producing': 'Производится',
    'produced': 'Произведено',
    'hold': 'На холде',
    'resumed': 'Возобновлено',
    'sending': 'Отправляется',
    'done': 'Отправлена',
    
    // Уже русские статусы (оставляем как есть)
    'Новая': 'Новая',
    'Производится': 'Производится',
    'Произведено': 'Произведено',
    'На холде': 'На холде',
    'Возобновлено': 'Возобновлено',
    'Отправляется': 'Отправляется',
    'Отправлена': 'Отправлена',
  };

  // Функция для получения русского названия статуса
  function getDisplayStatus(rawStatus: string): string {
    // Если статус уже есть в маппинге
    if (statusMapping[rawStatus]) {
      return statusMapping[rawStatus];
    }
    
    // Если статус содержит "Отправлена" или "Отправляется" 
    if (rawStatus.includes('Отправлена') || rawStatus.includes('sent')) {
      return 'Отправлена';
    }
    if (rawStatus.includes('Отправляется') || rawStatus.includes('sending')) {
      return 'Отправляется';
    }
    
    // Возвращаем исходный статус, если не нашли соответствие
    return rawStatus || 'Неизвестно';
  }

  $: displayStatus = getDisplayStatus(status);

  $: shouldShowCounter = (displayStatus === "Отправляется" || displayStatus === "Отправлена") && (reportsAllCount > 0 || reportsSentCount > 0);

  
  $: statusClasses = {
    new: displayStatus === "Новая",
    producing: displayStatus === "Производится",
    produced: displayStatus === "Произведено",
    hold: displayStatus === "На холде",
    resumed: displayStatus === "Возобновлено",
    sending: displayStatus === "Отправляется",
    done: displayStatus === "Отправлена",
  };
</script>

<span
  class="status-badge"
  class:new={statusClasses.new}
  class:producing={statusClasses.producing}
  class:produced={statusClasses.produced}
  class:hold={statusClasses.hold}
  class:resumed={statusClasses.resumed}
  class:sending={statusClasses.sending}
  class:done={statusClasses.done}
>
  {displayStatus}
  {#if shouldShowCounter}
    <span class="reports-counter">({reportsSentCount}/{reportsAllCount})</span>
  {/if}
</span>

<style>
  .status-badge {
    background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
    color: #374151;
    padding: 0.3rem 0.6rem;
    border-radius: 14px;
    font-size: 0.7rem;
    font-weight: 600;
    line-height: 1.2;
    white-space: nowrap;
    overflow: visible;
    text-overflow: ellipsis;
    min-width: 80px;
    max-width: 100%;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    position: relative;
  }

  .status-badge::before {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.7;
  }

  .status-badge.new {
    background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
    color: #374151;
    box-shadow: 0 2px 8px rgba(55, 65, 81, 0.2);
  }

  .status-badge.producing {
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    color: #1e40af;
    box-shadow: 0 2px 8px rgba(30, 64, 175, 0.2);
  }

  .status-badge.produced {
    background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
    color: #166534;
    box-shadow: 0 2px 8px rgba(22, 101, 52, 0.2);
  }

  .status-badge.hold {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    color: #92400e;
    box-shadow: 0 2px 8px rgba(146, 64, 14, 0.2);
  }

  .status-badge.resumed {
    background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
    color: #3730a3;
    box-shadow: 0 2px 8px rgba(55, 48, 163, 0.2);
  }

  .status-badge.sending {
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    color: #1e40af;
    box-shadow: 0 2px 8px rgba(30, 64, 175, 0.2);
  }

  .status-badge.done {
    background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
    color: #166534;
    box-shadow: 0 2px 8px rgba(22, 101, 52, 0.2);
  }

  .reports-counter {
    font-size: 0.65rem;
    opacity: 0.8;
    margin-left: 0.25rem;
    font-weight: 500;
  }
</style>
