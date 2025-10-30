// == Configurações iniciais ==
// DEBUG: força mapeamento de colunas
const DEBUG_FORCE_MAP = true;

// Utilidades
const $ = (sel) => document.querySelector(sel);
const createEl = (tag, cls) => { const el = document.createElement(tag); if (cls) el.className = cls; return el; };
const norm = (v) => (v ?? '').toString().trim();
const slug = (v) => norm(v).toLowerCase();

let RAW_ROWS = []; // linhas brutas do arquivo
let COLS = [];     // cabeçalho original

// Campos UI
const fileInput = $('#fileInput');
const fileMeta  = $('#fileMeta');
const sampleContainer = $('#sampleContainer');

const colRA = $('#colRA');
const colNome = $('#colNome');
const colCurso = $('#colCurso');
const colTurno = $('#colTurno');
const colPresenca = $('#colPresenca');
const colTurma = $('#colTurma');

const limitCursos = $('#limitCursos');
const tokensPresente = $('#tokensPresente');
const tokensNoturno = $('#tokensNoturno');
const dedupeStrategy = $('#dedupeStrategy');

const previewBox = $('#previewBox');
const btnPreview = $('#btnPreview');
const btnSortear = $('#btnSortear');
const btnAbrirTelao = $('#btnAbrirTelao');

const resultadoView = $('#resultadoView');
const cards = $('#cards');
const stats = $('#stats');
const pillCursos = $('#pillCursos');
const pillExtras = $('#pillExtras');

const telaoView = $('#telaoView');
const stage = $('#stage');
const btnFullscreen = $('#btnFullscreen');
const confetti = $('#confetti');

// Leitura do arquivo (XLSX/CSV) usando SheetJS
fileInput.addEventListener('change', async (e) => {
  const f = e.target.files?.[0];
  if (!f) return;
  fileMeta.textContent = `Arquivo: ${f.name} · ${(f.size/1024).toFixed(1)} KB`;
  const buf = await f.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const wsName = wb.SheetNames[0];
  const ws = wb.Sheets[wsName];
  const json = XLSX.utils.sheet_to_json(ws, { defval: '', raw: false });

  if (!json.length) {
    sampleContainer.textContent = 'Planilha vazia.';
    return;
  }
  RAW_ROWS = json;
  COLS = Object.keys(json[0]);

  // DEBUG: força mapeamento de colunas
  if (DEBUG_FORCE_MAP) {
    colRA.value = 'RA';
    colNome.value = 'Nome';
    colCurso.value = 'Curso';
    colTurno.value = 'Turno';
    colPresenca.value = 'Presenca';
    colTurma.value = 'Turma';
  }

  // Popular selects de mapeamento
  for (const sel of [colRA, colNome, colCurso, colTurno, colPresenca, colTurma]) {
    sel.innerHTML = '<option value="">— selecione —</option>' + COLS.map(c=>`<option value="${c}">${c}</option>`).join('');
  }
  // Tentativa de auto-mapear por nomes comuns
  autoMapColumns();

  // Amostra
  const sampleRows = json.slice(0, 8);
  sampleContainer.innerHTML = renderSampleTable(sampleRows);
});

function renderSampleTable(rows) {
  const th = COLS.map(c=>`<th>${escapeHtml(c)}</th>`).join('');
  const trs = rows.map(r => `<tr>${COLS.map(c=>`<td>${escapeHtml(r[c])}</td>`).join('')}</tr>`).join('');
  return `<div style="margin-top:6px">Prévia (8 linhas):</div><div style="overflow:auto"><table style="width:100%; border-collapse:collapse; margin-top:6px"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table></div>`;
}

function escapeHtml(v){
  return norm(v).replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;' }[m]));
}

function autoMapColumns(){
  const mapBy = (pred) => COLS.find(c => pred(slug(c))) || '';
  colRA.value = mapBy(s=> s==='ra');
  colNome.value = mapBy(s=> s.includes('nome'));
  colCurso.value = mapBy(s=> s.includes('curso'));
  colTurno.value = mapBy(s=> s.includes('turno'));
  colPresenca.value = mapBy(s=> s.includes('presen') || s.includes('presenç') || s.includes('presenca'));
  colTurma.value = mapBy(s=> s.includes('turma'));
}

// Pré-visualização: cursos detectados e elegibilidade por regra
btnPreview.addEventListener('click', () => {
  const cfg = readConfig();
  if (!cfg) return;
  const rows = pipelineRows(cfg);
  const cursos = [...new Set(rows.map(r=>r.curso))].sort();
  const elegiveisPorCurso = cursos.map(c => ({
    curso: c,
    total: rows.filter(r=>r.curso===c).length,
    elegiveis: rows.filter(r=>r.curso===c && elegivelParaCurso(r, cfg)).length
  }));

  const lis = elegiveisPorCurso.map(x=>`<li><b>${escapeHtml(x.curso)}</b>: ${x.elegiveis}/${x.total} elegíveis</li>`).join('');
  previewBox.innerHTML = `<div><b>Cursos detectados (${cursos.length}):</b></div><ul>${lis}</ul>`;
});

// Sorteio principal
btnSortear.addEventListener('click', () => {
  const cfg = readConfig();
  if (!cfg) return;
  const rows = pipelineRows(cfg);

  // Cursos e limite
  const cursos = [...new Set(rows.map(r=>r.curso))].sort();
  const limit = Math.min(parseInt(cfg.limitCursos,10)||8, 8, cursos.length);
  const cursosUsados = cursos.slice(0, limit);

  const winners = [];
  const pickedRA = new Set();

  // 1 por curso com regra de noturno
  for (const curso of cursosUsados) {
    const pool = rows.filter(r => r.curso===curso && elegivelParaCurso(r, cfg) && !pickedRA.has(r.ra));
    if (pool.length) {
      const w = pickOne(pool);
      winners.push({ tipo:'curso', curso, ...w });
      pickedRA.add(w.ra);
    } else {
      winners.push({ tipo:'curso', curso, vazio:true });
    }
  }

  // 5 extras, ignorando regras de presença/turno, mas sem repetir
  const restantes = rows.filter(r => !pickedRA.has(r.ra));
  const extras = pickMany(restantes, 5);
  for (const w of extras) { winners.push({ tipo:'extra', curso:'Extra', ...w }); pickedRA.add(w.ra); }

  renderResultado(winners);
  saveToLocalStorage(winners, cfg);
  sprinkleConfetti();
});

// Abrir telão em nova janela
btnAbrirTelao.addEventListener('click', (e) => {
  e.preventDefault();
  saveToLocalStorage(null, null); // garante persistência atual
  window.open(window.location.href.split('#')[0] + '#telao', '_blank');
});

// Telão: quando hash = #telao
window.addEventListener('load', () => {
  if (location.hash === '#telao') {
    document.querySelector('#configView').classList.add('hidden');
    document.querySelector('#rulesView').classList.add('hidden');
    document.querySelector('#resultadoView').classList.add('hidden');
    telaoView.classList.remove('hidden');
    loadFromLocalStorageAndRenderStage();
  }
});

btnFullscreen.addEventListener('click', () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    document.documentElement.requestFullscreen();
  }
});

// Início: diagnósticos para debug rápido
console.log('app.js: carregado');
window.addEventListener('error', (e) => {
  console.error('Unhandled error:', e.error || e.message || e);
});
window.addEventListener('unhandledrejection', (ev) => {
  console.error('Unhandled promise rejection:', ev.reason);
});
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM carregado — verificando elementos importantes...');
  console.log('fileInput existente?', !!document.querySelector('#fileInput'));
  console.log('XLSX disponível?', typeof window.XLSX !== 'undefined');
});

// ====== Core helpers ======
function readConfig(){
  if (!RAW_ROWS.length) { alert('Carregue uma planilha primeiro.'); return null; }
  const cfg = {
    colRA: colRA.value, colNome: colNome.value, colCurso: colCurso.value, colTurno: colTurno.value, colPresenca: colPresenca.value, colTurma: colTurma.value || null,
    limitCursos: limitCursos.value,
    tokensPresente: tokensPresente.value.split(',').map(s=>slug(s)).map(s=>s.trim()).filter(Boolean),
    tokensNoturno: tokensNoturno.value.split(',').map(s=>slug(s)).map(s=>s.trim()).filter(Boolean),
    dedupeStrategy: dedupeStrategy.value
  };
  const required = ['colRA','colNome','colCurso','colTurno','colPresenca'];
  for (const k of required) {
    if (!cfg[k]) { alert('Mapeie todas as colunas obrigatórias.'); return null; }
  }
  return cfg;
}

function pipelineRows(cfg){
  // 1) Normaliza linhas em objeto padrão { ra, nome, curso, turno, presenca, turma, idx }
  const rows = RAW_ROWS.map((r, idx) => ({
    ra: norm(r[cfg.colRA]),
    nome: norm(r[cfg.colNome]),
    curso: norm(r[cfg.colCurso]),
    turno: norm(r[cfg.colTurno]),
    presenca: norm(r[cfg.colPresenca]),
    turma: cfg.colTurma ? norm(r[cfg.colTurma]) : '',
    idx
  })).filter(r => r.ra !== ''); // RA nunca vazio (pelo requisito)

  // 2) Deduplicação por RA
  const byRA = new Map();
  if (cfg.dedupeStrategy === 'first') {
    for (const r of rows) if (!byRA.has(r.ra)) byRA.set(r.ra, r);
  } else { // last
    for (const r of rows) byRA.set(r.ra, r);
  }

  return [...byRA.values()];
}

function elegivelParaCurso(r, cfg){
  const isNoturno = cfg.tokensNoturno.includes(slug(r.turno));
  if (!isNoturno) return true; // diurno/EaD ≈ livre
  // noturno: requer presença
  const pres = slug(r.presenca);
  return cfg.tokensPresente.some(tok => pres.includes(tok));
}

function pickOne(arr){
  const i = Math.floor(Math.random() * arr.length);
  return arr[i];
}
function pickMany(arr, n){
  const pool = [...arr];
  const out = [];
  while (pool.length && out.length < n){
    const i = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(i,1)[0]);
  }
  return out;
}

function renderResultado(winners){
  cards.innerHTML = '';
  let nCursos = winners.filter(w=>w.tipo==='curso').length;
  let nExtras = winners.filter(w=>w.tipo==='extra').length;
  stats.textContent = `Sorteados: ${winners.filter(w=>!w.vazio).length} · Vazios (sem elegíveis no curso): ${winners.filter(w=>w.vazio).length}`;
  pillCursos.textContent = `Cursos sorteados: ${nCursos}`;
  pillExtras.textContent = `Extras: ${nExtras}`;

  const sorted = [...winners];
  // Cursos primeiro, depois extras
  sorted.sort((a,b)=> (a.tipo===b.tipo) ? (a.curso.localeCompare(b.curso)) : (a.tipo==='curso'?-1:1));

  for (const w of sorted) {
    const card = createEl('div','ticket');
    const head = createEl('div','course');
    head.textContent = w.tipo==='curso' ? `Curso: ${w.curso}` : 'Extra';
    card.appendChild(head);

    const mask = createEl('div','mask');
    if (w.vazio) {
      mask.textContent = '— Sem elegíveis —';
      mask.style.opacity = .7;
      mask.style.cursor = 'default';
    } else {
      mask.textContent = 'Clique para revelar';
      mask.addEventListener('click', () => {
        mask.classList.add('revealed');
        mask.textContent = `${w.nome} (${w.ra})`;
      }, { once:true });
    }
    card.appendChild(mask);

    const ra = createEl('div','ra');
    if (!w.vazio) ra.textContent = `Turno: ${w.turno}${w.turma?` · Turma: ${w.turma}`:''}`;
    card.appendChild(ra);

    cards.appendChild(card);
  }
}

function saveToLocalStorage(winners, cfg){
  // salva último sorteio para o telão ler
  const payload = winners ? winners : window._lastWinners;
  const config = cfg ? cfg : window._lastConfig;
  if (payload) window._lastWinners = payload;
  if (config) window._lastConfig = config;
  localStorage.setItem('sorteio_winners', JSON.stringify(window._lastWinners||[]));
  localStorage.setItem('sorteio_config', JSON.stringify(window._lastConfig||{}));
}

function loadFromLocalStorageAndRenderStage(){
  const winners = JSON.parse(localStorage.getItem('sorteio_winners')||'[]');
  stage.innerHTML = '';
  for (const w of winners) {
    const card = createEl('div','ticket');
    const head = createEl('div','course');
    head.textContent = w.tipo==='curso' ? `Curso: ${w.curso}` : 'Extra';
    card.appendChild(head);

    const mask = createEl('div','mask');
    if (w.vazio) {
      mask.textContent = '— Sem elegíveis —';
      mask.style.opacity = .7;
      mask.style.cursor = 'default';
    } else {
      mask.textContent = 'Clique para revelar';
      mask.addEventListener('click', () => {
        mask.classList.add('revealed');
        mask.textContent = `${w.nome} (${w.ra})`;
      }, { once:true });
    }
    card.appendChild(mask);

    const ra = createEl('div','ra');
    if (!w.vazio) ra.textContent = `Turno: ${w.turno}${w.turma?` · Turma: ${w.turma}`:''}`;
    card.appendChild(ra);

    stage.appendChild(card);
  }
}

function sprinkleConfetti(){
  confetti.innerHTML = '';
  const n = 120;
  const w = window.innerWidth;
  for (let i=0;i<n;i++){
    const p = document.createElement('i');
    p.style.left = Math.random()*w + 'px';
    p.style.top = - (Math.random()*60 + 10) + 'px';
    p.style.transform = `rotate(${Math.random()*360}deg)`;
    p.style.animationDelay = (Math.random()*0.8)+'s';
    confetti.appendChild(p);
  }
  setTimeout(()=> confetti.innerHTML = '', 2000);
}