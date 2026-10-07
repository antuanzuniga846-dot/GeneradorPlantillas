// ==========================================
// CONFIGURACIÓN GLOBAL, SUPABASE & CONSTANTES
// ==========================================

const DEFAULT_SUPABASE_URL = "https://upxhiylyiebljnpfgmut.supabase.co";
const DEFAULT_SUPABASE_KEY = "sb_publishable_ctDXquEkqLpXpuzOoRvtXQ_Vazap6tB";

let supabaseClient = null;

function inicializarSupabase() {
  const url = localStorage.getItem("supabaseUrlBuro") || DEFAULT_SUPABASE_URL;
  const key = localStorage.getItem("supabaseKeyBuro") || DEFAULT_SUPABASE_KEY;

  const dot = document.getElementById("dbDot");
  const text = document.getElementById("dbStatusText");

  if (url && key && window.supabase) {
    try {
      supabaseClient = window.supabase.createClient(url, key);
      if (dot) dot.className = "db-dot";
      if (text) text.textContent = "Supabase Conectado";
      suscribirRealtimeSupabase();
      cargarUsuariosDesdeSupabase();
      cargarDatosDesdeSupabase();
    } catch (e) {
      console.warn("Supabase init error:", e);
      if (dot) dot.className = "db-dot offline";
      if (text) text.textContent = "Modo Local";
    }
  } else {
    if (dot) dot.className = "db-dot offline";
    if (text) text.textContent = "Modo Local";
  }
}

function abrirModalConfigSupabase() {
  document.getElementById("txtSupabaseUrl").value = localStorage.getItem("supabaseUrlBuro") || "";
  document.getElementById("txtSupabaseKey").value = localStorage.getItem("supabaseKeyBuro") || "";
  document.getElementById("modalConfigSupabase").style.display = "flex";
}

function cerrarModalConfigSupabase() {
  document.getElementById("modalConfigSupabase").style.display = "none";
}

function guardarConfigSupabase() {
  const url = document.getElementById("txtSupabaseUrl").value.trim();
  const key = document.getElementById("txtSupabaseKey").value.trim();

  localStorage.setItem("supabaseUrlBuro", url);
  localStorage.setItem("supabaseKeyBuro", key);
  cerrarModalConfigSupabase();
  inicializarSupabase();
  notificar("success", "Configuración Guardada", "Parámetros de Supabase actualizados.");
}

async function probarConexionSupabase() {
  const url = document.getElementById("txtSupabaseUrl").value.trim();
  const key = document.getElementById("txtSupabaseKey").value.trim();
  if (!url || !key) {
    notificar("warning", "Faltan Datos", "Ingresa la URL y la Key de Supabase.");
    return;
  }
  try {
    const testClient = window.supabase.createClient(url, key);
    const { data, error } = await testClient.from("usuarios_permisos").select("id").limit(1);
    if (error && error.code !== "PGRST116") {
      notificar("error", "Error Supabase", error.message);
    } else {
      notificar("success", "Conexión Exitosa", "Conectado correctamente a tu base de datos Supabase.");
    }
  } catch (err) {
    notificar("error", "Fallo de Conexión", err.message);
  }
}

// ==========================================
// CONSTANTES DE ALMACENAMIENTO Y USUARIOS
// ==========================================
const STORAGE_KEY_AUTH = "sesionAuthBuro_v5";
const STORAGE_KEY_USERS = "dbUsuariosBuro_v5";
const STORAGE_KEY_SHEET = "registroLimpiezasSheet_v5";
const STORAGE_KEY_USERS_V6 = "dbUsuariosBuro_v6";

// Base de datos de usuarios local inicial / de respaldo (28 agentes + soporte)
const USUARIOS_INICIALES = [
  // Administradores & Soporte (Editores)
  { usuario: "admin", nombre: "Administrador", password: "admin123", rol: "editor", activo: true },
  { usuario: "cristofer.mora", nombre: "Cristofer Mora", password: "mora123", rol: "editor", activo: true },
  { usuario: "cristofer", nombre: "Cristofer Mora", password: "mora123", rol: "editor", activo: true },
  { usuario: "maria", nombre: "María", password: "maria123", rol: "editor", activo: true },
  { usuario: "adriel", nombre: "María", password: "adriel123", rol: "editor", activo: true },
  { usuario: "fabricio", nombre: "Fabricio", password: "fabricio123", rol: "editor", activo: true },
  { usuario: "enoc", nombre: "Enoc", password: "enoc123", rol: "editor", activo: true },
  { usuario: "antuan", nombre: "Antuan", password: "antuan123", rol: "editor", activo: true },

  // Agentes Solicitantes (Contraseña: apellido + 123)
  { usuario: "susan.badilla", nombre: "Susan Badilla", password: "badilla123", rol: "solicitante", activo: true },
  { usuario: "kenneth.morera", nombre: "Kenneth Morera", password: "morera123", rol: "solicitante", activo: true },
  { usuario: "sharon.barquero", nombre: "Sharon Barquero", password: "barquero123", rol: "solicitante", activo: true },
  { usuario: "isaac.barrera", nombre: "Isaac Barrera", password: "barrera123", rol: "solicitante", activo: true },
  { usuario: "joselyn.hidalgo", nombre: "Joselyn Hidalgo", password: "hidalgo123", rol: "solicitante", activo: true },
  { usuario: "maria.chavarria", nombre: "Maria Chavarria", password: "chavarria123", rol: "solicitante", activo: true },
  { usuario: "andrea.solis", nombre: "Andrea Solis", password: "solis123", rol: "solicitante", activo: true },
  { usuario: "yesenia.benavides", nombre: "Yesenia Benavides", password: "benavides123", rol: "solicitante", activo: true },
  { usuario: "michael.barrantes", nombre: "Michael Barrantes", password: "barrantes123", rol: "solicitante", activo: true },
  { usuario: "farit.barrientos", nombre: "Farit Barrientos", password: "barrientos123", rol: "solicitante", activo: true },
  { usuario: "alonso.marin", nombre: "Alonso Marin", password: "marin123", rol: "solicitante", activo: true },
  { usuario: "fabiana.carrion", nombre: "Fabiana Carrion", password: "carrion123", rol: "solicitante", activo: true },
  { usuario: "diana.obando", nombre: "Diana Obando", password: "obando123", rol: "solicitante", activo: true },
  { usuario: "maria.camacho", nombre: "Maria Camacho", password: "camacho123", rol: "solicitante", activo: true },
  { usuario: "joset.varela", nombre: "Joset Varela", password: "varela123", rol: "solicitante", activo: true },
  { usuario: "jonathan.rodriguez", nombre: "Jonathan Rodriguez", password: "rodriguez123", rol: "solicitante", activo: true },
  { usuario: "roberto.lopez", nombre: "Roberto Lopez", password: "lopez123", rol: "solicitante", activo: true },
  { usuario: "laura.zuñiga", nombre: "Laura Zuñiga", password: "zuñiga123", rol: "solicitante", activo: true },
  { usuario: "david.cordoba", nombre: "David Cordoba", password: "cordoba123", rol: "solicitante", activo: true },
  { usuario: "yaslin.carmona", nombre: "Yaslin Carmona", password: "carmona123", rol: "solicitante", activo: true },
  { usuario: "yulixa.ramirez", nombre: "Yulixa Ramirez", password: "ramirez123", rol: "solicitante", activo: true },
  { usuario: "melany.iglesias", nombre: "Melany Iglesias", password: "iglesias123", rol: "solicitante", activo: true },
  { usuario: "jorshan.jimenez", nombre: "Jorshan Jimenez", password: "jimenez123", rol: "solicitante", activo: true },
  { usuario: "anthony.zapata", nombre: "Anthony Zapata", password: "zapata123", rol: "solicitante", activo: true },
  { usuario: "olga.rodriguez", nombre: "Olga Rodriguez", password: "rodriguez123", rol: "solicitante", activo: true },
  { usuario: "jazmin.jimenez", nombre: "Jazmin Jimenez", password: "jimenez123", rol: "solicitante", activo: true },
  { usuario: "carlos.selva", nombre: "Carlos Selva", password: "selva123", rol: "solicitante", activo: true },
  { usuario: "roberto.chacon", nombre: "Roberto Chacon", password: "chacon123", rol: "solicitante", activo: true },
  { usuario: "luis.marin", nombre: "Luis Marin", password: "marin123", rol: "solicitante", activo: true }
];

// ==========================================
// DROPDOWNS: SOPORTE, CATEGORÍA Y MOTIVO
// ==========================================
const OPCIONES_SOPORTE = [
  { valor: "", texto: "", clase: "pill-soporte-empty" },
  { valor: "María", texto: "María", clase: "pill-soporte-maria" },
  { valor: "Fabricio", texto: "Fabricio", clase: "pill-soporte-fabricio" },
  { valor: "Enoc", texto: "Enoc", clase: "pill-soporte-enoc" },
  { valor: "Antuan", texto: "Antuan", clase: "pill-soporte-antuan" }
];

const OPCIONES_CATEGORIA = [
  { valor: "", texto: "", clase: "pill-cat-empty" },
  { valor: "No procede", texto: "No procede", clase: "pill-cat-noprocede" },
  { valor: "Repetida", texto: "Repetida", clase: "pill-cat-repetida" },
  { valor: "Control de altas", texto: "Control de altas", clase: "pill-cat-controlaltas" },
  { valor: "Reversión", texto: "Reversión", clase: "pill-cat-reversion" },
  { valor: "SP", texto: "SP", clase: "pill-cat-sp" },
  { valor: "Limpiezas no funcionan", texto: "Limpiezas no funcionan", clase: "pill-cat-nofuncionan" },
  { valor: "Masiva (Verde)", texto: "Masiva", clase: "pill-cat-masiva1" },
  { valor: "Masiva (Amarilla)", texto: "Masiva", clase: "pill-cat-masiva2" },
  { valor: "Masiva (Azul)", texto: "Masiva", clase: "pill-cat-masiva3" },
  { valor: "Masiva (Magenta)", texto: "Masiva", clase: "pill-cat-masiva4" }
];

const OPCIONES_MOTIVO = [
  { valor: "", texto: "", clase: "pill-mot-empty" },
  { valor: "WF+ Facturas", texto: "WF+ Facturas", clase: "pill-mot-wf-facturas" },
  { valor: "Facturas supera 63000", texto: "Facturas supera 63000", clase: "pill-mot-facturas-supera-63000" },
  { valor: "Facturas menos de un año", texto: "Facturas menos de un año", clase: "pill-mot-facturas-menos-ano" },
  { valor: "Cero pagos Supera 63000", texto: "Cero pagos Supera 63000", clase: "pill-mot-cero-supera-63000" },
  { valor: "Cero pagos + Facturas", texto: "Cero pagos + Facturas", clase: "pill-mot-cero-facturas" },
  { valor: "Incubadora", texto: "Incubadora", clase: "pill-mot-incubadora" },
  { valor: "Financiamiento + Facturas", texto: "Financiamiento + Facturas", clase: "pill-mot-financiamiento-facturas" },
  { valor: "Factura menores 2750", texto: "Factura menores 2750", clase: "pill-mot-factura-menores-2750" },
  { valor: "Servicio Suspendido", texto: "Servicio Suspendido", clase: "pill-mot-servicio-suspendido" },
  { valor: "Servicio Activo", texto: "Servicio Activo", clase: "pill-mot-servicio-activo" },
  { valor: "WF supera 63000", texto: "WF supera 63000", clase: "pill-mot-wf-supera-63000" }
];

function obtenerClaseSoporte(val) {
  const v = (val || "").trim().toLowerCase();
  if (v === "maría" || v === "maria" || v === "adriel") return "pill-soporte-maria";
  const m = OPCIONES_SOPORTE.find(o => o.valor.toLowerCase() === v);
  return m ? m.clase : "pill-soporte-empty";
}

function obtenerClaseCategoria(val) {
  const m = OPCIONES_CATEGORIA.find(o => o.valor === val);
  return m ? m.clase : "pill-cat-empty";
}

function obtenerClaseMotivo(val) {
  const m = OPCIONES_MOTIVO.find(o => o.valor === val);
  return m ? m.clase : "pill-mot-empty";
}

// ==========================================
// UTILIDADES: FECHAS, TEXTOS Y NOMBRES
// ==========================================
function pad2(n) {
  return String(n).padStart(2, '0');
}

function formatearFechaHoraEstandar(dateObj = new Date()) {
  const d = (dateObj instanceof Date && !isNaN(dateObj.getTime())) ? dateObj : new Date(dateObj);
  if (isNaN(d.getTime())) return "";
  const dia = pad2(d.getDate());
  const mes = pad2(d.getMonth() + 1);
  const anio = d.getFullYear();
  const hora = pad2(d.getHours());
  const min = pad2(d.getMinutes());
  const seg = pad2(d.getSeconds());
  return `${dia}/${mes}/${anio} ${hora}:${min}:${seg}`;
}

function normalizarFechaMarcaTemporal(str) {
  if (!str) return "-";
  const s = String(str).trim();
  if (!s || s === "-") return "-";

  // Si es formato ISO como "2026-10-01T08:30:00Z"
  if (s.includes("T") && s.includes("-")) {
    const d = new Date(s);
    if (!isNaN(d.getTime())) return formatearFechaHoraEstandar(d);
  }

  const partes = s.split(" ");
  const fechaParte = partes[0];
  const horaParte = partes.slice(1).join(" ");

  if (fechaParte && fechaParte.includes("/")) {
    const segs = fechaParte.split("/");
    if (segs.length === 3) {
      let p1 = parseInt(segs[0], 10);
      let p2 = parseInt(segs[1], 10);
      let anio = parseInt(segs[2], 10);

      let dia = p1;
      let mes = p2;
      // Si el segundo número es > 12 y el primero <= 12, el formato era US MM/DD/YYYY
      if (p2 > 12 && p1 <= 12) {
        dia = p2;
        mes = p1;
      }

      const diaStr = pad2(dia);
      const mesStr = pad2(mes);
      const anioStr = String(anio);

      return horaParte ? `${diaStr}/${mesStr}/${anioStr} ${horaParte}` : `${diaStr}/${mesStr}/${anioStr}`;
    }
  } else if (fechaParte && fechaParte.includes("-")) {
    const segs = fechaParte.split("-");
    if (segs.length === 3 && segs[0].length === 4) {
      return `${pad2(segs[2])}/${pad2(segs[1])}/${segs[0]}${horaParte ? ' ' + horaParte : ''}`;
    }
  }

  return s;
}

function normalizarNombreEnProceso(nombre) {
  if (!nombre) return "";
  const n = String(nombre).trim();
  const lower = n.toLowerCase();
  if (lower.includes("maria") || lower.includes("chavarria") || lower === "adriel") {
    return "María";
  }
  return n;
}

function normalizarStr(txt) {
  return (txt || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
