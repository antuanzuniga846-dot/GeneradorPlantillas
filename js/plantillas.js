// ==========================================
// MÓDULO DE GENERACIÓN DE PLANTILLAS
// ==========================================

const plantillas = {
  "CON ACTUALIZACIÓN DE SEGMENTACIÓN": "Fecha:{fecha}\nHora:{hora}\n\nBuen día,\n\nSe procede con visto bueno para venta nueva, cédula {cedula}, a nombre del cliente {nombre}, base a las evidencias adjuntas, el mismo cumplió con los pagos correspondientes con la empresa. Adicional les comento, que las referencias crediticias, así como la segmentación del cliente se actualizaron correctamente\n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!",
  "NC APLICADA": "Fecha:{fecha}\nHora:{hora}\n\nBuen día,\n\nSe procede con visto bueno para la venta nueva cédula {cedula}, a nombre del cliente {nombre}, con base a la política de excepción para la apertura de ventas el mismo se le aplicó una nota de crédito el pasado {fechaNC}, por el monto de ¢ {monto}.\n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!",
  "NO SE PUEDE ACTUALIZAR SEGMENTACIÓN": "Fecha:{fecha}\nHora:{hora}\n\nBuen día,\n\nSe procede con visto bueno para venta nueva, cédula {cedula}, a nombre de {nombre}, base a las evidencias adjuntas, el mismo cumplió con los pagos correspondientes con la empresa. Adicional les comento, que las referencias crediticias del cliente se actualizaron correctamente. En cuanto a la modificación de segmentación del cliente, debe de solicitarse por medio de caso Qflow, a control de altas\n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!",
  "VISTO BUENO": "Fecha:{fecha}\nHora:{hora}\n\nBuen día,\n\nSe procede con visto bueno para venta nueva, cédula {cedula}, a nombre del cliente {nombre}, con base a las evidencias adjuntas, el mismo cumplió con los pagos correspondientes con la empresa. Las referencias crediticias fueron actualizadas correctamente.\n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!.",
  "VISTO BUENO ACTIVO": "Fecha:{fecha}\nHora:{hora}\n\nBuen día,\n\nSe procede con visto bueno para venta nueva, cédula {cedula}, a nombre del cliente {nombre}, con base a las evidencias adjuntas, el cliente evidencia servicio activo y a la fecha de revisión no cuenta con facturas vencidas.\n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!.",
  "VISTO BUENO CARTA DE DESCARGO": "Fecha:{fecha}\nHora:{hora}\n\nBuen día,\n\nSe procede con visto bueno para carta de descargo, cédula {cedula}, a nombre del cliente {nombre}, con base a las evidencias adjuntas, el mismo cumplió con los pagos correspondientes con la empresa. Las referencias crediticias fueron actualizadas correctamente.\n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!.",
  "LIMPIEZA DE SALDOS": "Fecha:{fecha}\nHora:{hora}\n\nBuen día,\n\nEstimados Sres.\n\nSe procede con visto bueno para la venta nueva, cédula {cedula}, a nombre del cliente {nombre}, con base a la política de excepción para la apertura de ventas se le aplicó una nota de crédito {limpiezaSaldosFrase}. Las referencias crediticias y la segmentación del cliente se actualizaron correctamente.{notaLS}\n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!",
  "CERO PAGOS": "Fecha:{fecha}\nHora:{hora}\n\nBuen día,\n\nNo procede visto bueno para venta nueva, cédula {cedula}, a nombre del cliente {nombre},ya que registra saldos bajo el Código NOTA DE CREDITO POR CLIENTE CERO PAGOS{ceroPagosIncubadoraTexto} CASO VISTO CON GERENCIA DE OPERACIONES Y FINANCIERA DE CR, el monto pendiente es de ¢{monto}.{ceroPagosAdicionalTexto}\n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!",
  "CERO PAGOS(CON TERMINAL)": "Fecha:{fecha}\nHora:{hora}\n\nBuen día,\n\nNo procede visto bueno para venta nueva, cédula {cedula}, a nombre del cliente {nombre},ya que registra saldos bajo el Código NOTA DE CREDITO POR CLIENTE CERO PAGOS CASO VISTO CON GERENCIA DE OPERACIONES Y FINANCIERA DE CR, el monto pendiente es de  ¢{monto}.\n\nEl cliente tiene penalidad por retiro anticipado, no se encuentra evidencia del pago en ONBASE o interacciones anteriores que los respalden.\n\n    I. Fecha de activación: {fecha_activacion}\n    II. Fecha de expiración: {fecha_expiracion}\n    III. Fecha de desactivación: {fecha_desactivacion}\n    IV. Terminal ligado: {terminal}\n\nSi mantienen evidencia que demuestre lo contrario, favor hacerla llegar para validar nuevamente el caso.\n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!",
  "WRITTE OFF(CON TERMINAL)": "Fecha:{fecha}\nHora:{hora}\n\nBuen día,\n\nNo procede visto bueno para venta nueva, cédula {cedula}, a nombre del cliente {nombre}, ya que cuenta con saldos bajo el Código NOTA DE CRÉDITO POR CLIENTE WRITTE OFF, CASO VISTO CON GERENCIA DE OPERACIONES Y FINANCIERA DE CR, el monto pendiente es de ¢{monto}.\n\nEl cliente tiene penalidad por retiro anticipado, no se encuentra evidencia del pago en ONBASE o interacciones anteriores que los respalden.\n\n    I. Fecha de activación: {fecha_activacion}\n    II. Fecha de expiración: {fecha_expiracion}\n    III. Fecha de desactivación: {fecha_desactivacion}\n    IV. Terminal ligado: {terminal}\n\nSi mantienen evidencia que demuestre lo contrario, favor hacerla llegar para validar nuevamente el caso.\n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!",
  "WRITTE OFF(SIN TERMINAL)": "Fecha:{fecha}\nHora:{hora}\n\nBuen día,\n\nNo procede visto bueno para venta nueva, del cliente {nombre}, cédula {cedula}, ya que cuenta con saldos bajo el Código NOTA DE CREDITO POR CLIENTE WRITTE OFF, CASO VISTO CON GERENCIA DE OPERACIONES Y FINANCIERA DE CR, el monto pendiente es de ¢{monto}.{writteOffAdicionalTexto}\n\nSi mantienen evidencia que demuestre lo contrario, favor hacerla llegar para validar nuevamente el caso.\n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!",
  "SIN FORMALIZACION": "Fecha:{fecha}\nHora:{hora}\n\nBuen día,\n\nNo procede visto bueno para venta nueva, del cliente {nombre}, cédula {cedula}, ya que no hay evidencia en ONBASE de la baja de los equipos DTH, ni gestión o caso Qflow. Adicional, registra saldos bajo el Código NOTA DE CREDITO POR CLIENTE WRITTE OFF, CASO VISTO CON GERENCIA DE OPERACIONES Y FINANCIERA DE CR,el monto pendiente es de ¢ {monto}.\n\nSi mantienen evidencia que demuestre lo contrario, favor hacerla llegar para validar nuevamente el caso.\n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!",
  "TERMINAL LIGADO (FINANCIAMIENTO Y FACTURAS PENDIENTES)": "Fecha:{fecha}\nHora:{hora}\n\nBuen día,\n\nNo procede visto bueno para venta nueva, cédula {cedula}, a nombre del cliente {nombre}, ya que existen facturas pendientes y no hay evidencia de pago o interacciones anteriores que lo respalden.\n\nFacturas pendientes: ¢ {monto} \n\nAdicional, muestra penalidad por retiro anticipado y no se hay evidencia del pago en ONBASE o interacciones anteriores que lo respalden.\n\n    I. Fecha de activación: {fecha_activacion}\n    II. Fecha de expiración: {fecha_expiracion}\n    III. Fecha de desactivación: {fecha_desactivacion}\n    IV. Terminal ligado: {terminal}\n\nSi mantienen evidencia que demuestre lo contrario, favor hacerla llegar para validar nuevamente el caso.\n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!",
  "TERMINAL LIGADO (SOLO DEBE FINACIAMIENTO)": "Fecha:{fecha}\nHora:{hora}\n\nBuen día,\n\nNo procede visto bueno para venta nueva, cédula {cedula}, a nombre del cliente {nombre}, ya que el cliente muestra las siguientes penalidades por retiro anticipado pendiente, ya que no se encuentra evidencia del pago en ONBASE o interacciones anteriores que los respalden.\n\n    I. Fecha de activación: {fecha_activacion}\n    II. Fecha de expiración: {fecha_expiracion}\n    III. Fecha de desactivación: {fecha_desactivacion}\n    IV. Terminal ligado: {terminal}\n\nSi mantienen evidencia que demuestre lo contrario, favor hacerla llegar para validar nuevamente el caso.\n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!",
  "FACTURAS PENDIENTES": "Fecha:{fecha}\nHora:{hora}\n\nBuen día,\n\nNo procede visto bueno para venta nueva, cédula {cedula}, nombre del cliente {nombre}, ya que cuenta con FACTURAS PENDIENTES y no hay evidencia de pago o interacciones anteriores que lo respalden.\n\nFacturas pendientes: ¢{monto}. {facturasPendientesTexto}\n{facturasAdicionalTexto}\n\nSi mantienen evidencia que demuestre lo contrario, favor hacerla llegar para validar nuevamente el caso.\n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!",
  "SALDO PENDIENTE SERVICIO ACTIVO": "Fecha:{fecha}\nHora:{hora}\n\nBuen día,\n\nNo procede visto bueno para venta nueva en base a la ACTUALIZACIÓN de la POLÍTICA indicada por OPERACIONES COMERCIALES, cédula {cedula}, nombre del cliente {nombre}, ya que el cliente cuenta con SERVICIO ACTIVO y mantiene {facturasSAFrase} sin evidencia de pago o interacciones anteriores que lo respalden. La condonación procede únicamente cuando todas las raíces se encuentran totalmente desactivas y no existe ningún servicio activo asociado. En caso de que el cliente mantenga un servicio activo en cualquiera de sus raíces, la condonación NO procede.\n\nSi mantienen evidencia que demuestre lo contrario, favor hacerla llegar para validar nuevamente el caso.\n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!",
  // RECHAZOS 
  "DOCUMENTO ALTERADO": "Buen día,\n\nEl caso se rechaza debido a sospechas de alteración en el documento de identidad.\n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!.",
  "RECHAZO POR CÉDULA NO LEGIBLE": "Buen día,\n\nEl caso se rechaza por no adjuntar el documento de identidad legible y claro, fundamental para realizar el trámite.\n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!.",
  "RECHAZO POR CONTRATO ACTIVO": "Buen día,\n\nNo procede el análisis, el cliente tiene servicios activos. El análisis de buró no aplica para segundas ni terceras ventas, únicamente para clientes desactivados en su totalidad.\n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!",
  "CÉDULA AMBAS CARAS": " Buen día,\n\nEl caso se rechaza por no adjuntar el documento de identidad por ambas caras, fundamental para realizar el trámite \n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!.",   
  "CAPTURA DE PANTALLA": "Buen día,\n\nEl caso se rechaza debido a que el documento de identidad adjunto está en pdf, escaneo, fotocopia, captura de pantalla o emplasticado y no corresponde a una fotografía del documento original, por lo que no es posible validar su autenticidad. Les solicitamos adjuntar una fotografía legible y clara del documento de identidad original para proceder con el análisis.\n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!.",
  "CUATRO ESQUINAS": "Buen día,\n\nEl caso se rechaza debido a que en la fotografía adjunta no se aprecia el documento de identidad en su totalidad, ya que se muestra recortado o incompleto. Para continuar con el debido análisis del cliente, es necesario contar con una fotografía clara y completa del documento, en la que puedan apreciarse las cuatro esquinas del mismo.\n\nLes solicitamos adjuntar nuevamente el documento cumpliendo con lo antes indicado.\n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!.",
  "CONTROL DE ALTAS": "Buen día,\n\nNo es posible brindar visto bueno debido a que la identificación del cliente se muestra errónea en el sistema, por favor, enviar el caso a control de altas para su debido análisis y corrección.\n\nCualquier duda adicional con gusto.\n\n¡Nos encantó atenderte el día de hoy!\nSu número de gestión es:{gestion}\nAnte cualquier duda o inconveniente que tengás podés comunicarte a los siguientes medios:\n📱 WhatsApp: 7002 4600\n¡Qué pases un excelente día!.",
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
  const option = document.querySelector(`option[value="${texto}"]`);
  if (option && select) {
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

function cambiarPlantilla(seleccionDirecta) {
  const select = document.getElementById("plantilla");
  const seleccion = (seleccionDirecta !== undefined ? seleccionDirecta : (select ? select.value : "")).trim();
  if (select && seleccionDirecta !== undefined) {
    select.value = seleccion;
  }

  const writteOffCampos = document.getElementById("writteOffCampos");
  const checkboxes = document.getElementById("checkboxes");
  const checkboxesFacturasExtra = document.getElementById("checkboxesFacturasExtra");
  const checkboxesFacturasServicioActivo = document.getElementById("checkboxesFacturasServicioActivo");
  const checkboxesLimpiezaSaldos = document.getElementById("checkboxesLimpiezaSaldos");
  const checkboxesCeroPagos = document.getElementById("checkboxesCeroPagos");
  const checkboxesWriteOffSinTerminal = document.getElementById("checkboxesWriteOffSinTerminal");
  const formulario = document.getElementById("formulario");
  const campoFecha = document.getElementById("campoFecha");
  const montoInput = document.getElementById("montoInput");

  if (checkboxes) checkboxes.style.display = (seleccion === "FACTURAS PENDIENTES") ? "block" : "none";
  if (checkboxesFacturasExtra) checkboxesFacturasExtra.style.display = (seleccion === "FACTURAS PENDIENTES") ? "block" : "none";
  if (checkboxesFacturasServicioActivo) checkboxesFacturasServicioActivo.style.display = (seleccion === "SALDO PENDIENTE SERVICIO ACTIVO") ? "block" : "none";
  if (checkboxesLimpiezaSaldos) checkboxesLimpiezaSaldos.style.display = (seleccion === "LIMPIEZA DE SALDOS") ? "block" : "none";
  if (checkboxesCeroPagos) checkboxesCeroPagos.style.display = (seleccion === "CERO PAGOS") ? "block" : "none";
  if (checkboxesWriteOffSinTerminal) checkboxesWriteOffSinTerminal.style.display = (seleccion === "WRITTE OFF(SIN TERMINAL)") ? "block" : "none";
  if (campoFecha) campoFecha.style.display = (seleccion === "NC APLICADA") ? "block" : "none";

  if (formulario) {
    if (
      seleccion === "WRITTE OFF(CON TERMINAL)" ||
      seleccion === "CERO PAGOS(CON TERMINAL)" ||
      seleccion === "SIN FORMALIZACION" ||
      seleccion === "TERMINAL LIGADO (FINANCIAMIENTO Y FACTURAS PENDIENTES)" ||
      seleccion === "NC APLICADA" ||
      seleccion === "CERO PAGOS" ||
      seleccion === "VISTO BUENO" ||
      seleccion === "VISTO BUENO CARTA DE DESCARGO" ||
      seleccion === "VISTO BUENO ACTIVO" ||
      seleccion === "WRITTE OFF(SIN TERMINAL)" ||
      seleccion === "LIMPIEZA DE SALDOS" ||
      seleccion === "FACTURAS PENDIENTES"||
      seleccion === "SALDO PENDIENTE SERVICIO ACTIVO"||
      seleccion === "TERMINAL LIGADO (SOLO DEBE FINACIAMIENTO)"||
      seleccion === "CON ACTUALIZACIÓN DE SEGMENTACIÓN"||
      seleccion === "NO SE PUEDE ACTUALIZAR SEGMENTACIÓN"
    ) {
      formulario.style.display = "block";
    } else {
      formulario.style.display = "none";
    }
  }

  if (writteOffCampos) {
    if (
      seleccion === "CERO PAGOS(CON TERMINAL)" ||
      seleccion === "WRITTE OFF(CON TERMINAL)" ||
      seleccion === "TERMINAL LIGADO (FINANCIAMIENTO Y FACTURAS PENDIENTES)" ||
      seleccion === "TERMINAL LIGADO (SOLO DEBE FINACIAMIENTO)"
    ) {
      writteOffCampos.style.display = "block";
    } else {
      writteOffCampos.style.display = "none";
    }
  }

  if (montoInput) {
    if (  
      seleccion === "CERO PAGOS(CON TERMINAL)" ||
      seleccion === "WRITTE OFF(CON TERMINAL)" ||
      seleccion === "TERMINAL LIGADO (FINANCIAMIENTO Y FACTURAS PENDIENTES)" ||
      seleccion === "SIN FORMALIZACION" ||
      seleccion === "NC APLICADA" ||
      seleccion === "CERO PAGOS" ||
      seleccion === "WRITTE OFF(SIN TERMINAL)" ||
      seleccion === "FACTURAS PENDIENTES"
    ) {
      montoInput.style.display = "block";
    } else {
      montoInput.style.display = "none";
    }
  }
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

  const gestionVal = document.getElementById("gestion").value.trim();
  marcarError("gestion", !gestionVal);
  if (!gestionVal) valido = false;

  const formularioVisible = document.getElementById("formulario").style.display !== "none";
  if (formularioVisible) {
    const nombreVal = document.getElementById("nombre").value.trim();
    marcarError("nombre", !nombreVal);
    if (!nombreVal) valido = false;

    const cedulaVal = document.getElementById("cedula").value.trim();
    marcarError("cedula", !cedulaVal);
    if (!cedulaVal) valido = false;
  }

  const montoVisible = document.getElementById("montoInput").style.display !== "none";
  if (montoVisible) {
    const montoVal = document.getElementById("monto").value.trim();
    marcarError("monto", !montoVal);
    if (!montoVal) valido = false;
  }

  const writteOffVisible = document.getElementById("writteOffCampos").style.display !== "none";
  if (writteOffVisible) {
    ["fecha_activacion", "fecha_expiracion", "fecha_desactivacion", "terminal"].forEach(id => {
      const val = document.getElementById(id).value.trim();
      marcarError(id, !val);
      if (!val) valido = false;
    });
  }

  const campoFechaVisible = document.getElementById("campoFecha").style.display !== "none";
  if (campoFechaVisible) {
    const fechaVal = document.getElementById("fecha").value.trim();
    marcarError("fecha", !fechaVal);
    if (!fechaVal) valido = false;
  }

  const grupoSAVisible = document.getElementById("checkboxesFacturasServicioActivo").style.display !== "none";
  if (grupoSAVisible) {
    const algunoSA = ["montoFacturasPendientesSA", "montoCeroPagosSA", "montoWritteOffSA"]
      .some(id => document.getElementById(id).value.trim());
    marcarErrorGrupo("grupoSaldosSA", "saldosSAError", !algunoSA);
    if (!algunoSA) valido = false;
  }

  const grupoLSVisible = document.getElementById("checkboxesLimpiezaSaldos").style.display !== "none";
  if (grupoLSVisible) {
    const algunoLS = ["montoFacturasPendientesLS", "montoWritteOffLS", "montoCeroPagosLS"]
      .some(id => document.getElementById(id).value.trim());
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

  const gestion = document.getElementById("gestion").value.trim().toUpperCase();
  const nombre = document.getElementById("nombre").value.trim().toUpperCase();
  const cedula = document.getElementById("cedula").value.trim();
  const monto = document.getElementById("monto").value.trim();
  const terminal = document.getElementById("terminal").value.trim();
  const fecha_activacion = document.getElementById("fecha_activacion").value.trim();
  const fecha_expiracion = document.getElementById("fecha_expiracion").value.trim();
  const fecha_desactivacion = document.getElementById("fecha_desactivacion").value.trim();

  let fechaInput = document.getElementById("fecha").value.trim();
  let fecha = "";
  if (fechaInput) {
    const partes = fechaInput.split("-");
    fecha = `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  const suspendido = document.getElementById('suspendido').checked;
  const sinCumplirAno = document.getElementById('sinCumplirAno').checked;
  const menos2750 = document.getElementById('menos2750').checked;
  const finaciamiento = document.getElementById('finaciamiento').checked;
  const ceroPagosIncubadora = document.getElementById('ceroPagosIncubadora').checked;

  let facturasPendientesTexto = "";
  if (suspendido) facturasPendientesTexto += "servicio está suspendido. ";
  if (sinCumplirAno) facturasPendientesTexto += "las facturas no cumple con el año antigüedad. ";
  if (finaciamiento) facturasPendientesTexto += "Adicional cliente no aplica para limpieza tiene Financiamiento abierto. ";
  if (menos2750) facturasPendientesTexto += "";

  let ceroPagosIncubadoraTexto = "";
  if (ceroPagosIncubadora) ceroPagosIncubadoraTexto = " INCUBADORA";

  const montoCeroPagosFP = document.getElementById('montoCeroPagosFP').value.trim();
  const montoWritteOffFP = document.getElementById('montoWritteOffFP').value.trim();
  let facturasAdicionalPartes = [];
  if (montoCeroPagosFP) facturasAdicionalPartes.push(`CERO PAGOS por un monto de ¢${formatMonto(montoCeroPagosFP)}`);
  if (montoWritteOffFP) facturasAdicionalPartes.push(`WRITTE OFF por un monto de ¢${formatMonto(montoWritteOffFP)}`);
  let facturasAdicionalTexto = facturasAdicionalPartes.length ? `Adicionalmente, el cliente cuenta con ${facturasAdicionalPartes.join(" y ")}.` : "";

  const montoFacturasPendientesCP = document.getElementById('montoFacturasPendientesCP').value.trim();
  const montoWritteOffCP = document.getElementById('montoWritteOffCP').value.trim();
  let ceroPagosAdicionalPartes = [];
  if (montoFacturasPendientesCP) ceroPagosAdicionalPartes.push(`FACTURAS PENDIENTES por un monto de ¢${formatMonto(montoFacturasPendientesCP)}`);
  if (montoWritteOffCP) ceroPagosAdicionalPartes.push(`WRITTE OFF por un monto de ¢${formatMonto(montoWritteOffCP)}`);
  let ceroPagosAdicionalTexto = ceroPagosAdicionalPartes.length ? ` Adicionalmente, el cliente cuenta con ${ceroPagosAdicionalPartes.join(" y ")}.` : "";

  const montoFacturasPendientesWO = document.getElementById('montoFacturasPendientesWO').value.trim();
  const montoCeroPagosWO = document.getElementById('montoCeroPagosWO').value.trim();
  let writteOffAdicionalPartes = [];
  if (montoFacturasPendientesWO) writteOffAdicionalPartes.push(`FACTURAS PENDIENTES por un monto de ¢${formatMonto(montoFacturasPendientesWO)}`);
  if (montoCeroPagosWO) writteOffAdicionalPartes.push(`CERO PAGOS por un monto de ¢${formatMonto(montoCeroPagosWO)}`);
  let writteOffAdicionalTexto = writteOffAdicionalPartes.length ? ` Adicionalmente, el cliente cuenta con ${writteOffAdicionalPartes.join(" y ")}.` : "";

  const montoFacturasPendientesSA = document.getElementById('montoFacturasPendientesSA').value.trim();
  const montoCeroPagosSA = document.getElementById('montoCeroPagosSA').value.trim();
  const montoWritteOffSA = document.getElementById('montoWritteOffSA').value.trim();
  let facturasSAPartes = [];
  if (montoFacturasPendientesSA) facturasSAPartes.push(`FACTURAS PENDIENTES por un monto de ¢${formatMonto(montoFacturasPendientesSA)}`);
  if (montoCeroPagosSA) facturasSAPartes.push(`CERO PAGOS por un monto de ¢${formatMonto(montoCeroPagosSA)}`);
  if (montoWritteOffSA) facturasSAPartes.push(`WRITTE OFF por un monto de ¢${formatMonto(montoWritteOffSA)}`);

  let facturasSAFrase = "";
  if (facturasSAPartes.length === 0) facturasSAFrase = "saldos pendientes";
  else if (facturasSAPartes.length === 1) facturasSAFrase = facturasSAPartes[0];
  else {
    const ultimo = facturasSAPartes[facturasSAPartes.length - 1];
    const resto = facturasSAPartes.slice(0, -1).join(", ");
    facturasSAFrase = `${resto} y ${ultimo}`;
  }

  const montoFacturasPendientesLS = document.getElementById('montoFacturasPendientesLS').value.trim();
  const montoWritteOffLS = document.getElementById('montoWritteOffLS').value.trim();
  const montoCeroPagosLS = document.getElementById('montoCeroPagosLS').value.trim();
  let limpiezaSaldosPartes = [];
  if (montoFacturasPendientesLS) limpiezaSaldosPartes.push(`por el monto de ¢${formatMonto(montoFacturasPendientesLS)} en FACTURAS PENDIENTES`);
  if (montoCeroPagosLS) limpiezaSaldosPartes.push(`por el monto de ¢${formatMonto(montoCeroPagosLS)} en CERO PAGOS`);
  if (montoWritteOffLS) limpiezaSaldosPartes.push(`por el monto de ¢${formatMonto(montoWritteOffLS)} en WRITTE OFF`);

  let limpiezaSaldosFrase = "";
  if (limpiezaSaldosPartes.length === 1) limpiezaSaldosFrase = limpiezaSaldosPartes[0];
  else if (limpiezaSaldosPartes.length > 1) {
    const ultimo = limpiezaSaldosPartes[limpiezaSaldosPartes.length - 1];
    const resto = limpiezaSaldosPartes.slice(0, -1).join(", ");
    limpiezaSaldosFrase = `${resto} y ${ultimo}`;
  }

  const hayFP_LS = !!montoFacturasPendientesLS;
  const hayOtroLS = !!(montoWritteOffLS || montoCeroPagosLS);
  let notaLS = "";
  if (hayFP_LS && hayOtroLS) {
    notaLS = "\n\nNOTA: Si la venta no se concreta, deben solicitar la anulación de la nota de crédito hoy mismo por medio del WhatsApp 70024600, opción Soporte Comercial. Aplica única y exclusivamente para montos de FACTURAS PENDIENTES.";
  } else if (hayFP_LS && !hayOtroLS) {
    notaLS = "\n\nNOTA: Si la venta no se concreta, deben solicitar la anulación de la nota de crédito hoy mismo por medio del WhatsApp 70024600, opción Soporte Comercial.";
  }

  let texto = plantillas[plantillaKey]
  .replace("{nombre}", nombre)
  .replace("{gestion}", gestion)
  .replace("{fecha}", fechaFormateada)
  .replace("{hora}", horaFormateada)
  .replace("{cedula}", cedula)
  .replace("{monto}", formatMonto(monto))
  .replace("{fecha_activacion}", fecha_activacion)
  .replace("{fecha_expiracion}", fecha_expiracion)
  .replace("{fecha_desactivacion}", fecha_desactivacion)
  .replace("{terminal}", terminal)
  .replace("{fechaNC}", fecha)
  .replace("{facturasPendientesTexto}", facturasPendientesTexto)
  .replace("{facturasAdicionalTexto}", facturasAdicionalTexto)
  .replace("{ceroPagosAdicionalTexto}", ceroPagosAdicionalTexto)
  .replace("{writteOffAdicionalTexto}", writteOffAdicionalTexto)
  .replace("{facturasSAFrase}", facturasSAFrase)
  .replace("{limpiezaSaldosFrase}", limpiezaSaldosFrase)
  .replace("{notaLS}", notaLS)
  .replace("{ceroPagosIncubadoraTexto}", ceroPagosIncubadoraTexto);

  document.getElementById("resultado").value = texto || "Selecciona una plantilla válida.";
  return true;
}

function copiarTexto() {
  const texto = document.getElementById("resultado");
  texto.select();
  document.execCommand("copy");
  notificar("success", "Copiado", "Plantilla copiada al portapapeles.");

  document.getElementById("nombre").value = "";
  document.getElementById("gestion").value = "";
  document.getElementById("cedula").value = "";
  if (document.getElementById("monto")) document.getElementById("monto").value = "";
  if (document.getElementById("fecha_activacion")) document.getElementById("fecha_activacion").value = "";
  if (document.getElementById("fecha_expiracion")) document.getElementById("fecha_expiracion").value = "";
  if (document.getElementById("fecha_desactivacion")) document.getElementById("fecha_desactivacion").value = "";
  if (document.getElementById("terminal")) document.getElementById("terminal").value = "";
  if (document.getElementById("fecha")) document.getElementById("fecha").value = "";

  const radios = document.querySelectorAll("input[type='radio']");
  radios.forEach(r => r.checked = false);

  if (document.getElementById("ceroPagosIncubadora")) document.getElementById("ceroPagosIncubadora").checked = false;
  if (document.getElementById("chkReversionLS")) document.getElementById("chkReversionLS").checked = false;
  if (document.getElementById("chkRecLS")) document.getElementById("chkRecLS").checked = false;

  const montoExtraIds = ["montoCeroPagosFP", "montoWritteOffFP", "montoFacturasPendientesCP", "montoWritteOffCP", "montoFacturasPendientesWO", "montoCeroPagosWO", "montoFacturasPendientesSA", "montoCeroPagosSA", "montoWritteOffSA", "montoFacturasPendientesLS", "montoWritteOffLS", "montoCeroPagosLS"];
  montoExtraIds.forEach(id => {
    if (document.getElementById(id)) document.getElementById(id).value = "";
  });
}

// ==========================================
// ÍNDICE Y LISTAS DE ACCESO RÁPIDO
// ==========================================
const plantillasProcede = [
  "CON ACTUALIZACIÓN DE SEGMENTACIÓN",
  "NC APLICADA",
  "NO SE PUEDE ACTUALIZAR SEGMENTACIÓN",
  "VISTO BUENO",
  "VISTO BUENO ACTIVO",
  "VISTO BUENO CARTA DE DESCARGO",
  "LIMPIEZA DE SALDOS"
];

const plantillasNoProcede = [
  "CERO PAGOS",
  "CERO PAGOS(CON TERMINAL)",
  "FACTURAS PENDIENTES",
  "SALDO PENDIENTE SERVICIO ACTIVO",
  "SIN FORMALIZACION",
  "TERMINAL LIGADO (FINANCIAMIENTO Y FACTURAS PENDIENTES)",
  "TERMINAL LIGADO (SOLO DEBE FINACIAMIENTO)",
  "WRITTE OFF(CON TERMINAL)",
  "WRITTE OFF(SIN TERMINAL)"
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
  const estrella = document.createElement("span");
  estrella.textContent = favoritos[valor] ? "★" : "☆";
  const boton = document.createElement("button");
  boton.textContent = etiqueta;
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
}

function toggleSeccion(id) {
  const section = document.getElementById(id);
  if (section) {
    section.style.display = (section.style.display === "none") ? "block" : "none";
  }
}
