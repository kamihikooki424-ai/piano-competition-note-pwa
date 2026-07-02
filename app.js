const STORE_KEY = "piano-note-zero-cost-v1";
const REMINDER_KEY = "piano-note-reminders-v1";
const BACKUP_KEY = "piano-note-last-backup-v1";
const ONBOARDING_KEY = "piano-note-onboarding-seen-v1";
const RECORDING_DB_NAME = "piano-note-recordings-v1";
const RECORDING_STORE_NAME = "recordings";

const state = {
  childProfile: {
    name: "",
    grade: "",
    birthYear: "",
    memo: ""
  },
  competitions: [],
  pieces: [],
  tasks: [],
  practiceLogs: [],
  practiceStamps: {},
  view: "homeView",
  bpm: 84,
  beat: 0,
  metronomeTimer: null,
  audioContext: null,
  recorder: null,
  recordingChunks: [],
  recordingStartedAt: 0,
  recordingSeconds: 0,
  recordingTimer: null,
  recordings: [],
  scores: [],
  teacherComments: [],
  feedbacks: [],
  trialChecks: {},
  isSampleData: false,
  editingScoreId: "",
  practiceTimerSeconds: 15 * 60,
  practiceTimerRemaining: 15 * 60,
  practiceTimerId: null
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const els = {
  todayLabel: $("#todayLabel"),
  nextDeadlineLabel: $("#nextDeadlineLabel"),
  competitionCount: $("#competitionCount"),
  urgentCount: $("#urgentCount"),
  taskDoneCount: $("#taskDoneCount"),
  currentScoreLabel: $("#currentScoreLabel"),
  weeklyPracticeLabel: $("#weeklyPracticeLabel"),
  practiceStreakLabel: $("#practiceStreakLabel"),
  readinessScoreLabel: $("#readinessScoreLabel"),
  homeStatusList: $("#homeStatusList"),
  todayPracticeLabel: $("#todayPracticeLabel"),
  homeMissionCard: $("#homeMissionCard"),
  homeMissionTitle: $("#homeMissionTitle"),
  homeMissionDetail: $("#homeMissionDetail"),
  homeMissionBar: $("#homeMissionBar"),
  homeMissionDoneButton: $("#homeMissionDoneButton"),
  practiceStickerMark: $("#practiceStickerMark"),
  practiceStickerTitle: $("#practiceStickerTitle"),
  practiceStickerText: $("#practiceStickerText"),
  stampCardText: $("#stampCardText"),
  stampCardCount: $("#stampCardCount"),
  stampCardDays: $("#stampCardDays"),
  weeklyPracticeDetail: $("#weeklyPracticeDetail"),
  weeklyPracticeDays: $("#weeklyPracticeDays"),
  readinessDetail: $("#readinessDetail"),
  readinessHeroScore: $("#readinessHeroScore"),
  readinessBar: $("#readinessBar"),
  nextActionList: $("#nextActionList"),
  kidPracticeTitle: $("#kidPracticeTitle"),
  kidPracticeDetail: $("#kidPracticeDetail"),
  kidPracticeCount: $("#kidPracticeCount"),
  kidPracticeBar: $("#kidPracticeBar"),
  kidPracticeDoneButton: $("#kidPracticeDoneButton"),
  kidPracticeTimerButton: $("#kidPracticeTimerButton"),
  kidPracticeTimerLabel: $("#kidPracticeTimerLabel"),
  kidPracticeRecordButton: $("#kidPracticeRecordButton"),
  setupCard: $("#setupCard"),
  setupTitle: $("#setupTitle"),
  setupSummary: $("#setupSummary"),
  setupChecks: $("#setupChecks"),
  homeBackupNudge: $("#homeBackupNudge"),
  homeBackupNudgeText: $("#homeBackupNudgeText"),
  backupReminderText: $("#backupReminderText"),
  profileSummary: $("#profileSummary"),
  childNameInput: $("#childNameInput"),
  childGradeInput: $("#childGradeInput"),
  childBirthYearInput: $("#childBirthYearInput"),
  childMemoInput: $("#childMemoInput"),
  competitionList: $("#competitionList"),
  pieceList: $("#pieceList"),
  taskList: $("#taskList"),
  practiceLogList: $("#practiceLogList"),
  bpmLabel: $("#bpmLabel"),
  tempoSlider: $("#tempoSlider"),
  beatRow: $("#beatRow"),
  metronomeButton: $("#metronomeButton"),
  practiceTimerLabel: $("#practiceTimerLabel"),
  timerStartButton: $("#timerStartButton"),
  timerResetButton: $("#timerResetButton"),
  recordButton: $("#recordButton"),
  recordMessage: $("#recordMessage"),
  recordTimer: $("#recordTimer"),
  recordingList: $("#recordingList"),
  latestScoreHero: $("#latestScoreHero"),
  scoreFormTitle: $("#scoreFormTitle"),
  scoreFormSubcopy: $("#scoreFormSubcopy"),
  scoreTotalPreview: $("#scoreTotalPreview"),
  scoreChart: $("#scoreChart"),
  scoreList: $("#scoreList"),
  teacherMemoOutput: $("#teacherMemoOutput"),
  teacherReviewOutput: $("#teacherReviewOutput"),
  teacherCommentList: $("#teacherCommentList"),
  trialInviteOutput: $("#trialInviteOutput"),
  trialProgressLabel: $("#trialProgressLabel"),
  trialChecklist: $("#trialChecklist"),
  feedbackList: $("#feedbackList"),
  storageReport: $("#storageReport"),
  onboardingDialog: $("#onboardingDialog"),
  competitionDialog: $("#competitionDialog"),
  competitionForm: $("#competitionForm"),
  taskDialog: $("#taskDialog"),
  taskForm: $("#taskForm"),
  reminderDialog: $("#reminderDialog"),
  reminderKicker: $("#reminderKicker"),
  reminderTitle: $("#reminderTitle"),
  reminderBody: $("#reminderBody")
};

function createId() {
  return crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function todayKey() {
  return toDateKey(new Date());
}

function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function addDays(days) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

function dateKeyOffset(key, days) {
  const date = parseDate(key);
  if (!date) return "";
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

function parseDate(value) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function formatDate(value) {
  const date = parseDate(value);
  if (!date) return "未設定";
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function daysUntil(value) {
  const target = parseDate(value);
  if (!target) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function formatDays(value) {
  const days = daysUntil(value);
  if (days === null) return "未設定";
  if (days === 0) return "今日";
  if (days > 0) return `あと${days}日`;
  return `${Math.abs(days)}日前`;
}

function formatMinutes(minutes) {
  const value = Math.max(0, Number(minutes || 0));
  if (value >= 60) {
    const hours = Math.floor(value / 60);
    const rest = value % 60;
    return rest ? `${hours}時間${rest}分` : `${hours}時間`;
  }
  return `${value}分`;
}

function getPracticeMinutesByDate() {
  return state.practiceLogs.reduce((map, log) => {
    if (!log.date) return map;
    map.set(log.date, (map.get(log.date) || 0) + Number(log.minutes || 0));
    return map;
  }, new Map());
}

function getPracticeStats() {
  const minutesByDate = getPracticeMinutesByDate();
  const today = todayKey();
  const last7Days = Array.from({ length: 7 }, (_, index) => {
    const date = dateKeyOffset(today, index - 6);
    const minutes = minutesByDate.get(date) || 0;
    return { date, minutes, practiced: minutes > 0 || hasPracticeStamp(date) };
  });
  const weeklyMinutes = last7Days.reduce((sum, day) => sum + day.minutes, 0);
  const practicedDays = last7Days.filter((day) => day.practiced).length;
  let streak = 0;
  for (let offset = 0; offset > -90; offset -= 1) {
    const date = dateKeyOffset(today, offset);
    if ((minutesByDate.get(date) || 0) <= 0 && !hasPracticeStamp(date)) break;
    streak += 1;
  }
  return { last7Days, weeklyMinutes, practicedDays, streak };
}

function hasPracticeStamp(date = todayKey()) {
  return Boolean(state.practiceStamps?.[date]);
}

function addPracticeStamp(date = todayKey()) {
  state.practiceStamps = { ...(state.practiceStamps || {}), [date]: true };
}

function getPracticeStampCount() {
  return Object.values(state.practiceStamps || {}).filter(Boolean).length;
}

function renderPracticeStats() {
  const stats = getPracticeStats();
  els.weeklyPracticeLabel.textContent = formatMinutes(stats.weeklyMinutes);
  els.practiceStreakLabel.textContent = `${stats.streak}日`;
  els.weeklyPracticeDetail.textContent = stats.weeklyMinutes
    ? `直近7日で${stats.practicedDays}日、合計${formatMinutes(stats.weeklyMinutes)}練習しています。`
    : "まだ直近7日の練習記録がありません。今日の練習を残しましょう。";
  els.weeklyPracticeDays.innerHTML = stats.last7Days.map((day) => {
    const date = parseDate(day.date);
    const label = date ? `${date.getMonth() + 1}/${date.getDate()}` : "";
    return `
      <span class="${day.practiced ? "done" : ""}" title="${escapeHtml(label)} ${escapeHtml(formatMinutes(day.minutes))}">
        <em>${escapeHtml(label)}</em>
        <strong>${day.practiced ? escapeHtml(day.minutes ? formatMinutes(day.minutes) : "★") : "-"}</strong>
      </span>
    `;
  }).join("");
  renderStampCard(stats);
}

function renderPracticeSticker() {
  const stats = getPracticeStats();
  const practicedToday = Boolean(stats.last7Days.at(-1)?.practiced || hasPracticeStamp());
  els.practiceStickerMark.textContent = practicedToday ? "★" : "○";
  els.practiceStickerTitle.textContent = practicedToday ? "今日のシール獲得" : "今日のシール";
  els.practiceStickerText.textContent = practicedToday
    ? `よくできました。シール${getPracticeStampCount()}枚です。`
    : "練習記録をつけると、今日のシールがつきます。";
}

function renderStampCard(stats = getPracticeStats()) {
  const doneCount = stats.last7Days.filter((day) => day.practiced).length;
  els.stampCardCount.textContent = `${doneCount}/7`;
  els.stampCardText.textContent = doneCount >= 7
    ? "7日ぶん集まりました。よく続いています。"
    : `あと${7 - doneCount}日で7日ぶん集まります。`;
  els.stampCardDays.innerHTML = stats.last7Days.map((day) => {
    const date = parseDate(day.date);
    const label = date ? `${date.getMonth() + 1}/${date.getDate()}` : "";
    return `
      <span class="${day.practiced ? "done" : ""}" aria-label="${escapeHtml(label)} ${day.practiced ? "練習済み" : "未達成"}">
        <em>${escapeHtml(label)}</em>
        <strong>${day.practiced ? "★" : "・"}</strong>
      </span>
    `;
  }).join("");
}

function getNextOpenTask() {
  return state.tasks.find((task) => Number(task.count || 0) < Math.max(1, Number(task.target || 1))) || null;
}

function renderHomeMission() {
  const task = getNextOpenTask();
  if (!task) {
    els.homeMissionCard.style.display = state.tasks.length ? "" : "none";
    if (state.tasks.length) {
      els.homeMissionTitle.textContent = "今日の課題は完了";
      els.homeMissionDetail.textContent = "録音して聴き返すか、練習記録を残しましょう。";
      els.homeMissionBar.style.width = "100%";
      els.homeMissionDoneButton.disabled = true;
      els.homeMissionDoneButton.textContent = "完了";
      delete els.homeMissionDoneButton.dataset.homeTaskId;
    }
    return;
  }
  const target = Math.max(1, Number(task.target || 1));
  const count = Math.max(0, Number(task.count || 0));
  const remaining = Math.max(0, target - count);
  const percent = Math.min(100, Math.round((count / target) * 100));
  els.homeMissionCard.style.display = "";
  els.homeMissionTitle.textContent = task.title || "練習する";
  els.homeMissionDetail.textContent = `あと${remaining}回。${task.detail || "ゆっくり、ていねいに弾きましょう。"}`;
  els.homeMissionBar.style.width = `${percent}%`;
  els.homeMissionDoneButton.disabled = false;
  els.homeMissionDoneButton.textContent = "できた";
  els.homeMissionDoneButton.dataset.homeTaskId = task.id;
}

function formatPracticeStatsForMemo() {
  const stats = getPracticeStats();
  return `直近7日：${stats.practicedDays}日 / ${formatMinutes(stats.weeklyMinutes)}、連続練習：${stats.streak}日`;
}

function getNextCompetition() {
  return [...state.competitions]
    .filter((competition) => daysUntil(competition.eventDate) === null || daysUntil(competition.eventDate) >= 0)
    .sort((a, b) => (daysUntil(a.eventDate) ?? 9999) - (daysUntil(b.eventDate) ?? 9999))[0]
    || [...state.competitions].sort((a, b) => (daysUntil(b.eventDate) ?? -9999) - (daysUntil(a.eventDate) ?? -9999))[0]
    || null;
}

function getReadinessStatus() {
  const competition = getNextCompetition();
  const latestScore = getLatestScore();
  const practiceStats = getPracticeStats();
  const openTasks = state.tasks.filter((task) => Number(task.count || 0) < Number(task.target || 1));
  const taskProgress = state.tasks.length
    ? state.tasks.reduce((sum, task) => {
      const target = Math.max(1, Number(task.target || 1));
      return sum + Math.min(1, Number(task.count || 0) / target);
    }, 0) / state.tasks.length
    : 0;
  const applicationChecks = competition ? getApplicationChecks(competition) : [];
  const applicationRatio = applicationChecks.length
    ? applicationChecks.filter((check) => check.done).length / applicationChecks.length
    : 0;
  const deadlineDays = competition ? daysUntil(competition.deadline) : null;
  const eventDays = competition ? daysUntil(competition.eventDate) : null;

  const score = Math.round(
    (competition ? 12 : 0)
    + (applicationRatio * 18)
    + (state.pieces.length ? 12 : 0)
    + (taskProgress * 18)
    + (practiceStats.practicedDays >= 3 ? 14 : practiceStats.practicedDays * 4)
    + (state.recordings.length ? 12 : 0)
    + (latestScore ? Math.min(14, latestScore.total * 0.14) : 0)
  );

  const actions = [];
  if (!state.childProfile?.name) {
    actions.push({ label: "プロフィール登録", detail: "設定で生徒名と学年を入れる", view: "settingsView" });
  }
  if (!competition) {
    actions.push({ label: "コンクール登録", detail: "本番日と申込締切を入れる", view: "homeView" });
  } else if (deadlineDays !== null && deadlineDays <= 1 && applicationRatio < 1) {
    actions.push({ label: "申込手続き確認", detail: `${competition.name}の申込チェックを完了する`, view: "homeView" });
  } else if (applicationRatio < 1) {
    actions.push({ label: "申込チェック", detail: `残り${applicationChecks.length - applicationChecks.filter((check) => check.done).length}項目を確認`, view: "homeView" });
  }
  if (state.pieces.length === 0) {
    actions.push({ label: "曲を登録", detail: "課題曲・目標テンポ・注意点を入れる", view: "practiceView" });
  }
  if (state.tasks.length === 0) {
    actions.push({ label: "練習指示を登録", detail: "先生からの練習方法を回数で管理する", view: "practiceView" });
  } else if (openTasks.length > 0) {
    const task = openTasks[0];
    actions.push({ label: "今日の練習", detail: `${task.title}をあと${Math.max(0, Number(task.target || 1) - Number(task.count || 0))}回`, view: "practiceView" });
  }
  if (!practiceStats.last7Days.at(-1)?.practiced) {
    actions.push({ label: "練習記録", detail: "今日の練習時間と内容を残す", view: "practiceView" });
  }
  if (state.recordings.length === 0) {
    actions.push({ label: "録音する", detail: "一度弾いて聴き返せる状態にする", view: "recordView" });
  }
  if (!latestScore) {
    actions.push({ label: "採点する", detail: "今の完成度を100点で残す", view: "growthView" });
  }
  if (actions.length === 0) {
    actions.push({ label: "先生に確認依頼", detail: "録音チェック依頼文をコピーして送る", view: "growthView" });
  }

  const statusText = competition
    ? `${competition.name}${eventDays !== null ? ` / 本番まで${formatDays(competition.eventDate)}` : ""}`
    : "コンクールを登録すると準備度を出せます";

  return {
    score: Math.min(100, Math.max(0, score)),
    statusText,
    actions: actions.slice(0, 3)
  };
}

function renderReadinessStatus() {
  const readiness = getReadinessStatus();
  els.readinessScoreLabel.textContent = `${readiness.score}%`;
  els.readinessHeroScore.textContent = `${readiness.score}%`;
  els.readinessDetail.textContent = readiness.statusText;
  els.readinessBar.style.width = `${readiness.score}%`;
  els.nextActionList.innerHTML = readiness.actions.map((action) => `
    <button data-view-shortcut="${action.view}">
      <strong>${escapeHtml(action.label)}</strong>
      <span>${escapeHtml(action.detail)}</span>
    </button>
  `).join("");
  els.nextActionList.querySelectorAll("[data-view-shortcut]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.viewShortcut));
  });
}

function formatReadinessForMemo() {
  const readiness = getReadinessStatus();
  return `本番準備度：${readiness.score}% / 次アクション：${readiness.actions.map((action) => `${action.label}（${action.detail}）`).join("、")}`;
}

function yen(value) {
  const amount = Number(String(value || "").replace(/[^\d]/g, ""));
  if (!amount) return "未設定";
  return `${amount.toLocaleString("ja-JP")}円`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[char]);
}

function normalizeChildProfile(profile = {}) {
  return {
    name: String(profile.name || ""),
    grade: String(profile.grade || ""),
    birthYear: String(profile.birthYear || ""),
    memo: String(profile.memo || "")
  };
}

function load() {
  const saved = localStorage.getItem(STORE_KEY);
  let hasSavedData = Boolean(saved);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      state.childProfile = normalizeChildProfile(parsed.childProfile);
      state.competitions = parsed.competitions || [];
      state.pieces = parsed.pieces || [];
      state.tasks = parsed.tasks || [];
      state.practiceLogs = parsed.practiceLogs || [];
      state.practiceStamps = parsed.practiceStamps || {};
      state.scores = parsed.scores || [];
      state.teacherComments = parsed.teacherComments || [];
      state.feedbacks = parsed.feedbacks || [];
      state.trialChecks = parsed.trialChecks || {};
      state.isSampleData = Boolean(parsed.isSampleData);
      state.bpm = parsed.bpm || 84;
      state.practiceTimerSeconds = Number(parsed.practiceTimerSeconds || 15 * 60);
      state.practiceTimerRemaining = state.practiceTimerSeconds;
    } catch {
      localStorage.removeItem(STORE_KEY);
      hasSavedData = false;
    }
  }

  if (!hasSavedData && state.competitions.length === 0) {
    state.childProfile = {
      name: "はな",
      grade: "小学5年",
      birthYear: "2015",
      memo: "本番であわてず、音の響きを大切に練習中"
    };
    state.competitions = [{
      id: createId(),
      name: "ブルグミュラーコンクール",
      division: "小学5・6年B部門",
      deadline: addDays(1),
      eventDate: addDays(42),
      venue: "市民文化ホール 小ホール",
      fee: "12000",
      memo: "申込ページ、支払い方法、当日の集合時間を確認する。"
    }];
    state.pieces = [{
      id: createId(),
      title: "貴婦人の乗馬",
      composer: "ブルグミュラー",
      tempo: "108",
      note: "粒をそろえる。左手は軽く、メロディを前に出す。"
    }];
  }

  if (!hasSavedData && state.tasks.length === 0) {
    state.tasks = [
      { id: createId(), title: "ゆっくり片手練習", detail: "右手だけで音の粒をそろえる", target: 5, count: 0 },
      { id: createId(), title: "左手バランス確認", detail: "左手を小さめにしてメロディを前に出す", target: 3, count: 0 },
      { id: createId(), title: "最後の4小節だけ反復", detail: "止まらず弾けるまで部分練習", target: 10, count: 0 }
    ];
    state.practiceLogs = [{
      id: createId(),
      date: addDays(-1),
      minutes: 20,
      memo: "最後の4小節を部分練習。録音して止まる場所を確認。",
      doneSummary: "1/3項目完了"
    }];
  }

  if (!hasSavedData && state.scores.length === 0) {
    state.scores = [
      {
        id: createId(),
        date: addDays(-14),
        type: "teacher",
        tone: 17,
        tempo: 13,
        balance: 9,
        phrase: 10,
        style: 10,
        stage: 6,
        total: 65,
        comment: "音の粒がそろってきた。テンポを急がない。",
        next: "右手だけでゆっくり5回、最後の4小節を部分練習。"
      },
      {
        id: createId(),
        date: addDays(-4),
        type: "parent",
        tone: 19,
        tempo: 15,
        balance: 11,
        phrase: 11,
        style: 11,
        stage: 7,
        total: 74,
        comment: "通して止まらず弾ける回数が増えた。",
        next: "左手を小さめにして、メロディを前に出す。"
      }
    ];
    state.teacherComments = [{
      id: createId(),
      date: addDays(-3),
      body: "音の粒がそろってきました。左手を軽くして、メロディを前に出しましょう。",
      next: "右手だけゆっくり5回、最後の4小節を部分練習。"
    }];
    state.isSampleData = true;
  }
}

function save() {
  localStorage.setItem(STORE_KEY, JSON.stringify({
    childProfile: state.childProfile,
    competitions: state.competitions,
    pieces: state.pieces,
    tasks: state.tasks,
    practiceLogs: state.practiceLogs,
    practiceStamps: state.practiceStamps,
    scores: state.scores,
    teacherComments: state.teacherComments,
    feedbacks: state.feedbacks,
    trialChecks: state.trialChecks,
    isSampleData: state.isSampleData,
    bpm: state.bpm,
    practiceTimerSeconds: state.practiceTimerSeconds
  }));
}

function render() {
  renderHome();
  renderPractice();
  renderRecordings();
  renderGrowth();
  renderTrialTools();
  renderChildProfile();
  renderStorageReport();
  renderBackupStatus();
}

function renderHome() {
  const today = new Date();
  els.todayLabel.textContent = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
  const upcoming = [...state.competitions]
    .filter((item) => daysUntil(item.deadline) !== null && daysUntil(item.deadline) >= 0)
    .sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline))[0];

  els.nextDeadlineLabel.textContent = upcoming
    ? `${upcoming.name}の申込締切まで${formatDays(upcoming.deadline)}`
    : "登録済みの締切はありません";

  els.competitionCount.textContent = state.competitions.length;
  els.urgentCount.textContent = state.competitions.filter((item) => {
    const days = daysUntil(item.deadline);
    return days !== null && days >= 0 && days <= 3;
  }).length;
  els.taskDoneCount.textContent = state.tasks.length
    ? `${state.tasks.filter((task) => task.count >= task.target).length}/${state.tasks.length}`
    : "0";
  const latestScore = getLatestScore();
  els.currentScoreLabel.textContent = latestScore ? `${latestScore.total}` : "-";
  const nextTask = state.tasks.find((task) => task.count < task.target);
  els.todayPracticeLabel.textContent = nextTask
    ? `${nextTask.title}：あと${Math.max(0, nextTask.target - nextTask.count)}回`
    : "今日の練習指示は完了です。録音して聴き返しましょう。";
  renderHomeMission();
  renderPracticeStats();
  renderPracticeSticker();
  renderReadinessStatus();
  renderHomeStatus();
  renderSetupCard();
  renderHomeBackupNudge();

  if (state.competitions.length === 0) {
    els.competitionList.innerHTML = `<div class="notice-card"><strong>まだ登録がありません</strong><span>右上の＋からコンクールを追加できます。</span></div>`;
    return;
  }

  els.competitionList.innerHTML = [...state.competitions]
    .sort((a, b) => (daysUntil(a.deadline) ?? 9999) - (daysUntil(b.deadline) ?? 9999))
    .map((item) => {
      const urgent = [0, 1].includes(daysUntil(item.deadline));
      const checks = getApplicationChecks(item);
      const doneCount = checks.filter((check) => check.done).length;
      return `
        <article class="competition-card ${urgent ? "urgent" : ""}">
          <h3>${escapeHtml(item.name)}</h3>
          <p class="eyebrow">${escapeHtml(item.division || "部門未設定")}</p>
          <div class="meta-list">
            <div>申込締切：${formatDate(item.deadline)}（${formatDays(item.deadline)}）</div>
            <div>本番日：${formatDate(item.eventDate)}</div>
            <div>会場：${escapeHtml(item.venue || "未設定")}</div>
            <div>参加料：${yen(item.fee)}</div>
            ${item.memo ? `<div>メモ：${escapeHtml(item.memo)}</div>` : ""}
          </div>
          <div class="application-checks">
            <strong>申込手続き ${doneCount}/${checks.length}</strong>
            <div>
              ${checks.map((check) => `
                <button class="${check.done ? "done" : ""}" data-application-check="${item.id}:${check.key}">
                  ${check.done ? "✓" : "○"} ${escapeHtml(check.label)}
                </button>
              `).join("")}
            </div>
          </div>
          <div class="card-actions">
            <button class="text-button" data-edit-competition="${item.id}">編集</button>
          </div>
        </article>
      `;
    }).join("");

  $$("[data-edit-competition]").forEach((button) => {
    button.addEventListener("click", () => openCompetitionDialog(button.dataset.editCompetition));
  });
  $$("[data-application-check]").forEach((button) => {
    button.addEventListener("click", () => toggleApplicationCheck(button.dataset.applicationCheck));
  });
}

function applicationCheckDefinitions() {
  return [
    ["page", "申込ページ"],
    ["division", "部門確認"],
    ["payment", "支払い"],
    ["schedule", "当日情報"]
  ];
}

function getApplicationChecks(competition) {
  const saved = competition.applicationChecks || {};
  return applicationCheckDefinitions().map(([key, label]) => ({
    key,
    label,
    done: Boolean(saved[key])
  }));
}

function getApplicationCheckSummary(competition) {
  const checks = getApplicationChecks(competition);
  return `${checks.filter((check) => check.done).length}/${checks.length}完了`;
}

function toggleApplicationCheck(value) {
  const [id, key] = String(value || "").split(":");
  state.isSampleData = false;
  state.competitions = state.competitions.map((competition) => {
    if (competition.id !== id) return competition;
    const applicationChecks = { ...(competition.applicationChecks || {}) };
    applicationChecks[key] = !applicationChecks[key];
    return { ...competition, applicationChecks };
  });
  save();
  render();
}

function renderHomeStatus() {
  const profile = getChildProfileSummary();
  const piece = state.pieces[0];
  const latestPracticeLog = state.practiceLogs.at(-1);
  const latestTeacherComment = state.teacherComments.at(-1);
  const recording = state.recordings[0];
  const items = [
    {
      label: "生徒",
      title: profile.title,
      detail: profile.detail,
      view: "settingsView"
    },
    {
      label: "曲",
      title: piece ? piece.title : "曲を登録",
      detail: piece
        ? `${piece.composer || "作曲者未設定"}${piece.tempo ? ` / ${piece.tempo}BPM` : ""}`
        : "課題曲・自由曲を追加できます",
      view: "practiceView"
    },
    {
      label: "練習",
      title: latestPracticeLog ? `${formatDate(latestPracticeLog.date)} ${latestPracticeLog.minutes}分` : "練習記録を保存",
      detail: latestPracticeLog?.memo || latestPracticeLog?.doneSummary || "今日やったことを残せます",
      view: "practiceView"
    },
    {
      label: "先生",
      title: latestTeacherComment ? formatDate(latestTeacherComment.date) : "先生コメントを保存",
      detail: latestTeacherComment?.next || latestTeacherComment?.body || "返ってきた指導を残せます",
      view: "growthView"
    },
    {
      label: "録音",
      title: recording ? recording.name : "録音する",
      detail: recording ? `${recording.createdAt} / ${recording.duration}` : "弾いたらすぐ聴き返せます",
      view: "recordView"
    }
  ];

  els.homeStatusList.innerHTML = items.map((item) => `
    <button class="home-status-item" data-view-shortcut="${item.view}">
      <span>${escapeHtml(item.label)}</span>
      <strong>${escapeHtml(item.title)}</strong>
      <small>${escapeHtml(item.detail)}</small>
    </button>
  `).join("");

  els.homeStatusList.querySelectorAll("[data-view-shortcut]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.viewShortcut));
  });
}

function getChildProfileSummary() {
  const profile = normalizeChildProfile(state.childProfile);
  const title = profile.name || "生徒名を登録";
  const details = [profile.grade, profile.birthYear ? `${profile.birthYear}年生まれ` : ""].filter(Boolean);
  return {
    title,
    detail: details.length ? details.join(" / ") : "設定画面でプロフィールを登録できます"
  };
}

function formatChildProfileForMemo() {
  const profile = normalizeChildProfile(state.childProfile);
  const main = [
    profile.name || "生徒名未登録",
    profile.grade,
    profile.birthYear ? `${profile.birthYear}年生まれ` : ""
  ].filter(Boolean).join(" / ");
  return profile.memo ? `${main} / メモ：${profile.memo}` : main;
}

function renderChildProfile() {
  if (!els.childNameInput) return;
  const profile = normalizeChildProfile(state.childProfile);
  const summary = getChildProfileSummary();
  els.profileSummary.textContent = profile.memo ? `${summary.detail} / ${profile.memo}` : summary.detail;
  els.childNameInput.value = profile.name;
  els.childGradeInput.value = profile.grade;
  els.childBirthYearInput.value = profile.birthYear;
  els.childMemoInput.value = profile.memo;
}

function saveChildProfile() {
  state.isSampleData = false;
  state.childProfile = normalizeChildProfile({
    name: els.childNameInput.value.trim(),
    grade: els.childGradeInput.value.trim(),
    birthYear: els.childBirthYearInput.value.trim(),
    memo: els.childMemoInput.value.trim()
  });
  save();
  render();
}

function renderSetupCard() {
  const checks = [
    ["プロフィール", Boolean(state.childProfile.name)],
    ["コンクール", state.competitions.length > 0],
    ["曲", state.pieces.length > 0],
    ["練習指示", state.tasks.length > 0],
    ["練習記録", state.practiceLogs.length > 0],
    ["録音", state.recordings.length > 0],
    ["採点", state.scores.length > 0]
  ];
  const readyCount = checks.filter(([, ready]) => ready).length;
  const isReady = readyCount === checks.length && !state.isSampleData;
  els.setupCard.style.display = isReady ? "none" : "";
  els.setupTitle.textContent = state.isSampleData ? "サンプル表示中" : "セットアップ";
  els.setupSummary.textContent = state.isSampleData
    ? "今は例のデータです。試用するときは自分のコンクールで始められます。"
    : `販売前チェック：${readyCount}/${checks.length}項目が入力済みです。`;
  $("#startPersonalSetupButton").textContent = state.isSampleData ? "自分用に始める" : "コンクール登録";
  els.setupChecks.innerHTML = checks.map(([label, ready]) => `
    <span class="${ready && !state.isSampleData ? "done" : ""}">${ready && !state.isSampleData ? "✓" : "○"} ${escapeHtml(label)}</span>
  `).join("");
}

function renderPractice() {
  els.bpmLabel.textContent = state.bpm;
  els.tempoSlider.value = String(state.bpm);
  els.practiceTimerLabel.textContent = formatDuration(state.practiceTimerRemaining);
  els.kidPracticeTimerLabel.textContent = formatDuration(state.practiceTimerRemaining);
  renderKidPracticeCard();
  renderPieces();
  renderPracticeLogs();
  if (state.tasks.length === 0) {
    els.taskList.innerHTML = `<div class="notice-card"><strong>練習指示はまだありません</strong><span>先生からの宿題や家庭での練習方法を追加できます。</span></div>`;
    return;
  }
  els.taskList.innerHTML = state.tasks.map((task) => {
    const target = Math.max(1, Number(task.target || 1));
    const percent = Math.min(100, Math.round((task.count / target) * 100));
    return `
      <article class="task-card">
        <div class="task-card-head">
          <div>
            <h3>${escapeHtml(task.title)}</h3>
            <p>先生の指示：${escapeHtml(task.detail)}</p>
          </div>
          <strong class="task-count">${task.count}/${target}</strong>
        </div>
        <div class="progress"><span style="width:${percent}%"></span></div>
        <div class="counter-row">
          <button data-task-minus="${task.id}">−</button>
          <button data-task-plus="${task.id}">できた</button>
          <button data-task-reset="${task.id}">0</button>
        </div>
        <button class="text-button task-edit-button" data-edit-task="${task.id}">指示を編集</button>
      </article>
    `;
  }).join("");

  $$("[data-task-minus]").forEach((button) => button.addEventListener("click", () => updateTask(button.dataset.taskMinus, -1)));
  $$("[data-task-plus]").forEach((button) => button.addEventListener("click", () => updateTask(button.dataset.taskPlus, 1)));
  $$("[data-task-reset]").forEach((button) => button.addEventListener("click", () => resetTask(button.dataset.taskReset)));
  $$("[data-edit-task]").forEach((button) => button.addEventListener("click", () => openTaskDialog(button.dataset.editTask)));
}

function renderKidPracticeCard() {
  const task = getNextOpenTask();
  if (!task) {
    els.kidPracticeTitle.textContent = state.tasks.length ? "今日の課題は完了" : "今日やることを登録しよう";
    els.kidPracticeDetail.textContent = state.tasks.length
      ? "よくできました。録音して聴き返すか、練習記録を残しましょう。"
      : "先生の練習指示を追加すると、ここに大きく表示されます。";
    els.kidPracticeCount.textContent = state.tasks.length ? "完了" : "0/1";
    els.kidPracticeBar.style.width = state.tasks.length ? "100%" : "0%";
    els.kidPracticeDoneButton.disabled = true;
    delete els.kidPracticeDoneButton.dataset.kidTaskId;
    return;
  }

  const target = Math.max(1, Number(task.target || 1));
  const count = Math.min(target, Number(task.count || 0));
  const percent = Math.min(100, Math.round((count / target) * 100));
  els.kidPracticeTitle.textContent = task.title || "練習する";
  els.kidPracticeDetail.textContent = task.detail || "ゆっくり、ていねいに弾きましょう。";
  els.kidPracticeCount.textContent = `${count}/${target}`;
  els.kidPracticeBar.style.width = `${percent}%`;
  els.kidPracticeDoneButton.disabled = false;
  els.kidPracticeDoneButton.dataset.kidTaskId = task.id;
}

function renderPieces() {
  if (state.pieces.length === 0) {
    els.pieceList.innerHTML = `<div class="notice-card"><strong>曲はまだありません</strong><span>課題曲や自由曲を追加すると、先生共有メモにも反映されます。</span></div>`;
    return;
  }

  els.pieceList.innerHTML = state.pieces.map((piece) => `
    <article class="piece-card">
      <div>
        <h3>${escapeHtml(piece.title)}</h3>
        <span>${escapeHtml(piece.composer || "作曲者未設定")}${piece.tempo ? ` / 目標 ${escapeHtml(piece.tempo)} BPM` : ""}</span>
      </div>
      ${piece.note ? `<p>${escapeHtml(piece.note)}</p>` : ""}
      <button class="mini-danger-button" data-delete-piece="${piece.id}">削除</button>
    </article>
  `).join("");

  $$("[data-delete-piece]").forEach((button) => {
    button.addEventListener("click", () => deletePiece(button.dataset.deletePiece));
  });
}

function renderPracticeLogs() {
  if (state.practiceLogs.length === 0) {
    els.practiceLogList.innerHTML = `<div class="notice-card"><strong>練習記録はまだありません</strong><span>練習後に時間と内容を保存すると、先生共有メモにも反映されます。</span></div>`;
    return;
  }

  els.practiceLogList.innerHTML = [...state.practiceLogs].reverse().slice(0, 5).map((log) => `
    <article class="practice-log-card">
      <div>
        <strong>${escapeHtml(formatDate(log.date))} / ${escapeHtml(log.minutes)}分</strong>
        <span>${escapeHtml(log.doneSummary || "進み具合未記録")}</span>
      </div>
      <p>${escapeHtml(log.memo || "メモなし")}</p>
      <button class="mini-danger-button" data-delete-practice-log="${log.id}">削除</button>
    </article>
  `).join("");

  $$("[data-delete-practice-log]").forEach((button) => {
    button.addEventListener("click", () => deletePracticeLog(button.dataset.deletePracticeLog));
  });
}

function renderRecordings() {
  if (state.recordings.length === 0) {
    els.recordingList.innerHTML = `<div class="notice-card"><strong>録音はまだありません</strong><span>中央の録音ボタンから始めます。録音はこの端末内に保存されます。</span></div>`;
    return;
  }
  els.recordingList.innerHTML = state.recordings.map((recording) => `
    <article class="recording-card ${recording.favorite ? "favorite" : ""} ${recording.saved ? "saved" : ""}">
      <div class="recording-head">
        <div>
          <h3>${escapeHtml(recording.name)}</h3>
          <p class="subcopy">${escapeHtml(recording.createdAt)} / ${escapeHtml(recording.duration)}</p>
        </div>
        <div class="recording-actions">
          <button class="mini-action-button" data-favorite-recording="${recording.id}">${recording.favorite ? "大切" : "通常"}</button>
          <button class="mini-action-button ${recording.saved ? "saved" : ""}" data-saved-recording="${recording.id}">${recording.saved ? "保存済み" : "未保存"}</button>
          <button class="mini-action-button" data-rename-recording="${recording.id}">名前</button>
          <button class="mini-danger-button" data-delete-recording="${recording.id}">削除</button>
        </div>
      </div>
      <audio controls src="${recording.url}"></audio>
      <textarea class="recording-memo" data-recording-memo="${recording.id}" rows="2" placeholder="先生に聞いてほしい所、弾き直したい所など">${escapeHtml(recording.memo || "")}</textarea>
      <a class="download-link" href="${recording.url}" download="${escapeHtml(recording.name)}.webm" data-save-recording="${recording.id}">端末に保存</a>
    </article>
  `).join("");

  $$("[data-favorite-recording]").forEach((button) => {
    button.addEventListener("click", () => toggleRecordingFavorite(button.dataset.favoriteRecording));
  });

  $$("[data-rename-recording]").forEach((button) => {
    button.addEventListener("click", () => renameRecording(button.dataset.renameRecording));
  });

  $$("[data-saved-recording]").forEach((button) => {
    button.addEventListener("click", () => toggleRecordingSaved(button.dataset.savedRecording));
  });

  $$("[data-save-recording]").forEach((link) => {
    link.addEventListener("click", () => setTimeout(() => markRecordingSaved(link.dataset.saveRecording), 0));
  });

  $$("[data-recording-memo]").forEach((textarea) => {
    textarea.addEventListener("change", () => updateRecordingMemo(textarea.dataset.recordingMemo, textarea.value));
  });

  $$("[data-delete-recording]").forEach((button) => {
    button.addEventListener("click", () => deleteRecording(button.dataset.deleteRecording));
  });
}

function getSortedScores() {
  return [...state.scores].sort((a, b) => parseDate(a.date) - parseDate(b.date));
}

function getLatestScore() {
  return getSortedScores().at(-1);
}

function scoreTypeLabel(type) {
  return ({
    teacher: "先生",
    parent: "保護者",
    competition: "コンクール",
    ai: "AI講評メモ"
  })[type] || "未設定";
}

function renderGrowth() {
  const sorted = getSortedScores();
  const latest = sorted.at(-1);
  els.latestScoreHero.textContent = latest ? latest.total : "-";
  updateScorePreview();
  renderTeacherComments();

  if (sorted.length === 0) {
    els.scoreChart.innerHTML = `<div class="notice-card"><strong>採点はまだありません</strong><span>上のフォームから先生・保護者の採点を保存できます。</span></div>`;
    els.scoreList.innerHTML = "";
    els.teacherMemoOutput.value = buildTeacherMemo();
    els.teacherReviewOutput.value = buildTeacherReviewRequest();
    return;
  }

  els.scoreChart.innerHTML = sorted.slice(-8).map((score) => `
    <div class="score-bar">
      <div class="score-bar-track"><span style="height:${Math.max(4, score.total)}%"></span></div>
      <strong>${score.total}</strong>
      <small>${formatShortDate(score.date)}</small>
    </div>
  `).join("");

  els.scoreList.innerHTML = [...sorted].reverse().slice(0, 6).map((score) => `
    <article class="score-card">
      <div>
        <strong>${score.total}点</strong>
        <span>${formatDate(score.date)} / ${scoreTypeLabel(score.type)}</span>
      </div>
      <p>${escapeHtml(score.comment || "総評なし")}</p>
      ${score.next ? `<p class="next-note">次：${escapeHtml(score.next)}</p>` : ""}
      <div class="score-card-actions">
        <button class="mini-action-button" data-edit-score="${score.id}">編集</button>
        <button class="mini-danger-button" data-delete-score="${score.id}">削除</button>
      </div>
    </article>
  `).join("");

  $$("[data-edit-score]").forEach((button) => {
    button.addEventListener("click", () => openScoreEditor(button.dataset.editScore));
  });

  $$("[data-delete-score]").forEach((button) => {
    button.addEventListener("click", () => deleteScore(button.dataset.deleteScore));
  });
  els.teacherMemoOutput.value = buildTeacherMemo();
  els.teacherReviewOutput.value = buildTeacherReviewRequest();
}

function renderTeacherComments() {
  if (state.teacherComments.length === 0) {
    els.teacherCommentList.innerHTML = `<div class="notice-card"><strong>先生コメントはまだありません</strong><span>先生から返ってきた指導を貼って保存できます。</span></div>`;
    return;
  }

  els.teacherCommentList.innerHTML = [...state.teacherComments].reverse().slice(0, 5).map((comment) => `
    <article class="teacher-comment-card">
      <div>
        <strong>${escapeHtml(formatDate(comment.date))}</strong>
        <span>先生コメント</span>
      </div>
      <p>${escapeHtml(comment.body || "コメントなし")}</p>
      ${comment.next ? `<p class="next-note">次：${escapeHtml(comment.next)}</p>` : ""}
      <div class="teacher-comment-actions">
        <button class="mini-action-button ${isTeacherCommentTaskActive(comment) ? "saved" : ""}" data-task-from-teacher-comment="${comment.id}">
          ${isTeacherCommentTaskActive(comment) ? "課題追加済み" : "課題に追加"}
        </button>
        <button class="mini-danger-button" data-delete-teacher-comment="${comment.id}">削除</button>
      </div>
    </article>
  `).join("");

  $$("[data-task-from-teacher-comment]").forEach((button) => {
    button.addEventListener("click", () => createTaskFromTeacherComment(button.dataset.taskFromTeacherComment));
  });

  $$("[data-delete-teacher-comment]").forEach((button) => {
    button.addEventListener("click", () => deleteTeacherComment(button.dataset.deleteTeacherComment));
  });
}

function isTeacherCommentTaskActive(comment) {
  return Boolean(comment.taskId && state.tasks.some((task) => task.id === comment.taskId));
}

function createTaskFromTeacherComment(id) {
  const comment = state.teacherComments.find((item) => item.id === id);
  if (!comment) return;
  if (isTeacherCommentTaskActive(comment)) {
    setView("practiceView");
    return;
  }
  state.isSampleData = false;
  const taskId = addTaskFromTeacherComment(comment);
  state.teacherComments = state.teacherComments.map((item) => item.id === id ? { ...item, taskId } : item);
  save();
  render();
  setView("practiceView");
}

function addTaskFromTeacherComment(comment) {
  const sourceText = (comment.next || comment.body || "先生からの課題").trim();
  const taskId = createId();
  const title = sourceText.length > 26 ? `${sourceText.slice(0, 26)}...` : sourceText;
  state.tasks.unshift({
    id: taskId,
    title,
    detail: `先生コメント ${formatDate(comment.date)}：${sourceText}`,
    target: 5,
    count: 0,
    source: "teacherComment"
  });
  return taskId;
}

function formatShortDate(value) {
  const date = parseDate(value);
  if (!date) return "-";
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function openCompetitionDialog(id = "") {
  const item = state.competitions.find((competition) => competition.id === id);
  $("#competitionId").value = item?.id || "";
  $("#competitionName").value = item?.name || "";
  $("#competitionDivision").value = item?.division || "";
  $("#competitionDeadline").value = item?.deadline || "";
  $("#competitionEventDate").value = item?.eventDate || "";
  $("#competitionVenue").value = item?.venue || "";
  $("#competitionFee").value = item?.fee || "";
  $("#competitionMemo").value = item?.memo || "";
  $("#deleteCompetitionButton").style.display = item ? "" : "none";
  els.competitionDialog.showModal();
}

function saveCompetition(event) {
  event.preventDefault();
  state.isSampleData = false;
  const id = $("#competitionId").value || createId();
  const current = state.competitions.find((competition) => competition.id === id);
  const item = {
    id,
    name: $("#competitionName").value.trim(),
    division: $("#competitionDivision").value.trim(),
    deadline: $("#competitionDeadline").value,
    eventDate: $("#competitionEventDate").value,
    venue: $("#competitionVenue").value.trim(),
    fee: $("#competitionFee").value.trim(),
    memo: $("#competitionMemo").value.trim(),
    applicationChecks: current?.applicationChecks || {}
  };
  const index = state.competitions.findIndex((competition) => competition.id === id);
  if (index >= 0) state.competitions[index] = item;
  else state.competitions.unshift(item);
  save();
  els.competitionDialog.close();
  render();
  checkReminders();
}

function deleteCompetition() {
  const id = $("#competitionId").value;
  state.competitions = state.competitions.filter((competition) => competition.id !== id);
  save();
  els.competitionDialog.close();
  render();
}

function updateTask(id, delta) {
  if (delta > 0) addPracticeStamp();
  state.tasks = state.tasks.map((task) => task.id === id ? { ...task, count: Math.max(0, task.count + delta) } : task);
  save();
  render();
}

function resetTask(id) {
  state.tasks = state.tasks.map((task) => task.id === id ? { ...task, count: 0 } : task);
  save();
  render();
}

function completeHomeMission() {
  const id = els.homeMissionDoneButton.dataset.homeTaskId;
  if (!id) return;
  updateTask(id, 1);
}

function completeKidPracticeTask() {
  const id = els.kidPracticeDoneButton.dataset.kidTaskId;
  if (!id) return;
  updateTask(id, 1);
}

function startKidPracticeTimer() {
  setPracticeTimer(10);
  togglePracticeTimer();
}

function getTaskDoneSummary() {
  if (state.tasks.length === 0) return "練習指示なし";
  const done = state.tasks.filter((task) => task.count >= Math.max(1, Number(task.target || 1))).length;
  return `${done}/${state.tasks.length}項目完了`;
}

function addPiece() {
  const title = $("#pieceTitleInput").value.trim();
  if (!title) return;
  state.isSampleData = false;
  state.pieces.unshift({
    id: createId(),
    title,
    composer: $("#pieceComposerInput").value.trim(),
    tempo: $("#pieceTempoInput").value.trim(),
    note: $("#pieceNoteInput").value.trim()
  });
  $("#pieceTitleInput").value = "";
  $("#pieceComposerInput").value = "";
  $("#pieceTempoInput").value = "";
  $("#pieceNoteInput").value = "";
  save();
  render();
}

function deletePiece(id) {
  if (!confirm("この曲を削除しますか？")) return;
  state.pieces = state.pieces.filter((piece) => piece.id !== id);
  save();
  render();
}

function addTask() {
  const title = $("#taskTitleInput").value.trim();
  if (!title) return;
  state.isSampleData = false;
  state.tasks.unshift({ id: createId(), title, detail: "練習後に内容を具体的に書き足す", target: 5, count: 0 });
  $("#taskTitleInput").value = "";
  save();
  render();
}

function savePracticeLog() {
  const minutes = Math.max(1, Math.min(240, Number($("#practiceMinutesInput").value || 15)));
  const memo = $("#practiceLogMemoInput").value.trim();
  state.isSampleData = false;
  state.practiceLogs.push({
    id: createId(),
    date: todayKey(),
    minutes,
    memo,
    doneSummary: getTaskDoneSummary()
  });
  $("#practiceLogMemoInput").value = "";
  save();
  render();
}

function deletePracticeLog(id) {
  if (!confirm("この練習記録を削除しますか？")) return;
  state.practiceLogs = state.practiceLogs.filter((log) => log.id !== id);
  save();
  render();
}

function openTaskDialog(id) {
  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;
  $("#taskId").value = task.id;
  $("#taskTitleEdit").value = task.title || "";
  $("#taskDetailEdit").value = task.detail || "";
  $("#taskTargetEdit").value = String(task.target || 5);
  els.taskDialog.showModal();
}

function saveTask(event) {
  event.preventDefault();
  state.isSampleData = false;
  const id = $("#taskId").value;
  const target = Math.max(1, Number($("#taskTargetEdit").value || 1));
  state.tasks = state.tasks.map((task) => task.id === id ? {
    ...task,
    title: $("#taskTitleEdit").value.trim(),
    detail: $("#taskDetailEdit").value.trim(),
    target,
    count: Math.min(task.count, target)
  } : task);
  save();
  els.taskDialog.close();
  render();
}

function deleteTask() {
  const id = $("#taskId").value;
  state.tasks = state.tasks.filter((task) => task.id !== id);
  save();
  els.taskDialog.close();
  render();
}

function setPracticeTimer(minutes) {
  stopPracticeTimer();
  state.practiceTimerSeconds = minutes * 60;
  state.practiceTimerRemaining = state.practiceTimerSeconds;
  save();
  renderPractice();
}

function stopPracticeTimer() {
  if (state.practiceTimerId) {
    clearInterval(state.practiceTimerId);
    state.practiceTimerId = null;
  }
  els.timerStartButton.textContent = "開始";
}

function togglePracticeTimer() {
  if (state.practiceTimerId) {
    stopPracticeTimer();
    return;
  }
  els.timerStartButton.textContent = "一時停止";
  state.practiceTimerId = setInterval(() => {
    state.practiceTimerRemaining = Math.max(0, state.practiceTimerRemaining - 1);
    els.practiceTimerLabel.textContent = formatDuration(state.practiceTimerRemaining);
    els.kidPracticeTimerLabel.textContent = formatDuration(state.practiceTimerRemaining);
    if (state.practiceTimerRemaining === 0) {
      stopPracticeTimer();
      els.practiceTimerLabel.textContent = "できた！";
      els.kidPracticeTimerLabel.textContent = "できた";
    }
  }, 1000);
}

function resetPracticeTimer() {
  stopPracticeTimer();
  state.practiceTimerRemaining = state.practiceTimerSeconds;
  renderPractice();
}

function clampScore(value, max) {
  const number = Number(value || 0);
  if (Number.isNaN(number)) return 0;
  return Math.max(0, Math.min(max, number));
}

function getScoreFormValues() {
  const tone = clampScore($("#toneScoreInput").value, 25);
  const tempo = clampScore($("#tempoScoreInput").value, 20);
  const balance = clampScore($("#balanceScoreInput").value, 15);
  const phrase = clampScore($("#phraseScoreInput").value, 15);
  const style = clampScore($("#styleScoreInput").value, 15);
  const stage = clampScore($("#stageScoreInput").value, 10);
  return {
    tone,
    tempo,
    balance,
    phrase,
    style,
    stage,
    total: tone + tempo + balance + phrase + style + stage
  };
}

function updateScorePreview() {
  const total = getScoreFormValues().total;
  els.scoreTotalPreview.textContent = `${total}点`;
}

function saveScore() {
  state.isSampleData = false;
  const values = getScoreFormValues();
  const score = {
    id: state.editingScoreId || createId(),
    date: $("#scoreDateInput").value || todayKey(),
    type: $("#scoreTypeInput").value,
    ...values,
    comment: $("#scoreCommentInput").value.trim(),
    next: $("#scoreNextInput").value.trim()
  };
  if (state.editingScoreId) {
    state.scores = state.scores.map((item) => item.id === state.editingScoreId ? score : item);
  } else {
    state.scores.push(score);
  }
  resetScoreForm();
  save();
  render();
}

function openScoreEditor(id) {
  const score = state.scores.find((item) => item.id === id);
  if (!score) return;
  state.editingScoreId = id;
  $("#scoreTypeInput").value = score.type || "teacher";
  $("#scoreDateInput").value = score.date || todayKey();
  $("#toneScoreInput").value = score.tone ?? 0;
  $("#tempoScoreInput").value = score.tempo ?? 0;
  $("#balanceScoreInput").value = score.balance ?? 0;
  $("#phraseScoreInput").value = score.phrase ?? 0;
  $("#styleScoreInput").value = score.style ?? 0;
  $("#stageScoreInput").value = score.stage ?? 0;
  $("#scoreCommentInput").value = score.comment || "";
  $("#scoreNextInput").value = score.next || "";
  els.scoreFormTitle.textContent = "採点を編集";
  els.scoreFormSubcopy.textContent = "保存すると履歴の内容を更新します";
  $("#addScoreButton").textContent = "変更を保存";
  $("#cancelScoreEditButton").style.display = "";
  updateScorePreview();
  setView("growthView");
  $("#scoreFormTitle").scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetScoreForm() {
  state.editingScoreId = "";
  $("#scoreTypeInput").value = "teacher";
  $("#scoreDateInput").value = todayKey();
  $("#toneScoreInput").value = "18";
  $("#tempoScoreInput").value = "14";
  $("#balanceScoreInput").value = "10";
  $("#phraseScoreInput").value = "10";
  $("#styleScoreInput").value = "10";
  $("#stageScoreInput").value = "6";
  $("#scoreCommentInput").value = "";
  $("#scoreNextInput").value = "";
  els.scoreFormTitle.textContent = "採点を追加";
  els.scoreFormSubcopy.textContent = "6項目から総合点を自動計算";
  $("#addScoreButton").textContent = "採点を保存";
  $("#cancelScoreEditButton").style.display = "none";
  updateScorePreview();
}

function deleteScore(id) {
  if (!confirm("この採点を削除しますか？")) return;
  state.scores = state.scores.filter((score) => score.id !== id);
  if (state.editingScoreId === id) resetScoreForm();
  save();
  render();
}

function saveTeacherComment() {
  const body = $("#teacherCommentInput").value.trim();
  const next = $("#teacherCommentNextInput").value.trim();
  if (!body && !next) return;
  state.isSampleData = false;
  const comment = {
    id: createId(),
    date: todayKey(),
    body,
    next
  };
  if (next && $("#teacherCommentTaskInput")?.checked) {
    comment.taskId = addTaskFromTeacherComment(comment);
  }
  state.teacherComments.push(comment);
  $("#teacherCommentInput").value = "";
  $("#teacherCommentNextInput").value = "";
  $("#teacherCommentTaskInput").checked = true;
  save();
  render();
}

function deleteTeacherComment(id) {
  if (!confirm("この先生コメントを削除しますか？")) return;
  state.teacherComments = state.teacherComments.filter((comment) => comment.id !== id);
  save();
  render();
}

function buildTeacherMemo() {
  const nextCompetition = [...state.competitions]
    .filter((competition) => daysUntil(competition.eventDate) === null || daysUntil(competition.eventDate) >= 0)
    .sort((a, b) => (daysUntil(a.eventDate) ?? 9999) - (daysUntil(b.eventDate) ?? 9999))[0];
  const latestTeacherScore = getSortedScores().reverse().find((score) => score.type === "teacher");
  const latestScore = latestTeacherScore || getLatestScore();
  const pieces = state.pieces.slice(0, 4);
  const latestTeacherComment = state.teacherComments.at(-1);
  const openTasks = state.tasks.filter((task) => task.count < task.target).slice(0, 5);
  const recentPracticeLogs = [...state.practiceLogs].reverse().slice(0, 3);
  const importantRecordings = state.recordings.filter((recording) => recording.favorite).slice(0, 3);
  const recentRecordings = importantRecordings.length ? importantRecordings : state.recordings.slice(0, 3);
  const childProfileLine = formatChildProfileForMemo();
  const practiceStatsLine = formatPracticeStatsForMemo();
  const readinessLine = formatReadinessForMemo();

  const lines = [
    "【ピアノコンクール練習メモ】",
    `作成日：${formatDate(todayKey())}`,
    "",
    "■ 生徒",
    childProfileLine,
    "",
    "■ コンクール",
    nextCompetition
      ? `${nextCompetition.name} / ${nextCompetition.division || "部門未設定"} / 本番 ${formatDate(nextCompetition.eventDate)} / 申込締切 ${formatDate(nextCompetition.deadline)}`
      : "未登録",
    nextCompetition ? `申込手続き：${getApplicationCheckSummary(nextCompetition)}` : "",
    readinessLine,
    "",
    "■ 曲",
    ...(pieces.length
      ? pieces.map((piece) => `・${piece.title}${piece.composer ? ` / ${piece.composer}` : ""}${piece.tempo ? ` / 目標${piece.tempo}BPM` : ""}${piece.note ? `：${piece.note}` : ""}`)
      : ["曲未登録"]),
    "",
    "■ 最新採点",
    latestScore
      ? `${scoreTypeLabel(latestScore.type)} ${formatDate(latestScore.date)}：${latestScore.total}点`
      : "未登録",
    latestScore?.comment ? `総評：${latestScore.comment}` : "",
    latestScore?.next ? `次の課題：${latestScore.next}` : "",
    "",
    "■ 最新の先生コメント",
    latestTeacherComment
      ? `${formatDate(latestTeacherComment.date)}：${latestTeacherComment.body || "コメントなし"}${latestTeacherComment.next ? ` / 次：${latestTeacherComment.next}` : ""}`
      : "未登録",
    "",
    "■ 練習指示の進み具合",
    ...(openTasks.length
      ? openTasks.map((task) => `・${task.title}：${task.count}/${task.target}回 - ${task.detail || "詳細なし"}`)
      : ["完了済み、または未登録"]),
    "",
    "■ 最近の練習記録",
    practiceStatsLine,
    ...(recentPracticeLogs.length
      ? recentPracticeLogs.map((log) => `・${formatDate(log.date)}：${log.minutes}分 / ${log.doneSummary || "進み具合未記録"} / ${log.memo || "メモなし"}`)
      : ["練習記録未登録"]),
    "",
    "■ 録音メモ",
    ...(recentRecordings.length
      ? recentRecordings.map((recording) => `・${recording.name}（${recording.createdAt} / ${recording.duration}）${recording.memo ? `：${recording.memo}` : ""}`)
      : ["録音未登録"]),
    "",
    "※録音ファイル本体はこの端末内保存です。必要な録音はアプリ内の「端末に保存」から別途共有してください。"
  ];

  return lines.filter((line) => line !== "").join("\n");
}

function buildTeacherReviewRequest() {
  const nextCompetition = [...state.competitions]
    .filter((competition) => daysUntil(competition.eventDate) === null || daysUntil(competition.eventDate) >= 0)
    .sort((a, b) => (daysUntil(a.eventDate) ?? 9999) - (daysUntil(b.eventDate) ?? 9999))[0];
  const latestScore = getLatestScore();
  const currentPiece = state.pieces[0];
  const nextTask = state.tasks.find((task) => task.count < task.target);
  const latestPracticeLog = state.practiceLogs.at(-1);
  const latestTeacherComment = state.teacherComments.at(-1);
  const recording = state.recordings.find((item) => item.favorite) || state.recordings[0];
  const competitionLine = nextCompetition
    ? `${nextCompetition.name} ${nextCompetition.division || ""} / 本番 ${formatDate(nextCompetition.eventDate)}`
    : "コンクール未登録";
  const scoreLine = latestScore
    ? `${formatDate(latestScore.date)} ${latestScore.total}点（${scoreTypeLabel(latestScore.type)}）`
    : "採点未登録";
  const pieceLine = currentPiece
    ? `${currentPiece.title}${currentPiece.composer ? ` / ${currentPiece.composer}` : ""}${currentPiece.tempo ? ` / 目標${currentPiece.tempo}BPM` : ""}`
    : "曲未登録";
  const taskLine = nextTask
    ? `${nextTask.title}：${nextTask.count}/${nextTask.target}回 - ${nextTask.detail || "詳細なし"}`
    : "未完了課題なし";
  const practiceLine = latestPracticeLog
    ? `${formatDate(latestPracticeLog.date)} ${latestPracticeLog.minutes}分 - ${latestPracticeLog.memo || latestPracticeLog.doneSummary || "メモなし"}`
    : "練習記録未登録";
  const teacherCommentLine = latestTeacherComment
    ? `${formatDate(latestTeacherComment.date)} - ${latestTeacherComment.body || ""}${latestTeacherComment.next ? ` / 次：${latestTeacherComment.next}` : ""}`
    : "先生コメント未登録";
  const childProfileLine = formatChildProfileForMemo();
  const practiceStatsLine = formatPracticeStatsForMemo();
  const readinessLine = formatReadinessForMemo();
  const recordingLine = recording
    ? `${recording.name}（${recording.createdAt} / ${recording.duration}）${recording.memo ? `：${recording.memo}` : ""}`
    : "録音は別途送ります";

  return [
    "先生、録音チェックをお願いします。",
    "",
    `生徒：${childProfileLine}`,
    `コンクール：${competitionLine}`,
    `曲：${pieceLine}`,
    `確認してほしい録音：${recordingLine}`,
    `最近の採点：${scoreLine}`,
    `前回の先生コメント：${teacherCommentLine}`,
    `直近の練習：${practiceLine}`,
    `練習ペース：${practiceStatsLine}`,
    `準備状況：${readinessLine}`,
    `今の練習課題：${taskLine}`,
    "",
    "見ていただきたいこと：",
    "1. 本番までに優先して直す点",
    "2. 次回までの練習メニュー",
    "3. 点数をつけるなら現時点の目安",
    "",
    "先生コメント：",
    "良い点：",
    "直す点：",
    "次回課題："
  ].join("\n");
}

async function copyTeacherMemo() {
  const text = buildTeacherMemo();
  els.teacherMemoOutput.value = text;
  try {
    await navigator.clipboard.writeText(text);
    $("#copyTeacherMemoButton").textContent = "コピー済み";
    setTimeout(() => { $("#copyTeacherMemoButton").textContent = "コピー"; }, 1600);
  } catch {
    els.teacherMemoOutput.select();
    alert("コピーできない場合は、メモ欄を選択して手動でコピーしてください。");
  }
}

function copyTeacherReviewRequest() {
  const text = buildTeacherReviewRequest();
  els.teacherReviewOutput.value = text;
  copyText(text, $("#copyTeacherReviewButton"));
}

function roleLabel(role) {
  return ({
    parent: "保護者",
    teacher: "先生",
    student: "本人"
  })[role] || "未設定";
}

function buildTrialInvite() {
  const trialItems = trialCheckDefinitions().map(([, title]) => `・${title}`);
  return [
    "【ピアノコンクールノート 試用URL】",
    "https://kamihikooki424-ai.github.io/piano-competition-note-pwa/",
    "",
    "■ 使い始め",
    "1. スマホでURLを開く",
    "2. ホーム画面に追加する",
    "3. コンクール締切、先生の練習指示、録音、採点を試す",
    "",
    "■ 試してほしい操作",
    ...trialItems,
    "",
    "■ 注意",
    "入力データと録音はこの端末内に保存されます。GitHubへ送信されません。",
    "機種変更やブラウザ削除に備えて、設定からバックアップを書き出してください。",
    "録音ファイルは録音カードの「端末に保存」から個別に保存してください。",
    "",
    "■ 見てほしい点",
    "・保護者が迷わず使えるか",
    "・先生に渡す共有メモが役に立つか",
    "・録音と採点の流れが続けやすいか"
  ].join("\n");
}

function trialCheckDefinitions() {
  return [
    ["install", "ホーム画面に追加", "スマホでURLを開き、アプリとして起動できるか"],
    ["profile", "プロフィール登録", "子どもの名前・学年を登録できるか"],
    ["competition", "コンクール登録", "申込締切・本番日・会場を登録できるか"],
    ["practice", "練習指示と記録", "先生の練習方法と今日の練習内容を残せるか"],
    ["recording", "録音と再生", "録音して聴き返せるか"],
    ["score", "採点と成長確認", "採点して点数推移を見られるか"],
    ["teacher", "先生共有", "先生チェック依頼文をコピーできるか"],
    ["backup", "バックアップ", "設定からJSONを書き出せるか"]
  ];
}

function getTrialProgress() {
  const items = trialCheckDefinitions();
  const done = items.filter(([key]) => state.trialChecks[key]).length;
  return { done, total: items.length, items };
}

function renderTrialChecklist() {
  const progress = getTrialProgress();
  els.trialProgressLabel.textContent = `${progress.done}/${progress.total}項目確認済み`;
  els.trialChecklist.innerHTML = progress.items.map(([key, title, detail]) => `
    <button class="${state.trialChecks[key] ? "done" : ""}" data-trial-check="${key}" type="button">
      <span>${state.trialChecks[key] ? "✓" : "○"}</span>
      <strong>${escapeHtml(title)}</strong>
      <small>${escapeHtml(detail)}</small>
    </button>
  `).join("");
  els.trialChecklist.querySelectorAll("[data-trial-check]").forEach((button) => {
    button.addEventListener("click", () => toggleTrialCheck(button.dataset.trialCheck));
  });
}

function toggleTrialCheck(key) {
  state.trialChecks[key] = !state.trialChecks[key];
  save();
  renderTrialTools();
  renderStorageReport();
}

function formatTrialProgressForShare() {
  const progress = getTrialProgress();
  const remaining = progress.items
    .filter(([key]) => !state.trialChecks[key])
    .map(([, title]) => title);
  return `試用チェック：${progress.done}/${progress.total}完了${remaining.length ? ` / 未確認：${remaining.join("、")}` : " / すべて確認済み"}`;
}

function renderTrialTools() {
  els.trialInviteOutput.value = buildTrialInvite();
  renderTrialChecklist();

  if (state.feedbacks.length === 0) {
    els.feedbackList.innerHTML = `<div class="notice-card"><strong>フィードバックはまだありません</strong><span>試用してもらった感想をここに記録できます。</span></div>`;
    return;
  }

  els.feedbackList.innerHTML = [...state.feedbacks].reverse().map((feedback) => `
    <article class="feedback-card">
      <div>
        <strong>${escapeHtml(roleLabel(feedback.role))} / ${escapeHtml(feedback.rating)}点</strong>
        <span>${escapeHtml(feedback.date)}</span>
      </div>
      ${feedback.good ? `<p>良かったこと：${escapeHtml(feedback.good)}</p>` : ""}
      ${feedback.stuck ? `<p>迷ったこと：${escapeHtml(feedback.stuck)}</p>` : ""}
      ${feedback.request ? `<p>ほしい機能：${escapeHtml(feedback.request)}</p>` : ""}
      <button class="mini-danger-button" data-delete-feedback="${feedback.id}">削除</button>
    </article>
  `).join("");

  $$("[data-delete-feedback]").forEach((button) => {
    button.addEventListener("click", () => deleteFeedback(button.dataset.deleteFeedback));
  });
}

function saveFeedback() {
  const feedback = {
    id: createId(),
    date: new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date()),
    role: $("#feedbackRoleInput").value,
    rating: $("#feedbackRatingInput").value,
    good: $("#feedbackGoodInput").value.trim(),
    stuck: $("#feedbackStuckInput").value.trim(),
    request: $("#feedbackRequestInput").value.trim()
  };
  state.feedbacks.push(feedback);
  $("#feedbackGoodInput").value = "";
  $("#feedbackStuckInput").value = "";
  $("#feedbackRequestInput").value = "";
  save();
  renderTrialTools();
}

function deleteFeedback(id) {
  if (!confirm("このフィードバックを削除しますか？")) return;
  state.feedbacks = state.feedbacks.filter((feedback) => feedback.id !== id);
  save();
  renderTrialTools();
}

function buildFeedbackSummary() {
  if (state.feedbacks.length === 0) {
    return `試用フィードバックはまだありません。\n${formatTrialProgressForShare()}`;
  }
  const average = state.feedbacks.reduce((sum, feedback) => sum + Number(feedback.rating || 0), 0) / state.feedbacks.length;
  const lines = [
    "【ピアノコンクールノート 試用フィードバック】",
    `件数：${state.feedbacks.length}`,
    `平均評価：${average.toFixed(1)} / 5`,
    formatTrialProgressForShare(),
    ""
  ];
  [...state.feedbacks].reverse().forEach((feedback, index) => {
    lines.push(`${index + 1}. ${roleLabel(feedback.role)} / ${feedback.rating}点 / ${feedback.date}`);
    if (feedback.good) lines.push(`良かったこと：${feedback.good}`);
    if (feedback.stuck) lines.push(`迷ったこと：${feedback.stuck}`);
    if (feedback.request) lines.push(`ほしい機能：${feedback.request}`);
    lines.push("");
  });
  return lines.join("\n").trim();
}

async function copyText(text, button, doneLabel = "コピー済み") {
  try {
    await navigator.clipboard.writeText(text);
    const original = button.textContent;
    button.textContent = doneLabel;
    setTimeout(() => { button.textContent = original; }, 1600);
  } catch {
    alert("コピーできない場合は、表示された文章を手動で選択してコピーしてください。");
  }
}

function copyTrialInvite() {
  const text = buildTrialInvite();
  els.trialInviteOutput.value = text;
  copyText(text, $("#copyTrialInviteButton"));
}

function copyFeedbackSummary() {
  copyText(buildFeedbackSummary(), $("#copyFeedbackButton"));
}

function showOnboarding(force = false) {
  if (!force && localStorage.getItem(ONBOARDING_KEY)) return;
  if (els.reminderDialog.open) return;
  els.onboardingDialog.showModal();
}

function closeOnboarding() {
  localStorage.setItem(ONBOARDING_KEY, "true");
  els.onboardingDialog.close();
}

function startOnboarding() {
  closeOnboarding();
  startPersonalSetup();
}

function startPersonalSetup() {
  if (state.isSampleData) {
    state.childProfile = normalizeChildProfile();
    state.competitions = [];
    state.pieces = [];
    state.tasks = [];
    state.practiceLogs = [];
    state.practiceStamps = {};
    state.scores = [];
    state.teacherComments = [];
    state.feedbacks = [];
    state.trialChecks = {};
    state.isSampleData = false;
    save();
    render();
  }
  openCompetitionDialog();
}

function setView(viewId) {
  state.view = viewId;
  $$(".view").forEach((view) => view.classList.toggle("active", view.id === viewId));
  $$(".bottom-nav button").forEach((button) => button.classList.toggle("active", button.dataset.view === viewId));
}

function playClick(accent) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  state.audioContext ||= new AudioContextClass();
  const context = state.audioContext;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.frequency.value = accent ? 1120 : 760;
  gain.gain.setValueAtTime(0.001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(accent ? 0.22 : 0.14, context.currentTime + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.075);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.08);
}

function startMetronome() {
  if (state.metronomeTimer) {
    clearInterval(state.metronomeTimer);
    state.metronomeTimer = null;
    els.metronomeButton.textContent = "開始";
    $$("#beatRow span").forEach((span) => span.classList.remove("active"));
    return;
  }
  state.beat = 0;
  els.metronomeButton.textContent = "停止";
  const tick = () => {
    playClick(state.beat % 4 === 0);
    $$("#beatRow span").forEach((span, index) => span.classList.toggle("active", index === state.beat % 4));
    state.beat += 1;
  };
  tick();
  state.metronomeTimer = setInterval(tick, 60000 / state.bpm);
}

function changeTempo(nextBpm) {
  state.bpm = Math.max(40, Math.min(180, nextBpm));
  save();
  renderPractice();
  if (state.metronomeTimer) {
    clearInterval(state.metronomeTimer);
    state.metronomeTimer = null;
    startMetronome();
  }
}

async function toggleRecording() {
  if (state.recorder) {
    state.recorder.stop();
    state.recorder = null;
    return;
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    els.recordMessage.textContent = "このブラウザでは録音に対応していません。";
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    state.recorder = recorder;
    state.recordingChunks = [];
    state.recordingStartedAt = Date.now();
    state.recordingSeconds = 0;
    els.recordMessage.textContent = "録音中です。もう一度押すと停止します。";
    els.recordButton.classList.add("recording");
    els.recordButton.querySelector("strong").textContent = "停止";
    state.recordingTimer = setInterval(() => {
      state.recordingSeconds += 1;
      els.recordTimer.textContent = formatDuration(state.recordingSeconds);
    }, 1000);

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) state.recordingChunks.push(event.data);
    };
    recorder.onstop = async () => {
      clearInterval(state.recordingTimer);
      const seconds = Math.max(1, Math.round((Date.now() - state.recordingStartedAt) / 1000));
      const blob = new Blob(state.recordingChunks, { type: recorder.mimeType || "audio/webm" });
      const recording = {
        id: createId(),
        blob,
        name: `練習録音 ${state.recordings.length + 1}`,
        createdAt: new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date()),
        createdAtMs: Date.now(),
        duration: formatDuration(seconds),
        memo: "",
        favorite: false,
        saved: false
      };
      await saveRecordingToDb(recording);
      const url = URL.createObjectURL(blob);
      state.recordings.unshift({
        id: recording.id,
        url,
        blob,
        name: recording.name,
        createdAt: recording.createdAt,
        createdAtMs: recording.createdAtMs,
        duration: recording.duration,
        memo: recording.memo,
        favorite: recording.favorite,
        saved: recording.saved
      });
      stream.getTracks().forEach((track) => track.stop());
      els.recordMessage.textContent = "録音できました。この端末内に保存しました。";
      els.recordButton.classList.remove("recording");
      els.recordButton.querySelector("strong").textContent = "録音";
      els.recordTimer.textContent = "0:00";
      renderRecordings();
      renderStorageReport();
    };
    recorder.start();
  } catch {
    els.recordMessage.textContent = "マイクの許可が必要です。ブラウザの許可を確認してください。";
  }
}

function openRecordingDb() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB is not available."));
      return;
    }

    const request = indexedDB.open(RECORDING_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(RECORDING_STORE_NAME)) {
        db.createObjectStore(RECORDING_STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveRecordingToDb(recording) {
  try {
    const db = await openRecordingDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(RECORDING_STORE_NAME, "readwrite");
      tx.objectStore(RECORDING_STORE_NAME).put(recording);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    els.recordMessage.textContent = "録音は作成できましたが、端末内保存に失敗しました。必要なら端末に保存してください。";
  }
}

async function loadRecordingsFromDb() {
  try {
    const db = await openRecordingDb();
    const stored = await new Promise((resolve, reject) => {
      const tx = db.transaction(RECORDING_STORE_NAME, "readonly");
      const request = tx.objectStore(RECORDING_STORE_NAME).getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    db.close();
    state.recordings.forEach((recording) => URL.revokeObjectURL(recording.url));
    state.recordings = stored
      .sort((a, b) => Number(b.createdAtMs || 0) - Number(a.createdAtMs || 0))
      .map((recording) => ({
        id: recording.id,
        name: recording.name,
        createdAt: recording.createdAt,
        createdAtMs: recording.createdAtMs || 0,
        duration: recording.duration,
        memo: recording.memo || "",
        favorite: Boolean(recording.favorite),
        saved: Boolean(recording.saved),
        blob: recording.blob,
        url: URL.createObjectURL(recording.blob)
      }));
    renderRecordings();
    renderStorageReport();
    els.teacherReviewOutput.value = buildTeacherReviewRequest();
  } catch {
    els.recordMessage.textContent = "このブラウザでは録音の端末内保存に対応していない可能性があります。";
  }
}

async function updateRecordingInDb(id, updates) {
  const target = state.recordings.find((recording) => recording.id === id);
  if (!target) return;
  Object.assign(target, updates);
  renderRecordings();
  renderStorageReport();
  els.teacherMemoOutput.value = buildTeacherMemo();
  els.teacherReviewOutput.value = buildTeacherReviewRequest();

  try {
    const db = await openRecordingDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(RECORDING_STORE_NAME, "readwrite");
      const stored = {
        id: target.id,
        blob: target.blob,
        name: target.name,
        createdAt: target.createdAt,
        createdAtMs: target.createdAtMs,
        duration: target.duration,
        memo: target.memo || "",
        favorite: Boolean(target.favorite),
        saved: Boolean(target.saved)
      };
      tx.objectStore(RECORDING_STORE_NAME).put(stored);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    els.recordMessage.textContent = "録音メモの保存に失敗しました。";
  }
}

function toggleRecordingFavorite(id) {
  const target = state.recordings.find((recording) => recording.id === id);
  if (!target) return;
  updateRecordingInDb(id, { favorite: !target.favorite });
}

function toggleRecordingSaved(id) {
  const target = state.recordings.find((recording) => recording.id === id);
  if (!target) return;
  updateRecordingInDb(id, { saved: !target.saved });
}

function markRecordingSaved(id) {
  const target = state.recordings.find((recording) => recording.id === id);
  if (!target || target.saved) return;
  updateRecordingInDb(id, { saved: true });
}

function updateRecordingMemo(id, memo) {
  updateRecordingInDb(id, { memo });
}

function renameRecording(id) {
  const target = state.recordings.find((recording) => recording.id === id);
  if (!target) return;
  const nextName = prompt("録音名を入力してください", target.name);
  if (nextName === null) return;
  const trimmed = nextName.trim();
  if (!trimmed) return;
  updateRecordingInDb(id, { name: trimmed });
}

async function deleteRecording(id) {
  if (!confirm("この録音を削除しますか？")) return;
  const target = state.recordings.find((recording) => recording.id === id);
  if (target) URL.revokeObjectURL(target.url);
  state.recordings = state.recordings.filter((recording) => recording.id !== id);
  renderRecordings();

  try {
    const db = await openRecordingDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(RECORDING_STORE_NAME, "readwrite");
      tx.objectStore(RECORDING_STORE_NAME).delete(id);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    els.recordMessage.textContent = "録音一覧からは削除しましたが、端末内保存の削除確認に失敗しました。";
  }
}

function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function getReminderState() {
  try {
    return JSON.parse(localStorage.getItem(REMINDER_KEY) || "{}");
  } catch {
    return {};
  }
}

function reminderKey(item) {
  return `${todayKey()}:${item.id}:${item.deadline}`;
}

function checkReminders(force = false) {
  const confirmed = getReminderState();
  const item = state.competitions.find((competition) => {
    const days = daysUntil(competition.deadline);
    return [0, 1].includes(days) && (force || !confirmed[reminderKey(competition)]);
  });
  if (!item) return;
  const days = daysUntil(item.deadline);
  els.reminderKicker.textContent = days === 0 ? "申込締切が今日です。" : "申込締切が明日です。";
  els.reminderTitle.textContent = item.name;
  els.reminderBody.innerHTML = `
    <div>部門：${escapeHtml(item.division || "未設定")}</div>
    <div>申込締切：${formatDate(item.deadline)}</div>
    <div>会場：${escapeHtml(item.venue || "未設定")}</div>
    <div>参加料：${yen(item.fee)}</div>
    <div>申込手続き：${getApplicationCheckSummary(item)}</div>
    ${item.memo ? `<div>メモ：${escapeHtml(item.memo)}</div>` : ""}
    <div>忘れずに申込手続きを確認してください。</div>
  `;
  els.reminderDialog.dataset.activeId = item.id;
  els.reminderDialog.showModal();
}

function confirmReminder() {
  const item = state.competitions.find((competition) => competition.id === els.reminderDialog.dataset.activeId);
  if (item) {
    const confirmed = getReminderState();
    confirmed[reminderKey(item)] = true;
    localStorage.setItem(REMINDER_KEY, JSON.stringify(confirmed));
  }
  els.reminderDialog.close();
}

function renderBackupStatus() {
  const lastBackup = localStorage.getItem(BACKUP_KEY);
  if (!lastBackup) {
    els.backupReminderText.textContent = "まだバックアップがありません。設定から一度書き出しておくと、機種変更時に復元できます。";
    return;
  }
  const days = daysUntil(lastBackup);
  const elapsed = days === null ? null : Math.abs(days);
  els.backupReminderText.textContent = elapsed !== null && elapsed <= 7
    ? `最終バックアップ：${formatDate(lastBackup)}。最近のバックアップがあります。`
    : `最終バックアップ：${formatDate(lastBackup)}。1週間以上たつ場合は書き出しをおすすめします。`;
}

function renderHomeBackupNudge() {
  const lastBackup = localStorage.getItem(BACKUP_KEY);
  if (!lastBackup) {
    els.homeBackupNudge.style.display = "";
    els.homeBackupNudgeText.textContent = "まだバックアップがありません。試用前に一度書き出すと安心です。";
    return;
  }
  const days = daysUntil(lastBackup);
  const elapsed = days === null ? null : Math.abs(days);
  if (elapsed !== null && elapsed <= 7) {
    els.homeBackupNudge.style.display = "none";
    return;
  }
  els.homeBackupNudge.style.display = "";
  els.homeBackupNudgeText.textContent = `最終バックアップ：${formatDate(lastBackup)}。そろそろ書き出しをおすすめします。`;
}

function formatBytes(bytes) {
  if (!bytes) return "0 MB";
  return `${(bytes / 1024 / 1024).toFixed(bytes > 1024 * 1024 ? 1 : 2)} MB`;
}

function getBackupStatusLabel() {
  const lastBackup = localStorage.getItem(BACKUP_KEY);
  if (!lastBackup) return "未作成";
  const days = daysUntil(lastBackup);
  const elapsed = days === null ? null : Math.abs(days);
  return elapsed !== null && elapsed <= 7 ? "最近作成済み" : "再作成推奨";
}

function getRecordingBytes() {
  return state.recordings.reduce((sum, recording) => sum + Number(recording.blob?.size || 0), 0);
}

function getUnsavedRecordingCount() {
  return state.recordings.filter((recording) => !recording.saved).length;
}

function getStorageReportItems() {
  const unsavedCount = getUnsavedRecordingCount();
  return [
    ["プロフィール", state.childProfile?.name ? "登録済み" : "未登録"],
    ["コンクール", `${state.competitions.length}件`],
    ["曲", `${state.pieces.length}件`],
    ["練習指示", `${state.tasks.length}件`],
    ["練習記録", `${state.practiceLogs.length}件`],
    ["シール", `${getPracticeStampCount()}枚`],
    ["採点", `${state.scores.length}件`],
    ["先生コメント", `${state.teacherComments.length}件`],
    ["録音", `${state.recordings.length}件 / 約${formatBytes(getRecordingBytes())}`],
    ["録音保存確認", unsavedCount ? `未保存 ${unsavedCount}件` : "すべて確認済み"],
    ["試用メモ", `${state.feedbacks.length}件`],
    ["試用チェック", `${getTrialProgress().done}/${getTrialProgress().total}完了`],
    ["バックアップ", getBackupStatusLabel()]
  ];
}

function renderStorageReport() {
  els.storageReport.innerHTML = getStorageReportItems().map(([label, value]) => `
    <div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>
  `).join("");
}

function buildStorageReport() {
  return [
    "【ピアノコンクールノート 端末内データ診断】",
    `作成日：${formatDate(todayKey())}`,
    "",
    ...getStorageReportItems().map(([label, value]) => `${label}：${value}`),
    "",
    "入力データと録音はこの端末内に保存されています。GitHubへは送信されません。",
    "録音ファイル本体はJSONバックアップに含まれないため、必要な録音は個別に端末へ保存してください。"
  ].join("\n");
}

function copyStorageReport() {
  copyText(buildStorageReport(), $("#copyStorageReportButton"));
}

function exportData() {
  const blob = new Blob([JSON.stringify({
    childProfile: state.childProfile,
    competitions: state.competitions,
    pieces: state.pieces,
    tasks: state.tasks,
    practiceLogs: state.practiceLogs,
    practiceStamps: state.practiceStamps,
    scores: state.scores,
    teacherComments: state.teacherComments,
    feedbacks: state.feedbacks,
    trialChecks: state.trialChecks,
    isSampleData: state.isSampleData,
    bpm: state.bpm,
    practiceTimerSeconds: state.practiceTimerSeconds
  }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `piano-note-backup-${todayKey()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  localStorage.setItem(BACKUP_KEY, todayKey());
  renderBackupStatus();
  renderHomeBackupNudge();
  renderStorageReport();
}

function importData(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      state.childProfile = normalizeChildProfile(data.childProfile);
      state.competitions = Array.isArray(data.competitions) ? data.competitions : [];
      state.pieces = Array.isArray(data.pieces) ? data.pieces : [];
      state.tasks = Array.isArray(data.tasks) ? data.tasks : [];
      state.practiceLogs = Array.isArray(data.practiceLogs) ? data.practiceLogs : [];
      state.practiceStamps = data.practiceStamps || {};
      state.scores = Array.isArray(data.scores) ? data.scores : [];
      state.teacherComments = Array.isArray(data.teacherComments) ? data.teacherComments : [];
      state.feedbacks = Array.isArray(data.feedbacks) ? data.feedbacks : [];
      state.trialChecks = data.trialChecks || {};
      state.isSampleData = Boolean(data.isSampleData);
      state.bpm = Number(data.bpm || 84);
      state.practiceTimerSeconds = Number(data.practiceTimerSeconds || state.practiceTimerSeconds);
      state.practiceTimerRemaining = state.practiceTimerSeconds;
      save();
      render();
      alert("バックアップを読み込みました。");
    } catch {
      alert("読み込みに失敗しました。");
    }
  };
  reader.readAsText(file);
}

async function clearAllData() {
  if (!confirm("この端末内のコンクール、練習、録音をすべて削除しますか？")) return;
  localStorage.removeItem(STORE_KEY);
  localStorage.removeItem(REMINDER_KEY);
  localStorage.removeItem(BACKUP_KEY);
  localStorage.removeItem(ONBOARDING_KEY);
  state.recordings.forEach((recording) => URL.revokeObjectURL(recording.url));
  state.recordings = [];

  try {
    const db = await openRecordingDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(RECORDING_STORE_NAME, "readwrite");
      tx.objectStore(RECORDING_STORE_NAME).clear();
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // IndexedDB未対応でもlocalStorage側は削除済みなので続行します。
  }

  state.competitions = [];
  state.childProfile = normalizeChildProfile();
  state.pieces = [];
  state.tasks = [];
  state.practiceLogs = [];
  state.practiceStamps = {};
  state.scores = [];
  state.teacherComments = [];
  state.feedbacks = [];
  state.trialChecks = {};
  state.isSampleData = false;
  state.bpm = 84;
  state.practiceTimerSeconds = 15 * 60;
  state.practiceTimerRemaining = state.practiceTimerSeconds;
  save();
  render();
  els.recordMessage.textContent = "端末内データを削除しました。";
}

function bind() {
  $("#openCompetitionButton").addEventListener("click", () => openCompetitionDialog());
  $("#closeCompetitionDialog").addEventListener("click", () => els.competitionDialog.close());
  els.competitionForm.addEventListener("submit", saveCompetition);
  $("#deleteCompetitionButton").addEventListener("click", deleteCompetition);
  $$(".bottom-nav button").forEach((button) => button.addEventListener("click", () => setView(button.dataset.view)));
  $$("[data-view-shortcut]").forEach((button) => button.addEventListener("click", () => setView(button.dataset.viewShortcut)));
  els.metronomeButton.addEventListener("click", startMetronome);
  $("#tempoDown").addEventListener("click", () => changeTempo(state.bpm - 2));
  $("#tempoUp").addEventListener("click", () => changeTempo(state.bpm + 2));
  els.tempoSlider.addEventListener("input", (event) => changeTempo(Number(event.target.value)));
  $$("[data-timer-minutes]").forEach((button) => {
    button.addEventListener("click", () => setPracticeTimer(Number(button.dataset.timerMinutes)));
  });
  els.timerStartButton.addEventListener("click", togglePracticeTimer);
  els.timerResetButton.addEventListener("click", resetPracticeTimer);
  els.kidPracticeDoneButton.addEventListener("click", completeKidPracticeTask);
  els.kidPracticeTimerButton.addEventListener("click", startKidPracticeTimer);
  els.kidPracticeRecordButton.addEventListener("click", () => setView("recordView"));
  $("#addPieceButton").addEventListener("click", addPiece);
  $("#addTaskButton").addEventListener("click", addTask);
  $("#savePracticeLogButton").addEventListener("click", savePracticeLog);
  $("#closeTaskDialog").addEventListener("click", () => els.taskDialog.close());
  els.taskForm.addEventListener("submit", saveTask);
  $("#deleteTaskButton").addEventListener("click", deleteTask);
  $$(".score-input").forEach((input) => input.addEventListener("input", updateScorePreview));
  $("#scoreDateInput").value = todayKey();
  $("#cancelScoreEditButton").style.display = "none";
  $("#cancelScoreEditButton").addEventListener("click", resetScoreForm);
  $("#addScoreButton").addEventListener("click", saveScore);
  $("#saveTeacherCommentButton").addEventListener("click", saveTeacherComment);
  els.homeMissionDoneButton.addEventListener("click", completeHomeMission);
  $("#copyTeacherMemoButton").addEventListener("click", copyTeacherMemo);
  $("#copyTeacherReviewButton").addEventListener("click", copyTeacherReviewRequest);
  $("#copyStorageReportButton").addEventListener("click", copyStorageReport);
  $("#copyTrialInviteButton").addEventListener("click", copyTrialInvite);
  $("#saveFeedbackButton").addEventListener("click", saveFeedback);
  $("#copyFeedbackButton").addEventListener("click", copyFeedbackSummary);
  $("#showOnboardingButton").addEventListener("click", () => showOnboarding(true));
  $("#showSetupGuideButton").addEventListener("click", () => showOnboarding(true));
  $("#startPersonalSetupButton").addEventListener("click", startPersonalSetup);
  $("#saveChildProfileButton").addEventListener("click", saveChildProfile);
  $("#closeOnboardingButton").addEventListener("click", closeOnboarding);
  $("#startOnboardingButton").addEventListener("click", startOnboarding);
  els.recordButton.addEventListener("click", toggleRecording);
  $("#confirmReminderButton").addEventListener("click", confirmReminder);
  $("#laterReminderButton").addEventListener("click", () => els.reminderDialog.close());
  $("#exportButton").addEventListener("click", exportData);
  $("#importInput").addEventListener("change", (event) => importData(event.target.files[0]));
  $("#clearDataButton").addEventListener("click", clearAllData);
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

load();
bind();
render();
loadRecordingsFromDb();
setTimeout(() => checkReminders(), 300);
setTimeout(() => showOnboarding(), 900);
