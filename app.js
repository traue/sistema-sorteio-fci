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
  const badge = kind==='EXTRA' ? '<span class="badge">EXTRA</span>' : '';
  if(empty){
    return `
      <div class="card revealed" data-kind="${kind}">
        <h3>${title} ${badge}</h3>
        <div class="kv"><span class="k">Sem elegíveis</span></div>
        <div class="veil"><span class="label">CLIQUE PARA REVELAR</span></div>
      </div>`;
  }
  const i = rowInfo(r);
  // Sempre mostrar o curso no topo; demais dados no corpo. Destacar o nome.
  return `
    <div class="card" data-kind="${kind}">
      <h3 class="course">${i.course} ${badge}</h3>
      <div class="card-body">
        <div class="winner-name">${i.name}</div>
        <div class="kv"><span class="k">RA:</span> ${i.ra}</div>
        <div class="kv"><span class="k">Turno:</span> ${i.turno}</div>
        <div class="kv"><span class="k">Presença:</span> ${i.pres}</div>
      </div>
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
const APP_JS_VERSION = '2025-10-29-1';

function initBindings(){
  console.info('initBindings()', APP_JS_VERSION, 'readyState=', document.readyState, 'filePresent=', !!document.querySelector('#file'));
  // tenta localizar #file com timeout; algumas versões do Safari hospedado
  // podem inserir o DOM de forma diferente — aguardar evita null references
  const waitFor = (selector, timeout=3000) => new Promise(resolve => {
    const el = document.querySelector(selector);
    if(el) return resolve(el);
    const obs = new MutationObserver(()=>{
      const e = document.querySelector(selector);
      if(e){ obs.disconnect(); clearTimeout(t); resolve(e); }
    });
    obs.observe(document.documentElement, { childList:true, subtree:true });
    const t = setTimeout(()=>{ obs.disconnect(); resolve(null); }, timeout);
  });

  (async ()=>{
    const fileInput = await waitFor('#file', 3000);
    if(fileInput){
      try{
        fileInput.addEventListener('change', async (ev)=>{
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
      const diag = $('#diag'); if(diag) diag.innerHTML = `
        <span class="pill">Registros: <b>${total}</b></span>
        <span class="pill">Após dedupe (RA): <b>${uniq}</b></span>
        <span class="pill">Presenciais: <b>${presentCount}</b></span>
        <span class="pill">Cursos detectados: <b>${courses.size}</b></span>
      `;
      });
      console.debug('binding #file done');
      } catch(err) {
        console.error('Erro ao adicionar listener #file:', err);
      }
    } else {
      console.warn('Elemento #file não encontrado após timeout; omitindo listener de file input.');
    }
  })();

  const btnRun = $('#btnRun');
  if(btnRun){
    btnRun.addEventListener('click', ()=>{
      if(!state.unique.length){ alert('Carregue a planilha primeiro.'); return; }
      let k = parseInt($('#extraCount').value,10); if(!Number.isFinite(k)||k<0) k=5;
      const per = drawPerCourse(state.unique);
      const winners = per.map(x=>x.winner).filter(Boolean);
      const extras = drawExtras(state.unique, winners, k);
      state.perCourse = per; state.extras = extras;
      render(per, extras);
    });
  }

  const btnExport = $('#btnExport'); if(btnExport) btnExport.addEventListener('click', ()=> exportCSV(state.perCourse, state.extras));
  const btnRevealAll = $('#btnRevealAll'); if(btnRevealAll) btnRevealAll.addEventListener('click', ()=> $$('.card').forEach(c=> c.classList.add('revealed')));

  const btnFs = $('#btnFs');
  if(btnFs){
    btnFs.addEventListener('click', async ()=>{
      const el = document.documentElement;
      try {
        if(!document.fullscreenElement && !document.webkitFullscreenElement){
          // Tenta todos os métodos conhecidos de fullscreen
          const enterFS = el.requestFullscreen || 
                         el.webkitRequestFullscreen || 
                         el.mozRequestFullScreen || 
                         el.msRequestFullscreen;
          
          if(enterFS){
            await enterFS.call(el);
          } else {
            alert('Seu navegador não suporta o modo tela cheia');
          }
        } else {
          const exitFS = document.exitFullscreen || 
                        document.webkitExitFullscreen || 
                        document.mozCancelFullScreen || 
                        document.msExitFullscreen;
          
          if(exitFS){
            await exitFS.call(document);
          }
        }
      } catch(err) {
        console.error('Erro ao alternar tela cheia:', err);
        alert('Não foi possível ativar o modo tela cheia. Verifique se o site está em HTTPS e se seu navegador tem permissão.');
      }
    });
  }
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', initBindings);
} else {
  // Já carregado (script no final do body) -> inicializa imediatamente
  initBindings();
}