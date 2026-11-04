// ==========================================
// NOTIFICACIONES FLOTANTES (INTELIGENTES) Y DE ESCRITORIO
// ==========================================

let ultimasCedulasNotificadas = new Set();

// Pedir permiso para notificaciones de escritorio en la primera interacción
function inicializarPermisoNotificaciones() {
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    const pedir = () => {
      Notification.requestPermission();
      document.removeEventListener("click", pedir);
      document.removeEventListener("keydown", pedir);
    };
    document.addEventListener("click", pedir, { once: true });
    document.addEventListener("keydown", pedir, { once: true });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", inicializarPermisoNotificaciones);
} else {
  inicializarPermisoNotificaciones();
}

function notificarEscritorio(titulo, mensajeHtmlOTexto) {
  if (!("Notification" in window)) return;

  const textoPlano = (mensajeHtmlOTexto || "")
    .replace(/<br\s*[\/]?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();

  const tituloPlano = (titulo || "Aviso de Limpieza")
    .replace(/<[^>]*>/g, "")
    .trim();

  const mostrar = () => {
    try {
      const n = new Notification(tituloPlano, {
        body: textoPlano,
        icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚠️</text></svg>",
        requireInteraction: false
      });
      setTimeout(() => {
        try { n.close(); } catch (_) {}
      }, 9500);
      n.onclick = () => {
        window.focus();
        try { n.close(); } catch (_) {}
      };
    } catch (e) {
      console.warn("No se pudo mostrar la notificación de escritorio:", e);
    }
  };

  if (Notification.permission === "granted") {
    mostrar();
  } else if (Notification.permission === "default") {
    Notification.requestPermission().then(perm => {
      if (perm === "granted") mostrar();
    });
  }
}

function notificar(tipo, titulo, mensaje, duracionManual = null) {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");

  // Detección: Alertas de limpieza realizada o atendida
  const tLower = (titulo || "").toLowerCase();
  const mLower = (mensaje || "").toLowerCase();
  const esLimpiezaRealizada = 
    tLower.includes("atendida") ||
    tLower.includes("realizada") ||
    tLower.includes("ya se realizó") ||
    tLower.includes("ya fue realizada") ||
    tLower.includes("limpieza realizada") ||
    tLower.includes("limpieza atendida") ||
    tLower.includes("ya realizada") ||
    tLower.includes("ya subida") ||
    mLower.includes("ya se realizó") ||
    mLower.includes("fue actualizada") ||
    mLower.includes("atendida por") ||
    mLower.includes("ya fue atendida") ||
    mLower.includes("ya se encuentra registrada") ||
    mLower.includes("ya estaba en la hoja");

  // Si es alerta de que la limpieza ya está realizada, disparar también notificación nativa de escritorio
  if (esLimpiezaRealizada) {
    notificarEscritorio(titulo, mensaje);
  }

  // Tiempo de permanencia: Limpiezas realizadas duran 9.5s, las demás duran 3.2s
  let tiempoVisibleMs = 3200;
  if (typeof duracionManual === "number") {
    tiempoVisibleMs = duracionManual;
  } else if (esLimpiezaRealizada) {
    tiempoVisibleMs = 9500; // Dura más tiempo en pantalla antes de borrarse
  }

  toast.className = `toast-item ${tipo} ${esLimpiezaRealizada ? 'toast-persistent' : ''}`;

  let icono = "ℹ️";
  if (tipo === "success") icono = "✅";
  if (tipo === "error") icono = "❌";
  if (tipo === "warning") icono = "⚠️";
  if (esLimpiezaRealizada) icono = "🔔";

  const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  let timeoutId = null;

  function cerrarEsteToast() {
    if (timeoutId) clearTimeout(timeoutId);
    toast.classList.add("toast-hiding");
    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 320);
  }

  toast.innerHTML = `
    <div class="toast-icon">${icono}</div>
    <div class="toast-body">
      <div class="toast-title">
        ${titulo}
      </div>
      <div style="margin-top: 2px; line-height: 1.35;">${mensaje}</div>
      <div class="toast-time">${hora}</div>
    </div>
    <button class="toast-close" title="Cerrar notificación">✕</button>
  `;

  toast.querySelector(".toast-close").addEventListener("click", () => {
    cerrarEsteToast();
  });

  container.appendChild(toast);

  // TODAS las notificaciones se borran automáticamente tras su tiempo
  timeoutId = setTimeout(() => {
    cerrarEsteToast();
  }, tiempoVisibleMs);
}

function verificarCedulaEnLimpiezas(cedulaVal) {
  if (!cedulaVal) return;
  const cLimpia = String(cedulaVal).trim().replace(/[-\s]/g, '');
  if (cLimpia.length < 5) return;
  if (ultimasCedulasNotificadas.has(cLimpia)) return;

  const encontrada = listaLimpiezas.find(r => {
    const rCedula = String(r.cedula || '').trim().replace(/[-\s]/g, '');
    return rCedula === cLimpia && r.categoria;
  });

  if (encontrada) {
    ultimasCedulasNotificadas.add(cLimpia);
    let info = `La cédula <strong>${encontrada.cedula}</strong> ya tiene una limpieza atendida.`;
    if (encontrada.soporte) info += `<br>👤 Atendido por: <strong>${encontrada.soporte}</strong>`;
    if (encontrada.categoria) info += `<br>🏷️ Categoría: <strong>${encontrada.categoria}</strong>`;
    if (encontrada.marcaTemporal) info += `<br>🕒 Fecha: <strong>${encontrada.marcaTemporal}</strong>`;
    notificar(
      "warning",
      "⚠️ Limpieza Ya Realizada",
      info,
      true // PERSISTENTE (NO se borra sola)
    );
  }
}

// ==========================================
// MODAL DE DIÁLOGO PERSONALIZADO (PROMISE-BASED)
// ==========================================
let _resolverDialogoActual = null;
let _esPromptDialogo = false;

function mostrarModalDialogo({
  tipo = "danger", // "danger" | "warning" | "info"
  icono = "⚠️",
  titulo = "Confirmar acción",
  subtitulo = "Esta acción es irreversible",
  mensaje = "¿Estás seguro?",
  textoConfirmar = "Aceptar",
  textoCancelar = "Cancelar",
  esConfirmacion = false,
  esPrompt = false,
  valorInicialPrompt = "",
  placeholderPrompt = ""
}) {
  return new Promise((resolve) => {
    const modal = document.getElementById("modalDialogoPersonalizado");
    const card = document.getElementById("dialogCardCustom");
    const iconBadge = document.getElementById("dialogIconBadge");
    const iconText = document.getElementById("dialogIconText");
    const elTitle = document.getElementById("dialogTitle");
    const elSub = document.getElementById("dialogSubtitle");
    const elMsg = document.getElementById("dialogMessage");
    const containerInput = document.getElementById("dialogInputContainer");
    const inputPrompt = document.getElementById("dialogInputPrompt");
    const btnCancel = document.getElementById("dialogBtnCancelar");
    const btnConfirm = document.getElementById("dialogBtnConfirmar");

    if (!modal || !card) {
      if (esPrompt) {
        resolve(window.prompt(mensaje.replace(/<[^>]+>/g, ""), valorInicialPrompt));
      } else if (esConfirmacion) {
        resolve(window.confirm(mensaje.replace(/<[^>]+>/g, "")));
      } else {
        window.alert(mensaje.replace(/<[^>]+>/g, ""));
        resolve(true);
      }
      return;
    }

    _resolverDialogoActual = resolve;
    _esPromptDialogo = esPrompt;

    // Resetear clases de tipo
    card.className = "dialog-card-custom dialog-tipo-" + tipo;
    if (iconBadge) iconBadge.className = "dialog-icon-badge dialog-icon-" + tipo;
    if (btnConfirm) btnConfirm.className = "dialog-btn-confirmar dialog-btn-" + tipo;

    if (iconText) iconText.innerHTML = icono;
    if (elTitle) elTitle.textContent = titulo;
    if (elSub) {
      elSub.textContent = subtitulo;
      elSub.style.display = subtitulo ? "block" : "none";
    }
    if (elMsg) {
      elMsg.innerHTML = mensaje;
      elMsg.style.display = mensaje ? "block" : "none";
    }

    if (containerInput && inputPrompt) {
      if (esPrompt) {
        containerInput.style.display = "block";
        inputPrompt.value = valorInicialPrompt || "";
        inputPrompt.placeholder = placeholderPrompt || "";
      } else {
        containerInput.style.display = "none";
      }
    }

    if (btnConfirm) btnConfirm.textContent = textoConfirmar;
    if (btnCancel) {
      if (esConfirmacion || esPrompt) {
        btnCancel.style.display = "inline-block";
        btnCancel.textContent = textoCancelar;
      } else {
        btnCancel.style.display = "none";
      }
    }

    modal.style.display = "flex";

    // Foco automático
    setTimeout(() => {
      if (esPrompt && inputPrompt) {
        inputPrompt.focus();
        inputPrompt.select();
      } else if (esConfirmacion && btnCancel) {
        btnCancel.focus();
      } else if (btnConfirm) {
        btnConfirm.focus();
      }
    }, 50);
  });
}

function confirmarModalDialogo() {
  if (_esPromptDialogo) {
    const inputPrompt = document.getElementById("dialogInputPrompt");
    const val = inputPrompt ? inputPrompt.value : "";
    cerrarModalDialogo(val);
  } else {
    cerrarModalDialogo(true);
  }
}

function cerrarModalDialogo(resultado) {
  const modal = document.getElementById("modalDialogoPersonalizado");
  if (modal) modal.style.display = "none";
  _esPromptDialogo = false;
  if (typeof _resolverDialogoActual === "function") {
    const fn = _resolverDialogoActual;
    _resolverDialogoActual = null;
    fn(resultado);
  }
}

// Atajo para confirmaciones con diseño idéntico al solicitado
function mostrarModalConfirmacion(opciones = {}) {
  return mostrarModalDialogo({
    tipo: opciones.tipo || "danger",
    icono: opciones.icono || "&#9888;&#65039;",
    titulo: opciones.titulo || "Confirmar eliminación",
    subtitulo: (opciones.subtitulo !== undefined) ? opciones.subtitulo : "Esta acción es irreversible",
    mensaje: opciones.mensaje || "¿Estás seguro de que deseas realizar esta acción?",
    textoConfirmar: opciones.textoConfirmar || "Sí, eliminar",
    textoCancelar: opciones.textoCancelar || "Cancelar",
    esConfirmacion: true
  });
}

// Atajo para alertas con diseño estilizado
function mostrarModalAlerta(opciones = {}) {
  return mostrarModalDialogo({
    tipo: opciones.tipo || "danger",
    icono: opciones.icono || "&#9888;&#65039;",
    titulo: opciones.titulo || "Aviso",
    subtitulo: (opciones.subtitulo !== undefined) ? opciones.subtitulo : "",
    mensaje: opciones.mensaje || "",
    textoConfirmar: opciones.textoConfirmar || "Aceptar",
    esConfirmacion: false
  });
}

// Atajo para prompt modal (captura de texto como la cédula)
function mostrarModalPrompt(opciones = {}) {
  return mostrarModalDialogo({
    tipo: opciones.tipo || "info",
    icono: opciones.icono || "✏️",
    titulo: opciones.titulo || "Modificar valor",
    subtitulo: (opciones.subtitulo !== undefined) ? opciones.subtitulo : "Actualización de datos",
    mensaje: opciones.mensaje || "",
    valorInicialPrompt: opciones.valorInicial || "",
    placeholderPrompt: opciones.placeholder || "",
    textoConfirmar: opciones.textoConfirmar || "Guardar",
    textoCancelar: opciones.textoCancelar || "Cancelar",
    esPrompt: true
  });
}

// Listeners de teclado y click fuera del diálogo
document.addEventListener("keydown", (e) => {
  const modal = document.getElementById("modalDialogoPersonalizado");
  if (!modal || modal.style.display !== "flex") return;
  if (e.key === "Escape") {
    cerrarModalDialogo(null);
  } else if (e.key === "Enter") {
    if (document.activeElement && document.activeElement.id === "dialogBtnCancelar") {
      cerrarModalDialogo(null);
    } else {
      confirmarModalDialogo();
    }
  }
});
