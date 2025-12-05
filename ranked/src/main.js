import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://ireiyqslfctdouhakygx.supabase.co";
const SUPABASE_KEY = "sb_publishable_0E9Wp0ELc0JUoL_qK2wWGw_ffHyFwsU";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ==================== AUTENTICACIÓN ====================
// Credenciales estáticas de acceso
const VALID_CREDENTIALS = [
  { usuario: 'admin', password: '1234', rol: 'admin', nombre: 'Administrador' },
  { usuario: 'daniel', password: 'daniel123', rol: 'usuario', nombre: 'Daniel López' },
  { usuario: 'juez', password: 'juez456', rol: 'juez', nombre: 'Juez Principal' },
  { usuario: 'organizador', password: 'org789', rol: 'organizador', nombre: 'Organizador de Eventos' }
];

// Variables de sesión
let isAuthenticated = false;
let currentUser = null;

// Verificar si está autenticado al cargar la página
function checkAuthentication() {
  const token = sessionStorage.getItem('userToken');
  const userName = sessionStorage.getItem('userName');
  const userRole = sessionStorage.getItem('userRole');
  
  if (token && userName && userRole) {
    isAuthenticated = true;
    currentUser = { usuario: userName, rol: userRole };
    showDashboard();
    actualizarHeaderUsuario();
  } else {
    showLoginScreen();
  }
}

function showLoginScreen() {
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('dashboard-screen').classList.add('dashboard-hidden');
}

function showDashboard() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('dashboard-screen').classList.remove('dashboard-hidden');
}

// Función de logout
function logout() {
  sessionStorage.removeItem('userToken');
  sessionStorage.removeItem('userName');
  sessionStorage.removeItem('userRole');
  isAuthenticated = false;
  currentUser = null;
  location.reload();
}

// Actualizar header con información del usuario
function actualizarHeaderUsuario() {
  if (currentUser) {
    const headerContent = document.querySelector('.header-content');
    if (headerContent) {
      const badge = document.createElement('div');
      badge.style.display = 'flex';
      badge.style.alignItems = 'center';
      badge.style.gap = '1rem';
      badge.innerHTML = `
        <span style="background: rgba(99, 102, 241, 0.2); padding: 0.5rem 1rem; border-radius: 0.5rem; font-size: 0.9rem;">
          👤 ${currentUser.usuario} <span style="color: #f59e0b; font-weight: 600;">(${currentUser.rol})</span>
        </span>
      `;
      
      // Limpiar y volver a agregar el botón de logout y el badge
      const existingBadge = headerContent.querySelector('[data-user-badge]');
      if (existingBadge) {
        existingBadge.remove();
      }
      const existingLogout = headerContent.querySelector('#btn-logout');
      if (existingLogout) {
        existingLogout.parentElement.insertBefore(badge, existingLogout);
        badge.setAttribute('data-user-badge', 'true');
      }
    }
  }
}

// Event listener para el botón de login
document.getElementById('btn-login').addEventListener('click', async () => {
  const usuario = document.getElementById('login-usuario').value?.trim();
  const password = document.getElementById('login-password').value?.trim();
  const errorDiv = document.getElementById('login-error');

  // Limpiar errores previos
  errorDiv.classList.add('hidden');
  document.getElementById('error-usuario').textContent = '';
  document.getElementById('error-password').textContent = '';

  // Validaciones
  if (!usuario) {
    document.getElementById('error-usuario').textContent = 'Por favor ingresa tu usuario';
    return;
  }

  if (!password) {
    document.getElementById('error-password').textContent = 'Por favor ingresa tu contraseña';
    return;
  }

  // Verificar credenciales
  const user = VALID_CREDENTIALS.find(cred => cred.usuario === usuario && cred.password === password);
  
  if (user) {
    // Login exitoso
    sessionStorage.setItem('userToken', 'logged_in_' + Date.now());
    sessionStorage.setItem('userName', user.usuario);
    sessionStorage.setItem('userRole', user.rol);
    isAuthenticated = true;
    currentUser = user;
    showDashboard();
    // Actualizar nombre en el header
    actualizarHeaderUsuario();
    // Inicializar el dashboard
    init();
  } else {
    // Login fallido
    errorDiv.classList.remove('hidden');
    errorDiv.textContent = '❌ Usuario o contraseña incorrectos';
    document.getElementById('login-password').value = '';
  }
});

// ==================== FIN AUTENTICACIÓN ====================

// STATE PARA MODALES
let editingEquipoId = null;
let editingActividadId = null;
let editingPuntajeKey = null;
let deletingItemKey = null; // Para cualquier tipo de eliminación

// DOM - CREACIÓN
const elEquipoNombre = document.getElementById('equipo-nombre');
const elEquipoRepresentante = document.getElementById('equipo-representante');
const elEquipoColor = document.getElementById('equipo-color');
const btnCrearEquipo = document.getElementById('btn-crear-equipo');

const elActividadNombre = document.getElementById('actividad-nombre');
const elActividadMin = document.getElementById('actividad-min');
const elActividadMax = document.getElementById('actividad-max');
const btnCrearActividad = document.getElementById('btn-crear-actividad');

const selEquipo = document.getElementById('puntaje-equipo');
const selActividad = document.getElementById('puntaje-actividad');
const elPuntos = document.getElementById('puntaje-puntos');
const btnGuardarPuntaje = document.getElementById('btn-guardar-puntaje');

// DOM - LISTAS Y NOTIFICACIONES
const rankingDiv = document.getElementById('ranking');
const notif = document.getElementById('notification');
const equiposList = document.getElementById('equipos-list');
const actividadesList = document.getElementById('actividades-list');
const puntajesList = document.getElementById('puntajes-list');

// DOM - REFRESH BUTTONS
const btnRefreshEquipos = document.getElementById('btn-refresh-equipos');
const btnRefreshActividades = document.getElementById('btn-refresh-actividades');
const btnRefreshPuntajes = document.getElementById('btn-refresh-puntajes');

// TABS
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// COLOR NAMES MAP
const colorNames = {
  '#6366f1': 'Indigo',
  '#4f46e5': 'Indigo Oscuro',
  '#0ea5e9': 'Cyan',
  '#06b6d4': 'Cyan Oscuro',
  '#f59e0b': 'Ámbar',
  '#fbbf24': 'Ámbar Claro',
  '#ef4444': 'Rojo',
  '#dc2626': 'Rojo Oscuro',
  '#10b981': 'Verde',
  '#059669': 'Verde Oscuro',
  '#ec4899': 'Rosa',
  '#be185d': 'Rosa Oscuro',
  '#3b82f6': 'Azul',
  '#1e40af': 'Azul Oscuro'
};

// UTILITIES
function showNotif(msg, timeout = 2200) {
  notif.textContent = msg;
  notif.classList.remove('hidden', 'error');
  setTimeout(() => notif.classList.add('hidden'), timeout);
}

function showError(msg, timeout = 2200) {
  notif.textContent = msg;
  notif.classList.remove('hidden');
  notif.classList.add('error');
  setTimeout(() => notif.classList.add('hidden'), timeout);
}

function escapeHtml(s) {
  if (s === null || s === undefined) return '';
  return String(s).replace(/[&<>"']/g, (m) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[m]);
}

function getColorName(hex) {
  return colorNames[hex?.toLowerCase()] || hex || 'Sin color';
}

function abrirModal(id) {
  document.getElementById(id).classList.remove('hidden');
}

function cerrarModal(id) {
  document.getElementById(id).classList.add('hidden');
}

// TAB NAVIGATION
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tabId = btn.dataset.tab;
    
    // Remove active from all
    tabBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    
    // Add active to current
    btn.classList.add('active');
    document.getElementById(`tab-${tabId}`).classList.add('active');
  });
});

// COLOR PREVIEW
elEquipoColor.addEventListener('change', (e) => {
  document.getElementById('color-preview').textContent = getColorName(e.target.value);
});

// CARGAR STATS
async function cargarStats() {
  try {
    const [{ count: equiposCount }, { count: actividadesCount }, { count: puntajesCount }] = await Promise.all([
      supabase.from('equipos').select('id', { count: 'exact', head: true }),
      supabase.from('actividades').select('id', { count: 'exact', head: true }),
      supabase.from('puntajes').select('id', { count: 'exact', head: true })
    ]);

    const html = `
      <div class="stat-item">
        <span class="stat-icon">👥</span>
        <span class="stat-number">${equiposCount || 0}</span>
        <span class="stat-label">Equipos</span>
      </div>
      <div class="stat-item">
        <span class="stat-icon">🏃</span>
        <span class="stat-number">${actividadesCount || 0}</span>
        <span class="stat-label">Actividades</span>
      </div>
      <div class="stat-item">
        <span class="stat-icon">⭐</span>
        <span class="stat-number">${puntajesCount || 0}</span>
        <span class="stat-label">Puntajes</span>
      </div>
    `;
    document.getElementById('stats-header').innerHTML = html;
  } catch (err) {
    console.error('Error cargando stats', err);
  }
}

// ==================== EQUIPOS ====================

// Crear Equipo
btnCrearEquipo.addEventListener('click', async () => {
  const nombre = elEquipoNombre.value?.trim();
  const representante = elEquipoRepresentante.value?.trim();
  const color = elEquipoColor.value?.trim() || null;
  if (!nombre) return showError('Ingresa nombre de equipo');

  const { error } = await supabase.from('equipos').insert([{ nombre, representante, color }]);
  if (error) return showError('Error creando equipo: ' + error.message);
  
  elEquipoNombre.value = '';
  elEquipoRepresentante.value = '';
  elEquipoColor.value = '#6366f1';
  document.getElementById('color-preview').textContent = 'Indigo';
  showNotif('✅ Equipo creado');
  await cargarSelects();
  await cargarRanking();
  await cargarEquipos();
  await cargarStats();
});

// Cargar Equipos en lista
async function cargarEquipos() {
  const { data, error } = await supabase.from('equipos').select('*').order('nombre');
  if (error) {
    console.error('Error cargando equipos', error);
    equiposList.innerHTML = `<p>Error: ${escapeHtml(error.message)}</p>`;
    return;
  }

  if (!data || data.length === 0) {
    equiposList.innerHTML = `<p style="text-align:center;color:#cbd5e1;grid-column:1/-1;">No hay equipos todavía</p>`;
    return;
  }

  equiposList.innerHTML = data.map(equipo => `
    <div class="item-card">
      <div class="item-name">${escapeHtml(equipo.nombre)}</div>
      <div class="item-details">
        ${equipo.color ? `<div class="item-detail-row">
          <span class="item-detail-label">Color:</span>
          <div style="display:flex;gap:8px;align-items:center;">
            <div style="width:16px;height:16px;background:${escapeHtml(equipo.color)};border-radius:3px;"></div>
            <span>${escapeHtml(getColorName(equipo.color))}</span>
          </div>
        </div>` : ''}
      </div>
      <div class="item-actions">
        <button class="btn btn-edit btn-edit-equipo" data-id="${equipo.id}" data-nombre="${escapeHtml(equipo.nombre)}" data-color="${equipo.color || '#6366f1'}">✏️ Editar</button>
        <button class="btn btn-delete btn-delete-equipo" data-id="${equipo.id}" data-nombre="${escapeHtml(equipo.nombre)}">🗑️ Eliminar</button>
      </div>
    </div>
  `).join('');

  // Event listeners para editar equipos
  equiposList.querySelectorAll('.btn-edit-equipo').forEach(btn => {
    btn.addEventListener('click', function() {
      const idRaw = this.getAttribute('data-id');
      const nombre = this.getAttribute('data-nombre');
      const color = this.getAttribute('data-color');
      
      console.log('Raw equipo data:', { idRaw, nombre, color });
      
      editingEquipoId = idRaw; // NO usar parseInt, es un UUID
      console.log('Parsed equipo ID:', { editingEquipoId, tipo: typeof editingEquipoId });
      
      document.getElementById('edit-equipo-nombre').value = nombre;
      document.getElementById('edit-equipo-color').value = color;
      abrirModal('modal-editar-equipo');
    });
  });

  // Event listeners para eliminar equipos
  equiposList.querySelectorAll('.btn-delete-equipo').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      const nombre = this.getAttribute('data-nombre');
      deletingItemKey = { type: 'equipo', id, nombre }; // NO usar parseInt
      document.getElementById('modal-eliminar-mensaje').textContent = `¿Eliminar el equipo "${nombre}"?`;
      abrirModal('modal-confirmar-eliminacion');
    });
  });
}

document.getElementById('btn-guardar-edicion-equipo').addEventListener('click', async () => {
  const nombre = document.getElementById('edit-equipo-nombre').value?.trim();
  const color = document.getElementById('edit-equipo-color').value?.trim() || null;

  if (!nombre) return showError('Ingresa nombre de equipo');
  if (!editingEquipoId) return showError('ID no encontrado');

  console.log('Guardando equipo con:', { editingEquipoId, tipo: typeof editingEquipoId, nombre, color });

  const { error } = await supabase
    .from('equipos')
    .update({ nombre, color })
    .eq('id', editingEquipoId);

  if (error) return showError('Error actualizando: ' + error.message);
  
  cerrarModal('modal-editar-equipo');
  showNotif('✅ Equipo actualizado');
  await cargarEquipos();
  await cargarSelects();
  await cargarRanking();
});

// ==================== ACTIVIDADES ====================

// Crear Actividad
btnCrearActividad.addEventListener('click', async () => {
  const nombre = elActividadNombre.value?.trim();
  const minima_puntuacion = parseInt(elActividadMin.value) || 0;
  const maxima_puntuacion = parseInt(elActividadMax.value) || 100;
  if (!nombre) return showError('Ingresa nombre de actividad');

  const { error } = await supabase.from('actividades').insert([{ nombre, minima_puntuacion, maxima_puntuacion }]);
  if (error) return showError('Error creando actividad: ' + error.message);
  
  elActividadNombre.value = '';
  elActividadMin.value = '0';
  elActividadMax.value = '100';
  showNotif('✅ Actividad creada');
  await cargarSelects();
  await cargarActividades();
  await cargarStats();
});

// Cargar Actividades en lista
async function cargarActividades() {
  const { data, error } = await supabase.from('actividades').select('*').order('nombre');
  if (error) {
    console.error('Error cargando actividades', error);
    actividadesList.innerHTML = `<p>Error: ${escapeHtml(error.message)}</p>`;
    return;
  }

  if (!data || data.length === 0) {
    actividadesList.innerHTML = `<p style="text-align:center;color:#cbd5e1;grid-column:1/-1;">No hay actividades todavía</p>`;
    return;
  }

  actividadesList.innerHTML = data.map(act => `
    <div class="item-card">
      <div class="item-name">${escapeHtml(act.nombre)}</div>
      <div class="item-details">
        <div class="item-detail-row">
          <span class="item-detail-label">Puntos máx:</span>
          <span class="item-detail-value">${act.maxima_puntuacion}</span>
        </div>
      </div>
      <div class="item-actions">
        <button class="btn btn-edit btn-edit-actividad" data-id="${act.id}" data-nombre="${escapeHtml(act.nombre)}" data-max="${act.maxima_puntuacion}">✏️ Editar</button>
        <button class="btn btn-delete btn-delete-actividad" data-id="${act.id}" data-nombre="${escapeHtml(act.nombre)}">🗑️ Eliminar</button>
      </div>
    </div>
  `).join('');

  // Event listeners para editar actividades
  actividadesList.querySelectorAll('.btn-edit-actividad').forEach(btn => {
    btn.addEventListener('click', function() {
      const idRaw = this.getAttribute('data-id');
      const nombre = this.getAttribute('data-nombre');
      const maxRaw = this.getAttribute('data-max');
      
      console.log('Raw actividad data:', { idRaw, nombre, maxRaw });
      
      editingActividadId = idRaw; // NO usar parseInt, es un UUID
      console.log('Parsed actividad ID:', { editingActividadId, tipo: typeof editingActividadId });
      
      document.getElementById('edit-actividad-nombre').value = nombre;
      document.getElementById('edit-actividad-max').value = parseInt(maxRaw);
      abrirModal('modal-editar-actividad');
    });
  });

  // Event listeners para eliminar actividades
  actividadesList.querySelectorAll('.btn-delete-actividad').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      const nombre = this.getAttribute('data-nombre');
      deletingItemKey = { type: 'actividad', id, nombre }; // NO usar parseInt
      document.getElementById('modal-eliminar-mensaje').textContent = `¿Eliminar la actividad "${nombre}"?`;
      abrirModal('modal-confirmar-eliminacion');
    });
  });
}

document.getElementById('btn-guardar-edicion-actividad').addEventListener('click', async () => {
  const nombre = document.getElementById('edit-actividad-nombre').value?.trim();
  const maxima_puntuacion = parseInt(document.getElementById('edit-actividad-max').value) || 100;

  if (!nombre) return showError('Ingresa nombre de actividad');
  if (!editingActividadId) return showError('ID no encontrado');

  console.log('Guardando actividad con:', { editingActividadId, tipo: typeof editingActividadId, nombre, maxima_puntuacion });

  const { error } = await supabase
    .from('actividades')
    .update({ nombre, maxima_puntuacion })
    .eq('id', editingActividadId);

  if (error) return showError('Error actualizando: ' + error.message);
  
  cerrarModal('modal-editar-actividad');
  showNotif('✅ Actividad actualizada');
  await cargarActividades();
  await cargarSelects();
});

// ==================== PUNTAJES ====================

// Guardar Puntaje (crear o actualizar)
btnGuardarPuntaje.addEventListener('click', async () => {
  const equipo_id = selEquipo.value;
  const actividad_id = selActividad.value;
  const puntos = parseInt(elPuntos.value);

  if (!equipo_id || !actividad_id || Number.isNaN(puntos)) return showError('Completa todos los campos');

  const payload = { equipo_id, actividad_id, puntos };

  const { error } = await supabase.from('puntajes').upsert(payload, { onConflict: 'equipo_id,actividad_id' });
  if (error) return showError('Error guardando puntaje: ' + error.message);

  showNotif('✅ Puntaje guardado');
  elPuntos.value = '';
  await cargarRanking();
  await cargarPuntajes();
});

// Cargar Puntajes en lista (organizados por actividad)
async function cargarPuntajes() {
  const { data, error } = await supabase
    .from('puntajes')
    .select('equipo_id, actividad_id, puntos, equipos(nombre, color), actividades(nombre, maxima_puntuacion)');

  if (error) {
    console.error('Error cargando puntajes', error);
    puntajesList.innerHTML = `<p>Error: ${escapeHtml(error.message)}</p>`;
    return;
  }

  if (!data || data.length === 0) {
    puntajesList.innerHTML = `<p style="text-align:center;color:#cbd5e1;grid-column:1/-1;padding:2rem;">No hay puntajes registrados</p>`;
    return;
  }

  // Agrupar puntajes por actividad
  const puntajesPorActividad = {};
  data.forEach(puntaje => {
    const actividadId = puntaje.actividad_id;
    if (!puntajesPorActividad[actividadId]) {
      puntajesPorActividad[actividadId] = {
        nombre: puntaje.actividades.nombre,
        maxima_puntuacion: puntaje.actividades.maxima_puntuacion,
        puntajes: []
      };
    }
    puntajesPorActividad[actividadId].puntajes.push(puntaje);
  });

  // Ordenar puntajes dentro de cada actividad de forma descendente
  Object.values(puntajesPorActividad).forEach(actividad => {
    actividad.puntajes.sort((a, b) => b.puntos - a.puntos);
  });

  // Generar HTML
  let html = '';
  Object.entries(puntajesPorActividad).forEach(([actividadKeyId, actividad]) => {
    html += `
      <div class="activity-category">
        <div class="activity-category-title">
          <h3>🏃 ${escapeHtml(actividad.nombre)}</h3>
          <span class="activity-max-pts">Máx: ${actividad.maxima_puntuacion} pts</span>
        </div>
        <div class="activity-scores">
          ${actividad.puntajes.map(puntaje => {
            const equipoId = puntaje.equipo_id;
            const actividadId = puntaje.actividad_id;
            const puntos = puntaje.puntos;
            return `
            <div class="score-item">
              <div class="score-team-info">
                ${puntaje.equipos.color ? `<div class="score-team-color" style="background:${escapeHtml(puntaje.equipos.color)};"></div>` : ''}
                <span class="score-team-name">${escapeHtml(puntaje.equipos.nombre)}</span>
              </div>
              <div class="score-value">
                <span class="score-points">${puntaje.puntos} pts</span>
                <div class="score-actions">
                  <button class="btn btn-edit" data-equipo="${equipoId}" data-actividad="${actividadId}" data-puntos="${puntos}">✏️</button>
                  <button class="btn btn-delete" data-equipo="${equipoId}" data-actividad="${actividadId}">🗑️</button>
                </div>
              </div>
            </div>
          `;
          }).join('')}
        </div>
      </div>
    `;
  });

  puntajesList.innerHTML = html;
  
  // Event listeners para botones de editar/eliminar puntajes
  puntajesList.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const equipoId = this.getAttribute('data-equipo');
      const actividadId = this.getAttribute('data-actividad');
      const puntos = parseInt(this.getAttribute('data-puntos'));
      
      console.log('Raw data:', { equipoId, actividadId, puntos });
      
      editingPuntajeKey = { equipo_id: equipoId, actividad_id: actividadId };
      console.log('editingPuntajeKey guardado:', editingPuntajeKey);
      
      document.getElementById('edit-puntaje-puntos').value = puntos;
      abrirModal('modal-editar-puntaje');
    });
  });

  puntajesList.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const equipoId = this.getAttribute('data-equipo');
      const actividadId = this.getAttribute('data-actividad');
      deletingItemKey = { type: 'puntaje', equipo_id: equipoId, actividad_id: actividadId };
      document.getElementById('modal-eliminar-mensaje').textContent = '¿Eliminar este puntaje?';
      abrirModal('modal-confirmar-eliminacion');
    });
  });
}

// Editar Puntaje

document.getElementById('btn-guardar-edicion-puntaje').addEventListener('click', async () => {
  const puntos = parseInt(document.getElementById('edit-puntaje-puntos').value);

  if (Number.isNaN(puntos)) return showError('Ingresa puntos válidos');
  if (!editingPuntajeKey) return showError('ID no encontrado');

  console.log('Guardando puntaje con:', editingPuntajeKey);
  console.log('Puntos:', puntos);

  const { error } = await supabase
    .from('puntajes')
    .update({ puntos })
    .eq('equipo_id', editingPuntajeKey.equipo_id)
    .eq('actividad_id', editingPuntajeKey.actividad_id);

  if (error) return showError('Error actualizando: ' + error.message);
  
  cerrarModal('modal-editar-puntaje');
  showNotif('✅ Puntaje actualizado');
  await cargarPuntajes();
  await cargarRanking();
});

// ==================== SELECTS ====================

async function cargarSelects() {
  // Equipos
  const { data: equipos, error: eErr } = await supabase.from('equipos').select('id,nombre').order('nombre');
  if (eErr) {
    console.error('Error cargando equipos', eErr);
    selEquipo.innerHTML = `<option value="">— Error —</option>`;
  } else {
    selEquipo.innerHTML = equipos && equipos.length
      ? equipos.map(x => `<option value="${x.id}">${escapeHtml(x.nombre)}</option>`).join('')
      : `<option value="">— No hay equipos —</option>`;
  }

  // Actividades
  const { data: actividades, error: aErr } = await supabase.from('actividades').select('id,nombre').order('nombre');
  if (aErr) {
    console.error('Error cargando actividades', aErr);
    selActividad.innerHTML = `<option value="">— Error —</option>`;
  } else {
    selActividad.innerHTML = actividades && actividades.length
      ? actividades.map(x => `<option value="${x.id}">${escapeHtml(x.nombre)}</option>`).join('')
      : `<option value="">— No hay actividades —</option>`;
  }
}

// ==================== RANKING ====================

async function cargarRanking() {
  const { data, error } = await supabase.from('vw_ranking_equipos').select('*').order('total_puntos', { ascending: false });

  if (error) {
    console.error('Error cargando ranking:', error);
    rankingDiv.innerHTML = `<p>Error: ${escapeHtml(error.message)}</p>`;
    return;
  }

  if (!data || data.length === 0) {
    rankingDiv.innerHTML = `<p style="text-align:center;color:#cbd5e1;padding:2rem;">No hay equipos todavía</p>`;
    return;
  }

  let html = '';
  data.forEach((row, idx) => {
    const pos = idx + 1;
    const posClass = pos === 1 ? 'position-1' : pos === 2 ? 'position-2' : pos === 3 ? 'position-3' : 'position-n';
    const colorSquare = row.color ? `<div style="width:12px;height:12px;background:${escapeHtml(row.color)};border-radius:3px;"></div>` : '';
    
    html += `
      <div class="ranking-item">
        <div class="ranking-position ${posClass}">
          ${pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : pos}
        </div>
        <div class="ranking-content">
          <div class="ranking-name">${colorSquare} ${escapeHtml(row.nombre)}</div>
          <div class="ranking-score">
            Actividades: ${row.actividades_participadas}
          </div>
        </div>
        <div class="ranking-score-value">${row.total_puntos} pts</div>
      </div>
    `;
  });

  rankingDiv.innerHTML = html;
  await cargarStats();
}

// Confirmar eliminación (equipos, actividades o puntajes)
document.getElementById('btn-confirmar-eliminacion').addEventListener('click', async () => {
  if (!deletingItemKey) return showError('ID no encontrado');
  
  const { type, id, equipo_id, actividad_id } = deletingItemKey;

  if (type === 'equipo') {
    const { error } = await supabase.from('equipos').delete().eq('id', id);
    if (error) return showError('Error eliminando: ' + error.message);
    
    await cargarEquipos();
    await cargarSelects();
    await cargarRanking();
    await cargarStats();
  } else if (type === 'actividad') {
    const { error } = await supabase.from('actividades').delete().eq('id', id);
    if (error) return showError('Error eliminando: ' + error.message);
    
    await cargarActividades();
    await cargarSelects();
    await cargarStats();
  } else if (type === 'puntaje') {
    const { error } = await supabase.from('puntajes').delete().eq('equipo_id', equipo_id).eq('actividad_id', actividad_id);
    if (error) return showError('Error eliminando: ' + error.message);
    
    await cargarPuntajes();
    await cargarRanking();
  }

  cerrarModal('modal-confirmar-eliminacion');
  showNotif('✅ Elemento eliminado');
  deletingItemKey = null;
});

// EVENT LISTENERS para cerrar modales
document.querySelectorAll('[data-close-modal]').forEach(btn => {
  btn.addEventListener('click', function() {
    const modalId = this.dataset.closeModal;
    cerrarModal(modalId);
  });
});

// ==================== REFRESH BUTTONS ====================

btnRefreshEquipos.addEventListener('click', cargarEquipos);
btnRefreshActividades.addEventListener('click', cargarActividades);
btnRefreshPuntajes.addEventListener('click', cargarPuntajes);

// ==================== INIT ====================

async function init() {
  try {
    await cargarSelects();
    await cargarRanking();
    await cargarEquipos();
    await cargarActividades();
    await cargarPuntajes();
    await cargarStats();
  } catch (err) {
    console.error('Init error', err);
  }
}

// Verificar autenticación al cargar
checkAuthentication();

// Event listener para logout
document.getElementById('btn-logout').addEventListener('click', () => {
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    logout();
  }
});
