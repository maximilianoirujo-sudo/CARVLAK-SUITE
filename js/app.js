/**
 * CARVLAK SUITE CENTRALIZADA - CORE CONTROLLER
 * Ecosistema integral: Showroom, Patio (<3m), CRM Leads, DetailVlak, Marketing
 * Desarrollado para Maximiliano Irujo, Jonathan Kaitazoff y Romina
 */

// ==============================================================================
// 1. ESTADO GLOBAL & PERSISTENCIA
// ==============================================================================
const APP_STATE = {
  activeTab: 'hub',
  activeOperator: localStorage.getItem('carvlak_operator') || 'Maximiliano Irujo',
  bossPhone: '59899267964', // Jonathan Kaitazoff
  costPerPanel: parseInt(localStorage.getItem('carvlak_panel_cost') || '90', 10),

  // Catálogos
  vehicles: window.CARVLAK_OFFICIAL_CATALOG || [],
  leads: JSON.parse(localStorage.getItem('carvlak_crm_leads') || 'null') || window.CARVLAK_CRM_LEADS || [],
  detailAppointments: JSON.parse(localStorage.getItem('carvlak_detail_turnos') || 'null') || (window.DETAILVLAK_DATA ? window.DETAILVLAK_DATA.initialTurnos : []),
  marketingData: window.MARKETING_DATA || {},

  // Estado del Peritaje de Patio activo
  patio: {
    hasStructuralDamage: false,
    structuralItems: [],
    structuralNotes: '',
    panels: {
      paragolpes_del: 'original',
      capo: 'original',
      parabrisas: 'original',
      techo: 'original',
      luneta: 'original',
      baul: 'original',
      paragolpes_tras: 'original',
      guardabarros_del_izq: 'original',
      puerta_del_izq: 'original',
      puerta_tras_izq: 'original',
      guardabarros_tras_izq: 'original',
      guardabarros_del_der: 'original',
      puerta_del_der: 'original',
      puerta_tras_der: 'original',
      guardabarros_tras_der: 'original'
    },
    panelLabels: {
      paragolpes_del: 'Paragolpes Delantero',
      capo: 'Capó',
      parabrisas: 'Parabrisas',
      techo: 'Techo',
      luneta: 'Luneta Trasera',
      baul: 'Baúl / Portón Trasero',
      paragolpes_tras: 'Paragolpes Trasero',
      guardabarros_del_izq: 'Guardabarros Del. Izq.',
      puerta_del_izq: 'Puerta Del. Izq.',
      puerta_tras_izq: 'Puerta Tras. Izq.',
      guardabarros_tras_izq: 'Guardabarros Tras. Izq.',
      guardabarros_del_der: 'Guardabarros Del. Der.',
      puerta_del_der: 'Puerta Del. Der.',
      puerta_tras_der: 'Puerta Tras. Der.',
      guardabarros_tras_der: 'Guardabarros Tras. Der.'
    },
    photos: {
      frente: null,
      trasera: null,
      lat_izq: null,
      lat_der: null,
      tablero: null,
      motor: null
    }
  },

  // Estado de DetailVlak
  detail: {
    selectedSize: 'mediano',
    selectedServices: ['interior', 'lavado_exterior'],
    discountPercent: 0,
    customAdjustment: 0
  }
};

// ==============================================================================
// 2. INICIALIZACIÓN
// ==============================================================================
document.addEventListener('DOMContentLoaded', () => {
  initOperatorSelector();
  initNavigation();
  initHubOverview();
  initShowroom();
  initPatioInspection();
  initCrmLeads();
  initDetailVlak();
  initMarketingDashboard();
  initPwaServiceWorker();

  // Navegación por hash si existe
  const hash = window.location.hash.replace('#', '');
  if (['hub', 'showroom', 'patio', 'crm', 'detailvlak', 'marketing'].includes(hash)) {
    switchTab(hash);
  } else {
    switchTab('hub');
  }
});

// Toast notification helper
function showToast(message, icon = '🚗') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast-msg glass-card px-4 py-3 rounded-xl border border-amber-500/30 flex items-center gap-3 text-sm text-slate-100 shadow-2xl';
  toast.innerHTML = `<span class="text-xl">${icon}</span><div class="font-medium">${message}</div>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// ==============================================================================
// 3. OPERADOR & ROLES
// ==============================================================================
function initOperatorSelector() {
  const select = document.getElementById('globalOperatorSelect');
  if (!select) return;

  select.value = APP_STATE.activeOperator;
  updateOperatorBadge(APP_STATE.activeOperator);

  select.addEventListener('change', (e) => {
    const val = e.target.value;
    APP_STATE.activeOperator = val;
    localStorage.setItem('carvlak_operator', val);
    updateOperatorBadge(val);
    showToast(`Operador activo: ${val}`, '👤');

    // Adaptar visibilidad en modo cliente
    if (val === 'Cliente (Modo Showroom)') {
      document.body.classList.add('mode-client');
      switchTab('showroom');
    } else {
      document.body.classList.remove('mode-client');
    }
  });
}

function updateOperatorBadge(name) {
  const badge = document.getElementById('operatorDisplayBadge');
  if (badge) {
    badge.textContent = name;
  }
}

// ==============================================================================
// 4. NAVEGACIÓN & PESTAÑAS
// ==============================================================================
function initNavigation() {
  const navButtons = document.querySelectorAll('[data-tab-target]');
  navButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = btn.getAttribute('data-tab-target');
      switchTab(target);
    });
  });
}

function switchTab(tabId) {
  APP_STATE.activeTab = tabId;
  window.location.hash = tabId;

  // Toggle view containers
  const tabs = ['hub', 'showroom', 'patio', 'crm', 'detailvlak', 'marketing'];
  tabs.forEach(t => {
    const el = document.getElementById(`view-${t}`);
    if (el) {
      if (t === tabId) {
        el.classList.remove('hidden');
        el.classList.add('animate-fade-in');
      } else {
        el.classList.add('hidden');
        el.classList.remove('animate-fade-in');
      }
    }
  });

  // Update Nav links (Desktop and Mobile)
  document.querySelectorAll('[data-tab-target]').forEach(btn => {
    const target = btn.getAttribute('data-tab-target');
    if (target === tabId) {
      btn.classList.add('bg-amber-500/15', 'text-amber-400', 'border-amber-500/40');
      btn.classList.remove('text-slate-400', 'border-transparent');
    } else {
      btn.classList.remove('bg-amber-500/15', 'text-amber-400', 'border-amber-500/40');
      btn.classList.add('text-slate-400', 'border-transparent');
    }
  });

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Module specific triggers
  if (tabId === 'marketing') {
    renderMarketingCharts();
  }
}

// ==============================================================================
// 5. HUB / COMMAND CENTER
// ==============================================================================
function initHubOverview() {
  // Update Hub Stats
  const stockCount = APP_STATE.vehicles.length;
  const leadsCount = APP_STATE.leads.length;
  const turnosCount = APP_STATE.detailAppointments.length;
  const totalValue = APP_STATE.vehicles.reduce((acc, v) => acc + (v.priceUsd || 0), 0);

  const elStock = document.getElementById('statHubStock');
  const elValue = document.getElementById('statHubValue');
  const elLeads = document.getElementById('statHubLeads');
  const elTurnos = document.getElementById('statHubTurnos');

  if (elStock) elStock.textContent = `${stockCount} unidades`;
  if (elValue) elValue.textContent = `USD $${totalValue.toLocaleString('es-UY')}`;
  if (elLeads) elLeads.textContent = `${leadsCount} tasaciones`;
  if (elTurnos) elTurnos.textContent = `${turnosCount} agendados`;

  // Render quick recent activity list
  renderHubActivity();
}

function renderHubActivity() {
  const container = document.getElementById('hubRecentActivity');
  if (!container) return;

  const activities = [
    { title: "BMW 320i M-Sport - Test Drive Solicitado", time: "Hace 15 min", badge: "Showroom", color: "text-amber-400 bg-amber-500/10" },
    { title: "Presupuesto DetailVlak enviado a Nicolás Varela", time: "Hace 42 min", badge: "DetailVlak", color: "text-cyan-400 bg-cyan-500/10" },
    { title: "Peritaje Fiat Palio 2008 enviado a Jonathan", time: "Hace 2 horas", badge: "Patio", color: "text-emerald-400 bg-emerald-500/10" },
    { title: "Reel Golf GTI superó las 14.000 reproducciones", time: "Hoy 10:15", badge: "Marketing", color: "text-rose-400 bg-rose-500/10" }
  ];

  container.innerHTML = activities.map(a => `
    <div class="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
      <div class="flex items-center gap-3">
        <span class="text-xs font-bold px-2 py-0.5 rounded-full ${a.color}">${a.badge}</span>
        <span class="text-sm font-medium text-slate-200">${a.title}</span>
      </div>
      <span class="text-xs text-slate-500">${a.time}</span>
    </div>
  `).join('');
}

// ==============================================================================
// 6. SHOWROOM & STOCK
// ==============================================================================
let showroomFilters = {
  category: 'all',
  brand: 'all',
  transmission: 'all',
  maxPrice: 100000,
  query: ''
};

function initShowroom() {
  renderBrandOptions();
  renderShowroomGrid();

  // Search input
  const searchInput = document.getElementById('showroomSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      showroomFilters.query = e.target.value.toLowerCase().trim();
      renderShowroomGrid();
    });
  }

  // Category buttons
  document.querySelectorAll('[data-showroom-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-showroom-cat]').forEach(b => {
        b.classList.remove('bg-amber-500', 'text-slate-950', 'font-bold');
        b.classList.add('bg-slate-800/80', 'text-slate-300');
      });
      btn.classList.add('bg-amber-500', 'text-slate-950', 'font-bold');
      btn.classList.remove('bg-slate-800/80', 'text-slate-300');

      showroomFilters.category = btn.getAttribute('data-showroom-cat');
      renderShowroomGrid();
    });
  });

  // Price range slider
  const priceSlider = document.getElementById('showroomPriceRange');
  const priceDisplay = document.getElementById('showroomPriceDisplay');
  if (priceSlider && priceDisplay) {
    priceSlider.addEventListener('input', (e) => {
      showroomFilters.maxPrice = parseInt(e.target.value, 10);
      priceDisplay.textContent = `Hasta USD $${showroomFilters.maxPrice.toLocaleString('es-UY')}`;
      renderShowroomGrid();
    });
  }
}

function renderBrandOptions() {
  const brandSelect = document.getElementById('showroomBrandSelect');
  if (!brandSelect) return;

  const brands = Array.from(new Set(APP_STATE.vehicles.map(v => v.brand))).sort();
  brandSelect.innerHTML = `<option value="all">Todas las Marcas (${brands.length})</option>` +
    brands.map(b => `<option value="${b}">${b}</option>`).join('');

  brandSelect.addEventListener('change', (e) => {
    showroomFilters.brand = e.target.value;
    renderShowroomGrid();
  });
}

function renderShowroomGrid() {
  const container = document.getElementById('showroomGrid');
  const countEl = document.getElementById('showroomMatchCount');
  if (!container) return;

  const filtered = APP_STATE.vehicles.filter(v => {
    // Category match
    if (showroomFilters.category !== 'all') {
      const cat = (v.category || '').toLowerCase();
      if (showroomFilters.category === 'usados' && !cat.includes('usado')) return false;
      if (showroomFilters.category === 'electricos' && !cat.includes('eléctrico') && !cat.includes('electrico')) return false;
      if (showroomFilters.category === 'motos' && !cat.includes('moto')) return false;
      if (showroomFilters.category === '4x4' && !cat.includes('4x4') && !cat.includes('pickup') && !cat.includes('suv')) return false;
    }

    // Brand match
    if (showroomFilters.brand !== 'all' && v.brand !== showroomFilters.brand) return false;

    // Price match
    if (v.priceUsd && v.priceUsd > showroomFilters.maxPrice) return false;

    // Query match
    if (showroomFilters.query) {
      const q = showroomFilters.query;
      const match = (v.brand || '').toLowerCase().includes(q) ||
                    (v.model || '').toLowerCase().includes(q) ||
                    (v.version || '').toLowerCase().includes(q) ||
                    (v.year || '').toString().includes(q);
      if (!match) return false;
    }

    return true;
  });

  if (countEl) countEl.textContent = `${filtered.length} unidades encontradas`;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center text-slate-500">
        <p class="text-4xl mb-3">🔍</p>
        <p class="text-lg font-bold text-slate-300">No encontramos vehículos con esos filtros</p>
        <p class="text-sm mt-1">Probá ampliando el rango de precio o buscando otra marca.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(v => {
    const mainImg = (v.images && v.images.length > 0) ? v.images[0] : 'https://placehold.co/600x400/1e293b/d4af37?text=CARVLAK';
    const cuotaAprox = Math.round((v.priceUsd * 0.70) / 48);

    return `
      <div class="glass-card rounded-2xl overflow-hidden flex flex-col group border border-slate-800/80 hover:border-amber-500/40">
        <!-- Imagen & Badges -->
        <div class="relative aspect-[16/10] overflow-hidden bg-slate-900">
          <img src="${mainImg}" alt="${v.brand} ${v.model}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" onerror="this.src='https://placehold.co/600x400/1e293b/d4af37?text=CARVLAK'">
          <div class="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-950/80 text-amber-400 border border-amber-500/30 backdrop-blur-md">
              ${v.year}
            </span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-950/80 text-slate-200 border border-slate-700 backdrop-blur-md">
              ${v.mileage ? v.mileage.toLocaleString('es-UY') + ' km' : '0 km'}
            </span>
          </div>
          <div class="absolute bottom-3 right-3">
            <span class="text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-600/90 text-white shadow-lg backdrop-blur-md">
              USD $${v.priceUsd ? v.priceUsd.toLocaleString('es-UY') : 'Consultar'}
            </span>
          </div>
        </div>

        <!-- Ficha Resumen -->
        <div class="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div class="text-xs font-semibold text-amber-500 uppercase tracking-wider">${v.brand}</div>
            <h3 class="text-base font-bold text-white group-hover:text-amber-400 transition-colors">${v.model}</h3>
            <p class="text-xs text-slate-400 line-clamp-1 mt-0.5">${v.version || ''}</p>
            
            <div class="flex items-center gap-3 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800/80">
              <span>⚙️ ${v.transmission || 'Manual'}</span>
              <span>⛽ ${v.fuel || 'Nafta'}</span>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
            <div>
              <div class="text-[10px] text-slate-400">Cuota estimada:</div>
              <div class="text-xs font-bold text-amber-400">desde USD $${cuotaAprox}/mes</div>
            </div>
            <button onclick="openVehicleDetailModal('${v.id}')" class="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md">
              Ver Ficha
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Modal Ficha Técnica & Financiación
function openVehicleDetailModal(vehicleId) {
  const v = APP_STATE.vehicles.find(item => item.id === vehicleId);
  if (!v) return;

  const modal = document.getElementById('vehicleDetailModal');
  const content = document.getElementById('vehicleDetailContent');
  if (!modal || !content) return;

  const imagesHtml = (v.images && v.images.length > 0)
    ? v.images.map(img => `<img src="${img}" class="h-48 sm:h-64 rounded-xl object-cover snap-center border border-slate-800" loading="lazy">`).join('')
    : `<img src="https://placehold.co/600x400/1e293b/d4af37?text=CARVLAK" class="h-48 sm:h-64 rounded-xl object-cover">`;

  const featuresHtml = (v.features || []).map(f => `
    <span class="text-xs bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
      <span class="text-emerald-400">✓</span> ${f}
    </span>
  `).join('');

  const waMsg = encodeURIComponent(`Hola CARVLAK! Me interesa el ${v.brand} ${v.model} ${v.year} (USD $${v.priceUsd}). ¿Sigue disponible para coordinar una visita?`);

  content.innerHTML = `
    <!-- Galería con scroll horizontal -->
    <div class="flex gap-3 overflow-x-auto pb-3 snap-x scrollbar-thin">
      ${imagesHtml}
    </div>

    <!-- Título y Precios -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pb-4 border-b border-slate-800">
      <div>
        <div class="text-xs font-bold text-amber-500 uppercase tracking-widest">${v.brand}</div>
        <h2 class="text-xl sm:text-2xl font-black text-white">${v.model} <span class="text-slate-400 font-normal">(${v.year})</span></h2>
        <p class="text-xs text-slate-400">${v.version || ''} • ${v.category || 'Usados Seleccionados'}</p>
      </div>
      <div class="text-left sm:text-right">
        <div class="text-xs text-slate-400">Precio Contado</div>
        <div class="text-2xl font-black text-amber-400">USD $${v.priceUsd ? v.priceUsd.toLocaleString('es-UY') : 'A consultar'}</div>
      </div>
    </div>

    <!-- Especificaciones rápidas -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4">
      <div class="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-center">
        <div class="text-[10px] text-slate-400 uppercase">Kilometraje</div>
        <div class="text-sm font-bold text-white">${v.mileage ? v.mileage.toLocaleString('es-UY') + ' km' : '0 km'}</div>
      </div>
      <div class="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-center">
        <div class="text-[10px] text-slate-400 uppercase">Transmisión</div>
        <div class="text-sm font-bold text-white">${v.transmission || 'Manual'}</div>
      </div>
      <div class="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-center">
        <div class="text-[10px] text-slate-400 uppercase">Combustible</div>
        <div class="text-sm font-bold text-white">${v.fuel || 'Nafta'}</div>
      </div>
      <div class="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-center">
        <div class="text-[10px] text-slate-400 uppercase">Patente Anual</div>
        <div class="text-sm font-bold text-white">${v.patente || 'Consultar'}</div>
      </div>
    </div>

    <!-- Equipamiento destacado -->
    <div class="my-4">
      <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Equipamiento & Confort</h4>
      <div class="flex flex-wrap gap-1.5">
        ${featuresHtml || '<span class="text-xs text-slate-500">Consulte por equipamiento detallado.</span>'}
      </div>
    </div>

    <!-- Simulador de Cuotas Bancarias Uruguay -->
    <div class="bg-slate-900/90 rounded-2xl p-4 border border-amber-500/20 my-4">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5">
          <span>🏦</span> Simulador Financiación Bancaria (Uruguay)
        </span>
        <span class="text-[10px] text-slate-400">Santander / BBVA / Itaú / Carvlak</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label class="block text-slate-400 mb-1">Entrega Inicial: <span id="simEntregaVal" class="text-white font-bold">30% (USD $${Math.round(v.priceUsd * 0.3)})</span></label>
          <input type="range" id="simEntregaRange" min="20" max="80" step="5" value="30" class="w-full accent-amber-500" oninput="updateModalLoanSimulator(${v.priceUsd})">
        </div>
        <div>
          <label class="block text-slate-400 mb-1">Plazo: <span id="simPlazoVal" class="text-white font-bold">48 Cuotas</span></label>
          <select id="simPlazoSelect" class="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white" onchange="updateModalLoanSimulator(${v.priceUsd})">
            <option value="12">12 meses</option>
            <option value="24">24 meses</option>
            <option value="36">36 meses</option>
            <option value="48" selected>48 meses</option>
            <option value="60">60 meses</option>
          </select>
        </div>
      </div>
      <div class="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
        <span class="text-xs text-slate-300">Cuota mensual estimada:</span>
        <span id="simCuotaResult" class="text-base font-black text-emerald-400">USD $${Math.round((v.priceUsd * 0.7) / 48 * 1.08)} / mes</span>
      </div>
    </div>

    <!-- Botones de Acción -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
      <a href="https://wa.me/59899267964?text=${waMsg}" target="_blank" class="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg transition-all">
        <span>💬</span> Consultar por WhatsApp
      </a>
      <button onclick="openReservationModal('${v.id}')" class="flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-lg transition-all">
        <span>🔒</span> Señar Unidad (USD $500)
      </button>
    </div>
  `;

  modal.classList.remove('hidden');
}

function closeVehicleDetailModal() {
  const modal = document.getElementById('vehicleDetailModal');
  if (modal) modal.classList.add('hidden');
}

function updateModalLoanSimulator(totalPrice) {
  const entregaRange = document.getElementById('simEntregaRange');
  const entregaVal = document.getElementById('simEntregaVal');
  const plazoSelect = document.getElementById('simPlazoSelect');
  const plazoVal = document.getElementById('simPlazoVal');
  const cuotaResult = document.getElementById('simCuotaResult');

  if (!entregaRange || !plazoSelect || !cuotaResult) return;

  const pct = parseInt(entregaRange.value, 10);
  const months = parseInt(plazoSelect.value, 10);
  const entregaMonto = Math.round(totalPrice * (pct / 100));
  const saldoAFinanciar = totalPrice - entregaMonto;

  // Interés bancario aprox 8.5% anual en UI / USD
  const factor = 1 + (0.085 * (months / 12));
  const cuota = Math.round((saldoAFinanciar * factor) / months);

  entregaVal.textContent = `${pct}% (USD $${entregaMonto.toLocaleString('es-UY')})`;
  plazoVal.textContent = `${months} Cuotas`;
  cuotaResult.textContent = `USD $${cuota.toLocaleString('es-UY')} / mes`;
}

// Modal de Seña
function openReservationModal(vehicleId) {
  const v = APP_STATE.vehicles.find(item => item.id === vehicleId);
  if (!v) return;

  const code = 'CRV-SEÑA-' + Math.floor(100000 + Math.random() * 900000);
  const waReserva = encodeURIComponent(`Hola CARVLAK! Quiero dejar la seña de USD 500 para bloquear el vehículo: ${v.brand} ${v.model} ${v.year} (Código de voucher: ${code}).`);

  alert(`🔒 Reserva de Unidad CARVLAK:\n\nVehículo: ${v.brand} ${v.model} (${v.year})\nMonto de Seña de Bloqueo: USD 500\nCódigo de Voucher: ${code}\n\nSe abrirá WhatsApp para coordinar la transferencia bancaria (BROU / Itaú / Santander).`);
  window.open(`https://wa.me/59899267964?text=${waReserva}`, '_blank');
}

// ==============================================================================
// 7. PERITAJE DE PATIO (< 3 MINUTOS)
// ==============================================================================
function initPatioInspection() {
  initSvgMap();

  // Reset button
  const resetBtn = document.getElementById('btnPatioReset');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetPatioInspection);
  }

  // Cost per panel input
  const costInput = document.getElementById('patioCostPerPanel');
  if (costInput) {
    costInput.value = APP_STATE.costPerPanel;
    costInput.addEventListener('input', (e) => {
      APP_STATE.costPerPanel = parseInt(e.target.value, 10) || 90;
      localStorage.setItem('carvlak_panel_cost', APP_STATE.costPerPanel);
      calculatePatioOffer();
    });
  }

  // Inputs change recalculate
  ['patioRefPrice', 'patioSuciveDebt', 'patioMechCost', 'patioTiresCost'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', calculatePatioOffer);
  });
}

function initSvgMap() {
  const svgMap = document.getElementById('carSvgMap');
  if (!svgMap) return;

  Object.keys(APP_STATE.patio.panels).forEach(panelId => {
    const el = document.getElementById(`part-${panelId}`);
    if (el) {
      el.addEventListener('click', () => {
        cyclePanelState(panelId);
      });
    }
  });
}

function cyclePanelState(panelId) {
  const cycle = ['original', 'repintada', 'masillada', 'danada'];
  const cur = APP_STATE.patio.panels[panelId] || 'original';
  const next = cycle[(cycle.indexOf(cur) + 1) % cycle.length];

  APP_STATE.patio.panels[panelId] = next;
  updatePanelUI(panelId, next);
  updatePanelsSummary();
  calculatePatioOffer();
}

function updatePanelUI(panelId, state) {
  const svgEl = document.getElementById(`part-${panelId}`);
  if (svgEl) {
    svgEl.classList.remove('state-original', 'state-repintada', 'state-masillada', 'state-danada');
    svgEl.classList.add(`state-${state}`);
  }

  const badgeEl = document.getElementById(`badge-${panelId}`);
  if (badgeEl) {
    const labels = {
      original: { text: 'Original', class: 'bg-slate-800 text-slate-400' },
      repintada: { text: 'Repintada', class: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' },
      masillada: { text: 'Masilla', class: 'bg-orange-500/20 text-orange-300 border border-orange-500/30' },
      danada: { text: 'Dañada', class: 'bg-rose-500/20 text-rose-300 border border-rose-500/30' }
    };
    const c = labels[state] || labels.original;
    badgeEl.textContent = c.text;
    badgeEl.className = `text-[10px] px-2 py-0.5 rounded-full font-bold ${c.class}`;
  }
}

function updatePanelsSummary() {
  const nonOriginal = Object.entries(APP_STATE.patio.panels).filter(([_, state]) => state !== 'original');
  const countBadge = document.getElementById('patioPanelsCountBadge');
  const detailText = document.getElementById('patioPanelsDetailText');

  if (countBadge) {
    countBadge.textContent = `${nonOriginal.length} piezas`;
  }

  if (detailText) {
    if (nonOriginal.length === 0) {
      detailText.textContent = 'Carrocería 100% original de fábrica sin paneles repintados.';
      detailText.className = 'text-xs text-emerald-400 font-medium';
    } else {
      const list = nonOriginal.map(([pId, st]) => `${APP_STATE.patio.panelLabels[pId] || pId} (${st.toUpperCase()})`);
      detailText.textContent = `Detalles: ${list.join(', ')}.`;
      detailText.className = 'text-xs text-amber-400 font-medium';
    }
  }
}

function setStructuralDamage(hasDamage) {
  APP_STATE.patio.hasStructuralDamage = hasDamage;
  const btnYes = document.getElementById('btnPatioStructYes');
  const btnNo = document.getElementById('btnPatioStructNo');
  const box = document.getElementById('patioStructuralBox');

  if (hasDamage) {
    if (btnYes) btnYes.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white shadow-lg';
    if (btnNo) btnNo.className = 'px-4 py-2 rounded-xl text-xs font-bold text-slate-400 bg-slate-900 hover:bg-slate-800';
    if (box) box.classList.remove('hidden');
    showToast('⚠️ Daño estructural activado', '🚨');
  } else {
    if (btnNo) btnNo.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-lg';
    if (btnYes) btnYes.className = 'px-4 py-2 rounded-xl text-xs font-bold text-slate-400 bg-slate-900 hover:bg-slate-800';
    if (box) box.classList.add('hidden');
  }

  calculatePatioOffer();
}

function calculatePatioOffer() {
  const refPrice = parseInt(document.getElementById('patioRefPrice')?.value, 10) || 0;
  const suciveDebt = parseInt(document.getElementById('patioSuciveDebt')?.value, 10) || 0;
  const mechCost = parseInt(document.getElementById('patioMechCost')?.value, 10) || 0;
  const tiresCost = parseInt(document.getElementById('patioTiresCost')?.value, 10) || 0;

  // Paneles que requieren reacondicionamiento (repintada, masillada, dañada)
  const damagedPanels = Object.values(APP_STATE.patio.panels).filter(s => s !== 'original').length;
  const paintCost = damagedPanels * APP_STATE.costPerPanel;

  // Penalización por daño estructural: 20% del valor o descarte
  const structPenalty = APP_STATE.patio.hasStructuralDamage ? Math.round(refPrice * 0.22) : 0;

  // Margen comercial automotora estándar: 15%
  const dealerMargin = Math.round(refPrice * 0.15);

  const totalDeductions = suciveDebt + paintCost + mechCost + tiresCost + structPenalty + dealerMargin;
  let finalOffer = refPrice - totalDeductions;
  if (finalOffer < 0) finalOffer = 0;

  // Update UI
  const elPaintCost = document.getElementById('patioCalcPaint');
  const elDeductions = document.getElementById('patioCalcDeductions');
  const elFinalOffer = document.getElementById('patioCalcFinalOffer');

  if (elPaintCost) elPaintCost.textContent = `USD $${paintCost} (${damagedPanels} paneles)`;
  if (elDeductions) elDeductions.textContent = `- USD $${totalDeductions.toLocaleString('es-UY')}`;
  if (elFinalOffer) elFinalOffer.textContent = `USD $${finalOffer.toLocaleString('es-UY')}`;
}

function resetPatioInspection() {
  Object.keys(APP_STATE.patio.panels).forEach(p => {
    APP_STATE.patio.panels[p] = 'original';
    updatePanelUI(p, 'original');
  });
  setStructuralDamage(false);
  updatePanelsSummary();
  calculatePatioOffer();
  showToast('Peritaje reseteado', '🔄');
}

// Enviar reporte ejecutivo por WhatsApp directo a Jonathan Kaitazoff
function sendPatioReportToJonathan() {
  const marca = document.getElementById('patioCarMarca')?.value || 'Vehículo';
  const modelo = document.getElementById('patioCarModelo')?.value || '';
  const ano = document.getElementById('patioCarAno')?.value || '';
  const km = document.getElementById('patioCarKm')?.value || '';
  const matricula = document.getElementById('patioCarMatricula')?.value || 'S/D';
  const cliente = document.getElementById('patioClientName')?.value || 'Cliente en patio';
  const telCliente = document.getElementById('patioClientPhone')?.value || 'S/D';
  const pretendido = document.getElementById('patioClientPretended')?.value || '0';

  const refPrice = document.getElementById('patioRefPrice')?.value || '0';
  const sucive = document.getElementById('patioSuciveDebt')?.value || '0';
  const oferta = document.getElementById('patioCalcFinalOffer')?.textContent || '0';

  const nonOriginal = Object.entries(APP_STATE.patio.panels).filter(([_, s]) => s !== 'original');
  const panelesTxt = nonOriginal.length === 0
    ? "✅ 100% Original de fábrica"
    : nonOriginal.map(([p, s]) => `${APP_STATE.patio.panelLabels[p]}: ${s.toUpperCase()}`).join(', ');

  const structTxt = APP_STATE.patio.hasStructuralDamage ? "🚨 ALERTA: TIENE DAÑO ESTRUCTURAL" : "✅ Sin daño estructural";

  const msg = 
`🚗 *REPORTE DE PERITAJE EN PATIO - CARVLAK*
👤 Inspector: ${APP_STATE.activeOperator}
📅 Fecha: ${new Date().toLocaleDateString('es-UY')}

📋 *VEHÍCULO:*
• Unidad: ${marca} ${modelo} (${ano})
• Kilometraje: ${km} km
• Matrícula: ${matricula}
• Cliente: ${cliente} (Tel: ${telCliente})
• Pretendido por cliente: USD $${pretendido}

🎨 *ESTADO DE CARROCERÍA:*
• ${panelesTxt}
• ${structTxt}

💰 *NÚMEROS Y OFERTA SUGERIDA:*
• Referencia de mercado: USD $${refPrice}
• Deuda SUCIVE / Multas: USD $${sucive}
• *OFERTA EN MANO SUGERIDA: ${oferta}*

¿Le damos para adelante con este número, Jonathan?`;

  const url = `https://wa.me/${APP_STATE.bossPhone}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

// ==============================================================================
// 8. CRM DE TASACIONES & LEADS
// ==============================================================================
let crmFilters = {
  priority: 'all',
  query: ''
};

function initCrmLeads() {
  renderCrmLeads();

  const searchInput = document.getElementById('crmSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      crmFilters.query = e.target.value.toLowerCase().trim();
      renderCrmLeads();
    });
  }

  document.querySelectorAll('[data-crm-priority]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-crm-priority]').forEach(b => {
        b.classList.remove('bg-amber-500', 'text-slate-950', 'font-bold');
        b.classList.add('bg-slate-800', 'text-slate-300');
      });
      btn.classList.add('bg-amber-500', 'text-slate-950', 'font-bold');
      btn.classList.remove('bg-slate-800', 'text-slate-300');

      crmFilters.priority = btn.getAttribute('data-crm-priority');
      renderCrmLeads();
    });
  });
}

function renderCrmLeads() {
  const container = document.getElementById('crmLeadsContainer');
  const countEl = document.getElementById('crmLeadsCount');
  if (!container) return;

  const filtered = APP_STATE.leads.filter(lead => {
    if (crmFilters.priority === 'con_fotos' && (!lead.photos || lead.photos.length === 0)) return false;
    if (crmFilters.priority === 'tasado' && lead.estado !== 'TASADO') return false;

    if (crmFilters.query) {
      const q = crmFilters.query;
      const str = `${lead.nombre} ${lead.marca} ${lead.modelo} ${lead.whatsapp}`.toLowerCase();
      if (!str.includes(q)) return false;
    }
    return true;
  });

  if (countEl) countEl.textContent = `${filtered.length} prospectos`;

  container.innerHTML = filtered.slice(0, 40).map(lead => {
    const photosCount = lead.photos ? lead.photos.length : 0;
    const thumb = photosCount > 0 ? lead.photos[0].thumbnail : null;

    return `
      <div class="glass-card p-4 rounded-2xl border border-slate-800/90 flex flex-col justify-between hover:border-amber-500/30">
        <div>
          <!-- Header Lead -->
          <div class="flex items-start justify-between gap-2">
            <div>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                ${lead.id || 'LEAD'}
              </span>
              <h3 class="text-base font-bold text-white mt-1">${lead.marca} ${lead.modelo}</h3>
              <p class="text-xs text-slate-400">Año ${lead.ano} • ${lead.km ? parseInt(lead.km).toLocaleString('es-UY') + ' km' : 'Sin km'}</p>
            </div>
            <div class="text-right">
              <div class="text-xs text-slate-400">Tasación Estimada</div>
              <div class="text-base font-black text-emerald-400">USD $${lead.tasacion ? lead.tasacion.toLocaleString('es-UY') : 'Por cotizar'}</div>
            </div>
          </div>

          <!-- Comentario del Cliente -->
          <div class="my-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 italic line-clamp-2">
            "${lead.comentario || 'Sin comentarios adicionales.'}"
          </div>

          <!-- Tags y Papeles -->
          <div class="flex flex-wrap items-center gap-1.5 mb-3">
            <span class="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md">📄 ${lead.papeles || 'Títulos a revisar'}</span>
            ${photosCount > 0 ? `<span class="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-md font-bold">📸 ${photosCount} fotos</span>` : ''}
          </div>
        </div>

        <!-- Footer y Acciones -->
        <div class="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
          <div class="text-xs font-semibold text-slate-400">
            👤 ${lead.nombre || 'Particular'}
          </div>
          <div class="flex items-center gap-2">
            ${photosCount > 0 ? `<button onclick="viewLeadPhotos('${lead.id}')" class="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-bold">Fotos</button>` : ''}
            <button onclick="openLeadWhatsAppModal('${lead.id}')" class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-1">
              <span>💬</span> WhatsApp
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function viewLeadPhotos(leadId) {
  const lead = APP_STATE.leads.find(l => l.id === leadId);
  if (!lead || !lead.photos || lead.photos.length === 0) return;

  const urls = lead.photos.map(p => p.viewUrl || p.thumbnail).join('\n');
  window.open(lead.photos[0].viewUrl || lead.photos[0].thumbnail, '_blank');
}

function openLeadWhatsAppModal(leadId) {
  const lead = APP_STATE.leads.find(l => l.id === leadId);
  if (!lead) return;

  const phone = (lead.whatsapp || '').replace(/[^0-9]/g, '');
  const tasacion = lead.tasacion ? `USD $${lead.tasacion.toLocaleString('es-UY')}` : 'a coordinar';

  const template = `¡Hola ${lead.nombre || ''}! Te escribimos de CARVLAK Automotores 🚗\n\nRecibimos la solicitud de tasación de tu ${lead.marca} ${lead.modelo} (${lead.ano}).\n\nNuestra propuesta preliminar de compra directa o permuta se ubica en el entorno de *${tasacion}* (sujeto a inspección visual en nuestro showroom).\n\n¿Te gustaría pasar hoy o mañana por el salón en Av. Giannattasio para revisarlo y cerrar los números? ¡Quedamos a las órdenes!`;

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(template)}`;
  window.open(url, '_blank');
}

// ==============================================================================
// 9. DETAILVLAK SUITE (PRESUPUESTOS & TURNOS)
// ==============================================================================
function initDetailVlak() {
  renderDetailTariffs();
  renderDetailTurnosList();
  calculateDetailTotal();

  // Size buttons
  document.querySelectorAll('[data-detail-size]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-detail-size]').forEach(b => {
        b.classList.remove('bg-amber-500', 'text-slate-950', 'font-bold');
        b.classList.add('bg-slate-800', 'text-slate-300');
      });
      btn.classList.add('bg-amber-500', 'text-slate-950', 'font-bold');
      btn.classList.remove('bg-slate-800', 'text-slate-300');

      APP_STATE.detail.selectedSize = btn.getAttribute('data-detail-size');
      renderDetailTariffs();
      calculateDetailTotal();
    });
  });

  // Combo quick buttons
  document.querySelectorAll('[data-detail-combo]').forEach(btn => {
    btn.addEventListener('click', () => {
      const comboId = btn.getAttribute('data-detail-combo');
      applyDetailCombo(comboId);
    });
  });
}

function renderDetailTariffs() {
  const container = document.getElementById('detailTariffsList');
  if (!container || !window.DETAILVLAK_DATA) return;

  const size = APP_STATE.detail.selectedSize;
  const tariffs = window.DETAILVLAK_DATA.tariffs;

  container.innerHTML = tariffs.map(t => {
    const isChecked = APP_STATE.detail.selectedServices.includes(t.id);
    const price = t.prices[size] || 0;

    return `
      <label class="glass-card p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${isChecked ? 'border-amber-500/50 bg-amber-500/10' : 'border-slate-800 hover:border-slate-700'}">
        <div class="flex items-center gap-3">
          <input type="checkbox" value="${t.id}" ${isChecked ? 'checked' : ''} onchange="toggleDetailService('${t.id}')" class="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-0">
          <div>
            <div class="text-sm font-bold text-white">${t.shortName}</div>
            <div class="text-[11px] text-slate-400 line-clamp-1">${t.description}</div>
          </div>
        </div>
        <div class="text-right">
          <div class="text-sm font-black text-amber-400">$U ${price.toLocaleString('es-UY')}</div>
          <div class="text-[10px] text-slate-500">~${t.durationHours} hs</div>
        </div>
      </label>
    `;
  }).join('');
}

function toggleDetailService(serviceId) {
  const idx = APP_STATE.detail.selectedServices.indexOf(serviceId);
  if (idx >= 0) {
    APP_STATE.detail.selectedServices.splice(idx, 1);
  } else {
    APP_STATE.detail.selectedServices.push(serviceId);
  }
  calculateDetailTotal();
}

function applyDetailCombo(comboId) {
  const combo = window.DETAILVLAK_DATA.combos.find(c => c.id === comboId);
  if (!combo) return;

  APP_STATE.detail.selectedServices = [...combo.services];
  APP_STATE.detail.discountPercent = combo.discountPercent;
  renderDetailTariffs();
  calculateDetailTotal();
  showToast(`Combo aplicado: ${combo.name}`, '✨');
}

function calculateDetailTotal() {
  const size = APP_STATE.detail.selectedSize;
  const tariffs = window.DETAILVLAK_DATA.tariffs;

  let subtotal = 0;
  APP_STATE.detail.selectedServices.forEach(sId => {
    const t = tariffs.find(item => item.id === sId);
    if (t && t.prices[size]) {
      subtotal += t.prices[size];
    }
  });

  const discountAmount = Math.round(subtotal * (APP_STATE.detail.discountPercent / 100));
  const finalTotal = subtotal - discountAmount;

  const elSubtotal = document.getElementById('detailSubtotal');
  const elDiscount = document.getElementById('detailDiscount');
  const elFinal = document.getElementById('detailFinalTotal');

  if (elSubtotal) elSubtotal.textContent = `$U ${subtotal.toLocaleString('es-UY')}`;
  if (elDiscount) elDiscount.textContent = `-$U ${discountAmount.toLocaleString('es-UY')} (${APP_STATE.detail.discountPercent}%)`;
  if (elFinal) elFinal.textContent = `$U ${finalTotal.toLocaleString('es-UY')}`;
}

function renderDetailTurnosList() {
  const container = document.getElementById('detailTurnosContainer');
  if (!container) return;

  container.innerHTML = APP_STATE.detailAppointments.map(t => `
    <div class="glass-card p-3 rounded-xl border border-slate-800 flex items-center justify-between">
      <div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-white">${t.customerName}</span>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${t.status === 'AGENDADO' ? 'bg-amber-500/20 text-amber-300' : t.status === 'FINALIZADO' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-300'}">
            ${t.status}
          </span>
        </div>
        <p class="text-xs text-slate-400 mt-0.5">${t.vehicle} • ${t.date} (${t.time} hs)</p>
      </div>
      <div class="text-right">
        <div class="text-xs font-bold text-amber-400">$U ${t.totalAmount.toLocaleString('es-UY')}</div>
        <div class="text-[10px] text-slate-500">${t.operator}</div>
      </div>
    </div>
  `).join('');
}

function sendDetailVlakWhatsAppQuote() {
  const clientName = document.getElementById('detailClientName')?.value || 'Estimado cliente';
  const clientPhone = (document.getElementById('detailClientPhone')?.value || '').replace(/[^0-9]/g, '');
  const vehicle = document.getElementById('detailClientVehicle')?.value || 'su vehículo';

  const tariffs = window.DETAILVLAK_DATA.tariffs;
  const size = APP_STATE.detail.selectedSize;

  const servicesLines = APP_STATE.detail.selectedServices.map(sId => {
    const t = tariffs.find(item => item.id === sId);
    return t ? `• *${t.shortName}*: $U ${t.prices[size].toLocaleString('es-UY')}` : '';
  }).filter(Boolean).join('\n');

  const total = document.getElementById('detailFinalTotal')?.textContent || '$U 0';
  const operatorName = APP_STATE.activeOperator.includes('Romina') ? 'Romina' : 'Maximiliano';

  const msg = 
`¡Hola ${clientName}! Te escribimos de *DetailVlak* 🚗✨
(Av. Giannattasio, Shangrilá)

Te pasamos el presupuesto detallado para tu *${vehicle}*:

${servicesLines}

💰 *TOTAL FINAL:* ${total}
⏱️ Tiempo estimado en taller: 1 jornada completa.
🛡️ Garantía técnica con productos de primera línea.

¿Te gustaría coordinar el turno para esta semana?
¡Quedamos a las órdenes!

Atte. *${operatorName}* — DetailVlak`;

  const url = `https://wa.me/${clientPhone || '59899123456'}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

// ==============================================================================
// 10. MARKETING & INSTAGRAM DASHBOARD
// ==============================================================================
let chartViewsInstance = null;

function initMarketingDashboard() {
  const m = APP_STATE.marketingData;
  if (!m || !m.summary) return;

  const elViews = document.getElementById('mktStatViews');
  const elReach = document.getElementById('mktStatReach');
  const elLikes = document.getElementById('mktStatLikes');
  const elLeads = document.getElementById('mktStatLeads');

  if (elViews) elViews.textContent = m.summary.totalViews.toLocaleString('es-UY');
  if (elReach) elReach.textContent = m.summary.totalReach.toLocaleString('es-UY');
  if (elLikes) elLikes.textContent = m.summary.totalLikes.toLocaleString('es-UY');
  if (elLeads) elLeads.textContent = m.summary.totalLeads.toLocaleString('es-UY');

  renderReelsTable();
}

function renderReelsTable() {
  const container = document.getElementById('mktReelsTableBody');
  if (!container || !APP_STATE.marketingData.reels) return;

  container.innerHTML = APP_STATE.marketingData.reels.map(r => `
    <tr class="border-b border-slate-800/80 hover:bg-slate-900/40">
      <td class="py-3 px-4 font-medium text-white">${r.title}</td>
      <td class="py-3 px-4 text-xs text-slate-400">${r.category}</td>
      <td class="py-3 px-4 font-bold text-amber-400">${r.views.toLocaleString('es-UY')}</td>
      <td class="py-3 px-4 font-bold text-emerald-400">${r.leads} leads</td>
      <td class="py-3 px-4 text-xs text-slate-400">${r.date}</td>
    </tr>
  `).join('');
}

function renderMarketingCharts() {
  const canvas = document.getElementById('mktChartViews');
  if (!canvas || !window.Chart || !APP_STATE.marketingData.reels) return;

  if (chartViewsInstance) {
    chartViewsInstance.destroy();
  }

  const reels = [...APP_STATE.marketingData.reels].reverse();
  const labels = reels.map(r => r.title.substring(0, 18) + '...');
  const viewsData = reels.map(r => r.views);
  const leadsData = reels.map(r => r.leads * 400); // escalado para gráfico dual

  chartViewsInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Reproducciones',
          data: viewsData,
          backgroundColor: 'rgba(245, 158, 11, 0.75)',
          borderRadius: 8
        },
        {
          label: 'Consultas / Leads (x400)',
          data: leadsData,
          backgroundColor: 'rgba(16, 185, 129, 0.85)',
          borderRadius: 8
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94A3B8', font: { family: 'Plus Jakarta Sans' } } }
      },
      scales: {
        x: { ticks: { color: '#64748B' }, grid: { display: false } },
        y: { ticks: { color: '#64748B' }, grid: { color: 'rgba(255,255,255,0.05)' } }
      }
    }
  });
}

// ==============================================================================
// 11. PWA & SERVICE WORKER
// ==============================================================================
function initPwaServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(() => {
      console.log('CARVLAK Suite Service Worker activo.');
    }).catch(err => {
      console.log('Service Worker no registrado:', err);
    });
  }
}
