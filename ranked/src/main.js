import { createClient } from '@supabase/supabase-js'
import Chart from 'chart.js/auto';

const SUPABASE_URL = "https://ireiyqslfctdouhakygx.supabase.co";
const SUPABASE_KEY = "sb_publishable_0E9Wp0ELc0JUoL_qK2wWGw_ffHyFwsU";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ==================== AUTENTICACIÓN ====================
// Credenciales estáticas de acceso
const VALID_CREDENTIALS = [
  { usuario: 'lider', password: '12345', rol: 'admin', },
  { usuario: 'juventud', password: 'campa2025', rol: 'user', },
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
  updateDashboardTabAccess();
  updateTabsVisibility();
  // Cargar datos del dashboard
  init();
}

// Actualizar acceso a la tab del Dashboard basado en el rol del usuario
function updateDashboardTabAccess() {
  const dashboardTabBtn = document.querySelector('[data-tab="inicio"]');
  if (!dashboardTabBtn) return;
  
  if (currentUser && currentUser.rol !== 'admin') {
    dashboardTabBtn.classList.add('disabled');
    dashboardTabBtn.setAttribute('title', '❌ Solo administradores pueden ver el Dashboard');
  } else {
    dashboardTabBtn.classList.remove('disabled');
    dashboardTabBtn.setAttribute('title', '');
  }
}

// Desactivar opciones CRUD para usuarios no-admin
function updateCRUDAccess() {
  if (!currentUser || currentUser.rol === 'admin') return;
  
  // Desactivar botones de crear
  const btnCrearEquipo = document.getElementById('btn-crear-equipo');
  const btnCrearActividad = document.getElementById('btn-crear-actividad');
  const btnGuardarPuntaje = document.getElementById('btn-guardar-puntaje');
  
  if (btnCrearEquipo) {
    btnCrearEquipo.disabled = true;
    btnCrearEquipo.classList.add('disabled-btn');
    btnCrearEquipo.setAttribute('title', 'Solo admins pueden crear equipos');
  }
  if (btnCrearActividad) {
    btnCrearActividad.disabled = true;
    btnCrearActividad.classList.add('disabled-btn');
    btnCrearActividad.setAttribute('title', 'Solo admins pueden crear actividades');
  }
  if (btnGuardarPuntaje) {
    btnGuardarPuntaje.disabled = true;
    btnGuardarPuntaje.classList.add('disabled-btn');
    btnGuardarPuntaje.setAttribute('title', 'Solo admins pueden registrar puntajes');
  }
}

// Controlar visibilidad de tabs según el rol del usuario
function updateTabsVisibility() {
  if (!currentUser) return;
  
  const adminTabs = document.querySelectorAll('.tab-btn.admin-only');
  const puntajesTab = document.querySelector('[data-tab="puntajes"]');
  
  if (currentUser.rol === 'admin') {
    // Admin: mostrar todas las tabs
    adminTabs.forEach(tab => tab.style.display = 'block');
    if (puntajesTab) puntajesTab.style.display = 'block';
  } else {
    // No-admin: ocultar tabs de admin, mostrar solo puntajes
    adminTabs.forEach(tab => tab.style.display = 'none');
    if (puntajesTab) puntajesTab.style.display = 'block';
    
    // Forzar la navegación a puntajes
    if (!document.querySelector('[data-tab="puntajes"]').classList.contains('active')) {
      document.querySelector('[data-tab="puntajes"]').click();
    }
  }
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

// Función para mostrar toast en el login
function showLoginToast(msg, timeout = 2200) {
  if (loginNotif) {
    loginNotif.textContent = msg;
    loginNotif.classList.remove('hidden');
    loginNotif.classList.add('error');
    setTimeout(() => loginNotif.classList.add('hidden'), timeout);
  }
}

// Función para procesar login
async function procesarLogin() {
  console.log('Procesando login...');
  const usuario = document.getElementById('login-usuario').value?.trim();
  const password = document.getElementById('login-password').value?.trim();

  console.log('Usuario:', usuario, 'Password:', password ? '***' : 'vacío');

  // Limpiar errores previos
  const errorUsuarioEl = document.getElementById('error-usuario');
  const errorPasswordEl = document.getElementById('error-password');
  
  if (errorUsuarioEl) errorUsuarioEl.textContent = '';
  if (errorPasswordEl) errorPasswordEl.textContent = '';

  // Validaciones
  if (!usuario) {
    if (errorUsuarioEl) errorUsuarioEl.textContent = 'Por favor ingresa tu usuario';
    return;
  }

  if (!password) {
    if (errorPasswordEl) errorPasswordEl.textContent = 'Por favor ingresa tu contraseña';
    return;
  }

  // Verificar credenciales
  const user = VALID_CREDENTIALS.find(cred => cred.usuario === usuario && cred.password === password);
  
  console.log('Credenciales encontradas:', !!user);
  
  if (user) {
    // Login exitoso
    console.log('Login exitoso para:', user.usuario);
    sessionStorage.setItem('userToken', 'logged_in_' + Date.now());
    sessionStorage.setItem('userName', user.usuario);
    sessionStorage.setItem('userRole', user.rol);
    isAuthenticated = true;
    currentUser = user;
    showDashboard();
    // Inicializar el dashboard
    init();
    
    // Navegar a la tab apropiada según el rol
    if (user.rol === 'admin') {
      // Admin va al Dashboard
      const dashboardTab = document.querySelector('[data-tab="inicio"]');
      if (dashboardTab) dashboardTab.click();
    } else {
      // No-admin va a Puntajes
      const puntajesTab = document.querySelector('[data-tab="puntajes"]');
      if (puntajesTab) puntajesTab.click();
    }
  } else {
    // Login fallido - mostrar toast de error
    console.log('Login fallido');
    showLoginToast('❌ Usuario o contraseña incorrectos');
    if (document.getElementById('login-password')) {
      document.getElementById('login-password').value = '';
    }
  }
}


// Event listener para el botón de login
const btnLogin = document.getElementById('btn-login');
const inputUsuario = document.getElementById('login-usuario');
const inputPassword = document.getElementById('login-password');

if (btnLogin) {
  btnLogin.addEventListener('click', procesarLogin);
}

// Event listener para enter en los inputs de login
if (inputUsuario) {
  inputUsuario.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') procesarLogin();
  });
}

if (inputPassword) {
  inputPassword.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') procesarLogin();
  });
}

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
const loginNotif = document.getElementById('login-notification');
const equiposList = document.getElementById('equipos-list');
const actividadesList = document.getElementById('actividades-list');
const puntajesList = document.getElementById('puntajes-list');

// DOM - REFRESH BUTTONS
const btnRefreshEquipos = document.getElementById('btn-refresh-equipos');
const btnRefreshActividades = document.getElementById('btn-refresh-actividades');
const btnRefreshPuntajes = document.getElementById('btn-refresh-puntajes');
const btnRefreshStats = document.getElementById('btn-refresh-stats');

// DOM - ESTADÍSTICAS
const statsTableContainer = document.getElementById('stats-table-container');

// GRÁFICAS
let chartRanking = null;
let chartActividades = null;

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
    
    // Bloquear acceso al dashboard para no-admin
    if (tabId === 'inicio' && currentUser && currentUser.rol !== 'admin') {
      showError('❌ Acceso denegado: Solo administradores pueden ver el Dashboard');
      return;
    }
    
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

  const isAdminUser = currentUser && currentUser.rol === 'admin';

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
        <button class="btn btn-edit btn-edit-equipo ${!isAdminUser ? 'disabled-btn' : ''}" data-id="${equipo.id}" data-nombre="${escapeHtml(equipo.nombre)}" data-color="${equipo.color || '#6366f1'}" ${!isAdminUser ? 'disabled title="Solo admins pueden editar"' : ''}>✏️ Editar</button>
        <button class="btn btn-delete btn-delete-equipo ${!isAdminUser ? 'disabled-btn' : ''}" data-id="${equipo.id}" data-nombre="${escapeHtml(equipo.nombre)}" ${!isAdminUser ? 'disabled title="Solo admins pueden eliminar"' : ''}>🗑️ Eliminar</button>
      </div>
    </div>
  `).join('');

  // Event listeners para editar equipos
  equiposList.querySelectorAll('.btn-edit-equipo').forEach(btn => {
    btn.addEventListener('click', function() {
      if (!isAdminUser) return;
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
      if (!isAdminUser) return;
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

  const isAdminUser = currentUser && currentUser.rol === 'admin';

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
        <button class="btn btn-edit btn-edit-actividad ${!isAdminUser ? 'disabled-btn' : ''}" data-id="${act.id}" data-nombre="${escapeHtml(act.nombre)}" data-max="${act.maxima_puntuacion}" ${!isAdminUser ? 'disabled title="Solo admins pueden editar"' : ''}>✏️ Editar</button>
        <button class="btn btn-delete btn-delete-actividad ${!isAdminUser ? 'disabled-btn' : ''}" data-id="${act.id}" data-nombre="${escapeHtml(act.nombre)}" ${!isAdminUser ? 'disabled title="Solo admins pueden eliminar"' : ''}>🗑️ Eliminar</button>
      </div>
    </div>
  `).join('');

  // Event listeners para editar actividades
  actividadesList.querySelectorAll('.btn-edit-actividad').forEach(btn => {
    btn.addEventListener('click', function() {
      if (!isAdminUser) return;
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
      if (!isAdminUser) return;
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

  const isAdminUser = currentUser && currentUser.rol === 'admin';

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
                  <button class="btn btn-edit ${!isAdminUser ? 'disabled-btn' : ''}" data-equipo="${equipoId}" data-actividad="${actividadId}" data-puntos="${puntos}" ${!isAdminUser ? 'disabled title="Solo admins pueden editar"' : ''}>✏️</button>
                  <button class="btn btn-delete ${!isAdminUser ? 'disabled-btn' : ''}" data-equipo="${equipoId}" data-actividad="${actividadId}" ${!isAdminUser ? 'disabled title="Solo admins pueden eliminar"' : ''}>🗑️</button>
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
      if (!isAdminUser) return;
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
      if (!isAdminUser) return;
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

// Cargar Estadísticas y Gráficas
async function cargarEstadisticas() {
  try {
    // Obtener ranking
    const { data: ranking, error: rankingError } = await supabase
      .from('vw_ranking_equipos')
      .select('*')
      .order('total_puntos', { ascending: false });

    if (rankingError) throw rankingError;

    // Obtener puntajes por equipo y actividad
    const { data: puntajes, error: puntajesError } = await supabase
      .from('puntajes')
      .select('equipo_id, actividad_id, puntos, equipos(nombre, color), actividades(nombre)');

    if (puntajesError) throw puntajesError;

    // ===== GRÁFICA 1: RANKING DE EQUIPOS =====
    if (ranking && ranking.length > 0) {
      const ctxRanking = document.getElementById('chart-ranking').getContext('2d');
      
      if (chartRanking) chartRanking.destroy();
      
      chartRanking = new Chart(ctxRanking, {
        type: 'bar',
        data: {
          labels: ranking.map(r => escapeHtml(r.nombre)),
          datasets: [{
            label: 'Puntos Totales',
            data: ranking.map(r => r.total_puntos),
            backgroundColor: ranking.map(r => r.color || '#6366f1'),
            borderColor: ranking.map(r => r.color || '#6366f1'),
            borderWidth: 2,
            borderRadius: 5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          indexAxis: 'y',
          plugins: {
            legend: {
              display: true,
              labels: { color: '#cbd5e1', font: { size: 12 } }
            }
          },
          scales: {
            x: {
              ticks: { color: '#cbd5e1' },
              grid: { color: 'rgba(100, 116, 139, 0.1)' }
            },
            y: {
              ticks: { color: '#cbd5e1' },
              grid: { color: 'rgba(100, 116, 139, 0.1)' }
            }
          }
        }
      });
    }

    // ===== GRÁFICA 2: DESEMPEÑO POR ACTIVIDAD =====
    if (puntajes && puntajes.length > 0) {
      // Agrupar puntajes por actividad
      const puntajePorActividad = {};
      puntajes.forEach(p => {
        const actName = p.actividades.nombre;
        if (!puntajePorActividad[actName]) {
          puntajePorActividad[actName] = 0;
        }
        puntajePorActividad[actName] += p.puntos;
      });

      const ctxActividades = document.getElementById('chart-actividades').getContext('2d');
      
      if (chartActividades) chartActividades.destroy();
      
      chartActividades = new Chart(ctxActividades, {
        type: 'doughnut',
        data: {
          labels: Object.keys(puntajePorActividad),
          datasets: [{
            data: Object.values(puntajePorActividad),
            backgroundColor: [
              '#6366f1', '#0ea5e9', '#f59e0b', '#ef4444',
              '#10b981', '#ec4899', '#8b5cf6', '#06b6d4'
            ],
            borderColor: '#1e293b',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#cbd5e1', font: { size: 12 }, padding: 15 }
            }
          }
        }
      });
    }

    // ===== TABLA DE ESTADÍSTICAS =====
    if (ranking && ranking.length > 0) {
      let tableHtml = `
        <table class="stats-table">
          <thead>
            <tr>
              <th>Posición</th>
              <th>Equipo</th>
              <th>Puntos</th>
              <th>Actividades</th>
              <th>Promedio</th>
            </tr>
          </thead>
          <tbody>
      `;

      ranking.forEach((r, idx) => {
        const promedio = r.actividades_participadas > 0 
          ? (r.total_puntos / r.actividades_participadas).toFixed(2)
          : '0.00';
        
        tableHtml += `
          <tr>
            <td class="pos-${idx + 1}">
              ${idx + 1 === 1 ? '🥇' : idx + 1 === 2 ? '🥈' : idx + 1 === 3 ? '🥉' : idx + 1}
            </td>
            <td>
              <div style="display:flex;gap:8px;align-items:center;">
                ${r.color ? `<div style="width:12px;height:12px;background:${escapeHtml(r.color)};border-radius:3px;"></div>` : ''}
                <strong>${escapeHtml(r.nombre)}</strong>
              </div>
            </td>
            <td><strong>${r.total_puntos}</strong></td>
            <td>${r.actividades_participadas}</td>
            <td>${promedio} pts/act</td>
          </tr>
        `;
      });

      tableHtml += `
          </tbody>
        </table>
      `;

      statsTableContainer.innerHTML = tableHtml;
    }

  } catch (err) {
    console.error('Error cargando estadísticas:', err);
    statsTableContainer.innerHTML = `<p style="color: #ef4444;">Error cargando estadísticas: ${escapeHtml(err.message)}</p>`;
  }
}
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
btnRefreshStats.addEventListener('click', cargarEstadisticas);

// ==================== INIT ====================

async function init() {
  try {
    await cargarSelects();
    await cargarRanking();
    await cargarEquipos();
    await cargarActividades();
    await cargarPuntajes();
    await cargarStats();
    await cargarEstadisticas();
    // Actualizar acceso según el rol
    updateCRUDAccess();
    updateTabsVisibility();
  } catch (err) {
    console.error('Init error', err);
  }
}

// Verificar autenticación al cargar
checkAuthentication();

// Event listener para logout
const btnLogout = document.getElementById('btn-logout');
if (btnLogout) {
  btnLogout.addEventListener('click', () => {
    abrirModal('modal-confirmar-logout');
  });
}

// Event listener para confirmar logout
const btnConfirmarLogout = document.getElementById('btn-confirmar-logout');
if (btnConfirmarLogout) {
  btnConfirmarLogout.addEventListener('click', () => {
    cerrarModal('modal-confirmar-logout');
    logout();
  });
}

// Event listener para redimensionar gráficos en responsive
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (chartRanking) {
      chartRanking.resize();
    }
    if (chartActividades) {
      chartActividades.resize();
    }
  }, 250);
});
