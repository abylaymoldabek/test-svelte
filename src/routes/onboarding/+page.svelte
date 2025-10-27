<script>
  const steps = [
    {
      id: 1,
      title: 'Создайте учетную запись',
      description: 'Вы уже сделали это! Осталось завершить первичную настройку.',
      completed: true
    },
    {
      id: 2,
      title: 'Добавьте ваш первый SKU',
      description: 'Храните всю информацию о продукте в одном месте.',
      completed: true
    },
    {
      id: 3,
      title: 'Загрузите Android- или iOS-приложение',
      description: 'Подготовьте ваши товары к загрузке в систему.',
      completed: true
    },
    {
      id: 4,
      title: 'Распечатайте или запросите OKTO ID-коды',
      description: 'Чтобы сразу начать пользоваться системой, пожалуйста, воспользуйтесь своим принтером для печати тестовых кодов. Скоро мы предоставим возможность делать это удаленно.',
      completed: true
    },
    {
      id: 5,
      title: 'Добавьте ваш первый товар',
      description: 'Сделайте страницу вашего продукта доступной в реальном времени!',
      completed: true
    }
  ];
</script>

<div class="onboarding-container">
  <div class="onboarding-content">
    <h1>Добро пожаловать в OKTO!</h1>
    <p class="subtitle">Выполните следующие шаги чтобы начать добавлять Digital Product Identities.</p>

    <div class="steps-container">
      {#each steps as step}
        <div class="step-item">
          <div class="step-status">
            {#if step.completed}
              <div class="check-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            {/if}
          </div>
          <div class="step-content">
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .onboarding-container {
    min-height: 100vh;
    background-color: #FFFFFF;
    display: flex;
    justify-content: center;
    padding: 48px 24px;
  }

  .onboarding-content {
    max-width: 800px;
    width: 100%;
  }

  h1 {
    font-size: 30px;
    font-weight: 600;
    color: #101828;
    margin: 0 0 12px 0;
  }

  .subtitle {
    font-size: 16px;
    color: #475467;
    margin: 0 0 48px 0;
  }

  .steps-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .step-item {
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }

  .step-status {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    margin-top: 2px;
  }

  .check-icon {
    width: 24px;
    height: 24px;
    background: #6366F1;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .step-content {
    flex-grow: 1;
  }

  .step-content h3 {
    font-size: 16px;
    font-weight: 500;
    color: #101828;
    margin: 0 0 4px 0;
  }

  .step-content p {
    font-size: 14px;
    color: #475467;
    margin: 0;
    line-height: 1.5;
  }

  @media (max-width: 768px) {
    .onboarding-container {
      padding: 2rem 1rem;
    }

    h1 {
      font-size: 1.75rem;
    }

    .subtitle {
      font-size: 1rem;
      margin-bottom: 2rem;
    }

    .steps-container {
      gap: 1.25rem;
    }

    .step-item {
      gap: 1rem;
    }

    .step-content h3 {
      font-size: 1rem;
    }

    .step-content p {
      font-size: 0.875rem;
    }
  }

  @media (max-width: 480px) {
    .onboarding-container {
      padding: 1.5rem 0.75rem;
    }

    h1 {
      font-size: 1.5rem;
    }

    .subtitle {
      margin-bottom: 1.5rem;
    }

    .steps-container {
      gap: 1rem;
    }

    .step-content h3 {
      font-size: 0.9rem;
    }

    .step-content p {
      font-size: 0.8rem;
    }
  }
</style>
