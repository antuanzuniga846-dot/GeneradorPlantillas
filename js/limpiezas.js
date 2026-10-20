// ==========================================
// MÓDULO DE CONTROL DE LIMPIEZAS & SINCRONIZACIÓN
// ==========================================

function obtenerLocalStorageSeguro(clave, defecto = null) {
  try {
    const val = localStorage.getItem(clave);
    return val !== null ? JSON.parse(val) : defecto;
  } catch (e) {
    console.warn(`Aviso: No se pudo leer ${clave} de localStorage:`, e);
    return defecto;
  }
}

function guardarLocalStorageSeguro(clave, datos) {
  try {
    localStorage.setItem(clave, typeof datos === "string" ? datos : JSON.stringify(datos));
  } catch (e) {
    console.warn(`Aviso: No se pudo guardar ${clave} en localStorage:`, e);
  }
}

function guardarLimpiezasLocalmente() {
  guardarLocalStorageSeguro(STORAGE_KEY_SHEET, listaLimpiezas);
}

let listaLimpiezas = obtenerLocalStorageSeguro(STORAGE_KEY_SHEET, []);
let canalRealtime = null;
let realtimeConectado = false;
let retryRealtimeTimer = null;
let intentosReconexion = 0;
let ultimaCargaSupabase = 0;
const TAMANO_PAGINA_LIMPIEZAS = 150;
let hayMasRegistrosSupabase = true;
let cargandoMasRegistros = false;

function mapearRegistroLimpieza(item, anteriorLocal = null) {
  let enProc = "";
  if (item.en_proceso !== undefined && item.en_proceso !== null && String(item.en_proceso).trim() !== "") {
    enProc = normalizarNombreEnProceso(item.en_proceso);
  } else if (anteriorLocal && anteriorLocal.enProceso) {
    enProc = normalizarNombreEnProceso(anteriorLocal.enProceso);
  }

  if (item.soporte && String(item.soporte).trim()) {
    enProc = "";
  }

  return {
    id: item.id,
    marcaTemporal: normalizarFechaMarcaTemporal(item.marca_temporal),
    monto: item.monto,
    agente: item.agente,
    cedula: item.cedula,
    ceroPagos: !!item.cero_pagos,
    soporte: item.soporte || "",
    categoria: item.categoria || "",
    motivo: item.motivo || "",
    enProceso: enProc
  };
}

async function cargarDatosDesdeSupabase(silencioso = false, forzar = false) {
  if (!supabaseClient) return;

  const ahora = Date.now();
  // Si Realtime está activo, evitamos consultas muy seguidas salvo que sea forzado.
  // Si Realtime está desconectado/bloqueado, permitimos sync cada 12s para garantizar actualización continua.
  const limiteMinimo = realtimeConectado ? 45000 : 12000;
  if (!forzar && silencioso && ahora - ultimaCargaSupabase < limiteMinimo) {
    return;
  }
  ultimaCargaSupabase = ahora;

  try {
    const { data, error } = await supabaseClient
      .from("control_limpiezas")
      .select("id, marca_temporal, monto, agente, cedula, cero_pagos, soporte, categoria, motivo, en_proceso, created_at")
      .order("created_at", { ascending: false })
      .range(0, TAMANO_PAGINA_LIMPIEZAS - 1);

    if (!error && data) {
      hayMasRegistrosSupabase = data.length >= TAMANO_PAGINA_LIMPIEZAS;

      const nuevosRecientes = data.map(item => {
        const anteriorLocal = listaLimpiezas.find(x => x.id === item.id);
        return mapearRegistroLimpieza(item, anteriorLocal);
      });

      // Conservar registros antiguos que el usuario ya haya cargado mediante scroll
      const idsNuevos = new Set(nuevosRecientes.map(x => x.id));
      const antiguosConservados = listaLimpiezas.filter(x => !idsNuevos.has(x.id));
      const listaCombinada = [...nuevosRecientes, ...antiguosConservados];

      const jsonNuevo = JSON.stringify(listaCombinada);
      const jsonViejo = JSON.stringify(listaLimpiezas);

      if (jsonNuevo !== jsonViejo) {
        listaLimpiezas = listaCombinada;
        guardarLimpiezasLocalmente();
        renderizarTablaSheet();
        if (vistaActual === "estadisticas") {
          actualizarEstadisticasYTablaDinamica();
        }
      }
    }
  } catch (err) {
    if (!silencioso) console.error("Error al cargar limpiezas de Supabase:", err);
  }
}

async function cargarMasRegistrosAnteriores() {
  if (!supabaseClient || cargandoMasRegistros || !hayMasRegistrosSupabase) return;

  cargandoMasRegistros = true;
  actualizarEstadoScrollLoader(true, "⏳ Cargando registros de días anteriores...");

  try {
    const offset = listaLimpiezas.length;
    const { data, error } = await supabaseClient
      .from("control_limpiezas")
      .select("id, marca_temporal, monto, agente, cedula, cero_pagos, soporte, categoria, motivo, en_proceso, created_at")
      .order("created_at", { ascending: false })
      .range(offset, offset + TAMANO_PAGINA_LIMPIEZAS - 1);

    if (error) {
      console.warn("Error cargando más registros:", error);
      actualizarEstadoScrollLoader(false, "⚠️ Error al cargar registros anteriores. Toca para reintentar.", true);
      return;
    }

    if (!data || data.length === 0) {
      hayMasRegistrosSupabase = false;
      actualizarEstadoScrollLoader(false, "✅ Se ha cargado todo el historial de limpiezas.");
      return;
    }

    if (data.length < TAMANO_PAGINA_LIMPIEZAS) {
      hayMasRegistrosSupabase = false;
    }

    let nuevosAnadidos = 0;
    data.forEach(item => {
      if (!listaLimpiezas.some(x => x.id === item.id)) {
        listaLimpiezas.push(mapearRegistroLimpieza(item));
        nuevosAnadidos++;
      }
    });

    guardarLimpiezasLocalmente();
    renderizarTablaSheet();

    if (hayMasRegistrosSupabase) {
      actualizarEstadoScrollLoader(false, `📜 Mostrando ${listaLimpiezas.length} limpiezas. Desliza o toca para cargar más días anteriores.`);
    } else {
      actualizarEstadoScrollLoader(false, `✅ Se ha cargado todo el historial (${listaLimpiezas.length} registros).`);
    }
  } catch (e) {
    console.error("Fallo al cargar más:", e);
    actualizarEstadoScrollLoader(false, "⚠️ Error al cargar. Toca para reintentar.", true);
  } finally {
    cargandoMasRegistros = false;
  }
}

function actualizarEstadoScrollLoader(cargando, mensaje, esError = false) {
  let loader = document.getElementById("sheetScrollLoader");
  if (!loader) {
    const container = document.querySelector(".sheet-table-container");
    if (!container) return;
    loader = document.createElement("div");
    loader.id = "sheetScrollLoader";
    loader.style.cssText = "text-align: center; padding: 14px 10px; font-size: 0.85rem; cursor: pointer; user-select: none; border-top: 1px solid var(--card-border); background: rgba(0,0,0,0.1);";
    loader.onclick = () => cargarMasRegistrosAnteriores();
    container.appendChild(loader);
  }

  if (!mensaje) {
    loader.style.display = "none";
    return;
  }

  loader.style.display = "block";
  loader.textContent = mensaje;
  if (esError) {
    loader.style.color = "#ff8a80";
  } else {
    loader.style.color = cargando ? "#ffb74d" : "#90caf9";
  }
}

let _scrollListenerIniciado = false;
function inicializarScrollInfinito() {
  if (_scrollListenerIniciado) return;
  const container = document.querySelector(".sheet-table-container");
  if (!container) return;

  _scrollListenerIniciado = true;
  container.addEventListener("scroll", () => {
    const filtro = (document.getElementById("filtroSheet")?.value || "").trim();
    if (filtro) return; // No auto-scrollear si hay un filtro de búsqueda activo
    if (container.scrollTop + container.clientHeight >= container.scrollHeight - 140) {
      if (!cargandoMasRegistros && hayMasRegistrosSupabase && supabaseClient) {
        cargarMasRegistrosAnteriores();
      }
    }
  });
}

async function sincronizarConSupabase() {
  if (supabaseClient) {
    await cargarUsuariosDesdeSupabase();
    await cargarDatosDesdeSupabase(false, true);
    if (vistaActual === "estadisticas") {
      actualizarEstadisticasYTablaDinamica(true);
    }
    notificar("success", "Sincronizado", "Datos actualizados desde Supabase.");
  } else {
    renderizarTablaSheet();
    if (vistaActual === "estadisticas") {
      actualizarEstadisticasYTablaDinamica();
    }
    notificar("info", "Modo Local", "Datos cargados desde almacenamiento local.");
  }
}

function actualizarDotRealtime(estado) {
  const dot = document.getElementById("dbDot");
  const text = document.getElementById("dbStatusText");
  if (!dot || !text) return;

  if (estado === "online") {
    dot.className = "db-dot";
    text.textContent = "Supabase Online";
  } else if (estado === "reconnecting") {
    dot.className = "db-dot reconnecting";
    text.textContent = "Reconectando...";
  } else if (estado === "polling") {
    dot.className = "db-dot offline";
    text.textContent = "Sync Periódico";
  } else {
    dot.className = "db-dot offline";
    text.textContent = "Modo Local";
  }
}

function programarReconexionRealtime(delayMs = 4000) {
  if (retryRealtimeTimer) clearTimeout(retryRealtimeTimer);
  actualizarDotRealtime("reconnecting");

  intentosReconexion++;
  const espera = Math.min(delayMs * Math.min(intentosReconexion, 4), 20000);

  retryRealtimeTimer = setTimeout(() => {
    console.log(`🔄 Reintentando suscribir Realtime (intento #${intentosReconexion})...`);
    suscribirRealtimeSupabase();
  }, espera);
}

function suscribirRealtimeSupabase() {
  if (!supabaseClient) return;
  try {
    if (canalRealtime) {
      try { supabaseClient.removeChannel(canalRealtime); } catch(e){}
      canalRealtime = null;
    }

    const channelId = "global_control_limpiezas_realtime";
    canalRealtime = supabaseClient
      .channel(channelId, {
        config: {
          broadcast: { self: false }
        }
      })
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "control_limpiezas" },
        (payload) => {
          manejarEventoRealtime(payload);
        }
      )
      .on(
        "broadcast",
        { event: "en_proceso_sync" },
        (payload) => {
          try {
            const data = payload.payload || {};
            if (data && data.id) {
              const itm = listaLimpiezas.find(x => x.id === data.id);
              if (itm) {
                const nuevoEnProc = normalizarNombreEnProceso(data.enProceso || "");
                if (itm.enProceso !== nuevoEnProc) {
                  itm.enProceso = nuevoEnProc;
                  guardarLimpiezasLocalmente();

                  const tr = document.querySelector(`tr[data-row-id="${data.id}"]`);
                  if (tr) {
                    const celdaClick = tr.querySelector(".cell-cedula-click > div");
                    if (celdaClick) {
                      const badgeExistente = celdaClick.querySelector(".badge-en-proceso");
                      if (badgeExistente) badgeExistente.remove();

                      if (nuevoEnProc && !(itm.soporte && itm.soporte.trim())) {
                        const badge = document.createElement("span");
                        badge.className = "badge-en-proceso";
                        badge.title = `En proceso por ${nuevoEnProc} (Toca para desmarcar)`;
                        badge.textContent = `⏳ ${nuevoEnProc}`;
                        celdaClick.insertBefore(badge, celdaClick.firstChild);
                      }
                    }
                  } else {
                    renderizarTablaSheet();
                  }
                }
              }
            }
          } catch (e) {
            console.warn("Error en broadcast en_proceso_sync:", e);
          }
        }
      )
      .on(
        "broadcast",
        { event: "solicitar_estados_en_proceso" },
        () => {
          if (usuarioLogueado && canalRealtime) {
            const miNombre = normalizarNombreEnProceso(usuarioLogueado.nombre || usuarioLogueado.usuario);
            const misActivas = listaLimpiezas.filter(x => normalizarNombreEnProceso(x.enProceso).toLowerCase() === miNombre.toLowerCase() && !x.soporte);
            misActivas.forEach(act => {
              try {
                canalRealtime.send({
                  type: 'broadcast',
                  event: 'en_proceso_sync',
                  payload: { id: act.id, enProceso: normalizarNombreEnProceso(act.enProceso) }
                });
              } catch(e){}
            });
          }
        }
      )
      .subscribe((status, err) => {
        console.log("📡 Estado conexión Realtime Supabase:", status);
        if (status === "SUBSCRIBED") {
          realtimeConectado = true;
          intentosReconexion = 0;
          if (retryRealtimeTimer) {
            clearTimeout(retryRealtimeTimer);
            retryRealtimeTimer = null;
          }
          actualizarDotRealtime("online");

          // Sincronizar de inmediato al conectar para asegurar que no perdimos registros
          cargarDatosDesdeSupabase(true, true);

          setTimeout(() => {
            try {
              if (canalRealtime) {
                canalRealtime.send({
                  type: 'broadcast',
                  event: 'solicitar_estados_en_proceso',
                  payload: {}
                });
              }
            } catch(e){}
          }, 400);
        } else if (status === "CLOSED" || status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          realtimeConectado = false;
          actualizarDotRealtime("polling");
          programarReconexionRealtime(5000);
        }
        if (err) console.warn("Realtime error:", err);
      });
  } catch (e) {
    console.warn("Error suscribiendo realtime:", e);
    realtimeConectado = false;
    programarReconexionRealtime(5000);
  }

  iniciarPollingSincronizacion();
}

let intervalSincronizacion = null;

function iniciarPollingSincronizacion() {
  if (intervalSincronizacion) clearInterval(intervalSincronizacion);

  // Polling híbrido inteligente:
  // - Si Realtime está activo y conectado: sync suave cada 60s
  // - Si Realtime está desconectado o bloqueado (Edge estricto o redes con proxy): sync forzado cada 15s
  intervalSincronizacion = setInterval(async () => {
    if (!supabaseClient || document.visibilityState !== "visible") return;

    const intervaloNecesario = realtimeConectado ? 60000 : 15000;
    const tiempoDesdeUltima = Date.now() - ultimaCargaSupabase;

    if (tiempoDesdeUltima >= intervaloNecesario) {
      await cargarDatosDesdeSupabase(true, !realtimeConectado);
    }
  }, 5000);
}

// Sincronización instantánea al regresar a la pestaña o enfocar ventana
function alVolverAPestana() {
  if (document.visibilityState === "visible" && supabaseClient) {
    if (!canalRealtime || canalRealtime.state !== 'joined' || !realtimeConectado) {
      console.log("👁️ Ventana enfocada con canal inactivo. Reconectando Realtime...");
      suscribirRealtimeSupabase();
    }
    cargarDatosDesdeSupabase(true, true);
  }
}

document.addEventListener("visibilitychange", alVolverAPestana);
window.addEventListener("focus", alVolverAPestana);

function manejarEventoRealtime(payload) {
  try {
    const { eventType, new: nuevaFila, old: viejaFila } = payload;
    console.log("📥 Evento Realtime recibido:", eventType, nuevaFila?.id || viejaFila?.id);

    if (eventType === "INSERT") {
      const existe = listaLimpiezas.some(x => x.id === nuevaFila.id);
      if (!existe) {
        const itemNuevo = {
          id: nuevaFila.id,
          marcaTemporal: normalizarFechaMarcaTemporal(nuevaFila.marca_temporal),
          monto: nuevaFila.monto,
          agente: nuevaFila.agente,
          cedula: nuevaFila.cedula,
          ceroPagos: !!nuevaFila.cero_pagos,
          soporte: nuevaFila.soporte || "",
          categoria: nuevaFila.categoria || "",
          motivo: nuevaFila.motivo || "",
          enProceso: normalizarNombreEnProceso(nuevaFila.en_proceso || "")
        };
        listaLimpiezas.unshift(itemNuevo);
        guardarLimpiezasLocalmente();
        renderizarTablaSheet();
        if (vistaActual === "estadisticas") {
          actualizarEstadisticasYTablaDinamica();
        }
      }
    } else if (eventType === "UPDATE") {
      const idx = listaLimpiezas.findIndex(x => x.id === nuevaFila.id);
      if (idx !== -1) {
        const anterior = listaLimpiezas[idx];
        const nuevoSoporte = nuevaFila.soporte || "";
        const nuevaCat = nuevaFila.categoria || "";
        const nuevoMotivo = nuevaFila.motivo || "";
        const nuevoMonto = nuevaFila.monto || "";
        const nuevaCedula = nuevaFila.cedula || "";
        let nuevoEnProc = "";
        if (nuevaFila.en_proceso !== undefined && nuevaFila.en_proceso !== null && String(nuevaFila.en_proceso).trim() !== "") {
          nuevoEnProc = normalizarNombreEnProceso(nuevaFila.en_proceso);
        } else if (anterior.enProceso) {
          nuevoEnProc = normalizarNombreEnProceso(anterior.enProceso);
        }
        if (nuevoSoporte && String(nuevoSoporte).trim()) {
          nuevoEnProc = "";
        }

        // Si los datos son exactamente idénticos (eco de nuestra propia actualización), no redibujar toda la tabla
        const sinCambios = (anterior.monto || "") === (nuevoMonto || "") &&
                           (anterior.soporte || "") === nuevoSoporte &&
                           (anterior.categoria || "") === nuevaCat &&
                           (anterior.motivo || "") === nuevoMotivo &&
                           (anterior.cedula || "") === nuevaCedula &&
                           normalizarNombreEnProceso(anterior.enProceso || "") === nuevoEnProc;

        if (sinCambios) {
          return;
        }

        // Notificar al usuario si su limpieza fue atendida por alguien más
        if (
          usuarioLogueado &&
          anterior.agente &&
          (anterior.agente.toLowerCase() === usuarioLogueado.usuario.toLowerCase() || anterior.agente.toLowerCase() === usuarioLogueado.nombre.toLowerCase()) &&
          (anterior.soporte !== nuevoSoporte || anterior.categoria !== nuevaCat)
        ) {
          let msg = `Tu limpieza para la cédula <strong>${nuevaFila.cedula}</strong> ya fue atendida / realizada.`;
          if (nuevoSoporte) msg += `<br>👤 Atendido por: <strong>${nuevoSoporte}</strong>`;
          if (nuevaCat) msg += `<br>🏷️ Categoría: <strong>${nuevaCat}</strong>`;
          if (nuevaFila.motivo) msg += `<br>📝 Motivo: <strong>${nuevaFila.motivo}</strong>`;
          notificar("success", "🔔 ¡Limpieza Realizada!", msg, true);
        }

        listaLimpiezas[idx] = {
          id: nuevaFila.id,
          marcaTemporal: normalizarFechaMarcaTemporal(nuevaFila.marca_temporal),
          monto: nuevaFila.monto,
          agente: nuevaFila.agente,
          cedula: nuevaFila.cedula,
          ceroPagos: !!nuevaFila.cero_pagos,
          soporte: nuevoSoporte,
          categoria: nuevaCat,
          motivo: nuevaFila.motivo || "",
          enProceso: nuevoEnProc
        };
        guardarLimpiezasLocalmente();
        renderizarTablaSheet();
        if (vistaActual === "estadisticas") {
          actualizarEstadisticasYTablaDinamica();
        }
      }
    } else if (eventType === "DELETE") {
      listaLimpiezas = listaLimpiezas.filter(x => x.id !== viejaFila.id);
      guardarLimpiezasLocalmente();
      renderizarTablaSheet();
      if (vistaActual === "estadisticas") {
        actualizarEstadisticasYTablaDinamica();
      }
    }
  } catch (err) {
    console.error("Error procesando evento Realtime:", err);
  }
}

// ==========================================
// PORTAPAPELES Y TOMA DE CÉDULAS
// ==========================================
function copiarTextoAlPortapapeles(texto) {
  if (!texto) return;
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(texto).catch(() => {
      copiarFallback(texto);
    });
  } else {
    copiarFallback(texto);
  }
}

function copiarFallback(texto) {
  const textArea = document.createElement("textarea");
  textArea.value = texto;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  textArea.style.top = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand("copy");
  } catch (err) {
    console.warn("Fallback copy error:", err);
  }
  document.body.removeChild(textArea);
}

async function toggleTomarCedula(rowId) {
  const item = listaLimpiezas.find(x => x.id === rowId);
  if (!item) return;

  const cedulaTexto = String(item.cedula || "").trim();

  // 1. Copiar cédula inmediatamente al portapapeles para cualquier usuario
  if (cedulaTexto) {
    copiarTextoAlPortapapeles(cedulaTexto);
  }

  // 2. Solo los editores autorizados pueden marcarse en proceso
  if (!esEditor()) {
    notificar("success", "Cédula Copiada", `Cédula <strong>${cedulaTexto}</strong> copiada al portapapeles.`);
    return;
  }

  let miNombre = usuarioLogueado.nombre || usuarioLogueado.usuario;
  miNombre = normalizarNombreEnProceso(miNombre);

  // Si ya tiene un nombre asignado en la columna Soporte, solo se copia y no requiere marcarse
  if (item.soporte && item.soporte.trim()) {
    notificar("info", "Cédula Copiada", `Cédula <strong>${cedulaTexto}</strong> copiada al portapapeles. (Atendida por ${item.soporte}).`);
    return;
  }

  // Si ya estaba en proceso por este usuario, se desmarca
  const enProcActual = normalizarNombreEnProceso(item.enProceso);
  let nuevoEnProceso = "";
  if (enProcActual && enProcActual.toLowerCase() === miNombre.toLowerCase()) {
    item.enProceso = "";
    nuevoEnProceso = "";
    notificar("info", "Cédula Liberada", `Cédula <strong>${cedulaTexto}</strong> copiada y desmarcada.`);
  } else {
    item.enProceso = miNombre;
    nuevoEnProceso = miNombre;
    notificar("success", "Copiada y En Proceso", `Cédula <strong>${cedulaTexto}</strong> copiada y marcada en proceso por <strong>${miNombre}</strong>.`);
  }

  guardarLimpiezasLocalmente();

  // Actualizar el badge en el DOM directamente sin redibujar toda la tabla (0ms de retraso)
  const tr = document.querySelector(`tr[data-row-id="${rowId}"]`);
  if (tr) {
    const celdaClick = tr.querySelector(".cell-cedula-click > div");
    if (celdaClick) {
      const badgeExistente = celdaClick.querySelector(".badge-en-proceso");
      if (badgeExistente) badgeExistente.remove();

      if (nuevoEnProceso && !(item.soporte && item.soporte.trim())) {
        const badge = document.createElement("span");
        badge.className = "badge-en-proceso";
        badge.title = `En proceso por ${nuevoEnProceso} (Toca para desmarcar)`;
        badge.textContent = `⏳ ${nuevoEnProceso}`;
        celdaClick.insertBefore(badge, celdaClick.firstChild);
      }
    }
  } else {
    renderizarTablaSheet();
  }

  // Emitir broadcast en tiempo real a todos los compañeros conectados
  if (canalRealtime) {
    try {
      canalRealtime.send({
        type: 'broadcast',
        event: 'en_proceso_sync',
        payload: {
          id: rowId,
          enProceso: item.enProceso
        }
      });
    } catch (e) {
      console.warn("Error broadcast en_proceso:", e);
    }
  }

  if (supabaseClient) {
    (async () => {
      try {
        await supabaseClient
          .from("control_limpiezas")
          .update({ en_proceso: item.enProceso })
          .eq("id", rowId);
      } catch (err) {
        console.warn("Error guardando en_proceso en Supabase:", err);
      }
    })();
  }
}

// ==========================================
// SUBIDA DE LIMPIEZAS Y GENERACIÓN UNIFICADA
// ==========================================
async function subirLimpiezaDesdePlantilla() {
  if (!usuarioLogueado) {
    notificar("warning", "Sesión Requerida", "Debes iniciar sesión para subir una limpieza.");
    document.getElementById("modalLogin").style.display = "flex";
    return false;
  }

  if (!validarCampos()) {
    notificar("error", "Campos Incompletos", "Por favor completa los campos obligatorios antes de subir.");
    return false;
  }

  const cedula = document.getElementById("cedula").value.trim();
  const esReversion = document.getElementById("chkReversionLS")?.checked || false;

  // Validación de duplicados: No permitir subir la misma cédula (excepto si es una Reversión)
  const cLimpia = cedula.replace(/[-\s]/g, '').toLowerCase();
  const cedulaExistente = !esReversion ? listaLimpiezas.find(r => {
    const rCed = String(r.cedula || '').trim().replace(/[-\s]/g, '').toLowerCase();
    return rCed === cLimpia;
  }) : null;

  if (cedulaExistente) {
    let detalle = `La cédula <strong>${cedula}</strong> ya se encuentra registrada en la hoja de control.`;
    if (cedulaExistente.marcaTemporal) detalle += `<br>⏱️ Fecha: <strong>${cedulaExistente.marcaTemporal}</strong>`;
    if (cedulaExistente.agente) detalle += `<br>👤 Solicitado por: <strong>${cedulaExistente.agente}</strong>`;
    if (cedulaExistente.soporte) detalle += `<br>🎧 Atendido por: <strong>${cedulaExistente.soporte}</strong>`;
    if (cedulaExistente.categoria) detalle += `<br>🏷️ Categoría: <strong>${cedulaExistente.categoria}</strong>`;

    notificar("warning", "⚠️ Cédula Ya Subida", detalle, 9500);
    return false;
  }

  // Montos
  const montoFP = document.getElementById('montoFacturasPendientesLS')?.value.trim() || "";
  const montoWO = document.getElementById('montoWritteOffLS')?.value.trim() || "";
  const montoCP = document.getElementById('montoCeroPagosLS')?.value.trim() || "";
  
  let terminosMonto = [];
  if (montoFP) terminosMonto.push(montoFP);
  if (montoCP) terminosMonto.push(montoCP);
  if (montoWO) terminosMonto.push(montoWO);
  const montoTexto = terminosMonto.length > 0 ? terminosMonto.join("+") : (document.getElementById("monto")?.value.trim() || "0.00");
  const tieneCeroPagos = !!montoCP;

  const agenteActual = usuarioLogueado.usuario || usuarioLogueado.nombre;

  const ahora = new Date();
  const nuevoId = "id_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
  const marcaNueva = formatearFechaHoraEstandar(ahora);

  const nuevo = {
    id: nuevoId,
    marcaTemporal: marcaNueva,
    monto: montoTexto,
    agente: agenteActual,
    cedula: cedula,
    ceroPagos: tieneCeroPagos,
    soporte: "",
    categoria: esReversion ? "Reversión" : "",
    motivo: "",
    enProceso: ""
  };

  listaLimpiezas.unshift(nuevo);
  guardarLimpiezasLocalmente();
  renderizarTablaSheet();
  if (vistaActual === "estadisticas") {
    actualizarEstadisticasYTablaDinamica();
  }

  if (supabaseClient) {
    const insertObj = {
      id: nuevoId,
      marca_temporal: marcaNueva,
      monto: montoTexto,
      agente: agenteActual,
      cedula: cedula,
      cero_pagos: tieneCeroPagos,
      soporte: "",
      categoria: esReversion ? "Reversión" : "",
      motivo: ""
    };
    try {
      const { error } = await supabaseClient.from("control_limpiezas").insert({ ...insertObj, en_proceso: "" });
      if (error) {
        console.warn("Reintentando insert sin en_proceso:", error.message);
        await supabaseClient.from("control_limpiezas").insert(insertObj);
      }
    } catch (err) {
      console.warn("Error subiendo limpieza a Supabase:", err);
    }
  }

  notificar("success", "Limpieza Subida", `Cédula <strong>${cedula}</strong> registrada en la hoja de control.`);
  return true;
}

async function generarYProcesarPlantilla() {
  const select = document.getElementById("plantilla");
  const seleccion = select.value;

  const montoFP = document.getElementById('montoFacturasPendientesLS')?.value.trim() || "";
  const montoCP = document.getElementById('montoCeroPagosLS')?.value.trim() || "";
  const esReversion = document.getElementById("chkReversionLS")?.checked || false;
  const esRec = document.getElementById("chkRecLS")?.checked || false;
  const cedula = document.getElementById("cedula")?.value.trim() || "";
  const cLimpia = cedula.replace(/[-\s]/g, '').toLowerCase();

  const tieneSaldoFPoCP = (seleccion === "LIMPIEZA DE SALDOS") && !esRec && (montoFP !== "" || montoCP !== "");

  if (tieneSaldoFPoCP) {
    const cedulaExistente = !esReversion ? listaLimpiezas.find(r => {
      const rCed = String(r.cedula || '').trim().replace(/[-\s]/g, '').toLowerCase();
      return rCed === cLimpia;
    }) : null;

    if (cedulaExistente) {
      let detalleAviso = `⚠️ La cédula ${cedula} ya se encuentra registrada en la hoja de cálculo.`;
      if (cedulaExistente.agente) detalleAviso += `\n👤 Solicitada por: ${cedulaExistente.agente}`;
      if (cedulaExistente.soporte) detalleAviso += `\n🎧 Atendida por: ${cedulaExistente.soporte}`;
      if (cedulaExistente.categoria) detalleAviso += `\n🏷️ Categoría: ${cedulaExistente.categoria}`;
      detalleAviso += `\n\n¿Deseas generar la plantilla pero SIN subirla a la hoja de limpiezas?`;

      const deseaGenerar = confirm(detalleAviso);

      if (!deseaGenerar) {
        return;
      }

      if (generarPlantilla()) {
        copiarTexto();
        notificar("warning", "Plantilla Generada (Sin Subir)", `Plantilla copiada al portapapeles. La cédula <strong>${cedula}</strong> ya estaba en la hoja de cálculo.`);
      }
      return;
    }

    const subido = await subirLimpiezaDesdePlantilla();
    if (subido) {
      if (generarPlantilla()) {
        copiarTexto();
      }
    }
  } else {
    if (generarPlantilla()) {
      copiarTexto();
      if (esRec) {
        notificar("info", "REC - Plantilla Generada", `Plantilla copiada al portapapeles. No se subió a la hoja de control por estar marcada la opción <strong>REC</strong>.`);
      }
    }
  }
}

// ==========================================
// COMPONENTE DROPDOWN PERSONALIZADO REDONDEADO
// ==========================================
let _dropdownActivoInfo = null;

function renderizarPillBoton(rowId, campo, valor, puedeEditar) {
  let clasePill = "";
  let minWidth = "120px";
  let estiloExtra = "";
  if (campo === "soporte") {
    clasePill = obtenerClaseSoporte(valor);
    minWidth = "125px";
    const vLower = (valor || "").trim().toLowerCase();
    if (vLower === "maría" || vLower === "maria" || vLower === "adriel") {
      estiloExtra = "background: #f8bbd0 !important; background-color: #f8bbd0 !important; color: #ffffff !important; text-shadow: 0 1px 3px rgba(0, 0, 0, 0.95), 0 0 2px #000 !important; border-color: transparent !important;";
    }
  } else if (campo === "categoria") {
    clasePill = obtenerClaseCategoria(valor);
    minWidth = "155px";
  } else if (campo === "motivo") {
    clasePill = obtenerClaseMotivo(valor);
    minWidth = "195px";
  }

  const disabledAttr = !puedeEditar ? 'disabled title="Solo editores autorizados"' : '';
  const onclickHandler = puedeEditar ? `onclick="event.stopPropagation(); toggleCustomDropdown(this, '${rowId}', '${campo}')"` : '';

  return `
    <button 
      type="button" 
      class="sheet-pill-btn ${clasePill}" 
      data-row-id="${rowId}" 
      data-campo="${campo}" 
      data-valor="${valor || ''}" 
      style="min-width: ${minWidth}; ${estiloExtra}"
      ${disabledAttr}
      ${onclickHandler}
    >
      <span class="sheet-pill-label">${valor || ''}</span>
      ${puedeEditar ? '<span class="sheet-pill-arrow">▾</span>' : ''}
    </button>
  `;
}

function toggleCustomDropdown(btnElem, rowId, campo) {
  const menu = document.getElementById("sheetDropdownMenu");
  if (!menu) return;

  if (_dropdownActivoInfo && _dropdownActivoInfo.btnElem === btnElem && menu.style.display === "block") {
    cerrarCustomDropdown();
    return;
  }

  _dropdownActivoInfo = { btnElem, rowId, campo };

  let opciones = [];
  if (campo === "soporte") {
    opciones = OPCIONES_SOPORTE;
  } else if (campo === "categoria") {
    opciones = OPCIONES_CATEGORIA;
  } else if (campo === "motivo") {
    opciones = OPCIONES_MOTIVO;
  }

  const valorActual = btnElem.getAttribute("data-valor") || "";

  let html = `<div class="sheet-dropdown-inner">`;
  opciones.forEach(op => {
    const esVacio = !op.valor;
    const texto = esVacio ? "— Quitar selección —" : op.texto;
    const esSeleccionado = (op.valor === valorActual);
    const claseOpt = esVacio ? "pill-opt-empty" : op.clase;

    let estiloOptExtra = "";
    if (campo === "soporte" && op.valor) {
      const vOpt = op.valor.trim().toLowerCase();
      if (vOpt === "maría" || vOpt === "maria" || vOpt === "adriel") {
        estiloOptExtra = 'style="background: #f8bbd0 !important; background-color: #f8bbd0 !important; color: #ffffff !important; text-shadow: 0 1px 3px rgba(0, 0, 0, 0.95), 0 0 2px #000 !important; border-color: transparent !important;"';
      }
    }

    html += `
      <div 
        class="sheet-dropdown-item ${claseOpt} ${esSeleccionado ? 'active-opt' : ''}" 
        ${estiloOptExtra}
        onclick="seleccionarOpcionDropdown('${rowId}', '${campo}', '${op.valor.replace(/'/g, "\\'")}')"
      >
        <span>${texto}</span>
        ${esSeleccionado ? '<span class="opt-check">✓</span>' : ''}
      </div>
    `;
  });
  html += `</div>`;

  menu.innerHTML = html;
  menu.style.display = "block";

  posicionarCustomDropdown(btnElem, menu);
}

function posicionarCustomDropdown(btnElem, menu) {
  const rect = btnElem.getBoundingClientRect();
  const menuWidth = Math.max(rect.width, 175);
  menu.style.minWidth = `${menuWidth}px`;

  const margin = 6;
  let top = rect.bottom + margin;
  let left = rect.left + (rect.width / 2) - (menuWidth / 2);

  if (left < 10) left = 10;
  if (left + menuWidth > window.innerWidth - 10) {
    left = window.innerWidth - menuWidth - 10;
  }

  const menuHeight = menu.offsetHeight || 240;
  if (top + menuHeight > window.innerHeight - 10 && rect.top - menuHeight - margin > 10) {
    top = rect.top - menuHeight - margin;
  }

  menu.style.top = `${top + window.scrollY}px`;
  menu.style.left = `${left + window.scrollX}px`;
}

function seleccionarOpcionDropdown(rowId, campo, valor) {
  if (_dropdownActivoInfo && _dropdownActivoInfo.btnElem) {
    const btn = _dropdownActivoInfo.btnElem;
    actualizarColumna(rowId, campo, valor, btn);
  } else {
    actualizarColumna(rowId, campo, valor);
  }
  cerrarCustomDropdown();
}

function cerrarCustomDropdown() {
  const menu = document.getElementById("sheetDropdownMenu");
  if (menu) menu.style.display = "none";
  _dropdownActivoInfo = null;
}

document.addEventListener("click", (e) => {
  const menu = document.getElementById("sheetDropdownMenu");
  if (menu && menu.style.display === "block") {
    if (!menu.contains(e.target) && (!_dropdownActivoInfo || !_dropdownActivoInfo.btnElem.contains(e.target))) {
      cerrarCustomDropdown();
    }
  }
});

window.addEventListener("resize", cerrarCustomDropdown);
document.addEventListener("scroll", (e) => {
  const menu = document.getElementById("sheetDropdownMenu");
  if (!menu || menu.style.display !== "block") return;
  // Si el scroll ocurre dentro del propio menú flotante, permitir el scroll sin cerrarlo
  if (e.target === menu || menu.contains(e.target)) {
    return;
  }
  // Si el scroll fue en la página o en la tabla, cerramos el menú
  cerrarCustomDropdown();
}, true);

// ==========================================
// RENDERIZADO DE TABLA GOOGLE SHEETS
// ==========================================
function renderizarTablaSheet() {
  const tbody = document.getElementById("tablaSheetBody");
  if (!tbody) return;

  const filtro = (document.getElementById("filtroSheet")?.value || "").toLowerCase().trim();
  tbody.innerHTML = "";

  const puedeEditar = esEditor();

  const filtrados = listaLimpiezas.filter(row => {
    if (!filtro) return true;
    return (row.cedula || "").toLowerCase().includes(filtro) ||
           (row.agente || "").toLowerCase().includes(filtro) ||
           (row.soporte || "").toLowerCase().includes(filtro) ||
           (row.categoria || "").toLowerCase().includes(filtro) ||
           (row.motivo || "").toLowerCase().includes(filtro) ||
           (row.monto || "").toLowerCase().includes(filtro);
  });

  if (filtrados.length === 0) {
    if (filtro) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding: 24px; color: #90caf9;">
        No hay coincidencias en los registros cargados actualmente.<br>
        <button type="button" class="btn-header-action" onclick="buscarEnSupabaseDirecto()" style="margin-top: 10px; background: var(--accent); color: var(--accent-oncolor);">
          🔍 Buscar "${filtro}" en todo el historial de Supabase
        </button>
      </td></tr>`;
    } else {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding: 22px; color: #aaa; font-style: italic;">No hay registros en la hoja de control.</td></tr>`;
    }
    actualizarEstadoScrollLoader(false, "");
    return;
  }

  filtrados.forEach(row => {
    const tr = document.createElement("tr");
    tr.setAttribute("data-row-id", row.id);

    // 1. Cédula y botón de edición para editores
    let celdaCedula = `
      <div style="display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
        <strong style="font-size: 0.95rem; letter-spacing: 0.3px;">${row.cedula || '-'}</strong>
        ${puedeEditar ? `<button type="button" class="btn-edit-cedula" onclick="event.stopPropagation(); editarCedulaDirecta('${row.id}')" title="Modificar número de cédula (Editor)" style="background: transparent; border: none; cursor: pointer; font-size: 0.82rem; padding: 0 3px; color: #90caf9; opacity: 0.75; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.75'">✏️</button>` : ''}
      </div>
    `;

    // 2. Monto editable para editores
    let celdaMonto = "";
    if (puedeEditar) {
      celdaMonto = `
        <input 
          type="text" 
          class="sheet-monto-input" 
          value="${row.monto || ''}" 
          placeholder="0.00"
          title="Haz clic para modificar el monto (Presiona Enter o desenfoca para guardar)"
          onblur="actualizarMontoFila('${row.id}', this.value, this)" 
          onkeydown="if(event.key==='Enter') this.blur()"
          style="width: 100px; padding: 3px 6px; margin: 0 auto; font-weight: bold; font-size: 0.84rem; background: var(--input-bg); border: 1px solid var(--card-border); border-radius: 6px; color: var(--input-text); text-align: center;"
        >
      `;
    } else {
      celdaMonto = `<strong>${row.monto || '-'}</strong>`;
    }

    // 3. Dropdown personalizado Soporte
    let selectSoporte = renderizarPillBoton(row.id, 'soporte', row.soporte, puedeEditar);

    // 4. Dropdown personalizado Categoría (Columna 7)
    let selectCategoria = renderizarPillBoton(row.id, 'categoria', row.categoria, puedeEditar);

    // 5. Dropdown personalizado Motivo (Columna 8)
    let selectMotivo = renderizarPillBoton(row.id, 'motivo', row.motivo, puedeEditar);

    // Badge "En proceso": Solo se muestra si alguien la tomó y la columna Soporte aún NO tiene nombre
    const enProc = normalizarNombreEnProceso(row.enProceso || "");
    const tieneSoporte = !!(row.soporte || "").trim();
    const mostrarBadgeEnProceso = enProc && !tieneSoporte;

    const badgeHTML = mostrarBadgeEnProceso
      ? `<span class="badge-en-proceso" title="En proceso por ${enProc} (Toca para desmarcar)">⏳ ${enProc}</span>`
      : ``;

    tr.innerHTML = `
      <td style="text-align: center;">${normalizarFechaMarcaTemporal(row.marcaTemporal)}</td>
      <td style="text-align: center;">${celdaMonto}</td>
      <td style="text-align: center;">${row.agente || '-'}</td>
      <td class="cell-cedula-click" onclick="toggleTomarCedula('${row.id}')" style="text-align: center;" title="Toca para copiar la cédula (Editores: marcar en proceso)">
        <div style="display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
          ${badgeHTML}
          ${celdaCedula}
        </div>
      </td>
      <td style="text-align: center; font-weight: bold; font-size: 1.15rem; color: #4caf50;">${row.ceroPagos ? '✓' : ''}</td>
      <td style="text-align: center;">${selectSoporte}</td>
      <td style="text-align: center;">${selectCategoria}</td>
      <td style="text-align: center;">${selectMotivo}</td>
      <td style="text-align: center;">
        ${puedeEditar ? `<button style="background: #d32f2f; color: #fff; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 0.75rem;" onclick="eliminarRegistro('${row.id}')" title="Eliminar fila">🗑️</button>` : `<span style="color:#999;" title="Solo lectura">🔒</span>`}
      </td>
    `;

    tbody.appendChild(tr);
  });

  if (!filtro) {
    if (hayMasRegistrosSupabase) {
      actualizarEstadoScrollLoader(false, `📜 Mostrando ${listaLimpiezas.length} limpiezas recientes. Desliza hacia abajo o toca aquí para cargar más días anteriores...`);
    } else {
      actualizarEstadoScrollLoader(false, `✅ Se ha cargado todo el historial (${listaLimpiezas.length} registros).`);
    }
  } else {
    actualizarEstadoScrollLoader(false, "");
  }
}

let debounceTimerFiltro = null;
let buscandoEnSupabase = false;

function manejarFiltroSheet(termino) {
  renderizarTablaSheet();

  clearTimeout(debounceTimerFiltro);
  const termLimpio = (termino || "").trim();

  // Si tiene al menos 3 dígitos/letras y no hay coincidencia local
  if (termLimpio.length >= 3 && supabaseClient) {
    debounceTimerFiltro = setTimeout(() => {
      buscarEnSupabaseDirecto(termLimpio);
    }, 550);
  }
}

async function buscarEnSupabaseDirecto(terminoForzado) {
  const input = document.getElementById("filtroSheet");
  const termino = (terminoForzado || (input ? input.value : "")).trim();
  if (!termino || !supabaseClient || buscandoEnSupabase) return;

  const tLower = termino.toLowerCase();
  const coincidenciaLocal = listaLimpiezas.some(r => 
    (r.cedula || "").toLowerCase().includes(tLower) || 
    (r.agente || "").toLowerCase().includes(tLower)
  );

  // Si ya se encontró en memoria local, no gastar llamada a menos que se fuerce
  if (coincidenciaLocal && !terminoForzado) return;

  buscandoEnSupabase = true;
  const tbody = document.getElementById("tablaSheetBody");
  if (tbody) {
    const avisoBuscando = document.createElement("tr");
    avisoBuscando.id = "filaBuscandoSupabase";
    avisoBuscando.innerHTML = `<td colspan="9" style="text-align:center; padding: 12px; color: #90caf9; background: rgba(33, 150, 243, 0.1);">🔎 Buscando "${termino}" en el historial de Supabase...</td>`;
    tbody.prepend(avisoBuscando);
  }

  try {
    const { data, error } = await supabaseClient
      .from("control_limpiezas")
      .select("id, marca_temporal, monto, agente, cedula, cero_pagos, soporte, categoria, motivo, en_proceso, created_at")
      .or(`cedula.ilike.%${termino}%,agente.ilike.%${termino}%`)
      .order("created_at", { ascending: false })
      .limit(50);

    const filaAviso = document.getElementById("filaBuscandoSupabase");
    if (filaAviso) filaAviso.remove();

    if (!error && data && data.length > 0) {
      let agregados = 0;
      data.forEach(item => {
        if (!listaLimpiezas.some(x => x.id === item.id)) {
          listaLimpiezas.push(mapearRegistroLimpieza(item));
          agregados++;
        }
      });

      renderizarTablaSheet();
      if (agregados > 0) {
        notificar("info", "Búsqueda Completada", `Se cargaron <strong>${agregados}</strong> registro(s) anterior(es) desde Supabase.`);
      }
    } else if (!coincidenciaLocal) {
      notificar("warning", "Sin Resultados", `No se encontraron registros para "${termino}" en Supabase.`);
    }
  } catch (err) {
    console.warn("Error buscando en Supabase:", err);
  } finally {
    buscandoEnSupabase = false;
    const filaAviso = document.getElementById("filaBuscandoSupabase");
    if (filaAviso) filaAviso.remove();
  }
}

async function editarCedulaDirecta(rowId) {
  if (!esEditor()) {
    notificar("error", "Acceso Denegado", "Solo los editores pueden modificar cédulas.");
    return;
  }
  const item = listaLimpiezas.find(x => x.id === rowId);
  if (!item) return;

  const nueva = prompt("Modificar número de cédula:", item.cedula || "");
  if (nueva === null) return;

  const valorFinal = nueva.trim();
  if (!valorFinal) {
    notificar("warning", "Cédula Requerida", "El número de cédula no puede estar vacío.");
    return;
  }

  await actualizarCedulaFila(rowId, valorFinal);
}

async function actualizarCedulaFila(id, nuevaCedulaRaw) {
  if (!esEditor()) {
    notificar("error", "Acceso Denegado", "Solo los editores pueden modificar cédulas.");
    renderizarTablaSheet();
    return;
  }

  const item = listaLimpiezas.find(x => x.id === id);
  if (!item) return;

  const valorFinal = (nuevaCedulaRaw || "").trim();
  if (!valorFinal) {
    notificar("warning", "Cédula Requerida", "La cédula no puede quedar vacía.");
    return;
  }

  if (item.cedula !== valorFinal) {
    const cedulaAnterior = item.cedula;
    item.cedula = valorFinal;
    guardarLimpiezasLocalmente();
    renderizarTablaSheet();

    if (supabaseClient) {
      (async () => {
        try {
          await supabaseClient.from("control_limpiezas").update({ cedula: valorFinal }).eq("id", id);
        } catch (err) {
          console.error("Error actualizando cédula en Supabase:", err);
        }
      })();
    }

    notificar("success", "Cédula Modificada", `Cédula actualizada de <strong>${cedulaAnterior}</strong> a <strong>${valorFinal}</strong>.`);
  }
}

async function actualizarMontoFila(id, nuevoMontoRaw, inputElem) {
  if (!esEditor()) {
    notificar("error", "Acceso Denegado", "Solo los editores pueden modificar montos.");
    renderizarTablaSheet();
    return;
  }

  const item = listaLimpiezas.find(x => x.id === id);
  if (!item) return;

  const valorLimpio = (nuevoMontoRaw || "").trim();
  let valorFinal = formatMonto(valorLimpio);
  if (!valorFinal) valorFinal = valorLimpio;
  if (!valorFinal) valorFinal = "0.00";

  if (item.monto !== valorFinal) {
    item.monto = valorFinal;
    if (inputElem) inputElem.value = valorFinal;
    guardarLimpiezasLocalmente();

    if (supabaseClient) {
      (async () => {
        try {
          await supabaseClient.from("control_limpiezas").update({ monto: valorFinal }).eq("id", id);
        } catch (err) {
          console.error("Error actualizando monto en Supabase:", err);
        }
      })();
    }

    notificar("success", "Monto Modificado", `Monto de cédula <strong>${item.cedula}</strong> actualizado a <strong>¢${valorFinal}</strong>.`);
  }
}

async function actualizarColumna(id, campo, valor, selectElem) {
  if (!esEditor()) {
    notificar("error", "Acceso Denegado", "No tienes permisos de editor para modificar esta hoja.");
    renderizarTablaSheet();
    return;
  }

  const item = listaLimpiezas.find(x => x.id === id);
  if (!item) return;

  item[campo] = valor;

  // Si ya tiene soporte asignado, se limpia el badge de en proceso
  if (campo === "soporte" && valor) {
    item.enProceso = "";
    if (canalRealtime) {
      try {
        canalRealtime.send({
          type: 'broadcast',
          event: 'en_proceso_sync',
          payload: { id: id, enProceso: "" }
        });
      } catch(e){}
    }
  }

  // Guardar en memoria y localStorage inmediatamente
  guardarLimpiezasLocalmente();

  // Actualización visual directa e instantánea sin destruir el DOM (0ms de retraso)
  if (selectElem) {
    if (campo === "soporte") {
      selectElem.className = `sheet-pill-btn ${obtenerClaseSoporte(valor)}`;
      selectElem.setAttribute("data-valor", valor || "");
      const lbl = selectElem.querySelector(".sheet-pill-label");
      if (lbl) lbl.textContent = valor || "";
      const vLower = (valor || "").trim().toLowerCase();
      if (vLower === "maría" || vLower === "maria" || vLower === "adriel") {
        selectElem.style.cssText = "min-width: 125px; background: #f8bbd0 !important; background-color: #f8bbd0 !important; color: #ffffff !important; text-shadow: 0 1px 3px rgba(0, 0, 0, 0.95), 0 0 2px #000 !important; border-color: transparent !important;";
      } else {
        selectElem.style.cssText = "min-width: 125px;";
      }
      if (valor) {
        const tr = selectElem.closest("tr");
        if (tr) {
          const badge = tr.querySelector(".badge-en-proceso");
          if (badge) badge.remove();
        }
      }
    }
    else if (campo === "categoria") {
      selectElem.className = `sheet-pill-btn ${obtenerClaseCategoria(valor)}`;
      selectElem.setAttribute("data-valor", valor || "");
      const lbl = selectElem.querySelector(".sheet-pill-label");
      if (lbl) lbl.textContent = valor || "";
    }
    else if (campo === "motivo") {
      selectElem.className = `sheet-pill-btn ${obtenerClaseMotivo(valor)}`;
      selectElem.setAttribute("data-valor", valor || "");
      const lbl = selectElem.querySelector(".sheet-pill-label");
      if (lbl) lbl.textContent = valor || "";
    }
  } else {
    renderizarTablaSheet();
  }

  if (vistaActual === "estadisticas") {
    actualizarEstadisticasYTablaDinamica();
  }

  // Sincronizar en segundo plano con Supabase de forma no bloqueante (Fire-and-forget)
  if (supabaseClient) {
    const updateObj = {};
    if (campo === "monto") updateObj.monto = valor;
    if (campo === "soporte") {
      updateObj.soporte = valor;
      if (valor) updateObj.en_proceso = "";
    }
    if (campo === "categoria") updateObj.categoria = valor;
    if (campo === "motivo") updateObj.motivo = valor;

    (async () => {
      try {
        const { error } = await supabaseClient.from("control_limpiezas").update(updateObj).eq("id", id);
        if (error) {
          console.warn("Reintentando update sin en_proceso:", error.message);
          delete updateObj.en_proceso;
          await supabaseClient.from("control_limpiezas").update(updateObj).eq("id", id);
        }
      } catch(e) {
        console.warn("Update Supabase error:", e);
      }
    })();
  }
}

async function eliminarRegistro(id) {
  if (!esEditor()) {
    notificar("error", "Acceso Denegado", "Solo los editores autorizados pueden eliminar filas.");
    return;
  }
  const item = listaLimpiezas.find(x => x.id === id);
  const cedulaInfo = item && item.cedula ? ` para la cédula ${item.cedula}` : "";
  const confirmar = confirm(`¿Estás seguro de que deseas eliminar este registro${cedulaInfo}? Esta acción no se puede deshacer.`);
  if (!confirmar) return;

  listaLimpiezas = listaLimpiezas.filter(x => x.id !== id);
  guardarLimpiezasLocalmente();

  if (supabaseClient) {
    await supabaseClient.from("control_limpiezas").delete().eq("id", id);
  }

  renderizarTablaSheet();
  notificar("info", "Fila Eliminada", `Registro${cedulaInfo} borrado de la hoja de control.`);
}

// ==========================================
// EXPORTACIÓN A CSV CON RANGO DE FECHAS
// ==========================================
function abrirModalExportarCSV() {
  const modal = document.getElementById("modalExportarCSV");
  if (!modal) {
    ejecutarDescargaCSV();
    return;
  }
  document.getElementById("csvFechaDesde").value = "";
  document.getElementById("csvFechaHasta").value = "";
  actualizarContadorCSV();
  modal.style.display = "flex";
}

function cerrarModalExportarCSV() {
  const modal = document.getElementById("modalExportarCSV");
  if (modal) modal.style.display = "none";
}

function setRangoRapidoCSV(tipo) {
  const hoy = new Date();
  const pad = n => String(n).padStart(2, '0');
  const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  let desde = new Date();
  let hasta = new Date();

  if (tipo === "hoy") {
    // Hoy
  } else if (tipo === "semana") {
    desde.setDate(hoy.getDate() - 7);
  } else if (tipo === "mes") {
    desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  } else if (tipo === "todo") {
    document.getElementById("csvFechaDesde").value = "";
    document.getElementById("csvFechaHasta").value = "";
    actualizarContadorCSV();
    return;
  }

  document.getElementById("csvFechaDesde").value = fmt(desde);
  document.getElementById("csvFechaHasta").value = fmt(hasta);
  actualizarContadorCSV();
}

function extraerFechaDeRegistro(marcaTemporalStr) {
  if (!marcaTemporalStr || marcaTemporalStr === "-") return null;
  const s = String(marcaTemporalStr).trim();
  const fechaParte = s.split(" ")[0];

  if (fechaParte.includes("/")) {
    const p = fechaParte.split("/");
    if (p.length === 3) {
      const d = parseInt(p[0], 10);
      const m = parseInt(p[1], 10) - 1;
      const y = parseInt(p[2], 10);
      return new Date(y, m, d);
    }
  } else if (fechaParte.includes("-")) {
    const p = fechaParte.split("-");
    if (p.length === 3) {
      if (p[0].length === 4) {
        return new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
      } else {
        return new Date(parseInt(p[2], 10), parseInt(p[1], 10) - 1, parseInt(p[0], 10));
      }
    }
  }
  return null;
}

function obtenerRegistrosFiltradosPorFecha(desdeStr, hastaStr) {
  let registros = [...listaLimpiezas];

  let fDesde = null;
  let fHasta = null;

  if (desdeStr) {
    const [y, m, d] = desdeStr.split("-").map(Number);
    fDesde = new Date(y, m - 1, d, 0, 0, 0, 0);
  }
  if (hastaStr) {
    const [y, m, d] = hastaStr.split("-").map(Number);
    fHasta = new Date(y, m - 1, d, 23, 59, 59, 999);
  }

  if (fDesde || fHasta) {
    registros = registros.filter(r => {
      const fechaReg = extraerFechaDeRegistro(r.marcaTemporal);
      if (!fechaReg) return true;
      if (fDesde && fechaReg < fDesde) return false;
      if (fHasta && fechaReg > fHasta) return false;
      return true;
    });
  }

  return registros;
}

let debounceContadorCSV = null;
async function actualizarContadorCSV() {
  const desde = document.getElementById("csvFechaDesde")?.value || "";
  const hasta = document.getElementById("csvFechaHasta")?.value || "";
  const infoElem = document.getElementById("csvInfoRegistros") || document.getElementById("contadorFilasCSV");
  if (!infoElem) return;

  if (!supabaseClient) {
    const filtrados = obtenerRegistrosFiltradosPorFecha(desde, hasta);
    infoElem.innerHTML = `📊 Registros a exportar: <strong>${filtrados.length}</strong> (Modo Local)`;
    return;
  }

  infoElem.innerHTML = `⏳ Calculando registros en Supabase...`;

  clearTimeout(debounceContadorCSV);
  debounceContadorCSV = setTimeout(async () => {
    try {
      let query = supabaseClient.from("control_limpiezas").select("*", { count: "exact", head: true });
      if (desde) query = query.gte("created_at", `${desde}T00:00:00`);
      if (hasta) query = query.lte("created_at", `${hasta}T23:59:59`);

      const { count, error } = await query;
      if (!error && count !== null) {
        infoElem.innerHTML = `📊 Registros encontrados en Supabase: <strong>${count.toLocaleString()}</strong> limpiezas`;
      } else {
        const filtrados = obtenerRegistrosFiltradosPorFecha(desde, hasta);
        infoElem.innerHTML = `📊 Registros a exportar: <strong>${filtrados.length}</strong>`;
      }
    } catch(e) {
      const filtrados = obtenerRegistrosFiltradosPorFecha(desde, hasta);
      infoElem.innerHTML = `📊 Registros a exportar: <strong>${filtrados.length}</strong>`;
    }
  }, 350);
}

async function ejecutarDescargaCSV() {
  const desde = document.getElementById("csvFechaDesde")?.value || "";
  const hasta = document.getElementById("csvFechaHasta")?.value || "";
  const infoElem = document.getElementById("csvInfoRegistros");

  if (infoElem) {
    infoElem.innerHTML = `⏳ Preparando descarga desde Supabase...`;
  }

  let registros = [];
  try {
    if (supabaseClient) {
      let queryBase = supabaseClient
        .from("control_limpiezas")
        .select("marca_temporal, monto, agente, cedula, cero_pagos, soporte, categoria, motivo, created_at")
        .order("created_at", { ascending: false });

      if (desde) queryBase = queryBase.gte("created_at", `${desde}T00:00:00`);
      if (hasta) queryBase = queryBase.lte("created_at", `${hasta}T23:59:59`);

      let offset = 0;
      let lote = 1000;
      while (true) {
        const { data, error } = await queryBase.range(offset, offset + lote - 1);
        if (error || !data || data.length === 0) break;
        registros.push(...data);
        if (data.length < lote) break;
        offset += lote;
      }
    } else {
      registros = obtenerRegistrosFiltradosPorFecha(desde, hasta);
    }
  } catch(e) {
    console.warn("Fallo descarga Supabase, usando local:", e);
    registros = obtenerRegistrosFiltradosPorFecha(desde, hasta);
  }

  if (registros.length === 0) {
    if (infoElem) infoElem.innerHTML = `⚠️ No se encontraron registros en ese rango.`;
    notificar("warning", "Sin Datos", "No hay registros en el rango de fechas seleccionado.");
    return;
  }

  let csvContent = "\uFEFFMarca temporal,Monto,Agente,Cedula,Cero Pagos,Soporte,Categoria,Motivo\n";

  registros.forEach(r => {
    const marcaRaw = r.marca_temporal || r.marcaTemporal || "";
    const marca = `"${normalizarFechaMarcaTemporal(marcaRaw).replace(/"/g, '""')}"`;
    const monto = `"${(r.monto || '').replace(/"/g, '""')}"`;
    const agente = `"${(r.agente || '').replace(/"/g, '""')}"`;
    const cedula = `"${(r.cedula || '').replace(/"/g, '""')}"`;
    const ceroPagos = (r.cero_pagos || r.ceroPagos) ? "TRUE" : "FALSE";
    const soporte = `"${(r.soporte || '').replace(/"/g, '""')}"`;
    const cat = `"${(r.categoria || '').replace(/"/g, '""')}"`;
    const mot = `"${(r.motivo || '').replace(/"/g, '""')}"`;

    csvContent += `${marca},${monto},${agente},${cedula},${ceroPagos},${soporte},${cat},${mot}\n`;
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  let rangoInfo = "";
  if (desde && hasta) rangoInfo = `_${desde}_a_${hasta}`;
  else if (desde) rangoInfo = `_desde_${desde}`;
  else if (hasta) rangoInfo = `_hasta_${hasta}`;
  else rangoInfo = `_completo`;

  link.setAttribute("href", url);
  link.setAttribute("download", `Control_Limpiezas${rangoInfo}_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  cerrarModalExportarCSV();
  notificar("success", "Exportación Exitosa", `Se descargaron <strong>${registros.length}</strong> registros en CSV.`);
}

function exportarLimpiezasCSV() {
  abrirModalExportarCSV();
}
