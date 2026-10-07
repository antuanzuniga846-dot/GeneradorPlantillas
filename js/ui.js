// ==========================================
// MÓDULO DE INTERFAZ DE USUARIO, CALCULADORA Y TEMA
// ==========================================

let vistaActual = "generador";

function cambiarVista(vista) {
  vistaActual = vista;
  const vGenerador = document.getElementById("vistaGenerador");
  const vHoja = document.getElementById("vistaHoja");
  const vEstadisticas = document.getElementById("vistaEstadisticas");
  const btnGen = document.getElementById("tabBtnGenerador");
  const btnHoj = document.getElementById("tabBtnHoja");
  const btnEst = document.getElementById("tabBtnEstadisticas");

  if (vista === "generador") {
    if (vGenerador) vGenerador.style.display = "block";
    if (vHoja) vHoja.style.display = "none";
    if (vEstadisticas) vEstadisticas.style.display = "none";
    if (btnGen) btnGen.classList.add("active");
    if (btnHoj) btnHoj.classList.remove("active");
    if (btnEst) btnEst.classList.remove("active");
  } else if (vista === "hoja") {
    if (vGenerador) vGenerador.style.display = "none";
    if (vHoja) vHoja.style.display = "block";
    if (vEstadisticas) vEstadisticas.style.display = "none";
    if (btnGen) btnGen.classList.remove("active");
    if (btnHoj) btnHoj.classList.add("active");
    if (btnEst) btnEst.classList.remove("active");
    renderizarTablaSheet();
  } else if (vista === "estadisticas") {
    if (vGenerador) vGenerador.style.display = "none";
    if (vHoja) vHoja.style.display = "none";
    if (vEstadisticas) vEstadisticas.style.display = "block";
    if (btnGen) btnGen.classList.remove("active");
    if (btnHoj) btnHoj.classList.remove("active");
    if (btnEst) btnEst.classList.add("active");
    actualizarEstadisticasYTablaDinamica();
  }
}

// ==========================================
// CALCULADORA
// ==========================================
let calcInput = "";

function appendCalc(value) {
  calcInput += value;
  const disp = document.getElementById("calcDisplay");
  if (disp) disp.value = calcInput;
}

function evaluarExpresion(expr) {
  const limpia = expr.replace(/\s+/g, "");
  const tokens = limpia.match(/\d+\.?\d*|\.\d+|\*\*|[-+*/()]/g);
  if (!tokens || tokens.join("") !== limpia) throw new Error("Expresión inválida");
  let i = 0;
  const suma = () => {
    let v = producto();
    while (tokens[i] === "+" || tokens[i] === "-") {
      const op = tokens[i++];
      const r = producto();
      v = op === "+" ? v + r : v - r;
    }
    return v;
  };
  const producto = () => {
    let v = potencia();
    while (tokens[i] === "*" || tokens[i] === "/") {
      const op = tokens[i++];
      const r = potencia();
      v = op === "*" ? v * r : v / r;
    }
    return v;
  };
  const potencia = () => {
    const base = unario();
    if (tokens[i] === "**") { i++; return Math.pow(base, potencia()); }
    return base;
  };
  const unario = () => {
    const t = tokens[i++];
    if (t === "-") return -unario();
    if (t === "+") return unario();
    if (t === "(") {
      const v = suma();
      if (tokens[i++] !== ")") throw new Error("Falta )");
      return v;
    }
    if (t === undefined || !/^[\d.]/.test(t)) throw new Error("Expresión inválida");
    return parseFloat(t);
  };
  const resultado = suma();
  if (i !== tokens.length) throw new Error("Expresión inválida");
  return resultado;
}

function calculate() {
  try {
    const sanitizedInput = calcInput.replace(/\./g, '').replace(/,/g, '.');
    const result = evaluarExpresion(sanitizedInput);
    const formattedResult = result.toLocaleString('en-US', { minimumFractionDigits: 2 });
    calcInput = formattedResult;
    const disp = document.getElementById("calcDisplay");
    if (disp) disp.value = calcInput;
  } catch (e) {
    const disp = document.getElementById("calcDisplay");
    if (disp) disp.value = "Error";
    calcInput = "";
  }
}

function clearCalc() {
  calcInput = "";
  const disp = document.getElementById("calcDisplay");
  if (disp) disp.value = "";
}

function backspaceCalc() {
  calcInput = calcInput.slice(0, -1);
  const disp = document.getElementById("calcDisplay");
  if (disp) disp.value = calcInput;
}

function toggleCalculadora() {
  const calc = document.querySelector(".calculadora");
  if (calc) calc.classList.toggle("oculta");
}

// ==========================================
// TEMA & CONTRASTE
// ==========================================
function hexARgb(hex) {
  let c = (hex || "").replace('#', '').trim();
  if (c.length === 3) c = c.split('').map(ch => ch + ch).join('');
  const num = parseInt(c, 16) || 0;
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function luminanciaRelativa({ r, g, b }) {
  const srgb = [r, g, b].map(v => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

function relacionContraste(hexA, hexB) {
  const lA = luminanciaRelativa(hexARgb(hexA)), lB = luminanciaRelativa(hexARgb(hexB));
  const claro = Math.max(lA, lB), oscuro = Math.min(lA, lB);
  return (claro + 0.05) / (oscuro + 0.05);
}

function mezclarHex(hexA, hexB, peso) {
  const a = hexARgb(hexA), b = hexARgb(hexB);
  const comp = (x, y) => Math.round(x + (y - x) * peso);
  return '#' + [comp(a.r, b.r), comp(a.g, b.g), comp(a.b, b.b)].map(v => v.toString(16).padStart(2, '0')).join('');
}

function colorSobreAcento(hex) { 
  return luminanciaRelativa(hexARgb(hex)) > 0.45 ? '#1a1a1a' : '#ffffff'; 
}

function colorAcentoLegible(hex, fondoHex, contrasteMinimo) {
  const minimo = contrasteMinimo || 4.5;
  if (relacionContraste(hex, fondoHex) >= minimo) return hex;
  const fondoClaro = luminanciaRelativa(hexARgb(fondoHex)) > 0.5;
  const mezclaCon = fondoClaro ? '#000000' : '#ffffff';
  let resultado = hex;
  for (let peso = 0.1; peso <= 1; peso += 0.1) {
    resultado = mezclarHex(hex, mezclaCon, peso);
    if (relacionContraste(resultado, fondoHex) >= minimo) break;
  }
  return resultado;
}

function actualizarColoresDerivados() {
  const raiz = document.documentElement;
  const modo = raiz.getAttribute("data-theme") || "dark";
  const accent = (raiz.style.getPropertyValue('--accent') || '#0078d7').trim();
  
  const onColor = colorSobreAcento(accent);
  raiz.style.setProperty('--accent-oncolor', onColor);
  
  const fondoHex = (modo === "light") ? "#f1f5f9" : "#181824";
  raiz.style.setProperty('--accent-text', colorAcentoLegible(accent, fondoHex, 4.5));
  
  // Encabezados dinámicos con degradado y profundidad
  const darkerAccent = mezclarHex(accent, '#000000', 0.35);
  const midDarkAccent = mezclarHex(accent, '#000000', 0.22);
  raiz.style.setProperty('--accent-header', `linear-gradient(135deg, ${accent}, ${darkerAccent})`);
  raiz.style.setProperty('--accent-th', midDarkAccent);
}

function toggleThemePanel() {
  const panel = document.getElementById("themePanel");
  if (panel) {
    const estaVisible = panel.style.display === "block";
    panel.style.display = estaVisible ? "none" : "block";
  }
}

function setModoTema(modo) {
  document.documentElement.setAttribute("data-theme", modo);
  localStorage.setItem("temaModoBuro", modo);
  const radioClaro = document.getElementById("temaClaro");
  const radioOscuro = document.getElementById("temaOscuro");
  if (modo === "light") {
    if (radioClaro) radioClaro.checked = true;
    if (radioOscuro) radioOscuro.checked = false;
  } else {
    if (radioOscuro) radioOscuro.checked = true;
    if (radioClaro) radioClaro.checked = false;
  }
  actualizarColoresDerivados();
}

let _accentPendiente = null, _accentRaf = 0, _accentGuardar = 0;

function aplicarAccent(hex) {
  _accentPendiente = hex;
  if (!_accentRaf) {
    _accentRaf = requestAnimationFrame(() => {
      _accentRaf = 0;
      document.documentElement.style.setProperty("--accent", _accentPendiente);
      actualizarColoresDerivados();
    });
  }
  clearTimeout(_accentGuardar);
  _accentGuardar = setTimeout(() => {
    try { localStorage.setItem("temaAccentBuro", _accentPendiente); } catch (e) {}
  }, 300);
}

function setAccentColor(hex) {
  const campoHex = document.getElementById("colorHex");
  if (campoHex) campoHex.value = hex.toUpperCase();
  aplicarAccent(hex);
}

function setAccentColorFromHex(hex) {
  let valor = (hex || "").trim();
  if (valor && valor[0] !== "#") valor = "#" + valor;
  if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(valor)) {
    const selector = document.getElementById("colorPicker");
    if (selector) selector.value = valor.length === 4 ? "#" + [...valor.slice(1)].map(c => c + c).join("") : valor;
    aplicarAccent(valor);
  }
}

// ==========================================
// AJUSTE DE TRANSPARENCIA & FONDO PERSONALIZADO
// ==========================================
function ajustarOpacidadCampos(valor) {
  const opacidadDecimal = (parseInt(valor, 10) / 100).toFixed(2);
  document.documentElement.style.setProperty("--input-opacity", opacidadDecimal);
  localStorage.setItem("inputOpacityBuro", valor);

  const valText = document.getElementById("inputOpacityVal");
  if (valText) valText.textContent = `${valor}%`;

  const slider = document.getElementById("inputOpacitySlider");
  if (slider && slider.value !== String(valor)) slider.value = valor;
}

function inicializarOpacidadCampos() {
  const opacidadGuardada = localStorage.getItem("inputOpacityBuro") || "30";
  ajustarOpacidadCampos(opacidadGuardada);
}

function manejarSubidaFondo(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    notificar("error", "Archivo Inválido", "Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP).");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;
      const MAX_SIZE = 1920;

      if (width > MAX_SIZE || height > MAX_SIZE) {
        if (width > height) {
          height = Math.round((height * MAX_SIZE) / width);
          width = MAX_SIZE;
        } else {
          width = Math.round((width * MAX_SIZE) / height);
          height = MAX_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      const dataUrlOptimizado = canvas.toDataURL("image/jpeg", 0.85);

      try {
        localStorage.setItem("customBgImageBuro", dataUrlOptimizado);
        const oscuridad = localStorage.getItem("customBgDarknessBuro") || "40";
        aplicarFondoEnDOM(dataUrlOptimizado, oscuridad);
        notificar("success", "Fondo Aplicado", "Imagen de fondo establecida correctamente.");
      } catch (err) {
        console.error("Error guardando imagen:", err);
        notificar("warning", "Aviso de Almacenamiento", "La imagen se aplicó en pantalla pero es muy pesada para guardarse permanentemente.");
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
  event.target.value = "";
}

function aplicarFondoEnDOM(dataUrl, oscuridad = "40") {
  const oscuridadDecimal = (parseInt(oscuridad, 10) / 100).toFixed(2);
  document.documentElement.style.setProperty("--custom-bg-url", `url("${dataUrl}")`);
  document.documentElement.style.setProperty("--bg-darkness", oscuridadDecimal);
  document.body.classList.add("has-custom-bg");

  const removeBtn = document.getElementById("removeBgBtn");
  const adjustWrap = document.getElementById("bgAdjustWrap");
  const slider = document.getElementById("bgDarknessSlider");
  const valText = document.getElementById("bgDarknessVal");

  if (removeBtn) removeBtn.style.display = "block";
  if (adjustWrap) adjustWrap.style.display = "block";
  if (slider) slider.value = oscuridad;
  if (valText) valText.textContent = `${oscuridad}%`;
}

function ajustarOscuridadFondo(valor) {
  const oscuridadDecimal = (parseInt(valor, 10) / 100).toFixed(2);
  document.documentElement.style.setProperty("--bg-darkness", oscuridadDecimal);
  localStorage.setItem("customBgDarknessBuro", valor);

  const valText = document.getElementById("bgDarknessVal");
  if (valText) valText.textContent = `${valor}%`;
}

function quitarFondoPersonalizado() {
  localStorage.removeItem("customBgImageBuro");
  localStorage.removeItem("customBgDarknessBuro");

  document.body.classList.remove("has-custom-bg");
  document.documentElement.style.removeProperty("--custom-bg-url");
  document.documentElement.style.removeProperty("--bg-darkness");

  const removeBtn = document.getElementById("removeBgBtn");
  const adjustWrap = document.getElementById("bgAdjustWrap");

  if (removeBtn) removeBtn.style.display = "none";
  if (adjustWrap) adjustWrap.style.display = "none";

  notificar("info", "Fondo Restaurado", "Se quitó la imagen de fondo personalizada.");
}

function inicializarFondoPersonalizado() {
  const bgGuardado = localStorage.getItem("customBgImageBuro");
  const oscuridadGuardada = localStorage.getItem("customBgDarknessBuro") || "15";

  if (bgGuardado) {
    aplicarFondoEnDOM(bgGuardado, oscuridadGuardada);
  }
}

function inicializarTema() {
  const modoGuardado = localStorage.getItem("temaModoBuro") || "dark";
  const accentGuardado = localStorage.getItem("temaAccentBuro") || "#0078D7";
  setModoTema(modoGuardado);
  document.documentElement.style.setProperty("--accent", accentGuardado);
  const colorPicker = document.getElementById("colorPicker");
  const colorHex = document.getElementById("colorHex");
  if (colorPicker) colorPicker.value = accentGuardado;
  if (colorHex) colorHex.value = accentGuardado.toUpperCase();
  actualizarColoresDerivados();
}
