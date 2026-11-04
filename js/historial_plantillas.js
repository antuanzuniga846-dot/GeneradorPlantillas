// ==========================================
// MÓDULO: HISTORIAL DE PLANTILLAS
// ==========================================

const TAMANO_PAGINA_HISTORIAL = 25;
let _historialOffset = 0;
let _hayMasHistorialSupabase = true;
let _cargandoMasHistorial = false;
let _historialLimiteRender = TAMANO_PAGINA_HISTORIAL;
let _scrollHistorialIniciado = false;
let _tickingScrollHistorial = false;
let _historialRangoActivo = "todo";
let _subVistaHistorial = "tabla";
let _timerBusquedaSupabase = null;
let _buscandoEnSupabase = false;
let _metricasRangoActivo = "hoy";

let listaHistorialPlantillas = (typeof obtenerLocalStorageSeguro === "function") 
  ? obtenerLocalStorageSeguro(STORAGE_KEY_HISTORIAL_PLANTILLAS, []) 
  : [];

let canalRealtimeHistorial = null;

function guardarHistorialLocalmente() {
  if (typeof guardarLocalStorageSeguro === "function") {
    guardarLocalStorageSeguro(STORAGE_KEY_HISTORIAL_PLANTILLAS, listaHistorialPlantillas);
  } else {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORIAL_PLANTILLAS, JSON.stringify(listaHistorialPlantillas));
    } catch (e) {}
  }
}

// ==========================================
// FORMATEADOR INTELIGENTE DE DETALLES
// ==========================================
function formatearDetalleHistorial(str) {
  if (!str || str === "-") return "-";
  let s = String(str).trim();
  if (!s || s === "-") return "-";

  const mapaDirecto = {
    "monto fuera de rango": "Monto Fuera de Rango",
    "factura menor a un ano": "Factura Menor a un Año",
    "factura menor a un año": "Factura Menor a un Año",
    "no coincide": "No Coincide",
    "sin informacion": "Sin Información",
    "sin información": "Sin Información",
    "sin documento": "Sin Documento",
    "condonacion": "Condonación",
    "condonación": "Condonación",
    "condonacion rec": "Condonación REC",
    "condonación rec": "Condonación REC",
    "reversion": "Reversión",
    "reversión": "Reversión",
    "servicio suspendido": "Servicio Suspendido",
    "cambio de razon social": "Cambio de Razón Social",
    "cambio de razón social": "Cambio de Razón Social",
    "reclamo en tramite": "Reclamo en Trámite",
    "reclamo en trámite": "Reclamo en Trámite",
    "antiguedad": "Antigüedad",
    "antigüedad": "Antigüedad",
    "carta de descargo": "Carta de Descargo",
    "null": "NULL (No se puede realizar limpieza)",
    "null (no se puede realizar limpieza)": "NULL (No se puede realizar limpieza)"
  };

  const keyMinus = s.toLowerCase();
  if (mapaDirecto[keyMinus]) {
    return mapaDirecto[keyMinus];
  }

  // Si contiene desglose de conceptos (ej: "FP: ₡..., CP: ₡...")
  if (s.includes("FP:") || s.includes("CP:") || s.includes("WO:")) {
    return s;
  }

  // Capitalización estándar limpia (Title Case)
  const palabrasMenores = new Set(["de", "a", "en", "por", "un", "una", "y", "o", "el", "la", "los", "las", "con", "del", "al"]);
  const siglas = new Set(["REC", "NC", "DTS", "WO", "FP", "CP", "ID", "LS", "NULL"]);

  return s.split(/\s+/).map((palabra, idx) => {
    const limpia = palabra.toUpperCase();
    if (siglas.has(limpia)) return limpia;
    const min = palabra.toLowerCase();
    if (idx > 0 && palabrasMenores.has(min)) return min;
    return min.charAt(0).toUpperCase() + min.slice(1);
  }).join(" ");
}

// ==========================================
// REGISTRO DE PLANTILLAS EN HISTORIAL
// ==========================================
async function guardarEnHistorialPlantillas(datos) {
  try {
    const ahora = new Date();
    const nuevoId = "hp_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
    const marca = (typeof formatearFechaHoraEstandar === "function") 
      ? formatearFechaHoraEstandar(ahora) 
      : ahora.toLocaleString("es-CR");

    const agenteActual = (typeof usuarioLogueado !== "undefined" && usuarioLogueado) 
      ? (usuarioLogueado.usuario || usuarioLogueado.nombre || "Desconocido") 
      : "Desconocido";

    const registro = {
      id: nuevoId,
      marca_temporal: marca,
      gestion: String(datos.gestion || "").trim().toUpperCase(),
      dts: String(datos.dts || "").trim().toUpperCase(),
      cedula: String(datos.cedula || "").trim(),
      nombre: String(datos.nombre || "").trim().toUpperCase(),
      agente: agenteActual,
      plantilla: String(datos.plantilla || "").trim(),
      monto: String(datos.monto || "").trim(),
      condiciones: String(datos.condiciones || "").trim(),
      created_at: ahora.toISOString()
    };

    // Agregar a lista local
    listaHistorialPlantillas.unshift(registro);
    _historialOffset++;
    guardarHistorialLocalmente();

    // Guardar para recuperación rápida
    try {
      localStorage.setItem("ultimaGestionAgente_" + agenteActual, JSON.stringify(registro));
    } catch (e) {}

    // Actualizar vista si está activa
    if (typeof vistaActual !== "undefined" && vistaActual === "historial") {
      if (_subVistaHistorial === "tabla") {
        renderizarTablaHistorial();
      } else {
        actualizarMetricasHistorial();
      }
    }

    // Guardar en Supabase
    if (typeof supabaseClient !== "undefined" && supabaseClient) {
      try {
        const { error } = await supabaseClient.from("historial_plantillas").insert(registro);
        if (error) {
          console.warn("Aviso: No se pudo insertar en historial_plantillas de Supabase:", error.message);
        }
      } catch (err) {
        console.warn("Error en insert Supabase historial_plantillas:", err);
      }
    }

    if (typeof notificar === "function") {
      notificar("success", "Registrado en Historial", `Plantilla <strong>${registro.plantilla}</strong> (Gestión: ${registro.gestion}) registrada.`);
    }

    return true;
  } catch (err) {
    console.error("Error al guardar en historial de plantillas:", err);
    return false;
  }
}

// ==========================================
// CARGA Y SINCRONIZACIÓN CON SUPABASE
// ==========================================
async function cargarHistorialSupabase(reiniciar = true) {
  if (typeof supabaseClient === "undefined" || !supabaseClient) {
    renderizarTablaHistorial();
    return;
  }

  if (reiniciar) {
    _historialOffset = 0;
    _hayMasHistorialSupabase = true;
    _historialLimiteRender = TAMANO_PAGINA_HISTORIAL;
  }

  try {
    const { data, error } = await supabaseClient
      .from("historial_plantillas")
      .select("*")
      .order("created_at", { ascending: false })
      .range(0, TAMANO_PAGINA_HISTORIAL - 1);

    if (error) {
      console.warn("Aviso: Error cargando historial_plantillas de Supabase:", error.message);
      renderizarTablaHistorial();
      return;
    }

    if (Array.isArray(data)) {
      if (data.length < TAMANO_PAGINA_HISTORIAL) {
        _hayMasHistorialSupabase = false;
      }
      _historialOffset = data.length;
      listaHistorialPlantillas = [...data];
      guardarHistorialLocalmente();
    }
  } catch (err) {
    console.warn("Error en cargarHistorialSupabase:", err);
  } finally {
    if (_subVistaHistorial === "tabla") {
      renderizarTablaHistorial();
    } else {
      actualizarMetricasHistorial();
    }
    inicializarScrollHistorial();
  }
}

async function cargarMasHistorialSupabase() {
  if (_cargandoMasHistorial || !_hayMasHistorialSupabase) return;
  if (typeof supabaseClient === "undefined" || !supabaseClient) return;

  _cargandoMasHistorial = true;
  actualizarFilaScrollLoaderHistorial(true);

  try {
    const desde = _historialOffset;
    const hasta = desde + TAMANO_PAGINA_HISTORIAL - 1;

    const { data, error } = await supabaseClient
      .from("historial_plantillas")
      .select("*")
      .order("created_at", { ascending: false })
      .range(desde, hasta);

    if (error) {
      console.warn("Error al paginar historial en Supabase:", error.message);
      _cargandoMasHistorial = false;
      actualizarFilaScrollLoaderHistorial(false);
      return;
    }

    if (Array.isArray(data)) {
      if (data.length < TAMANO_PAGINA_HISTORIAL) {
        _hayMasHistorialSupabase = false;
      }
      _historialOffset += data.length;

      const mapaIds = new Set(listaHistorialPlantillas.map(d => d.id));
      const nuevos = data.filter(d => !mapaIds.has(d.id));
      listaHistorialPlantillas = [...listaHistorialPlantillas, ...nuevos];
      guardarHistorialLocalmente();
    }
  } catch (err) {
    console.warn("Excepción al paginar historial:", err);
  } finally {
    _cargandoMasHistorial = false;
    renderizarTablaHistorial();
  }
}

function cargarSiguienteLoteHistorial() {
  const filtrados = obtenerHistorialFiltrado();
  if (_historialLimiteRender < filtrados.length) {
    _historialLimiteRender += TAMANO_PAGINA_HISTORIAL;
    renderizarTablaHistorial();
  } else if (_hayMasHistorialSupabase && typeof supabaseClient !== "undefined" && supabaseClient && !_cargandoMasHistorial) {
    _historialLimiteRender += TAMANO_PAGINA_HISTORIAL;
    cargarMasHistorialSupabase();
  }
}

function inicializarScrollHistorial() {
  if (_scrollHistorialIniciado) return;
  const container = document.getElementById("contenedorTablaHistorial");
  if (!container) return;

  _scrollHistorialIniciado = true;
  container.addEventListener("scroll", () => {
    if (!_tickingScrollHistorial) {
      window.requestAnimationFrame(() => {
        if (container.scrollTop + container.clientHeight >= container.scrollHeight - 200) {
          cargarSiguienteLoteHistorial();
        }
        _tickingScrollHistorial = false;
      });
      _tickingScrollHistorial = true;
    }
  }, { passive: true });
}

function actualizarFilaScrollLoaderHistorial(cargando) {
  const fila = document.getElementById("historialScrollLoader");
  if (!fila) return;
  if (cargando) {
    fila.innerHTML = `<td colspan="9" style="text-align: center; padding: 14px 10px; color: var(--accent); font-weight: bold; background: rgba(0,0,0,0.18);">⏳ Cargando siguientes 25 registros desde la base de datos...</td>`;
  }
}

function suscribirRealtimeHistorial() {
  if (typeof supabaseClient === "undefined" || !supabaseClient) return;
  if (canalRealtimeHistorial) return;

  try {
    canalRealtimeHistorial = supabaseClient
      .channel("realtime_historial_plantillas")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "historial_plantillas" },
        payload => {
          if (payload.eventType === "INSERT" && payload.new) {
            const existe = listaHistorialPlantillas.some(r => r.id === payload.new.id);
            if (!existe) {
              listaHistorialPlantillas.unshift(payload.new);
              _historialOffset++;
              guardarHistorialLocalmente();
              if (typeof vistaActual !== "undefined" && vistaActual === "historial") {
                if (_subVistaHistorial === "tabla") {
                  renderizarTablaHistorial();
                } else {
                  actualizarMetricasHistorial();
                }
              }
            }
          } else if (payload.eventType === "DELETE" && payload.old) {
            listaHistorialPlantillas = listaHistorialPlantillas.filter(r => r.id !== payload.old.id);
            guardarHistorialLocalmente();
            if (typeof vistaActual !== "undefined" && vistaActual === "historial") {
              if (_subVistaHistorial === "tabla") {
                renderizarTablaHistorial();
              } else {
                actualizarMetricasHistorial();
              }
            }
          }
        }
      )
      .subscribe();
  } catch (err) {
    console.warn("Error suscribiendo realtime a historial_plantillas:", err);
  }
}

// ==========================================
// BÚSQUEDA DIRECTA EN BASE DE DATOS (SUPABASE)
// ==========================================
async function buscarEnBaseDeDatosHistorial(query) {
  const q = String(query || "").trim();
  if (!q || typeof supabaseClient === "undefined" || !supabaseClient) return;

  _buscandoEnSupabase = true;
  const lblContador = document.getElementById("historialContador");
  if (lblContador) {
    lblContador.innerHTML = `🔍 Buscando <strong>"${escapeHTML(q)}"</strong> en toda la base de datos...`;
  }

  try {
    const { data, error } = await supabaseClient
      .from("historial_plantillas")
      .select("*")
      .or(`gestion.ilike.%${q}%,cedula.ilike.%${q}%,dts.ilike.%${q}%,nombre.ilike.%${q}%,agente.ilike.%${q}%,condiciones.ilike.%${q}%`)
      .order("created_at", { ascending: false })
      .limit(60);

    if (!error && Array.isArray(data)) {
      const mapaIds = new Set(listaHistorialPlantillas.map(r => r.id));
      const nuevos = data.filter(d => !mapaIds.has(d.id));
      if (nuevos.length > 0) {
        listaHistorialPlantillas = [...nuevos, ...listaHistorialPlantillas];
      }
    }
  } catch (err) {
    console.warn("Error buscando en Supabase historial:", err);
  } finally {
    _buscandoEnSupabase = false;
    renderizarTablaHistorial();
  }
}

// ==========================================
// RENDERIZADO Y FILTROS DE TABLA HISTORIAL
// ==========================================
function setRangoRapidoHistorial(tipo, btn) {
  _historialRangoActivo = tipo;
  _historialLimiteRender = TAMANO_PAGINA_HISTORIAL;
  const hoy = new Date();
  const inpDesde = document.getElementById("historialFechaDesde");
  const inpHasta = document.getElementById("historialFechaHasta");

  document.querySelectorAll("#seccionHistorialTabla .btn-rango-stats").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");

  if (tipo === "hoy") {
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, "0");
    const dd = String(hoy.getDate()).padStart(2, "0");
    const fStr = `${yyyy}-${mm}-${dd}`;
    if (inpDesde) inpDesde.value = fStr;
    if (inpHasta) inpHasta.value = fStr;
  } else if (tipo === "mes") {
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, "0");
    const ultDia = new Date(yyyy, hoy.getMonth() + 1, 0).getDate();
    if (inpDesde) inpDesde.value = `${yyyy}-${mm}-01`;
    if (inpHasta) inpHasta.value = `${yyyy}-${mm}-${String(ultDia).padStart(2, "0")}`;
  } else {
    if (inpDesde) inpDesde.value = "";
    if (inpHasta) inpHasta.value = "";
  }

  filtrarHistorialPlantillas();
}

function filtrarHistorialPlantillas() {
  _historialLimiteRender = TAMANO_PAGINA_HISTORIAL;
  const q = (document.getElementById("filtroHistorial")?.value || "").trim();

  // Búsqueda en vivo en la base de datos completa si se ingresan 3 o más caracteres
  if (q.length >= 3 && typeof supabaseClient !== "undefined" && supabaseClient) {
    clearTimeout(_timerBusquedaSupabase);
    _timerBusquedaSupabase = setTimeout(() => {
      buscarEnBaseDeDatosHistorial(q);
    }, 380);
  }

  renderizarTablaHistorial();
}

function parsearFechaParaFiltro(str) {
  if (!str) return null;
  const s = String(str).trim();
  // Formato DD/MM/YYYY HH:MM:SS
  const partes = s.split(" ")[0].split("/");
  if (partes.length === 3) {
    const d = parseInt(partes[0], 10);
    const m = parseInt(partes[1], 10) - 1;
    const y = parseInt(partes[2], 10);
    return new Date(y, m, d);
  }
  // Formato ISO
  const dIso = new Date(s);
  return !isNaN(dIso.getTime()) ? dIso : null;
}

function obtenerBadgePlantilla(nombre) {
  let n = String(nombre || "").toUpperCase();
  if (n.includes("COINCIDE")) {
    return `<span class="pill-btn" style="background: rgba(255, 152, 0, 0.22); color: #ffb74d; border: 1px solid rgba(255, 152, 0, 0.45); font-weight: bold; padding: 4px 9px;">🚫 NO COINCIDE</span>`;
  }
  if (n.includes("REC")) {
    return `<span class="pill-btn" style="background: rgba(0, 188, 212, 0.22); color: #80deea; border: 1px solid rgba(0, 188, 212, 0.45); font-weight: bold; padding: 4px 9px;">LIMPIEZA REC</span>`;
  }
  if (n.includes("LIMPIEZA")) {
    return `<span class="pill-btn" style="background: rgba(0, 150, 136, 0.22); color: #80cbc4; border: 1px solid rgba(0, 150, 136, 0.45); font-weight: bold; padding: 4px 9px;">LIMPIEZA</span>`;
  }
  if (n.includes("NO PROCEDE")) {
    return `<span class="pill-btn" style="background: rgba(229, 57, 53, 0.25); color: #ff8a80; border: 1px solid rgba(229, 57, 53, 0.5); font-weight: bold; padding: 4px 9px;">⛔ NO PROCEDE</span>`;
  }
  if (n.includes("RECHAZO") || n.includes("CÉDULA") || n.includes("CEDULA") || n.includes("DOCUMENTO") || n.includes("CAPTURA") || n.includes("ESQUINAS") || n.includes("SPAM") || n.includes("CONTACTO") || n.includes("SIN")) {
    return `<span class="pill-btn" style="background: rgba(255, 152, 0, 0.22); color: #ffb74d; border: 1px solid rgba(255, 152, 0, 0.45); font-weight: bold; padding: 4px 9px;">🚫 ${escapeHTML(nombre)}</span>`;
  }
  if (n.includes("VISTO BUENO")) {
    return `<span class="pill-btn" style="background: rgba(46, 125, 50, 0.25); color: #81c784; border: 1px solid rgba(46, 125, 50, 0.5); font-weight: bold; padding: 4px 9px;">✅ ${escapeHTML(nombre)}</span>`;
  }
  if (n.includes("NC")) {
    return `<span class="pill-btn" style="background: rgba(33, 150, 243, 0.22); color: #90caf9; border: 1px solid rgba(33, 150, 243, 0.45); font-weight: bold; padding: 4px 9px;">📄 ${escapeHTML(nombre)}</span>`;
  }
  return `<span class="pill-btn" style="background: rgba(171, 71, 188, 0.22); color: #ce93d8; border: 1px solid rgba(171, 71, 188, 0.45); font-weight: bold; padding: 4px 9px;">📋 ${escapeHTML(nombre)}</span>`;
}

function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function obtenerHistorialFiltrado() {
  const txtBuscar = (document.getElementById("filtroHistorial")?.value || "").trim().toLowerCase();
  const filtroTipo = document.getElementById("historialFiltroTipo")?.value || "";
  const fDesdeStr = document.getElementById("historialFechaDesde")?.value || "";
  const fHastaStr = document.getElementById("historialFechaHasta")?.value || "";

  const fDesde = fDesdeStr ? new Date(fDesdeStr + "T00:00:00") : null;
  const fHasta = fHastaStr ? new Date(fHastaStr + "T23:59:59") : null;

  return (listaHistorialPlantillas || []).filter(r => {
    if (!r) return false;
    // Filtro texto
    if (txtBuscar) {
      const match = (r.gestion && r.gestion.toLowerCase().includes(txtBuscar)) ||
                    (r.cedula && r.cedula.toLowerCase().includes(txtBuscar)) ||
                    (r.dts && r.dts.toLowerCase().includes(txtBuscar)) ||
                    (r.agente && r.agente.toLowerCase().includes(txtBuscar)) ||
                    (r.plantilla && r.plantilla.toLowerCase().includes(txtBuscar)) ||
                    (r.condiciones && r.condiciones.toLowerCase().includes(txtBuscar)) ||
                    (r.monto && r.monto.toLowerCase().includes(txtBuscar));
      if (!match) return false;
    }

    // Filtro tipo
    if (filtroTipo) {
      const p = String(r.plantilla || "").toUpperCase();
      const c = String(r.condiciones || "").toUpperCase();
      if (filtroTipo === "LIMPIEZA" && (!p.includes("LIMPIEZA") || p.includes("REC") || c.includes("REC"))) return false;
      if (filtroTipo === "REC" && (!p.includes("REC") && !c.includes("REC"))) return false;
      if (filtroTipo === "NO PROCEDE" && !p.includes("NO PROCEDE")) return false;
      if (filtroTipo === "RECHAZOS" && (!p.includes("RECHAZO") && !p.includes("DOCUMENTO") && !p.includes("CÉDULA") && !p.includes("CEDULA") && !p.includes("CAPTURA") && !p.includes("ESQUINAS") && !p.includes("SPAM") && !p.includes("CONTACTO") && !p.includes("SIN"))) return false;
      if (filtroTipo === "VISTO BUENO" && !p.includes("VISTO BUENO")) return false;
    }

    // Filtro fechas
    if (fDesde || fHasta) {
      const fItem = parsearFechaParaFiltro(r.marca_temporal || r.created_at);
      if (fItem) {
        if (fDesde && fItem < fDesde) return false;
        if (fHasta && fItem > fHasta) return false;
      }
    }

    return true;
  });
}

function renderizarTablaHistorial() {
  const tbody = document.getElementById("tablaHistorialBody");
  if (!tbody) return;

  const filtrados = obtenerHistorialFiltrado();
  const visibles = filtrados.slice(0, _historialLimiteRender);

  // Contadores
  const lblContador = document.getElementById("historialContador");
  if (lblContador) {
    const sufijoMas = (_hayMasHistorialSupabase || _historialLimiteRender < filtrados.length) 
      ? ` <span style="font-size: 0.8rem; opacity: 0.75;">(desliza para cargar más)</span>` 
      : "";
    lblContador.innerHTML = `Mostrando: <strong>${visibles.length}</strong> de ${filtrados.length} registros cargados${sufijoMas}`;
  }

  if (filtrados.length === 0) {
    const txtBuscar = (document.getElementById("filtroHistorial")?.value || "").trim();
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 40px 20px; color: var(--text-muted); font-size: 0.95rem;">
          <div style="font-size: 2.2rem; margin-bottom: 8px;">📋</div>
          ${txtBuscar 
            ? `No se encontraron trámites con el criterio "<strong>${escapeHTML(txtBuscar)}</strong>" en el historial ni en la base de datos.` 
            : `No se encontraron plantillas registradas con los filtros aplicados.`}
        </td>
      </tr>
    `;
    return;
  }

  const puedeEditar = (typeof esEditor === "function" && esEditor()) || (typeof usuarioLogueado !== "undefined" && usuarioLogueado && usuarioLogueado.rol === "editor");
  const btnVaciar = document.getElementById("btnHistorialBorrarTodo"); if (btnVaciar) btnVaciar.style.display = puedeEditar ? "inline-block" : "none";

  const filasHTML = visibles.map(r => {
    const montoDisplay = r.monto && r.monto !== "-" 
      ? `<strong style="color: var(--accent);">${escapeHTML(r.monto)}</strong>` 
      : `<span style="color: var(--text-muted);">-</span>`;

    const formatoCond = formatearDetalleHistorial(r.condiciones);
    const condicionesDisplay = formatoCond !== "-"
      ? `<span style="font-size: 0.82rem; line-height: 1.35; display: inline-block;">${escapeHTML(formatoCond)}</span>` 
      : `<span style="color: var(--text-muted);">-</span>`;

    const botonEliminar = puedeEditar ? `
      <button type="button" class="btn-sheet-del" onclick="eliminarRegistroHistorial('${r.id}')" title="Eliminar registro del historial">🗑️</button>
    ` : "";

    const rawMonto = r.monto && r.monto !== "-" ? r.monto : "-";
    const rawCond = formatoCond;
    const rawDts = r.dts || "-";
    const rawAgente = r.agente || "-";
    const rawGestion = r.gestion || "-";
    const rawCedula = r.cedula || "-";
    const rawPlant = r.plantilla ? (r.plantilla.includes("COINCIDE") ? "NO COINCIDE" : r.plantilla) : "-";

    return `
      <tr>
        <td style="font-family: monospace; font-size: 0.82rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-secondary);" title="${escapeHTML(r.marca_temporal || "-")}">${escapeHTML(r.marca_temporal || "-")}</td>
        <td style="text-align: center; font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text-primary);" title="Gestión: ${escapeHTML(rawGestion)}"><span style="background: rgba(255,255,255,0.06); padding: 2px 7px; border-radius: 4px;">${escapeHTML(rawGestion)}</span></td>
        <td style="font-weight: 600; color: #64b5f6; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="DTS: ${escapeHTML(rawDts)}">${escapeHTML(rawDts)}</td>
        <td class="td-cedula" style="text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          <span class="cedula-copy-pill" onclick="copiarCedulaHistorial('${escapeHTML(rawCedula)}')" title="Cédula: ${escapeHTML(rawCedula)} (Clic para copiar)">${escapeHTML(rawCedula)}</span>
        </td>
        <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="Agente: ${escapeHTML(rawAgente)}">
          <span style="display: inline-flex; align-items: center; gap: 5px; font-size: 0.82rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            <span>👤</span> ${escapeHTML(rawAgente)}
          </span>
        </td>
        <td style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="Plantilla: ${escapeHTML(rawPlant)}">${obtenerBadgePlantilla(r.plantilla)}</td>
        <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHTML(rawCond)}">${condicionesDisplay}</td>
        <td style="text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="Monto: ${escapeHTML(rawMonto)}">${montoDisplay}</td>
        <td style="text-align: center; white-space: nowrap;">
          <div style="display: flex; gap: 4px; justify-content: center; align-items: center;">
            <button type="button" class="btn-sheet-action" onclick="copiarDetalleHistorial('${r.id}')" title="Copiar resumen al portapapeles">📋</button>
            ${botonEliminar}
          </div>
        </td>
      </tr>
    `;
  }).join("");

  let filaLoader = "";
  if (_historialLimiteRender < filtrados.length) {
    const pendientes = filtrados.length - _historialLimiteRender;
    filaLoader = `
      <tr id="historialScrollLoader">
        <td colspan="9" style="text-align: center; padding: 14px 10px; background: rgba(255,255,255,0.02); color: var(--text-muted); font-size: 0.84rem; cursor: pointer;" onclick="cargarSiguienteLoteHistorial()">
          📜 Mostrando ${visibles.length} de ${filtrados.length}. Desliza o toca aquí para mostrar ${Math.min(TAMANO_PAGINA_HISTORIAL, pendientes)} más...
        </td>
      </tr>
    `;
  } else if (_hayMasHistorialSupabase && typeof supabaseClient !== "undefined" && supabaseClient) {
    filaLoader = `
      <tr id="historialScrollLoader">
        <td colspan="9" style="text-align: center; padding: 14px 10px; background: rgba(255,255,255,0.02); color: var(--text-muted); font-size: 0.84rem; cursor: pointer;" onclick="cargarSiguienteLoteHistorial()">
          ${_cargandoMasHistorial ? '⏳ Cargando siguientes 25 registros desde la base de datos...' : '📜 Desliza o toca aquí para cargar más registros anteriores...'}
        </td>
      </tr>
    `;
  } else if (filtrados.length > TAMANO_PAGINA_HISTORIAL) {
    filaLoader = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 12px; font-size: 0.82rem; color: var(--text-muted); background: rgba(0,0,0,0.1);">
          ✅ Se cargaron todos los registros (${filtrados.length} en total).
        </td>
      </tr>
    `;
  }

  tbody.innerHTML = filasHTML + filaLoader;
}

// ==========================================
// CONTROL DE SUB-VISTAS: TABLA vs MÉTRICAS
// ==========================================
function cambiarSubVistaHistorial(subVista) {
  _subVistaHistorial = subVista;
  const btnTabla = document.getElementById("btnSubnavTabla");
  const btnMetricas = document.getElementById("btnSubnavMetricas");
  const secTabla = document.getElementById("seccionHistorialTabla");
  const secMetricas = document.getElementById("seccionHistorialMetricas");

  if (subVista === "tabla") {
    if (btnTabla) btnTabla.classList.add("active");
    if (btnMetricas) btnMetricas.classList.remove("active");
    if (secTabla) secTabla.style.display = "block";
    if (secMetricas) secMetricas.style.display = "none";
    renderizarTablaHistorial();
  } else if (subVista === "metricas") {
    if (btnTabla) btnTabla.classList.remove("active");
    if (btnMetricas) btnMetricas.classList.add("active");
    if (secTabla) secTabla.style.display = "none";
    if (secMetricas) secMetricas.style.display = "block";
    actualizarMetricasHistorial();
  }
}

// ==========================================
// SECCIÓN DE MÉTRICAS DEL HISTORIAL
// ==========================================
function setRangoMetricasHistorial(tipo, btn) {
  _metricasRangoActivo = tipo;
  const hoy = new Date();
  const inpDesde = document.getElementById("metricasFechaDesde");
  const inpHasta = document.getElementById("metricasFechaHasta");

  document.querySelectorAll("#seccionHistorialMetricas .btn-rango-stats").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");

  if (tipo === "hoy") {
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, "0");
    const dd = String(hoy.getDate()).padStart(2, "0");
    const fStr = `${yyyy}-${mm}-${dd}`;
    if (inpDesde) inpDesde.value = fStr;
    if (inpHasta) inpHasta.value = fStr;
  } else if (tipo === "mes") {
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, "0");
    const ultDia = new Date(yyyy, hoy.getMonth() + 1, 0).getDate();
    if (inpDesde) inpDesde.value = `${yyyy}-${mm}-01`;
    if (inpHasta) inpHasta.value = `${yyyy}-${mm}-${String(ultDia).padStart(2, "0")}`;
  } else {
    if (inpDesde) inpDesde.value = "";
    if (inpHasta) inpHasta.value = "";
  }

  actualizarMetricasHistorial();
}

async function actualizarMetricasHistorial() {
  const containerKPI = document.getElementById("metricasKPICards");
  const listaAgentes = document.getElementById("listaRankingAgentes");
  const listaPlantillas = document.getElementById("listaPlantillasMasUsadas");
  if (!containerKPI || !listaAgentes || !listaPlantillas) return;

  const fDesdeStr = document.getElementById("metricasFechaDesde")?.value || "";
  const fHastaStr = document.getElementById("metricasFechaHasta")?.value || "";

  let items = [];

  // Si Supabase está conectado, consultar datos del período completo paginando todos los lotes
  if (typeof supabaseClient !== "undefined" && supabaseClient) {
    try {
      // Estado de carga visual
      containerKPI.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 24px; text-align: center; color: var(--text-muted); background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 10px;">
          <div style="font-size: 1.6rem; margin-bottom: 8px;">⏳</div>
          <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">Consultando base de datos completa...</div>
          <div style="font-size: 0.85rem;" id="txtProgresoMetricas">Conectando con Supabase...</div>
        </div>
      `;

      let isoDesde = "";
      let isoHasta = "";
      if (fDesdeStr) {
        isoDesde = new Date(fDesdeStr + "T00:00:00").toISOString();
      }
      if (fHastaStr) {
        isoHasta = new Date(fHastaStr + "T23:59:59.999").toISOString();
      }

      const BATCH_SIZE = 1000;
      let offset = 0;
      let hayMas = true;
      let lotesConsultados = 0;

      while (hayMas) {
        let query = supabaseClient
          .from("historial_plantillas")
          .select("agente, plantilla, created_at, marca_temporal")
          .order("created_at", { ascending: false, nullsFirst: false })
          .range(offset, offset + BATCH_SIZE - 1);

        if (isoDesde) {
          query = query.gte("created_at", isoDesde);
        }
        if (isoHasta) {
          query = query.lte("created_at", isoHasta);
        }

        const { data, error } = await query;
        if (error) {
          console.warn("Aviso en consulta de métricas Supabase:", error);
          break;
        }

        if (Array.isArray(data) && data.length > 0) {
          items.push(...data);
          lotesConsultados++;
          const elProgreso = document.getElementById("txtProgresoMetricas");
          if (elProgreso) {
            elProgreso.textContent = `Descargando registros (${items.length} analizados)...`;
          }

          if (data.length < BATCH_SIZE) {
            hayMas = false;
          } else {
            offset += BATCH_SIZE;
            if (lotesConsultados >= 50) break; // Salvaguarda: hasta 50,000 registros
          }
        } else {
          hayMas = false;
        }
      }

      if (items.length === 0 && !fDesdeStr && !fHastaStr) {
        items = listaHistorialPlantillas;
      }
    } catch (e) {
      console.warn("Excepción al consultar métricas completas:", e);
      items = listaHistorialPlantillas;
    }
  } else {
    items = listaHistorialPlantillas;
  }

  // Filtrar localmente si fue desde memoria
  if ((!supabaseClient || items === listaHistorialPlantillas) && (fDesdeStr || fHastaStr)) {
    const fD = fDesdeStr ? new Date(fDesdeStr + "T00:00:00") : null;
    const fH = fHastaStr ? new Date(fHastaStr + "T23:59:59") : null;
    items = items.filter(r => {
      const fItem = parsearFechaParaFiltro(r.marca_temporal || r.created_at);
      if (fItem) {
        if (fD && fItem < fD) return false;
        if (fH && fItem > fH) return false;
      }
      return true;
    });
  }

  const total = items.length;

  // 1. Agrupar por agente
  const conteoAgentes = {};
  items.forEach(r => {
    const ag = (r.agente || "Desconocido").trim();
    conteoAgentes[ag] = (conteoAgentes[ag] || 0) + 1;
  });

  const rankingAgentes = Object.keys(conteoAgentes).map(agente => ({
    agente,
    total: conteoAgentes[agente],
    porcentaje: total > 0 ? ((conteoAgentes[agente] / total) * 100).toFixed(1) : "0"
  })).sort((a, b) => b.total - a.total);

  // 2. Agrupar por plantilla
  const conteoPlantillas = {};
  items.forEach(r => {
    let pl = (r.plantilla || "OTRA").trim();
    if (pl.includes("COINCIDE")) pl = "NO COINCIDE";
    conteoPlantillas[pl] = (conteoPlantillas[pl] || 0) + 1;
  });

  const rankingPlantillas = Object.keys(conteoPlantillas).map(plantilla => ({
    plantilla,
    total: conteoPlantillas[plantilla],
    porcentaje: total > 0 ? ((conteoPlantillas[plantilla] / total) * 100).toFixed(1) : "0"
  })).sort((a, b) => b.total - a.total);

  // KPIs
  const topAgente = rankingAgentes.length > 0 ? `${rankingAgentes[0].agente} (${rankingAgentes[0].total})` : "N/A";
  const topPlantilla = rankingPlantillas.length > 0 ? `${rankingPlantillas[0].plantilla} (${rankingPlantillas[0].total})` : "N/A";
  const totalAgentes = rankingAgentes.length;

  containerKPI.innerHTML = `
    <div style="background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 10px; padding: 16px; border-left: 4px solid var(--accent);">
      <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: bold;">Total Trámites</div>
      <div style="font-size: 1.8rem; font-weight: bold; margin: 4px 0; color: var(--accent);">${total}</div>
      <div style="font-size: 0.78rem; color: var(--text-secondary);">Generados en el período</div>
    </div>

    <div style="background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 10px; padding: 16px; border-left: 4px solid #64b5f6;">
      <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: bold;">Top Agente</div>
      <div style="font-size: 1.35rem; font-weight: bold; margin: 6px 0; color: #64b5f6; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHTML(topAgente)}</div>
      <div style="font-size: 0.78rem; color: var(--text-secondary);">Mayor volumen de plantillas</div>
    </div>

    <div style="background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 10px; padding: 16px; border-left: 4px solid #ce93d8;">
      <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: bold;">Plantilla Más Usada</div>
      <div style="font-size: 1.35rem; font-weight: bold; margin: 6px 0; color: #ce93d8; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHTML(topPlantilla)}</div>
      <div style="font-size: 0.78rem; color: var(--text-secondary);">Trámite más recurrente</div>
    </div>

    <div style="background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 10px; padding: 16px; border-left: 4px solid #81c784;">
      <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: bold;">Agentes Activos</div>
      <div style="font-size: 1.8rem; font-weight: bold; margin: 4px 0; color: #81c784;">${totalAgentes}</div>
      <div style="font-size: 0.78rem; color: var(--text-secondary);">Con al menos 1 trámite</div>
    </div>
  `;

  // Actualizar badges
  const bAg = document.getElementById("badgeTotalAgentes");
  if (bAg) bAg.textContent = `${totalAgentes} agentes`;
  const bPl = document.getElementById("badgeTotalPlantillas");
  if (bPl) bPl.textContent = `${rankingPlantillas.length} plantillas`;

  // Renderizar ranking agentes
  if (rankingAgentes.length === 0) {
    listaAgentes.innerHTML = `<div style="text-align: center; padding: 30px; color: var(--text-muted);">No hay trámites registrados en este período.</div>`;
  } else {
    listaAgentes.innerHTML = rankingAgentes.map((ag, idx) => {
      let medalla = `#${idx + 1}`;
      if (idx === 0) medalla = "🥇";
      else if (idx === 1) medalla = "🥈";
      else if (idx === 2) medalla = "🥉";

      return `
        <div style="padding: 10px 12px; border-bottom: 1px solid var(--card-border); display: flex; align-items: center; justify-content: space-between; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0;">
            <span style="font-weight: bold; font-size: 1.05rem; min-width: 28px; text-align: center;">${medalla}</span>
            <div style="min-width: 0; flex: 1;">
              <div style="font-weight: 600; font-size: 0.9rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">👤 ${escapeHTML(ag.agente)}</div>
              <div style="background: rgba(255,255,255,0.06); height: 5px; border-radius: 3px; margin-top: 5px; overflow: hidden;">
                <div style="background: #64b5f6; height: 100%; width: ${ag.porcentaje}%;"></div>
              </div>
            </div>
          </div>
          <div style="text-align: right; min-width: 70px;">
            <span style="font-weight: bold; font-size: 1rem; color: var(--accent);">${ag.total}</span>
            <span style="font-size: 0.76rem; color: var(--text-muted); display: block;">${ag.porcentaje}%</span>
          </div>
        </div>
      `;
    }).join("");
  }

  // Renderizar ranking plantillas
  if (rankingPlantillas.length === 0) {
    listaPlantillas.innerHTML = `<div style="text-align: center; padding: 30px; color: var(--text-muted);">No hay trámites registrados en este período.</div>`;
  } else {
    listaPlantillas.innerHTML = rankingPlantillas.map((pl, idx) => {
      return `
        <div style="padding: 10px 12px; border-bottom: 1px solid var(--card-border); display: flex; align-items: center; justify-content: space-between; gap: 12px;">
          <div style="flex: 1; min-width: 0;">
            <div style="margin-bottom: 4px;">${obtenerBadgePlantilla(pl.plantilla)}</div>
            <div style="background: rgba(255,255,255,0.06); height: 5px; border-radius: 3px; overflow: hidden;">
              <div style="background: #ce93d8; height: 100%; width: ${pl.porcentaje}%;"></div>
            </div>
          </div>
          <div style="text-align: right; min-width: 70px;">
            <span style="font-weight: bold; font-size: 1rem; color: #ce93d8;">${pl.total}</span>
            <span style="font-size: 0.76rem; color: var(--text-muted); display: block;">${pl.porcentaje}%</span>
          </div>
        </div>
      `;
    }).join("");
  }
}

// ==========================================
// ACCIONES DE TABLA HISTORIAL
// ==========================================
function copiarCedulaHistorial(cedula) {
  if (!cedula || cedula === "-" || cedula === "SIN DOCUMENTO") return;
  navigator.clipboard.writeText(cedula).then(() => {
    if (typeof notificar === "function") {
      notificar("info", "Cédula Copiada", `Documento <strong>${cedula}</strong> copiado al portapapeles.`);
    }
  }).catch(() => {
    if (typeof notificar === "function") {
      notificar("info", "Cédula", `Documento: ${cedula}`);
    }
  });
}

function copiarDetalleHistorial(id) {
  const r = listaHistorialPlantillas.find(item => item.id === id);
  if (!r) return;

  const detalleLimpio = formatearDetalleHistorial(r.condiciones);
  const texto = `Fecha: ${r.marca_temporal}\nGestión: ${r.gestion}\nDTS: ${r.dts}\nDocumento: ${r.cedula}\nAgente: ${r.agente}\nPlantilla: ${r.plantilla}\nMonto: ${r.monto || "N/A"}\nDetalle: ${detalleLimpio || "N/A"}`;
  navigator.clipboard.writeText(texto).then(() => {
    if (typeof notificar === "function") {
      notificar("success", "Datos Copiados", "Información del trámite copiada al portapapeles.");
    }
  });
}

async function eliminarRegistroHistorial(id) {
  const puedeEditar = (typeof esEditor === "function" && esEditor()) || (typeof usuarioLogueado !== "undefined" && usuarioLogueado && usuarioLogueado.rol === "editor"); 
  if (!puedeEditar) { 
    if (typeof notificar === "function") notificar("error", "Acceso Denegado", "Solo los editores autorizados pueden eliminar registros del historial."); 
    return; 
  }
  const reg = listaHistorialPlantillas.find(r => r.id === id);
  if (!reg) return;

  const confirma = (typeof mostrarModalConfirmacion === "function")
    ? await mostrarModalConfirmacion({
        titulo: "Confirmar eliminación",
        subtitulo: "Esta acción es irreversible",
        mensaje: `¿Estás seguro de eliminar el registro de la gestión <strong>"${typeof escapeHTML === 'function' ? escapeHTML(reg.gestion) : reg.gestion}"</strong> (${typeof escapeHTML === 'function' ? escapeHTML(reg.plantilla) : reg.plantilla}) del historial? Se borrará permanentemente de la base de datos.`,
        textoConfirmar: "Sí, eliminar",
        textoCancelar: "Cancelar"
      })
    : confirm(`¿Estás seguro de eliminar el registro de la gestión "${reg.gestion}" (${reg.plantilla}) del historial?`);
  if (!confirma) return;

  listaHistorialPlantillas = listaHistorialPlantillas.filter(r => r.id !== id);
  guardarHistorialLocalmente();
  renderizarTablaHistorial();

  if (typeof supabaseClient !== "undefined" && supabaseClient) {
    try {
      const { error } = await supabaseClient.from("historial_plantillas").delete().eq("id", id);
      if (error) {
        console.warn("Aviso: Error eliminando de Supabase:", error.message);
      }
    } catch (e) {
      console.warn("Error delete Supabase:", e);
    }
  }

  if (typeof notificar === "function") {
    notificar("success", "Registro Eliminado", `Trámite de gestión <strong>${reg.gestion}</strong> eliminado.`);
  }
}

// ==========================================
// EXPORTACIÓN A CSV
// ==========================================
async function exportarHistorialPlantillasCSV() {
  let paraExportar = listaHistorialPlantillas;

  if (_hayMasHistorialSupabase && typeof supabaseClient !== "undefined" && supabaseClient) {
    const confirmar = confirm(`Tienes ${listaHistorialPlantillas.length} registros cargados en pantalla, pero hay más en la base de datos.\n\n¿Deseas descargar TODO el historial completo desde Supabase?`);
    if (confirmar) {
      if (typeof notificar === "function") notificar("info", "Consultando", "Descargando historial completo de Supabase...");
      try {
        const { data, error } = await supabaseClient.from("historial_plantillas").select("*").order("created_at", { ascending: false });
        if (!error && Array.isArray(data) && data.length > 0) {
          paraExportar = data;
        }
      } catch (err) {
        console.warn("Error descargando todo el historial:", err);
      }
    }
  }

  if (!paraExportar || paraExportar.length === 0) {
    if (typeof notificar === "function") {
      notificar("warning", "Sin Datos", "No hay registros en el historial para exportar.");
    }
    return;
  }

  const encabezados = [
    "ID",
    "Marca Temporal",
    "Número de Gestión",
    "DTS (Distribuidor)",
    "Cédula / Documento",
    "Nombre Cliente",
    "Agente",
    "Plantilla",
    "Monto",
    "Detalle / Condiciones",
    "Fecha Creación"
  ];

  const filas = paraExportar.map(r => [
    `"${(r.id || "").replace(/"/g, '""')}"`,
    `"${(r.marca_temporal || "").replace(/"/g, '""')}"`,
    `"${(r.gestion || "").replace(/"/g, '""')}"`,
    `"${(r.dts || "").replace(/"/g, '""')}"`,
    `"${(r.cedula || "").replace(/"/g, '""')}"`,
    `"${(r.nombre || "").replace(/"/g, '""')}"`,
    `"${(r.agente || "").replace(/"/g, '""')}"`,
    `"${(r.plantilla || "").replace(/"/g, '""')}"`,
    `"${(r.monto || "").replace(/"/g, '""')}"`,
    `"${(formatearDetalleHistorial(r.condiciones) || "").replace(/"/g, '""')}"`,
    `"${(r.created_at || "").replace(/"/g, '""')}"`
  ]);

  const csvContent = "\uFEFF" + [encabezados.join(";"), ...filas.map(f => f.join(";"))].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  const fechaHoy = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  enlace.setAttribute("href", url);
  enlace.setAttribute("download", `Historial_Plantillas_${fechaHoy}.csv`);
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);

  if (typeof notificar === "function") {
    notificar("success", "CSV Descargado", `Se exportaron <strong>${paraExportar.length}</strong> registros del historial.`);
  }
}

async function vaciarHistorialPlantillas() {
  const puedeEditar = (typeof esEditor === "function" && esEditor()) || (typeof usuarioLogueado !== "undefined" && usuarioLogueado && usuarioLogueado.rol === "editor"); 
  if (!puedeEditar) { 
    if (typeof notificar === "function") notificar("error", "Acceso Denegado", "Solo los editores autorizados pueden vaciar el historial."); 
    return; 
  }
  if (!listaHistorialPlantillas || listaHistorialPlantillas.length === 0) {
    if (typeof notificar === "function") notificar("info", "Historial Vacío", "No hay registros en el historial.");
    return;
  }
  const confirmar = (typeof mostrarModalConfirmacion === "function")
    ? await mostrarModalConfirmacion({
        titulo: "Vaciar historial completo",
        subtitulo: "Esta acción es irreversible",
        mensaje: "¿Estás seguro de que deseas eliminar <strong>TODOS</strong> los registros del historial de plantillas? Se borrarán permanentemente de la base de datos.",
        textoConfirmar: "Sí, vaciar todo",
        textoCancelar: "Cancelar"
      })
    : confirm("¿Estás seguro de que deseas eliminar TODOS los registros del historial de plantillas? Esta acción no se puede deshacer.");
  if (!confirmar) return;

  listaHistorialPlantillas = [];
  _historialOffset = 0;
  _hayMasHistorialSupabase = false;
  guardarHistorialLocalmente();
  renderizarTablaHistorial();

  if (typeof supabaseClient !== "undefined" && supabaseClient) {
    try {
      const { error } = await supabaseClient.from("historial_plantillas").delete().neq("id", "0");
      if (error) console.warn("Aviso: Error vaciando historial en Supabase:", error.message);
    } catch (e) {
      console.warn("Error vaciar Supabase:", e);
    }
  }

  if (typeof notificar === "function") {
    notificar("success", "Historial Vaciado", "Se han eliminado todos los registros del historial.");
  }
}

// Configurar listener para búsqueda en Enter
document.addEventListener("DOMContentLoaded", () => {
  const inpFiltro = document.getElementById("filtroHistorial");
  if (inpFiltro) {
    inpFiltro.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        clearTimeout(_timerBusquedaSupabase);
        buscarEnBaseDeDatosHistorial(inpFiltro.value.trim());
      }
    });
  }
});
