// ==========================================
// MÓDULO DE GENERACIÓN DE PLANTILLAS
// ==========================================

const plantillas = {
  "CON ACTUALIZACIÓN DE SEGMENTACIÓN": "Fecha:{fecha}\nHora:{hora}\n\nBuen día,\n\nSe procede con visto bueno para venta nueva, cédula {cedula}, a nombre del cliente {nombre}, base a las evidencias adjuntas, el mismo cumplió con los pagos correspondientes con la empresa. Adicional les comento, que las referencias crediticias, así como la segmentación del cliente se actualizaron correctamente\n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!",

  "NO SE PUEDE ACTUALIZAR SEGMENTACIÓN": "Fecha:{fecha}\nHora:{hora}\n\nBuen día,\n\nSe procede con visto bueno para venta nueva, cédula {cedula}, a nombre de {nombre}, base a las evidencias adjuntas, el mismo cumplió con los pagos correspondientes con la empresa. Adicional les comento, que las referencias crediticias del cliente se actualizaron correctamente. En cuanto a la modificación de segmentación del cliente, debe de solicitarse por medio de caso Qflow, a control de altas\n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!",

  "VISTO BUENO CARTA DE DESCARGO": "Fecha:{fecha}\nHora:{hora}\n\nAPTO PARA CARTA DE DESCARGO ✅\n\nCliente: {nombre}\nIdentificación: {cedula}\nSe valida que el cliente no mantiene saldos pendientes y cumple las condiciones.\nPuede continuar con el proceso de inmediato.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es: {gestion}\nAnte cualquier duda o inconveniente puedes comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!.",

  "VISTO BUENO": "Fecha:{fecha}\nHora:{hora}\n\nAPTO PARA VENTA ✅\n\nCliente: {nombre}\nIdentificación: {cedula}\nSe valida que el cliente no mantiene saldos pendientes y cumple las condiciones para contratación.\nPuede continuar con el proceso de venta de inmediato.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es: {gestion}\nAnte cualquier duda o inconveniente puedes comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!.",



  "NO PROCEDE": "",

  "NC APLICADA": "Fecha:{fecha}\nHora:{hora}\n\nBuen día,\n\nSe procede con visto bueno para la venta nueva cédula {cedula}, a nombre del cliente {nombre}, con base a la política de excepción para la apertura de ventas el mismo se le aplicó una nota de crédito el pasado {fechaNC}, por el monto de ¢ {monto}.\n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!",

  "LIMPIEZA DE SALDOS": "Fecha:{fecha}\nHora:{hora}\n\nCONDONACIÓN APROBADA ✅\n\nCliente: {nombre}\nIdentificación: {cedula}\nMonto a condonar: ₡{montoCondonar}{desgloseLS}\nSe valida que el cliente cumple con todas las condiciones establecidas para la condonación de saldo.\nPuede continuar con el proceso de venta.{vigenciaLS}\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es: {gestion}\nAnte cualquier duda o inconveniente puedes comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!.",

  // RECHAZOS 
  "DOCUMENTO ALTERADO": "Buen día,\n\nEl caso se rechaza debido a sospechas de alteración en el documento de identidad.\n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!.",

  "RECHAZO POR CÉDULA NO LEGIBLE": "Buen día,\n\nEl caso se rechaza por no adjuntar el documento de identidad legible y claro, fundamental para realizar el trámite.\n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!.",

  "RECHAZO POR CONTRATO ACTIVO": "Buen día,\n\nNo procede el análisis, el cliente tiene servicios activos. El análisis de buró no aplica para segundas ni terceras ventas, únicamente para clientes desactivados en su totalidad.\n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!",

  "CÉDULA AMBAS CARAS": " Buen día,\n\nEl caso se rechaza por no adjuntar el documento de identidad por ambas caras, fundamental para realizar el trámite \n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!.",   

  "CAPTURA DE PANTALLA": "Buen día,\n\nEl caso se rechaza debido a que el documento de identidad adjunto está en pdf, escaneo, fotocopia, captura de pantalla o emplasticado y no corresponde a una fotografía del documento original, por lo que no es posible validar su autenticidad. Les solicitamos adjuntar una fotografía legible y clara del documento de identidad original para proceder con el análisis.\n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!.",

  "CUATRO ESQUINAS": "Buen día,\n\nEl caso se rechaza debido a que en la fotografía adjunta no se aprecia el documento de identidad en su totalidad, ya que se muestra recortado o incompleto. Para continuar con el debido análisis del cliente, es necesario contar con una fotografía clara y completa del documento, en la que puedan apreciarse las cuatro esquinas del mismo.\n\nLes solicitamos adjuntar nuevamente el documento cumpliendo con lo antes indicado.\n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!.",

  "CONTROL DE ALTAS": "Buen día,\n\nNo es posible brindar visto bueno debido a que la información del cliente se muestra errónea en el sistema, por favor, enviar el caso a control de altas para su debido análisis y corrección.\n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!.",

  "NO COINCIDE (CUANDO LA INFORMACIÓN DE LA PLANTILLA NO COINCIDE CON LA FOTOGRAFÍA)": "Buen día,\n\nEl caso se rechaza por no coincidir el documento de identidad con la información adjunta.\n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!.",

  "NO LEGIBLE": "Buen día,\n\nEl caso se rechaza por no adjuntar el documento de identidad legible y claro, fundamental para realizar el trámite. \n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!.",

  "SIN CÉDULA": " Buen día,\n\nEl caso se rechaza por no adjuntar el documento de identidad, fundamental para realizar el trámite.\n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!.",

  "SIN INFORMACIÓN": "Buen día,\n\nEl caso se rechaza por no venir la plantilla completa. Deben completarla y enviarla junto con la cédula del cliente por ambos lados.\n\nBuenas tardes\n\nSu apoyo con la validación del caso \n\nNombre del cliente: xxxxxxxxxxx\n\nCédula del cliente: xxxxxxxxxxx\n\n**Solicitud visto bueno**\n\nAdjuntar documento de identidad por ambos lados (legible) \n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!.",

  "CONTACTO": "Buen día,\n\nPara brindarle una mejor atención, me brinda por favor su nombre completo y a cuál agente autorizado pertenece\n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!.",

  "SIN REGISTROS": "Buen día,\n\nEl análisis no procede ya que el cliente no posee registros con Claro.\n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!. ",

  "DOCUMENTO VENCIDO": "Buen día,\n\nEl análisis no procede ya que el documento de identidad no se encuentra vigente, \n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día! ",

  "DOCUMENTO DETERIORADO": "Buen día,\n\nEl caso se rechaza por remitir un documento de identidad deteriorado, necesario en buen estado ya que es fundamental para proceder con el análisis.\n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!.",

  "DOCUMENTO CON MANCHAS": "Buen día,\n\nEl caso se rechaza por motivo que el documento de identidad remitido presenta manchas que afectan su nitidez y legibilidad de la información.\nFavor enviar documento de identidad en condiciones claras y legibles para proceder con el análisis.\n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!.",

  "SPAM": "Buen día,\n\nEl caso se rechaza debido a que el uso de mensajes en forma de spam no es necesario para el análisis del cliente.\n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!.",

  "FECHA SIN FORMATO": "Fecha:{fecha}\nHora:{hora}\n\nBuen día,\n\nEl caso se rechaza por motivo que el documento presenta alteraciones físicas y no coincide con Migracion y Extranjeria. \n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!."
};

function accesoRapido(texto) {
  const select = document.getElementById('plantilla');
  if (select && texto) {
    select.value = texto;
    cambiarPlantilla(texto);
  }
}

function actualizarLista() {
  const select = document.getElementById("plantilla");
  if (!select) return;
  select.innerHTML = "";
  Object.keys(plantillas).forEach(nombre => {
    const option = document.createElement("option");
    option.value = nombre;
    option.textContent = nombre;
    select.appendChild(option);
  });
}

// ---- NO PROCEDE ----
const NP_MONTOS = [
  { clave: "ceroPagos", etiqueta: "Cero Pagos" },
  { clave: "facturasPendientes", etiqueta: "Facturas Pendientes" },
  { clave: "saldoWritteOff", etiqueta: "Saldo WritteOff" }
];

const NP_CONDICIONES = [
  { clave: "facturasMenoresAno", etiqueta: "Factura menor a 1 año", frase: "factura menor a un año", motivo: "mantiene una o varias facturas con antigüedad menor a 1 año" },
  { clave: "suspendido", etiqueta: "Suspendido", frase: "servicio suspendido", motivo: "mantiene un servicio suspendido" },
  { clave: "montoFueraRango", etiqueta: "Monto fuera de rango", frase: "monto fuera de rango", motivo: "mantiene un monto fuera del rango permitido", auto: true },
  { clave: "financiamientoPendiente", etiqueta: "Financiamiento pendiente", frase: "un financiamiento pendiente", motivo: "mantiene un financiamiento pendiente" },
  { clave: "servicioActivo", etiqueta: "Servicio activo", frase: "servicio activo", motivo: "mantiene un servicio activo en alguna raíz" }
];

const NP_MOTIVOS_MONTO = {
  ceroPagos: "mantiene un cero pagos",
  ceroPagosIncubadora: "mantiene un cero pagos incubadora",
  facturasPendientes: "mantiene facturas pendientes",
  saldoWritteOff: "mantiene un saldo WritteOff"
};

const NP_RANGO_MIN = 2750;
const NP_RANGO_MAX = 63000;

function sumarMontoTexto(texto) {
  return String(texto || "").split("+").reduce((acc, t) => acc + (t.trim() ? parseMontoTermino(t) : 0), 0);
}

function totalFueraDeRango(montos) {
  const conMonto = montos.filter(m => m.monto);
  if (!conMonto.length) return false;
  const total = conMonto.reduce((acc, m) => acc + sumarMontoTexto(m.monto), 0);
  return total > NP_RANGO_MAX || total < NP_RANGO_MIN;
}

function obtenerNoProcedeDatos() {
  const incubadora = document.getElementById("np_incubadora")?.checked || false;
  const montos = NP_MONTOS
    .map(m => ({ clave: m.clave, etiqueta: m.etiqueta, monto: document.getElementById("npMonto_" + m.clave)?.value.trim() || "" }))
    .filter(m => m.monto || (m.clave === "ceroPagos" && incubadora));
  montos.forEach(m => {
    if (m.clave === "ceroPagos" && incubadora) m.etiqueta = "Cero Pagos Incubadora";
  });
  const fueraRango = totalFueraDeRango(montos);
  const condiciones = NP_CONDICIONES.filter(c => c.auto ? fueraRango : document.getElementById("np_" + c.clave)?.checked);
  const cartaDescargo = document.getElementById("np_cartaDescargo")?.checked || false;
  const fecha_activacion = document.getElementById("fecha_activacion")?.value.trim() || "";
  const fecha_expiracion = document.getElementById("fecha_expiracion")?.value.trim() || "";
  const fecha_desactivacion = document.getElementById("fecha_desactivacion")?.value.trim() || "";
  const terminal = document.getElementById("terminal")?.value.trim() || "";
  return { incubadora, montos, condiciones, cartaDescargo, fecha_activacion, fecha_expiracion, fecha_desactivacion, terminal };
}

function construirNoProcede(d) {
  const conMonto = d.montos.filter(m => m.monto);
  const total = formatMonto(conMonto.map(m => m.monto).join("+"));

  const titulo = d.cartaDescargo ? "NO APTA PARA CARTA DE DESCARGO ❌" : "NO APLICA ❌";
  let t = "Fecha:{fecha}\nHora:{hora}\n\n" + titulo + "\n\nCliente: {nombre}\nIdentificación: {cedula}\n";
  if (conMonto.length === 1) {
    t += "Monto adeudado: ₡" + total + " (" + conMonto[0].etiqueta + ")\n";
  } else if (conMonto.length > 1) {
    t += "Monto adeudado: ₡" + total + "\n";
    t += conMonto.map(m => m.etiqueta + ": ₡" + formatMonto(m.monto)).join("\n") + "\n";
  }
  if (d.condiciones.length) {
    const fr = d.condiciones.map(c => c.frase);
    const lista = fr.length > 1 ? fr.slice(0, -1).join(", ") + " y " + fr[fr.length - 1] : fr[0];
    t += "⚠️ Cliente cuenta con " + lista + ". ⚠️\n";
  }

  if (d.cartaDescargo && (d.fecha_activacion || d.fecha_expiracion || d.fecha_desactivacion || d.terminal)) {
    t += "\nEl cliente tiene penalidad por retiro anticipado, no se encuentra evidencia del pago en ONBASE o interacciones anteriores que los respalden.\n\n";
    t += `    I. Fecha de activación: ${d.fecha_activacion}\n`;
    t += `    II. Fecha de expiración: ${d.fecha_expiracion}\n`;
    t += `    III. Fecha de desactivación: ${d.fecha_desactivacion}\n`;
    t += `    IV. Terminal ligado: ${d.terminal}\n\n`;
    t += "Si mantienen evidencia que demuestre lo contrario, favor hacerla llegar para validar nuevamente el caso.\n";
  }

  t += "\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es: {gestion}\nAnte cualquier duda o inconveniente puedes comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!" + (d.cartaDescargo ? "" : ".");
  return t;
}

function cambiarPlantilla(seleccionDirecta) {
  const select = document.getElementById("plantilla");
  const seleccion = (seleccionDirecta !== undefined ? seleccionDirecta : (select ? select.value : "")).trim();
  if (select && seleccionDirecta !== undefined) {
    select.value = seleccion;
  }

  const checkboxesLimpiezaSaldos = document.getElementById("checkboxesLimpiezaSaldos");
  const checkboxesNoProcede = document.getElementById("checkboxesNoProcede");
  const formulario = document.getElementById("formulario");
  const campoFecha = document.getElementById("campoFecha");
  const montoInput = document.getElementById("montoInput");

  if (checkboxesLimpiezaSaldos) checkboxesLimpiezaSaldos.style.display = (seleccion === "LIMPIEZA DE SALDOS") ? "block" : "none";
  if (checkboxesNoProcede) checkboxesNoProcede.style.display = (seleccion === "NO PROCEDE") ? "block" : "none";
  if (campoFecha) campoFecha.style.display = (seleccion === "NC APLICADA") ? "block" : "none";
  if (montoInput) montoInput.style.display = (seleccion === "NC APLICADA") ? "block" : "none";

  const camposCD = document.getElementById("camposCartaDescargo");
  const npCarta = document.getElementById("np_cartaDescargo");
  if (camposCD) {
    camposCD.style.display = (seleccion === "NO PROCEDE" && npCarta && npCarta.checked) ? "block" : "none";
  }

  const conFormulario = [
    "NO PROCEDE",
    "NC APLICADA",
    "VISTO BUENO",
    "VISTO BUENO CARTA DE DESCARGO",
    "LIMPIEZA DE SALDOS",
    "CON ACTUALIZACIÓN DE SEGMENTACIÓN",
    "NO SE PUEDE ACTUALIZAR SEGMENTACIÓN"
  ];
  const esConFormulario = conFormulario.includes(seleccion);
  if (formulario) {
    formulario.style.display = esConFormulario ? "block" : "none";
  }

  const campoCedulaRechazo = document.getElementById("campoCedulaRechazo");
  if (campoCedulaRechazo) {
    const esRechazo = !esConFormulario;
    campoCedulaRechazo.style.display = esRechazo ? "block" : "none";
    if (esRechazo) {
      const cedRegular = document.getElementById("cedula")?.value.trim() || "";
      const inpRechazo = document.getElementById("cedulaRechazo");
      if (inpRechazo && cedRegular && !inpRechazo.value) {
        inpRechazo.value = cedRegular;
      }
    } else {
      const cedRechazo = document.getElementById("cedulaRechazo")?.value.trim() || "";
      const inpRegular = document.getElementById("cedula");
      if (inpRegular && cedRechazo && !inpRegular.value) {
        inpRegular.value = cedRechazo;
      }
    }
  }

  // Resaltar plantilla activa en el índice lateral
  document.querySelectorAll(".indice-lateral li").forEach(li => {
    if (li.dataset.valor === seleccion) {
      li.classList.add("activo");
    } else {
      li.classList.remove("activo");
    }
  });
}

function parseMontoTermino(termino) {
  let s = (termino || "").trim();
  if (s === "") return 0;
  s = s.replace(/\s+/g, '');
  s = s.replace(/[^0-9.,]/g, '');
  if (s === "") return 0;

  const tieneComa = s.indexOf(',') !== -1;
  const tienePunto = s.indexOf('.') !== -1;
  let sepDecimal = null;

  if (tieneComa && tienePunto) {
    sepDecimal = s.lastIndexOf(',') > s.lastIndexOf('.') ? ',' : '.';
  } else if (tieneComa || tienePunto) {
    const sep = tieneComa ? ',' : '.';
    const partes = s.split(sep);
    const ultimaParte = partes[partes.length - 1];
    if (partes.length === 2 && ultimaParte.length > 0 && ultimaParte.length <= 2) {
      sepDecimal = sep;
    } else {
      sepDecimal = null;
    }
  }

  let enteroStr, decimalStr;
  if (sepDecimal) {
    const sepMiles = sepDecimal === ',' ? '.' : ',';
    const sinMiles = s.split(sepMiles).join('');
    const idx = sinMiles.lastIndexOf(sepDecimal);
    enteroStr = sinMiles.slice(0, idx).replace(/[.,]/g, '');
    decimalStr = sinMiles.slice(idx + 1).replace(/[^0-9]/g, '');
  } else {
    enteroStr = s.replace(/[.,]/g, '');
    decimalStr = '';
  }

  enteroStr = enteroStr.replace(/[^0-9]/g, '') || '0';
  decimalStr = (decimalStr + '00').slice(0, 2);

  const valor = parseFloat(enteroStr + '.' + decimalStr);
  return isNaN(valor) ? 0 : valor;
}

function formatMonto(valor) {
  if (!valor) return "";
  const texto = String(valor).trim();
  if (texto === "") return "";

  const terminos = texto.split('+');
  let suma = 0;
  let algunTermino = false;

  terminos.forEach(t => {
    if (t.trim() !== "") {
      algunTermino = true;
      suma += parseMontoTermino(t);
    }
  });

  if (!algunTermino) return "";
  return suma.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function marcarError(id, hayError) {
  const input = document.getElementById(id);
  const error = document.getElementById(id + "Error");
  if (!input) return;
  if (hayError) {
    input.classList.add("campo-error");
    if (error) error.style.display = "inline";
  } else {
    input.classList.remove("campo-error");
    if (error) error.style.display = "none";
  }
}

function marcarErrorGrupo(grupoId, errorId, hayError) {
  const grupo = document.getElementById(grupoId);
  const error = document.getElementById(errorId);
  if (!grupo) return;
  if (hayError) {
    grupo.classList.add("campo-error");
    if (error) error.style.display = "inline";
  } else {
    grupo.classList.remove("campo-error");
    if (error) error.style.display = "none";
  }
}

function validarCampos() {
  let valido = true;

  const gestionVal = document.getElementById("gestion")?.value.trim() || "";
  marcarError("gestion", !gestionVal);
  if (!gestionVal) valido = false;

  const dtsVal = document.getElementById("dts")?.value.trim() || "";
  marcarError("dts", !dtsVal);
  if (!dtsVal) valido = false;

  const campoCedulaRechazo = document.getElementById("campoCedulaRechazo");
  const rechazoVisible = campoCedulaRechazo && campoCedulaRechazo.style.display !== "none";
  if (rechazoVisible) {
    const cedulaRechazoVal = document.getElementById("cedulaRechazo")?.value.trim() || "";
    marcarError("cedulaRechazo", !cedulaRechazoVal);
    if (!cedulaRechazoVal) valido = false;
  }

  const formularioVisible = document.getElementById("formulario") && document.getElementById("formulario").style.display !== "none";
  if (formularioVisible) {
    const nombreVal = document.getElementById("nombre")?.value.trim() || "";
    marcarError("nombre", !nombreVal);
    if (!nombreVal) valido = false;

    const cedulaVal = document.getElementById("cedula")?.value.trim() || "";
    marcarError("cedula", !cedulaVal);
    if (!cedulaVal) valido = false;
  }

  const montoVisible = document.getElementById("montoInput") && document.getElementById("montoInput").style.display !== "none";
  if (montoVisible) {
    const montoVal = document.getElementById("monto")?.value.trim() || "";
    marcarError("monto", !montoVal);
    if (!montoVal) valido = false;
  }

  const campoFechaVisible = document.getElementById("campoFecha") && document.getElementById("campoFecha").style.display !== "none";
  if (campoFechaVisible) {
    const fechaVal = document.getElementById("fecha")?.value.trim() || "";
    marcarError("fecha", !fechaVal);
    if (!fechaVal) valido = false;
  }

  const grupoNP = document.getElementById("checkboxesNoProcede");
  const grupoNPVisible = grupoNP && grupoNP.style.display !== "none";
  if (grupoNPVisible) {
    const dNP = obtenerNoProcedeDatos();
    const hayAlgo = dNP.montos.length > 0 || dNP.condiciones.length > 0;
    marcarErrorGrupo("grupoNoProcede", "noProcedeError", !hayAlgo);
    if (!hayAlgo) valido = false;
  }

  const camposCD = document.getElementById("camposCartaDescargo");
  const camposCDVisible = camposCD && camposCD.style.display !== "none";
  if (camposCDVisible) {
    ["fecha_activacion", "fecha_expiracion", "fecha_desactivacion", "terminal"].forEach(id => {
      const el = document.getElementById(id);
      const val = el ? el.value.trim() : "";
      marcarError(id, !val);
      if (!val) valido = false;
    });
  }

  const grupoLS = document.getElementById("checkboxesLimpiezaSaldos");
  const grupoLSVisible = grupoLS && grupoLS.style.display !== "none";
  if (grupoLSVisible) {
    const algunoLS = ["montoFacturasPendientesLS", "montoWritteOffLS", "montoCeroPagosLS"]
      .some(id => {
        const el = document.getElementById(id);
        return el && el.value.trim();
      });
    marcarErrorGrupo("grupoSaldosLS", "saldosLSError", !algunoLS);
    if (!algunoLS) valido = false;
  }

  return valido;
}

function generarPlantilla() {
  if (!validarCampos()) return false;

  const plantillaKey = document.getElementById("plantilla").value;
  const ahora = new Date();
  const dia = String(ahora.getDate()).padStart(2, '0');
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const anio = ahora.getFullYear();

  let horaNum = ahora.getHours();
  const minutos = String(ahora.getMinutes()).padStart(2, '0');
  const periodo = horaNum >= 12 ? 'p.m.' : 'a.m.';
  horaNum = horaNum % 12;
  horaNum = horaNum ? horaNum : 12;

  const horaFormateada = `${horaNum}:${minutos} ${periodo}`;
  const fechaFormateada = `${dia}/${mes}/${anio}`;

  const gestion = document.getElementById("gestion")?.value.trim().toUpperCase() || "";
  const nombre = document.getElementById("nombre")?.value.trim().toUpperCase() || "";
  const cedula = document.getElementById("cedula")?.value.trim() || "";
  const monto = document.getElementById("monto")?.value.trim() || "";

  let fechaInput = document.getElementById("fecha")?.value.trim() || "";
  let fecha = "";
  if (fechaInput) {
    const partes = fechaInput.split("-");
    fecha = `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  // ---- Limpieza de saldos ----
  const montoFacturasPendientesLS = document.getElementById('montoFacturasPendientesLS')?.value.trim() || "";
  const montoWritteOffLS = document.getElementById('montoWritteOffLS')?.value.trim() || "";
  const montoCeroPagosLS = document.getElementById('montoCeroPagosLS')?.value.trim() || "";
  const tiposLS = [
    { etiqueta: "Facturas Pendientes", monto: montoFacturasPendientesLS },
    { etiqueta: "Cero Pagos", monto: montoCeroPagosLS },
    { etiqueta: "Writte Off", monto: montoWritteOffLS }
  ].filter(t => t.monto);
  const totalLS = formatMonto(tiposLS.map(t => t.monto).join("+"));
  const montoCondonar = totalLS;
  let vigenciaLS = "";
  if (montoFacturasPendientesLS) {
    vigenciaLS = "\n\n⚠️ Importante: La condonación tendrá una vigencia de 5 días naturales. Si la contratación no se completa dentro de este plazo, la deuda será reversada automáticamente.";
    if (montoWritteOffLS || montoCeroPagosLS) vigenciaLS += " Aplica únicamente para el monto de Facturas Pendientes.";
  }
  const desgloseLS = tiposLS.length
    ? "\nConcepto: " + tiposLS.map(t => `${t.etiqueta} ₡${formatMonto(t.monto)}`).join(", ")
    : "";

  let base = plantillas[plantillaKey] || "";
  let montoFinal = formatMonto(monto);
  let desglose = "";

  if (plantillaKey === "NO PROCEDE") {
    base = construirNoProcede(obtenerNoProcedeDatos());
  }

  const valores = {
    nombre, gestion, cedula,
    fecha: fechaFormateada,
    hora: horaFormateada,
    monto: montoFinal,
    fechaNC: fecha,
    montoCondonar, desgloseLS, vigenciaLS, desglose
  };
  const texto = base.replace(/\{(\w+)\}/g, (m, k) => (k in valores ? valores[k] : m));

  document.getElementById("resultado").value = texto || "Selecciona una plantilla válida.";
  return true;
}

function copiarTexto() {
  const texto = document.getElementById("resultado");
  if (texto) {
    texto.select();
    document.execCommand("copy");
    notificar("success", "Copiado", "Plantilla copiada al portapapeles.");
  }

  ["nombre", "gestion", "dts", "cedula", "cedulaRechazo", "monto", "fecha"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
    marcarError(id, false);
  });

  ["montoFacturasPendientesLS", "montoWritteOffLS", "montoCeroPagosLS"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  if (document.getElementById("chkReversionLS")) document.getElementById("chkReversionLS").checked = false;
  if (document.getElementById("chkRecLS")) document.getElementById("chkRecLS").checked = false;

  NP_MONTOS.forEach(m => {
    const el = document.getElementById("npMonto_" + m.clave);
    if (el) el.value = "";
  });
  const npInc = document.getElementById("np_incubadora");
  if (npInc) npInc.checked = false;
  const npCarta = document.getElementById("np_cartaDescargo");
  if (npCarta) npCarta.checked = false;
  NP_CONDICIONES.forEach(c => {
    const el = document.getElementById("np_" + c.clave);
    if (el) el.checked = false;
  });

  const camposCD = document.getElementById("camposCartaDescargo");
  if (camposCD) camposCD.style.display = "none";
  ["fecha_activacion", "fecha_expiracion", "fecha_desactivacion", "terminal"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
    marcarError(id, false);
  });
}

// ==========================================
// ÍNDICE Y LISTAS DE ACCESO RÁPIDO
// ==========================================
const plantillasProcede = [
  "VISTO BUENO",
  "VISTO BUENO CARTA DE DESCARGO",
  "LIMPIEZA DE SALDOS"
];

const plantillasNoProcede = [
  "NO PROCEDE"
];

const plantillasRechazos = [
  { valor: "CAPTURA DE PANTALLA", etiqueta: "CAPTURA DE PANTALLA" },
  { valor: "CÉDULA AMBAS CARAS", etiqueta: "CÉDULA AMBAS CARAS" },
  { valor: "CONTACTO", etiqueta: "CONTACTO" },
  { valor: "CONTROL DE ALTAS", etiqueta: "CONTROL DE ALTAS" },
  { valor: "CUATRO ESQUINAS", etiqueta: "CUATRO ESQUINAS" },
  { valor: "DOCUMENTO ALTERADO", etiqueta: "DOCUMENTO ALTERADO" },
  { valor: "DOCUMENTO CON MANCHAS", etiqueta: "DOCUMENTO CON MANCHAS" },
  { valor: "DOCUMENTO DETERIORADO", etiqueta: "DOCUMENTO DETERIORADO" },
  { valor: "DOCUMENTO VENCIDO", etiqueta: "DOCUMENTO VENCIDO" },
  { valor: "FECHA SIN FORMATO", etiqueta: "FECHA SIN FORMATO" },
  { valor: "NO COINCIDE (CUANDO LA INFORMACIÓN DE LA PLANTILLA NO COINCIDE CON LA FOTOGRAFÍA)", etiqueta: "NO COINCIDE" },
  { valor: "NO LEGIBLE", etiqueta: "NO LEGIBLE" },
  { valor: "RECHAZO POR CÉDULA NO LEGIBLE", etiqueta: "RECHAZO POR CÉDULA" },
  { valor: "SIN CÉDULA", etiqueta: "SIN CÉDULA" },
  { valor: "SIN INFORMACIÓN", etiqueta: "SIN INFORMACIÓN" },
  { valor: "SIN REGISTROS", etiqueta: "SIN REGISTROS" },
  { valor: "SPAM", etiqueta: "SPAM" }
];

let favoritos = JSON.parse(localStorage.getItem("favoritosPlantillas") || "{}");

function toggleFavorito(nombre) {
  favoritos[nombre] = !favoritos[nombre];
  localStorage.setItem("favoritosPlantillas", JSON.stringify(favoritos));
  renderIndice();
}

function crearFilaIndice(valor, etiqueta) {
  const li = document.createElement("li");
  li.dataset.valor = valor;
  li.title = etiqueta;
  const estrella = document.createElement("span");
  estrella.className = "star-fav";
  estrella.textContent = favoritos[valor] ? "★" : "☆";
  estrella.title = favoritos[valor] ? "Quitar de favoritos" : "Marcar como favorito";
  const boton = document.createElement("button");
  boton.textContent = etiqueta;
  boton.title = etiqueta;
  li.append(estrella, boton);
  return li;
}

function renderLista(idUl, items, soloFavoritos) {
  const fragmento = document.createDocumentFragment();
  items.forEach(item => {
    const valor = typeof item === "string" ? item : item.valor;
    const etiqueta = typeof item === "string" ? item : item.etiqueta;
    if (!soloFavoritos || favoritos[valor]) fragmento.appendChild(crearFilaIndice(valor, etiqueta));
  });
  const ul = document.getElementById(idUl);
  if (ul) ul.replaceChildren(fragmento);
}

function renderIndice() {
  const toggleFav = document.getElementById("toggleFavoritos");
  const soloFavoritos = toggleFav ? toggleFav.checked : false;
  renderLista("listaProcede", plantillasProcede, soloFavoritos);
  renderLista("listaNoProcede", plantillasNoProcede, soloFavoritos);
  renderLista("rechazosLista", plantillasRechazos, soloFavoritos);

  const select = document.getElementById("plantilla");
  if (select && select.value) {
    document.querySelectorAll(".indice-lateral li").forEach(li => {
      if (li.dataset.valor === select.value) li.classList.add("activo");
    });
  }
}

function toggleSeccion(id) {
  const section = document.getElementById(id);
  if (section) {
    section.style.display = (section.style.display === "none") ? "block" : "none";
  }
}