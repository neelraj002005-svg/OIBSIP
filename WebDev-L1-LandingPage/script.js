/**
 * FocusFlow — Midnight Blue + Cool Cyan Update
 * Features:
 *  1. Accurate Pomodoro & custom duration timer (00:01–99:59) with Cool Cyan glow, Web Audio chime & browser notifications
 *  2. Local-first task manager with live progress & localStorage persistence
 *  3. Command Palette with keyboard navigation (Ctrl+K / Cmd+K)
 *  4. Streamlined Contact section with direct mailto:neelraj001987@gmail.com button
 *  5. Accessible mobile navigation, professional footer, and toast feedback
 */

(function () {
    'use strict';

    /* ═══════════════════════════════════════════════════════════════════
       STATE MANAGEMENT
       ═══════════════════════════════════════════════════════════════════ */
    const STORAGE_KEY_TASKS = 'focusflow_enhanced_tasks';
    const STORAGE_KEY_SESSIONS = 'focusflow_enhanced_sessions';
    const STORAGE_KEY_NOTIFY = 'focusflow_enhanced_notify';
    const STORAGE_KEY_SOUND = 'focusflow_enhanced_sound'; // backwards-compatibility
    const STORAGE_KEY_CUSTOM_SECS = 'focusflow_enhanced_custom_secs';
    const STORAGE_KEY_SESSIONS_DATE = 'focusflow_enhanced_sessions_date';
    const STORAGE_KEY_AUTOBREAK = 'focusflow_enhanced_autobreak';
    const STORAGE_KEY_THEME = 'focusflow_theme';
    const STORAGE_KEY_WEEK = 'focusflow_sessions_by_date';
    let autoBreakEnabled = true;

    function todayKey() {
        const d = new Date();
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    // Timer State
    let timerDuration = 25 * 60; // seconds
    let timerRemaining = 25 * 60;
    let customDuration = 30 * 60; // default 30 min custom
    let timerInterval = null;
    let timerTargetEnd = null;
    let isTimerRunning = false;
    let currentMode = 'focus'; // 'focus' | 'short' | 'long' | 'custom'
    let notifyEnabled = true;
    let completedSessions = 0;

    // Task State
    let tasks = [];

    // Audio Context (initialized on first user interaction)
    let audioCtx = null;

    /* ═══════════════════════════════════════════════════════════════════
       DOM ELEMENTS
       ═══════════════════════════════════════════════════════════════════ */
    // Timer Elements
    const timeDisplay = document.getElementById('timeDisplay');
    const timerToggleBtn = document.getElementById('timerToggleBtn');
    const timerBtnText = document.getElementById('timerBtnText');
    const timerBtnIcon = document.getElementById('timerBtnIcon');
    const timerResetBtn = document.getElementById('timerResetBtn');
    const ringFill = document.getElementById('ringFill');
    const modeFocusBtn = document.getElementById('modeFocus');
    const modeShortBtn = document.getElementById('modeShort');
    const modeLongBtn = document.getElementById('modeLong');
    const modeCustomBtn = document.getElementById('modeCustom');
    const customTimerPanel = document.getElementById('customTimerPanel');
    const customMinutes = document.getElementById('customMinutes');
    const customSeconds = document.getElementById('customSeconds');
    const customTimerError = document.getElementById('customTimerError');
    const startCustomTimerBtn = document.getElementById('startCustomTimerBtn');
    const cancelCustomTimerBtn = document.getElementById('cancelCustomTimerBtn');
    const customCloseBtn = document.getElementById('customCloseBtn');
    const sessionLabel = document.getElementById('sessionLabel');
    const completedSessionsCount = document.getElementById('completedSessionsCount');
    const pomoDots = document.getElementById('pomoDots');
    const soundToggleBtn = document.getElementById('soundToggleBtn');
    const soundIcon = document.getElementById('soundIcon');
    const soundStatusText = document.getElementById('soundStatusText');
    const startFocusBtn = document.getElementById('startFocusBtn');
    const fullscreenFocusBtn = document.getElementById('fullscreenFocusBtn');
    const focusOverlay = document.getElementById('focusOverlay');
    const focusOverlayExit = document.getElementById('focusOverlayExit');
    const focusOverlayMode = document.getElementById('focusOverlayMode');
    const focusOverlayTime = document.getElementById('focusOverlayTime');
    const focusOverlayRing = document.getElementById('focusOverlayRing');
    const focusOverlayToggle = document.getElementById('focusOverlayToggle');
    const focusOverlayToggleIcon = document.getElementById('focusOverlayToggleIcon');
    const focusOverlayToggleText = document.getElementById('focusOverlayToggleText');
    const weeklyChart = document.getElementById('weeklyChart');
    const weeklyTotalBadge = document.getElementById('weeklyTotalBadge');

    // Task Elements
    const taskForm = document.getElementById('taskForm');
    const taskInput = document.getElementById('taskInput');
    const taskList = document.getElementById('taskList');
    const emptyState = document.getElementById('emptyState');
    const taskRatioBadge = document.getElementById('taskRatioBadge');
    const progressPercentage = document.getElementById('progressPercentage');
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    const taskSummary = document.getElementById('taskSummary');
    const clearCompletedBtn = document.getElementById('clearCompletedBtn');

    // Contact Element
    const contactBtn = document.getElementById('contactBtn');

    // Command Palette Elements
    const cmdPalette = document.getElementById('cmdPalette');
    const cmdTrigger = document.getElementById('cmdTrigger');
    const cmdSearchInput = document.getElementById('cmdSearchInput');
    const cmdResults = document.getElementById('cmdResults');
    const cmdEscBadge = document.getElementById('cmdEscBadge');

    // General Elements
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu') || document.getElementById('nav-menu');
    const toastNotification = document.getElementById('toastNotification');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');
    const currentDateDisplay = document.getElementById('currentDateDisplay');

    const RING_CIRCUMFERENCE = 2 * Math.PI * 100; // 628.318

    /* ═══════════════════════════════════════════════════════════════════
       1. INITIALIZATION
       ═══════════════════════════════════════════════════════════════════ */
    function init() {
        initDateDisplay();
        applyTheme(document.documentElement.getAttribute('data-theme') || 'dark');
        initNotifySettings();
        initSessions();
        initTasks();
        initTimer();
        renderWeeklyChart();
        bindEvents();
    }

    function initDateDisplay() {
        if (!currentDateDisplay) return;
        const now = new Date();
        const options = { weekday: 'long', month: 'short', day: 'numeric' };
        currentDateDisplay.textContent = now.toLocaleDateString('en-US', options);
    }

    function initNotifySettings() {
        const saved = localStorage.getItem(STORAGE_KEY_NOTIFY) ?? localStorage.getItem(STORAGE_KEY_SOUND);
        if (saved !== null) {
            notifyEnabled = saved === 'true';
        }
        const savedCustomSecs = localStorage.getItem(STORAGE_KEY_CUSTOM_SECS);
        if (savedCustomSecs) {
            const parsed = parseInt(savedCustomSecs, 10);
            if (!isNaN(parsed) && parsed >= 1 && parsed <= 5999) {
                customDuration = parsed;
            }
        }
        updateNotifyUI();
        const ab = localStorage.getItem(STORAGE_KEY_AUTOBREAK);
        if (ab !== null) autoBreakEnabled = ab === 'true';
        updateAutoBreakUI();
    }

    function updateAutoBreakUI() {
        const btn = document.getElementById('autoBreakBtn');
        if (!btn) return;
        btn.setAttribute('aria-pressed', String(autoBreakEnabled));
        btn.textContent = autoBreakEnabled ? '⚡ Auto-break: On' : '⚡ Auto-break: Off';
    }

    function toggleAutoBreak() {
        autoBreakEnabled = !autoBreakEnabled;
        localStorage.setItem(STORAGE_KEY_AUTOBREAK, autoBreakEnabled.toString());
        updateAutoBreakUI();
        showToast(autoBreakEnabled ? 'Auto-break On: breaks start by themselves' : 'Auto-break Off', '⚡');
    }

    /* ── Theme (dark / light) ── */
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const btn = document.getElementById('themeToggleBtn');
        if (btn) {
            btn.textContent = theme === 'light' ? '🌙' : '☀️';
            btn.setAttribute('aria-label', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
        }
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', theme === 'light' ? '#F1F5F9' : '#0B1220');
    }

    function toggleTheme() {
        const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        try { localStorage.setItem(STORAGE_KEY_THEME, next); } catch (e) {}
        applyTheme(next);
        showToast(next === 'light' ? 'Light theme' : 'Dark theme', next === 'light' ? '☀️' : '🌙');
    }

    function initSessions() {
        const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
        const savedDate = localStorage.getItem(STORAGE_KEY_SESSIONS_DATE);
        // Daily counter: reset when the saved date is not today
        if (saved !== null && savedDate === todayKey()) {
            completedSessions = parseInt(saved, 10) || 0;
        } else {
            completedSessions = 0;
            localStorage.setItem(STORAGE_KEY_SESSIONS, '0');
            localStorage.setItem(STORAGE_KEY_SESSIONS_DATE, todayKey());
        }
        updateSessionsUI();
    }

    function initTasks() {
        const saved = localStorage.getItem(STORAGE_KEY_TASKS);
        if (saved) {
            try {
                tasks = JSON.parse(saved);
                if (!Array.isArray(tasks)) tasks = [];
            } catch (e) {
                tasks = [];
            }
        }

        // If no tasks exist, pre-populate default tasks
        if (saved === null) { // only first visit gets sample tasks
            tasks = [
                { id: '1', title: 'Morning review & schedule block', completed: true, time: '09:00' },
                { id: '2', title: 'Deep work block: FocusFlow Studio', completed: true, time: '10:00' },
                { id: '3', title: 'Team sync on milestones', completed: false, time: '14:00' },
                { id: '4', title: 'Write daily notes and learnings', completed: false, time: '17:00' },
                { id: '5', title: 'Evening wind-down & plan tomorrow', completed: false, time: '20:00' }
            ];
            saveTasks();
        }
        renderTasks();
    }

    function initTimer() {
        if (!ringFill) return;
        ringFill.style.strokeDasharray = `${RING_CIRCUMFERENCE}`;
        ringFill.style.strokeDashoffset = '0';
        updateTimerDisplay();
    }

    /* ═══════════════════════════════════════════════════════════════════
       2. TIMER LOGIC
       ═══════════════════════════════════════════════════════════════════ */
    function formatTime(totalSeconds) {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    function updateTimerDisplay() {
        if (!timeDisplay || !ringFill) return;
        const timeStr = formatTime(timerRemaining);
        timeDisplay.textContent = timeStr;

        // Calculate progress offset (0 is full, RING_CIRCUMFERENCE is empty)
        const progress = (timerDuration - timerRemaining) / timerDuration;
        const offset = progress * RING_CIRCUMFERENCE;
        ringFill.style.strokeDashoffset = `${offset}`;

        // Document title indicator
        if (isTimerRunning) {
            document.title = `(${timeStr}) FocusFlow`;
        } else {
            document.title = 'FocusFlow — Boost Your Productivity';
        }

        // Sync fullscreen focus overlay
        if (focusOverlay && !focusOverlay.hidden) {
            if (focusOverlayTime) focusOverlayTime.textContent = timeStr;
            if (focusOverlayRing) focusOverlayRing.style.strokeDashoffset = `${offset}`;
            if (focusOverlayMode && sessionLabel) focusOverlayMode.textContent = sessionLabel.textContent;
            updateFocusOverlayToggleUI();
        }
    }

    function startTimer() {
        if (isTimerRunning) return;

        // Initialize Web Audio on user gesture
        ensureAudioContext();

        isTimerRunning = true;
        timerTargetEnd = Date.now() + (timerRemaining * 1000);

        timerBtnText.textContent = 'Pause';
        timerBtnIcon.textContent = '⏸';
        timerToggleBtn.classList.add('running');

        timerInterval = setInterval(() => {
            const now = Date.now();
            const diffSeconds = Math.round((timerTargetEnd - now) / 1000);

            if (diffSeconds <= 0) {
                timerRemaining = 0;
                updateTimerDisplay();
                handleTimerComplete();
            } else {
                timerRemaining = diffSeconds;
                updateTimerDisplay();
            }
        }, 200);

        showToast('Timer started! Keep your focus sharp.', '⏱️');
    }

    function pauseTimer() {
        if (!isTimerRunning) return;

        clearInterval(timerInterval);
        timerInterval = null;
        isTimerRunning = false;

        timerBtnText.textContent = 'Resume';
        timerBtnIcon.textContent = '▶';
        timerToggleBtn.classList.remove('running');
        updateTimerDisplay();
    }

    function toggleTimer() {
        if (isTimerRunning) {
            pauseTimer();
        } else {
            startTimer();
        }
    }

    function resetTimer() {
        pauseTimer();
        timerRemaining = timerDuration;
        if (currentMode === 'focus') {
            timerBtnText.textContent = 'Start Focus';
        } else if (currentMode === 'custom') {
            timerBtnText.textContent = 'Start Custom';
        } else {
            timerBtnText.textContent = 'Start Break';
        }
        timerBtnIcon.textContent = '▶';
        updateTimerDisplay();
        showToast('Timer reset to ' + formatTime(timerDuration), '↺');
    }

    function setTimerMode(mode, minutes, labelText) {
        closeCustomPanel();
        pauseTimer();
        currentMode = mode;
        timerDuration = minutes * 60;
        timerRemaining = timerDuration;
        sessionLabel.textContent = labelText;

        // Update active mode buttons
        [modeFocusBtn, modeShortBtn, modeLongBtn, modeCustomBtn].forEach(btn => {
            if (btn) {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            }
        });

        if (mode === 'focus') {
            modeFocusBtn.classList.add('active');
            modeFocusBtn.setAttribute('aria-selected', 'true');
        } else if (mode === 'short') {
            modeShortBtn.classList.add('active');
            modeShortBtn.setAttribute('aria-selected', 'true');
        } else if (mode === 'long') {
            modeLongBtn.classList.add('active');
            modeLongBtn.setAttribute('aria-selected', 'true');
        }

        if (modeCustomBtn) {
            modeCustomBtn.textContent = 'Custom';
        }

        // Cool Cyan accent stroke
        ringFill.style.stroke = 'var(--accent-cyan)';

        timerBtnText.textContent = mode === 'focus' ? 'Start Focus' : 'Start Break';
        timerBtnIcon.textContent = '▶';
        updateTimerDisplay();
    }

    /* ─── Custom Timer Handlers ─── */
    function openCustomPanel() {
        if (!customTimerPanel) return;
        const mins = Math.floor(customDuration / 60);
        const secs = customDuration % 60;
        if (customMinutes) customMinutes.value = mins;
        if (customSeconds) customSeconds.value = secs < 10 ? `0${secs}` : secs;
        if (customTimerError) customTimerError.textContent = '';
        customTimerPanel.hidden = false;
        if (modeCustomBtn) modeCustomBtn.setAttribute('aria-expanded', 'true');
        if (customMinutes) {
            customMinutes.focus();
            customMinutes.select();
        }
    }

    function closeCustomPanel() {
        if (!customTimerPanel) return;
        customTimerPanel.hidden = true;
        if (customTimerError) customTimerError.textContent = '';
        if (modeCustomBtn) modeCustomBtn.setAttribute('aria-expanded', 'false');
    }

    function handleCustomTimerSubmit() {
        let mins = parseInt(customMinutes.value, 10);
        let secs = parseInt(customSeconds.value, 10);

        if (isNaN(mins) || mins < 0) mins = 0;
        if (isNaN(secs) || secs < 0) secs = 0;

        if (mins > 99) {
            if (customTimerError) customTimerError.textContent = 'Minutes cannot exceed 99.';
            if (customMinutes) customMinutes.focus();
            return;
        }

        if (secs > 59) {
            if (customTimerError) customTimerError.textContent = 'Seconds must be between 00 and 59.';
            if (customSeconds) customSeconds.focus();
            return;
        }

        const totalSeconds = (mins * 60) + secs;
        if (totalSeconds < 1) {
            if (customTimerError) customTimerError.textContent = 'Duration must be between 00:01 and 99:59.';
            if (customMinutes) customMinutes.focus();
            return;
        }

        closeCustomPanel();
        customDuration = totalSeconds;
        localStorage.setItem(STORAGE_KEY_CUSTOM_SECS, customDuration.toString());

        setCustomMode(customDuration, mins, secs);
        startTimer();
    }

    function setCustomMode(totalSeconds, mins, secs) {
        pauseTimer();
        currentMode = 'custom';
        timerDuration = totalSeconds;
        timerRemaining = timerDuration;

        const secText = secs > 0 ? ` ${secs}s` : '';
        sessionLabel.textContent = `Custom (${mins}m${secText})`;

        [modeFocusBtn, modeShortBtn, modeLongBtn, modeCustomBtn].forEach(btn => {
            if (btn) {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            }
        });

        if (modeCustomBtn) {
            modeCustomBtn.classList.add('active');
            modeCustomBtn.setAttribute('aria-selected', 'true');
            modeCustomBtn.textContent = `Custom (${mins}m${secText})`;
        }

        ringFill.style.stroke = 'var(--accent-cyan)';
        timerBtnText.textContent = 'Start Custom';
        timerBtnIcon.textContent = '▶';
        updateTimerDisplay();
    }

    function handleTimerComplete() {
        clearInterval(timerInterval);
        timerInterval = null;
        isTimerRunning = false;

        if (currentMode === 'focus') {
            timerBtnText.textContent = 'Start Focus';
        } else if (currentMode === 'custom') {
            timerBtnText.textContent = 'Start Custom';
        } else {
            timerBtnText.textContent = 'Start Break';
        }
        timerBtnIcon.textContent = '▶';
        timerToggleBtn.classList.remove('running');

        triggerNotification();

        if (currentMode === 'focus') {
            if (localStorage.getItem(STORAGE_KEY_SESSIONS_DATE) !== todayKey()) completedSessions = 0;
            completedSessions++;
            localStorage.setItem(STORAGE_KEY_SESSIONS, completedSessions.toString());
            localStorage.setItem(STORAGE_KEY_SESSIONS_DATE, todayKey());
            updateSessionsUI();
            recordSessionToday();
            showToast('Focus session complete! Take a well-earned break.', '🎉');
            if (autoBreakEnabled) {
                const isLong = completedSessions % 4 === 0;
                setTimeout(() => {
                    if (isTimerRunning || currentMode !== 'focus') return;
                    if (isLong) setTimerMode('long', 15, 'Long Break');
                    else setTimerMode('short', 5, 'Short Break');
                    startTimer();
                    showToast(isLong ? 'Long break started (15 min)' : 'Break started (5 min)', '☕');
                }, 1800);
            }
        } else if (currentMode === 'custom') {
            showToast(`Custom ${formatTime(timerDuration)} session complete!`, '🎯');
        } else {
            showToast('Break completed! Ready to focus again?', '⚡');
            if (autoBreakEnabled) {
                setTimeout(() => {
                    if (isTimerRunning || (currentMode !== 'short' && currentMode !== 'long')) return;
                    setTimerMode('focus', 25, 'Deep Work Block');
                }, 1800);
            }
        }
    }

    function updateSessionsUI() {
        if (!completedSessionsCount || !pomoDots) return;
        completedSessionsCount.textContent = completedSessions.toString();
        const dots = pomoDots.querySelectorAll('.pomo-dot');
        const modulo = completedSessions % 4;
        dots.forEach((dot, index) => {
            if (index < modulo || (completedSessions > 0 && modulo === 0)) {
                dot.classList.add('filled');
            } else {
                dot.classList.remove('filled');
            }
        });
    }

    /* ═══════════════════════════════════════════════════════════════════
       2b. WEEKLY CHART (focus sessions per day, current week Mon-Sun)
       ═══════════════════════════════════════════════════════════════════ */
    function getWeekMap() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_WEEK);
            const parsed = raw ? JSON.parse(raw) : {};
            return (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : {};
        } catch (e) {
            return {};
        }
    }

    function recordSessionToday() {
        const map = getWeekMap();
        const key = todayKey();
        map[key] = (parseInt(map[key], 10) || 0) + 1;
        localStorage.setItem(STORAGE_KEY_WEEK, JSON.stringify(map));
        renderWeeklyChart();
    }

    function renderWeeklyChart() {
        if (!weeklyChart) return;
        const map = getWeekMap();

        // Build Monday..Sunday of the current week
        const now = new Date();
        const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const dow = (monday.getDay() + 6) % 7; // 0 = Monday
        monday.setDate(monday.getDate() - dow);

        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
            const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
            days.push({
                key: key,
                label: d.toLocaleDateString('en-US', { weekday: 'short' }),
                count: parseInt(map[key], 10) || 0,
                isToday: key === todayKey()
            });
        }

        const maxCount = Math.max(1, ...days.map(d => d.count));
        const weekTotal = days.reduce((sum, d) => sum + d.count, 0);

        weeklyChart.innerHTML = '';
        days.forEach(day => {
            const col = document.createElement('div');
            col.className = 'week-day' + (day.isToday ? ' today' : '');

            const countSpan = document.createElement('span');
            countSpan.className = 'week-count';
            countSpan.textContent = day.count > 0 ? day.count.toString() : '';

            const barWrap = document.createElement('div');
            barWrap.className = 'week-bar-wrap';
            const bar = document.createElement('div');
            bar.className = 'week-bar' + (day.count === 0 ? ' empty' : '');
            const heightPct = day.count === 0 ? 3 : Math.max(12, Math.round((day.count / maxCount) * 100));
            bar.style.height = heightPct + '%';
            barWrap.appendChild(bar);

            const labelSpan = document.createElement('span');
            labelSpan.className = 'week-label';
            labelSpan.textContent = day.label;

            col.appendChild(countSpan);
            col.appendChild(barWrap);
            col.appendChild(labelSpan);
            col.title = `${day.label}: ${day.count} session${day.count === 1 ? '' : 's'}`;
            weeklyChart.appendChild(col);
        });

        weeklyChart.setAttribute('aria-label',
            'Focus sessions this week: ' + days.map(d => `${d.label} ${d.count}`).join(', '));

        if (weeklyTotalBadge) {
            weeklyTotalBadge.textContent = `${weekTotal} session${weekTotal === 1 ? '' : 's'} this week`;
        }
    }

    /* ═══════════════════════════════════════════════════════════════════
       2c. FULLSCREEN FOCUS MODE (distraction-free timer overlay)
       ═══════════════════════════════════════════════════════════════════ */
    function updateFocusOverlayToggleUI() {
        if (!focusOverlayToggleText || !focusOverlayToggleIcon) return;
        focusOverlayToggleText.textContent = isTimerRunning ? 'Pause' : (timerRemaining < timerDuration ? 'Resume' : 'Start');
        focusOverlayToggleIcon.textContent = isTimerRunning ? '⏸' : '▶';
    }

    function enterFocusMode() {
        if (!focusOverlay) return;
        focusOverlay.hidden = false;
        document.body.style.overflow = 'hidden';
        updateTimerDisplay();
        if (focusOverlayRing) focusOverlayRing.style.stroke = 'var(--accent-cyan)';
        // Ask the browser for real fullscreen; overlay still works if denied
        try {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(() => {});
            }
        } catch (e) {}
        if (focusOverlayExit) focusOverlayExit.focus();
        showToast('Focus Mode: only the timer is on screen', '⛶');
    }

    function exitFocusMode() {
        if (!focusOverlay || focusOverlay.hidden) return;
        focusOverlay.hidden = true;
        document.body.style.overflow = '';
        try {
            if (document.fullscreenElement && document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
            }
        } catch (e) {}
        if (fullscreenFocusBtn) fullscreenFocusBtn.focus();
    }

    /* ═══════════════════════════════════════════════════════════════════
       3. NOTIFICATION & AUDIO LOGIC (Chime & Browser Notifications)
       ═══════════════════════════════════════════════════════════════════ */
    function ensureAudioContext() {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                audioCtx = new AudioContextClass();
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function playChime() {
        ensureAudioContext();
        if (!audioCtx) return;

        try {
            const now = audioCtx.currentTime;

            // Tone 1: E5 (659.25 Hz)
            const osc1 = audioCtx.createOscillator();
            const gain1 = audioCtx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(659.25, now);
            gain1.gain.setValueAtTime(0.2, now);
            gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
            osc1.connect(gain1);
            gain1.connect(audioCtx.destination);
            osc1.start(now);
            osc1.stop(now + 0.8);

            // Tone 2: B5 (987.77 Hz) slightly delayed
            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(987.77, now + 0.15);
            gain2.gain.setValueAtTime(0.25, now + 0.15);
            gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);
            osc2.start(now + 0.15);
            osc2.stop(now + 1.2);
        } catch (e) {
            // Audio error fallback
        }
    }

    function triggerNotification() {
        if (!notifyEnabled) return;

        // 1. Play sound
        playChime();

        // 2. Desktop Notification (if supported and permitted)
        if ('Notification' in window && Notification.permission === 'granted') {
            try {
                let notifTitle = 'Focus Session Completed! 🎉';
                let notifBody = 'Great job! Time to take a well-earned break.';
                if (currentMode === 'custom') {
                    notifTitle = 'Custom Timer Completed! ⏳';
                    notifBody = `Your ${formatTime(timerDuration)} session is finished!`;
                } else if (currentMode === 'short' || currentMode === 'long') {
                    notifTitle = 'Break Time Ended! ⚡';
                    notifBody = 'Break is over. Ready to dive back into deep work?';
                }
                new Notification(notifTitle, {
                    body: notifBody,
                    silent: true // Web Audio API already handles synthesis
                });
            } catch (e) {
                // Graceful fallback
            }
        }
    }

    function toggleNotify() {
        notifyEnabled = !notifyEnabled;
        localStorage.setItem(STORAGE_KEY_NOTIFY, notifyEnabled.toString());
        updateNotifyUI();

        if (notifyEnabled) {
            // Request browser notification permission only after user interacts
            if ('Notification' in window && Notification.permission === 'default') {
                try {
                    Notification.requestPermission().then(permission => {
                        if (permission === 'granted') {
                            showToast('Desktop notifications enabled', '🔔');
                        }
                    }).catch(() => {});
                } catch (e) {}
            }
            showToast('Notify On (Chime & Desktop alerts)', '🔔');
        } else {
            showToast('Notify Off (Muted)', '🔕');
        }
    }

    function updateNotifyUI() {
        if (!soundIcon || !soundStatusText || !soundToggleBtn) return;
        if (notifyEnabled) {
            soundIcon.textContent = '🔔';
            soundStatusText.textContent = 'Notify On';
            soundToggleBtn.classList.remove('muted');
            soundToggleBtn.setAttribute('aria-label', 'Notifications enabled. Click to mute.');
        } else {
            soundIcon.textContent = '🔕';
            soundStatusText.textContent = 'Notify Off';
            soundToggleBtn.classList.add('muted');
            soundToggleBtn.setAttribute('aria-label', 'Notifications muted. Click to enable.');
        }
    }

    /* ═══════════════════════════════════════════════════════════════════
       4. TASK MANAGER LOGIC
       ═══════════════════════════════════════════════════════════════════ */
    function saveTasks() {
        localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
        updateProgress();
    }

    function renderTasks() {
        if (!taskList) return;
        taskList.innerHTML = '';

        if (tasks.length === 0) {
            emptyState.hidden = false;
        } else {
            emptyState.hidden = true;
            tasks.forEach((task) => {
                const li = document.createElement('li');
                li.className = `task-item ${task.completed ? 'completed' : ''}`;
                li.setAttribute('data-id', task.id);

                const leftDiv = document.createElement('div');
                leftDiv.className = 'task-left';

                const checkbox = document.createElement('button');
                checkbox.type = 'button';
                checkbox.className = `custom-checkbox ${task.completed ? 'checked' : ''}`;
                checkbox.setAttribute('aria-label', `Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`);
                checkbox.addEventListener('click', () => toggleTaskComplete(task.id));

                const titleSpan = document.createElement('span');
                titleSpan.className = 'task-title-text';
                titleSpan.textContent = task.title;

                leftDiv.appendChild(checkbox);
                leftDiv.appendChild(titleSpan);

                const deleteBtn = document.createElement('button');
                deleteBtn.type = 'button';
                deleteBtn.className = 'task-delete-btn';
                deleteBtn.setAttribute('aria-label', `Delete task: "${task.title}"`);
                deleteBtn.innerHTML = '&times;';
                deleteBtn.addEventListener('click', () => deleteTask(task.id));

                li.appendChild(leftDiv);
                li.appendChild(deleteBtn);
                taskList.appendChild(li);
            });
        }

        updateProgress();
    }

    function addTask(title) {
        const cleanTitle = title.trim();
        if (!cleanTitle) return;

        const newTask = {
            id: Date.now().toString(),
            title: cleanTitle,
            completed: false,
            createdAt: new Date().toISOString()
        };

        tasks.unshift(newTask);
        saveTasks();
        renderTasks();
        showToast('Task added successfully', '✓');
    }

    function toggleTaskComplete(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        }
    }

    function deleteTask(taskId) {
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks();
        renderTasks();
        showToast('Task removed', '🗑️');
    }

    function clearCompleted() {
        const beforeCount = tasks.length;
        tasks = tasks.filter(t => !t.completed);
        const removed = beforeCount - tasks.length;

        if (removed > 0) {
            saveTasks();
            renderTasks();
            showToast(`Cleared ${removed} completed task${removed > 1 ? 's' : ''}`, '🧹');
        } else {
            showToast('No completed tasks to clear', 'ℹ️');
        }
    }

    function updateProgress() {
        if (!taskRatioBadge || !progressPercentage || !progressFill || !progressBar || !taskSummary) return;
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

        taskRatioBadge.textContent = `${completed} of ${total} done`;
        progressPercentage.textContent = `${percentage}%`;
        progressFill.style.width = `${percentage}%`;
        progressBar.setAttribute('aria-valuenow', percentage.toString());

        const remaining = total - completed;
        taskSummary.textContent = `${remaining} task${remaining === 1 ? '' : 's'} remaining`;
    }

    /* ═══════════════════════════════════════════════════════════════════
       5. CONTACT BUTTON (mailto: neelraj001987@gmail.com)
       ═══════════════════════════════════════════════════════════════════ */
    function initContactButton() {
        if (!contactBtn) return;
        contactBtn.addEventListener('click', () => {
            showToast('Opening email client for neelraj001987@gmail.com', '✉');
        });
    }

    /* ═══════════════════════════════════════════════════════════════════
       6. COMMAND PALETTE LOGIC (Ctrl+K / Cmd+K)
       ═══════════════════════════════════════════════════════════════════ */
    const COMMANDS = [
        {
            id: 'timer-toggle',
            title: 'Start / Pause Focus Timer',
            group: 'Timer',
            icon: '⏱️',
            shortcut: 'Space',
            action: () => toggleTimer()
        },
        {
            id: 'timer-reset',
            title: 'Reset Current Timer',
            group: 'Timer',
            icon: '↺',
            shortcut: 'R',
            action: () => resetTimer()
        },
        {
            id: 'mode-focus',
            title: 'Switch to 25m Focus Block',
            group: 'Timer',
            icon: '🎯',
            shortcut: '25m',
            action: () => { setTimerMode('focus', 25, 'Deep Work Block'); scrollToElement('timer-section'); }
        },
        {
            id: 'mode-short',
            title: 'Switch to 5m Short Break',
            group: 'Timer',
            icon: '☕',
            shortcut: '5m',
            action: () => { setTimerMode('short', 5, 'Short Break'); scrollToElement('timer-section'); }
        },
        {
            id: 'mode-long',
            title: 'Switch to 15m Long Break',
            group: 'Timer',
            icon: '🧘',
            shortcut: '15m',
            action: () => { setTimerMode('long', 15, 'Long Break'); scrollToElement('timer-section'); }
        },
        {
            id: 'mode-custom',
            title: 'Set Custom Duration Timer',
            group: 'Timer',
            icon: '⏱️',
            shortcut: 'C',
            action: () => {
                scrollToElement('timer-section');
                setTimeout(openCustomPanel, 250);
            }
        },
        {
            id: 'notify-toggle',
            title: 'Toggle Notifications (Notify On / Off)',
            group: 'Settings',
            icon: '🔔',
            shortcut: 'M',
            action: () => toggleNotify()
        },
        {
            id: 'theme-toggle',
            title: 'Toggle Light / Dark Theme',
            group: 'Settings',
            icon: '🌗',
            shortcut: 'T',
            action: () => toggleTheme()
        },
        {
            id: 'autobreak-toggle',
            title: 'Toggle Auto-break (start breaks automatically)',
            group: 'Settings',
            icon: '⚡',
            shortcut: 'B',
            action: () => toggleAutoBreak()
        },
        {
            id: 'focus-mode',
            title: 'Enter Fullscreen Focus Mode (timer only)',
            group: 'Timer',
            icon: '⛶',
            shortcut: 'F',
            action: () => enterFocusMode()
        },
        {
            id: 'task-new',
            title: 'Create New Task',
            group: 'Tasks',
            icon: '➕',
            shortcut: 'N',
            action: () => {
                scrollToElement('tasks-section');
                setTimeout(() => taskInput.focus(), 250);
            }
        },
        {
            id: 'task-clear',
            title: 'Clear All Completed Tasks',
            group: 'Tasks',
            icon: '🧹',
            shortcut: 'C',
            action: () => clearCompleted()
        },
        {
            id: 'jump-workspace',
            title: 'Jump to Workspace Suite',
            group: 'Navigation',
            icon: '⚡',
            shortcut: 'G W',
            action: () => scrollToElement('workspace')
        },
        {
            id: 'jump-features',
            title: 'Jump to Feature Highlights',
            group: 'Navigation',
            icon: '✨',
            shortcut: 'G F',
            action: () => scrollToElement('features')
        },
        {
            id: 'jump-contact',
            title: 'Jump to Contact Section',
            group: 'Navigation',
            icon: '✉',
            shortcut: 'G C',
            action: () => scrollToElement('contact')
        },
        {
            id: 'email-neel',
            title: 'Email Neel Raj (neelraj001987@gmail.com)',
            group: 'Settings',
            icon: '✉',
            shortcut: 'E',
            action: () => { window.location.href = 'mailto:neelraj001987@gmail.com'; }
        }
    ];

    let activeCmdIndex = 0;
    let filteredCommands = [...COMMANDS];

    function openCommandPalette() {
        cmdPalette.hidden = false;
        cmdSearchInput.value = '';
        filterCommands('');
        cmdSearchInput.focus();
        document.body.style.overflow = 'hidden';
    }

    function closeCommandPalette() {
        cmdPalette.hidden = true;
        document.body.style.overflow = '';
    }

    function filterCommands(query) {
        const cleanQuery = query.toLowerCase().trim();
        if (!cleanQuery) {
            filteredCommands = [...COMMANDS];
        } else {
            filteredCommands = COMMANDS.filter(cmd =>
                cmd.title.toLowerCase().includes(cleanQuery) ||
                cmd.group.toLowerCase().includes(cleanQuery)
            );
        }
        activeCmdIndex = 0;
        renderCommandResults();
    }

    function renderCommandResults() {
        cmdResults.innerHTML = '';

        if (filteredCommands.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'cmd-empty-message';
            emptyDiv.textContent = 'No matching commands found.';
            cmdResults.appendChild(emptyDiv);
            return;
        }

        let currentGroup = '';

        filteredCommands.forEach((cmd, index) => {
            if (cmd.group !== currentGroup) {
                currentGroup = cmd.group;
                const groupLabel = document.createElement('div');
                groupLabel.className = 'cmd-group-label';
                groupLabel.textContent = currentGroup;
                cmdResults.appendChild(groupLabel);
            }

            const item = document.createElement('div');
            item.className = `cmd-item ${index === activeCmdIndex ? 'active' : ''}`;
            item.setAttribute('role', 'option');
            item.setAttribute('aria-selected', index === activeCmdIndex ? 'true' : 'false');
            item.setAttribute('data-index', index.toString());

            const leftDiv = document.createElement('div');
            leftDiv.className = 'cmd-item-left';

            const iconSpan = document.createElement('span');
            iconSpan.className = 'cmd-item-icon';
            iconSpan.textContent = cmd.icon;

            const titleSpan = document.createElement('span');
            titleSpan.textContent = cmd.title;

            leftDiv.appendChild(iconSpan);
            leftDiv.appendChild(titleSpan);

            const badgeSpan = document.createElement('span');
            badgeSpan.className = 'cmd-item-badge';
            badgeSpan.textContent = cmd.shortcut;

            item.appendChild(leftDiv);
            item.appendChild(badgeSpan);

            item.addEventListener('click', () => {
                executeCommand(index);
            });

            item.addEventListener('mouseenter', () => {
                activeCmdIndex = index;
                highlightActiveCommand();
            });

            cmdResults.appendChild(item);
        });

        scrollActiveIntoView();
    }

    function highlightActiveCommand() {
        const items = cmdResults.querySelectorAll('.cmd-item');
        items.forEach((item, index) => {
            const isMatch = index === activeCmdIndex;
            item.classList.toggle('active', isMatch);
            item.setAttribute('aria-selected', isMatch ? 'true' : 'false');
        });
        scrollActiveIntoView();
    }

    function scrollActiveIntoView() {
        const activeItem = cmdResults.querySelector('.cmd-item.active');
        if (activeItem) {
            activeItem.scrollIntoView({ block: 'nearest' });
        }
    }

    function executeCommand(index) {
        const cmd = filteredCommands[index];
        if (cmd && typeof cmd.action === 'function') {
            closeCommandPalette();
            cmd.action();
        }
    }

    function scrollToElement(id) {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    /* ═══════════════════════════════════════════════════════════════════
       7. TOAST NOTIFICATIONS
       ═══════════════════════════════════════════════════════════════════ */
    let toastTimer = null;

    function showToast(message, icon) {
        if (!toastMessage || !toastIcon || !toastNotification) return;
        toastMessage.textContent = message;
        toastIcon.textContent = icon || '🔔';

        toastNotification.classList.add('show');

        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toastNotification.classList.remove('show');
        }, 3200);
    }

    /* ═══════════════════════════════════════════════════════════════════
       8. EVENT LISTENERS
       ═══════════════════════════════════════════════════════════════════ */
    function bindEvents() {
        // Timer events
        if (timerToggleBtn) timerToggleBtn.addEventListener('click', toggleTimer);
        if (timerResetBtn) timerResetBtn.addEventListener('click', resetTimer);
        if (soundToggleBtn) soundToggleBtn.addEventListener('click', toggleNotify);
        const autoBreakBtnEl = document.getElementById('autoBreakBtn');
        if (autoBreakBtnEl) autoBreakBtnEl.addEventListener('click', toggleAutoBreak);
        const themeBtnEl = document.getElementById('themeToggleBtn');
        if (themeBtnEl) themeBtnEl.addEventListener('click', toggleTheme);
        if (fullscreenFocusBtn) fullscreenFocusBtn.addEventListener('click', enterFocusMode);
        if (focusOverlayExit) focusOverlayExit.addEventListener('click', exitFocusMode);
        if (focusOverlayToggle) focusOverlayToggle.addEventListener('click', () => { toggleTimer(); updateFocusOverlayToggleUI(); });
        document.addEventListener('fullscreenchange', () => {
            // Browser Esc only exits native fullscreen; hide the overlay with it
            if (!document.fullscreenElement && focusOverlay && !focusOverlay.hidden) {
                exitFocusMode();
            }
        });

        if (modeFocusBtn) modeFocusBtn.addEventListener('click', () => setTimerMode('focus', 25, 'Deep Work Block'));
        if (modeShortBtn) modeShortBtn.addEventListener('click', () => setTimerMode('short', 5, 'Short Break'));
        if (modeLongBtn) modeLongBtn.addEventListener('click', () => setTimerMode('long', 15, 'Long Break'));

        // Custom timer events
        if (modeCustomBtn) {
            modeCustomBtn.addEventListener('click', () => {
                if (!customTimerPanel || customTimerPanel.hidden) {
                    openCustomPanel();
                } else {
                    closeCustomPanel();
                }
            });
        }
        if (startCustomTimerBtn) startCustomTimerBtn.addEventListener('click', handleCustomTimerSubmit);
        if (cancelCustomTimerBtn) cancelCustomTimerBtn.addEventListener('click', closeCustomPanel);
        if (customCloseBtn) customCloseBtn.addEventListener('click', closeCustomPanel);

        [customMinutes, customSeconds].forEach(inputEl => {
            if (inputEl) {
                inputEl.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCustomTimerSubmit();
                    } else if (e.key === 'Escape') {
                        e.preventDefault();
                        closeCustomPanel();
                    }
                });
                inputEl.addEventListener('input', () => {
                    if (customTimerError) customTimerError.textContent = '';
                });
            }
        });

        if (startFocusBtn) {
            startFocusBtn.addEventListener('click', (e) => {
                e.preventDefault();
                scrollToElement('timer-section');
                if (!isTimerRunning) {
                    setTimeout(startTimer, 300);
                }
            });
        }

        // Task events
        if (taskForm) {
            taskForm.addEventListener('submit', (e) => {
                e.preventDefault();
                addTask(taskInput.value);
                taskInput.value = '';
            });
        }

        if (clearCompletedBtn) clearCompletedBtn.addEventListener('click', clearCompleted);

        // Contact button
        initContactButton();

        // Command palette trigger
        if (cmdTrigger) cmdTrigger.addEventListener('click', openCommandPalette);
        if (cmdEscBadge) cmdEscBadge.addEventListener('click', closeCommandPalette);

        if (cmdPalette) {
            cmdPalette.addEventListener('click', (e) => {
                if (e.target === cmdPalette) {
                    closeCommandPalette();
                }
            });
        }

        if (cmdSearchInput) {
            cmdSearchInput.addEventListener('input', (e) => {
                filterCommands(e.target.value);
            });
        }

        // Global Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Check for Ctrl+K or Cmd+K
            if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'k')) {
                e.preventDefault();
                if (cmdPalette.hidden) {
                    openCommandPalette();
                } else {
                    closeCommandPalette();
                }
                return;
            }

            // When Command Palette is OPEN
            if (!cmdPalette.hidden) {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    closeCommandPalette();
                    return;
                }
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (filteredCommands.length > 0) {
                        activeCmdIndex = (activeCmdIndex + 1) % filteredCommands.length;
                        highlightActiveCommand();
                    }
                    return;
                }
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (filteredCommands.length > 0) {
                        activeCmdIndex = (activeCmdIndex - 1 + filteredCommands.length) % filteredCommands.length;
                        highlightActiveCommand();
                    }
                    return;
                }
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (filteredCommands.length > 0) {
                        executeCommand(activeCmdIndex);
                    }
                    return;
                }
            } else {
                // When Command Palette is CLOSED
                if (e.key === 'Escape' && focusOverlay && !focusOverlay.hidden) {
                    // In native fullscreen the browser swallows Esc; fullscreenchange handles that case
                    if (!document.fullscreenElement) {
                        e.preventDefault();
                        exitFocusMode();
                    }
                    return;
                }
                if (e.key === 'Escape' && customTimerPanel && !customTimerPanel.hidden) {
                    closeCustomPanel();
                }
            }
        });

        // Mobile Nav Toggle
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                const isOpen = navMenu.classList.toggle('open');
                navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            });

            // Close mobile nav when clicking a link
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('open');
                    navToggle.setAttribute('aria-expanded', 'false');
                });
            });
        }
    }

    // Start on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
