const KEY = 'tareas-v2';
let tasks = [];

try {
  tasks = JSON.parse(localStorage.getItem(KEY) || 'null');
} catch (e) {
  tasks = null;
}

const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const plus = n => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return iso(d);
};

if (!Array.isArray(tasks)) {
  tasks = [
    { id: 'd1', title: 'Preparar exposición de biología', date: plus(0), time: '15:00', done: false },
    { id: 'd2', title: 'Estudiar para el examen de matemáticas', date: plus(1), time: '19:00', done: false },
    { id: 'd3', title: 'Comprar el mercado de la semana', date: plus(2), time: '', done: false }
  ];
}

const save = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(tasks));
  } catch (e) {}
};

const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const today = iso(new Date());
let view = new Date();
view.setDate(1);
let sel = today;

// Categorías: [nombre, icono, palabras clave, [nombre, url, para qué sirve]]
const R = [
  ['Estudio', '📚', ['estudiar', 'examen', 'parcial', 'quiz', 'repasar', 'investigar', 'clase', 'taller', 'matematicas', 'fisica', 'quimica', 'biologia', 'historia'], [['Khan Academy', 'https://www.khanacademy.org', 'Lecciones y ejercicios gratis'], ['Quizlet', 'https://quizlet.com', 'Tarjetas para memorizar'], ['Google Académico', 'https://scholar.google.com', 'Fuentes y artículos confiables'], ['Wolfram Alpha', 'https://www.wolframalpha.com', 'Resuelve y explica problemas']]],
  ['Escritura', '✍️', ['escribir', 'ensayo', 'informe', 'redactar', 'articulo', 'documento', 'carta', 'resumen', 'monografia'], [['Google Docs', 'https://docs.google.com', 'Escribe y comparte en línea'], ['LanguageTool', 'https://languagetool.org', 'Corrige ortografía y estilo'], ['Zotero', 'https://www.zotero.org', 'Citas y bibliografía'], ['Diccionario RAE', 'https://dle.rae.es', 'Significados y sinónimos']]],
  ['Presentaciones', '🎤', ['presentacion', 'diapositiva', 'exponer', 'exposicion', 'slides', 'sustentar', 'sustentacion'], [['Canva', 'https://www.canva.com', 'Plantillas de diapositivas'], ['Google Slides', 'https://slides.google.com', 'Presenta y colabora'], ['Genially', 'https://genially.com', 'Presentaciones interactivas'], ['Pexels', 'https://www.pexels.com', 'Fotos gratis para tus slides']]],
  ['Reuniones', '🎥', ['reunion', 'llamada', 'videollamada', 'entrevista', 'meet', 'conferencia'], [['Google Meet', 'https://meet.google.com', 'Videollamadas rápidas'], ['Zoom', 'https://zoom.us', 'Reuniones y webinars'], ['Microsoft Teams', 'https://www.microsoft.com/es-es/microsoft-teams/group-chat-software', 'Chat y videollamadas en equipo']]],
  ['Compras', '🛒', ['comprar', 'mercado', 'compras', 'supermercado', 'regalo', 'pedido'], [['Mercado Libre', 'https://www.mercadolibre.com.co', 'Compra casi de todo'], ['Rappi', 'https://www.rappi.com.co', 'Domicilios de mercado'], ['Google Keep', 'https://keep.google.com', 'Lista de compras simple']]],
  ['Finanzas', '💰', ['pagar', 'factura', 'presupuesto', 'ahorro', 'deuda', 'arriendo', 'impuestos', 'declaracion'], [['Google Sheets', 'https://sheets.google.com', 'Plantillas de presupuesto'], ['Nequi', 'https://www.nequi.com.co', 'Pagos y ahorro'], ['Wallet', 'https://budgetbakers.com', 'Controla tus gastos'], ['DIAN', 'https://www.dian.gov.co', 'Trámites de impuestos']]],
  ['Ejercicio', '🏃', ['ejercicio', 'gimnasio', 'correr', 'entrenar', 'yoga', 'caminar', 'rutina', 'deporte'], [['Strava', 'https://www.strava.com', 'Registra tus recorridos'], ['Nike Training Club', 'https://www.nike.com/ntc-app', 'Rutinas guiadas gratis'], ['Yoga With Adriene', 'https://yogawithadriene.com', 'Yoga para todos los niveles']]],
  ['Cocina', '🍳', ['cocinar', 'receta', 'cena', 'almuerzo', 'desayuno', 'hornear', 'postre'], [['Cookpad', 'https://cookpad.com', 'Recetas de la comunidad'], ['Tasty', 'https://tasty.co', 'Recetas en video'], ['Directo al Paladar', 'https://www.directoalpaladar.com', 'Recetas paso a paso']]],
  ['Viajes', '✈️', ['viaje', 'vuelo', 'hotel', 'vacaciones', 'pasaje', 'viajar', 'maleta'], [['Google Flights', 'https://www.google.com/travel/flights', 'Compara vuelos'], ['Booking', 'https://www.booking.com', 'Reserva alojamiento'], ['Google Maps', 'https://maps.google.com', 'Rutas y lugares'], ['TripAdvisor', 'https://www.tripadvisor.co', 'Opiniones y planes']]],
  ['Programación', '💻', ['programar', 'codigo', 'pagina web', 'app', 'bug', 'desarrollar', 'html', 'python', 'javascript'], [['GitHub', 'https://github.com', 'Guarda y comparte código'], ['Replit', 'https://replit.com', 'Programa desde el navegador'], ['MDN Web Docs', 'https://developer.mozilla.org', 'Documentación web'], ['Stack Overflow', 'https://stackoverflow.com', 'Respuestas a errores']]],
  ['Salud', '🩺', ['medico', 'cita', 'salud', 'doctor', 'odontologo', 'dentista', 'vacuna'], [['Doctoralia', 'https://www.doctoralia.com.co', 'Encuentra especialistas'], ['MedlinePlus', 'https://medlineplus.gov/spanish/', 'Información médica confiable'], ['Mayo Clinic', 'https://www.mayoclinic.org/es', 'Guías de salud']]],
  ['Diseño', '🎨', ['disenar', 'diseno', 'logo', 'poster', 'afiche', 'flyer', 'ilustracion'], [['Canva', 'https://www.canva.com', 'Diseños listos para editar'], ['Figma', 'https://www.figma.com', 'Diseño de interfaces'], ['Coolors', 'https://coolors.co', 'Paletas de colores'], ['Unsplash', 'https://unsplash.com', 'Fotos gratis']]],
  ['Idiomas', '🌎', ['ingles', 'idioma', 'frances', 'aleman', 'vocabulario', 'pronunciacion'], [['Duolingo', 'https://www.duolingo.com', 'Práctica diaria'], ['Busuu', 'https://www.busuu.com', 'Lecciones con hablantes nativos'], ['WordReference', 'https://www.wordreference.com', 'Diccionario y foros'], ['YouGlish', 'https://youglish.com', 'Escucha cómo se pronuncia']]],
  ['Lectura', '📖', ['leer', 'libro', 'lectura', 'novela', 'comic'], [['Goodreads', 'https://www.goodreads.com', 'Reseñas y listas de lectura'], ['Google Libros', 'https://books.google.com', 'Busca y previsualiza libros'], ['Project Gutenberg', 'https://www.gutenberg.org', 'Clásicos gratis']]],
  ['Hogar', '🏠', ['limpiar', 'aseo', 'ordenar', 'lavar', 'casa', 'arreglar', 'reparar', 'jardin'], [['YouTube', 'https://www.youtube.com', 'Tutoriales paso a paso'], ['Pinterest', 'https://www.pinterest.com', 'Ideas para organizar'], ['Mercado Libre', 'https://www.mercadolibre.com.co', 'Materiales y repuestos']]],
  ['Trámites', '📄', ['tramite', 'cedula', 'pasaporte', 'licencia', 'renovar', 'certificado'], [['Gov.co', 'https://www.gov.co', 'Trámites del Estado'], ['Registraduría', 'https://www.registraduria.gov.co', 'Documento de identidad'], ['Cancillería', 'https://www.cancilleria.gov.co', 'Pasaporte y visas']]],
  ['Música', '🎵', ['componer', 'guitarra', 'piano', 'cancion', 'grabar', 'musica', 'cantar'], [['Ultimate Guitar', 'https://www.ultimate-guitar.com', 'Acordes y tablaturas'], ['BandLab', 'https://www.bandlab.com', 'Graba y mezcla gratis'], ['YouTube', 'https://www.youtube.com', 'Clases de instrumentos']]],
  ['Proyectos', '🗂️', ['proyecto', 'planear', 'organizar', 'equipo', 'entrega', 'plan de trabajo'], [['Trello', 'https://trello.com', 'Tableros de tareas'], ['Notion', 'https://www.notion.so', 'Notas y proyectos'], ['Miro', 'https://miro.com', 'Pizarra colaborativa']]]
];

const DEF = { n: 'Organización general', i: '🧭', t: [['Notion', 'https://www.notion.so', 'Notas y proyectos en un lugar'], ['Trello', 'https://trello.com', 'Tableros de tareas'], ['Pomofocus', 'https://pomofocus.io', 'Temporizador para concentrarte'], ['Google Keep', 'https://keep.google.com', 'Notas rápidas']] };

function analizar(txt) {
  const t = norm(txt);
  const sc = R.map(r => ({ n: r[0], i: r[1], t: r[3], s: r[2].filter(k => t.includes(k)).length })).filter(x => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 2);
  if (!sc.length) return { cats: [DEF], tools: DEF.t };
  const seen = new Set(), tools = [];
  sc.forEach((c, i) => c.t.slice(0, i ? 2 : 3).forEach(l => { if (!seen.has(l[1])) { seen.add(l[1]); tools.push(l); } }));
  return { cats: sc, tools };
}

const toolHtml = l => `<a class="tool" href="${l[1]}" target="_blank" rel="noopener noreferrer"><b>${l[0]}</b><span>${l[2]}</span></a>`;
const $ = id => document.getElementById(id);
const fmt = d => new Date(d + 'T00:00:00').toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });

function stats() {
  $('s1').textContent = tasks.filter(t => !t.done).length;
  $('s2').textContent = tasks.filter(t => t.done).length;
  $('s3').textContent = tasks.filter(t => t.date === today && !t.done).length;
  $('s4').textContent = tasks.filter(t => t.date < today && !t.done).length;
}

function calendario() {
  $('mes').textContent = view.toLocaleDateString('es', { month: 'long', year: 'numeric' });
  const y = view.getFullYear(), m = view.getMonth(), off = (view.getDay() + 6) % 7, n = new Date(y, m + 1, 0).getDate();
  let h = '';
  for (let i = 0; i < off; i++) h += '<button class="day empty" tabindex="-1"></button>';
  for (let d = 1; d <= n; d++) {
    const k = `${y}-${pad(m + 1)}-${pad(d)}`;
    const has = tasks.some(t => t.date === k && !t.done);
    h += `<button class="day${k === today ? ' today' : ''}${k === sel ? ' sel' : ''}${has ? ' has' : ''}" data-d="${k}">${d}</button>`;
  }
  $('days').innerHTML = h;
}

function lista() {
  $('fecha').textContent = fmt(sel);$('dia').value = sel;
  const v = tasks.filter(t => t.date < today && !t.done).length;
  $('aviso').innerHTML = v ? `<div class="alert">⚠️ Tienes ${v} tarea${v > 1 ? 's' : ''} vencida${v > 1 ? 's' : ''} sin completar.</div>` : '';
  const it = tasks.filter(t => t.date === sel).sort((a, b) => (a.time || '99').localeCompare(b.time || '99'));
  if (!it.length) {
    $('lista').innerHTML = '<div class="msg">No hay tareas para este día. ¡Agrega la primera!</div>';
    return;
  }
  $('lista').innerHTML = it.map(t => {
    let r = '';
    if (!t.done) {
      const a = analizar(t.title);
      r = a.cats.map(c => `<span class="cat">${c.i || ''} ${c.n}</span>`).join('') + `<div class="tools">${a.tools.map(toolHtml).join('')}</div>`;
    }
    return `<div class="task"><div class="top"><input type="checkbox" data-c="${t.id}" ${t.done ? 'checked' : ''}>
    <div class="t ${t.done ? 'done' : ''}">${esc(t.title)}${t.time ? `<div class="time">🕒 ${t.time}</div>` : ''}</div>
    <button class="del" data-x="${t.id}" aria-label="Eliminar">✕</button></div>${r}</div>`;
  }).join('');
}

function resumen() {
  const cnt = new Map();
  tasks.filter(t => !t.done).forEach(t => analizar(t.title).tools.forEach(l => { const o = cnt.get(l[1]) || { l, n: 0 }; o.n++; cnt.set(l[1], o); }));
  const arr = [...cnt.values()].sort((a, b) => b.n - a.n).slice(0, 8);
  $('resumen').innerHTML = arr.length ? arr.map(o => `<a class="tool" href="${o.l[1]}" target="_blank" rel="noopener noreferrer"><b>${o.l[0]}</b><span>${o.l[2]} · ${o.n} tarea${o.n > 1 ? 's' : ''}</span></a>`).join('') : '<div class="msg" style="grid-column:1/-1">Agrega tareas y aquí aparecerán las herramientas que más te sirven.</div>';
}

function todo() {
  stats();
  calendario();
  lista();
  resumen();
}

$('catgrid').innerHTML = R.map(r => `<div class="card"><div class="ci">${r[1]}</div><h3>${r[0]}</h3><p>${r[3].slice(0, 3).map(l => l[0]).join(', ')}</p></div>`).join('');

$('days').addEventListener('click', e => {
  const b = e.target.closest('[data-d]');
  if (b) { sel = b.dataset.d; todo(); }
});

$('prev').onclick = () => { view.setMonth(view.getMonth() - 1); calendario(); };
$('next').onclick = () => { view.setMonth(view.getMonth() + 1); calendario(); };$('hoy').onclick = () => { sel = today; view = new Date(); view.setDate(1); todo(); };

$('dia').onchange = e => {
  if (e.target.value) {
    sel = e.target.value;
    const d = new Date(sel + 'T00:00:00');
    view = new Date(d.getFullYear(), d.getMonth(), 1);
    todo();
  }
};

$('f').addEventListener('submit', e => {
  e.preventDefault();
  const title = $('titulo').value.trim();
  if (!title) return;
  sel = $('dia').value || sel;
  tasks.push({ id: Date.now() + '' + Math.floor(Math.random() * 999), title, date: sel, time: $('hora').value, done: false });
  save();
  $('titulo').value = '';$('hora').value = '';
  todo();
});

$('lista').addEventListener('click', e => {
  const x = e.target.dataset.x, c = e.target.dataset.c;
  if (x) { tasks = tasks.filter(t => t.id !== x); save(); todo(); }
  if (c) { const t = tasks.find(t => t.id === c); if (t) { t.done = e.target.checked; save(); todo(); } }
});

todo();