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