const STORE_KEY = "piano-note-zero-cost-v1";
const REMINDER_KEY = "piano-note-reminders-v1";

const state = {
  competitions: [],
  tasks: [],
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
  recordings: []
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const els = {
  todayLabel: $("#todayLabel"),
  nextDeadlineLabel: $("#nextDeadlineLabel"),
  competitionCount: $("#competitionCount"),
  urgentCount: $("#urgentCount"),
  taskDoneCount: $("#taskDoneCount"),
  competitionList: $("#competitionList"),
  taskList: $("#taskList"),
  bpmLabel: $("#bpmLabel"),
  tempoSlider: $("#tempoSlider"),
  beatRow: $("#beatRow"),
  metronomeButton: $("#metronomeButton"),
  recordButton: $("#recordButton"),
  recordMessage: $("#recordMessage"),
  recordTimer: $("#recordTimer"),
  recordingList: $("#recordingList"),
  competitionDialog: $("#competitionDialog"),
  competitionForm: $("#competitionForm"),
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

function load() {
  const saved = localStorage.getItem(STORE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      state.competitions = parsed.competitions || [];
      state.tasks = parsed.tasks || [];
      state.bpm = parsed.bpm || 84;
    } catch {
      localStorage.removeItem(STORE_KEY);
    }
  }

  if (state.competitions.length === 0) {
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
  }

  if (state.tasks.length === 0) {
    state.tasks = [
      { id: createId(), title: "ゆっくり片手練習", detail: "右手だけで音の粒をそろえる", target: 5, count: 0 },
      { id: createId(), title: "左手バランス確認", detail: "左手を小さめにしてメロディを前に出す", target: 3, count: 0 },
      { id: createId(), title: "最後の4小節だけ反復", detail: "止まらず弾けるまで部分練習", target: 10, count: 0 }
    ];
  }
}

function save() {
  localStorage.setItem(STORE_KEY, JSON.stringify({
    competitions: state.competitions,
    tasks: state.tasks,
    bpm: state.bpm
  }));
}

function render() {
  renderHome();
  renderPractice();
  renderRecordings();
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
  els.taskDoneCount.textContent = `${state.tasks.filter((task) => task.count >= task.target).length}/${state.tasks.length}`;

  if (state.competitions.length === 0) {
    els.competitionList.innerHTML = `<div class="notice-card"><strong>まだ登録がありません</strong><span>右上の＋からコンクールを追加できます。</span></div>`;
    return;
  }

  els.competitionList.innerHTML = [...state.competitions]
    .sort((a, b) => (daysUntil(a.deadline) ?? 9999) - (daysUntil(b.deadline) ?? 9999))
    .map((item) => {
      const urgent = [0, 1].includes(daysUntil(item.deadline));
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
          <div class="card-actions">
            <button class="text-button" data-edit-competition="${item.id}">編集</button>
          </div>
        </article>
      `;
    }).join("");

  $$("[data-edit-competition]").forEach((button) => {
    button.addEventListener("click", () => openCompetitionDialog(button.dataset.editCompetition));
  });
}

function renderPractice() {
  els.bpmLabel.textContent = state.bpm;
  els.tempoSlider.value = String(state.bpm);
  els.taskList.innerHTML = state.tasks.map((task) => {
    const percent = Math.min(100, Math.round((task.count / task.target) * 100));
    return `
      <article class="task-card">
        <div class="task-card-head">
          <div>
            <h3>${escapeHtml(task.title)}</h3>
            <p>先生の指示：${escapeHtml(task.detail)}</p>
          </div>
          <strong class="task-count">${task.count}/${task.target}</strong>
        </div>
        <div class="progress"><span style="width:${percent}%"></span></div>
        <div class="counter-row">
          <button data-task-minus="${task.id}">−</button>
          <button data-task-plus="${task.id}">できた</button>
          <button data-task-reset="${task.id}">0</button>
        </div>
      </article>
    `;
  }).join("");

  $$("[data-task-minus]").forEach((button) => button.addEventListener("click", () => updateTask(button.dataset.taskMinus, -1)));
  $$("[data-task-plus]").forEach((button) => button.addEventListener("click", () => updateTask(button.dataset.taskPlus, 1)));
  $$("[data-task-reset]").forEach((button) => button.addEventListener("click", () => resetTask(button.dataset.taskReset)));
}

function renderRecordings() {
  if (state.recordings.length === 0) {
    els.recordingList.innerHTML = `<div class="notice-card"><strong>録音はまだありません</strong><span>中央の録音ボタンから始めます。</span></div>`;
    return;
  }
  els.recordingList.innerHTML = state.recordings.map((recording) => `
    <article class="recording-card">
      <h3>${escapeHtml(recording.name)}</h3>
      <p class="subcopy">${escapeHtml(recording.createdAt)} / ${escapeHtml(recording.duration)}</p>
      <audio controls src="${recording.url}"></audio>
      <a class="download-link" href="${recording.url}" download="${escapeHtml(recording.name)}.webm">端末に保存</a>
    </article>
  `).join("");
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
  const id = $("#competitionId").value || createId();
  const item = {
    id,
    name: $("#competitionName").value.trim(),
    division: $("#competitionDivision").value.trim(),
    deadline: $("#competitionDeadline").value,
    eventDate: $("#competitionEventDate").value,
    venue: $("#competitionVenue").value.trim(),
    fee: $("#competitionFee").value.trim(),
    memo: $("#competitionMemo").value.trim()
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
  state.tasks = state.tasks.map((task) => task.id === id ? { ...task, count: Math.max(0, task.count + delta) } : task);
  save();
  render();
}

function resetTask(id) {
  state.tasks = state.tasks.map((task) => task.id === id ? { ...task, count: 0 } : task);
  save();
  render();
}

function addTask() {
  const title = $("#taskTitleInput").value.trim();
  if (!title) return;
  state.tasks.unshift({ id: createId(), title, detail: "練習後に内容を具体的に書き足す", target: 5, count: 0 });
  $("#taskTitleInput").value = "";
  save();
  render();
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
    recorder.onstop = () => {
      clearInterval(state.recordingTimer);
      const seconds = Math.max(1, Math.round((Date.now() - state.recordingStartedAt) / 1000));
      const blob = new Blob(state.recordingChunks, { type: recorder.mimeType || "audio/webm" });
      const url = URL.createObjectURL(blob);
      state.recordings.unshift({
        id: createId(),
        url,
        name: `練習録音 ${state.recordings.length + 1}`,
        createdAt: new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date()),
        duration: formatDuration(seconds)
      });
      stream.getTracks().forEach((track) => track.stop());
      els.recordMessage.textContent = "録音できました。必要な録音は端末に保存してください。";
      els.recordButton.classList.remove("recording");
      els.recordButton.querySelector("strong").textContent = "録音";
      els.recordTimer.textContent = "0:00";
      renderRecordings();
    };
    recorder.start();
  } catch {
    els.recordMessage.textContent = "マイクの許可が必要です。ブラウザの許可を確認してください。";
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

function exportData() {
  const blob = new Blob([JSON.stringify({ competitions: state.competitions, tasks: state.tasks, bpm: state.bpm }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `piano-note-backup-${todayKey()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function importData(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      state.competitions = Array.isArray(data.competitions) ? data.competitions : [];
      state.tasks = Array.isArray(data.tasks) ? data.tasks : [];
      state.bpm = Number(data.bpm || 84);
      save();
      render();
      alert("バックアップを読み込みました。");
    } catch {
      alert("読み込みに失敗しました。");
    }
  };
  reader.readAsText(file);
}

function bind() {
  $("#openCompetitionButton").addEventListener("click", () => openCompetitionDialog());
  $("#closeCompetitionDialog").addEventListener("click", () => els.competitionDialog.close());
  els.competitionForm.addEventListener("submit", saveCompetition);
  $("#deleteCompetitionButton").addEventListener("click", deleteCompetition);
  $$(".bottom-nav button").forEach((button) => button.addEventListener("click", () => setView(button.dataset.view)));
  els.metronomeButton.addEventListener("click", startMetronome);
  $("#tempoDown").addEventListener("click", () => changeTempo(state.bpm - 2));
  $("#tempoUp").addEventListener("click", () => changeTempo(state.bpm + 2));
  els.tempoSlider.addEventListener("input", (event) => changeTempo(Number(event.target.value)));
  $("#addTaskButton").addEventListener("click", addTask);
  els.recordButton.addEventListener("click", toggleRecording);
  $("#confirmReminderButton").addEventListener("click", confirmReminder);
  $("#laterReminderButton").addEventListener("click", () => els.reminderDialog.close());
  $("#exportButton").addEventListener("click", exportData);
  $("#importInput").addEventListener("change", (event) => importData(event.target.files[0]));
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

load();
bind();
render();
setTimeout(() => checkReminders(), 300);
