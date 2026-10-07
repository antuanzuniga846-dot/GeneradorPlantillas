// ==========================================
// MÓDULO DE CONTROL DE LIMPIEZAS & SINCRONIZACIÓN
// ==========================================

let listaLimpiezas = JSON.parse(localStorage.getItem(STORAGE_KEY_SHEET)) || [];
let canalRealtime = null;
let intervalSincronizacion = null;

async function cargarDatosDesdeSupabase(silencioso = false) {
  if (!supabaseClient) return;

  try {
    const { data, error } = await supabaseClient
      .from("control_limpiezas")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      const nuevosDatos = data.map(item => {
        const anteriorLocal = listaLimpiezas.find(x => x.id === item.id);
        
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
      });

      const jsonNuevo = JSON.stringify(nuevosDatos);
      const jsonViejo = JSON.stringify(listaLimpiezas);

      if (jsonNuevo !== jsonViejo) {
        listaLimpiezas = nuevosDatos;
        localStorage.setItem(STORAGE_KEY_SHEET, jsonNuevo);
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

async function sincronizarConSupabase() {
  if (supabaseClient) {
    await cargarUsuariosDesdeSupabase();
    await cargarDatosDesdeSupabase(false);
    if (vistaActual === "estadisticas") {
      actualizarEstadisticasYTablaDinamica();
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

function suscribirRealtimeSupabase() {
  if (!supabaseClient) return;
  try {
    if (canalRealtime) {
      try { supabaseClient.removeChannel(canalRealtime); } catch(e){}
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
          const data = payload.payload || {};
          if (data && data.id) {
            const itm = listaLimpiezas.find(x => x.id === data.id);
            if (itm) {
              const nuevoEnProc = normalizarNombreEnProceso(data.enProceso || "");
              if (itm.enProceso !== nuevoEnProc) {
                itm.enProceso = nuevoEnProc;
                localStorage.setItem(STORAGE_KEY_SHEET, JSON.stringify(listaLimpiezas));
                
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
        }
      )
      .on(
        "broadcast",
        { event: "solicitar_estados_en_proceso" },
        () => {
          if (usuarioLogueado) {
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
          setTimeout(() => {
            try {
              canalRealtime.send({
                type: 'broadcast',
                event: 'solicitar_estados_en_proceso',
                payload: {}
              });
            } catch(e){}
          }, 400);
        }
        if (err) console.warn("Realtime error:", err);
      });
  } catch (e) {
    console.warn("Error suscribiendo realtime:", e);
  }

  iniciarPollingSincronizacion();
}

function iniciarPollingSincronizacion() {
  if (intervalSincronizacion) clearInterval(intervalSincronizacion);
  intervalSincronizacion = setInterval(async () => {
    if (supabaseClient && document.visibilityState === "visible") {
      await cargarDatosDesdeSupabase(true);
    }
  }, 3500);
}

function manejarEventoRealtime(payload) {
  const { eventType, new: nuevaFila, old: viejaFila } = payload;

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
      localStorage.setItem(STORAGE_KEY_SHEET, JSON.stringify(listaLimpiezas));
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
      localStorage.setItem(STORAGE_KEY_SHEET, JSON.stringify(listaLimpiezas));
      renderizarTablaSheet();
      if (vistaActual === "estadisticas") {
        actualizarEstadisticasYTablaDinamica();
      }
    }
  } else if (eventType === "DELETE") {
    listaLimpiezas = listaLimpiezas.filter(x => x.id !== viejaFila.id);
    localStorage.setItem(STORAGE_KEY_SHEET, JSON.stringify(listaLimpiezas));
    renderizarTablaSheet();
    if (vistaActual === "estadisticas") {
      actualizarEstadisticasYTablaDinamica();
    }
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

  localStorage.setItem(STORAGE_KEY_SHEET, JSON.stringify(listaLimpiezas));

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
  localStorage.setItem(STORAGE_KEY_SHEET, JSON.stringify(listaLimpiezas));
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
// RENDERIZADO DE TABLA GOOGLE SHEETS
// ==========================================
function renderizarTablaSheet() {
  const tbody = document.getElementById("tablaSheetBody");
  if (!tbody) return;

  const filtro = (document.getElementById("filtroSheet")?.value || "").toLowerCase();
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
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding: 22px; color: #aaa; font-style: italic;">No hay registros en la hoja de control.</td></tr>`;
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
          style="width: 100px; padding: 3px 6px; margin: 0 auto; font-weight: bold; font-size: 0.84rem; background: var(--input-bg); border: 1.5px solid var(--accent); border-radius: 6px; color: var(--input-text); text-align: center;"
        >
      `;
    } else {
      celdaMonto = `<strong>${row.monto || '-'}</strong>`;
    }

    // 3. Select Soporte
    let selectSoporte = `<select class="sheet-select sheet-select-soporte ${obtenerClaseSoporte(row.soporte)}" ${!puedeEditar ? 'disabled title="Solo editores autorizados"' : ''} onchange="actualizarColumna('${row.id}', 'soporte', this.value, this)">`;
    
    let soporteEncontrado = OPCIONES_SOPORTE.some(op => op.valor.toLowerCase() === (row.soporte || "").toLowerCase());
    if (row.soporte && !soporteEncontrado) {
      selectSoporte += `<option value="${row.soporte}" selected>${row.soporte}</option>`;
    }

    OPCIONES_SOPORTE.forEach(op => {
      selectSoporte += `<option value="${op.valor}" ${row.soporte === op.valor ? 'selected' : ''}>${op.texto}</option>`;
    });
    selectSoporte += `</select>`;

    // 4. Select Categoría (Columna 7)
    let selectCategoria = `<select class="sheet-select sheet-select-categoria ${obtenerClaseCategoria(row.categoria)}" ${!puedeEditar ? 'disabled title="Solo editores autorizados"' : ''} onchange="actualizarColumna('${row.id}', 'categoria', this.value, this)">`;
    OPCIONES_CATEGORIA.forEach(op => {
      selectCategoria += `<option value="${op.valor}" ${row.categoria === op.valor ? 'selected' : ''}>${op.texto}</option>`;
    });
    selectCategoria += `</select>`;

    // 5. Select Motivo (Columna 8)
    let selectMotivo = `<select class="sheet-select sheet-select-motivo ${obtenerClaseMotivo(row.motivo)}" ${!puedeEditar ? 'disabled title="Solo editores autorizados"' : ''} onchange="actualizarColumna('${row.id}', 'motivo', this.value, this)">`;
    OPCIONES_MOTIVO.forEach(op => {
      selectMotivo += `<option value="${op.valor}" ${row.motivo === op.valor ? 'selected' : ''}>${op.texto}</option>`;
    });
    selectMotivo += `</select>`;

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
    localStorage.setItem(STORAGE_KEY_SHEET, JSON.stringify(listaLimpiezas));
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
    localStorage.setItem(STORAGE_KEY_SHEET, JSON.stringify(listaLimpiezas));

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
  localStorage.setItem(STORAGE_KEY_SHEET, JSON.stringify(listaLimpiezas));

  // Actualización visual directa e instantánea sin destruir el DOM (0ms de retraso)
  if (selectElem) {
    if (campo === "soporte") {
      selectElem.className = `sheet-select sheet-select-soporte ${obtenerClaseSoporte(valor)}`;
      if (valor) {
        const tr = selectElem.closest("tr");
        if (tr) {
          const badge = tr.querySelector(".badge-en-proceso");
          if (badge) badge.remove();
        }
      }
    }
    else if (campo === "categoria") {
      selectElem.className = `sheet-select sheet-select-categoria ${obtenerClaseCategoria(valor)}`;
    }
    else if (campo === "motivo") {
      selectElem.className = `sheet-select sheet-select-motivo ${obtenerClaseMotivo(valor)}`;
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
  localStorage.setItem(STORAGE_KEY_SHEET, JSON.stringify(listaLimpiezas));

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

function actualizarContadorCSV() {
  const desde = document.getElementById("csvFechaDesde")?.value || "";
  const hasta = document.getElementById("csvFechaHasta")?.value || "";
  const filtrados = obtenerRegistrosFiltradosPorFecha(desde, hasta);
  const contadorElem = document.getElementById("contadorFilasCSV");
  if (contadorElem) {
    contadorElem.innerHTML = `📊 Registros a exportar: <strong>${filtrados.length}</strong> de ${listaLimpiezas.length}`;
  }
}

function ejecutarDescargaCSV() {
  const desde = document.getElementById("csvFechaDesde")?.value || "";
  const hasta = document.getElementById("csvFechaHasta")?.value || "";

  const registros = obtenerRegistrosFiltradosPorFecha(desde, hasta);

  if (registros.length === 0) {
    notificar("warning", "Sin Datos", "No hay registros en el rango de fechas seleccionado.");
    return;
  }

  let csvContent = "\uFEFFMarca temporal,Monto,Agente,Cedula,Cero Pagos,Soporte,Categoria,Motivo\n";

  registros.forEach(r => {
    const marca = `"${(r.marcaTemporal || '').replace(/"/g, '""')}"`;
    const monto = `"${(r.monto || '').replace(/"/g, '""')}"`;
    const agente = `"${(r.agente || '').replace(/"/g, '""')}"`;
    const cedula = `"${(r.cedula || '').replace(/"/g, '""')}"`;
    const ceroPagos = r.ceroPagos ? "TRUE" : "FALSE";
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
