<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { page } from "$app/stores";
  import { tokenPayload, isAuthenticated } from "$lib/stores/token.js";
  import { checkAuthAndRedirect } from "$lib/utils/auth-guard.js";
  import { DatePicker } from '@svelte-plugins/datepicker';
  import { format } from 'date-fns';

  // Проверяем авторизацию при монтировании
  onMount(() => {
    // Небольшая задержка, чтобы дать stores инициализироваться
    setTimeout(() => {
      checkAuthAndRedirect($page.url.pathname);
    }, 100);

    // Функция для проверки размера экрана
    const checkScreenSize = () => {
      isMobile = window.innerWidth <= 768;
    };

    // Проверяем размер экрана при загрузке
    checkScreenSize();

    // Слушаем изменения размера экрана
    window.addEventListener('resize', checkScreenSize);

    // Таймер для обновления времени до дедлайна каждую минуту
    const interval = setInterval(() => {
      // Обновляем текущее время для пересчета дедлайнов
      currentTime = Date.now();
    }, 60000); // Обновляем каждые 60 секунд

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', checkScreenSize);
    };
  });



  // Настройки ВетИС получаем из настроек компании
  let vetisSettings = {
    criticalPercentage: 5, // Критичный процент расхождения с ВетИС
    delayedDryDays: 15, // Отложенные отчеты DRY
    delayedWetDays: 15, // Отложенные отчеты WET  
    forcedDryDays: 15, // Принудительная отправка отчетов DRY
    forcedWetDays: 15, // Принудительная отправка отчетов WET
  };

  // Функция для загрузки настроек ВетИС из настроек компании
  async function loadVetisSettings() {
    try {
      // TODO: Заменить на реальный API вызов к настройкам компании
      // const response = await fetch('/api/v1/company/settings');
      // const settings = await response.json();
      
      // Пока загружаем из localStorage или используем значения по умолчанию
      const savedSettings = localStorage.getItem('vetisSettings');
      if (savedSettings) {
        vetisSettings = { ...vetisSettings, ...JSON.parse(savedSettings) };
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек ВетИС:', error);
    }
  }

  // Загружаем настройки при монтировании компонента
  onMount(() => {
    loadVetisSettings();
  });

  var aryIanaTimeZones = [
    { value: "Europe/Andorra", label: "Андорра" },
    { value: "Asia/Dubai", label: "Дубай" },
    { value: "Asia/Kabul", label: "Кабул" },
    { value: "Europe/Tirane", label: "Тирана" },
    { value: "Asia/Yerevan", label: "Ереван" },
    { value: "Antarctica/Casey", label: "Кейси" },
    { value: "Antarctica/Davis", label: "Дэвис" },
    { value: "Antarctica/DumontDUrville", label: "Дюмон-дю-Виль" }, // https://bugs.chromium.org/p/chromium/issues/detail?id=928068
    { value: "Antarctica/Mawson", label: "Моусон" },
    { value: "Antarctica/Palmer", label: "Палмер" },
    { value: "Antarctica/Rothera", label: "Ротера" },
    { value: "Antarctica/Syowa", label: "Сёва" },
    { value: "Antarctica/Troll", label: "Тролль" },
    { value: "Antarctica/Vostok", label: "Восток" },
    { value: "America/Argentina/Buenos_Aires", label: "Буэнос-Айрес" },
    { value: "America/Argentina/Cordoba", label: "Кордоба" },
    { value: "America/Argentina/Salta", label: "Сальта" },
    { value: "America/Argentina/Jujuy", label: "Хухуй" },
    { value: "America/Argentina/Tucuman", label: "Тукуман" },
    { value: "America/Argentina/Catamarca", label: "Катамарка" },
    { value: "America/Argentina/La_Rioja", label: "Ла-Риоха" },
    { value: "America/Argentina/San_Juan", label: "Сан-Хуан" },
    { value: "America/Argentina/Mendoza", label: "Мендоса" },
    { value: "America/Argentina/San_Luis", label: "Сан-Луис" },
    { value: "America/Argentina/Rio_Gallegos", label: "Рио-Галегос" },
    { value: "America/Argentina/Ushuaia", label: "Ушуайя" },
    { value: "Pacific/Pago_Pago", label: "Пагопаго" },
    { value: "Europe/Vienna", label: "Вена" },
    { value: "Australia/Lord_Howe", label: "Лорд-Хау" },
    { value: "Antarctica/Macquarie", label: "Маккуори" },
    { value: "Australia/Hobart", label: "Хобарт" },
    { value: "Australia/Currie", label: "Курри" },
    { value: "Australia/Melbourne", label: "Мельбурн" },
    { value: "Australia/Sydney", label: "Сидней" },
    { value: "Australia/Broken_Hill", label: "Брокен-Хилл" },
    { value: "Australia/Brisbane", label: "Брисбен" },
    { value: "Australia/Lindeman", label: "Линдеман" },
    { value: "Australia/Adelaide", label: "Аделаида" },
    { value: "Australia/Darwin", label: "Дарвин" },
    { value: "Australia/Perth", label: "Перт" },
    { value: "Australia/Eucla", label: "Евкла" },
    { value: "Asia/Baku", label: "Баку" },
    { value: "America/Barbados", label: "Барбадос" },
    { value: "Asia/Dhaka", label: "Дакка" },
    { value: "Europe/Brussels", label: "Брюссель" },
    { value: "Europe/Sofia", label: "София" },
    { value: "Atlantic/Bermuda", label: "Бермуды" },
    { value: "Asia/Brunei", label: "Бруней" },
    { value: "America/La_Paz", label: "Ла-Пас" },
    { value: "America/Noronha", label: "Норона" },
    { value: "America/Belem", label: "Белем" },
    { value: "America/Fortaleza", label: "Форталеза" },
    { value: "America/Recife", label: "Ресифи" },
    { value: "America/Araguaina", label: "Арагвайна" },
    { value: "America/Maceio", label: "Масейо" },
    { value: "America/Bahia", label: "Баия" },
    { value: "America/Sao_Paulo", label: "Сан-Паулу" },
    { value: "America/Campo_Grande", label: "Кампу-Гранде" },
    { value: "America/Cuiaba", label: "Куяба" },
    { value: "America/Santarem", label: "Сантарен" },
    { value: "America/Porto_Velho", label: "Порту-Велью" },
    { value: "America/Boa_Vista", label: "Боа-Виста" },
    { value: "America/Manaus", label: "Манаус" },
    { value: "America/Eirunepe", label: "Эйрунепе" },
    { value: "America/Rio_Branco", label: "Рио-Бранко" },
    { value: "America/Nassau", label: "Нассау" },
    { value: "Asia/Thimphu", label: "Тхимпху" },
    { value: "Europe/Minsk", label: "Минск" },
    { value: "America/Belize", label: "Белиз" },
    { value: "America/St_Johns", label: "Сент-Джонс" },
    { value: "America/Halifax", label: "Галифакс" },
    { value: "America/Glace_Bay", label: "Глейс-Бей" },
    { value: "America/Moncton", label: "Монктон" },
    { value: "America/Goose_Bay", label: "Гус-Бей" },
    { value: "America/Blanc-Sablon", label: "Бланк-Саблон" },
    { value: "America/Toronto", label: "Торонто" },
    { value: "America/Nipigon", label: "Нипигон" },
    { value: "America/Thunder_Bay", label: "Тандер-Бей" },
    { value: "America/Iqaluit", label: "Икалуит" },
    { value: "America/Pangnirtung", label: "Пангниртунг" },
    { value: "America/Atikokan", label: "Атикокан" },
    { value: "America/Winnipeg", label: "Виннипег" },
    { value: "America/Rainy_River", label: "Рейни-Ривер" },
    { value: "America/Resolute", label: "Резолют" },
    { value: "America/Rankin_Inlet", label: "Ранкин-Инлет" },
    { value: "America/Regina", label: "Регина" },
    { value: "America/Swift_Current", label: "Свифт-Керрент" },
    { value: "America/Edmonton", label: "Эдмонтон" },
    { value: "America/Cambridge_Bay", label: "Кембридж-Бей" },
    { value: "America/Yellowknife", label: "Йеллоунайф" },
    { value: "America/Inuvik", label: "Инуvik" },
    { value: "America/Creston", label: "Крестон" },
    { value: "America/Dawson_Creek", label: "Досон-Крик" },
    { value: "America/Fort_Nelson", label: "Форт-Нелсон" },
    { value: "America/Vancouver", label: "Ванкувер" },
    { value: "America/Whitehorse", label: "Уайтхорс" },
    { value: "America/Dawson", label: "Досон" },
    { value: "Indian/Cocos", label: "Кокосовые острова" },
    { value: "Europe/Zurich", label: "Цюрих" },
    { value: "Africa/Abidjan", label: "Абиджан" },
    { value: "Pacific/Rarotonga", label: "Раротонга" },
    { value: "America/Santiago", label: "Сантьяго" },
    { value: "America/Punta_Arenas", label: "Пунта-Аренас" },
    { value: "Pacific/Easter", label: "Остров Пасхи" },
    { value: "Asia/Shanghai", label: "Шанхай" },
    { value: "Asia/Urumqi", label: "Урумчи" },
    { value: "America/Bogota", label: "Богота" },
    { value: "America/Costa_Rica", label: "Коста-Рика" },
    { value: "America/Havana", label: "Гавана" },
    { value: "Atlantic/Cape_Verde", label: "Кабо-Верде" },
    { value: "America/Curacao", label: "Кюрасао" },
    { value: "Indian/Christmas", label: "Остров Рождества" },
    { value: "Asia/Nicosia", label: "Никосия" },
    { value: "Asia/Famagusta", label: "Фамагуста" },
    { value: "Europe/Prague", label: "Прага" },
    { value: "Europe/Berlin", label: "Берлин" },
    { value: "Europe/Copenhagen", label: "Копенгаген" },
    { value: "America/Santo_Domingo", label: "Санто-Доминго" },
    { value: "Africa/Algiers", label: "Алжир" },
    { value: "America/Guayaquil", label: "Гуаякиль" },
    { value: "Pacific/Galapagos", label: "Галапагосские острова" },
    { value: "Europe/Tallinn", label: "Таллин" },
    { value: "Africa/Cairo", label: "Каир" },
    { value: "Africa/El_Aaiun", label: "Эль-Аюн" },
    { value: "Europe/Madrid", label: "Мадрид" },
    { value: "Africa/Ceuta", label: "Сеута" },
    { value: "Atlantic/Canary", label: "Канарские острова" },
    { value: "Europe/Helsinki", label: "Хельсинки" },
    { value: "Pacific/Fiji", label: "Фиджи" },
    { value: "Atlantic/Stanley", label: "Стэнли" },
    { value: "Pacific/Chuuk", label: "Чуук" },
    { value: "Pacific/Pohnpei", label: "Понпеи" },
    { value: "Pacific/Kosrae", label: "Косраэ" },
    { value: "Atlantic/Faroe", label: "Фарерские острова" },
    { value: "Europe/Paris", label: "Париж" },
    { value: "Europe/London", label: "Лондон" },
    { value: "Asia/Tbilisi", label: "Тбилиси" },
    { value: "America/Cayenne", label: "Кайенна" },
    { value: "Africa/Accra", label: "Аккра" },
    { value: "Europe/Gibraltar", label: "Гибралтар" },
    { value: "America/Godthab", label: "Готхоб" },
    { value: "America/Danmarkshavn", label: "Данмарксхавн" },
    { value: "America/Scoresbysund", label: "Скоресбисунн" },
    { value: "America/Thule", label: "Туле" },
    { value: "Europe/Athens", label: "Афины" },
    { value: "Atlantic/South_Georgia", label: "Южная Георгия" },
    { value: "America/Guatemala", label: "Гватемала" },
    { value: "Pacific/Guam", label: "Гуам" },
    { value: "Africa/Bissau", label: "Бисау" },
    { value: "America/Guyana", label: "Гайана" },
    { value: "Asia/Hong_Kong", label: "Гонконг" },
    { value: "America/Tegucigalpa", label: "Тегусигальпа" },
    { value: "America/Port-au-Prince", label: "Порт-о-Пренс" },
    { value: "Europe/Budapest", label: "Будапешт" },
    { value: "Asia/Jakarta", label: "Джакарта" },
    { value: "Asia/Pontianak", label: "Понтианак" },
    { value: "Asia/Makassar", label: "Макассар" },
    { value: "Asia/Jayapura", label: "Джаяпура" },
    { value: "Europe/Dublin", label: "Дублин" },
    { value: "Asia/Jerusalem", label: "Иерусалим" },
    { value: "Asia/Kolkata", label: "Калькутта" },
    { value: "Indian/Chagos", label: "Чагос" },
    { value: "Asia/Baghdad", label: "Багдад" },
    { value: "Asia/Tehran", label: "Тегеран" },
    { value: "Atlantic/Reykjavik", label: "Рейкьявик" },
    { value: "Europe/Rome", label: "Рим" },
    { value: "America/Jamaica", label: "Ямайка" },
    { value: "Asia/Amman", label: "Амман" },
    { value: "Asia/Tokyo", label: "Токио" },
    { value: "Africa/Nairobi", label: "Найроби" },
    { value: "Asia/Bishkek", label: "Бишкек" },
    { value: "Pacific/Tarawa", label: "Тарава" },
    { value: "Pacific/Enderbury", label: "Эндербери" },
    { value: "Pacific/Kiritimati", label: "Киритимати" },
    { value: "Asia/Pyongyang", label: "Пхеньян" },
    { value: "Asia/Seoul", label: "Сеул" },
    { value: "Asia/Almaty", label: "Алматы" },
    { value: "Asia/Qyzylorda", label: "Кызылорда" },
    { value: "Asia/Qostanay", label: "Костанай" },
    { value: "Asia/Aqtobe", label: "Актобе" },
    { value: "Asia/Aqtau", label: "Актау" },
    { value: "Asia/Atyrau", label: "Атырау" },
    { value: "Asia/Oral", label: "Орал" },
    { value: "Asia/Beirut", label: "Бейрут" },
    { value: "Asia/Colombo", label: "Коломбо" },
    { value: "Africa/Monrovia", label: "Монровия" },
    { value: "America/Santo_Domingo", label: "Санто-Доминго" },
    { value: "Africa/Algiers", label: "Алжир" },
    { value: "America/Guayaquil", label: "Гуаякиль" },
    { value: "Pacific/Galapagos", label: "Галапагос" },
    { value: "Europe/Tallinn", label: "Таллин" },
    { value: "Africa/Cairo", label: "Каир" },
    { value: "Africa/El_Aaiun", label: "Эль-Аайун" },
    { value: "Europe/Madrid", label: "Мадрид" },
    { value: "Africa/Ceuta", label: "Сеута" },
    { value: "Atlantic/Canary", label: "Канарские острова" },
    { value: "Europe/Helsinki", label: "Хельсинки" },
    { value: "Pacific/Fiji", label: "Фиджи" },
    { value: "Atlantic/Stanley", label: "Стэнли" },
    { value: "Pacific/Chuuk", label: "Чуук" },
    { value: "Pacific/Pohnpei", label: "Понпеи" },
    { value: "Pacific/Kosrae", label: "Косраэ" },
    { value: "Atlantic/Faroe", label: "Фарерские острова" },
    { value: "Europe/Paris", label: "Париж" },
    { value: "Europe/London", label: "Лондон" },
    { value: "Asia/Tbilisi", label: "Тбилиси" },
    { value: "America/Cayenne", label: "Кайенна" },
    { value: "Africa/Accra", label: "Аккра" },
    { value: "Europe/Gibraltar", label: "Гибралтар" },
    { value: "America/Godthab", label: "Годтхаб" },
    { value: "America/Danmarkshavn", label: "Данмарксхавн" },
    { value: "America/Scoresbysund", label: "Скорсбисун" },
    { value: "America/Thule", label: "Туле" },
    { value: "Europe/Athens", label: "Афины" },
    { value: "Atlantic/South_Georgia", label: "Южная Георгия" },
    { value: "America/Guatemala", label: "Гватемала" },
    { value: "Pacific/Guam", label: "Гуам" },
    { value: "Africa/Bissau", label: "Бисау" },
    { value: "America/Guyana", label: "Гайана" },
    { value: "Asia/Hong_Kong", label: "Гонконг" },
    { value: "America/Tegucigalpa", label: "Тегусигальпа" },
    { value: "America/Port-au-Prince", label: "Порт-о-Пренс" },
    { value: "Europe/Budapest", label: "Будапешт" },
    { value: "Asia/Jakarta", label: "Джакарта" },
    { value: "Asia/Pontianak", label: "Понтианак" },
    { value: "Asia/Makassar", label: "Макассар" },
    { value: "Asia/Jayapura", label: "Джаяпура" },
    { value: "Europe/Dublin", label: "Дублин" },
    { value: "Asia/Jerusalem", label: "Иерусалим" },
    { value: "Asia/Kolkata", label: "Калькутта" },
    { value: "Indian/Chagos", label: "Чагос" },
    { value: "Asia/Baghdad", label: "Багдад" },
    { value: "Asia/Tehran", label: "Тегеран" },
    { value: "Atlantic/Reykjavik", label: "Рейкьявик" },
    { value: "Europe/Rome", label: "Рим" },
    { value: "America/Jamaica", label: "Ямайка" },
    { value: "Asia/Amman", label: "Амман" },
    { value: "Asia/Tokyo", label: "Токио" },
    { value: "Africa/Nairobi", label: "Найроби" },
    { value: "Asia/Bishkek", label: "Бишкек" },
    { value: "Pacific/Tarawa", label: "Тарава" },
    { value: "Pacific/Enderbury", label: "Эндербери" },
    { value: "Pacific/Kiritimati", label: "Киритимати" },
    { value: "Asia/Pyongyang", label: "Пхеньян" },
    { value: "Asia/Seoul", label: "Сеул" },
    { value: "Asia/Almaty", label: "Алматы" },
    { value: "Asia/Qyzylorda", label: "Кызылорда" },
    { value: "Asia/Qostanay", label: "Костанай" },
    { value: "Asia/Aqtobe", label: "Актобе" },
    { value: "Asia/Aqtau", label: "Актау" },
    { value: "Asia/Atyrau", label: "Атырау" },
    { value: "Asia/Oral", label: "Орал" },
    { value: "Asia/Beirut", label: "Бейрут" },
    { value: "Asia/Colombo", label: "Коломбо" },
    { value: "Africa/Monrovia", label: "Монровия" },
    { value: "Europe/Vilnius", label: "Вильнюс" },
    { value: "Europe/Luxembourg", label: "Люксембург" },
    { value: "Europe/Riga", label: "Рига" },
    { value: "Africa/Tripoli", label: "Триполи" },
    { value: "Africa/Casablanca", label: "Касабланка" },
    { value: "Europe/Monaco", label: "Монако" },
    { value: "Europe/Chisinau", label: "Кишинев" },
    { value: "Pacific/Majuro", label: "Маджуро" },
    { value: "Pacific/Kwajalein", label: "Кваджалейн" },
    { value: "Asia/Yangon", label: "Янгон" },
    { value: "Asia/Ulaanbaatar", label: "Улан-Батор" },
    { value: "Asia/Hovd", label: "Ховд" },
    { value: "Asia/Choibalsan", label: "Чойбалсан" },
    { value: "Asia/Macau", label: "Макао" },
    { value: "America/Martinique", label: "Мартиника" },
    { value: "Europe/Malta", label: "Мальта" },
    { value: "Indian/Mauritius", label: "Маврикий" },
    { value: "Indian/Maldives", label: "Мальдивы" },
    { value: "America/Mexico_City", label: "Мехико" },
    { value: "America/Cancun", label: "Канкун" },
    { value: "America/Merida", label: "Мерида" },
    { value: "America/Monterrey", label: "Монтеррей" },
    { value: "America/Matamoros", label: "Матаморос" },
    { value: "America/Mazatlan", label: "Мазатлан" },
    { value: "America/Chihuahua", label: "Чиуауа" },
    { value: "America/Ojinaga", label: "Охинага" },
    { value: "America/Hermosillo", label: "Эрмосильо" },
    { value: "America/Tijuana", label: "Тихуана" },
    { value: "America/Bahia_Banderas", label: "Бахия-Бандерас" },
    { value: "Asia/Kuala_Lumpur", label: "Куала-Лумпур" },
    { value: "Asia/Kuching", label: "Кучинг" },
    { value: "Africa/Maputo", label: "Мапут" },
    { value: "Africa/Windhoek", label: "Виндхук" },
    { value: "Pacific/Noumea", label: "Нумеа" },
    { value: "Pacific/Norfolk", label: "Норфолк" },
    { value: "Africa/Lagos", label: "Лагос" },
    { value: "America/Managua", label: "Манагуа" },
    { value: "Europe/Amsterdam", label: "Амстердам" },
    { value: "Europe/Oslo", label: "Осло" },
    { value: "Asia/Kathmandu", label: "Катманду" },
    { value: "Pacific/Nauru", label: "Науру" },
    { value: "Pacific/Niue", label: "Ниуэ" },
    { value: "Pacific/Auckland", label: "Окленд" },
    { value: "Pacific/Chatham", label: "Чатем" },
    { value: "America/Panama", label: "Панама" },
    { value: "America/Lima", label: "Лима" },
    { value: "Pacific/Tahiti", label: "Таити" },
    { value: "Pacific/Marquesas", label: "Маркизские острова" },
    { value: "Pacific/Gambier", label: "Гамбиер" },
    { value: "Pacific/Port_Moresby", label: "Порт-Морсби" },
    { value: "Pacific/Bougainville", label: "Бука" },
    { value: "Asia/Manila", label: "Манила" },
    { value: "Asia/Karachi", label: "Карачи" },
    { value: "Europe/Warsaw", label: "Варшава" },
    { value: "America/Miquelon", label: "Микелон" },
    { value: "Pacific/Pitcairn", label: "Питкерн" },
    { value: "America/Puerto_Rico", label: "Пуэрто-Рико" },
    { value: "Asia/Gaza", label: "Газа" },
    { value: "Asia/Hebron", label: "Хеврон" },
    { value: "Europe/Lisbon", label: "Лиссабон" },
    { value: "Atlantic/Madeira", label: "Мадейра" },
    { value: "Atlantic/Azores", label: "Азорские острова" },
    { value: "Pacific/Palau", label: "Палау" },
    { value: "America/Asuncion", label: "Асунсьон" },
    { value: "Asia/Qatar", label: "Катар" },
    { value: "Indian/Reunion", label: "Реюньон" },
    { value: "Europe/Bucharest", label: "Бухарест" },
    { value: "Europe/Belgrade", label: "Белград" },
    { value: "Europe/Kaliningrad", label: "Калининград" },
    { value: "Europe/Moscow", label: "Москва" },
    { value: "Europe/Simferopol", label: "Симферополь" },
    { value: "Europe/Kirov", label: "Киров" },
    { value: "Europe/Astrakhan", label: "Астрахань" },
    { value: "Europe/Volgograd", label: "Волгоград" },
    { value: "Europe/Saratov", label: "Саратов" },
    { value: "Europe/Ulyanovsk", label: "Ульяновск" },
    { value: "Europe/Samara", label: "Самара" },
    { value: "Asia/Yekaterinburg", label: "Екатеринбург" },
    { value: "Asia/Omsk", label: "Омск" },
    { value: "Asia/Novosibirsk", label: "Новосибирск" },
    { value: "Asia/Barnaul", label: "Барнаул" },
    { value: "Asia/Tomsk", label: "Томск" },
    { value: "Asia/Novokuznetsk", label: "Новокузнецк" },
    { value: "Asia/Krasnoyarsk", label: "Красноярск" },
    { value: "Asia/Irkutsk", label: "Иркутск" },
    { value: "Asia/Chita", label: "Чита" },
    { value: "Asia/Yakutsk", label: "Якутск" },
    { value: "Asia/Khandyga", label: "Хандыга" },
    { value: "Asia/Vladivostok", label: "Владивосток" },
    { value: "Asia/Ust-Nera", label: "Усть-Нера" },
    { value: "Asia/Magadan", label: "Магадан" },
    { value: "Asia/Sakhalin", label: "Сахалин" },
    { value: "Asia/Srednekolymsk", label: "Среднеколымск" },
    { value: "Asia/Kamchatka", label: "Камчатка" },
    { value: "Asia/Anadyr", label: "Анадырь" },
    { value: "Asia/Riyadh", label: "Эр-Рияд" },
    { value: "Pacific/Guadalcanal", label: "Гуадалканал" },
    { value: "Indian/Mahe", label: "Махе" },
    { value: "Africa/Khartoum", label: "Хартум" },
    { value: "Europe/Stockholm", label: "Стокгольм" },
    { value: "Asia/Singapore", label: "Сингапур" },
    { value: "America/Paramaribo", label: "Парамарибо" },
    { value: "Africa/Juba", label: "Джуба" },
    { value: "Africa/Sao_Tome", label: "Сан-Томе" },
    { value: "America/El_Salvador", label: "Эль-Сальвадор" },
    { value: "Asia/Damascus", label: "Дамаск" },
    { value: "America/Grand_Turk", label: "Гранд-Терк" },
    { value: "Africa/Ndjamena", label: "Нджамена" },
    { value: "Indian/Kerguelen", label: "Кергелен" },
    { value: "Asia/Bangkok", label: "Бангкок" },
    { value: "Asia/Dushanbe", label: "Душанбе" },
    { value: "Pacific/Fakaofo", label: "Факаофо" },
    { value: "Asia/Dili", label: "Дили" },
    { value: "Asia/Ashgabat", label: "Ашхабад" },
    { value: "Africa/Tunis", label: "Тунис" },
    { value: "Pacific/Tongatapu", label: "Тонгатапу" },
    { value: "Europe/Istanbul", label: "Стамбул" },
    { value: "America/Port_of_Spain", label: "Порт-оф-Спейн" },
    { value: "Pacific/Funafuti", label: "Фунафути" },
    { value: "Asia/Taipei", label: "Тайбэй" },
    { value: "Europe/Kiev", label: "Киев" },
    { value: "Europe/Uzhgorod", label: "Ужгород" },
    { value: "Europe/Zaporozhye", label: "Запорожье" },
    { value: "Pacific/Wake", label: "Уэйк" },
    { value: "America/New_York", label: "Нью-Йорк" },
    { value: "America/Detroit", label: "Детройт" },
    { value: "America/Kentucky/Louisville", label: "Луисвилл" },
    { value: "America/Kentucky/Monticello", label: "Монтсельо" },
    { value: "America/Indiana/Indianapolis", label: "Индианаполис" },
    { value: "America/Indiana/Vincennes", label: "Винсеннес" },
    { value: "America/Indiana/Winamac", label: "Винамак" },
    { value: "America/Indiana/Marengo", label: "Маренго" },
    { value: "America/Indiana/Petersburg", label: "Петерсбург" },
    { value: "America/Indiana/Vevay", label: "Вевей" },
    { value: "America/Chicago", label: "Чикаго" },
    { value: "America/Indiana/Tell_City", label: "Телл-Сити" },
    { value: "America/Indiana/Knox", label: "Кнокса" },
    { value: "America/Menominee", label: "Меномини" },
    { value: "America/North_Dakota/Center", label: "Центр" },
    { value: "America/North_Dakota/New_Salem", label: "Нью-Салем" },
    { value: "America/North_Dakota/Beulah", label: "Бьюла" },
    { value: "America/Denver", label: "Денвер" },
    { value: "America/Boise", label: "Бойсе" },
    { value: "America/Phoenix", label: "Финикс" },
    { value: "America/Los_Angeles", label: "Лос-Анджелес" },
    { value: "America/Anchorage", label: "Анкоридж" },
    { value: "America/Juneau", label: "Джунейо" },
    { value: "America/Sitka", label: "Ситка" },
    { value: "America/Metlakatla", label: "Метлакатла" },
    { value: "America/Yakutat", label: "Якутат" },
    { value: "America/Nome", label: "Ном" },
    { value: "America/Adak", label: "Адак" },
    { value: "Pacific/Honolulu", label: "Гонолулу" },
    { value: "America/Montevideo", label: "Монтевидео" },
    { value: "Asia/Samarkand", label: "Самарканд" },
    { value: "Asia/Tashkent", label: "Ташкент" },
    { value: "America/Caracas", label: "Каракас" },
    { value: "Asia/Ho_Chi_Minh", label: "Хошимин" },
    { value: "Pacific/Efate", label: "Эфате" },
    { value: "Pacific/Wallis", label: "Уоллис" },
    { value: "Pacific/Apia", label: "Апиa" },
    { value: "Africa/Johannesburg", label: "Йоханнесбург" },
  ];



  // Данные для таблицы партий
  let batches = [
    {
      party: "542A1LUZ74",
      product: "1110101",
      productionDate: "2025-10-14",
      expiryDate: "2027-10-13",
      produced: 100000,
      vetis: 120000,
      difference: 20000,
      status: "Произведено",
      deadline: "2025-10-28T15:30:00Z", // Дедлайн отправки
    },
    {
      party: "541A1LUZ33",
      product: "1110109",
      productionDate: "2025-10-13",
      expiryDate: "2027-10-13",
      produced: 110000,
      vetis: 110000,
      difference: 0,
      status: "Отправлена (20 из 20)",
      deadline: "2025-10-26T12:00:00Z", // Уже отправлена
    },
    {
      party: "542A1LUZ33",
      product: "1110109",
      productionDate: "2025-10-13",
      expiryDate: "2027-10-13",
      produced: 50000,
      vetis: 110000,
      difference: -60000,
      status: "На холде",
      deadline: "2025-10-29T09:45:00Z", // Критический дедлайн
    },
    {
      party: "541A1LUZ33",
      product: "2110109",
      productionDate: "2025-10-13",
      expiryDate: "2027-10-13",
      produced: 110000,
      vetis: 110000,
      difference: 0,
      status: "Отправляется (10 из 20)",
      deadline: "2025-10-27T18:20:00Z", // В процессе отправки
    },
    {
      party: "541A1LUZ33",
      product: "2110110",
      productionDate: "2025-10-13",
      expiryDate: "2027-10-13",
      produced: 100000,
      vetis: 110000,
      difference: 0,
      status: "Отправляется (15 из 20)",
      deadline: "2025-10-22T18:20:00Z", // В процессе отправки
    },
  ];

  let currentPage = 1;
  let totalPages = 100;
  let showConfirmModal = false;
  let selectedBatch: any = null; // Выбранная партия для отображения в процессе

  // Фильтры для поиска
  let filters = {
    party: "",
    product: "",
    status: "",
    dateFrom: "",
    dateTo: "",
  };

  let startDate: any = null;
  let endDate: any = null;
  let dateFormat = 'yyyy-MM-dd';
  let isDatePickerOpen = false;

  // Мобильные даты в формате YYYY-MM-DD для HTML5 inputs
  let mobileDateFrom = "";
  let mobileDateTo = "";

  // Сортировка
  let sortField = "";
  let sortOrder: "asc" | "desc" = "asc";

  // Таймзона
  let selectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone; // По умолчанию таймзона браузера

  let deadlineTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone; // Инициализируем с той же таймзоной

  let currentTime = Date.now();

  // Переменная для отслеживания мобильного режима
  let isMobile = false;
  let showMobileFilters = false;

  $: if (selectedTimezone) {
    deadlineTimezone = selectedTimezone;
    currentTime = Date.now();
  }


  let activeSearch = "";

  function formatDateInTimezone(date: string) {
    if (!date) return "";
    try {
      const dateObj = new Date(date);
      return new Intl.DateTimeFormat("ru-RU", {
        timeZone: selectedTimezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(dateObj);
    } catch (error) {
      return date; // Fallback to original date if formatting fails
    }
  }

  // Функции для работы с дедлайном
  function formatDeadlineInTimezone(deadline: string, timezone: string) {
    if (!deadline) return "";
    try {
      const deadlineObj = new Date(deadline);
      return new Intl.DateTimeFormat("ru-RU", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(deadlineObj);
    } catch (error) {
      return deadline;
    }
  }

  function getTimeUntilDeadline(deadline: string, status: string = "") {
    if (!deadline) return "";

    try {
      // Используем currentTime для реактивности
      const now = new Date(currentTime);
      const deadlineObj = new Date(deadline);

      // Получаем время сейчас и дедлайн в выбранном часовом поясе как строки
      const nowFormatter = new Intl.DateTimeFormat("sv-SE", {
        timeZone: selectedTimezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

      const deadlineFormatter = new Intl.DateTimeFormat("sv-SE", {
        timeZone: selectedTimezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

      // Получаем локальные представления времени в выбранном часовом поясе
      const nowInTimezone = new Date(nowFormatter.format(now));
      const deadlineInTimezone = new Date(
        deadlineFormatter.format(deadlineObj),
      );

      const diffMs = deadlineInTimezone.getTime() - nowInTimezone.getTime();

      if (diffMs <= 0) {
        // Если партия уже отправлена, не показываем "Просрочено"
        if (status && status.includes("Отправлена")) {
          return "Отправлена";
        }
        return "Просрочено";
      }

      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        return `${days}д ${hours}ч`;
      } else if (hours > 0) {
        return `${hours}ч ${minutes}м`;
      } else {
        return `${minutes}м`;
      }
    } catch (error) {
      return "Ошибка";
    }
  }

  function getDeadlineStatus(deadline: string, status: string = "") {
    if (!deadline) return "normal";

    try {
      // Используем currentTime для реактивности
      const now = new Date(currentTime);
      const deadlineObj = new Date(deadline);

      // Получаем время сейчас и дедлайн в выбранном часовом поясе как строки
      const nowFormatter = new Intl.DateTimeFormat("sv-SE", {
        timeZone: selectedTimezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

      const deadlineFormatter = new Intl.DateTimeFormat("sv-SE", {
        timeZone: selectedTimezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

      // Получаем локальные представления времени в выбранном часовом поясе
      const nowInTimezone = new Date(nowFormatter.format(now));
      const deadlineInTimezone = new Date(
        deadlineFormatter.format(deadlineObj),
      );

      const diffMs = deadlineInTimezone.getTime() - nowInTimezone.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffMs <= 0) {
        // Если партия уже отправлена, возвращаем normal статус
        if (status && status.includes("Отправлена")) {
          return "normal";
        }
        return "overdue"; // Просрочено
      } else if (diffHours <= 2) {
        return "critical"; // Критично (менее 2 часов)
      } else if (diffHours <= 24) {
        return "warning"; // Предупреждение (менее суток)
      } else {
        return "normal"; // Нормально
      }
    } catch (error) {
      return "normal";
    }
  }

  // Функции для DatePicker
  const onClearDates = () => {
    startDate = null;
    endDate = null;
    filters.dateFrom = "";
    filters.dateTo = "";
  };

  const toggleDatePicker = () => (isDatePickerOpen = !isDatePickerOpen);

  const formatDate = (dateString: string | null) => {
    if (!dateString || isNaN(new Date(dateString).getTime())) {
      return '';
    }
    return format(new Date(dateString), dateFormat);
  };

  // Flag to prevent cyclical updates
  let updatingFromMobile = false;
  let updatingFromDatePicker = false;

  // Separate reactive blocks to prevent cycles
  $: {
    if (startDate && !updatingFromMobile) {
      updatingFromDatePicker = true;
      filters.dateFrom = formatDate(startDate);
      const newMobileDateFrom = formatDateForInput(startDate);
      if (mobileDateFrom !== newMobileDateFrom) {
        mobileDateFrom = newMobileDateFrom;
      }
      updatingFromDatePicker = false;
    }
  }

  $: {
    if (endDate && !updatingFromMobile) {
      updatingFromDatePicker = true;
      filters.dateTo = formatDate(endDate);
      const newMobileDateTo = formatDateForInput(endDate);
      if (mobileDateTo !== newMobileDateTo) {
        mobileDateTo = newMobileDateTo;
      }
      updatingFromDatePicker = false;
    }
  }

  // Use functions to handle mobile date changes instead of reactive statements
  function handleMobileDateFromChange() {
    if (mobileDateFrom && isMobile && !updatingFromDatePicker) {
      const date = new Date(mobileDateFrom);
      if (!isNaN(date.getTime())) {
        updatingFromMobile = true;
        startDate = date;
        updatingFromMobile = false;
      }
    }
  }

  function handleMobileDateToChange() {
    if (mobileDateTo && isMobile && !updatingFromDatePicker) {
      const date = new Date(mobileDateTo);
      if (!isNaN(date.getTime())) {
        updatingFromMobile = true;
        endDate = date;
        updatingFromMobile = false;
      }
    }
  }

  $: formattedStartDate = formatDate(startDate);
  $: formattedEndDate = formatDate(endDate);

  // Функция для форматирования даты для HTML5 input
  function formatDateForInput(date: Date | null): string {
    if (!date) return "";
    return date.toISOString().split('T')[0];
  }

  // Функция сортировки (только для дат)
  function sortBy(field: string) {
    // Разрешаем сортировку только по датам
    if (field === "productionDate" || field === "expiryDate") {
      if (sortField === field) {
        // Если уже сортируем по этому полю, меняем направление
        sortOrder = sortOrder === "asc" ? "desc" : "asc";
      } else {
        // Если новое поле, устанавливаем ascending
        sortField = field;
        sortOrder = "asc";
      }
    }
  }

  // Сортированные и отфильтрованные данные
  $: sortedBatches = (() => {
    // Сначала применяем фильтры
    let filtered = batches.filter((batch) => {
      // Фильтр по партии
      if (
        filters.party &&
        !batch.party.toLowerCase().includes(filters.party.toLowerCase())
      ) {
        return false;
      }

      // Фильтр по продукту
      if (
        filters.product &&
        !batch.product.toLowerCase().includes(filters.product.toLowerCase())
      ) {
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
    if (sortField === "productionDate" || sortField === "expiryDate") {
      filtered.sort((a: any, b: any) => {
        const aValue = new Date(a[sortField]);
        const bValue = new Date(b[sortField]);

        let comparison = 0;
        if (aValue > bValue) {
          comparison = 1;
        } else if (aValue < bValue) {
          comparison = -1;
        }

        return sortOrder === "asc" ? comparison : -comparison;
      });
    }

    return filtered;
  })();

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
    const sign = difference > 0 ? "+" : "";
    return sign + difference.toLocaleString();
  }

  // Получаем критичный процент из настроек ВетИС
  $: criticalPercentage = vetisSettings.criticalPercentage || 5;

  // Функция для проверки критичного расхождения
  function isCriticalDeviation(produced: number, vetis: number) {
    const deviationPercentage = Math.abs(calculatePercentage(produced, vetis));
    return deviationPercentage > criticalPercentage;
  }

  // Функция для определения статуса партии в процессе
  function getBatchStatus(batch: any) {
    if (!batch) return "Произведено";

    switch (batch.status) {
      case "Производится":
        return "Производится";
      case "Произведено":
        return "Произведено";
      case "На холде":
        return "На холде";
      case "Отправляется (10 из 20)":
        return "Отправляется";
      case "Отправлена (20 из 20)":
        return "Отправлена";
      default:
        return "Произведено";
    }
  }
</script>

{#if $tokenPayload}
  <div class="reports-container">

    <div class="main-content">
      <div class="page-header">
        <div class="header-content">
          <h1>Отчеты ВетИС</h1>
          <div class="timezone-selector">
            <label for="timezone-select">Выберите таймзону:</label>
            <select id="timezone-select" bind:value={selectedTimezone}>
              {#each aryIanaTimeZones as tz}
                <option value={tz.value}>{tz.label}</option>
              {/each}
            </select>
          </div>
        </div>
      </div>

      <!-- Мобильная панель фильтров -->
      {#if isMobile}
        <div class="mobile-filters">
          <button 
            class="mobile-filter-toggle"
            on:click={() => showMobileFilters = !showMobileFilters}
          >
            Фильтры {showMobileFilters ? '▲' : '▼'}
          </button>
          
          {#if showMobileFilters}
            <div class="mobile-filter-panel">
              <div class="mobile-filter-section">
                <label class="mobile-filter-label">Партия</label>
                <input
                  type="text"
                  placeholder="Поиск по партии..."
                  bind:value={filters.party}
                  class="mobile-filter-input"
                />
              </div>
              
              <div class="mobile-filter-section">
                <label class="mobile-filter-label">Дата производства</label>
                <div class="mobile-date-picker">
                  <div class="mobile-date-inputs">
                    <div class="mobile-date-input-group">
                      <label class="mobile-date-sublabel">От:</label>
                      <input
                        type="date"
                        bind:value={mobileDateFrom}
                        on:change={handleMobileDateFromChange}
                        class="mobile-date-input"
                        aria-label="Дата начала диапазона"
                      />
                    </div>
                    <div class="mobile-date-input-group">
                      <label class="mobile-date-sublabel">До:</label>
                      <input
                        type="date"
                        bind:value={mobileDateTo}
                        on:change={handleMobileDateToChange}
                        class="mobile-date-input"
                        aria-label="Дата окончания диапазона"
                      />
                    </div>
                  </div>
                  {#if mobileDateFrom || mobileDateTo}
                    <button
                      type="button"
                      on:click={() => {
                        mobileDateFrom = "";
                        mobileDateTo = "";
                        startDate = null;
                        endDate = null;
                        filters.dateFrom = "";
                        filters.dateTo = "";
                      }}
                      class="mobile-clear-dates"
                      aria-label="Очистить выбранные даты"
                    >
                      Очистить даты
                    </button>
                  {/if}
                </div>
              </div>
              
              <div class="mobile-filter-section">
                <label class="mobile-filter-label">Статус</label>
                <input
                  type="text"
                  placeholder="Поиск по статусу..."
                  bind:value={filters.status}
                  class="mobile-filter-input"
                />
              </div>
              
              <div class="mobile-filter-actions">
                <button 
                  class="mobile-clear-filters"
                  on:click={() => {
                    filters.party = "";
                    filters.product = "";
                    filters.status = "";
                    filters.dateFrom = "";
                    filters.dateTo = "";
                    startDate = null;
                    endDate = null;
                    mobileDateFrom = "";
                    mobileDateTo = "";
                  }}
                >
                  Очистить
                </button>
              </div>
            </div>
          {/if}
        </div>
      {/if}

      <!-- Мобильный кардочный вид -->
      {#if isMobile}
        <div class="mobile-cards-container">
          {#each sortedBatches as batch}
            <div 
              class="mobile-card"
              class:selected={selectedBatch === batch}
              on:click={() => selectBatch(batch)}
            >
              <div class="mobile-card-header">
                <div class="mobile-card-title">
                  <strong>Партия: {batch.party}</strong>
                  <span 
                    class="status-badge mobile-status"
                    class:produced={batch.status === "Произведено"}
                    class:sent={batch.status.includes("Отправлена")}
                    class:on-hold={batch.status === "На холде"}
                    class:sending={batch.status.includes("Отправляется")}
                  >
                    {batch.status}
                  </span>
                </div>
                <div class="mobile-card-product">{batch.product}</div>
              </div>
              
              <div class="mobile-card-body">
                <div class="mobile-card-row">
                  <span class="mobile-label">Дата производства:</span>
                  <span class="mobile-value">{formatDateInTimezone(batch.productionDate)}</span>
                </div>
                
                <div class="mobile-card-row">
                  <span class="mobile-label">Срок годности:</span>
                  <span class="mobile-value">{formatDateInTimezone(batch.expiryDate)}</span>
                </div>
                
                <div class="mobile-card-row">
                  <span class="mobile-label">Произведено:</span>
                  <span class="mobile-value">{batch.produced.toLocaleString()}</span>
                </div>
                
                <div class="mobile-card-row">
                  <span class="mobile-label">Данные ВетИС:</span>
                  <span class="mobile-value">{batch.vetis.toLocaleString()}</span>
                </div>
                
                <div class="mobile-card-row">
                  <span class="mobile-label">Разница:</span>
                  <span 
                    class="mobile-value difference-mobile"
                    class:critical={isCriticalDeviation(batch.produced, batch.vetis)}
                    class:positive={!isCriticalDeviation(batch.produced, batch.vetis) && calculatePercentage(batch.produced, batch.vetis) < 0}
                    class:negative={!isCriticalDeviation(batch.produced, batch.vetis) && calculatePercentage(batch.produced, batch.vetis) > 0}
                    class:neutral={!isCriticalDeviation(batch.produced, batch.vetis) && calculatePercentage(batch.produced, batch.vetis) === 0}
                  >
                    {formatDifference(calculateDifference(batch.produced, batch.vetis))} ({calculatePercentage(batch.produced, batch.vetis)}%)
                  </span>
                </div>
                
                <div class="mobile-card-row">
                  <span class="mobile-label">До отправки:</span>
                  <span 
                    class="mobile-value deadline-mobile"
                    class:deadline-overdue={getDeadlineStatus(batch.deadline, batch.status) === "overdue"}
                    class:deadline-critical={getDeadlineStatus(batch.deadline, batch.status) === "critical"}
                    class:deadline-warning={getDeadlineStatus(batch.deadline, batch.status) === "warning"}
                    class:deadline-normal={getDeadlineStatus(batch.deadline, batch.status) === "normal"}
                  >
                    {getTimeUntilDeadline(batch.deadline, batch.status)}
                  </span>
                </div>
              </div>
              
              {#if batch.status === "На холде"}
                <div class="mobile-card-actions">
                  <button
                    class="send-btn mobile-send-btn"
                    on:click|stopPropagation={openConfirmModal}
                  >
                    Отправить
                  </button>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {:else}
        <!-- Десктопный табличный вид -->
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
                        activeSearch = activeSearch === "party" ? "" : "party";
                        if (activeSearch !== "party") {
                          filters.party = "";
                        }
                      }}
                      on:keydown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          activeSearch = activeSearch === "party" ? "" : "party";
                          if (activeSearch !== "party") {
                            filters.party = "";
                          }
                        }
                      }}
                    >
                      <span>Партия</span>
                    </div>
                    {#if activeSearch === "party"}
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
                      activeSearch =
                        activeSearch === "product" ? "" : "product";
                      if (activeSearch !== "product") {
                        filters.product = "";
                      }
                    }}
                    on:keydown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        activeSearch =
                          activeSearch === "product" ? "" : "product";
                        if (activeSearch !== "product") {
                          filters.product = "";
                        }
                      }
                    }}
                  >
                    <span>Продукт</span>
                  </div>
                  {#if activeSearch === "product"}
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
                      activeSearch = activeSearch === "date" ? "" : "date";
                      if (activeSearch !== "date") {
                        filters.dateFrom = "";
                        filters.dateTo = "";
                      }
                    }}
                    on:keydown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        activeSearch = activeSearch === "date" ? "" : "date";
                        if (activeSearch !== "date") {
                          filters.dateFrom = "";
                          filters.dateTo = "";
                        }
                      }
                    }}
                  >
                    <span
                      style="display: inline-flex; align-items: center; gap: 0.25rem;"
                    >
                      Дата производства
                      <button
                        class="sort-button"
                        class:active={sortField === "productionDate"}
                        on:click|stopPropagation={() =>
                          sortBy("productionDate")}
                        type="button"
                        tabindex="0"
                        on:keydown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            sortBy("productionDate");
                          }
                        }}
                      >
                        {#if sortField === "productionDate"}
                          {sortOrder === "asc" ? "↑" : "↓"}
                        {:else}
                          ↕
                        {/if}
                      </button>
                    </span>
                  </div>
                  {#if activeSearch === "date"}
                    <div class="th-search-dropdown">
                      <div class="date-filter">
                        <DatePicker bind:isOpen={isDatePickerOpen} bind:startDate bind:endDate isRange>
                          <div 
                            class="date-field" 
                            on:click={toggleDatePicker} 
                            on:keydown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                toggleDatePicker();
                              }
                            }}
                            class:open={isDatePickerOpen}
                            role="button"
                            tabindex="0"
                            aria-label="Открыть выбор диапазона дат"
                          >
                            <div class="icon-calendar"></div>
                            <div class="date">
                              {#if startDate}
                                {formattedStartDate} - {formattedEndDate}
                              {:else}
                                Выберите диапазон дат
                              {/if}
                            </div>
                            {#if startDate}
                              <button
                                type="button"
                                on:click|stopPropagation={onClearDates}
                                class="clear-icon"
                                aria-label="Очистить выбранные даты"
                              >
                                ✕
                              </button>
                            {/if}
                          </div>
                        </DatePicker>
                      </div>
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
                      activeSearch = activeSearch === "status" ? "" : "status";
                      if (activeSearch !== "status") {
                        filters.status = "";
                      }
                    }}
                    on:keydown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        activeSearch =
                          activeSearch === "status" ? "" : "status";
                        if (activeSearch !== "status") {
                          filters.status = "";
                        }
                      }
                    }}
                  >
                    <span>Статус</span>
                  </div>
                  {#if activeSearch === "status"}
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
                <td
                  class:critical={isCriticalDeviation(
                    batch.produced,
                    batch.vetis,
                  )}
                  class:positive={!isCriticalDeviation(
                    batch.produced,
                    batch.vetis,
                  ) && calculatePercentage(batch.produced, batch.vetis) < 0}
                  class:negative={!isCriticalDeviation(
                    batch.produced,
                    batch.vetis,
                  ) && calculatePercentage(batch.produced, batch.vetis) > 0}
                  class:neutral={!isCriticalDeviation(
                    batch.produced,
                    batch.vetis,
                  ) && calculatePercentage(batch.produced, batch.vetis) === 0}
                >
                  <div class="difference-display">
                    {formatDifference(
                      calculateDifference(batch.produced, batch.vetis),
                    )} ({calculatePercentage(batch.produced, batch.vetis)}%)
                  </div>
                </td>
                <td
                  class="deadline-cell"
                  class:deadline-overdue={getDeadlineStatus(
                    batch.deadline,
                    batch.status,
                  ) === "overdue"}
                  class:deadline-critical={getDeadlineStatus(
                    batch.deadline,
                    batch.status,
                  ) === "critical"}
                  class:deadline-warning={getDeadlineStatus(
                    batch.deadline,
                    batch.status,
                  ) === "warning"}
                  class:deadline-normal={getDeadlineStatus(
                    batch.deadline,
                    batch.status,
                  ) === "normal"}
                >
                  <div class="deadline-display">
                    <div class="time-remaining">
                      {getTimeUntilDeadline(batch.deadline, batch.status)}
                    </div>
                    <div class="deadline-date">
                      {formatDeadlineInTimezone(
                        batch.deadline,
                        deadlineTimezone,
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <div
                    style="display: flex; flex-direction: row; align-items: center; gap: 0.5rem; flex-wrap: wrap;"
                  >
                    <span
                      class="status-badge"
                      class:produced={batch.status === "Произведено"}
                      class:sent={batch.status.includes("Отправлена")}
                      class:on-hold={batch.status === "На холде"}
                      class:sending={batch.status.includes("Отправляется")}
                    >
                      {batch.status}
                    </span>
                    {#if batch.status === "На холде"}
                      <button
                        class="send-btn"
                        on:click|stopPropagation={openConfirmModal}
                        >Отправить</button
                      >
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
                        <span class="batch-info-meta"
                          >Продукт: {batch.product} | Произведено: {batch.produced.toLocaleString()}</span
                        >
                      </div>
                      <div class="process-flow-mini">
                        <div
                          class="flow-item-mini"
                          class:completed={getBatchStatus(batch) ===
                            "Производится"}
                          class:active={getBatchStatus(batch) ===
                            "Производится"}
                        >
                          <div class="flow-circle-mini">1</div>
                          <span>Производится</span>
                        </div>
                        <div class="flow-arrow-mini">→</div>
                        <div
                          class="flow-item-mini"
                          class:completed={getBatchStatus(batch) ===
                            "Произведено"}
                          class:active={getBatchStatus(batch) === "Произведено"}
                        >
                          <div class="flow-circle-mini">2</div>
                          <span>Произведено</span>
                        </div>
                        <div class="flow-arrow-mini">→</div>
                        <div
                          class="flow-item-mini"
                          class:completed={[
                            "Отправляется",
                            "Отправлена",
                          ].includes(getBatchStatus(batch))}
                          class:active={getBatchStatus(batch) === "На холде"}
                          class:hold={getBatchStatus(batch) === "На холде"}
                        >
                          <div class="flow-circle-mini">3</div>
                          <span>На холде</span>
                        </div>
                        <div class="flow-arrow-mini">→</div>
                        <div
                          class="flow-item-mini"
                          class:completed={getBatchStatus(batch) ===
                            "Отправлена"}
                          class:active={getBatchStatus(batch) ===
                            "Отправляется"}
                        >
                          <div class="flow-circle-mini">4</div>
                          <span>Отправляется</span>
                        </div>
                        <div class="flow-arrow-mini">→</div>
                        <div
                          class="flow-item-mini"
                          class:completed={getBatchStatus(batch) ===
                            "Отправлена"}
                          class:active={getBatchStatus(batch) === "Отправлена"}
                        >
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
      {/if}

      <!-- Pagination -->
      <div class="pagination">
        <button on:click={previousPage} disabled={currentPage === 1}>‹</button>
        <span>{currentPage}</span>
        <span>2</span>
        <span>3</span>
        <span>...</span>
        <span>{totalPages}</span>
        <button on:click={nextPage} disabled={currentPage === totalPages}
          >›</button
        >
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
    display: block;
    padding: 1rem;
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
    background: linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%);
    gap: 2rem;
  }

  .loading-spinner {
    width: 60px;
    height: 60px;
    border: 4px solid rgba(99, 102, 241, 0.2);
    border-top: 4px solid #6366f1;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    box-shadow: 0 8px 32px rgba(99, 102, 241, 0.2);
  }

  .loading-container p {
    color: #1f2937;
    font-size: 1.125rem;
    margin: 0;
    font-weight: 600;
    text-align: center;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes pulse {
    0%, 100% { 
      opacity: 1; 
    }
    50% { 
      opacity: 0.7; 
    }
  }

  .main-content {
    width: 100%;
    min-width: 0;
    background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    border: 1px solid rgba(226, 232, 240, 0.8);
    backdrop-filter: blur(10px);
  }

  .page-header {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-bottom: 2px solid #e2e8f0;
    padding: 1.5rem 2rem;
    border-radius: 16px 16px 0 0;
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .header-content h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .header-content h1::before {
    content: '📊';
    font-size: 1.75rem;
  }

  .timezone-selector {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: white;
    padding: 0.75rem 1.25rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
  }

  .timezone-selector label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
    white-space: nowrap;
  }

  .timezone-selector select {
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 160px;
    max-width: 200px;
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
    border-radius: 16px;
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
    min-width: 1200px;
    border-collapse: separate;
    border-spacing: 0;
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow:
      0 4px 20px rgba(0, 0, 0, 0.08),
      0 1px 3px rgba(0, 0, 0, 0.1);
    table-layout: fixed;
  }

  .reports-table th {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    padding: 1rem 0.75rem;
    text-align: left;
    font-size: 0.875rem;
    font-weight: 700;
    color: #1e293b;
    border-bottom: 2px solid #e2e8f0;
    vertical-align: top;
    position: relative;
    white-space: normal;
    line-height: 1.4;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .reports-table th:nth-child(1) { width: 10%; } /* Партия */
  .reports-table th:nth-child(2) { width: 10%; } /* Продукт */
  .reports-table th:nth-child(3) { width: 13%; } /* Дата производства */
  .reports-table th:nth-child(4) { width: 13%; } /* Дата срока годности */
  .reports-table th:nth-child(5) { width: 10%; } /* Произведено */
  .reports-table th:nth-child(6) { width: 10%; } /* Данные ВетИС */
  .reports-table th:nth-child(7) { width: 10%; } /* Разница */
  .reports-table th:nth-child(8) { width: 10%; }  /* До отправки */
  .reports-table th:nth-child(9) { width: 14%; }  /* Статус */

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

  .reports-table td {
    padding: 1rem 0.75rem;
    font-size: 0.875rem;
    color: #374151;
    border-bottom: 1px solid #f1f5f9;
    background: white;
    transition: all 0.2s ease;
    white-space: normal;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.4;
    font-weight: 500;
    word-wrap: break-word;
  }

  .reports-table tbody tr {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .reports-table tbody tr:nth-child(even) {
    background: rgba(248, 250, 252, 0.5);
  }

  .reports-table tbody tr:hover {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    transform: translateY(-1px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
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
  }

  /* Стили для отображения разницы */
  .difference-display {
    display: inline-block;
    text-align: center;
    font-size: 0.75rem;
    font-weight: 600;
    line-height: 1.3;
    white-space: nowrap;
  }

  .status-badge {
    background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
    color: #374151;
    padding: 0.3rem 0.6rem;
    border-radius: 14px;
    font-size: 0.7rem;
    font-weight: 600;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
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
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.7;
  }

  .status-badge.produced {
    background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
    color: #166534;
    box-shadow: 0 2px 8px rgba(22, 101, 52, 0.2);
  }

  .status-badge.sent {
    background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
    color: #166534;
    box-shadow: 0 2px 8px rgba(22, 101, 52, 0.2);
  }

  .status-badge.on-hold {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    color: #92400e;
    box-shadow: 0 2px 8px rgba(146, 64, 14, 0.2);
  }

  .status-badge.sending {
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    color: #1e40af;
    box-shadow: 0 2px 8px rgba(30, 64, 175, 0.2);
  }

  .send-btn {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    border: none;
    padding: 0.3rem 0.8rem;
    border-radius: 8px;
    font-size: 0.7rem;
    font-weight: 600;
    cursor: pointer;
    line-height: 1.2;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    min-width: 70px;
    justify-content: center;
    white-space: nowrap;
  }

  .send-btn::before {
    content: '📤';
    font-size: 0.875rem;
  }

  .send-btn:hover {
    background: linear-gradient(135deg, #5046e4 0%, #7c3aed 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
  }

  .send-btn:active {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
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
    gap: 0.5rem;
    padding: 1rem;
    font-size: 0.875rem;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-top: 1px solid #e2e8f0;
    border-radius: 0 0 16px 16px;
  }

  .pagination button {
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border: 1px solid #e2e8f0;
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-weight: 600;
    min-width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .pagination button:hover:not(:disabled) {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    border-color: #6366f1;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.25);
  }

  .pagination button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #f1f5f9;
    border-color: #e2e8f0;
    transform: none;
    box-shadow: none;
  }

  .pagination span {
    padding: 0.5rem 0.75rem;
    color: #6b7280;
    font-weight: 600;
    font-size: 0.875rem;
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
    padding: 0.875rem 0.3rem 0.675rem 2rem;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 0.575rem;
    width: 100%;
    outline: none;
    background: #f8fafc
      url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'/%3e%3c/svg%3e")
      no-repeat left 0.75rem center;
    background-size: 1.25rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    color: #1e293b;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .th-search-input:hover {
    border-color: #3b82f6;
    background-color: white;
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
  }

  .th-search-input:focus {
    border-color: #3b82f6;
    box-shadow:
      0 0 0 4px rgba(59, 130, 246, 0.1),
      0 4px 6px -1px rgba(0, 0, 0, 0.1);
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
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }

  /* DatePicker стили */
  .date-filter {
    width: 100%;
  }

  .date-field {
    align-items: center;
    background-color: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    display: inline-flex;
    gap: 8px;
    min-width: 100px;
    padding: 8px 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 100%;
  }

  .date-field:hover {
    border-color: #cbd5e1;
  }

  .date-field.open {
    border-color: #4b4bc7;
    box-shadow: 0 0 0 2px rgba(75, 75, 199, 0.1);
  }

  .icon-calendar {
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>') no-repeat center center;
    background-size: 16px 16px;
    height: 16px;
    width: 16px;
    opacity: 0.6;
  }

  .date {
    flex: 1;
    font-size: 0.75rem;
    color: #374151;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .clear-icon {
    background: #ef4444;
    color: white;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .clear-icon:hover {
    background: #dc2626;
  }

  /* Стили для мобильных карточек */
  .mobile-cards-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0.5rem;
  }

  .mobile-card {
    background: white;
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 2px solid transparent;
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .mobile-card:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }

  .mobile-card.selected {
    border-color: #3b82f6;
    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
  }

  .mobile-card-header {
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #f1f5f9;
  }

  .mobile-card-title {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    flex-wrap: wrap;
  }

  .mobile-card-title strong {
    font-size: 1rem;
    color: #1e293b;
    flex: 1;
    min-width: 0;
  }

  .mobile-status {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    flex-shrink: 0;
  }

  .mobile-card-product {
    font-size: 0.875rem;
    color: #64748b;
    font-weight: 500;
  }

  .mobile-card-body {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .mobile-card-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
    min-height: 1.5rem;
  }

  .mobile-label {
    font-size: 0.875rem;
    color: #64748b;
    font-weight: 500;
    flex-shrink: 0;
    min-width: 120px;
  }

  .mobile-value {
    font-size: 0.875rem;
    color: #1e293b;
    font-weight: 600;
    text-align: right;
    flex: 1;
    min-width: 0;
    word-break: break-word;
  }

  .difference-mobile.positive {
    color: #059669;
  }

  .difference-mobile.negative {
    color: #dc2626;
  }

  .difference-mobile.neutral {
    color: #6b7280;
  }

  .difference-mobile.critical {
    color: #dc2626;
    background-color: #fef2f2;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    font-weight: 700;
  }

  .deadline-mobile.deadline-normal {
    color: #059669;
  }

  .deadline-mobile.deadline-warning {
    color: #d97706;
  }

  .deadline-mobile.deadline-critical {
    color: #dc2626;
    font-weight: 700;
  }

  .deadline-mobile.deadline-overdue {
    color: #991b1b;
    font-weight: 700;
  }

  .mobile-card-actions {
    margin-top: 1rem;
    padding-top: 0.75rem;
    border-top: 1px solid #f1f5f9;
    display: flex;
    justify-content: flex-end;
  }

  .mobile-send-btn {
    font-size: 0.875rem;
    padding: 0.5rem 1rem;
    min-width: auto;
  }

  /* Стили для мобильной панели фильтров */
  .mobile-filters {
    background: white;
    border-radius: 12px;
    margin-bottom: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .mobile-filter-toggle {
    width: 100%;
    padding: 1rem;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border: none;
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s ease;
  }

  .mobile-filter-toggle:hover {
    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  }

  .mobile-filter-panel {
    padding: 1rem;
    border-top: 1px solid #f1f5f9;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .mobile-filter-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .mobile-filter-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
  }

  .mobile-filter-input {
    padding: 0.75rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 16px; /* Предотвращает зум на iOS */
    background: white;
    transition: all 0.3s ease;
  }

  .mobile-filter-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .mobile-date-picker {
    width: 100%;
  }

  .mobile-date-inputs {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .mobile-date-input-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .mobile-date-sublabel {
    font-size: 0.8rem;
    font-weight: 500;
    color: #6b7280;
  }

  .mobile-date-input {
    padding: 0.75rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 16px; /* Предотвращает зум на iOS */
    background: white;
    transition: all 0.3s ease;
    color: #374151;
    font-family: inherit;
  }

  .mobile-date-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .mobile-clear-dates {
    background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 0.5rem;
    align-self: flex-start;
  }

  .mobile-clear-dates:hover {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    transform: translateY(-1px);
  }

  .mobile-filter-actions {
    display: flex;
    justify-content: center;
    margin-top: 0.5rem;
  }

  .mobile-clear-filters {
    background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
  }

  .mobile-clear-filters:hover {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(239, 68, 68, 0.4);
  }

  /* Планшетные стили для iPad */
  @media (min-width: 768px) and (max-width: 1024px) {
    .reports-container {
      padding: 1.5rem;
    }

    .page-header {
      gap: 1.5rem;
    }

    .header-content h1 {
      font-size: 1.75rem;
    }

    .timezone-selector select {
      font-size: 16px;
      padding: 0.75rem;
      min-height: 44px;
    }

    .table-container {
      border-radius: 12px;
      overflow: hidden;
    }

    .reports-table {
      font-size: 0.9rem;
    }

    .reports-table th,
    .reports-table td {
      padding: 0.75rem 0.5rem;
      font-size: 0.85rem;
    }

    .reports-table th {
      font-size: 0.875rem;
    }

    .deadline-cell {
      min-width: 140px;
      max-width: 160px;
    }

    .time-remaining {
      font-size: 0.8rem;
    }

    .deadline-date {
      font-size: 0.75rem;
    }

    .status-badge {
      font-size: 0.75rem;
      padding: 0.375rem 0.75rem;
    }

    .th-content {
      gap: 0.75rem;
    }

    .th-title {
      font-size: 0.875rem;
    }

    .th-search-dropdown {
      border-radius: 8px;
    }

    .th-search-input {
      font-size: 16px;
      padding: 0.625rem;
      min-height: 44px;
    }

    .date-filter {
      padding: 0.75rem;
    }

    .date-field {
      font-size: 16px;
      padding: 0.625rem;
      min-height: 44px;
    }

    .sort-button {
      padding: 0.625rem;
      font-size: 0.875rem;
      min-height: 44px;
    }

    .clear-icon {
      width: 20px;
      height: 20px;
      font-size: 11px;
    }
  }

  /* iPad Portrait - компактный режим */
  @media (min-width: 768px) and (max-width: 1024px) and (orientation: portrait) {
    .reports-container {
      padding: 1.25rem;
    }

    .reports-table th:nth-child(n+5),
    .reports-table td:nth-child(n+5) {
      display: none; /* Скрываем некоторые колонки в портрете */
    }

    .header-content {
      flex-direction: column;
      text-align: center;
      gap: 1rem;
    }
  }

  /* iPad Landscape - полная функциональность */
  @media (min-width: 1024px) and (max-width: 1366px) and (orientation: landscape) {
    .reports-container {
      padding: 2rem;
    }

    .reports-table {
      font-size: 0.95rem;
    }

    .reports-table th,
    .reports-table td {
      padding: 1rem 0.75rem;
      font-size: 0.9rem;
    }

    .deadline-cell {
      min-width: 160px;
      max-width: 180px;
    }
  }

  /* Медиа-запросы для мобильных устройств */
  @media (max-width: 768px) {
    .reports-container {
      padding: 0.75rem;
    }

    .page-header {
      padding: 1rem;
    }

    .header-content {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }

    .header-content h1 {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }

    .timezone-selector {
      width: 100%;
      max-width: 320px;
      margin: 0 auto;
      padding: 0.75rem;
    }

    .timezone-selector label {
      font-size: 0.875rem;
      min-width: auto;
    }

    .timezone-selector select {
      font-size: 16px; /* Предотвращает зум на iOS */
      padding: 0.75rem;
      width: 100%;
      max-width: 100%;
      min-width: auto;
    }

    /* Скрываем таблицу на мобильных - используем карточки */
    .table-container {
      display: none;
    }

    /* Стили для мобильных карточек оптимизированы для маленьких экранов */
    .mobile-cards-container {
      padding: 0;
      gap: 0.75rem;
    }

    .mobile-card {
      padding: 0.75rem;
      border-radius: 8px;
    }

    .mobile-card-title strong {
      font-size: 0.9rem;
    }

    .mobile-card-product {
      font-size: 0.8rem;
    }

    .mobile-label {
      font-size: 0.8rem;
      min-width: 100px;
    }

    .mobile-value {
      font-size: 0.8rem;
    }

    .mobile-status {
      font-size: 0.7rem;
      padding: 0.2rem 0.4rem;
    }

    /* Мобильные даты оптимизированы */
    .mobile-date-inputs {
      gap: 0.5rem;
    }

    .mobile-date-input {
      padding: 0.625rem;
      font-size: 16px;
    }

    .mobile-filter-panel {
      padding: 0.75rem;
    }

    .mobile-filter-section {
      gap: 0.375rem;
    }
  }

  @media (max-width: 480px) {
    .reports-container {
      padding: 0.5rem;
    }

    .page-header {
      padding: 0.75rem;
    }

    .header-content h1 {
      font-size: 1.25rem;
    }

    .timezone-selector {
      padding: 0.5rem;
    }

    .timezone-selector select {
      padding: 0.625rem;
    }

    /* Мобильные карточки для очень маленьких экранов */
    .mobile-card {
      padding: 0.5rem;
    }

    .mobile-card-title strong {
      font-size: 0.85rem;
    }

    .mobile-card-product {
      font-size: 0.75rem;
    }

    .mobile-label {
      font-size: 0.75rem;
      min-width: 90px;
    }

    .mobile-value {
      font-size: 0.75rem;
    }

    .mobile-status {
      font-size: 0.65rem;
      padding: 0.15rem 0.3rem;
    }

    /* Еще более компактные даты */
    .mobile-date-input {
      padding: 0.5rem;
    }

    .mobile-filter-panel {
      padding: 0.5rem;
    }

    .clear-icon {
      width: 14px;
      height: 14px;
      font-size: 8px;
    }
  }
</style>
