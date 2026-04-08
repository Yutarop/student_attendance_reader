// ══════════════════════════════════════════
// i18n
// ══════════════════════════════════════════
const I18N = {
  ja: {
    appTitle:      '学籍番号 OCR システム',
    statusChecking:'確認中...',
    statusOk:      'LM Studio 接続済み',
    statusDisconn: 'LM Studio 未接続',
    statusNoBack:  'バックエンド未起動',
    listTitle:     '確定済みリスト',
    saveBtn:       '💾 results.txt に保存して終了',
    clearBtn:      '🗑 リストをクリア',
    resultLabel:   '認識結果',
    confirmHint:   '<kbd>Enter</kbd> で確定',
    camStart:      'カメラを起動',
    camLabel:      '起動後、画面をドラッグしてROIを選択',
    emptyText:     'まだ登録がありません',
    loadingText:   'VLMで認識中...',
    modeInd: { live: '● LIVE', captured: '■ CAPTURED' },
    step: [
      '',
      '画面をドラッグしてROIを選択',
      'ドラッグで範囲（ROI）を選択',
      'Enter で確定 / Space でやり直し',
    ],
    instr: {
      init:        'カメラを起動してください。起動後、画面をドラッグすると自動でキャプチャしROIを選択できます。',
      live:        '学籍番号の範囲をドラッグして選択してください。ドラッグ開始時に自動でキャプチャします。',
      captured:    'ドラッグして学籍番号の範囲を選択してください。',
      recapture:   'ドラッグして学籍番号の範囲を再選択してください。',
      recognizing: 'VLMで認識中です。しばらくお待ちください...',
      confirming:  '認識結果を確認・編集し、<kbd>Enter</kbd> で確定。やり直しは <kbd>Space</kbd>。',
      confirmed:   '登録しました！次の学籍番号の範囲をドラッグしてください。',
      roiTooSmall: '⚠ 範囲が小さすぎます。もう一度ドラッグしてください。',
      camDenied:   '⚠ カメラへのアクセスが拒否されました。ブラウザの設定を確認してください。',
    },
    toast: {
      saveOk:  (msg) => `✅ ${msg}`,
      saveErr: (d)   => `⚠ 保存エラー: ${d}`,
      noBack:  '⚠ バックエンドに接続できません。',
    },
    confirm:  { clear: 'リストをクリアしますか？' },
    errPrefix:'⚠ エラー: ',
    editedHint:'（編集済み）',
  },
  en: {
    appTitle:      'Student ID OCR System',
    statusChecking:'Checking...',
    statusOk:      'LM Studio Connected',
    statusDisconn: 'LM Studio Disconnected',
    statusNoBack:  'Backend Not Running',
    listTitle:     'Confirmed List',
    saveBtn:       '💾 Save to results.txt',
    clearBtn:      '🗑 Clear List',
    resultLabel:   'Result',
    confirmHint:   '<kbd>Enter</kbd> to confirm',
    camStart:      'Start Camera',
    camLabel:      'Then drag on screen to select ROI',
    emptyText:     'No entries yet',
    loadingText:   'Recognizing with VLM...',
    modeInd: { live: '● LIVE', captured: '■ CAPTURED' },
    step: [
      '',
      'Drag on screen to select ROI',
      'Drag to select ROI',
      'Enter to confirm / Space to retry',
    ],
    instr: {
      init:        'Start the camera. Then drag on the live view to select the student ID area — capture happens automatically.',
      live:        'Drag on the live view to select the student ID area. Frame is captured automatically on drag start.',
      captured:    'Drag to select the student ID area.',
      recapture:   'Drag to re-select the student ID area.',
      recognizing: 'Recognizing with VLM, please wait...',
      confirming:  'Review or edit the result, then press <kbd>Enter</kbd> to confirm. Press <kbd>Space</kbd> to retry.',
      confirmed:   'Registered! Drag to select the next student ID.',
      roiTooSmall: '⚠ Selection too small. Please drag again.',
      camDenied:   '⚠ Camera access denied. Check your browser settings.',
    },
    toast: {
      saveOk:  (msg) => `✅ ${msg}`,
      saveErr: (d)   => `⚠ Save error: ${d}`,
      noBack:  '⚠ Cannot reach backend.',
    },
    confirm:   { clear: 'Clear the entire list?' },
    errPrefix: '⚠ Error: ',
    editedHint:'(edited)',
  },
};

let lang = 'ja';

function t(key) {
  return I18N[lang][key] ?? key;
}

function setLang(l) {
  lang = l;
  document.getElementById('btn-ja').classList.toggle('active', l === 'ja');
  document.getElementById('btn-en').classList.toggle('active', l === 'en');
  document.documentElement.lang = l;

  // Static data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (key === 'confirmHint') { el.innerHTML = t('confirmHint'); return; }
    el.textContent = t(key) ?? el.textContent;
  });

  // Buttons with data-i18n-btn
  document.querySelectorAll('[data-i18n-btn]').forEach(el => {
    el.textContent = t(el.dataset.i18nBtn);
  });

  // Dynamic UI elements
  checkHealth();
  const lt = document.querySelector('.loading-text');
  if (lt) lt.textContent = t('loadingText');
  const et = document.querySelector('.empty-text');
  if (et) et.textContent = t('emptyText');

  // Re-apply current instruction and mode indicator
  applyPhaseInstruction(state.phase);
  if (modeInd.className === 'live')    modeInd.textContent = t('modeInd').live;
  if (modeInd.className === 'capture') modeInd.textContent = t('modeInd').captured;
  if (currentStep > 0 && t('step')[currentStep]) setStep(currentStep, t('step')[currentStep]);
}

function applyPhaseInstruction(phase) {
  const map = {
    init:        () => setInstruction(t('instr').init),
    live:        () => setInstruction(t('instr').live),
    captured:    () => setInstruction(t('instr').captured),
    drawing:     () => setInstruction(t('instr').captured),
    recognizing: () => setInstruction(t('instr').recognizing),
    confirming:  () => setInstruction(t('instr').confirming),
  };
  if (map[phase]) map[phase]();
}

// ══════════════════════════════════════════
// State
// ══════════════════════════════════════════
const API_BASE = 'http://localhost:8000';
const state = {
  phase: 'init',   // init | live | captured | drawing | recognizing | confirming
  capturedDataUrl: null,
  originalId: null,
  pendingId:  null,
  list: [],
  roi:  null,
  drag: { active: false, startX: 0, startY: 0 },
};
let currentStep = 1;

// ── DOM refs ──
const video       = document.getElementById('video');
const canvas      = document.getElementById('canvas');
const ctx         = canvas.getContext('2d');
const capCanvas   = document.getElementById('capture-canvas');
const capCtx      = capCanvas.getContext('2d');
const roiBox      = document.getElementById('roi-box');
const loadingOvl  = document.getElementById('loading-overlay');
const instrBar    = document.getElementById('instruction-bar');
const instrText   = document.getElementById('instruction-text');
const resultDisp  = document.getElementById('result-display');
const resultInput = document.getElementById('result-input');
const idList      = document.getElementById('id-list');
const countBadge  = document.getElementById('count-badge');
const saveBtn     = document.getElementById('save-btn');
const clearBtn    = document.getElementById('clear-btn');
const stepNum     = document.getElementById('step-num');
const stepLabel   = document.getElementById('step-label');
const modeInd     = document.getElementById('mode-indicator');
const camOverlay  = document.getElementById('cam-start-overlay');
const toast       = document.getElementById('toast');
const wrapper     = canvas.parentElement;

// ══════════════════════════════════════════
// UI helpers
// ══════════════════════════════════════════
function setInstruction(msg, type = '') {
  instrBar.className = type || '';
  instrText.innerHTML = msg;
}

function setStep(n, label) {
  currentStep = n;
  stepNum.textContent  = n;
  stepLabel.textContent = label;
}

function setPhase(p) { state.phase = p; }

function showToast(msg, duration = 3500) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ══════════════════════════════════════════
// Result input: track edits
// ══════════════════════════════════════════
resultInput.addEventListener('input', () => {
  const edited = resultInput.value.trim() !== state.originalId;
  resultInput.classList.toggle('edited', edited);
  state.pendingId = resultInput.value.trim();
});

// Handle Enter / Space inside the input without leaking to global handler
resultInput.addEventListener('keydown', e => {
  if (e.code === 'Enter') {
    e.preventDefault();
    e.stopPropagation();
    if (state.phase === 'confirming') confirmId();
  }
  if (e.code === 'Space') {
    e.stopPropagation(); // allow normal space typing
  }
});

// ══════════════════════════════════════════
// LM Studio health check
// ══════════════════════════════════════════
async function checkHealth() {
  const el  = document.getElementById('lm-status');
  const txt = document.getElementById('lm-status-text');
  txt.textContent = t('statusChecking');
  try {
    const res  = await fetch(`${API_BASE}/api/health`);
    const data = await res.json();
    if (data.lm_studio === 'connected') {
      el.className = 'ok';
      txt.textContent = t('statusOk');
    } else {
      el.className = 'err';
      txt.textContent = t('statusDisconn');
    }
  } catch {
    el.className = 'err';
    txt.textContent = t('statusNoBack');
  }
}

// ══════════════════════════════════════════
// Camera
// ══════════════════════════════════════════
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
    });
    video.srcObject = stream;
    await new Promise(r => (video.onloadedmetadata = r));
    camOverlay.style.display = 'none';
    resizeCanvas();
    setPhase('live');
    modeInd.className   = 'live';
    modeInd.textContent = t('modeInd').live;
    setInstruction(t('instr').live);
    setStep(1, t('step')[1]);
  } catch {
    setInstruction(t('instr').camDenied, 'error');
  }
}

function resizeCanvas() {
  const rect    = wrapper.getBoundingClientRect();
  canvas.width  = rect.width;
  canvas.height = rect.height;
}

// ══════════════════════════════════════════
// Capture frame (called internally on drag start)
// ══════════════════════════════════════════
function captureFrame() {
  const w = wrapper.clientWidth;
  const h = wrapper.clientHeight;
  capCanvas.width  = video.videoWidth  || w;
  capCanvas.height = video.videoHeight || h;
  capCtx.drawImage(video, 0, 0);
  state.capturedDataUrl = capCanvas.toDataURL('image/jpeg', 0.95);
  canvas.width  = w;
  canvas.height = h;
  ctx.drawImage(capCanvas, 0, 0, w, h);
  modeInd.className   = 'capture';
  modeInd.textContent = t('modeInd').captured;
}

// ══════════════════════════════════════════
// ROI Drawing — mousedown triggers capture when live
// ══════════════════════════════════════════
canvas.addEventListener('mousedown', e => {
  if (state.phase === 'live') {
    captureFrame();
    setPhase('drawing');
  } else if (state.phase === 'captured') {
    setPhase('drawing');
  } else if (state.phase === 'drawing') {
    // continue
  } else {
    return;
  }

  const r = canvas.getBoundingClientRect();
  state.drag = { active: true, startX: e.clientX - r.left, startY: e.clientY - r.top };
  roiBox.style.display = 'block';
  setInstruction(t('instr').captured);
  setStep(2, t('step')[2]);
});

canvas.addEventListener('mousemove', e => {
  if (!state.drag.active) return;
  const r      = canvas.getBoundingClientRect();
  const x      = e.clientX - r.left;
  const y      = e.clientY - r.top;
  const left   = Math.min(x, state.drag.startX);
  const top    = Math.min(y, state.drag.startY);
  const width  = Math.abs(x - state.drag.startX);
  const height = Math.abs(y - state.drag.startY);
  roiBox.style.cssText = `display:block;left:${left}px;top:${top}px;width:${width}px;height:${height}px;position:absolute;border:2px solid var(--accent);background:rgba(74,144,217,0.10);pointer-events:none;`;
  state.roi = { left, top, width, height };
});

canvas.addEventListener('mouseup', async () => {
  if (!state.drag.active) return;
  state.drag.active = false;
  if (!state.roi || state.roi.width < 10 || state.roi.height < 10) {
    setInstruction(t('instr').roiTooSmall, 'error');
    roiBox.style.display = 'none';
    setPhase('captured');
    return;
  }
  await sendROI();
});

// ══════════════════════════════════════════
// Extract ROI and send to VLM
// ══════════════════════════════════════════
async function sendROI() {
  if (!state.roi || !state.capturedDataUrl) return;
  setPhase('recognizing');

  const scaleX = capCanvas.width  / canvas.width;
  const scaleY = capCanvas.height / canvas.height;
  const rx = Math.round(state.roi.left   * scaleX);
  const ry = Math.round(state.roi.top    * scaleY);
  const rw = Math.round(state.roi.width  * scaleX);
  const rh = Math.round(state.roi.height * scaleY);

  const cropCanvas = document.createElement('canvas');
  cropCanvas.width  = rw;
  cropCanvas.height = rh;
  cropCanvas.getContext('2d').drawImage(capCanvas, rx, ry, rw, rh, 0, 0, rw, rh);
  const cropDataUrl = cropCanvas.toDataURL('image/jpeg', 0.95);

  loadingOvl.classList.add('active');
  roiBox.style.display = 'none';
  setInstruction(t('instr').recognizing);

  try {
    const res  = await fetch(`${API_BASE}/api/recognize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_base64: cropDataUrl }),
    });
    const data = await res.json();
    loadingOvl.classList.remove('active');

    if (!res.ok) throw new Error(data.detail || t('instr').recognizing);

    state.originalId  = data.student_id;
    state.pendingId   = data.student_id;
    resultInput.value = data.student_id;
    resultInput.classList.remove('edited');
    resultDisp.classList.add('visible');

    setPhase('confirming');
    setInstruction(t('instr').confirming);
    setStep(3, t('step')[3]);
    setTimeout(() => resultInput.focus(), 50);

  } catch (err) {
    loadingOvl.classList.remove('active');
    setInstruction(t('errPrefix') + err.message, 'error');
    setPhase('captured');
    roiBox.style.display = 'none';
  }
}

// ══════════════════════════════════════════
// Confirm
// ══════════════════════════════════════════
function confirmId() {
  if (state.phase !== 'confirming') return;
  const finalId = resultInput.value.trim();
  if (!finalId) return;

  state.list.push(finalId);
  addListItem(finalId, state.list.length);
  updateListUI();

  // Reset state
  state.originalId  = null;
  state.pendingId   = null;
  resultInput.value = '';
  resultInput.classList.remove('edited');
  resultDisp.classList.remove('visible');
  roiBox.style.display = 'none';
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  setPhase('live');
  modeInd.className   = 'live';
  modeInd.textContent = t('modeInd').live;
  setInstruction(t('instr').confirmed, 'success');
  setStep(1, t('step')[1]);

  setTimeout(() => {
    if (state.phase === 'live') {
      setInstruction(t('instr').live);
      instrBar.className = '';
    }
  }, 2500);
}

// ══════════════════════════════════════════
// List management
// ══════════════════════════════════════════
function addListItem(id, n) {
  const es = document.getElementById('empty-state');
  if (es) es.style.display = 'none';
  const item = document.createElement('div');
  item.className     = 'id-item new';
  item.dataset.index = n - 1;
  item.innerHTML = `
    <span class="id-num">${n}</span>
    <span class="id-value">${id}</span>
    <button class="del-btn" onclick="deleteItem(${n - 1})">✕</button>
  `;
  idList.appendChild(item);
  idList.scrollTop = idList.scrollHeight;
}

function deleteItem(index) {
  state.list.splice(index, 1);
  rebuildList();
}

function rebuildList() {
  idList.innerHTML = '';
  if (state.list.length === 0) {
    idList.innerHTML = `
      <div class="empty-state" id="empty-state">
        <div class="empty-icon">📋</div>
        <div class="empty-text">${t('emptyText')}</div>
      </div>`;
  } else {
    state.list.forEach((id, i) => {
      const item = document.createElement('div');
      item.className     = 'id-item';
      item.dataset.index = i;
      item.innerHTML = `
        <span class="id-num">${i + 1}</span>
        <span class="id-value">${id}</span>
        <button class="del-btn" onclick="deleteItem(${i})">✕</button>
      `;
      idList.appendChild(item);
    });
  }
  updateListUI();
}

function updateListUI() {
  const n = state.list.length;
  countBadge.textContent = n;
  saveBtn.disabled  = n === 0;
  clearBtn.disabled = n === 0;
}

function clearList() {
  if (!confirm(t('confirm').clear)) return;
  state.list = [];
  rebuildList();
}

// ══════════════════════════════════════════
// Save
// ══════════════════════════════════════════
async function saveResults() {
  if (state.list.length === 0) return;
  saveBtn.disabled = true;
  try {
    const res  = await fetch(`${API_BASE}/api/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_ids: state.list }),
    });
    const data = await res.json();
    showToast(res.ok ? t('toast').saveOk(data.message) : t('toast').saveErr(data.detail));
  } catch {
    showToast(t('toast').noBack);
  } finally {
    saveBtn.disabled = state.list.length === 0;
  }
}

// ══════════════════════════════════════════
// Keyboard — global (excludes result-input)
// ══════════════════════════════════════════
document.addEventListener('keydown', e => {
  if (e.target === resultInput) return;
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  if (e.code === 'Space') {
    e.preventDefault();
    if (state.phase === 'confirming') {
      // Discard result, return to live view
      state.originalId  = null;
      state.pendingId   = null;
      resultInput.value = '';
      resultInput.classList.remove('edited');
      resultDisp.classList.remove('visible');
      setPhase('live');
      modeInd.className   = 'live';
      modeInd.textContent = t('modeInd').live;
      setInstruction(t('instr').live);
      setStep(1, t('step')[1]);
    }
  }

  if (e.code === 'Enter') {
    e.preventDefault();
    if (state.phase === 'confirming') confirmId();
  }
});

// ── Window resize ──
window.addEventListener('resize', () => {
  if (state.phase === 'live') resizeCanvas();
});

// ── Init ──
checkHealth();
setInterval(checkHealth, 10000);
setInstruction(t('instr').init);