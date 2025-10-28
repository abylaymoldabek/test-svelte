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

  // Функция для получения UTC смещения для таймзоны
  function getUTCOffset(timezone: string): string {
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en', {
        timeZone: timezone,
        timeZoneName: 'longOffset'
      });
      
      const parts = formatter.formatToParts(now);
      const offsetPart = parts.find(part => part.type === 'timeZoneName');
      
      if (offsetPart && offsetPart.value.startsWith('GMT')) {
        const offset = offsetPart.value.replace('GMT', 'UTC');
        return offset === 'UTC' ? 'UTC+0' : offset;
      }
      
      // Fallback метод
      const offsetMinutes = -now.getTimezoneOffset();
      const utc = new Date(now.getTime() + offsetMinutes * 60000);
      const target = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
      const diff = (target.getTime() - utc.getTime()) / (1000 * 60 * 60);
      
      if (diff === 0) return 'UTC+0';
      const sign = diff > 0 ? '+' : '';
      return `UTC${sign}${diff}`;
    } catch (error) {
      return '';
    }
  }

  var aryIanaTimeZones = [
    { value: "Europe/Andorra", label: `Андорра (${getUTCOffset("Europe/Andorra")})` },
    { value: "Asia/Dubai", label: `Дубай (${getUTCOffset("Asia/Dubai")})` },
    { value: "Asia/Kabul", label: `Кабул (${getUTCOffset("Asia/Kabul")})` },
    { value: "Europe/Tirane", label: `Тирана (${getUTCOffset("Europe/Tirane")})` },
    { value: "Asia/Yerevan", label: `Ереван (${getUTCOffset("Asia/Yerevan")})` },
    { value: "Europe/Moscow", label: `Москва (${getUTCOffset("Europe/Moscow")})` },
    { value: "Asia/Almaty", label: `Алматы (${getUTCOffset("Asia/Almaty")})` },
    { value: "Asia/Tashkent", label: `Ташкент (${getUTCOffset("Asia/Tashkent")})` },
    { value: "Europe/Kiev", label: `Киев (${getUTCOffset("Europe/Kiev")})` },
    { value: "Europe/Minsk", label: `Минск (${getUTCOffset("Europe/Minsk")})` },
    { value: "Europe/London", label: `Лондон (${getUTCOffset("Europe/London")})` },
    { value: "Europe/Paris", label: `Париж (${getUTCOffset("Europe/Paris")})` },
    { value: "Europe/Berlin", label: `Берлин (${getUTCOffset("Europe/Berlin")})` },
    { value: "America/New_York", label: `Нью-Йорк (${getUTCOffset("America/New_York")})` },
    { value: "America/Los_Angeles", label: `Лос-Анджелес (${getUTCOffset("America/Los_Angeles")})` },
    { value: "Asia/Tokyo", label: `Токио (${getUTCOffset("Asia/Tokyo")})` },
    { value: "Asia/Shanghai", label: `Шанхай (${getUTCOffset("Asia/Shanghai")})` },
    { value: "Australia/Sydney", label: `Сидней (${getUTCOffset("Australia/Sydney")})` },
    { value: "Pacific/Auckland", label: `Окленд (${getUTCOffset("Pacific/Auckland")})` },
    { value: "Antarctica/Casey", label: `Кейси (${getUTCOffset("Antarctica/Casey")})` },
    { value: "Antarctica/Davis", label: `Дэвис (${getUTCOffset("Antarctica/Davis")})` },
    { value: "Antarctica/DumontDUrville", label: `Дюмон-дю-Виль (${getUTCOffset("Antarctica/DumontDUrville")})` }, // https://bugs.chromium.org/p/chromium/issues/detail?id=928068
    { value: "Antarctica/Mawson", label: `Моусон (${getUTCOffset("Antarctica/Mawson")})` },
    { value: "Antarctica/Palmer", label: `Палмер (${getUTCOffset("Antarctica/Palmer")})` },
    { value: "Antarctica/Rothera", label: `Ротера (${getUTCOffset("Antarctica/Rothera")})` },
    { value: "Antarctica/Syowa", label: `Сёва (${getUTCOffset("Antarctica/Syowa")})` },
    { value: "Antarctica/Troll", label: `Тролль (${getUTCOffset("Antarctica/Troll")})` },
    { value: "Antarctica/Vostok", label: `Восток (${getUTCOffset("Antarctica/Vostok")})` },
    { value: "America/Argentina/Buenos_Aires", label: `Буэнос-Айрес (${getUTCOffset("America/Argentina/Buenos_Aires")})` },
    { value: "America/Argentina/Cordoba", label: `Кордоба (${getUTCOffset("America/Argentina/Cordoba")})` },
    { value: "America/Argentina/Salta", label: `Сальта (${getUTCOffset("America/Argentina/Salta")})` },
    { value: "America/Argentina/Jujuy", label: `Хухуй (${getUTCOffset("America/Argentina/Jujuy")})` },
    { value: "America/Argentina/Tucuman", label: `Тукуман (${getUTCOffset("America/Argentina/Tucuman")})` },
    { value: "America/Argentina/Catamarca", label: `Катамарка (${getUTCOffset("America/Argentina/Catamarca")})` },
    { value: "America/Argentina/La_Rioja", label: `Ла-Риоха (${getUTCOffset("America/Argentina/La_Rioja")})` },
    { value: "America/Argentina/San_Juan", label: `Сан-Хуан (${getUTCOffset("America/Argentina/San_Juan")})` },
    { value: "America/Argentina/Mendoza", label: `Мендоса (${getUTCOffset("America/Argentina/Mendoza")})` },
    { value: "America/Argentina/San_Luis", label: `Сан-Луис (${getUTCOffset("America/Argentina/San_Luis")})` },
    { value: "America/Argentina/Rio_Gallegos", label: `Рио-Галегос (${getUTCOffset("America/Argentina/Rio_Gallegos")})` },
    { value: "America/Argentina/Ushuaia", label: `Ушуайя (${getUTCOffset("America/Argentina/Ushuaia")})` },
    { value: "Pacific/Pago_Pago", label: `Пагопаго (${getUTCOffset("Pacific/Pago_Pago")})` },
    { value: "Europe/Vienna", label: `Вена (${getUTCOffset("Europe/Vienna")})` },
    { value: "Australia/Lord_Howe", label: `Лорд-Хау (${getUTCOffset("Australia/Lord_Howe")})` },
    { value: "Antarctica/Macquarie", label: `Маккуори (${getUTCOffset("Antarctica/Macquarie")})` },
    { value: "Australia/Hobart", label: `Хобарт (${getUTCOffset("Australia/Hobart")})` },
    { value: "Australia/Currie", label: `Курри (${getUTCOffset("Australia/Currie")})` },
    { value: "Australia/Melbourne", label: `Мельбурн (${getUTCOffset("Australia/Melbourne")})` },
    { value: "Australia/Sydney", label: `Сидней (${getUTCOffset("Australia/Sydney")})` },
    { value: "Australia/Broken_Hill", label: `Брокен-Хилл (${getUTCOffset("Australia/Broken_Hill")})` },
    { value: "Australia/Brisbane", label: `Брисбен (${getUTCOffset("Australia/Brisbane")})` },
    { value: "Australia/Lindeman", label: `Линдеман (${getUTCOffset("Australia/Lindeman")})` },
    { value: "Australia/Adelaide", label: `Аделаида (${getUTCOffset("Australia/Adelaide")})` },
    { value: "Australia/Darwin", label: `Дарвин (${getUTCOffset("Australia/Darwin")})` },
    { value: "Australia/Perth", label: `Перт (${getUTCOffset("Australia/Perth")})` },
    { value: "Australia/Eucla", label: `Евкла (${getUTCOffset("Australia/Eucla")})` },
    { value: "Asia/Baku", label: `Баку (${getUTCOffset("Asia/Baku")})` },
    { value: "America/Barbados", label: `Барбадос (${getUTCOffset("America/Barbados")})` },
    { value: "Asia/Dhaka", label: `Дакка (${getUTCOffset("Asia/Dhaka")})` },
    { value: "Europe/Brussels", label: `Брюссель (${getUTCOffset("Europe/Brussels")})` },
    { value: "Europe/Sofia", label: `София (${getUTCOffset("Europe/Sofia")})` },
    { value: "Atlantic/Bermuda", label: `Бермуды (${getUTCOffset("Atlantic/Bermuda")})` },
    { value: "Asia/Brunei", label: `Бруней (${getUTCOffset("Asia/Brunei")})` },
    { value: "America/La_Paz", label: `Ла-Пас (${getUTCOffset("America/La_Paz")})` },
    { value: "America/Noronha", label: `Норона (${getUTCOffset("America/Noronha")})` },
    { value: "America/Belem", label: `Белем (${getUTCOffset("America/Belem")})` },
    { value: "America/Fortaleza", label: `Форталеза (${getUTCOffset("America/Fortaleza")})` },
    { value: "America/Recife", label: `Ресифи (${getUTCOffset("America/Recife")})` },
    { value: "America/Araguaina", label: `Арагвайна (${getUTCOffset("America/Araguaina")})` },
    { value: "America/Maceio", label: `Масейо (${getUTCOffset("America/Maceio")})` },
    { value: "America/Bahia", label: `Баия (${getUTCOffset("America/Bahia")})` },
    { value: "America/Sao_Paulo", label: `Сан-Паулу (${getUTCOffset("America/Sao_Paulo")})` },
    { value: "America/Campo_Grande", label: `Кампу-Гранде (${getUTCOffset("America/Campo_Grande")})` },
    { value: "America/Cuiaba", label: `Куяба (${getUTCOffset("America/Cuiaba")})` },
    { value: "America/Santarem", label: `Сантарен (${getUTCOffset("America/Santarem")})` },
    { value: "America/Porto_Velho", label: `Порту-Велью (${getUTCOffset("America/Porto_Velho")})` },
    { value: "America/Boa_Vista", label: `Боа-Виста (${getUTCOffset("America/Boa_Vista")})` },
    { value: "America/Manaus", label: `Манаус (${getUTCOffset("America/Manaus")})` },
    { value: "America/Eirunepe", label: `Эйрунепе (${getUTCOffset("America/Eirunepe")})` },
    { value: "America/Rio_Branco", label: `Рио-Бранко (${getUTCOffset("America/Rio_Branco")})` },
    { value: "America/Nassau", label: `Нассау (${getUTCOffset("America/Nassau")})` },
    { value: "Asia/Thimphu", label: `Тхимпху (${getUTCOffset("Asia/Thimphu")})` },
    { value: "Europe/Minsk", label: `Минск (${getUTCOffset("Europe/Minsk")})` },
    { value: "America/Belize", label: `Белиз (${getUTCOffset("America/Belize")})` },
    { value: "America/St_Johns", label: `Сент-Джонс (${getUTCOffset("America/St_Johns")})` },
    { value: "America/Halifax", label: `Галифакс (${getUTCOffset("America/Halifax")})` },
    { value: "America/Glace_Bay", label: `Глейс-Бей (${getUTCOffset("America/Glace_Bay")})` },
    { value: "America/Moncton", label: `Монктон (${getUTCOffset("America/Moncton")})` },
    { value: "America/Goose_Bay", label: `Гус-Бей (${getUTCOffset("America/Goose_Bay")})` },
    { value: "America/Blanc-Sablon", label: `Бланк-Саблон (${getUTCOffset("America/Blanc-Sablon")})` },
    { value: "America/Toronto", label: `Торонто (${getUTCOffset("America/Toronto")})` },
    { value: "America/Nipigon", label: `Нипигон (${getUTCOffset("America/Nipigon")})` },
    { value: "America/Thunder_Bay", label: `Тандер-Бей (${getUTCOffset("America/Thunder_Bay")})` },
    { value: "America/Iqaluit", label: `Икалуит (${getUTCOffset("America/Iqaluit")})` },
    { value: "America/Pangnirtung", label: `Пангниртунг (${getUTCOffset("America/Pangnirtung")})` },
    { value: "America/Atikokan", label: `Атикокан (${getUTCOffset("America/Atikokan")})` },
    { value: "America/Winnipeg", label: `Виннипег (${getUTCOffset("America/Winnipeg")})` },
    { value: "America/Rainy_River", label: `Рейни-Ривер (${getUTCOffset("America/Rainy_River")})` },
    { value: "America/Resolute", label: `Резолют (${getUTCOffset("America/Resolute")})` },
    { value: "America/Rankin_Inlet", label: `Ранкин-Инлет (${getUTCOffset("America/Rankin_Inlet")})` },
    { value: "America/Regina", label: `Регина (${getUTCOffset("America/Regina")})` },
    { value: "America/Swift_Current", label: `Свифт-Керрент (${getUTCOffset("America/Swift_Current")})` },
    { value: "America/Edmonton", label: `Эдмонтон (${getUTCOffset("America/Edmonton")})` },
    { value: "America/Cambridge_Bay", label: `Кембридж-Бей (${getUTCOffset("America/Cambridge_Bay")})` },
    { value: "America/Yellowknife", label: `Йеллоунайф (${getUTCOffset("America/Yellowknife")})` },
    { value: "America/Inuvik", label: `Инуvik (${getUTCOffset("America/Inuvik")})` },
    { value: "America/Creston", label: `Крестон (${getUTCOffset("America/Creston")})` },
    { value: "America/Dawson_Creek", label: `Досон-Крик (${getUTCOffset("America/Dawson_Creek")})` },
    { value: "America/Fort_Nelson", label: `Форт-Нелсон (${getUTCOffset("America/Fort_Nelson")})` },
    { value: "America/Vancouver", label: `Ванкувер (${getUTCOffset("America/Vancouver")})` },
    { value: "America/Whitehorse", label: `Уайтхорс (${getUTCOffset("America/Whitehorse")})` },
    { value: "America/Dawson", label: `Досон (${getUTCOffset("America/Dawson")})` },
    { value: "Indian/Cocos", label: `Кокосовые острова (${getUTCOffset("Indian/Cocos")})` },
    { value: "Europe/Zurich", label: `Цюрих (${getUTCOffset("Europe/Zurich")})` },
    { value: "Africa/Abidjan", label: `Абиджан (${getUTCOffset("Africa/Abidjan")})` },
    { value: "Pacific/Rarotonga", label: `Раротонга (${getUTCOffset("Pacific/Rarotonga")})` },
    { value: "America/Santiago", label: `Сантьяго (${getUTCOffset("America/Santiago")})` },
    { value: "America/Punta_Arenas", label: `Пунта-Аренас (${getUTCOffset("America/Punta_Arenas")})` },
    { value: "Pacific/Easter", label: `Остров Пасхи (${getUTCOffset("Pacific/Easter")})` },
    { value: "Asia/Shanghai", label: `Шанхай (${getUTCOffset("Asia/Shanghai")})` },
    { value: "Asia/Urumqi", label: `Урумчи (${getUTCOffset("Asia/Urumqi")})` },
    { value: "America/Bogota", label: `Богота (${getUTCOffset("America/Bogota")})` },
  { value: "America/Costa_Rica", label: `Коста-Рика (${getUTCOffset("America/Costa_Rica")})` },
  { value: "America/Havana", label: `Гавана (${getUTCOffset("America/Havana")})` },
  { value: "Atlantic/Cape_Verde", label: `Кабо-Верде (${getUTCOffset("Atlantic/Cape_Verde")})` },
  { value: "America/Curacao", label: `Кюрасао (${getUTCOffset("America/Curacao")})` },
  { value: "Indian/Christmas", label: `Остров Рождества (${getUTCOffset("Indian/Christmas")})` },
  { value: "Asia/Nicosia", label: `Никосия (${getUTCOffset("Asia/Nicosia")})` },
  { value: "Asia/Famagusta", label: `Фамагуста (${getUTCOffset("Asia/Famagusta")})` },
  { value: "Europe/Prague", label: `Прага (${getUTCOffset("Europe/Prague")})` },
  { value: "Europe/Berlin", label: `Берлин (${getUTCOffset("Europe/Berlin")})` },
  { value: "Europe/Copenhagen", label: `Копенгаген (${getUTCOffset("Europe/Copenhagen")})` },
  { value: "America/Santo_Domingo", label: `Санто-Доминго (${getUTCOffset("America/Santo_Domingo")})` },
  { value: "Africa/Algiers", label: `Алжир (${getUTCOffset("Africa/Algiers")})` },
  { value: "America/Guayaquil", label: `Гуаякиль (${getUTCOffset("America/Guayaquil")})` },
  { value: "Pacific/Galapagos", label: `Галапагосские острова (${getUTCOffset("Pacific/Galapagos")})` },
  { value: "Europe/Tallinn", label: `Таллин (${getUTCOffset("Europe/Tallinn")})` },
  { value: "Africa/Cairo", label: `Каир (${getUTCOffset("Africa/Cairo")})` },
  { value: "Africa/El_Aaiun", label: `Эль-Аюн (${getUTCOffset("Africa/El_Aaiun")})` },
  { value: "Europe/Madrid", label: `Мадрид (${getUTCOffset("Europe/Madrid")})` },
  { value: "Africa/Ceuta", label: `Сеута (${getUTCOffset("Africa/Ceuta")})` },
  { value: "Atlantic/Canary", label: `Канарские острова (${getUTCOffset("Atlantic/Canary")})` },
  { value: "Europe/Helsinki", label: `Хельсинки (${getUTCOffset("Europe/Helsinki")})` },
  { value: "Pacific/Fiji", label: `Фиджи (${getUTCOffset("Pacific/Fiji")})` },
  { value: "Atlantic/Stanley", label: `Стэнли (${getUTCOffset("Atlantic/Stanley")})` },
  { value: "Pacific/Chuuk", label: `Чуук (${getUTCOffset("Pacific/Chuuk")})` },
  { value: "Pacific/Pohnpei", label: `Понпеи (${getUTCOffset("Pacific/Pohnpei")})` },
  { value: "Pacific/Kosrae", label: `Косраэ (${getUTCOffset("Pacific/Kosrae")})` },
  { value: "Atlantic/Faroe", label: `Фарерские острова (${getUTCOffset("Atlantic/Faroe")})` },
  { value: "Europe/Paris", label: `Париж (${getUTCOffset("Europe/Paris")})` },
  { value: "Europe/London", label: `Лондон (${getUTCOffset("Europe/London")})` },
  { value: "Asia/Tbilisi", label: `Тбилиси (${getUTCOffset("Asia/Tbilisi")})` },
  { value: "America/Cayenne", label: `Кайенна (${getUTCOffset("America/Cayenne")})` },
  { value: "Africa/Accra", label: `Аккра (${getUTCOffset("Africa/Accra")})` },
  { value: "Europe/Gibraltar", label: `Гибралтар (${getUTCOffset("Europe/Gibraltar")})` },
  { value: "America/Godthab", label: `Готхоб (${getUTCOffset("America/Godthab")})` },
  { value: "America/Danmarkshavn", label: `Данмарксхавн (${getUTCOffset("America/Danmarkshavn")})` },
  { value: "America/Scoresbysund", label: `Скоресбисунн (${getUTCOffset("America/Scoresbysund")})` },
  { value: "America/Thule", label: `Туле (${getUTCOffset("America/Thule")})` },
  { value: "Europe/Athens", label: `Афины (${getUTCOffset("Europe/Athens")})` },
  { value: "Atlantic/South_Georgia", label: `Южная Георгия (${getUTCOffset("Atlantic/South_Georgia")})` },
  { value: "America/Guatemala", label: `Гватемала (${getUTCOffset("America/Guatemala")})` },
  { value: "Pacific/Guam", label: `Гуам (${getUTCOffset("Pacific/Guam")})` },
  { value: "Africa/Bissau", label: `Бисау (${getUTCOffset("Africa/Bissau")})` },
  { value: "America/Guyana", label: `Гайана (${getUTCOffset("America/Guyana")})` },
  { value: "Asia/Hong_Kong", label: `Гонконг (${getUTCOffset("Asia/Hong_Kong")})` },
  { value: "America/Tegucigalpa", label: `Тегусигальпа (${getUTCOffset("America/Tegucigalpa")})` },
  { value: "America/Port-au-Prince", label: `Порт-о-Пренс (${getUTCOffset("America/Port-au-Prince")})` },
  { value: "Europe/Budapest", label: `Будапешт (${getUTCOffset("Europe/Budapest")})` },
  { value: "Asia/Jakarta", label: `Джакарта (${getUTCOffset("Asia/Jakarta")})` },
  { value: "Asia/Pontianak", label: `Понтианак (${getUTCOffset("Asia/Pontianak")})` },
  { value: "Asia/Makassar", label: `Макассар (${getUTCOffset("Asia/Makassar")})` },
  { value: "Asia/Jayapura", label: `Джаяпура (${getUTCOffset("Asia/Jayapura")})` },
  { value: "Europe/Dublin", label: `Дублин (${getUTCOffset("Europe/Dublin")})` },
  { value: "Asia/Jerusalem", label: `Иерусалим (${getUTCOffset("Asia/Jerusalem")})` },
  { value: "Asia/Kolkata", label: `Калькутта (${getUTCOffset("Asia/Kolkata")})` },
  { value: "Indian/Chagos", label: `Чагос (${getUTCOffset("Indian/Chagos")})` },
  { value: "Asia/Baghdad", label: `Багдад (${getUTCOffset("Asia/Baghdad")})` },
  { value: "Asia/Tehran", label: `Тегеран (${getUTCOffset("Asia/Tehran")})` },
  { value: "Atlantic/Reykjavik", label: `Рейкьявик (${getUTCOffset("Atlantic/Reykjavik")})` },
  { value: "Europe/Rome", label: `Рим (${getUTCOffset("Europe/Rome")})` },
  { value: "America/Jamaica", label: `Ямайка (${getUTCOffset("America/Jamaica")})` },
  { value: "Asia/Amman", label: `Амман (${getUTCOffset("Asia/Amman")})` },
  { value: "Asia/Tokyo", label: `Токио (${getUTCOffset("Asia/Tokyo")})` },
  { value: "Africa/Nairobi", label: `Найроби (${getUTCOffset("Africa/Nairobi")})` },
  { value: "Asia/Bishkek", label: `Бишкек (${getUTCOffset("Asia/Bishkek")})` },
  { value: "Pacific/Tarawa", label: `Тарава (${getUTCOffset("Pacific/Tarawa")})` },
  { value: "Pacific/Enderbury", label: `Эндербери (${getUTCOffset("Pacific/Enderbury")})` },
  { value: "Pacific/Kiritimati", label: `Киритимати (${getUTCOffset("Pacific/Kiritimati")})` },
  { value: "Asia/Pyongyang", label: `Пхеньян (${getUTCOffset("Asia/Pyongyang")})` },
  { value: "Asia/Seoul", label: `Сеул (${getUTCOffset("Asia/Seoul")})` },
  { value: "Asia/Almaty", label: `Алматы (${getUTCOffset("Asia/Almaty")})` },
  { value: "Asia/Qyzylorda", label: `Кызылорда (${getUTCOffset("Asia/Qyzylorda")})` },
  { value: "Asia/Qostanay", label: `Костанай (${getUTCOffset("Asia/Qostanay")})` },
  { value: "Asia/Aqtobe", label: `Актобе (${getUTCOffset("Asia/Aqtobe")})` },
  { value: "Asia/Aqtau", label: `Актау (${getUTCOffset("Asia/Aqtau")})` },
  { value: "Asia/Atyrau", label: `Атырау (${getUTCOffset("Asia/Atyrau")})` },
  { value: "Asia/Oral", label: `Орал (${getUTCOffset("Asia/Oral")})` },
  { value: "Asia/Beirut", label: `Бейрут (${getUTCOffset("Asia/Beirut")})` },
  { value: "Asia/Colombo", label: `Коломбо (${getUTCOffset("Asia/Colombo")})` },
  { value: "Africa/Monrovia", label: `Монровия (${getUTCOffset("Africa/Monrovia")})` },
  { value: "America/Santo_Domingo", label: `Санто-Доминго (${getUTCOffset("America/Santo_Domingo")})` },
  { value: "Africa/Algiers", label: `Алжир (${getUTCOffset("Africa/Algiers")})` },
  { value: "America/Guayaquil", label: `Гуаякиль (${getUTCOffset("America/Guayaquil")})` },
  { value: "Pacific/Galapagos", label: `Галапагос (${getUTCOffset("Pacific/Galapagos")})` },
  { value: "Europe/Tallinn", label: `Таллин (${getUTCOffset("Europe/Tallinn")})` },
  { value: "Africa/Cairo", label: `Каир (${getUTCOffset("Africa/Cairo")})` },
  { value: "Africa/El_Aaiun", label: `Эль-Аайун (${getUTCOffset("Africa/El_Aaiun")})` },
  { value: "Europe/Madrid", label: `Мадрид (${getUTCOffset("Europe/Madrid")})` },
  { value: "Africa/Ceuta", label: `Сеута (${getUTCOffset("Africa/Ceuta")})` },
  { value: "Atlantic/Canary", label: `Канарские острова (${getUTCOffset("Atlantic/Canary")})` },
  { value: "Europe/Helsinki", label: `Хельсинки (${getUTCOffset("Europe/Helsinki")})` },
  { value: "Pacific/Fiji", label: `Фиджи (${getUTCOffset("Pacific/Fiji")})` },
  { value: "Atlantic/Stanley", label: `Стэнли (${getUTCOffset("Atlantic/Stanley")})` },
  { value: "Pacific/Chuuk", label: `Чуук (${getUTCOffset("Pacific/Chuuk")})` },
  { value: "Pacific/Pohnpei", label: `Понпеи (${getUTCOffset("Pacific/Pohnpei")})` },
  { value: "Pacific/Kosrae", label: `Косраэ (${getUTCOffset("Pacific/Kosrae")})` },
  { value: "Atlantic/Faroe", label: `Фарерские острова (${getUTCOffset("Atlantic/Faroe")})` },
  { value: "Europe/Paris", label: `Париж (${getUTCOffset("Europe/Paris")})` },
  { value: "Europe/London", label: `Лондон (${getUTCOffset("Europe/London")})` },
  { value: "Asia/Tbilisi", label: `Тбилиси (${getUTCOffset("Asia/Tbilisi")})` },
  { value: "America/Cayenne", label: `Кайенна (${getUTCOffset("America/Cayenne")})` },
  { value: "Africa/Accra", label: `Аккра (${getUTCOffset("Africa/Accra")})` },
  { value: "Europe/Gibraltar", label: `Гибралтар (${getUTCOffset("Europe/Gibraltar")})` },
  { value: "America/Godthab", label: `Годтхаб (${getUTCOffset("America/Godthab")})` },
  { value: "America/Danmarkshavn", label: `Данмарксхавн (${getUTCOffset("America/Danmarkshavn")})` },
  { value: "America/Scoresbysund", label: `Скорсбисун (${getUTCOffset("America/Scoresbysund")})` },
  { value: "America/Thule", label: `Туле (${getUTCOffset("America/Thule")})` },
  { value: "Europe/Athens", label: `Афины (${getUTCOffset("Europe/Athens")})` },
  { value: "Atlantic/South_Georgia", label: `Южная Георгия (${getUTCOffset("Atlantic/South_Georgia")})` },
  { value: "America/Guatemala", label: `Гватемала (${getUTCOffset("America/Guatemala")})` },
  { value: "Pacific/Guam", label: `Гуам (${getUTCOffset("Pacific/Guam")})` },
  { value: "Africa/Bissau", label: `Бисау (${getUTCOffset("Africa/Bissau")})` },
  { value: "America/Guyana", label: `Гайана (${getUTCOffset("America/Guyana")})` },
  { value: "Asia/Hong_Kong", label: `Гонконг (${getUTCOffset("Asia/Hong_Kong")})` },
  { value: "America/Tegucigalpa", label: `Тегусигальпа (${getUTCOffset("America/Tegucigalpa")})` },
  { value: "America/Port-au-Prince", label: `Порт-о-Пренс (${getUTCOffset("America/Port-au-Prince")})` },
  { value: "Europe/Budapest", label: `Будапешт (${getUTCOffset("Europe/Budapest")})` },
  { value: "Asia/Jakarta", label: `Джакарта (${getUTCOffset("Asia/Jakarta")})` },
  { value: "Asia/Pontianak", label: `Понтианак (${getUTCOffset("Asia/Pontianak")})` },
  { value: "Asia/Makassar", label: `Макассар (${getUTCOffset("Asia/Makassar")})` },
  { value: "Asia/Jayapura", label: `Джаяпура (${getUTCOffset("Asia/Jayapura")})` },
  { value: "Europe/Dublin", label: `Дублин (${getUTCOffset("Europe/Dublin")})` },
  { value: "Asia/Jerusalem", label: `Иерусалим (${getUTCOffset("Asia/Jerusalem")})` },
  { value: "Asia/Kolkata", label: `Калькутта (${getUTCOffset("Asia/Kolkata")})` },
  { value: "Indian/Chagos", label: `Чагос (${getUTCOffset("Indian/Chagos")})` },
  { value: "Asia/Baghdad", label: `Багдад (${getUTCOffset("Asia/Baghdad")})` },
  { value: "Asia/Tehran", label: `Тегеран (${getUTCOffset("Asia/Tehran")})` },
  { value: "Atlantic/Reykjavik", label: `Рейкьявик (${getUTCOffset("Atlantic/Reykjavik")})` },
  { value: "Europe/Rome", label: `Рим (${getUTCOffset("Europe/Rome")})` },
  { value: "America/Jamaica", label: `Ямайка (${getUTCOffset("America/Jamaica")})` },
  { value: "Asia/Amman", label: `Амман (${getUTCOffset("Asia/Amman")})` },
  { value: "Asia/Tokyo", label: `Токио (${getUTCOffset("Asia/Tokyo")})` },
  { value: "Africa/Nairobi", label: `Найроби (${getUTCOffset("Africa/Nairobi")})` },
  { value: "Asia/Bishkek", label: `Бишкек (${getUTCOffset("Asia/Bishkek")})` },
  { value: "Pacific/Tarawa", label: `Тарава (${getUTCOffset("Pacific/Tarawa")})` },
  { value: "Pacific/Enderbury", label: `Эндербери (${getUTCOffset("Pacific/Enderbury")})` },
  { value: "Pacific/Kiritimati", label: `Киритимати (${getUTCOffset("Pacific/Kiritimati")})` },
  { value: "Asia/Pyongyang", label: `Пхеньян (${getUTCOffset("Asia/Pyongyang")})` },
  { value: "Asia/Seoul", label: `Сеул (${getUTCOffset("Asia/Seoul")})` },
  { value: "Asia/Almaty", label: `Алматы (${getUTCOffset("Asia/Almaty")})` },
  { value: "Asia/Qyzylorda", label: `Кызылорда (${getUTCOffset("Asia/Qyzylorda")})` },
  { value: "Asia/Qostanay", label: `Костанай (${getUTCOffset("Asia/Qostanay")})` },
  { value: "Asia/Aqtobe", label: `Актобе (${getUTCOffset("Asia/Aqtobe")})` },
  { value: "Asia/Aqtau", label: `Актау (${getUTCOffset("Asia/Aqtau")})` },
  { value: "Asia/Atyrau", label: `Атырау (${getUTCOffset("Asia/Atyrau")})` },
  { value: "Asia/Oral", label: `Орал (${getUTCOffset("Asia/Oral")})` },
    { value: "Asia/Beirut", label: "Бейрут" },
    { value: "Asia/Colombo", label: "Коломбо" },
    { value: "Africa/Monrovia", label: "Монровия" },
  { value: "Europe/Vilnius", label: `Вильнюс (${getUTCOffset("Europe/Vilnius")})` },
  { value: "Europe/Luxembourg", label: `Люксембург (${getUTCOffset("Europe/Luxembourg")})` },
  { value: "Europe/Riga", label: `Рига (${getUTCOffset("Europe/Riga")})` },
  { value: "Africa/Tripoli", label: `Триполи (${getUTCOffset("Africa/Tripoli")})` },
  { value: "Africa/Casablanca", label: `Касабланка (${getUTCOffset("Africa/Casablanca")})` },
  { value: "Europe/Monaco", label: `Монако (${getUTCOffset("Europe/Monaco")})` },
  { value: "Europe/Chisinau", label: `Кишинев (${getUTCOffset("Europe/Chisinau")})` },
  { value: "Pacific/Majuro", label: `Маджуро (${getUTCOffset("Pacific/Majuro")})` },
  { value: "Pacific/Kwajalein", label: `Кваджалейн (${getUTCOffset("Pacific/Kwajalein")})` },
  { value: "Asia/Yangon", label: `Янгон (${getUTCOffset("Asia/Yangon")})` },
  { value: "Asia/Ulaanbaatar", label: `Улан-Батор (${getUTCOffset("Asia/Ulaanbaatar")})` },
  { value: "Asia/Hovd", label: `Ховд (${getUTCOffset("Asia/Hovd")})` },
  { value: "Asia/Choibalsan", label: `Чойбалсан (${getUTCOffset("Asia/Choibalsan")})` },
  { value: "Asia/Macau", label: `Макао (${getUTCOffset("Asia/Macau")})` },
  { value: "America/Martinique", label: `Мартиника (${getUTCOffset("America/Martinique")})` },
  { value: "Europe/Malta", label: `Мальта (${getUTCOffset("Europe/Malta")})` },
  { value: "Indian/Mauritius", label: `Маврикий (${getUTCOffset("Indian/Mauritius")})` },
  { value: "Indian/Maldives", label: `Мальдивы (${getUTCOffset("Indian/Maldives")})` },
  { value: "America/Mexico_City", label: `Мехико (${getUTCOffset("America/Mexico_City")})` },
  { value: "America/Cancun", label: `Канкун (${getUTCOffset("America/Cancun")})` },
  { value: "America/Merida", label: `Мерида (${getUTCOffset("America/Merida")})` },
  { value: "America/Monterrey", label: `Монтеррей (${getUTCOffset("America/Monterrey")})` },
  { value: "America/Matamoros", label: `Матаморос (${getUTCOffset("America/Matamoros")})` },
  { value: "America/Mazatlan", label: `Мазатлан (${getUTCOffset("America/Mazatlan")})` },
  { value: "America/Chihuahua", label: `Чиуауа (${getUTCOffset("America/Chihuahua")})` },
  { value: "America/Ojinaga", label: `Охинага (${getUTCOffset("America/Ojinaga")})` },
  { value: "America/Hermosillo", label: `Эрмосильо (${getUTCOffset("America/Hermosillo")})` },
  { value: "America/Tijuana", label: `Тихуана (${getUTCOffset("America/Tijuana")})` },
  { value: "America/Bahia_Banderas", label: `Бахия-Бандерас (${getUTCOffset("America/Bahia_Banderas")})` },
  { value: "Asia/Kuala_Lumpur", label: `Куала-Лумпур (${getUTCOffset("Asia/Kuala_Lumpur")})` },
  { value: "Asia/Kuching", label: `Кучинг (${getUTCOffset("Asia/Kuching")})` },
  { value: "Africa/Maputo", label: `Мапут (${getUTCOffset("Africa/Maputo")})` },
  { value: "Africa/Windhoek", label: `Виндхук (${getUTCOffset("Africa/Windhoek")})` },
  { value: "Pacific/Noumea", label: `Нумеа (${getUTCOffset("Pacific/Noumea")})` },
  { value: "Pacific/Norfolk", label: `Норфолк (${getUTCOffset("Pacific/Norfolk")})` },
  { value: "Africa/Lagos", label: `Лагос (${getUTCOffset("Africa/Lagos")})` },
  { value: "America/Managua", label: `Манагуа (${getUTCOffset("America/Managua")})` },
  { value: "Europe/Amsterdam", label: `Амстердам (${getUTCOffset("Europe/Amsterdam")})` },
  { value: "Europe/Oslo", label: `Осло (${getUTCOffset("Europe/Oslo")})` },
  { value: "Asia/Kathmandu", label: `Катманду (${getUTCOffset("Asia/Kathmandu")})` },
  { value: "Pacific/Nauru", label: `Науру (${getUTCOffset("Pacific/Nauru")})` },
  { value: "Pacific/Niue", label: `Ниуэ (${getUTCOffset("Pacific/Niue")})` },
  { value: "Pacific/Auckland", label: `Окленд (${getUTCOffset("Pacific/Auckland")})` },
  { value: "Pacific/Chatham", label: `Чатем (${getUTCOffset("Pacific/Chatham")})` },
  { value: "America/Panama", label: `Панама (${getUTCOffset("America/Panama")})` },
  { value: "America/Lima", label: `Лима (${getUTCOffset("America/Lima")})` },
  { value: "Pacific/Tahiti", label: `Таити (${getUTCOffset("Pacific/Tahiti")})` },
  { value: "Pacific/Marquesas", label: `Маркизские острова (${getUTCOffset("Pacific/Marquesas")})` },
  { value: "Pacific/Gambier", label: `Гамбиер (${getUTCOffset("Pacific/Gambier")})` },
  { value: "Pacific/Port_Moresby", label: `Порт-Морсби (${getUTCOffset("Pacific/Port_Moresby")})` },
  { value: "Pacific/Bougainville", label: `Бука (${getUTCOffset("Pacific/Bougainville")})` },
  { value: "Asia/Manila", label: `Манила (${getUTCOffset("Asia/Manila")})` },
  { value: "Asia/Karachi", label: `Карачи (${getUTCOffset("Asia/Karachi")})` },
  { value: "Europe/Warsaw", label: `Варшава (${getUTCOffset("Europe/Warsaw")})` },
  { value: "America/Miquelon", label: `Микелон (${getUTCOffset("America/Miquelon")})` },
  { value: "Pacific/Pitcairn", label: `Питкерн (${getUTCOffset("Pacific/Pitcairn")})` },
  { value: "America/Puerto_Rico", label: `Пуэрто-Рико (${getUTCOffset("America/Puerto_Rico")})` },
  { value: "Asia/Gaza", label: `Газа (${getUTCOffset("Asia/Gaza")})` },
  { value: "Asia/Hebron", label: `Хеврон (${getUTCOffset("Asia/Hebron")})` },
  { value: "Europe/Lisbon", label: `Лиссабон (${getUTCOffset("Europe/Lisbon")})` },
  { value: "Atlantic/Madeira", label: `Мадейра (${getUTCOffset("Atlantic/Madeira")})` },
  { value: "Atlantic/Azores", label: `Азорские острова (${getUTCOffset("Atlantic/Azores")})` },
  { value: "Pacific/Palau", label: `Палау (${getUTCOffset("Pacific/Palau")})` },
  { value: "America/Asuncion", label: `Асунсьон (${getUTCOffset("America/Asuncion")})` },
  { value: "Asia/Qatar", label: `Катар (${getUTCOffset("Asia/Qatar")})` },
  { value: "Indian/Reunion", label: `Реюньон (${getUTCOffset("Indian/Reunion")})` },
  { value: "Europe/Bucharest", label: `Бухарест (${getUTCOffset("Europe/Bucharest")})` },
  { value: "Europe/Belgrade", label: `Белград (${getUTCOffset("Europe/Belgrade")})` },
  { value: "Europe/Kaliningrad", label: `Калининград (${getUTCOffset("Europe/Kaliningrad")})` },
  { value: "Europe/Moscow", label: `Москва (${getUTCOffset("Europe/Moscow")})` },
  { value: "Europe/Simferopol", label: `Симферополь (${getUTCOffset("Europe/Simferopol")})` },
  { value: "Europe/Kirov", label: `Киров (${getUTCOffset("Europe/Kirov")})` },
  { value: "Europe/Astrakhan", label: `Астрахань (${getUTCOffset("Europe/Astrakhan")})` },
  { value: "Europe/Volgograd", label: `Волгоград (${getUTCOffset("Europe/Volgograd")})` },
  { value: "Europe/Saratov", label: `Саратов (${getUTCOffset("Europe/Saratov")})` },
  { value: "Europe/Ulyanovsk", label: `Ульяновск (${getUTCOffset("Europe/Ulyanovsk")})` },
  { value: "Europe/Samara", label: `Самара (${getUTCOffset("Europe/Samara")})` },
  { value: "Asia/Yekaterinburg", label: `Екатеринбург (${getUTCOffset("Asia/Yekaterinburg")})` },
  { value: "Asia/Omsk", label: `Омск (${getUTCOffset("Asia/Omsk")})` },
  { value: "Asia/Novosibirsk", label: `Новосибирск (${getUTCOffset("Asia/Novosibirsk")})` },
  { value: "Asia/Barnaul", label: `Барнаул (${getUTCOffset("Asia/Barnaul")})` },
  { value: "Asia/Tomsk", label: `Томск (${getUTCOffset("Asia/Tomsk")})` },
  { value: "Asia/Novokuznetsk", label: `Новокузнецк (${getUTCOffset("Asia/Novokuznetsk")})` },
  { value: "Asia/Krasnoyarsk", label: `Красноярск (${getUTCOffset("Asia/Krasnoyarsk")})` },
  { value: "Asia/Irkutsk", label: `Иркутск (${getUTCOffset("Asia/Irkutsk")})` },
  { value: "Asia/Chita", label: `Чита (${getUTCOffset("Asia/Chita")})` },
  { value: "Asia/Yakutsk", label: `Якутск (${getUTCOffset("Asia/Yakutsk")})` },
  { value: "Asia/Khandyga", label: `Хандыга (${getUTCOffset("Asia/Khandyga")})` },
  { value: "Asia/Vladivostok", label: `Владивосток (${getUTCOffset("Asia/Vladivostok")})` },
  { value: "Asia/Ust-Nera", label: `Усть-Нера (${getUTCOffset("Asia/Ust-Nera")})` },
  { value: "Asia/Magadan", label: `Магадан (${getUTCOffset("Asia/Magadan")})` },
  { value: "Asia/Sakhalin", label: `Сахалин (${getUTCOffset("Asia/Sakhalin")})` },
  { value: "Asia/Srednekolymsk", label: `Среднеколымск (${getUTCOffset("Asia/Srednekolymsk")})` },
  { value: "Asia/Kamchatka", label: `Камчатка (${getUTCOffset("Asia/Kamchatka")})` },
  { value: "Asia/Anadyr", label: `Анадырь (${getUTCOffset("Asia/Anadyr")})` },
  { value: "Asia/Riyadh", label: `Эр-Рияд (${getUTCOffset("Asia/Riyadh")})` },
  { value: "Pacific/Guadalcanal", label: `Гуадалканал (${getUTCOffset("Pacific/Guadalcanal")})` },
  { value: "Indian/Mahe", label: `Махе (${getUTCOffset("Indian/Mahe")})` },
  { value: "Africa/Khartoum", label: `Хартум (${getUTCOffset("Africa/Khartoum")})` },
  { value: "Europe/Stockholm", label: `Стокгольм (${getUTCOffset("Europe/Stockholm")})` },
  { value: "Asia/Singapore", label: `Сингапур (${getUTCOffset("Asia/Singapore")})` },
  { value: "America/Paramaribo", label: `Парамарибо (${getUTCOffset("America/Paramaribo")})` },
  { value: "Africa/Juba", label: `Джуба (${getUTCOffset("Africa/Juba")})` },
  { value: "Africa/Sao_Tome", label: `Сан-Томе (${getUTCOffset("Africa/Sao_Tome")})` },
  { value: "America/El_Salvador", label: `Эль-Сальвадор (${getUTCOffset("America/El_Salvador")})` },
  { value: "Asia/Damascus", label: `Дамаск (${getUTCOffset("Asia/Damascus")})` },
  { value: "America/Grand_Turk", label: `Гранд-Терк (${getUTCOffset("America/Grand_Turk")})` },
  { value: "Africa/Ndjamena", label: `Нджамена (${getUTCOffset("Africa/Ndjamena")})` },
  { value: "Indian/Kerguelen", label: `Кергелен (${getUTCOffset("Indian/Kerguelen")})` },
  { value: "Asia/Bangkok", label: `Бангкок (${getUTCOffset("Asia/Bangkok")})` },
  { value: "Asia/Dushanbe", label: `Душанбе (${getUTCOffset("Asia/Dushanbe")})` },
  { value: "Pacific/Fakaofo", label: `Факаофо (${getUTCOffset("Pacific/Fakaofo")})` },
  { value: "Asia/Dili", label: `Дили (${getUTCOffset("Asia/Dili")})` },
  { value: "Asia/Ashgabat", label: `Ашхабад (${getUTCOffset("Asia/Ashgabat")})` },
  { value: "Africa/Tunis", label: `Тунис (${getUTCOffset("Africa/Tunis")})` },
  { value: "Pacific/Tongatapu", label: `Тонгатапу (${getUTCOffset("Pacific/Tongatapu")})` },
  { value: "Europe/Istanbul", label: `Стамбул (${getUTCOffset("Europe/Istanbul")})` },
  { value: "America/Port_of_Spain", label: `Порт-оф-Спейн (${getUTCOffset("America/Port_of_Spain")})` },
  { value: "Pacific/Funafuti", label: `Фунафути (${getUTCOffset("Pacific/Funafuti")})` },
  { value: "Asia/Taipei", label: `Тайбэй (${getUTCOffset("Asia/Taipei")})` },
  { value: "Europe/Kiev", label: `Киев (${getUTCOffset("Europe/Kiev")})` },
  { value: "Europe/Uzhgorod", label: `Ужгород (${getUTCOffset("Europe/Uzhgorod")})` },
  { value: "Europe/Zaporozhye", label: `Запорожье (${getUTCOffset("Europe/Zaporozhye")})` },
  { value: "Pacific/Wake", label: `Уэйк (${getUTCOffset("Pacific/Wake")})` },
  { value: "America/New_York", label: `Нью-Йорк (${getUTCOffset("America/New_York")})` },
  { value: "America/Detroit", label: `Детройт (${getUTCOffset("America/Detroit")})` },
  { value: "America/Kentucky/Louisville", label: `Луисвилл (${getUTCOffset("America/Kentucky/Louisville")})` },
  { value: "America/Kentucky/Monticello", label: `Монтсельо (${getUTCOffset("America/Kentucky/Monticello")})` },
  { value: "America/Indiana/Indianapolis", label: `Индианаполис (${getUTCOffset("America/Indiana/Indianapolis")})` },
  { value: "America/Indiana/Vincennes", label: `Винсеннес (${getUTCOffset("America/Indiana/Vincennes")})` },
  { value: "America/Indiana/Winamac", label: `Винамак (${getUTCOffset("America/Indiana/Winamac")})` },
  { value: "America/Indiana/Marengo", label: `Маренго (${getUTCOffset("America/Indiana/Marengo")})` },
  { value: "America/Indiana/Petersburg", label: `Петерсбург (${getUTCOffset("America/Indiana/Petersburg")})` },
  { value: "America/Indiana/Vevay", label: `Вевей (${getUTCOffset("America/Indiana/Vevay")})` },
  { value: "America/Chicago", label: `Чикаго (${getUTCOffset("America/Chicago")})` },
  { value: "America/Indiana/Tell_City", label: `Телл-Сити (${getUTCOffset("America/Indiana/Tell_City")})` },
  { value: "America/Indiana/Knox", label: `Кнокса (${getUTCOffset("America/Indiana/Knox")})` },
  { value: "America/Menominee", label: `Меномини (${getUTCOffset("America/Menominee")})` },
  { value: "America/North_Dakota/Center", label: `Центр (${getUTCOffset("America/North_Dakota/Center")})` },
  { value: "America/North_Dakota/New_Salem", label: `Нью-Салем (${getUTCOffset("America/North_Dakota/New_Salem")})` },
  { value: "America/North_Dakota/Beulah", label: `Бьюла (${getUTCOffset("America/North_Dakota/Beulah")})` },
  { value: "America/Denver", label: `Денвер (${getUTCOffset("America/Denver")})` },
  { value: "America/Boise", label: `Бойсе (${getUTCOffset("America/Boise")})` },
  { value: "America/Phoenix", label: `Финикс (${getUTCOffset("America/Phoenix")})` },
  { value: "America/Los_Angeles", label: `Лос-Анджелес (${getUTCOffset("America/Los_Angeles")})` },
  { value: "America/Anchorage", label: `Анкоридж (${getUTCOffset("America/Anchorage")})` },
  { value: "America/Juneau", label: `Джунейо (${getUTCOffset("America/Juneau")})` },
  { value: "America/Sitka", label: `Ситка (${getUTCOffset("America/Sitka")})` },
  { value: "America/Metlakatla", label: `Метлакатла (${getUTCOffset("America/Metlakatla")})` },
  { value: "America/Yakutat", label: `Якутат (${getUTCOffset("America/Yakutat")})` },
  { value: "America/Nome", label: `Ном (${getUTCOffset("America/Nome")})` },
  { value: "America/Adak", label: `Адак (${getUTCOffset("America/Adak")})` },
  { value: "Pacific/Honolulu", label: `Гонолулу (${getUTCOffset("Pacific/Honolulu")})` },
  { value: "America/Montevideo", label: `Монтевидео (${getUTCOffset("America/Montevideo")})` },
  { value: "Asia/Samarkand", label: `Самарканд (${getUTCOffset("Asia/Samarkand")})` },
  { value: "Asia/Tashkent", label: `Ташкент (${getUTCOffset("Asia/Tashkent")})` },
  { value: "America/Caracas", label: `Каракас (${getUTCOffset("America/Caracas")})` },
  { value: "Asia/Ho_Chi_Minh", label: `Хошимин (${getUTCOffset("Asia/Ho_Chi_Minh")})` },
  { value: "Pacific/Efate", label: `Эфате (${getUTCOffset("Pacific/Efate")})` },
  { value: "Pacific/Wallis", label: `Уоллис (${getUTCOffset("Pacific/Wallis")})` },
  { value: "Pacific/Apia", label: `Апиa (${getUTCOffset("Pacific/Apia")})` },
  { value: "Africa/Johannesburg", label: `Йоханнесбург (${getUTCOffset("Africa/Johannesburg")})` },
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

  // Функция для определения пройден ли этап (для зеленого выделения)
  function isStepCompleted(batch: any, step: string) {
    const currentStatus = getBatchStatus(batch);
    const statusOrder = ["Производится", "Произведено", "На холде", "Отправляется", "Отправлена"];
    
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(step);
    
    // Этап считается пройденным, если он находится до текущего статуса или является текущим
    return stepIndex <= currentIndex;
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
                  placeholder=""
                  bind:value={filters.party}
                  class="mobile-filter-input"
                />
              </div>
              
              <div class="mobile-filter-section">
                <label class="mobile-filter-label">Продукт</label>
                <input
                  type="text"
                  placeholder=""
                  bind:value={filters.product}
                  class="mobile-filter-input"
                />
              </div>
              
              <div class="mobile-filter-section">
                <label class="mobile-filter-label">Диапазон дат</label>
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
                  placeholder=""
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
                      <span>Партия 🔍</span>
                    </div>
                    {#if activeSearch === "party"}
                      <div class="th-search-dropdown">
                        <input
                          type="text"
                          placeholder=""
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
                    <span>Продукт 🔍</span>
                  </div>
                  {#if activeSearch === "product"}
                    <div class="th-search-dropdown">
                      <input
                        type="text"
                        placeholder=""
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
                    <span>Статус 🔍</span>
                  </div>
                  {#if activeSearch === "status"}
                    <div class="th-search-dropdown">
                      <input
                        type="text"
                        placeholder=""
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
                          class:completed={isStepCompleted(batch, "Производится")}
                          class:active={getBatchStatus(batch) ===
                            "Производится"}
                        >
                          <div class="flow-circle-mini">1</div>
                          <span>Производится</span>
                        </div>
                        <div class="flow-arrow-mini">→</div>
                        <div
                          class="flow-item-mini"
                          class:completed={isStepCompleted(batch, "Произведено")}
                          class:active={getBatchStatus(batch) === "Произведено"}
                        >
                          <div class="flow-circle-mini">2</div>
                          <span>Произведено</span>
                        </div>
                        <div class="flow-arrow-mini">→</div>
                        <div
                          class="flow-item-mini"
                          class:completed={isStepCompleted(batch, "На холде")}
                          class:active={getBatchStatus(batch) === "На холде"}
                          class:hold={getBatchStatus(batch) === "На холде"}
                        >
                          <div class="flow-circle-mini">3</div>
                          <span>На холде</span>
                        </div>
                        <div class="flow-arrow-mini">→</div>
                        <div
                          class="flow-item-mini"
                          class:completed={isStepCompleted(batch, "Отправляется")}
                          class:active={getBatchStatus(batch) ===
                            "Отправляется"}
                        >
                          <div class="flow-circle-mini">4</div>
                          <span>Отправляется</span>
                        </div>
                        <div class="flow-arrow-mini">→</div>
                        <div
                          class="flow-item-mini"
                          class:completed={isStepCompleted(batch, "Отправлена")}
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

  .flow-item-mini.completed {
    color: #059669;
    font-weight: 600;
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

  /* iPad Pro с большими экранами (12.9") */
  @media (min-width: 1024px) and (max-width: 1400px) {
    .reports-container {
      padding: 3rem;
      max-width: 100%;
    }

    .main-content {
      border-radius: 28px;
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.18);
    }

    .page-header {
      padding: 3rem 4rem;
    }

    .header-content h1 {
      font-size: 3rem;
      font-weight: 900;
      background: linear-gradient(135deg, #1e293b 0%, #3b82f6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .timezone-selector {
      padding: 1.5rem 2.5rem;
      border-radius: 24px;
      min-width: 400px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    .timezone-selector label {
      font-size: 1.2rem;
      font-weight: 700;
    }

    .timezone-selector select {
      font-size: 1.2rem;
      padding: 1.25rem 1.5rem;
      min-height: 60px;
      min-width: 250px;
      max-width: 320px;
      border-radius: 16px;
      border: 3px solid #e2e8f0;
    }

    .table-container {
      margin: 2rem 4rem 3rem 4rem;
      border-radius: 28px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
    }

    .reports-table {
      font-size: 1.2rem;
    }

    .reports-table th {
      padding: 2rem 1.5rem;
      font-size: 1.2rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    }

    .reports-table td {
      padding: 2rem 1.5rem;
      font-size: 1.1rem;
      line-height: 1.8;
      font-weight: 500;
    }

    .deadline-cell {
      min-width: 220px;
      max-width: 260px;
    }

    .time-remaining {
      font-size: 1.1rem;
      font-weight: 800;
    }

    .deadline-date {
      font-size: 1rem;
    }

    .status-badge {
      font-size: 1rem;
      padding: 0.75rem 1.5rem;
      border-radius: 28px;
      font-weight: 700;
      min-width: 140px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .send-btn {
      font-size: 1rem;
      padding: 0.75rem 1.5rem;
      border-radius: 20px;
      font-weight: 700;
      box-shadow: 0 6px 18px rgba(99, 102, 241, 0.4);
    }

    .th-search-input {
      font-size: 1.1rem;
      padding: 1rem 1.25rem 1rem 3.5rem;
      min-height: 56px;
      border-radius: 16px;
      background-size: 2rem;
      border: 3px solid #e2e8f0;
    }

    .date-field {
      font-size: 1.1rem;
      padding: 1rem 1.25rem;
      min-height: 56px;
      border-radius: 16px;
      border: 3px solid #e2e8f0;
    }

    .sort-button {
      padding: 1rem;
      font-size: 1.1rem;
      min-height: 56px;
      min-width: 56px;
      border-radius: 16px;
    }

    .pagination {
      padding: 2.5rem 4rem;
      gap: 1.5rem;
    }

    .pagination button,
    .pagination span {
      padding: 1.25rem 1.5rem;
      font-size: 1.2rem;
      min-width: 60px;
      height: 60px;
      border-radius: 20px;
      font-weight: 700;
    }

    .batch-info-card {
      padding: 2.5rem;
      margin: 2rem 4rem;
      border-radius: 24px;
      border-left: 8px solid #3b82f6;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    .batch-info-header {
      font-size: 1.4rem;
      margin-bottom: 2rem;
      font-weight: 700;
    }

    .process-flow-mini {
      gap: 2rem;
    }

    .flow-item-mini {
      font-size: 1rem;
      gap: 1rem;
      min-width: 120px;
      font-weight: 600;
    }

    .flow-circle-mini {
      width: 48px;
      height: 48px;
      font-size: 1.3rem;
      font-weight: 900;
      border: 3px solid transparent;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .flow-arrow-mini {
      font-size: 1.8rem;
      font-weight: 800;
    }
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
    padding: 0.875rem 0.3rem 0.675rem 2.5rem;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 0.875rem;
    width: 100%;
    outline: none;
    background: #f8fafc
      url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'/%3e%3c/svg%3e")
      no-repeat left 0.75rem center;
    background-size: 1.5rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    color: #1e293b;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .th-search-input:hover {
    border-color: #3b82f6;
    background-color: white;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233b82f6'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'/%3e%3c/svg%3e");
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
  }

  .th-search-input:focus {
    border-color: #3b82f6;
    background-color: white;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233b82f6'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'/%3e%3c/svg%3e");
    box-shadow:
      0 0 0 4px rgba(59, 130, 246, 0.1),
      0 4px 6px -1px rgba(0, 0, 0, 0.1);
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
    padding: 0.75rem 0.75rem 0.75rem 3rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 16px; /* Предотвращает зум на iOS */
    background: white
      url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'/%3e%3c/svg%3e")
      no-repeat left 1rem center;
    background-size: 1.5rem;
    transition: all 0.3s ease;
  }

  .mobile-filter-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    background-color: white;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233b82f6'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'/%3e%3c/svg%3e");
  }

  .mobile-filter-input:hover {
    border-color: #3b82f6;
    background-color: white;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233b82f6'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'/%3e%3c/svg%3e");
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .mobile-filter-input::placeholder {
    color: #94a3b8;
    font-weight: 400;
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

  /* Планшетные стили для iPad Pro/Air - улучшенная версия */
  @media (min-width: 768px) and (max-width: 1024px) {
    .reports-container {
      padding: 2rem;
      max-width: 100%;
    }

    .main-content {
      border-radius: 20px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    }

    .page-header {
      padding: 2rem 2.5rem;
      gap: 2rem;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: nowrap;
      gap: 2rem;
    }

    .header-content h1 {
      font-size: 2.25rem;
      font-weight: 800;
      margin: 0;
    }

    .timezone-selector {
      background: white;
      padding: 1rem 1.5rem;
      border-radius: 16px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      border: 2px solid #e2e8f0;
      min-width: 300px;
    }

    .timezone-selector label {
      font-size: 1rem;
      font-weight: 600;
      color: #374151;
    }

    .timezone-selector select {
      font-size: 1rem;
      padding: 0.875rem 1rem;
      min-height: 48px;
      border-radius: 12px;
      border: 2px solid #e2e8f0;
      min-width: 200px;
      max-width: 250px;
    }

    .table-container {
      border-radius: 20px;
      overflow: hidden;
      margin: 1rem 2rem 2rem 2rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    }

    .reports-table {
      font-size: 1rem;
      min-width: 100%;
      table-layout: auto;
    }

    .reports-table th {
      padding: 1.25rem 1rem;
      font-size: 1rem;
      font-weight: 700;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .reports-table td {
      padding: 1.25rem 1rem;
      font-size: 0.95rem;
      font-weight: 500;
      line-height: 1.5;
    }

    /* Оптимизируем ширину колонок для iPad */
    .reports-table th:nth-child(1) { width: 12%; } /* Партия */
    .reports-table th:nth-child(2) { width: 12%; } /* Продукт */
    .reports-table th:nth-child(3) { width: 15%; } /* Дата производства */
    .reports-table th:nth-child(4) { width: 15%; } /* Дата срока годности */
    .reports-table th:nth-child(5) { width: 12%; } /* Произведено */
    .reports-table th:nth-child(6) { width: 12%; } /* Данные ВетИС */
    .reports-table th:nth-child(7) { width: 10%; } /* Разница */
    .reports-table th:nth-child(8) { width: 12%; } /* До отправки */
    .reports-table th:nth-child(9) { width: 10%; } /* Статус */

    .deadline-cell {
      min-width: 160px;
      max-width: 200px;
    }

    .time-remaining {
      font-size: 0.9rem;
      font-weight: 700;
    }

    .deadline-date {
      font-size: 0.8rem;
      opacity: 0.8;
    }

    .status-badge {
      font-size: 0.8rem;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 600;
      min-width: 100px;
    }

    .send-btn {
      font-size: 0.8rem;
      padding: 0.5rem 1rem;
      border-radius: 12px;
      font-weight: 600;
    }

    .th-search-input {
      font-size: 1rem;
      padding: 0.875rem 1rem 0.875rem 3rem;
      min-height: 48px;
      border-radius: 12px;
      background-size: 1.75rem;
    }

    .date-field {
      font-size: 1rem;
      padding: 0.875rem 1rem;
      min-height: 48px;
      border-radius: 12px;
    }

    .sort-button {
      padding: 0.875rem;
      font-size: 1rem;
      min-height: 48px;
      min-width: 48px;
      border-radius: 12px;
    }

    .clear-icon {
      width: 24px;
      height: 24px;
      font-size: 12px;
    }

    /* Улучшенная пагинация для iPad */
    .pagination {
      padding: 1.5rem 2rem;
      gap: 1rem;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    }

    .pagination button,
    .pagination span {
      padding: 0.75rem 1rem;
      font-size: 1rem;
      min-width: 48px;
      height: 48px;
      border-radius: 12px;
    }

    /* Детали партии для iPad */
    .batch-info-card {
      padding: 1.5rem;
      margin: 1rem 2rem;
      border-radius: 16px;
      border-left: 4px solid #3b82f6;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }

    .batch-info-header {
      font-size: 1rem;
      margin-bottom: 1rem;
    }

    .process-flow-mini {
      gap: 1rem;
      justify-content: center;
      flex-wrap: nowrap;
    }

    .flow-item-mini {
      font-size: 0.8rem;
      gap: 0.5rem;
      min-width: 80px;
      text-align: center;
    }

    .flow-circle-mini {
      width: 32px;
      height: 32px;
      font-size: 0.9rem;
      font-weight: 700;
      border: 2px solid transparent;
    }

    .flow-arrow-mini {
      font-size: 1.2rem;
      font-weight: 600;
      color: #cbd5e1;
    }
  }

  /* iPad Portrait - оптимизированный режим */
  @media (min-width: 768px) and (max-width: 1024px) and (orientation: portrait) {
    .reports-container {
      padding: 1.5rem;
    }

    .page-header {
      padding: 1.5rem 2rem;
    }

    .header-content {
      flex-direction: column;
      text-align: center;
      gap: 1.5rem;
      align-items: center;
    }

    .header-content h1 {
      font-size: 2rem;
    }

    .timezone-selector {
      width: 100%;
      max-width: 400px;
      margin: 0 auto;
    }

    .table-container {
      margin: 1rem;
    }

    /* Скрываем менее важные колонки в портретной ориентации для экономии места */
    .reports-table th:nth-child(4),
    .reports-table td:nth-child(4) {
      display: none; /* Скрываем дату срока годности */
    }

    .reports-table th:nth-child(6),
    .reports-table td:nth-child(6) {
      display: none; /* Скрываем данные ВетИС */
    }

    /* Перераспределяем ширину оставшихся колонок */
    .reports-table th:nth-child(1) { width: 15%; } /* Партия */
    .reports-table th:nth-child(2) { width: 15%; } /* Продукт */
    .reports-table th:nth-child(3) { width: 18%; } /* Дата производства */
    .reports-table th:nth-child(5) { width: 12%; } /* Произведено */
    .reports-table th:nth-child(7) { width: 12%; } /* Разница */
    .reports-table th:nth-child(8) { width: 15%; } /* До отправки */
    .reports-table th:nth-child(9) { width: 13%; } /* Статус */

    .batch-info-card {
      margin: 0.5rem;
      padding: 1rem;
    }

    .process-flow-mini {
      gap: 0.5rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    .flow-item-mini {
      font-size: 0.7rem;
      min-width: 60px;
    }

    .flow-circle-mini {
      width: 24px;
      height: 24px;
      font-size: 0.7rem;
    }

    .flow-arrow-mini {
      font-size: 1rem;
    }
  }

  /* iPad Pro/Air Landscape - максимальная функциональность */
  @media (min-width: 1024px) and (max-width: 1366px) and (orientation: landscape) {
    .reports-container {
      padding: 2.5rem;
      max-width: 100%;
    }

    .main-content {
      border-radius: 24px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    }

    .page-header {
      padding: 2.5rem 3rem;
    }

    .header-content h1 {
      font-size: 2.5rem;
      font-weight: 800;
    }

    .timezone-selector {
      padding: 1.25rem 2rem;
      border-radius: 20px;
      min-width: 350px;
    }

    .timezone-selector select {
      font-size: 1.1rem;
      padding: 1rem 1.25rem;
      min-height: 52px;
      min-width: 220px;
      max-width: 280px;
    }

    .table-container {
      margin: 1.5rem 3rem 2.5rem 3rem;
      border-radius: 24px;
    }

    .reports-table {
      font-size: 1.1rem;
    }

    .reports-table th {
      padding: 1.5rem 1.25rem;
      font-size: 1.1rem;
      font-weight: 800;
    }

    .reports-table td {
      padding: 1.5rem 1.25rem;
      font-size: 1rem;
      line-height: 1.6;
    }

    /* Оптимальные ширины колонок для большого экрана */
    .reports-table th:nth-child(1) { width: 10%; } /* Партия */
    .reports-table th:nth-child(2) { width: 10%; } /* Продукт */
    .reports-table th:nth-child(3) { width: 13%; } /* Дата производства */
    .reports-table th:nth-child(4) { width: 13%; } /* Дата срока годности */
    .reports-table th:nth-child(5) { width: 11%; } /* Произведено */
    .reports-table th:nth-child(6) { width: 11%; } /* Данные ВетИС */
    .reports-table th:nth-child(7) { width: 10%; } /* Разница */
    .reports-table th:nth-child(8) { width: 12%; } /* До отправки */
    .reports-table th:nth-child(9) { width: 10%; } /* Статус */

    .deadline-cell {
      min-width: 180px;
      max-width: 220px;
    }

    .time-remaining {
      font-size: 1rem;
      font-weight: 700;
    }

    .deadline-date {
      font-size: 0.9rem;
    }

    .status-badge {
      font-size: 0.9rem;
      padding: 0.6rem 1.25rem;
      border-radius: 24px;
      font-weight: 700;
      min-width: 120px;
    }

    .send-btn {
      font-size: 0.9rem;
      padding: 0.6rem 1.25rem;
      border-radius: 16px;
    }

    .pagination {
      padding: 2rem 3rem;
      gap: 1.25rem;
    }

    .pagination button,
    .pagination span {
      padding: 1rem 1.25rem;
      font-size: 1.1rem;
      min-width: 52px;
      height: 52px;
      border-radius: 16px;
    }

    .batch-info-card {
      padding: 2rem;
      margin: 1.5rem 3rem;
      border-radius: 20px;
      border-left: 6px solid #3b82f6;
    }

    .batch-info-header {
      font-size: 1.2rem;
      margin-bottom: 1.5rem;
    }

    .process-flow-mini {
      gap: 1.5rem;
    }

    .flow-item-mini {
      font-size: 0.9rem;
      gap: 0.75rem;
      min-width: 100px;
    }

    .flow-circle-mini {
      width: 40px;
      height: 40px;
      font-size: 1.1rem;
      font-weight: 800;
    }

    .flow-arrow-mini {
      font-size: 1.5rem;
      font-weight: 700;
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
