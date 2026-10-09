'use strict';

/* ================= DATA ================= */
const QUESTIONS = [
  // ---------- HTML ----------
  {
    category: 'HTML',
    text: 'Tag semantik mana yang tepat untuk membungkus menu navigasi utama sebuah situs?',
    options: ['<nav>', '<div>', '<section>', '<aside>'],
    answer: 0,
    explain: '<nav> menandai kumpulan tautan navigasi utama dan membantu pembaca layar.'
  },
  {
    category: 'HTML',
    text: 'Apa fungsi atribut alt pada tag <img>?',
    options: ['Mengatur ukuran gambar', 'Teks pengganti untuk aksesibilitas dan saat gambar gagal dimuat', 'Menentukan lokasi file gambar', 'Membuat gambar bisa diklik'],
    answer: 1,
    explain: 'alt menampilkan teks pengganti dan dibaca oleh screen reader.'
  },
  {
    category: 'HTML',
    text: 'Atribut apa yang membuat tautan <a> terbuka di tab baru?',
    options: ['rel="new"', 'href="_blank"', 'target="_blank"', 'open="tab"'],
    answer: 2,
    explain: 'target="_blank" membuka tautan di tab atau jendela baru.'
  },
  // ---------- CSS ----------
  {
    category: 'CSS',
    text: 'Nilai properti display mana yang mengaktifkan layout Flexbox?',
    options: ['flex', 'block', 'inline', 'table-cell'],
    answer: 0,
    explain: 'display: flex menjadikan elemen sebagai flex container.'
  },
  {
    category: 'CSS',
    text: 'Selector CSS mana yang memilih semua elemen dengan class "card"?',
    options: ['#card', '.card', 'card', '*card'],
    answer: 1,
    explain: 'Titik (.) dipakai untuk selector class, sedangkan # untuk id.'
  },
  {
    category: 'CSS',
    text: 'Properti CSS mana yang mengatur jarak di luar border sebuah elemen?',
    options: ['padding', 'border-spacing', 'margin', 'gap'],
    answer: 2,
    explain: 'margin mengatur ruang di luar border, sedangkan padding di dalam border.'
  },
  {
    category: 'CSS',
    text: 'Untuk apa @media query dipakai?',
    options: ['Memutar audio dan video', 'Menerapkan gaya berbeda sesuai kondisi seperti lebar layar', 'Mengimpor font dari internet', 'Membuat animasi'],
    answer: 1,
    explain: '@media memungkinkan desain responsif yang menyesuaikan ukuran layar.'
  },
  // ---------- JavaScript ----------
  {
    category: 'JavaScript',
    text: 'Apa perbedaan === dengan == di JavaScript?',
    options: ['Tidak ada perbedaan', '=== membandingkan nilai dan tipe tanpa konversi otomatis', '=== hanya untuk angka', '== lebih ketat daripada ==='],
    answer: 1,
    explain: '=== adalah strict equality, sedangkan == melakukan type coercion.'
  },
  {
    category: 'JavaScript',
    text: 'Method array mana yang membuat array baru dengan mengubah setiap elemen?',
    options: ['map()', 'filter()', 'find()', 'push()'],
    answer: 0,
    explain: 'map() menjalankan fungsi pada tiap elemen dan mengembalikan array hasilnya.'
  },
  {
    category: 'JavaScript',
    text: 'Apa hasil dari typeof [] di JavaScript?',
    options: ['"array"', '"list"', '"object"', '"undefined"'],
    answer: 2,
    explain: 'Array adalah object, jadi typeof [] menghasilkan "object". Gunakan Array.isArray() untuk memastikan.'
  },
  {
    category: 'JavaScript',
    text: 'Keyword apa yang dipakai untuk menunggu hasil sebuah Promise di dalam fungsi async?',
    options: ['yield', 'wait', 'then', 'await'],
    answer: 3,
    explain: 'await menjeda eksekusi fungsi async sampai Promise selesai.'
  },
  // ---------- DOM & Web ----------
  {
    category: 'DOM',
    text: 'Method mana yang mengambil elemen pertama yang cocok dengan sebuah CSS selector?',
    options: ['getElement()', 'document.querySelector()', 'document.findAll()', 'document.select()'],
    answer: 1,
    explain: 'querySelector() menerima CSS selector dan mengembalikan elemen pertama yang cocok.'
  },
  {
    category: 'DOM',
    text: 'Method apa yang dipakai untuk memasang penanganan event pada sebuah elemen?',
    options: ['onEvent()', 'attachClick()', 'listen()', 'addEventListener()'],
    answer: 3,
    explain: 'addEventListener(jenisEvent, fungsi) mendaftarkan handler tanpa menimpa handler lain.'
  },
  {
    category: 'DOM',
    text: 'Fungsi fetch() mengembalikan tipe data apa?',
    options: ['Promise', 'Array', 'String', 'Boolean'],
    answer: 0,
    explain: 'fetch() mengembalikan Promise yang berisi objek Response.'
  },
  {
    category: 'HTTP',
    text: 'Apa arti kode status HTTP 404?',
    options: ['Server error', 'Akses ditolak', 'Halaman atau sumber daya tidak ditemukan', 'Permintaan berhasil'],
    answer: 2,
    explain: '404 Not Found berarti server tidak menemukan sumber daya yang diminta.'
  },
  {
    category: 'HTTP',
    text: 'Method HTTP mana yang umum dipakai untuk mengambil data tanpa mengubahnya di server?',
    options: ['GET', 'POST', 'DELETE', 'PUT'],
    answer: 0,
    explain: 'GET dipakai untuk membaca data dan seharusnya tidak mengubah state server.'
  }
];

const ROUND_SIZE = 8; // jumlah soal per permainan, diambil acak dari bank soal

const TIME_PER_QUESTION = 15; // detik
const HIGHSCORE_KEY = 'quiz-highscore-v1';
const THEME_KEY = 'quiz-theme-v2';
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

/* ================= STATE ================= */
const state = {
  screen: 'start',      // 'start' | 'quiz' | 'result'
  order: [],            // indeks soal terpilih (acak)
  index: 0,
  score: 0,
  locked: false,        // true setelah soal dijawab
  choices: [],          // { text, correct } sudah diacak
  results: [],          // 'ok' | 'bad' per soal
  timeLeft: TIME_PER_QUESTION,
  timerId: null,
  newRecord: false
};

const app = document.getElementById('app');

/* ================= HELPERS ================= */
// Membuat elemen dengan aman: teks selalu lewat textContent
function el(tag, { className, text, attrs, data } = {}, children = []) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  if (attrs) Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  if (data) Object.entries(data).forEach(([k, v]) => { node.dataset[k] = v; });
  children.forEach(child => node.appendChild(child));
  return node;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Mengganti isi halaman tanpa reload (pola SPA)
function show(nodes) {
  app.replaceChildren(el('section', { className: 'screen enter' }, nodes));
}

// Baris isian bertitik-titik ala formulir
function fieldRow(label, value) {
  return el('div', { className: 'leader-row' }, [
    el('span', { text: label }),
    el('span', { className: 'leader' }),
    el('strong', { text: value })
  ]);
}

// Penanda nomor soal: kosong, sedang dikerjakan, benar (hijau), salah (merah)
function buildTracker(total, current) {
  const list = el('ol', { className: 'tracker', attrs: { 'aria-label': 'Status soal' } });
  for (let i = 0; i < total; i++) {
    let cls = 'chip';
    if (state.results[i]) cls += state.results[i] === 'ok' ? ' ok' : ' bad';
    else if (i === current) cls += ' current';
    list.appendChild(el('li', { className: cls, text: String(i + 1) }));
  }
  return list;
}

/* ================= STORAGE ================= */
function loadHighScore() {
  try {
    const raw = localStorage.getItem(HIGHSCORE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function saveHighScore(score, total) {
  try {
    localStorage.setItem(HIGHSCORE_KEY, JSON.stringify({ score, total, date: new Date().toISOString() }));
  } catch { /* abaikan */ }
}
function clearHighScore() {
  try { localStorage.removeItem(HIGHSCORE_KEY); } catch { /* abaikan */ }
}

/* ================= TEMA ================= */
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('[data-action="toggle-theme"]').textContent =
    theme === 'dark' ? 'Mode siang' : 'Mode malam';
  try { localStorage.setItem(THEME_KEY, theme); } catch { /* abaikan */ }
}
function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch { /* abaikan */ }
  applyTheme(saved || 'light');
}
function toggleTheme() {
  applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
}

/* ================= TIMER ================= */
function stopTimer() {
  clearInterval(state.timerId);
  state.timerId = null;
}
function startTimer() {
  stopTimer();
  state.timeLeft = TIME_PER_QUESTION;
  updateTimerView();
  state.timerId = setInterval(() => {
    state.timeLeft--;
    updateTimerView();
    if (state.timeLeft <= 0) handleTimeout();
  }, 1000);
}
function updateTimerView() {
  const text = document.getElementById('timer');
  const fill = document.getElementById('clock-fill');
  if (!text || !fill) return;
  const low = state.timeLeft <= 5;
  text.textContent = state.timeLeft + ' detik';
  text.classList.toggle('low', low);
  fill.style.width = (state.timeLeft / TIME_PER_QUESTION * 100) + '%';
  fill.classList.toggle('low', low);
}

/* ================= RENDER: START ================= */
function renderStart() {
  state.screen = 'start';
  stopTimer();
  const best = loadHighScore();

  const rules = el('ul', { className: 'rules' }, [
    el('li', { text: 'Pilih satu jawaban. Setelah dipilih, jawaban tidak bisa diubah.' }),
    el('li', { text: `Tiap soal dibatasi ${TIME_PER_QUESTION} detik. Waktu habis dihitung salah.` }),
    el('li', { text: 'Skor akhir dibandingkan dengan rekor terbaik yang tersimpan di browser.' })
  ]);

  const actions = el('div', { className: 'actions' }, [
    el('button', { className: 'btn', text: 'Mulai mengerjakan', attrs: { type: 'button' }, data: { action: 'start' } })
  ]);
  if (best) {
    actions.appendChild(
      el('button', { className: 'btn ghost', text: 'Hapus rekor', attrs: { type: 'button' }, data: { action: 'reset-score' } })
    );
  }

  show([
    el('h1', { className: 'headline', text: 'Bulatkan satu jawaban yang paling tepat.' }),
    el('p', { className: 'lead', text: `${ROUND_SIZE} soal acak seputar HTML, CSS, JavaScript, DOM, dan HTTP. Urutan pilihan jawaban juga diacak setiap permainan.` }),
    el('div', { className: 'fields' }, [
      fieldRow('Jumlah soal', String(ROUND_SIZE)),
      fieldRow('Waktu per soal', `${TIME_PER_QUESTION} detik`),
      fieldRow('Rekor terbaik', best ? `${best.score}/${best.total}` : 'belum ada')
    ]),
    rules,
    actions
  ]);
}

/* ================= RENDER: QUIZ ================= */
function startQuiz() {
  state.order = shuffle(QUESTIONS.map((_, i) => i)).slice(0, ROUND_SIZE);
  state.index = 0;
  state.score = 0;
  state.results = [];
  state.newRecord = false;
  renderQuestion();
}

function renderQuestion() {
  state.screen = 'quiz';
  state.locked = false;

  const q = QUESTIONS[state.order[state.index]];
  state.choices = shuffle(q.options.map((text, i) => ({ text, correct: i === q.answer })));

  const total = state.order.length;
  const isLast = state.index === total - 1;

  const list = el('ul', { className: 'options', attrs: { id: 'options' } });
  state.choices.forEach((choice, i) => {
    const btn = el('button', {
      className: 'option',
      attrs: { type: 'button' },
      data: { action: 'answer', index: String(i) }
    }, [
      el('span', { className: 'bubble', text: LETTERS[i] }),
      el('span', { text: choice.text })
    ]);
    list.appendChild(el('li', {}, [btn]));
  });

  const next = el('button', {
    className: 'btn',
    text: isLast ? 'Lihat hasil' : 'Soal berikutnya',
    attrs: { type: 'button', id: 'next', disabled: '' },
    data: { action: 'next' }
  });

  show([
    buildTracker(total, state.index),
    el('div', { className: 'clock', attrs: { 'aria-hidden': 'true' } }, [
      el('span', { className: 'clock-fill', attrs: { id: 'clock-fill' } })
    ]),
    el('div', { className: 'q-grid' }, [
      el('div', { className: 'q-aside' }, [
        el('span', { className: 'q-number', text: String(state.index + 1).padStart(2, '0') }),
        el('span', { className: 'q-category', text: q.category }),
        el('span', { className: 'q-timer', attrs: { id: 'timer' } })
      ]),
      el('div', { className: 'q-main' }, [
        el('h2', { className: 'q-text', text: q.text }),
        list,
        el('p', { className: 'feedback', attrs: { id: 'feedback' } }),
        el('div', { className: 'actions' }, [next])
      ])
    ])
  ]);

  startTimer();
}

// Menandai jawaban: benar = hijau, salah = merah
function revealAnswer(selectedIndex) {
  state.locked = true;
  stopTimer();

  const q = QUESTIONS[state.order[state.index]];
  const buttons = document.querySelectorAll('#options .option');
  const feedback = document.getElementById('feedback');

  buttons.forEach((btn, i) => {
    btn.disabled = true;
    const bubble = btn.querySelector('.bubble');
    if (state.choices[i].correct) {
      btn.classList.add('correct');
      bubble.textContent = '\u2713';
    } else if (i === selectedIndex) {
      btn.classList.add('wrong');
      bubble.textContent = '\u2715';
    }
  });

  const isCorrect = selectedIndex !== null && state.choices[selectedIndex].correct;
  state.results[state.index] = isCorrect ? 'ok' : 'bad';
  if (isCorrect) {
    state.score++;
    feedback.textContent = 'Benar! ' + q.explain;
    feedback.className = 'feedback ok';
  } else {
    feedback.textContent = (selectedIndex === null ? 'Waktu habis. ' : 'Salah. ') + q.explain;
    feedback.className = 'feedback bad';
  }

  const chip = document.querySelectorAll('.tracker .chip')[state.index];
  if (chip) {
    chip.classList.remove('current');
    chip.classList.add(isCorrect ? 'ok' : 'bad');
  }

  const next = document.getElementById('next');
  next.disabled = false;
  next.focus();
}

function handleAnswer(index) {
  if (state.locked) return;
  revealAnswer(index);
}
function handleTimeout() {
  if (state.locked) return;
  revealAnswer(null);
}
function handleNext() {
  if (!state.locked) return;
  state.index++;
  if (state.index < state.order.length) renderQuestion();
  else renderResult();
}

/* ================= RENDER: RESULT ================= */
function renderResult() {
  state.screen = 'result';
  stopTimer();

  const total = state.order.length;
  const percent = Math.round(state.score / total * 100);

  const previous = loadHighScore();
  const prevRatio = previous ? previous.score / previous.total : -1;
  state.newRecord = state.score / total > prevRatio;
  if (state.newRecord) saveHighScore(state.score, total);
  const best = loadHighScore();

  let message = 'Terus berlatih, nilaimu pasti naik.';
  if (percent === 100) message = 'Sempurna. Semua jawaban benar.';
  else if (percent >= 75) message = 'Bagus sekali, pemahamanmu sudah kuat.';
  else if (percent >= 50) message = 'Lumayan, tinggal sedikit lagi.';

  const messageBox = el('div', {});
  if (state.newRecord) messageBox.appendChild(el('span', { className: 'badge', text: 'Rekor baru' }));
  messageBox.appendChild(el('p', { className: 'result-msg', text: message }));

  show([
    el('div', { className: 'result-top' }, [
      el('div', { className: 'stamp' }, [
        el('small', { text: 'Nilai akhir' }),
        el('b', { text: `${state.score}/${total}` }),
        el('span', { text: `${percent}%` })
      ]),
      messageBox
    ]),
    el('div', { className: 'fields' }, [
      fieldRow('Jawaban benar', String(state.score)),
      fieldRow('Jawaban salah', String(total - state.score)),
      fieldRow('Rekor terbaik', best ? `${best.score}/${best.total}` : '-')
    ]),
    el('p', { className: 'review-title', text: 'Rincian jawaban' }),
    buildTracker(total, -1),
    el('div', { className: 'actions' }, [
      el('button', { className: 'btn', text: 'Main lagi', attrs: { type: 'button' }, data: { action: 'restart' } }),
      el('button', { className: 'btn ghost', text: 'Ke halaman awal', attrs: { type: 'button' }, data: { action: 'home' } })
    ])
  ]);
}

/* ================= EVENT DELEGATION ================= */
// Satu listener di document menangani semua tombol lewat atribut data-action
document.addEventListener('click', (event) => {
  const target = event.target.closest('[data-action]');
  if (!target) return;

  switch (target.dataset.action) {
    case 'start':
    case 'restart':
      startQuiz();
      break;
    case 'answer':
      handleAnswer(Number(target.dataset.index));
      break;
    case 'next':
      handleNext();
      break;
    case 'home':
      renderStart();
      break;
    case 'reset-score':
      clearHighScore();
      renderStart();
      break;
    case 'toggle-theme':
      toggleTheme();
      break;
  }
});

/* ================= INIT ================= */
initTheme();
renderStart();