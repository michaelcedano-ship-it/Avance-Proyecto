const KEY = 'tareas-v1';
let tasks = [];

// Cargar tareas guardadas
try {
  tasks = JSON.parse(localStorage.getItem(KEY) || '[]');
} catch (e) {}

// Guardar tareas
const save = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(tasks));
  } catch (e) {}
};

const pad = n => String(n).padStart(2, '0');
const iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const todayIso = iso(new Date());
let view = new Date();
view.setDate(1);
let sel = todayIso;

const $ = id => document.getElementById(id);

function fmt(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });
}

// Renderizar el calendario del mes
function calendario() {
  $('mes').textContent = view.toLocaleDateString('es', { month: 'long', year: 'numeric' });
  const y = view.getFullYear();
  const m = view.getMonth();
  const off = (view.getDay() + 6) % 7;
  const n = new Date(y, m + 1, 0).getDate();
  
  let h = '';
  for (let i = 0; i < off; i++) {
    h += '<button class="day empty" tabindex="-1"></button>';
  }
  for (let d = 1; d <= n; d++) {
    const k = y + '-' + pad(m + 1) + '-' + pad(d);
    const has = tasks.some(t => t.date === k && !t.done);
    h += `<button class="day${k === todayIso ? ' today' : ''}${k === sel ? ' sel' : ''}${has ? ' has' : ''}" data-d="${k}">${d}</button>`;
  }
  $('days').innerHTML = h;
}

// Renderizar la lista de tareas del día seleccionado
function lista() {
  $('fecha').textContent = fmt(sel);$('dia').value = sel;
  
  const items = tasks.filter(t => t.date === sel).sort((a, b) => (a.time || '99').localeCompare(b.time || '99'));
  
  if (!items.length) {
    $('lista').innerHTML = '<div class="empty-msg">No hay tareas para este día.</div>';
    return;
  }
  
  $('lista').innerHTML = items.map(t => `
   <div class="task">
    <div class="top">
      <input type="checkbox" data-c="${t.id}" ${t.done ? 'checked' : ''}>
      <div class="t ${t.done ? 'done' : ''}">
        ${esc(t.title)}
        ${t.time ? `<div class="time">🕒 ${t.time}</div>` : ''}
      </div>
      <button class="del" data-x="${t.id}" aria-label="Eliminar">✕</button>
    </div>
   </div>`).join('');
}

function todo() {
  calendario();
  lista();
}

// Eventos del calendario y botones
$('days').addEventListener('click', e => {
  const b = e.target.closest('[data-d]');
  if (b) {
    sel = b.dataset.d;
    todo();
  }
});

$('prev').onclick = () => { view.setMonth(view.getMonth() - 1); calendario(); };
$('next').onclick = () => { view.setMonth(view.getMonth() + 1); calendario(); };$('hoy').onclick = () => { sel = todayIso; view = new Date(); view.setDate(1); todo(); };

$('dia').onchange = e => {
  if (e.target.value) {
    sel = e.target.value;
    const d = new Date(sel + 'T00:00:00');
    view = new Date(d.getFullYear(), d.getMonth(), 1);
    todo();
  }
};

// Guardar nueva tarea
$('f').addEventListener('submit', e => {
  e.preventDefault();
  const title = $('titulo').value.trim();
  if (!title) return;
  
  tasks.push({ 
    id: Date.now() + '' + Math.floor(Math.random() * 1000), 
    title, 
    date: $('dia').value || sel, 
    time: $('hora').value, 
    done: false 
  });
  
  sel = $('dia').value || sel;
  save();
  $('titulo').value = '';$('hora').value = '';
  todo();
});

// Eliminar o marcar tarea como completada
$('lista').addEventListener('click', e => {
  const x = e.target.dataset.x;
  const c = e.target.dataset.c;
  if (x) { tasks = tasks.filter(t => t.id !== x); save(); todo(); }
  if (c) { const t = tasks.find(t => t.id === c); if (t) { t.done = e.target.checked; save(); todo(); } }
});

todo();