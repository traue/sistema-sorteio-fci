// ======= Nomes das colunas do Forms =======
const COL = {
  ts: 'Carimbo de data/hora',
  name: 'Qual é o seu nome completo? Sem abreviações',
  ra: 'Qual é o seu código de matrícula? Somente números.',
  presence: 'Você está participando de qual forma?',
  course: 'Qual é o curso que está matriculado?',
  turnoCC: '[CC] Qual é o seu turno?',
  turnoSI: '[SI] Qual é o seu turno?',
  turnoAlpha: 'Qual é o seu turno?' // Alphaville
};

// Cursos oficiais (ordem fixa de exibição)
const COURSES = [
  'Ciência da Computação (Higienópolis)',
  'Sistemas de informação (Higienópolis)',
  'Graduações de Alphaville (Ciência da Computação e Sistemas de Informação)',
  'Licenciatura em Matemática - EaD',
  'Tecnologia em Análise e Desenvolvimento de Sistemas - EaD',
  'Tecnologia em Banco de Dados - EaD',
  'Pós-graduações Lato Sensu da FCI',
  'Pós-graduações Stricto Sensu da FCI'
];

// ======= Helpers =======
const $ = (s)=>document.querySelector(s);
const $$ = (s)=>Array.from(document.querySelectorAll(s));
const norm = (v)=> (v==null ? '' : String(v)).trim();
const digits = (v)=> norm(v).replace(/\D+/g,'');

function present(row){
  return norm(row[COL.presence]).toLowerCase().startsWith('presencial');
}

function extractTurno(row, course){
  const c = norm(course).toLowerCase();
  if(c.includes('ciência da computação') && c.includes('higienópolis')) return norm(row[COL.turnoCC]);
  if(c.includes('sistemas de informação') && c.includes('higienópolis')) return norm(row[COL.turnoSI]);
  if(c.startsWith('graduações de alphaville')) return norm(row[COL.turnoAlpha]);
  return '';
}

// Regra: se for Higienópolis e turno Noturno => exige Presencialmente
function eligible(row){
  const course = norm(row[COL.course]);
  const t = extractTurno(row, course);
  const isHig = course.toLowerCase().includes('higienópolis');
  if(isHig && norm(t).toLowerCase()==='noturno'){
    return present(row);
  }
  return true;
}

// Deduplicação por RA, mantendo o último pelo timestamp (mais recente)
function dedupeByRA(rows){
  const map = new Map();
  for(const r of rows){
    const ra = digits(r[COL.ra]);
    const ts = Date.parse(norm(r[COL.ts])) || 0;
    if(!ra){
      // RA vazio => mantém todos como distintos (não força dedupe por nome)
      const key = 'NO_RA:' + norm(r[COL.name]) + '|' + norm(r[COL.course]) + '|' + ts;
      map.set(key, {...r, __key:key, __ts:ts});
      continue;
    }
    const key = 'RA:' + ra;
    const prev = map.get(key);
    if(!prev || ts >= prev.__ts){
      map.set(key, {...r, __key:key, __ts:ts});
    }
  }
  return Array.from(map.values());
}

function groupByCourse(rows){
  const g = new Map();
  for(const r of rows){
    const c = norm(r[COL.course]);
    if(!g.has(c)) g.set(c, []);
    g.get(c).push(r);
  }
  return g;
}

// Random com crypto
function randIndex(n){ return Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296 * n); }
function pickOne(arr){ if(!arr.length) return null; return arr[randIndex(arr.length)]; }
function shuffle(a){
  const arr = a.slice();
  for(let i=arr.length-1;i>0;i--){
    const j = randIndex(i+1);
    [arr[i],arr[j]] = [arr[j],arr[i]];
  }
  return arr;
}

// Desenha vencedores por curso
function drawPerCourse(unique){
  const g = groupByCourse(unique);
  const out = [];
  for(const course of COURSES){
    const arr = g.get(course) || [];
    const elig = arr.filter(eligible);
    const winner = pickOne(elig);
    out.push({ course, elig, winner: winner || null });
  }
  return out;
}

// Extras: ignorar filtros, excluir já vencedores
function drawExtras(unique, winners, k){
  const winKeys = new Set(winners.filter(Boolean).map(w=>w.__key));
  const pool = unique.filter(r=> !winKeys.has(r.__key));
  return shuffle(pool).slice(0, Math.max(0, k|0));
}

function rowInfo(r){
  const course = norm(r[COL.course]);
  return {
    name: norm(r[COL.name]) || '—',
    ra: digits(r[COL.ra]) || '—',
    course,
    turno: extractTurno(r, course) || '—',
    pres: present(r) ? 'Presencialmente' : 'Remotamente'
  };
}

function cardHtml(title, r, kind){
  const empty = !r;
  const body = empty ? `<div class="kv"><span class="k">Sem elegíveis</span></div>` : (()=>{
    const i = rowInfo(r);
    return `
      <div class="kv"><span class="k">Nome:</span> ${i.name}</div>
      <div class="kv"><span class="k">RA:</span> ${i.ra}</div>
      <div class="kv"><span class="k">Curso:</span> ${i.course}</div>
      <div class="kv"><span class="k">Turno:</span> ${i.turno}</div>`;
  })();
  const badge = kind==='EXTRA' ? '<span class="badge">EXTRA</span>' : '';
  return `
    <div class="card${empty?' revealed':''}" data-kind="${kind}">
      <h3>${title} ${badge}</h3>
      ${body}
      <div class="veil"><span class="label">CLIQUE PARA REVELAR</span></div>
    </div>`;
}

function render(perCourse, extras){
  $('#perCourse').innerHTML = perCourse.map(x => cardHtml(x.course, x.winner, 'COURSE')).join('');
  $('#extras').innerHTML = extras.map((r,i)=> cardHtml('#'+(i+1), r, 'EXTRA')).join('');
  $('#btnExport').disabled = !(perCourse.length || extras.length);
  $('#extraBadge').textContent = String(extras.length);
  $$('.card').forEach(c => c.addEventListener('click', () => c.classList.add('revealed')));
}

function exportCSV(perCourse, extras){
  const rows = [['Tipo','Curso','Nome','RA','Turno','Presença']];
  for(const e of perCourse){
    if(e.winner){
      const i = rowInfo(e.winner);
      rows.push(['POR_CURSO', e.course, i.name, i.ra, i.turno, i.pres]);
    } else {
      rows.push(['POR_CURSO', e.course, '', '', '', '']);
    }
  }
  for(const r of extras){
    const i = rowInfo(r);
    rows.push(['EXTRA', '', i.name, i.ra, i.turno, i.pres]);
  }
  const csv = rows.map(r=> r.map(v=> `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'sorteio_fci.csv'; a.click();
}

// ======= Estado + Wiring =======
let state = { rows:[], unique:[], perCourse:[], extras:[] };

$('#file').addEventListener('change', async (ev)=>{
  const f = ev.target.files[0]; if(!f) return;
  const buf = await f.arrayBuffer();
  const wb = XLSX.read(buf, {type:'array'});
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, {defval:''});
  state.rows = rows;
  state.unique = dedupeByRA(rows);

  // Diagnóstico rápido
  const total = rows.length, uniq = state.unique.length;
  const presentCount = state.unique.filter(present).length;
  const courses = new Set(state.unique.map(r=>norm(r[COL.course])).filter(Boolean));
  $('#diag').innerHTML = `
    <span class="pill">Registros: <b>${total}</b></span>
    <span class="pill">Após dedupe (RA): <b>${uniq}</b></span>
    <span class="pill">Presenciais: <b>${presentCount}</b></span>
    <span class="pill">Cursos detectados: <b>${courses.size}</b></span>
  `;
});

$('#btnRun').addEventListener('click', ()=>{
  if(!state.unique.length){ alert('Carregue a planilha primeiro.'); return; }
  let k = parseInt($('#extraCount').value,10); if(!Number.isFinite(k)||k<0) k=5;
  const per = drawPerCourse(state.unique);
  const winners = per.map(x=>x.winner).filter(Boolean);
  const extras = drawExtras(state.unique, winners, k);
  state.perCourse = per; state.extras = extras;
  render(per, extras);
});

$('#btnExport').addEventListener('click', ()=> exportCSV(state.perCourse, state.extras));

$('#btnRevealAll').addEventListener('click', ()=> $$('.card').forEach(c=> c.classList.add('revealed')));

$('#btnFs').addEventListener('click', ()=>{
  const el = document.documentElement;
  if(!document.fullscreenElement){ el.requestFullscreen?.(); } else { document.exitFullscreen?.(); }
});