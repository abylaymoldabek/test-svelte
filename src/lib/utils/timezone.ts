

  // Функция для получения UTC смещения для таймзоны
export function getUTCOffset(timezone: string): string {
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat("en", {
        timeZone: timezone,
        timeZoneName: "longOffset",
      });

      const parts = formatter.formatToParts(now);
      const offsetPart = parts.find((part) => part.type === "timeZoneName");

      if (offsetPart && offsetPart.value.startsWith("GMT")) {
        const offset = offsetPart.value.replace("GMT", "UTC");
        return offset === "UTC" ? "UTC+0" : offset;
      }

      // Fallback метод
      const offsetMinutes = -now.getTimezoneOffset();
      const utc = new Date(now.getTime() + offsetMinutes * 60000);
      const target = new Date(
        now.toLocaleString("en-US", { timeZone: timezone }),
      );
      const diff = (target.getTime() - utc.getTime()) / (1000 * 60 * 60);

      if (diff === 0) return "UTC+0";
      const sign = diff > 0 ? "+" : "";
      return `UTC${sign}${diff}`;
    } catch (error) {
      return "";
    }
  }

export var russianTimeZones = [
    {
      value: "Europe/Kaliningrad",
      label: `Калининград (${getUTCOffset("Europe/Kaliningrad")})`,
    },
    {
      value: "Europe/Moscow",
      label: `Москва (${getUTCOffset("Europe/Moscow")})`,
    },
    {
      value: "Europe/Samara",
      label: `Самара (${getUTCOffset("Europe/Samara")})`,
    },
    {
      value: "Asia/Yekaterinburg",
      label: `Екатеринбург (${getUTCOffset("Asia/Yekaterinburg")})`,
    },
    {
      value: "Asia/Omsk",
      label: `Омск (${getUTCOffset("Asia/Omsk")})`,
    },
    {
      value: "Asia/Krasnoyarsk",
      label: `Красноярск (${getUTCOffset("Asia/Krasnoyarsk")})`,
    },
    {
      value: "Asia/Irkutsk",
      label: `Иркутск (${getUTCOffset("Asia/Irkutsk")})`,
    },
    {
      value: "Asia/Yakutsk",
      label: `Якутск (${getUTCOffset("Asia/Yakutsk")})`,
    },
    {
      value: "Asia/Vladivostok",
      label: `Владивосток (${getUTCOffset("Asia/Vladivostok")})`,
    },
    {
      value: "Asia/Magadan",
      label: `Магадан (${getUTCOffset("Asia/Magadan")})`,
    },
    {
      value: "Asia/Kamchatka",
      label: `Камчатка (${getUTCOffset("Asia/Kamchatka")})`,
    }
  ];

export var aryIanaTimeZones = [
    {
      value: "Europe/Andorra",
      label: `Андорра (${getUTCOffset("Europe/Andorra")})`,
    },
    { value: "Asia/Dubai", label: `Дубай (${getUTCOffset("Asia/Dubai")})` },
    { value: "Asia/Kabul", label: `Кабул (${getUTCOffset("Asia/Kabul")})` },
    {
      value: "Europe/Tirane",
      label: `Тирана (${getUTCOffset("Europe/Tirane")})`,
    },
    {
      value: "Asia/Yerevan",
      label: `Ереван (${getUTCOffset("Asia/Yerevan")})`,
    },
    {
      value: "Europe/Moscow",
      label: `Москва (${getUTCOffset("Europe/Moscow")})`,
    },
    { value: "Asia/Almaty", label: `Алматы (${getUTCOffset("Asia/Almaty")})` },
    {
      value: "Asia/Tashkent",
      label: `Ташкент (${getUTCOffset("Asia/Tashkent")})`,
    },
    { value: "Europe/Kiev", label: `Киев (${getUTCOffset("Europe/Kiev")})` },
    { value: "Europe/Minsk", label: `Минск (${getUTCOffset("Europe/Minsk")})` },
    {
      value: "Europe/London",
      label: `Лондон (${getUTCOffset("Europe/London")})`,
    },
    { value: "Europe/Paris", label: `Париж (${getUTCOffset("Europe/Paris")})` },
    {
      value: "Europe/Berlin",
      label: `Берлин (${getUTCOffset("Europe/Berlin")})`,
    },
    {
      value: "America/New_York",
      label: `Нью-Йорк (${getUTCOffset("America/New_York")})`,
    },
    {
      value: "America/Los_Angeles",
      label: `Лос-Анджелес (${getUTCOffset("America/Los_Angeles")})`,
    },
    { value: "Asia/Tokyo", label: `Токио (${getUTCOffset("Asia/Tokyo")})` },
    {
      value: "Asia/Shanghai",
      label: `Шанхай (${getUTCOffset("Asia/Shanghai")})`,
    },
    {
      value: "Australia/Sydney",
      label: `Сидней (${getUTCOffset("Australia/Sydney")})`,
    },
    {
      value: "Pacific/Auckland",
      label: `Окленд (${getUTCOffset("Pacific/Auckland")})`,
    },
    {
      value: "Antarctica/Casey",
      label: `Кейси (${getUTCOffset("Antarctica/Casey")})`,
    },
    {
      value: "Antarctica/Davis",
      label: `Дэвис (${getUTCOffset("Antarctica/Davis")})`,
    },
    {
      value: "Antarctica/DumontDUrville",
      label: `Дюмон-дю-Виль (${getUTCOffset("Antarctica/DumontDUrville")})`,
    }, // https://bugs.chromium.org/p/chromium/issues/detail?id=928068
    {
      value: "Antarctica/Mawson",
      label: `Моусон (${getUTCOffset("Antarctica/Mawson")})`,
    },
    {
      value: "Antarctica/Palmer",
      label: `Палмер (${getUTCOffset("Antarctica/Palmer")})`,
    },
    {
      value: "Antarctica/Rothera",
      label: `Ротера (${getUTCOffset("Antarctica/Rothera")})`,
    },
    {
      value: "Antarctica/Syowa",
      label: `Сёва (${getUTCOffset("Antarctica/Syowa")})`,
    },
    {
      value: "Antarctica/Troll",
      label: `Тролль (${getUTCOffset("Antarctica/Troll")})`,
    },
    {
      value: "Antarctica/Vostok",
      label: `Восток (${getUTCOffset("Antarctica/Vostok")})`,
    },
    {
      value: "America/Argentina/Buenos_Aires",
      label: `Буэнос-Айрес (${getUTCOffset("America/Argentina/Buenos_Aires")})`,
    },
    {
      value: "America/Argentina/Cordoba",
      label: `Кордоба (${getUTCOffset("America/Argentina/Cordoba")})`,
    },
    {
      value: "America/Argentina/Salta",
      label: `Сальта (${getUTCOffset("America/Argentina/Salta")})`,
    },
    {
      value: "America/Argentina/Jujuy",
      label: `Хухуй (${getUTCOffset("America/Argentina/Jujuy")})`,
    },
    {
      value: "America/Argentina/Tucuman",
      label: `Тукуман (${getUTCOffset("America/Argentina/Tucuman")})`,
    },
    {
      value: "America/Argentina/Catamarca",
      label: `Катамарка (${getUTCOffset("America/Argentina/Catamarca")})`,
    },
    {
      value: "America/Argentina/La_Rioja",
      label: `Ла-Риоха (${getUTCOffset("America/Argentina/La_Rioja")})`,
    },
    {
      value: "America/Argentina/San_Juan",
      label: `Сан-Хуан (${getUTCOffset("America/Argentina/San_Juan")})`,
    },
    {
      value: "America/Argentina/Mendoza",
      label: `Мендоса (${getUTCOffset("America/Argentina/Mendoza")})`,
    },
    {
      value: "America/Argentina/San_Luis",
      label: `Сан-Луис (${getUTCOffset("America/Argentina/San_Luis")})`,
    },
    {
      value: "America/Argentina/Rio_Gallegos",
      label: `Рио-Галегос (${getUTCOffset("America/Argentina/Rio_Gallegos")})`,
    },
    {
      value: "America/Argentina/Ushuaia",
      label: `Ушуайя (${getUTCOffset("America/Argentina/Ushuaia")})`,
    },
    {
      value: "Pacific/Pago_Pago",
      label: `Пагопаго (${getUTCOffset("Pacific/Pago_Pago")})`,
    },
    {
      value: "Europe/Vienna",
      label: `Вена (${getUTCOffset("Europe/Vienna")})`,
    },
    {
      value: "Australia/Lord_Howe",
      label: `Лорд-Хау (${getUTCOffset("Australia/Lord_Howe")})`,
    },
    {
      value: "Antarctica/Macquarie",
      label: `Маккуори (${getUTCOffset("Antarctica/Macquarie")})`,
    },
    {
      value: "Australia/Hobart",
      label: `Хобарт (${getUTCOffset("Australia/Hobart")})`,
    },
    {
      value: "Australia/Currie",
      label: `Курри (${getUTCOffset("Australia/Currie")})`,
    },
    {
      value: "Australia/Melbourne",
      label: `Мельбурн (${getUTCOffset("Australia/Melbourne")})`,
    },
    {
      value: "Australia/Sydney",
      label: `Сидней (${getUTCOffset("Australia/Sydney")})`,
    },
    {
      value: "Australia/Broken_Hill",
      label: `Брокен-Хилл (${getUTCOffset("Australia/Broken_Hill")})`,
    },
    {
      value: "Australia/Brisbane",
      label: `Брисбен (${getUTCOffset("Australia/Brisbane")})`,
    },
    {
      value: "Australia/Lindeman",
      label: `Линдеман (${getUTCOffset("Australia/Lindeman")})`,
    },
    {
      value: "Australia/Adelaide",
      label: `Аделаида (${getUTCOffset("Australia/Adelaide")})`,
    },
    {
      value: "Australia/Darwin",
      label: `Дарвин (${getUTCOffset("Australia/Darwin")})`,
    },
    {
      value: "Australia/Perth",
      label: `Перт (${getUTCOffset("Australia/Perth")})`,
    },
    {
      value: "Australia/Eucla",
      label: `Евкла (${getUTCOffset("Australia/Eucla")})`,
    },
    { value: "Asia/Baku", label: `Баку (${getUTCOffset("Asia/Baku")})` },
    {
      value: "America/Barbados",
      label: `Барбадос (${getUTCOffset("America/Barbados")})`,
    },
    { value: "Asia/Dhaka", label: `Дакка (${getUTCOffset("Asia/Dhaka")})` },
    {
      value: "Europe/Brussels",
      label: `Брюссель (${getUTCOffset("Europe/Brussels")})`,
    },
    { value: "Europe/Sofia", label: `София (${getUTCOffset("Europe/Sofia")})` },
    {
      value: "Atlantic/Bermuda",
      label: `Бермуды (${getUTCOffset("Atlantic/Bermuda")})`,
    },
    { value: "Asia/Brunei", label: `Бруней (${getUTCOffset("Asia/Brunei")})` },
    {
      value: "America/La_Paz",
      label: `Ла-Пас (${getUTCOffset("America/La_Paz")})`,
    },
    {
      value: "America/Noronha",
      label: `Норона (${getUTCOffset("America/Noronha")})`,
    },
    {
      value: "America/Belem",
      label: `Белем (${getUTCOffset("America/Belem")})`,
    },
    {
      value: "America/Fortaleza",
      label: `Форталеза (${getUTCOffset("America/Fortaleza")})`,
    },
    {
      value: "America/Recife",
      label: `Ресифи (${getUTCOffset("America/Recife")})`,
    },
    {
      value: "America/Araguaina",
      label: `Арагвайна (${getUTCOffset("America/Araguaina")})`,
    },
    {
      value: "America/Maceio",
      label: `Масейо (${getUTCOffset("America/Maceio")})`,
    },
    {
      value: "America/Bahia",
      label: `Баия (${getUTCOffset("America/Bahia")})`,
    },
    {
      value: "America/Sao_Paulo",
      label: `Сан-Паулу (${getUTCOffset("America/Sao_Paulo")})`,
    },
    {
      value: "America/Campo_Grande",
      label: `Кампу-Гранде (${getUTCOffset("America/Campo_Grande")})`,
    },
    {
      value: "America/Cuiaba",
      label: `Куяба (${getUTCOffset("America/Cuiaba")})`,
    },
    {
      value: "America/Santarem",
      label: `Сантарен (${getUTCOffset("America/Santarem")})`,
    },
    {
      value: "America/Porto_Velho",
      label: `Порту-Велью (${getUTCOffset("America/Porto_Velho")})`,
    },
    {
      value: "America/Boa_Vista",
      label: `Боа-Виста (${getUTCOffset("America/Boa_Vista")})`,
    },
    {
      value: "America/Manaus",
      label: `Манаус (${getUTCOffset("America/Manaus")})`,
    },
    {
      value: "America/Eirunepe",
      label: `Эйрунепе (${getUTCOffset("America/Eirunepe")})`,
    },
    {
      value: "America/Rio_Branco",
      label: `Рио-Бранко (${getUTCOffset("America/Rio_Branco")})`,
    },
    {
      value: "America/Nassau",
      label: `Нассау (${getUTCOffset("America/Nassau")})`,
    },
    {
      value: "Asia/Thimphu",
      label: `Тхимпху (${getUTCOffset("Asia/Thimphu")})`,
    },
    { value: "Europe/Minsk", label: `Минск (${getUTCOffset("Europe/Minsk")})` },
    {
      value: "America/Belize",
      label: `Белиз (${getUTCOffset("America/Belize")})`,
    },
    {
      value: "America/St_Johns",
      label: `Сент-Джонс (${getUTCOffset("America/St_Johns")})`,
    },
    {
      value: "America/Halifax",
      label: `Галифакс (${getUTCOffset("America/Halifax")})`,
    },
    {
      value: "America/Glace_Bay",
      label: `Глейс-Бей (${getUTCOffset("America/Glace_Bay")})`,
    },
    {
      value: "America/Moncton",
      label: `Монктон (${getUTCOffset("America/Moncton")})`,
    },
    {
      value: "America/Goose_Bay",
      label: `Гус-Бей (${getUTCOffset("America/Goose_Bay")})`,
    },
    {
      value: "America/Blanc-Sablon",
      label: `Бланк-Саблон (${getUTCOffset("America/Blanc-Sablon")})`,
    },
    {
      value: "America/Toronto",
      label: `Торонто (${getUTCOffset("America/Toronto")})`,
    },
    {
      value: "America/Nipigon",
      label: `Нипигон (${getUTCOffset("America/Nipigon")})`,
    },
    {
      value: "America/Thunder_Bay",
      label: `Тандер-Бей (${getUTCOffset("America/Thunder_Bay")})`,
    },
    {
      value: "America/Iqaluit",
      label: `Икалуит (${getUTCOffset("America/Iqaluit")})`,
    },
    {
      value: "America/Pangnirtung",
      label: `Пангниртунг (${getUTCOffset("America/Pangnirtung")})`,
    },
    {
      value: "America/Atikokan",
      label: `Атикокан (${getUTCOffset("America/Atikokan")})`,
    },
    {
      value: "America/Winnipeg",
      label: `Виннипег (${getUTCOffset("America/Winnipeg")})`,
    },
    {
      value: "America/Rainy_River",
      label: `Рейни-Ривер (${getUTCOffset("America/Rainy_River")})`,
    },
    {
      value: "America/Resolute",
      label: `Резолют (${getUTCOffset("America/Resolute")})`,
    },
    {
      value: "America/Rankin_Inlet",
      label: `Ранкин-Инлет (${getUTCOffset("America/Rankin_Inlet")})`,
    },
    {
      value: "America/Regina",
      label: `Регина (${getUTCOffset("America/Regina")})`,
    },
    {
      value: "America/Swift_Current",
      label: `Свифт-Керрент (${getUTCOffset("America/Swift_Current")})`,
    },
    {
      value: "America/Edmonton",
      label: `Эдмонтон (${getUTCOffset("America/Edmonton")})`,
    },
    {
      value: "America/Cambridge_Bay",
      label: `Кембридж-Бей (${getUTCOffset("America/Cambridge_Bay")})`,
    },
    {
      value: "America/Yellowknife",
      label: `Йеллоунайф (${getUTCOffset("America/Yellowknife")})`,
    },
    {
      value: "America/Inuvik",
      label: `Инуvik (${getUTCOffset("America/Inuvik")})`,
    },
    {
      value: "America/Creston",
      label: `Крестон (${getUTCOffset("America/Creston")})`,
    },
    {
      value: "America/Dawson_Creek",
      label: `Досон-Крик (${getUTCOffset("America/Dawson_Creek")})`,
    },
    {
      value: "America/Fort_Nelson",
      label: `Форт-Нелсон (${getUTCOffset("America/Fort_Nelson")})`,
    },
    {
      value: "America/Vancouver",
      label: `Ванкувер (${getUTCOffset("America/Vancouver")})`,
    },
    {
      value: "America/Whitehorse",
      label: `Уайтхорс (${getUTCOffset("America/Whitehorse")})`,
    },
    {
      value: "America/Dawson",
      label: `Досон (${getUTCOffset("America/Dawson")})`,
    },
    {
      value: "Indian/Cocos",
      label: `Кокосовые острова (${getUTCOffset("Indian/Cocos")})`,
    },
    {
      value: "Europe/Zurich",
      label: `Цюрих (${getUTCOffset("Europe/Zurich")})`,
    },
    {
      value: "Africa/Abidjan",
      label: `Абиджан (${getUTCOffset("Africa/Abidjan")})`,
    },
    {
      value: "Pacific/Rarotonga",
      label: `Раротонга (${getUTCOffset("Pacific/Rarotonga")})`,
    },
    {
      value: "America/Santiago",
      label: `Сантьяго (${getUTCOffset("America/Santiago")})`,
    },
    {
      value: "America/Punta_Arenas",
      label: `Пунта-Аренас (${getUTCOffset("America/Punta_Arenas")})`,
    },
    {
      value: "Pacific/Easter",
      label: `Остров Пасхи (${getUTCOffset("Pacific/Easter")})`,
    },
    {
      value: "Asia/Shanghai",
      label: `Шанхай (${getUTCOffset("Asia/Shanghai")})`,
    },
    { value: "Asia/Urumqi", label: `Урумчи (${getUTCOffset("Asia/Urumqi")})` },
    {
      value: "America/Bogota",
      label: `Богота (${getUTCOffset("America/Bogota")})`,
    },
    {
      value: "America/Costa_Rica",
      label: `Коста-Рика (${getUTCOffset("America/Costa_Rica")})`,
    },
    {
      value: "America/Havana",
      label: `Гавана (${getUTCOffset("America/Havana")})`,
    },
    {
      value: "Atlantic/Cape_Verde",
      label: `Кабо-Верде (${getUTCOffset("Atlantic/Cape_Verde")})`,
    },
    {
      value: "America/Curacao",
      label: `Кюрасао (${getUTCOffset("America/Curacao")})`,
    },
    {
      value: "Indian/Christmas",
      label: `Остров Рождества (${getUTCOffset("Indian/Christmas")})`,
    },
    {
      value: "Asia/Nicosia",
      label: `Никосия (${getUTCOffset("Asia/Nicosia")})`,
    },
    {
      value: "Asia/Famagusta",
      label: `Фамагуста (${getUTCOffset("Asia/Famagusta")})`,
    },
    {
      value: "Europe/Prague",
      label: `Прага (${getUTCOffset("Europe/Prague")})`,
    },
    {
      value: "Europe/Berlin",
      label: `Берлин (${getUTCOffset("Europe/Berlin")})`,
    },
    {
      value: "Europe/Copenhagen",
      label: `Копенгаген (${getUTCOffset("Europe/Copenhagen")})`,
    },
    {
      value: "America/Santo_Domingo",
      label: `Санто-Доминго (${getUTCOffset("America/Santo_Domingo")})`,
    },
    {
      value: "Africa/Algiers",
      label: `Алжир (${getUTCOffset("Africa/Algiers")})`,
    },
    {
      value: "America/Guayaquil",
      label: `Гуаякиль (${getUTCOffset("America/Guayaquil")})`,
    },
    {
      value: "Pacific/Galapagos",
      label: `Галапагосские острова (${getUTCOffset("Pacific/Galapagos")})`,
    },
    {
      value: "Europe/Tallinn",
      label: `Таллин (${getUTCOffset("Europe/Tallinn")})`,
    },
    { value: "Africa/Cairo", label: `Каир (${getUTCOffset("Africa/Cairo")})` },
    {
      value: "Africa/El_Aaiun",
      label: `Эль-Аюн (${getUTCOffset("Africa/El_Aaiun")})`,
    },
    {
      value: "Europe/Madrid",
      label: `Мадрид (${getUTCOffset("Europe/Madrid")})`,
    },
    { value: "Africa/Ceuta", label: `Сеута (${getUTCOffset("Africa/Ceuta")})` },
    {
      value: "Atlantic/Canary",
      label: `Канарские острова (${getUTCOffset("Atlantic/Canary")})`,
    },
    {
      value: "Europe/Helsinki",
      label: `Хельсинки (${getUTCOffset("Europe/Helsinki")})`,
    },
    { value: "Pacific/Fiji", label: `Фиджи (${getUTCOffset("Pacific/Fiji")})` },
    {
      value: "Atlantic/Stanley",
      label: `Стэнли (${getUTCOffset("Atlantic/Stanley")})`,
    },
    {
      value: "Pacific/Chuuk",
      label: `Чуук (${getUTCOffset("Pacific/Chuuk")})`,
    },
    {
      value: "Pacific/Pohnpei",
      label: `Понпеи (${getUTCOffset("Pacific/Pohnpei")})`,
    },
    {
      value: "Pacific/Kosrae",
      label: `Косраэ (${getUTCOffset("Pacific/Kosrae")})`,
    },
    {
      value: "Atlantic/Faroe",
      label: `Фарерские острова (${getUTCOffset("Atlantic/Faroe")})`,
    },
    { value: "Europe/Paris", label: `Париж (${getUTCOffset("Europe/Paris")})` },
    {
      value: "Europe/London",
      label: `Лондон (${getUTCOffset("Europe/London")})`,
    },
    {
      value: "Asia/Tbilisi",
      label: `Тбилиси (${getUTCOffset("Asia/Tbilisi")})`,
    },
    {
      value: "America/Cayenne",
      label: `Кайенна (${getUTCOffset("America/Cayenne")})`,
    },
    { value: "Africa/Accra", label: `Аккра (${getUTCOffset("Africa/Accra")})` },
    {
      value: "Europe/Gibraltar",
      label: `Гибралтар (${getUTCOffset("Europe/Gibraltar")})`,
    },
    {
      value: "America/Godthab",
      label: `Готхоб (${getUTCOffset("America/Godthab")})`,
    },
    {
      value: "America/Danmarkshavn",
      label: `Данмарксхавн (${getUTCOffset("America/Danmarkshavn")})`,
    },
    {
      value: "America/Scoresbysund",
      label: `Скоресбисунн (${getUTCOffset("America/Scoresbysund")})`,
    },
    {
      value: "America/Thule",
      label: `Туле (${getUTCOffset("America/Thule")})`,
    },
    {
      value: "Europe/Athens",
      label: `Афины (${getUTCOffset("Europe/Athens")})`,
    },
    {
      value: "Atlantic/South_Georgia",
      label: `Южная Георгия (${getUTCOffset("Atlantic/South_Georgia")})`,
    },
    {
      value: "America/Guatemala",
      label: `Гватемала (${getUTCOffset("America/Guatemala")})`,
    },
    { value: "Pacific/Guam", label: `Гуам (${getUTCOffset("Pacific/Guam")})` },
    {
      value: "Africa/Bissau",
      label: `Бисау (${getUTCOffset("Africa/Bissau")})`,
    },
    {
      value: "America/Guyana",
      label: `Гайана (${getUTCOffset("America/Guyana")})`,
    },
    {
      value: "Asia/Hong_Kong",
      label: `Гонконг (${getUTCOffset("Asia/Hong_Kong")})`,
    },
    {
      value: "America/Tegucigalpa",
      label: `Тегусигальпа (${getUTCOffset("America/Tegucigalpa")})`,
    },
    {
      value: "America/Port-au-Prince",
      label: `Порт-о-Пренс (${getUTCOffset("America/Port-au-Prince")})`,
    },
    {
      value: "Europe/Budapest",
      label: `Будапешт (${getUTCOffset("Europe/Budapest")})`,
    },
    {
      value: "Asia/Jakarta",
      label: `Джакарта (${getUTCOffset("Asia/Jakarta")})`,
    },
    {
      value: "Asia/Pontianak",
      label: `Понтианак (${getUTCOffset("Asia/Pontianak")})`,
    },
    {
      value: "Asia/Makassar",
      label: `Макассар (${getUTCOffset("Asia/Makassar")})`,
    },
    {
      value: "Asia/Jayapura",
      label: `Джаяпура (${getUTCOffset("Asia/Jayapura")})`,
    },
    {
      value: "Europe/Dublin",
      label: `Дублин (${getUTCOffset("Europe/Dublin")})`,
    },
    {
      value: "Asia/Jerusalem",
      label: `Иерусалим (${getUTCOffset("Asia/Jerusalem")})`,
    },
    {
      value: "Asia/Kolkata",
      label: `Калькутта (${getUTCOffset("Asia/Kolkata")})`,
    },
    {
      value: "Indian/Chagos",
      label: `Чагос (${getUTCOffset("Indian/Chagos")})`,
    },
    {
      value: "Asia/Baghdad",
      label: `Багдад (${getUTCOffset("Asia/Baghdad")})`,
    },
    { value: "Asia/Tehran", label: `Тегеран (${getUTCOffset("Asia/Tehran")})` },
    {
      value: "Atlantic/Reykjavik",
      label: `Рейкьявик (${getUTCOffset("Atlantic/Reykjavik")})`,
    },
    { value: "Europe/Rome", label: `Рим (${getUTCOffset("Europe/Rome")})` },
    {
      value: "America/Jamaica",
      label: `Ямайка (${getUTCOffset("America/Jamaica")})`,
    },
    { value: "Asia/Amman", label: `Амман (${getUTCOffset("Asia/Amman")})` },
    { value: "Asia/Tokyo", label: `Токио (${getUTCOffset("Asia/Tokyo")})` },
    {
      value: "Africa/Nairobi",
      label: `Найроби (${getUTCOffset("Africa/Nairobi")})`,
    },
    {
      value: "Asia/Bishkek",
      label: `Бишкек (${getUTCOffset("Asia/Bishkek")})`,
    },
    {
      value: "Pacific/Tarawa",
      label: `Тарава (${getUTCOffset("Pacific/Tarawa")})`,
    },
    {
      value: "Pacific/Enderbury",
      label: `Эндербери (${getUTCOffset("Pacific/Enderbury")})`,
    },
    {
      value: "Pacific/Kiritimati",
      label: `Киритимати (${getUTCOffset("Pacific/Kiritimati")})`,
    },
    {
      value: "Asia/Pyongyang",
      label: `Пхеньян (${getUTCOffset("Asia/Pyongyang")})`,
    },
    { value: "Asia/Seoul", label: `Сеул (${getUTCOffset("Asia/Seoul")})` },
    { value: "Asia/Almaty", label: `Алматы (${getUTCOffset("Asia/Almaty")})` },
    {
      value: "Asia/Qyzylorda",
      label: `Кызылорда (${getUTCOffset("Asia/Qyzylorda")})`,
    },
    {
      value: "Asia/Qostanay",
      label: `Костанай (${getUTCOffset("Asia/Qostanay")})`,
    },
    { value: "Asia/Aqtobe", label: `Актобе (${getUTCOffset("Asia/Aqtobe")})` },
    { value: "Asia/Aqtau", label: `Актау (${getUTCOffset("Asia/Aqtau")})` },
    { value: "Asia/Atyrau", label: `Атырау (${getUTCOffset("Asia/Atyrau")})` },
    { value: "Asia/Oral", label: `Орал (${getUTCOffset("Asia/Oral")})` },
    { value: "Asia/Beirut", label: `Бейрут (${getUTCOffset("Asia/Beirut")})` },
    {
      value: "Asia/Colombo",
      label: `Коломбо (${getUTCOffset("Asia/Colombo")})`,
    },
    {
      value: "Africa/Monrovia",
      label: `Монровия (${getUTCOffset("Africa/Monrovia")})`,
    },
    {
      value: "America/Santo_Domingo",
      label: `Санто-Доминго (${getUTCOffset("America/Santo_Domingo")})`,
    },
    {
      value: "Africa/Algiers",
      label: `Алжир (${getUTCOffset("Africa/Algiers")})`,
    },
    {
      value: "America/Guayaquil",
      label: `Гуаякиль (${getUTCOffset("America/Guayaquil")})`,
    },
    {
      value: "Pacific/Galapagos",
      label: `Галапагос (${getUTCOffset("Pacific/Galapagos")})`,
    },
    {
      value: "Europe/Tallinn",
      label: `Таллин (${getUTCOffset("Europe/Tallinn")})`,
    },
    { value: "Africa/Cairo", label: `Каир (${getUTCOffset("Africa/Cairo")})` },
    {
      value: "Africa/El_Aaiun",
      label: `Эль-Аайун (${getUTCOffset("Africa/El_Aaiun")})`,
    },
    {
      value: "Europe/Madrid",
      label: `Мадрид (${getUTCOffset("Europe/Madrid")})`,
    },
    { value: "Africa/Ceuta", label: `Сеута (${getUTCOffset("Africa/Ceuta")})` },
    {
      value: "Atlantic/Canary",
      label: `Канарские острова (${getUTCOffset("Atlantic/Canary")})`,
    },
    {
      value: "Europe/Helsinki",
      label: `Хельсинки (${getUTCOffset("Europe/Helsinki")})`,
    },
    { value: "Pacific/Fiji", label: `Фиджи (${getUTCOffset("Pacific/Fiji")})` },
    {
      value: "Atlantic/Stanley",
      label: `Стэнли (${getUTCOffset("Atlantic/Stanley")})`,
    },
    {
      value: "Pacific/Chuuk",
      label: `Чуук (${getUTCOffset("Pacific/Chuuk")})`,
    },
    {
      value: "Pacific/Pohnpei",
      label: `Понпеи (${getUTCOffset("Pacific/Pohnpei")})`,
    },
    {
      value: "Pacific/Kosrae",
      label: `Косраэ (${getUTCOffset("Pacific/Kosrae")})`,
    },
    {
      value: "Atlantic/Faroe",
      label: `Фарерские острова (${getUTCOffset("Atlantic/Faroe")})`,
    },
    { value: "Europe/Paris", label: `Париж (${getUTCOffset("Europe/Paris")})` },
    {
      value: "Europe/London",
      label: `Лондон (${getUTCOffset("Europe/London")})`,
    },
    {
      value: "Asia/Tbilisi",
      label: `Тбилиси (${getUTCOffset("Asia/Tbilisi")})`,
    },
    {
      value: "America/Cayenne",
      label: `Кайенна (${getUTCOffset("America/Cayenne")})`,
    },
    { value: "Africa/Accra", label: `Аккра (${getUTCOffset("Africa/Accra")})` },
    {
      value: "Europe/Gibraltar",
      label: `Гибралтар (${getUTCOffset("Europe/Gibraltar")})`,
    },
    {
      value: "America/Godthab",
      label: `Годтхаб (${getUTCOffset("America/Godthab")})`,
    },
    {
      value: "America/Danmarkshavn",
      label: `Данмарксхавн (${getUTCOffset("America/Danmarkshavn")})`,
    },
    {
      value: "America/Scoresbysund",
      label: `Скорсбисун (${getUTCOffset("America/Scoresbysund")})`,
    },
    {
      value: "America/Thule",
      label: `Туле (${getUTCOffset("America/Thule")})`,
    },
    {
      value: "Europe/Athens",
      label: `Афины (${getUTCOffset("Europe/Athens")})`,
    },
    {
      value: "Atlantic/South_Georgia",
      label: `Южная Георгия (${getUTCOffset("Atlantic/South_Georgia")})`,
    },
    {
      value: "America/Guatemala",
      label: `Гватемала (${getUTCOffset("America/Guatemala")})`,
    },
    { value: "Pacific/Guam", label: `Гуам (${getUTCOffset("Pacific/Guam")})` },
    {
      value: "Africa/Bissau",
      label: `Бисау (${getUTCOffset("Africa/Bissau")})`,
    },
    {
      value: "America/Guyana",
      label: `Гайана (${getUTCOffset("America/Guyana")})`,
    },
    {
      value: "Asia/Hong_Kong",
      label: `Гонконг (${getUTCOffset("Asia/Hong_Kong")})`,
    },
    {
      value: "America/Tegucigalpa",
      label: `Тегусигальпа (${getUTCOffset("America/Tegucigalpa")})`,
    },
    {
      value: "America/Port-au-Prince",
      label: `Порт-о-Пренс (${getUTCOffset("America/Port-au-Prince")})`,
    },
    {
      value: "Europe/Budapest",
      label: `Будапешт (${getUTCOffset("Europe/Budapest")})`,
    },
    {
      value: "Asia/Jakarta",
      label: `Джакарта (${getUTCOffset("Asia/Jakarta")})`,
    },
    {
      value: "Asia/Pontianak",
      label: `Понтианак (${getUTCOffset("Asia/Pontianak")})`,
    },
    {
      value: "Asia/Makassar",
      label: `Макассар (${getUTCOffset("Asia/Makassar")})`,
    },
    {
      value: "Asia/Jayapura",
      label: `Джаяпура (${getUTCOffset("Asia/Jayapura")})`,
    },
    {
      value: "Europe/Dublin",
      label: `Дублин (${getUTCOffset("Europe/Dublin")})`,
    },
    {
      value: "Asia/Jerusalem",
      label: `Иерусалим (${getUTCOffset("Asia/Jerusalem")})`,
    },
    {
      value: "Asia/Kolkata",
      label: `Калькутта (${getUTCOffset("Asia/Kolkata")})`,
    },
    {
      value: "Indian/Chagos",
      label: `Чагос (${getUTCOffset("Indian/Chagos")})`,
    },
    {
      value: "Asia/Baghdad",
      label: `Багдад (${getUTCOffset("Asia/Baghdad")})`,
    },
    { value: "Asia/Tehran", label: `Тегеран (${getUTCOffset("Asia/Tehran")})` },
    {
      value: "Atlantic/Reykjavik",
      label: `Рейкьявик (${getUTCOffset("Atlantic/Reykjavik")})`,
    },
    { value: "Europe/Rome", label: `Рим (${getUTCOffset("Europe/Rome")})` },
    {
      value: "America/Jamaica",
      label: `Ямайка (${getUTCOffset("America/Jamaica")})`,
    },
    { value: "Asia/Amman", label: `Амман (${getUTCOffset("Asia/Amman")})` },
    { value: "Asia/Tokyo", label: `Токио (${getUTCOffset("Asia/Tokyo")})` },
    {
      value: "Africa/Nairobi",
      label: `Найроби (${getUTCOffset("Africa/Nairobi")})`,
    },
    {
      value: "Asia/Bishkek",
      label: `Бишкек (${getUTCOffset("Asia/Bishkek")})`,
    },
    {
      value: "Pacific/Tarawa",
      label: `Тарава (${getUTCOffset("Pacific/Tarawa")})`,
    },
    {
      value: "Pacific/Enderbury",
      label: `Эндербери (${getUTCOffset("Pacific/Enderbury")})`,
    },
    {
      value: "Pacific/Kiritimati",
      label: `Киритимати (${getUTCOffset("Pacific/Kiritimati")})`,
    },
    {
      value: "Asia/Pyongyang",
      label: `Пхеньян (${getUTCOffset("Asia/Pyongyang")})`,
    },
    { value: "Asia/Seoul", label: `Сеул (${getUTCOffset("Asia/Seoul")})` },
    { value: "Asia/Almaty", label: `Алматы (${getUTCOffset("Asia/Almaty")})` },
    {
      value: "Asia/Qyzylorda",
      label: `Кызылорда (${getUTCOffset("Asia/Qyzylorda")})`,
    },
    {
      value: "Asia/Qostanay",
      label: `Костанай (${getUTCOffset("Asia/Qostanay")})`,
    },
    { value: "Asia/Aqtobe", label: `Актобе (${getUTCOffset("Asia/Aqtobe")})` },
    { value: "Asia/Aqtau", label: `Актау (${getUTCOffset("Asia/Aqtau")})` },
    { value: "Asia/Atyrau", label: `Атырау (${getUTCOffset("Asia/Atyrau")})` },
    { value: "Asia/Oral", label: `Орал (${getUTCOffset("Asia/Oral")})` },
    { value: "Asia/Beirut", label: "Бейрут" },
    { value: "Asia/Colombo", label: "Коломбо" },
    { value: "Africa/Monrovia", label: "Монровия" },
    {
      value: "Europe/Vilnius",
      label: `Вильнюс (${getUTCOffset("Europe/Vilnius")})`,
    },
    {
      value: "Europe/Luxembourg",
      label: `Люксембург (${getUTCOffset("Europe/Luxembourg")})`,
    },
    { value: "Europe/Riga", label: `Рига (${getUTCOffset("Europe/Riga")})` },
    {
      value: "Africa/Tripoli",
      label: `Триполи (${getUTCOffset("Africa/Tripoli")})`,
    },
    {
      value: "Africa/Casablanca",
      label: `Касабланка (${getUTCOffset("Africa/Casablanca")})`,
    },
    {
      value: "Europe/Monaco",
      label: `Монако (${getUTCOffset("Europe/Monaco")})`,
    },
    {
      value: "Europe/Chisinau",
      label: `Кишинев (${getUTCOffset("Europe/Chisinau")})`,
    },
    {
      value: "Pacific/Majuro",
      label: `Маджуро (${getUTCOffset("Pacific/Majuro")})`,
    },
    {
      value: "Pacific/Kwajalein",
      label: `Кваджалейн (${getUTCOffset("Pacific/Kwajalein")})`,
    },
    { value: "Asia/Yangon", label: `Янгон (${getUTCOffset("Asia/Yangon")})` },
    {
      value: "Asia/Ulaanbaatar",
      label: `Улан-Батор (${getUTCOffset("Asia/Ulaanbaatar")})`,
    },
    { value: "Asia/Hovd", label: `Ховд (${getUTCOffset("Asia/Hovd")})` },
    {
      value: "Asia/Choibalsan",
      label: `Чойбалсан (${getUTCOffset("Asia/Choibalsan")})`,
    },
    { value: "Asia/Macau", label: `Макао (${getUTCOffset("Asia/Macau")})` },
    {
      value: "America/Martinique",
      label: `Мартиника (${getUTCOffset("America/Martinique")})`,
    },
    {
      value: "Europe/Malta",
      label: `Мальта (${getUTCOffset("Europe/Malta")})`,
    },
    {
      value: "Indian/Mauritius",
      label: `Маврикий (${getUTCOffset("Indian/Mauritius")})`,
    },
    {
      value: "Indian/Maldives",
      label: `Мальдивы (${getUTCOffset("Indian/Maldives")})`,
    },
    {
      value: "America/Mexico_City",
      label: `Мехико (${getUTCOffset("America/Mexico_City")})`,
    },
    {
      value: "America/Cancun",
      label: `Канкун (${getUTCOffset("America/Cancun")})`,
    },
    {
      value: "America/Merida",
      label: `Мерида (${getUTCOffset("America/Merida")})`,
    },
    {
      value: "America/Monterrey",
      label: `Монтеррей (${getUTCOffset("America/Monterrey")})`,
    },
    {
      value: "America/Matamoros",
      label: `Матаморос (${getUTCOffset("America/Matamoros")})`,
    },
    {
      value: "America/Mazatlan",
      label: `Мазатлан (${getUTCOffset("America/Mazatlan")})`,
    },
    {
      value: "America/Chihuahua",
      label: `Чиуауа (${getUTCOffset("America/Chihuahua")})`,
    },
    {
      value: "America/Ojinaga",
      label: `Охинага (${getUTCOffset("America/Ojinaga")})`,
    },
    {
      value: "America/Hermosillo",
      label: `Эрмосильо (${getUTCOffset("America/Hermosillo")})`,
    },
    {
      value: "America/Tijuana",
      label: `Тихуана (${getUTCOffset("America/Tijuana")})`,
    },
    {
      value: "America/Bahia_Banderas",
      label: `Бахия-Бандерас (${getUTCOffset("America/Bahia_Banderas")})`,
    },
    {
      value: "Asia/Kuala_Lumpur",
      label: `Куала-Лумпур (${getUTCOffset("Asia/Kuala_Lumpur")})`,
    },
    {
      value: "Asia/Kuching",
      label: `Кучинг (${getUTCOffset("Asia/Kuching")})`,
    },
    {
      value: "Africa/Maputo",
      label: `Мапут (${getUTCOffset("Africa/Maputo")})`,
    },
    {
      value: "Africa/Windhoek",
      label: `Виндхук (${getUTCOffset("Africa/Windhoek")})`,
    },
    {
      value: "Pacific/Noumea",
      label: `Нумеа (${getUTCOffset("Pacific/Noumea")})`,
    },
    {
      value: "Pacific/Norfolk",
      label: `Норфолк (${getUTCOffset("Pacific/Norfolk")})`,
    },
    { value: "Africa/Lagos", label: `Лагос (${getUTCOffset("Africa/Lagos")})` },
    {
      value: "America/Managua",
      label: `Манагуа (${getUTCOffset("America/Managua")})`,
    },
    {
      value: "Europe/Amsterdam",
      label: `Амстердам (${getUTCOffset("Europe/Amsterdam")})`,
    },
    { value: "Europe/Oslo", label: `Осло (${getUTCOffset("Europe/Oslo")})` },
    {
      value: "Asia/Kathmandu",
      label: `Катманду (${getUTCOffset("Asia/Kathmandu")})`,
    },
    {
      value: "Pacific/Nauru",
      label: `Науру (${getUTCOffset("Pacific/Nauru")})`,
    },
    { value: "Pacific/Niue", label: `Ниуэ (${getUTCOffset("Pacific/Niue")})` },
    {
      value: "Pacific/Auckland",
      label: `Окленд (${getUTCOffset("Pacific/Auckland")})`,
    },
    {
      value: "Pacific/Chatham",
      label: `Чатем (${getUTCOffset("Pacific/Chatham")})`,
    },
    {
      value: "America/Panama",
      label: `Панама (${getUTCOffset("America/Panama")})`,
    },
    { value: "America/Lima", label: `Лима (${getUTCOffset("America/Lima")})` },
    {
      value: "Pacific/Tahiti",
      label: `Таити (${getUTCOffset("Pacific/Tahiti")})`,
    },
    {
      value: "Pacific/Marquesas",
      label: `Маркизские острова (${getUTCOffset("Pacific/Marquesas")})`,
    },
    {
      value: "Pacific/Gambier",
      label: `Гамбиер (${getUTCOffset("Pacific/Gambier")})`,
    },
    {
      value: "Pacific/Port_Moresby",
      label: `Порт-Морсби (${getUTCOffset("Pacific/Port_Moresby")})`,
    },
    {
      value: "Pacific/Bougainville",
      label: `Бука (${getUTCOffset("Pacific/Bougainville")})`,
    },
    { value: "Asia/Manila", label: `Манила (${getUTCOffset("Asia/Manila")})` },
    {
      value: "Asia/Karachi",
      label: `Карачи (${getUTCOffset("Asia/Karachi")})`,
    },
    {
      value: "Europe/Warsaw",
      label: `Варшава (${getUTCOffset("Europe/Warsaw")})`,
    },
    {
      value: "America/Miquelon",
      label: `Микелон (${getUTCOffset("America/Miquelon")})`,
    },
    {
      value: "Pacific/Pitcairn",
      label: `Питкерн (${getUTCOffset("Pacific/Pitcairn")})`,
    },
    {
      value: "America/Puerto_Rico",
      label: `Пуэрто-Рико (${getUTCOffset("America/Puerto_Rico")})`,
    },
    { value: "Asia/Gaza", label: `Газа (${getUTCOffset("Asia/Gaza")})` },
    { value: "Asia/Hebron", label: `Хеврон (${getUTCOffset("Asia/Hebron")})` },
    {
      value: "Europe/Lisbon",
      label: `Лиссабон (${getUTCOffset("Europe/Lisbon")})`,
    },
    {
      value: "Atlantic/Madeira",
      label: `Мадейра (${getUTCOffset("Atlantic/Madeira")})`,
    },
    {
      value: "Atlantic/Azores",
      label: `Азорские острова (${getUTCOffset("Atlantic/Azores")})`,
    },
    {
      value: "Pacific/Palau",
      label: `Палау (${getUTCOffset("Pacific/Palau")})`,
    },
    {
      value: "America/Asuncion",
      label: `Асунсьон (${getUTCOffset("America/Asuncion")})`,
    },
    { value: "Asia/Qatar", label: `Катар (${getUTCOffset("Asia/Qatar")})` },
    {
      value: "Indian/Reunion",
      label: `Реюньон (${getUTCOffset("Indian/Reunion")})`,
    },
    {
      value: "Europe/Bucharest",
      label: `Бухарест (${getUTCOffset("Europe/Bucharest")})`,
    },
    {
      value: "Europe/Belgrade",
      label: `Белград (${getUTCOffset("Europe/Belgrade")})`,
    },
    {
      value: "Europe/Kaliningrad",
      label: `Калининград (${getUTCOffset("Europe/Kaliningrad")})`,
    },
    {
      value: "Europe/Moscow",
      label: `Москва (${getUTCOffset("Europe/Moscow")})`,
    },
    {
      value: "Europe/Simferopol",
      label: `Симферополь (${getUTCOffset("Europe/Simferopol")})`,
    },
    { value: "Europe/Kirov", label: `Киров (${getUTCOffset("Europe/Kirov")})` },
    {
      value: "Europe/Astrakhan",
      label: `Астрахань (${getUTCOffset("Europe/Astrakhan")})`,
    },
    {
      value: "Europe/Volgograd",
      label: `Волгоград (${getUTCOffset("Europe/Volgograd")})`,
    },
    {
      value: "Europe/Saratov",
      label: `Саратов (${getUTCOffset("Europe/Saratov")})`,
    },
    {
      value: "Europe/Ulyanovsk",
      label: `Ульяновск (${getUTCOffset("Europe/Ulyanovsk")})`,
    },
    {
      value: "Europe/Samara",
      label: `Самара (${getUTCOffset("Europe/Samara")})`,
    },
    {
      value: "Asia/Yekaterinburg",
      label: `Екатеринбург (${getUTCOffset("Asia/Yekaterinburg")})`,
    },
    { value: "Asia/Omsk", label: `Омск (${getUTCOffset("Asia/Omsk")})` },
    {
      value: "Asia/Novosibirsk",
      label: `Новосибирск (${getUTCOffset("Asia/Novosibirsk")})`,
    },
    {
      value: "Asia/Barnaul",
      label: `Барнаул (${getUTCOffset("Asia/Barnaul")})`,
    },
    { value: "Asia/Tomsk", label: `Томск (${getUTCOffset("Asia/Tomsk")})` },
    {
      value: "Asia/Novokuznetsk",
      label: `Новокузнецк (${getUTCOffset("Asia/Novokuznetsk")})`,
    },
    {
      value: "Asia/Krasnoyarsk",
      label: `Красноярск (${getUTCOffset("Asia/Krasnoyarsk")})`,
    },
    {
      value: "Asia/Irkutsk",
      label: `Иркутск (${getUTCOffset("Asia/Irkutsk")})`,
    },
    { value: "Asia/Chita", label: `Чита (${getUTCOffset("Asia/Chita")})` },
    {
      value: "Asia/Yakutsk",
      label: `Якутск (${getUTCOffset("Asia/Yakutsk")})`,
    },
    {
      value: "Asia/Khandyga",
      label: `Хандыга (${getUTCOffset("Asia/Khandyga")})`,
    },
    {
      value: "Asia/Vladivostok",
      label: `Владивосток (${getUTCOffset("Asia/Vladivostok")})`,
    },
    {
      value: "Asia/Ust-Nera",
      label: `Усть-Нера (${getUTCOffset("Asia/Ust-Nera")})`,
    },
    {
      value: "Asia/Magadan",
      label: `Магадан (${getUTCOffset("Asia/Magadan")})`,
    },
    {
      value: "Asia/Sakhalin",
      label: `Сахалин (${getUTCOffset("Asia/Sakhalin")})`,
    },
    {
      value: "Asia/Srednekolymsk",
      label: `Среднеколымск (${getUTCOffset("Asia/Srednekolymsk")})`,
    },
    {
      value: "Asia/Kamchatka",
      label: `Камчатка (${getUTCOffset("Asia/Kamchatka")})`,
    },
    { value: "Asia/Anadyr", label: `Анадырь (${getUTCOffset("Asia/Anadyr")})` },
    { value: "Asia/Riyadh", label: `Эр-Рияд (${getUTCOffset("Asia/Riyadh")})` },
    {
      value: "Pacific/Guadalcanal",
      label: `Гуадалканал (${getUTCOffset("Pacific/Guadalcanal")})`,
    },
    { value: "Indian/Mahe", label: `Махе (${getUTCOffset("Indian/Mahe")})` },
    {
      value: "Africa/Khartoum",
      label: `Хартум (${getUTCOffset("Africa/Khartoum")})`,
    },
    {
      value: "Europe/Stockholm",
      label: `Стокгольм (${getUTCOffset("Europe/Stockholm")})`,
    },
    {
      value: "Asia/Singapore",
      label: `Сингапур (${getUTCOffset("Asia/Singapore")})`,
    },
    {
      value: "America/Paramaribo",
      label: `Парамарибо (${getUTCOffset("America/Paramaribo")})`,
    },
    { value: "Africa/Juba", label: `Джуба (${getUTCOffset("Africa/Juba")})` },
    {
      value: "Africa/Sao_Tome",
      label: `Сан-Томе (${getUTCOffset("Africa/Sao_Tome")})`,
    },
    {
      value: "America/El_Salvador",
      label: `Эль-Сальвадор (${getUTCOffset("America/El_Salvador")})`,
    },
    {
      value: "Asia/Damascus",
      label: `Дамаск (${getUTCOffset("Asia/Damascus")})`,
    },
    {
      value: "America/Grand_Turk",
      label: `Гранд-Терк (${getUTCOffset("America/Grand_Turk")})`,
    },
    {
      value: "Africa/Ndjamena",
      label: `Нджамена (${getUTCOffset("Africa/Ndjamena")})`,
    },
    {
      value: "Indian/Kerguelen",
      label: `Кергелен (${getUTCOffset("Indian/Kerguelen")})`,
    },
    {
      value: "Asia/Bangkok",
      label: `Бангкок (${getUTCOffset("Asia/Bangkok")})`,
    },
    {
      value: "Asia/Dushanbe",
      label: `Душанбе (${getUTCOffset("Asia/Dushanbe")})`,
    },
    {
      value: "Pacific/Fakaofo",
      label: `Факаофо (${getUTCOffset("Pacific/Fakaofo")})`,
    },
    { value: "Asia/Dili", label: `Дили (${getUTCOffset("Asia/Dili")})` },
    {
      value: "Asia/Ashgabat",
      label: `Ашхабад (${getUTCOffset("Asia/Ashgabat")})`,
    },
    { value: "Africa/Tunis", label: `Тунис (${getUTCOffset("Africa/Tunis")})` },
    {
      value: "Pacific/Tongatapu",
      label: `Тонгатапу (${getUTCOffset("Pacific/Tongatapu")})`,
    },
    {
      value: "Europe/Istanbul",
      label: `Стамбул (${getUTCOffset("Europe/Istanbul")})`,
    },
    {
      value: "America/Port_of_Spain",
      label: `Порт-оф-Спейн (${getUTCOffset("America/Port_of_Spain")})`,
    },
    {
      value: "Pacific/Funafuti",
      label: `Фунафути (${getUTCOffset("Pacific/Funafuti")})`,
    },
    { value: "Asia/Taipei", label: `Тайбэй (${getUTCOffset("Asia/Taipei")})` },
    { value: "Europe/Kiev", label: `Киев (${getUTCOffset("Europe/Kiev")})` },
    {
      value: "Europe/Uzhgorod",
      label: `Ужгород (${getUTCOffset("Europe/Uzhgorod")})`,
    },
    {
      value: "Europe/Zaporozhye",
      label: `Запорожье (${getUTCOffset("Europe/Zaporozhye")})`,
    },
    { value: "Pacific/Wake", label: `Уэйк (${getUTCOffset("Pacific/Wake")})` },
    {
      value: "America/New_York",
      label: `Нью-Йорк (${getUTCOffset("America/New_York")})`,
    },
    {
      value: "America/Detroit",
      label: `Детройт (${getUTCOffset("America/Detroit")})`,
    },
    {
      value: "America/Kentucky/Louisville",
      label: `Луисвилл (${getUTCOffset("America/Kentucky/Louisville")})`,
    },
    {
      value: "America/Kentucky/Monticello",
      label: `Монтсельо (${getUTCOffset("America/Kentucky/Monticello")})`,
    },
    {
      value: "America/Indiana/Indianapolis",
      label: `Индианаполис (${getUTCOffset("America/Indiana/Indianapolis")})`,
    },
    {
      value: "America/Indiana/Vincennes",
      label: `Винсеннес (${getUTCOffset("America/Indiana/Vincennes")})`,
    },
    {
      value: "America/Indiana/Winamac",
      label: `Винамак (${getUTCOffset("America/Indiana/Winamac")})`,
    },
    {
      value: "America/Indiana/Marengo",
      label: `Маренго (${getUTCOffset("America/Indiana/Marengo")})`,
    },
    {
      value: "America/Indiana/Petersburg",
      label: `Петерсбург (${getUTCOffset("America/Indiana/Petersburg")})`,
    },
    {
      value: "America/Indiana/Vevay",
      label: `Вевей (${getUTCOffset("America/Indiana/Vevay")})`,
    },
    {
      value: "America/Chicago",
      label: `Чикаго (${getUTCOffset("America/Chicago")})`,
    },
    {
      value: "America/Indiana/Tell_City",
      label: `Телл-Сити (${getUTCOffset("America/Indiana/Tell_City")})`,
    },
    {
      value: "America/Indiana/Knox",
      label: `Кнокса (${getUTCOffset("America/Indiana/Knox")})`,
    },
    {
      value: "America/Menominee",
      label: `Меномини (${getUTCOffset("America/Menominee")})`,
    },
    {
      value: "America/North_Dakota/Center",
      label: `Центр (${getUTCOffset("America/North_Dakota/Center")})`,
    },
    {
      value: "America/North_Dakota/New_Salem",
      label: `Нью-Салем (${getUTCOffset("America/North_Dakota/New_Salem")})`,
    },
    {
      value: "America/North_Dakota/Beulah",
      label: `Бьюла (${getUTCOffset("America/North_Dakota/Beulah")})`,
    },
    {
      value: "America/Denver",
      label: `Денвер (${getUTCOffset("America/Denver")})`,
    },
    {
      value: "America/Boise",
      label: `Бойсе (${getUTCOffset("America/Boise")})`,
    },
    {
      value: "America/Phoenix",
      label: `Финикс (${getUTCOffset("America/Phoenix")})`,
    },
    {
      value: "America/Los_Angeles",
      label: `Лос-Анджелес (${getUTCOffset("America/Los_Angeles")})`,
    },
    {
      value: "America/Anchorage",
      label: `Анкоридж (${getUTCOffset("America/Anchorage")})`,
    },
    {
      value: "America/Juneau",
      label: `Джунейо (${getUTCOffset("America/Juneau")})`,
    },
    {
      value: "America/Sitka",
      label: `Ситка (${getUTCOffset("America/Sitka")})`,
    },
    {
      value: "America/Metlakatla",
      label: `Метлакатла (${getUTCOffset("America/Metlakatla")})`,
    },
    {
      value: "America/Yakutat",
      label: `Якутат (${getUTCOffset("America/Yakutat")})`,
    },
    { value: "America/Nome", label: `Ном (${getUTCOffset("America/Nome")})` },
    { value: "America/Adak", label: `Адак (${getUTCOffset("America/Adak")})` },
    {
      value: "Pacific/Honolulu",
      label: `Гонолулу (${getUTCOffset("Pacific/Honolulu")})`,
    },
    {
      value: "America/Montevideo",
      label: `Монтевидео (${getUTCOffset("America/Montevideo")})`,
    },
    {
      value: "Asia/Samarkand",
      label: `Самарканд (${getUTCOffset("Asia/Samarkand")})`,
    },
    {
      value: "Asia/Tashkent",
      label: `Ташкент (${getUTCOffset("Asia/Tashkent")})`,
    },
    {
      value: "America/Caracas",
      label: `Каракас (${getUTCOffset("America/Caracas")})`,
    },
    {
      value: "Asia/Ho_Chi_Minh",
      label: `Хошимин (${getUTCOffset("Asia/Ho_Chi_Minh")})`,
    },
    {
      value: "Pacific/Efate",
      label: `Эфате (${getUTCOffset("Pacific/Efate")})`,
    },
    {
      value: "Pacific/Wallis",
      label: `Уоллис (${getUTCOffset("Pacific/Wallis")})`,
    },
    { value: "Pacific/Apia", label: `Апиa (${getUTCOffset("Pacific/Apia")})` },
    {
      value: "Africa/Johannesburg",
      label: `Йоханнесбург (${getUTCOffset("Africa/Johannesburg")})`,
    },
  ];

