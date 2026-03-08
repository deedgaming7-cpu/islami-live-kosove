document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements (Prayer) ---
    const locationText = document.getElementById('location-text');
    const loadingDiv = document.getElementById('loading');
    const timerContainer = document.getElementById('timer-container');
    const nextEventLabel = document.getElementById('next-event-label');
    const countdownEl = document.getElementById('countdown');
    const nextEventTimeEl = document.getElementById('next-event-time');
    const duaContainer = document.getElementById('dua-container');
    const duaTypeEl = document.getElementById('dua-type');
    const duaArabicEl = document.getElementById('dua-arabic');
    const duaTranslationEl = document.getElementById('dua-translation');
    const prayersUl = document.getElementById('prayers-ul');
    const notifyBtn = document.getElementById('notify-btn');

    // --- DOM Elements (Navigation) ---
    const prayerView = document.getElementById('prayer-view');
    const quranView = document.getElementById('quran-view');
    const navTabs = document.querySelectorAll('.nav-tab');

    // --- DOM Elements (Qur'an) ---
    const surahListContainer = document.getElementById('surah-list-container');
    const surahReader = document.getElementById('surah-reader');
    const surahListEl = document.getElementById('surah-list');
    const surahSearchInput = document.getElementById('surah-search');
    const readerBackBtn = document.getElementById('reader-back-btn');
    const readerSurahName = document.getElementById('reader-surah-name');
    const readerSurahArabic = document.getElementById('reader-surah-arabic');
    const readerAyahCount = document.getElementById('reader-ayah-count');
    const readerLoading = document.getElementById('reader-loading');
    const readerVerses = document.getElementById('reader-verses');
    const prevSurahBtn = document.getElementById('prev-surah-btn');
    const nextSurahBtn = document.getElementById('next-surah-btn');
    // --- DOM Elements (Qur'an Settings & Audio) ---
    const audioPlayBtn = document.getElementById('audio-play-btn');
    const audioProgressContainer = document.getElementById('audio-progress-container');
    const audioProgress = document.getElementById('audio-progress');
    const audioTimeCurrent = document.getElementById('audio-time-current');
    const audioTimeTotal = document.getElementById('audio-time-total');
    const surahAudio = document.getElementById('surah-audio');
    const showArabicCheckbox = document.getElementById('show-arabic');
    const showTranslationCheckbox = document.getElementById('show-translation');
    const showTransliterationCheckbox = document.getElementById('show-transliteration');

    // --- DOM Elements (Qibla) ---
    const qiblaView = document.getElementById('qibla-view');
    const compassInner = document.getElementById('compass');
    const qiblaPointer = document.getElementById('qibla-pointer');
    const calibrateCompassBtn = document.getElementById('calibrate-compass-btn');
    const qiblaStatus = document.getElementById('qibla-status');

    // --- DOM Elements (More / Modals) ---
    const moreView = document.getElementById('more-view');
    const openNamesBtn = document.getElementById('open-names-btn');
    const openDhikrBtn = document.getElementById('open-dhikr-btn');
    const openAbdestBtn = document.getElementById('open-abdest-btn');
    const namesModal = document.getElementById('names-modal');
    const dhikrModal = document.getElementById('dhikr-modal');
    const abdestModal = document.getElementById('abdest-modal');
    const closeBtns = document.querySelectorAll('.close-modal-btn');
    const namesList = document.getElementById('names-list');
    
    // Dhikr Elements
    const dhikrTapBtn = document.getElementById('dhikr-tap');
    const dhikrResetBtn = document.getElementById('dhikr-reset');
    const dhikrCountDisplay = document.getElementById('dhikr-count-display');
    const dhikrGoalDisplay = document.getElementById('dhikr-goal-display');
    const dhikrGoalBtns = document.querySelectorAll('.dhikr-btn');

    // --- State ---
    let prayerTimes = null;
    let countdownInterval = null;
    let notified = {}; // track which prayers have been notified today
    let currentSurah = null;
    let surahListRendered = false;
    let namesLoaded = false;
    let dhikrCount = 0;
    let dhikrGoal = 33;
    let qiblaHeading = 137; // Default Qibla angle from North for Kosovo
    let compassWatchId = null;

    // --- API Config ---
    const QURAN_API_BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1';
    const ARABIC_EDITION = 'ara-qurandoori';
    const ALBANIAN_EDITION = 'sqi-fetimehdiu-la';

    // --- Kosovo Config ---
    const ALADHAN_FALLBACK_URL = 'https://api.aladhan.com/v1/timings/{DATE}?method=99&methodSettings=18,null,17&school=0&latitude=42.6629&longitude=21.1655&timezonestring=Europe/Skopje&tune=7,7,-3,5,9,9,9,11,0';

    // Prayer display order
    const prayerDisplayOrder = ['Imsaku', 'LindjaEDiellit', 'Dreka', 'Ikindia', 'Akshami', 'Jacia'];

    // Map AlAdhan keys to Albanian keys (for fallback only)
    const aladhanToAlbanian = {
        'Imsak': 'Imsaku',
        'Sunrise': 'LindjaEDiellit',
        'Dhuhr': 'Dreka',
        'Asr': 'Ikindia',
        'Maghrib': 'Akshami',
        'Isha': 'Jacia'
    };

    // Display labels for the UI
    const displayLabels = {
        'Imsaku': 'Imsaku',
        'LindjaEDiellit': 'Lindja e Diellit',
        'Dreka': 'Dreka',
        'Ikindia': 'Ikindia',
        'Akshami': 'Akshami',
        'Jacia': 'Jacia'
    };

    // Notification labels for each prayer
    const notifLabels = {
        'Imsaku': 'Imsaku (Syfyri)',
        'LindjaEDiellit': 'Lindja e Diellit',
        'Dreka': 'Dreka',
        'Ikindia': 'Ikindia',
        'Akshami': 'Akshami (Iftari)',
        'Jacia': 'Jacia'
    };

    // Duas
    const duAs = {
        iftar: {
            arabic: "اللَّهُمَّ اِنِّى لَكَ صُمْتُ وَبِك اَمَنْتُ وَعَلَيْكَ تَوَكَّلْتُ وَعَلَى رِزْقِكَ اَفْطَرْتُ",
            translation: "O Zot! Për Ty agjërova, në Ty besova, në Ty u mbështeta dhe me furnizimin Tënd e çela iftarin."
        },
        suhoor: {
            arabic: "وَبِصَوْمِ غَدٍ نَّوَيْتُ مِنْ شَهْرِ رَمَضَانَ",
            translation: "Kam për qëllim të agjëroj nesër në muajin e Ramazanit."
        }
    };

    // =============================================
    //  SURAH METADATA (114 Surahs)
    // =============================================
    const SURAHS = [
        { number: 1, name: "El-Fatiha", arabic: "الفاتحة", verses: 7, type: "Mekase" },
        { number: 2, name: "El-Bekare", arabic: "البقرة", verses: 286, type: "Medinase" },
        { number: 3, name: "Ali Imran", arabic: "آل عمران", verses: 200, type: "Medinase" },
        { number: 4, name: "En-Nisa", arabic: "النساء", verses: 176, type: "Medinase" },
        { number: 5, name: "El-Maide", arabic: "المائدة", verses: 120, type: "Medinase" },
        { number: 6, name: "El-En'am", arabic: "الأنعام", verses: 165, type: "Mekase" },
        { number: 7, name: "El-A'raf", arabic: "الأعراف", verses: 206, type: "Mekase" },
        { number: 8, name: "El-Enfal", arabic: "الأنفال", verses: 75, type: "Medinase" },
        { number: 9, name: "Et-Teube", arabic: "التوبة", verses: 129, type: "Medinase" },
        { number: 10, name: "Junus", arabic: "يونس", verses: 109, type: "Mekase" },
        { number: 11, name: "Hud", arabic: "هود", verses: 123, type: "Mekase" },
        { number: 12, name: "Jusuf", arabic: "يوسف", verses: 111, type: "Mekase" },
        { number: 13, name: "Er-Ra'd", arabic: "الرعد", verses: 43, type: "Medinase" },
        { number: 14, name: "Ibrahim", arabic: "إبراهيم", verses: 52, type: "Mekase" },
        { number: 15, name: "El-Hixhr", arabic: "الحجر", verses: 99, type: "Mekase" },
        { number: 16, name: "En-Nahl", arabic: "النحل", verses: 128, type: "Mekase" },
        { number: 17, name: "El-Isra", arabic: "الإسراء", verses: 111, type: "Mekase" },
        { number: 18, name: "El-Kehf", arabic: "الكهف", verses: 110, type: "Mekase" },
        { number: 19, name: "Merjem", arabic: "مريم", verses: 98, type: "Mekase" },
        { number: 20, name: "Ta-Ha", arabic: "طه", verses: 135, type: "Mekase" },
        { number: 21, name: "El-Enbija", arabic: "الأنبياء", verses: 112, type: "Mekase" },
        { number: 22, name: "El-Haxhxh", arabic: "الحج", verses: 78, type: "Medinase" },
        { number: 23, name: "El-Mu'minun", arabic: "المؤمنون", verses: 118, type: "Mekase" },
        { number: 24, name: "En-Nur", arabic: "النور", verses: 64, type: "Medinase" },
        { number: 25, name: "El-Furkan", arabic: "الفرقان", verses: 77, type: "Mekase" },
        { number: 26, name: "Esh-Shu'ara", arabic: "الشعراء", verses: 227, type: "Mekase" },
        { number: 27, name: "En-Neml", arabic: "النمل", verses: 93, type: "Mekase" },
        { number: 28, name: "El-Kasas", arabic: "القصص", verses: 88, type: "Mekase" },
        { number: 29, name: "El-Ankebut", arabic: "العنكبوت", verses: 69, type: "Mekase" },
        { number: 30, name: "Er-Rum", arabic: "الروم", verses: 60, type: "Mekase" },
        { number: 31, name: "Llukman", arabic: "لقمان", verses: 34, type: "Mekase" },
        { number: 32, name: "Es-Sexhde", arabic: "السجدة", verses: 30, type: "Mekase" },
        { number: 33, name: "El-Ahzab", arabic: "الأحزاب", verses: 73, type: "Medinase" },
        { number: 34, name: "Sebe'", arabic: "سبأ", verses: 54, type: "Mekase" },
        { number: 35, name: "Fatir", arabic: "فاطر", verses: 45, type: "Mekase" },
        { number: 36, name: "Ja-Sin", arabic: "يس", verses: 83, type: "Mekase" },
        { number: 37, name: "Es-Saffat", arabic: "الصافات", verses: 182, type: "Mekase" },
        { number: 38, name: "Sad", arabic: "ص", verses: 88, type: "Mekase" },
        { number: 39, name: "Ez-Zumer", arabic: "الزمر", verses: 75, type: "Mekase" },
        { number: 40, name: "Gafir", arabic: "غافر", verses: 85, type: "Mekase" },
        { number: 41, name: "Fussilet", arabic: "فصلت", verses: 54, type: "Mekase" },
        { number: 42, name: "Esh-Shura", arabic: "الشورى", verses: 53, type: "Mekase" },
        { number: 43, name: "Ez-Zuhruf", arabic: "الزخرف", verses: 89, type: "Mekase" },
        { number: 44, name: "Ed-Duhan", arabic: "الدخان", verses: 59, type: "Mekase" },
        { number: 45, name: "El-Xhathije", arabic: "الجاثية", verses: 37, type: "Mekase" },
        { number: 46, name: "El-Ahkaf", arabic: "الأحقاف", verses: 35, type: "Mekase" },
        { number: 47, name: "Muhammed", arabic: "محمد", verses: 38, type: "Medinase" },
        { number: 48, name: "El-Fet'h", arabic: "الفتح", verses: 29, type: "Medinase" },
        { number: 49, name: "El-Huxhurat", arabic: "الحجرات", verses: 18, type: "Medinase" },
        { number: 50, name: "Kaf", arabic: "ق", verses: 45, type: "Mekase" },
        { number: 51, name: "Edh-Dharijat", arabic: "الذاريات", verses: 60, type: "Mekase" },
        { number: 52, name: "Et-Tur", arabic: "الطور", verses: 49, type: "Mekase" },
        { number: 53, name: "En-Nexhm", arabic: "النجم", verses: 62, type: "Mekase" },
        { number: 54, name: "El-Kamer", arabic: "القمر", verses: 55, type: "Mekase" },
        { number: 55, name: "Er-Rahman", arabic: "الرحمن", verses: 78, type: "Medinase" },
        { number: 56, name: "El-Vaki'a", arabic: "الواقعة", verses: 96, type: "Mekase" },
        { number: 57, name: "El-Hadid", arabic: "الحديد", verses: 29, type: "Medinase" },
        { number: 58, name: "El-Muxhadele", arabic: "المجادلة", verses: 22, type: "Medinase" },
        { number: 59, name: "El-Hashr", arabic: "الحشر", verses: 24, type: "Medinase" },
        { number: 60, name: "El-Mumtehine", arabic: "الممتحنة", verses: 13, type: "Medinase" },
        { number: 61, name: "Es-Saff", arabic: "الصف", verses: 14, type: "Medinase" },
        { number: 62, name: "El-Xhumu'a", arabic: "الجمعة", verses: 11, type: "Medinase" },
        { number: 63, name: "El-Munafikun", arabic: "المنافقون", verses: 11, type: "Medinase" },
        { number: 64, name: "Et-Tegabun", arabic: "التغابن", verses: 18, type: "Medinase" },
        { number: 65, name: "Et-Talak", arabic: "الطلاق", verses: 12, type: "Medinase" },
        { number: 66, name: "Et-Tahrim", arabic: "التحريم", verses: 12, type: "Medinase" },
        { number: 67, name: "El-Mulk", arabic: "الملك", verses: 30, type: "Mekase" },
        { number: 68, name: "El-Kalem", arabic: "القلم", verses: 52, type: "Mekase" },
        { number: 69, name: "El-Hakka", arabic: "الحاقة", verses: 52, type: "Mekase" },
        { number: 70, name: "El-Me'arixh", arabic: "المعارج", verses: 44, type: "Mekase" },
        { number: 71, name: "Nuh", arabic: "نوح", verses: 28, type: "Mekase" },
        { number: 72, name: "El-Xhinn", arabic: "الجن", verses: 28, type: "Mekase" },
        { number: 73, name: "El-Muzzemmil", arabic: "المزمل", verses: 20, type: "Mekase" },
        { number: 74, name: "El-Muddethir", arabic: "المدثر", verses: 56, type: "Mekase" },
        { number: 75, name: "El-Kijame", arabic: "القيامة", verses: 40, type: "Mekase" },
        { number: 76, name: "El-Insan", arabic: "الإنسان", verses: 31, type: "Medinase" },
        { number: 77, name: "El-Murselat", arabic: "المرسلات", verses: 50, type: "Mekase" },
        { number: 78, name: "En-Nebe'", arabic: "النبأ", verses: 40, type: "Mekase" },
        { number: 79, name: "En-Nazi'at", arabic: "النازعات", verses: 46, type: "Mekase" },
        { number: 80, name: "Abese", arabic: "عبس", verses: 42, type: "Mekase" },
        { number: 81, name: "Et-Tekvir", arabic: "التكوير", verses: 29, type: "Mekase" },
        { number: 82, name: "El-Infitar", arabic: "الانفطار", verses: 19, type: "Mekase" },
        { number: 83, name: "El-Mutaffifin", arabic: "المطففين", verses: 36, type: "Mekase" },
        { number: 84, name: "El-Inshikak", arabic: "الانشقاق", verses: 25, type: "Mekase" },
        { number: 85, name: "El-Buruxh", arabic: "البروج", verses: 22, type: "Mekase" },
        { number: 86, name: "Et-Tarik", arabic: "الطارق", verses: 17, type: "Mekase" },
        { number: 87, name: "El-A'la", arabic: "الأعلى", verses: 19, type: "Mekase" },
        { number: 88, name: "El-Gashije", arabic: "الغاشية", verses: 26, type: "Mekase" },
        { number: 89, name: "El-Fexhr", arabic: "الفجر", verses: 30, type: "Mekase" },
        { number: 90, name: "El-Beled", arabic: "البلد", verses: 20, type: "Mekase" },
        { number: 91, name: "Esh-Shems", arabic: "الشمس", verses: 15, type: "Mekase" },
        { number: 92, name: "El-Lejl", arabic: "الليل", verses: 21, type: "Mekase" },
        { number: 93, name: "Ed-Duha", arabic: "الضحى", verses: 11, type: "Mekase" },
        { number: 94, name: "El-Inshirah", arabic: "الشرح", verses: 8, type: "Mekase" },
        { number: 95, name: "Et-Tin", arabic: "التين", verses: 8, type: "Mekase" },
        { number: 96, name: "El-Alek", arabic: "العلق", verses: 19, type: "Mekase" },
        { number: 97, name: "El-Kadr", arabic: "القدر", verses: 5, type: "Mekase" },
        { number: 98, name: "El-Bejjine", arabic: "البينة", verses: 8, type: "Medinase" },
        { number: 99, name: "Ez-Zelzele", arabic: "الزلزلة", verses: 8, type: "Medinase" },
        { number: 100, name: "El-Adijat", arabic: "العاديات", verses: 11, type: "Mekase" },
        { number: 101, name: "El-Kari'a", arabic: "القارعة", verses: 11, type: "Mekase" },
        { number: 102, name: "Et-Tekathur", arabic: "التكاثر", verses: 8, type: "Mekase" },
        { number: 103, name: "El-Asr", arabic: "العصر", verses: 3, type: "Mekase" },
        { number: 104, name: "El-Humeze", arabic: "الهمزة", verses: 9, type: "Mekase" },
        { number: 105, name: "El-Fil", arabic: "الفيل", verses: 5, type: "Mekase" },
        { number: 106, name: "Kurejsh", arabic: "قريش", verses: 4, type: "Mekase" },
        { number: 107, name: "El-Ma'un", arabic: "الماعون", verses: 7, type: "Mekase" },
        { number: 108, name: "El-Keuther", arabic: "الكوثر", verses: 3, type: "Mekase" },
        { number: 109, name: "El-Kafirun", arabic: "الكافرون", verses: 6, type: "Mekase" },
        { number: 110, name: "En-Nasr", arabic: "النصر", verses: 3, type: "Medinase" },
        { number: 111, name: "El-Mesed", arabic: "المسد", verses: 5, type: "Mekase" },
        { number: 112, name: "El-Ihlas", arabic: "الإخلاص", verses: 4, type: "Mekase" },
        { number: 113, name: "El-Felak", arabic: "الفلق", verses: 5, type: "Mekase" },
        { number: 114, name: "En-Nas", arabic: "الناس", verses: 6, type: "Mekase" }
    ];

    // Bismillah text
    const BISMILLAH = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";

    // --- Initialization ---
    init();

    function init() {
        updateNotifyButton();
        fetchPrayerTimes();
        setupNavigation();
        setupQuranEvents();
        setupSettingsEvents();
        setupMoreEvents();
        setupQiblaEvents();
    }

    // =============================================
    //  NAVIGATION
    // =============================================
    function setupNavigation() {
        navTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const viewId = tab.dataset.view;
                switchView(viewId);
            });
        });
    }

    function switchView(viewId) {
        // Pause audio if leaving quran-view
        if (viewId !== 'quran-view' && !surahAudio.paused) {
            surahAudio.pause();
            audioPlayBtn.innerHTML = '<span class="audio-icon">▶</span>';
        }

        // Update tabs
        navTabs.forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-view="${viewId}"]`).classList.add('active');

        // Update views
        prayerView.classList.add('hidden');
        quranView.classList.add('hidden');
        qiblaView.classList.add('hidden');
        moreView.classList.add('hidden');

        if (viewId === 'prayer-view') {
            prayerView.classList.remove('hidden');
        } else if (viewId === 'quran-view') {
            quranView.classList.remove('hidden');
            if (!surahListRendered) {
                renderSurahList();
                surahListRendered = true;
            }
        } else if (viewId === 'qibla-view') {
            qiblaView.classList.remove('hidden');
        } else if (viewId === 'more-view') {
            moreView.classList.remove('hidden');
        }
    }

    // =============================================
    //  QUR'AN MODULE
    // =============================================
    function setupQuranEvents() {
        // Search
        surahSearchInput.addEventListener('input', () => {
            const query = surahSearchInput.value.toLowerCase().trim();
            filterSurahList(query);
        });

        // Back button
        readerBackBtn.addEventListener('click', () => {
            if (!surahAudio.paused) {
                surahAudio.pause();
                audioPlayBtn.innerHTML = '<span class="audio-icon">▶</span> Ndëgjo';
            }
            showSurahList();
        });

        // Prev/Next surah
        prevSurahBtn.addEventListener('click', () => {
            if (currentSurah && currentSurah > 1) {
                openSurah(currentSurah - 1);
            }
        });

        nextSurahBtn.addEventListener('click', () => {
            if (currentSurah && currentSurah < 114) {
                openSurah(currentSurah + 1);
            }
        });
    }

    function setupSettingsEvents() {
        showArabicCheckbox.addEventListener('change', updateVerseVisibility);
        showTranslationCheckbox.addEventListener('change', updateVerseVisibility);
        showTransliterationCheckbox.addEventListener('change', updateVerseVisibility);

        audioPlayBtn.addEventListener('click', toggleAudio);
        audioProgress.addEventListener('input', () => {
            if (surahAudio.duration) {
                surahAudio.currentTime = (audioProgress.value / 100) * surahAudio.duration;
            }
        });
        
        surahAudio.addEventListener('timeupdate', () => {
            if (surahAudio.duration) {
                const percent = (surahAudio.currentTime / surahAudio.duration) * 100;
                audioProgress.value = percent;
                audioTimeCurrent.textContent = formatTime(surahAudio.currentTime);
            }
        });

        surahAudio.addEventListener('ended', () => {
            audioPlayBtn.innerHTML = '<span class="audio-icon">▶</span> Ndëgjo';
            audioProgress.value = 0;
            audioTimeCurrent.textContent = "0:00";
        });

        surahAudio.addEventListener('loadedmetadata', () => {
            audioTimeTotal.textContent = formatTime(surahAudio.duration);
            audioProgressContainer.classList.remove('hidden');
        });
    }

    function updateVerseVisibility() {
        const showAr = showArabicCheckbox.checked;
        const showTr = showTranslationCheckbox.checked;
        const showTl = showTransliterationCheckbox.checked;

        document.querySelectorAll('.verse-arabic').forEach(el => el.style.display = showAr ? 'block' : 'none');
        document.querySelectorAll('.verse-translation').forEach(el => el.style.display = showTr ? 'block' : 'none');
        document.querySelectorAll('.verse-transliteration').forEach(el => el.style.display = showTl ? 'block' : 'none');
    }

    function toggleAudio() {
        if (surahAudio.paused) {
            surahAudio.play();
            audioPlayBtn.innerHTML = '<span class="audio-icon">⏸</span> Pauzo';
        } else {
            surahAudio.pause();
            audioPlayBtn.innerHTML = '<span class="audio-icon">▶</span> Ndëgjo';
        }
    }

    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    function renderSurahList() {
        surahListEl.innerHTML = '';
        SURAHS.forEach(surah => {
            const card = document.createElement('div');
            card.className = 'surah-card';
            card.dataset.number = surah.number;
            card.dataset.name = surah.name.toLowerCase();
            card.dataset.arabic = surah.arabic;

            card.innerHTML = `
                <div class="surah-number">${surah.number}</div>
                <div class="surah-info">
                    <div class="surah-name-alb">${surah.name}</div>
                    <div class="surah-meta">${surah.verses} ajete · ${surah.type}</div>
                </div>
                <div class="surah-name-ar">${surah.arabic}</div>
            `;

            card.addEventListener('click', () => openSurah(surah.number));
            surahListEl.appendChild(card);
        });

        // Highlight last read
        const lastRead = localStorage.getItem('lastReadSurah');
        if (lastRead) {
            const card = surahListEl.querySelector(`[data-number="${lastRead}"]`);
            if (card) {
                card.style.borderColor = 'var(--accent)';
                card.style.background = 'rgba(202, 138, 4, 0.06)';
            }
        }
    }

    function filterSurahList(query) {
        const cards = surahListEl.querySelectorAll('.surah-card');
        cards.forEach(card => {
            const name = card.dataset.name;
            const number = card.dataset.number;
            const arabic = card.dataset.arabic;
            const match = name.includes(query) || number.includes(query) || arabic.includes(query);
            card.style.display = match ? '' : 'none';
        });
    }

    function showSurahList() {
        surahReader.classList.add('hidden');
        surahListContainer.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function openSurah(surahNumber) {
        currentSurah = surahNumber;
        const surah = SURAHS[surahNumber - 1];

        // Save last read
        localStorage.setItem('lastReadSurah', surahNumber);

        // Switch to reader
        surahListContainer.classList.add('hidden');
        surahReader.classList.remove('hidden');
        readerVerses.innerHTML = '';
        readerLoading.classList.remove('hidden');

        // Set header info
        readerSurahName.textContent = surah.name;
        readerSurahArabic.textContent = surah.arabic;
        readerAyahCount.textContent = `${surah.verses} ajete`;

        // Update nav buttons
        prevSurahBtn.disabled = surahNumber === 1;
        nextSurahBtn.disabled = surahNumber === 114;

        if (surahNumber > 1) {
            prevSurahBtn.textContent = `← ${SURAHS[surahNumber - 2].name}`;
        } else {
            prevSurahBtn.textContent = '← Surja e mëparshme';
        }
        if (surahNumber < 114) {
            nextSurahBtn.textContent = `${SURAHS[surahNumber].name} →`;
        } else {
            nextSurahBtn.textContent = 'Surja tjetër →';
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });

        try {
            // Fetch Arabic, Albanian, and Transliteration
            const [arabicRes, albanianRes, transRes] = await Promise.all([
                fetch(`${QURAN_API_BASE}/editions/${ARABIC_EDITION}/${surahNumber}.json`),
                fetch(`${QURAN_API_BASE}/editions/${ALBANIAN_EDITION}/${surahNumber}.json`),
                fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/en.transliteration`)
            ]);

            const arabicData = await arabicRes.json();
            const albanianData = await albanianRes.json();
            let transVerses = [];
            
            if (transRes.ok) {
                const transData = await transRes.json();
                transVerses = transData.data.ayahs.map(a => ({ text: a.text }));
            }

            // Prep Audio
            surahAudio.src = `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${surahNumber}.mp3`;
            surahAudio.load();
            audioPlayBtn.innerHTML = '<span class="audio-icon">▶</span> Ndëgjo';
            audioProgressContainer.classList.add('hidden');
            audioProgress.value = 0;
            audioTimeCurrent.textContent = "0:00";

            readerLoading.classList.add('hidden');
            renderVerses(surahNumber, arabicData.chapter, albanianData.chapter, transVerses);
            updateVerseVisibility(); // Apply current toggles
        } catch (err) {
            console.error('Failed to fetch surah:', err);
            readerLoading.classList.add('hidden');
            readerVerses.innerHTML = `
                <div style="text-align:center; color:var(--text-secondary); padding:2rem;">
                    <p>Gabim gjatë ngarkimit të sures.</p>
                    <p style="font-size:0.85rem;">Kontrollo lidhjen e internetit dhe provo përsëri.</p>
                    <button class="reader-btn" onclick="location.reload()" style="margin-top:1rem;">Ringarko</button>
                </div>
            `;
        }
    }

    function renderVerses(surahNumber, arabicVerses, albanianVerses, transliterationVerses) {
        readerVerses.innerHTML = '';

        // Add Bismillah for all surahs except Al-Fatiha (already has it as verse 1) and At-Tawba (no bismillah)
        if (surahNumber !== 1 && surahNumber !== 9) {
            const bismillahDiv = document.createElement('div');
            bismillahDiv.className = 'bismillah';
            bismillahDiv.textContent = BISMILLAH;
            readerVerses.appendChild(bismillahDiv);
        }

        arabicVerses.forEach((arVerse, index) => {
            const albVerse = albanianVerses[index];
            const trVerse = transliterationVerses[index];
            const card = document.createElement('div');
            card.className = 'verse-card';
            card.style.animationDelay = `${Math.min(index * 0.03, 0.5)}s`;

            card.innerHTML = `
                <div class="verse-number-badge">${arVerse.verse}</div>
                <div class="verse-arabic">${arVerse.text}</div>
                <div class="verse-transliteration">${trVerse ? trVerse.text : ''}</div>
                <div class="verse-translation">${albVerse ? albVerse.text : ''}</div>
            `;

            readerVerses.appendChild(card);
        });
    }

    // =============================================
    //  PRAYER TIMES (Original code preserved)
    // =============================================

    function getTodayDateStr() {
        const date = new Date();
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();
        return `${d}-${m}-${y}`;
    }

    async function fetchPrayerTimes() {
        locationText.textContent = 'Kosovë';

        try {
            // Since we're running locally, we should try falling back to AlAdhan directly first
            const dateStr = getTodayDateStr();
            const url = ALADHAN_FALLBACK_URL.replace('{DATE}', dateStr);
            const response = await fetch(url);
            const data = await response.json();

            if (data.code === 200) {
                const timings = data.data.timings;
                prayerTimes = {};
                for (const [aladhanKey, albanianKey] of Object.entries(aladhanToAlbanian)) {
                    prayerTimes[albanianKey] = timings[aladhanKey];
                }
                displayPrayerList(prayerTimes);
                startCountdown();
            } else {
                loadingDiv.textContent = "Gabim gjatë marrjes së kohëve.";
                console.error(data);
            }
        } catch (error) {
            console.error("API Error:", error);
            loadingDiv.textContent = "Gabim rrjeti. Kontrollo lidhjen.";
        }
    }

    function displayPrayerList(timings) {
        prayersUl.innerHTML = '';

        prayerDisplayOrder.forEach(key => {
            if (!timings[key]) return;

            const li = document.createElement('li');
            li.className = 'prayer-item';
            li.dataset.prayerKey = key;

            const nameSpan = document.createElement('span');
            nameSpan.className = 'prayer-name';
            nameSpan.textContent = displayLabels[key] || key;

            const timeSpan = document.createElement('span');
            timeSpan.className = 'prayer-time';
            timeSpan.textContent = timings[key];

            li.appendChild(nameSpan);
            li.appendChild(timeSpan);
            prayersUl.appendChild(li);
        });
    }

    // --- Countdown Logic ---
    function startCountdown() {
        loadingDiv.classList.add('hidden');
        timerContainer.classList.remove('hidden');
        duaContainer.classList.remove('hidden');

        if (countdownInterval) clearInterval(countdownInterval);

        updateTimer();
        countdownInterval = setInterval(updateTimer, 1000);
    }

    function updateTimer() {
        if (!prayerTimes) return;

        const now = new Date();
        const imsakuTime = parseTime(prayerTimes.Imsaku);
        const akshamiTime = parseTime(prayerTimes.Akshami);

        let targetTime, eventName, nextDua;

        document.querySelectorAll('.prayer-item').forEach(el => el.classList.remove('active'));

        if (now < imsakuTime) {
            targetTime = imsakuTime;
            eventName = "Syfyr (Imsak)";
            nextDua = duAs.suhoor;
            duaTypeEl.textContent = "Syfyrin";
            highlightPrayer('Imsaku');
        } else if (now >= imsakuTime && now < akshamiTime) {
            targetTime = akshamiTime;
            eventName = "Iftar (Aksham)";
            nextDua = duAs.iftar;
            duaTypeEl.textContent = "Iftarin";
            highlightPrayer('Akshami');
        } else {
            targetTime = new Date(imsakuTime);
            targetTime.setDate(targetTime.getDate() + 1);
            eventName = "Syfyr (Imsak)";
            nextDua = duAs.suhoor;
            duaTypeEl.textContent = "Syfyrin";
            highlightPrayer('Imsaku');
        }

        nextEventLabel.textContent = `Koha deri në ${eventName}`;
        nextEventTimeEl.textContent = `në ${prayerTimes[targetTime === akshamiTime ? 'Akshami' : 'Imsaku']}`;
        duaArabicEl.textContent = nextDua.arabic;
        duaTranslationEl.textContent = nextDua.translation;

        const diff = targetTime - now;

        if (diff <= 0) {
            countdownEl.textContent = "00:00:00";
            return;
        }

        // --- Prayer time notifications ---
        checkPrayerNotifications(now);

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        countdownEl.textContent =
            `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    // --- Prayer Notifications ---
    function checkPrayerNotifications(now) {
        if (Notification.permission !== 'granted') return;

        // Reset notifications at midnight
        if (now.getHours() === 0 && now.getMinutes() === 0 && now.getSeconds() < 2) {
            notified = {};
        }

        for (const key of prayerDisplayOrder) {
            if (!prayerTimes[key] || notified[key]) continue;

            const prayerTime = parseTime(prayerTimes[key]);
            const diffMs = now - prayerTime;

            // Notify if we are within 60 seconds after the prayer time
            if (diffMs >= 0 && diffMs < 60000) {
                notified[key] = true;
                const label = notifLabels[key] || key;
                sendNotification(`${label} — ${prayerTimes[key]}`, `Koha e ${label} ka ardhur.`);
            }
        }
    }

    function highlightPrayer(prayerKey) {
        const items = document.querySelectorAll('.prayer-item');
        items.forEach(item => {
            if (item.dataset.prayerKey === prayerKey) {
                item.classList.add('active');
            }
        });
    }

    // --- Helpers ---
    function parseTime(timeStr) {
        const cleanTime = timeStr.split(' ')[0];
        const [hours, minutes] = cleanTime.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    }

    // --- Notifications ---
    function updateNotifyButton() {
        if (!("Notification" in window)) {
            notifyBtn.textContent = "Njoftimet nuk mbështeten";
            notifyBtn.disabled = true;
            return;
        }
        if (Notification.permission === "granted") {
            notifyBtn.textContent = "✓ Njoftimet aktive";
            notifyBtn.style.opacity = '0.6';
        } else if (Notification.permission === "denied") {
            notifyBtn.textContent = "Njoftimet të bllokuara";
            notifyBtn.style.opacity = '0.6';
        } else {
            notifyBtn.textContent = "Aktivizo Njoftimet";
            notifyBtn.style.opacity = '1';
        }
    }

    notifyBtn.addEventListener('click', () => {
        if (!("Notification" in window)) {
            alert("Ky shfletues nuk i mbështet njoftimet.");
            return;
        }
        if (Notification.permission === "granted") {
            sendNotification("Njoftimet janë aktive!", "Do të njoftoheni kur të vijë koha e namazit.");
            return;
        }
        if (Notification.permission === "denied") {
            alert("Njoftimet janë të bllokuara. Ju lutem lejoni njoftimet në cilësimet e shfletuesit.");
            return;
        }
        Notification.requestPermission().then(permission => {
            updateNotifyButton();
            if (permission === "granted") {
                sendNotification("Njoftimet u aktivizuan!", "Do të njoftoheni kur të vijë koha e namazit.");
            }
        });
    });

    function sendNotification(title, body) {
        if (Notification.permission === "granted") {
            new Notification(title, {
                body: body || '',
                icon: 'icon.png',
                badge: 'icon.png'
            });
        }
    }

    // =============================================
    //  MORE TAB (Burime tjera)
    // =============================================
    function setupMoreEvents() {
        openNamesBtn.addEventListener('click', () => {
            namesModal.classList.remove('hidden');
            if (!namesLoaded) fetch99Names();
        });

        openDhikrBtn.addEventListener('click', () => {
            dhikrModal.classList.remove('hidden');
        });

        openAbdestBtn.addEventListener('click', () => {
            abdestModal.classList.remove('hidden');
        });

        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                btn.closest('.modal').classList.add('hidden');
            });
        });

        // Close when clicking outside content
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            });
        });

        // Dhikr Logic
        dhikrTapBtn.addEventListener('click', () => {
            dhikrCount++;
            updateDhikrDisplay();
            
            // Haptic feedback if supported
            if (navigator.vibrate) navigator.vibrate(50);
        });

        dhikrResetBtn.addEventListener('click', () => {
            dhikrCount = 0;
            updateDhikrDisplay();
        });

        dhikrGoalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                dhikrGoalBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const target = btn.dataset.target;
                if (target === 'infinity') {
                    dhikrGoal = Infinity;
                } else {
                    dhikrGoal = parseInt(target, 10);
                }
                
                dhikrCount = 0;
                updateDhikrDisplay();
            });
        });
    }

    function updateDhikrDisplay() {
        dhikrCountDisplay.textContent = dhikrCount;
        if (dhikrGoal !== Infinity) {
            dhikrGoalDisplay.textContent = `Nga ${dhikrGoal}`;
            if (dhikrCount >= dhikrGoal) {
                if (navigator.vibrate) navigator.vibrate([100, 50, 100]); // long vibrate
                dhikrCount = 0; // reset automatically
            }
        } else {
            dhikrGoalDisplay.textContent = "I pafundëm";
        }
    }

    async function fetch99Names() {
        namesList.innerHTML = '<div class="loading">Duke ngarkuar...</div>';
        try {
            const res = await fetch('https://api.aladhan.com/v1/asmaAlHusna');
            const data = await res.json();
            
            if (data.code === 200) {
                namesList.innerHTML = '';
                data.data.forEach(name => {
                    let transliterationRaw = name.transliteration;
                    
                    // Sanitize the search key (remove all non-alphabetic chars and lower case)
                    let searchKey = transliterationRaw.replace(/[^a-zA-Z]/g, '').toLowerCase();
                    let albMeaning = null;

                    if (typeof alb99Names !== 'undefined') {
                        // Find a match in the dictionary using the sanitized key
                        for (const [key, val] of Object.entries(alb99Names)) {
                            if (key.replace(/[^a-zA-Z]/g, '').toLowerCase() === searchKey) {
                                albMeaning = val;
                                break;
                            }
                        }
                    }
                    
                    if (!albMeaning) {
                        // Fallback loosely just in case
                        albMeaning = name.en.meaning; 
                    }

                    const el = document.createElement('div');
                    el.className = 'name-item';
                    el.innerHTML = `
                        <div class="name-arabic">${name.name}</div>
                        <div class="name-transliteration">${transliterationRaw}</div>
                        <div class="name-english">${name.en.meaning}</div>
                        <div class="name-albanian">${albMeaning}</div>
                    `;
                    namesList.appendChild(el);
                });
                namesLoaded = true;
            }
        } catch (e) {
            namesList.innerHTML = '<p style="text-align:center;color:var(--text-secondary);">Gabim gjatë ngarkimit. Provo përsëri më vonë.</p>';
        }
    }

    // =============================================
    //  QIBLA COMPASS
    // =============================================
    function setupQiblaEvents() {
        calibrateCompassBtn.addEventListener('click', requestCompassPermission);
    }

    function requestCompassPermission() {
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        startCompass();
                    } else {
                        qiblaStatus.textContent = "Leja u refuzua. Busulla nuk mund të funksionojë.";
                    }
                })
                .catch(console.error);
        } else {
            // Non iOS 13+ devices
            startCompass();
        }
    }

    function startCompass() {
        calibrateCompassBtn.classList.add('hidden');
        qiblaStatus.textContent = "Lëvizni pajisjen në formë numrit 8 për të kalibruar (Mbajeni pajisjen rafsh).";
        
        // Use a fixed bearing of 137 degrees from Kosovo to Mecca (approximate).
        // Since we don't fetch exact user GPS to keep it simple and private, 137 works perfectly for Kosovo.
        
        window.addEventListener('deviceorientationabsolute', handleOrientation, true);
        
        // Fallback for devices that only support deviceorientation
        if (!('ondeviceorientationabsolute' in window)) {
            window.addEventListener('deviceorientation', handleOrientation, true);
        }
    }

    function handleOrientation(event) {
        let alpha = event.alpha; // Compass heading if available directly
        
        // Attempt to get absolute heading if webkit is used
        if (event.webkitCompassHeading) {
            alpha = event.webkitCompassHeading;
        } else if (alpha !== null) {
            // Absolute alpha is 0 at North, goes counter-clockwise. Webkit heading is 0 at North, clockwise.
            // Converting alpha to standard compass heading degrees (0-360):
            alpha = 360 - alpha;
        }

        if (alpha !== null) {
            // Rotate the compass inner container (so N, E, S, W stay at absolute bearings)
            compassInner.style.transform = `rotate(${-alpha}deg)`;
            
            // Calculate Kaaba rotation relative to the phone's current facing direction
            // The phone points to 'alpha' from North. Kaaba is at 'qiblaHeading' from North.
            const kaabaRelative = qiblaHeading - alpha;
            
            // Rotate the Qibla pointer (arrow + Kaaba icon) to point directly at Mecca
            qiblaPointer.style.transform = `translate(-50%, -100%) rotate(${kaabaRelative}deg)`;
            
            // Update status when pointing right at Qibla (tolerance 5 degrees)
            let diff = Math.abs(kaabaRelative);
            if (diff > 180) diff = 360 - diff;
            
            if (diff < 5) {
                qiblaStatus.textContent = "Ju jeni drejtuar nga Qabja! 🕋";
                qiblaStatus.style.color = "var(--accent)";
                if (navigator.vibrate) navigator.vibrate(100);
            } else {
                qiblaStatus.textContent = "Ndiqni shigjetën drejt ikonës së Qabes.";
                qiblaStatus.style.color = "var(--text-secondary)";
            }
        } else {
            qiblaStatus.textContent = "Sensori nuk jep të dhëna.";
        }
    }

});

