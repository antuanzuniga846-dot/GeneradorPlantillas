// ==========================================
// INICIALIZACIÓN PRINCIPAL & LISTENERS DE EVENTOS
// ==========================================

// Dragging para la calculadora flotante
(function () {
  const calc = document.querySelector(".calculadora");
  const header = document.querySelector(".calc-header-bar") || document.querySelector(".calc-header");
  if (!calc || !header) return;
  let isDragging = false, startX, startY, initialLeft, initialTop;

  header.addEventListener("mousedown", e => {
    if (e.target.tagName === "BUTTON") return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = calc.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;
    e.preventDefault();
  });

  document.addEventListener("mousemove", e => {
    if (!isDragging) return;
    calc.style.left = `${initialLeft + (e.clientX - startX)}px`;
    calc.style.top = `${initialTop + (e.clientY - startY)}px`;
    calc.style.right = "auto";
    calc.style.bottom = "auto";
  });

  document.addEventListener("mouseup", () => { isDragging = false; });
})();

// Listeners de la calculadora
const calcDisp = document.getElementById("calcDisplay");
if (calcDisp) {
  calcDisp.addEventListener("input", function(e) { calcInput = this.value; });
  calcDisp.addEventListener("keydown", function(e) { if (e.key === "Enter") calculate(); });
}

// Formateo de campos monto al desenfocar
document.querySelectorAll('.monto-input').forEach(el => {
  el.addEventListener('blur', function () {
    const formateado = formatMonto(this.value);
    if (formateado !== "") this.value = formateado;
  });
});

// Limpieza de estados de error en inputs

// Exclusividad mutua para casillas de Limpieza de Saldos (ReversiÃ³n, REC, NULL)
const chkReversionLS = document.getElementById("chkReversionLS");
const chkRecLS = document.getElementById("chkRecLS");
const chkNullLS = document.getElementById("chkNullLS");

[chkReversionLS, chkRecLS, chkNullLS].forEach(chk => {
  if (chk) {
    chk.addEventListener("change", function () {
      if (this.checked) {
        if (this !== chkReversionLS && chkReversionLS) chkReversionLS.checked = false;
        if (this !== chkRecLS && chkRecLS) chkRecLS.checked = false;
        if (this !== chkNullLS && chkNullLS) chkNullLS.checked = false;
      }
    });
  }
});

["montoFacturasPendientesLS", "montoWritteOffLS", "montoCeroPagosLS"].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("input", () => marcarErrorGrupo("grupoSaldosLS", "saldosLSError", false));
});

const chkNullErrorElem = document.getElementById("chkNullLS");
if (chkNullErrorElem) {
  chkNullErrorElem.addEventListener("change", () => marcarErrorGrupo("grupoSaldosLS", "saldosLSError", false));
}

if (typeof NP_MONTOS !== "undefined") {
  NP_MONTOS.forEach(m => {
    const el = document.getElementById("npMonto_" + m.clave);
    if (el) el.addEventListener("input", () => marcarErrorGrupo("grupoNoProcede", "noProcedeError", false));
  });
}

if (typeof NP_CONDICIONES !== "undefined") {
  ["np_incubadora", ...NP_CONDICIONES.filter(c => !c.auto).map(c => "np_" + c.clave)].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", () => marcarErrorGrupo("grupoNoProcede", "noProcedeError", false));
  });
}

const npCartaElem = document.getElementById("np_cartaDescargo");
if (npCartaElem) {
  npCartaElem.addEventListener("change", function () {
    const camposCD = document.getElementById("camposCartaDescargo");
    if (camposCD) {
      camposCD.style.display = this.checked ? "block" : "none";
    }
    if (!this.checked) {
      ["fecha_activacion", "fecha_expiracion", "fecha_desactivacion", "terminal"].forEach(id => marcarError(id, false));
    }
    marcarErrorGrupo("grupoNoProcede", "noProcedeError", false);
  });
}

["gestion", "dts", "cedulaRechazo", "nombre", "cedula", "monto", "fecha", "fecha_activacion", "fecha_expiracion", "fecha_desactivacion", "terminal"].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("input", () => marcarError(id, false));
});

// Selector de plantilla
const selectPlantillaElem = document.getElementById("plantilla");
if (selectPlantillaElem) {
  selectPlantillaElem.addEventListener("change", function () {
    cambiarPlantilla(this.value);
  });
}

// Clics en listas de acceso rápido
["listaProcede", "listaNoProcede", "rechazosLista"].forEach(id => {
  const elem = document.getElementById(id);
  if (elem) {
    elem.addEventListener("click", function (e) {
      const li = e.target.closest("li");
      if (!li || !this.contains(li)) return;
      if (e.target.closest(".star-fav") || (e.target.tagName === "SPAN" && !e.target.closest("button"))) {
        toggleFavorito(li.dataset.valor);
      } else {
        accesoRapido(li.dataset.valor);
      }
    });
  }
});

// Cierre de panel de tema al hacer clic fuera
document.addEventListener("click", function (e) {
  const panel = document.getElementById("themePanel");
  const btnSidebar = document.getElementById("sidebarBtnPersonalizar");
  if (panel && panel.style.display === "block") {
    if (!panel.contains(e.target) && (!btnSidebar || !btnSidebar.contains(e.target))) {
      panel.style.display = "none";
    }
  }
});

// Número de gestión solo dígitos
(function () {
  const campo = document.getElementById("gestion");
  if (!campo) return;
  campo.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key.length === 1 && !/\d/.test(e.key)) e.preventDefault();
  });
  campo.addEventListener("paste", function (e) {
    e.preventDefault();
    const texto = (e.clipboardData || window.clipboardData).getData("text").replace(/\D/g, "");
    const ini = campo.selectionStart, fin = campo.selectionEnd;
    campo.value = campo.value.slice(0, ini) + texto + campo.value.slice(fin);
    const pos = ini + texto.length;
    campo.setSelectionRange(pos, pos);
    campo.dispatchEvent(new Event("input", { bubbles: true }));
  });
  campo.addEventListener("input", function () {
    const limpio = campo.value.replace(/\D/g, "");
    if (campo.value !== limpio) campo.value = limpio;
  });
})();

// ==========================================
// INICIALIZACIÓN GENERAL AL CARGAR
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
  actualizarLista();
  renderIndice();
  inicializarTema();
  inicializarOpacidadCampos();
  inicializarFondoPersonalizado();
  inicializarSupabase();
  if (typeof inicializarScrollInfinito === "function") inicializarScrollInfinito();
  inicializarSidebar();
  iniciarRelojTopbar();

  // Comprobar sesión guardada
  if (usuarioLogueado) {
    const modal = document.getElementById("modalLogin");
    if (modal) modal.style.display = "none";
    actualizarUIUsuario();
  } else {
    const modal = document.getElementById("modalLogin");
    if (modal) modal.style.display = "flex";
    cambiarTabLogin('ingreso');
    actualizarUIUsuario();
  }

  // Disparar evento inicial del selector de plantilla
  const selPlantilla = document.getElementById("plantilla");
  if (selPlantilla) {
    cambiarPlantilla(selPlantilla.value);
  }

  // Inicializar estado del Pin del generador
  inicializarPinGenerador();

  // Inicializar estado de activación de la calculadora
  inicializarEstadoCalculadora();
});
