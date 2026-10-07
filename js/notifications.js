// ==========================================
// NOTIFICACIONES FLOTANTES (INTELIGENTES)
// ==========================================

let ultimasCedulasNotificadas = new Set();

function notificar(tipo, titulo, mensaje, duracionManual = null) {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");

  // Detección: Alertas de limpieza realizada o atendida duran más tiempo
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
    mLower.includes("ya se realizó") ||
    mLower.includes("fue actualizada") ||
    mLower.includes("atendida por") ||
    mLower.includes("ya fue atendida");

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
