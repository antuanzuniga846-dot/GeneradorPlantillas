// ==========================================
// MÓDULO: HISTORIAL DE PLANTILLAS (BETA)
// ==========================================

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
// REGISTRO DE PLANTILLAS EN HISTORIAL (BETA)
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
    guardarHistorialLocalmente();

    // Actualizar vista si está activa
    if (typeof vistaActual !== "undefined" && vistaActual === "historial") {
      renderizarTablaHistorial();
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
      notificar("success", "Registrado en Historial (BETA)", `Plantilla <strong>${registro.plantilla}</strong> (Gestión: ${registro.gestion}) registrada.`);
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
async function cargarHistorialSupabase() {
  if (typeof supabaseClient === "undefined" || !supabaseClient) {
    renderizarTablaHistorial();
    return;
  }

  try {
    const { data, error } = await supabaseClient
      .from("historial_plantillas")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);

    if (error) {
      console.warn("Aviso: Error cargando historial_plantillas de Supabase:", error.message);
      renderizarTablaHistorial();
      return;
    }

    if (Array.isArray(data)) {
      // Unir datos de Supabase con los locales sin duplicados por ID
      const mapaIds = new Set(data.map(d => d.id));
      const localesFaltantes = listaHistorialPlantillas.filter(l => !mapaIds.has(l.id));
      listaHistorialPlantillas = [...data, ...localesFaltantes];
      guardarHistorialLocalmente();
    }
  } catch (err) {
    console.warn("Error en cargarHistorialSupabase:", err);
  } finally {
    renderizarTablaHistorial();
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
              guardarHistorialLocalmente();
              if (typeof vistaActual !== "undefined" && vistaActual === "historial") {
                renderizarTablaHistorial();
              }
            }
          } else if (payload.eventType === "DELETE" && payload.old) {
            listaHistorialPlantillas = listaHistorialPlantillas.filter(r => r.id !== payload.old.id);
            guardarHistorialLocalmente();
            if (typeof vistaActual !== "undefined" && vistaActual === "historial") {
              renderizarTablaHistorial();
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
// RENDERIZADO Y FILTROS DE TABLA HISTORIAL
// ==========================================
let _historialRangoActivo = "todo";

function setRangoRapidoHistorial(tipo, btn) {
  _historialRangoActivo = tipo;
  const hoy = new Date();
  const inpDesde = document.getElementById("historialFechaDesde");
  const inpHasta = document.getElementById("historialFechaHasta");

  document.querySelectorAll("#vistaHistorial .btn-rango-stats").forEach(b => b.classList.remove("active"));
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
  const n = String(nombre || "").toUpperCase();
  if (n.includes("REC")) {
    return `<span class="pill-btn" style="background: rgba(0, 188, 212, 0.22); color: #80deea; border: 1px solid rgba(0, 188, 212, 0.45); font-weight: bold; padding: 4px 9px;">LIMPIEZA REC</span>`;
  }
  if (n.includes("LIMPIEZA")) {
    return `<span class="pill-btn" style="background: rgba(0, 150, 136, 0.22); color: #80cbc4; border: 1px solid rgba(0, 150, 136, 0.45); font-weight: bold; padding: 4px 9px;">LIMPIEZA</span>`;
  }
  if (n.includes("NO PROCEDE")) {
    return `<span class="pill-btn" style="background: rgba(229, 57, 53, 0.25); color: #ff8a80; border: 1px solid rgba(229, 57, 53, 0.5); font-weight: bold; padding: 4px 9px;">⛔ NO PROCEDE</span>`;
  }
  if (n.includes("RECHAZO") || n.includes("CÉDULA") || n.includes("DOCUMENTO") || n.includes("CAPTURA") || n.includes("ESQUINAS") || n.includes("SPAM") || n.includes("CONTACTO") || n.includes("SIN")) {
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

function renderizarTablaHistorial() {
  const tbody = document.getElementById("tablaHistorialBody");
  if (!tbody) return;

  const txtBuscar = (document.getElementById("filtroHistorial")?.value || "").trim().toLowerCase();
  const filtroTipo = document.getElementById("historialFiltroTipo")?.value || "";
  const fDesdeStr = document.getElementById("historialFechaDesde")?.value || "";
  const fHastaStr = document.getElementById("historialFechaHasta")?.value || "";

  const fDesde = fDesdeStr ? new Date(fDesdeStr + "T00:00:00") : null;
  const fHasta = fHastaStr ? new Date(fHastaStr + "T23:59:59") : null;

  let filtrados = listaHistorialPlantillas.filter(r => {
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
      if (filtroTipo === "RECHAZOS" && (!p.includes("RECHAZO") && !p.includes("DOCUMENTO") && !p.includes("CÉDULA") && !p.includes("CAPTURA") && !p.includes("ESQUINAS") && !p.includes("SPAM") && !p.includes("CONTACTO") && !p.includes("SIN"))) return false;
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

  // Contadores
  const lblContador = document.getElementById("historialContador");
  if (lblContador) {
    lblContador.innerHTML = `Mostrando: <strong>${filtrados.length}</strong> de ${listaHistorialPlantillas.length} registros`;
  }



  if (filtrados.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 35px 20px; color: var(--text-muted); font-size: 0.95rem;">
          <div style="font-size: 2.2rem; margin-bottom: 8px;">📋</div>
          No se encontraron plantillas registradas en el historial con los filtros aplicados.
        </td>
      </tr>
    `;
    return;
  }

  const esEditor = (typeof esUsuarioEditor === "function") ? esUsuarioEditor() : false;

  tbody.innerHTML = filtrados.map(r => {
    const montoDisplay = r.monto && r.monto !== "-" 
      ? `<strong style="color: var(--accent);">${escapeHTML(r.monto)}</strong>` 
      : `<span style="color: var(--text-muted);">-</span>`;

    const condicionesDisplay = r.condiciones 
      ? `<span style="font-size: 0.82rem; line-height: 1.35; display: inline-block;">${escapeHTML(r.condiciones)}</span>` 
      : `<span style="color: var(--text-muted);">-</span>`;

    const botonEliminar = `
      <button type="button" class="btn-sheet-del" onclick="eliminarRegistroHistorial('${r.id}')" title="Eliminar registro del historial">🗑️</button>
    `;

    return `
      <tr>
        <td style="font-family: monospace; font-size: 0.82rem; white-space: nowrap; color: var(--text-secondary);">${escapeHTML(r.marca_temporal || "-")}</td>
        <td style="text-align: center; font-weight: bold; color: var(--text-primary);"><span style="background: rgba(255,255,255,0.06); padding: 2px 7px; border-radius: 4px;">${escapeHTML(r.gestion || "-")}</span></td>
        <td style="font-weight: 600; color: #64b5f6;"><span title="Distribuidor / Agencia">${escapeHTML(r.dts || "-")}</span></td>
        <td class="td-cedula" style="text-align: center;">
          <span class="cedula-copy-pill" onclick="copiarCedulaHistorial('${escapeHTML(r.cedula)}')" title="Clic para copiar documento">${escapeHTML(r.cedula || "-")}</span>
        </td>
        <td style="white-space: nowrap;">
          <span style="display: inline-flex; align-items: center; gap: 5px; font-size: 0.82rem;">
            <span>👤</span> ${escapeHTML(r.agente || "-")}
          </span>
        </td>
        <td>${obtenerBadgePlantilla(r.plantilla)}</td>
        <td style="max-width: 280px; word-break: break-word;">${condicionesDisplay}</td>
        <td style="text-align: right; white-space: nowrap;">${montoDisplay}</td>
        <td style="text-align: center; white-space: nowrap;">
          <div style="display: flex; gap: 4px; justify-content: center; align-items: center;">
            <button type="button" class="btn-sheet-action" onclick="copiarDetalleHistorial('${r.id}')" title="Copiar resumen al portapapeles">📋</button>
            ${botonEliminar}
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function copiarCedulaHistorial(cedula) {
  if (!cedula || cedula === "-") return;
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

  const texto = `Fecha: ${r.marca_temporal}\nGestión: ${r.gestion}\nDTS: ${r.dts}\nDocumento: ${r.cedula}\nAgente: ${r.agente}\nPlantilla: ${r.plantilla}\nMonto: ${r.monto || "N/A"}\nDetalle: ${r.condiciones || "N/A"}`;
  navigator.clipboard.writeText(texto).then(() => {
    if (typeof notificar === "function") {
      notificar("success", "Datos Copiados", "Información del trámite copiada al portapapeles.");
    }
  });
}

async function eliminarRegistroHistorial(id) {
  const reg = listaHistorialPlantillas.find(r => r.id === id);
  if (!reg) return;

  const confirma = confirm(`¿Estás seguro de eliminar el registro de la gestión "${reg.gestion}" (${reg.plantilla}) del historial?`);
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
function exportarHistorialPlantillasCSV() {
  if (!listaHistorialPlantillas || listaHistorialPlantillas.length === 0) {
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

  const filas = listaHistorialPlantillas.map(r => [
    `"${(r.id || "").replace(/"/g, '""')}"`,
    `"${(r.marca_temporal || "").replace(/"/g, '""')}"`,
    `"${(r.gestion || "").replace(/"/g, '""')}"`,
    `"${(r.dts || "").replace(/"/g, '""')}"`,
    `"${(r.cedula || "").replace(/"/g, '""')}"`,
    `"${(r.nombre || "").replace(/"/g, '""')}"`,
    `"${(r.agente || "").replace(/"/g, '""')}"`,
    `"${(r.plantilla || "").replace(/"/g, '""')}"`,
    `"${(r.monto || "").replace(/"/g, '""')}"`,
    `"${(r.condiciones || "").replace(/"/g, '""')}"`,
    `"${(r.created_at || "").replace(/"/g, '""')}"`
  ]);

  const csvContent = "\uFEFF" + [encabezados.join(";"), ...filas.map(f => f.join(";"))].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  const fechaHoy = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  enlace.setAttribute("href", url);
  enlace.setAttribute("download", `Historial_Plantillas_BETA_${fechaHoy}.csv`);
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);

  if (typeof notificar === "function") {
    notificar("success", "CSV Descargado", `Se exportaron <strong>${listaHistorialPlantillas.length}</strong> registros del historial.`);
  }
}
async function vaciarHistorialPlantillas() {
  if (!listaHistorialPlantillas || listaHistorialPlantillas.length === 0) {
    if (typeof notificar === "function") notificar("info", "Historial Vacío", "No hay registros en el historial.");
    return;
  }
  const confirmar = confirm("¿Estás seguro de que deseas eliminar TODOS los registros del historial de plantillas? Esta acción no se puede deshacer.");
  if (!confirmar) return;

  listaHistorialPlantillas = [];
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