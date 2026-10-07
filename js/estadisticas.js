// ==========================================
// SECCIÓN: MÉTRICAS, GRÁFICAS & TABLA DINÁMICA
// ==========================================

let chartSoporteInstance = null;
let tipoGraficaActual = "bar"; // "bar" | "doughnut"
let matrizPivotActual = null; // Para renderizado y exportación CSV

const COLORES_SOPORTE_MAP = {
  "maría": { bg: "rgba(248, 187, 208, 0.85)", border: "#f8bbd0", text: "#880e4f" },
  "maria": { bg: "rgba(248, 187, 208, 0.85)", border: "#f8bbd0", text: "#880e4f" },
  "adriel": { bg: "rgba(248, 187, 208, 0.85)", border: "#f8bbd0", text: "#880e4f" },
  "fabricio": { bg: "rgba(156, 204, 101, 0.85)", border: "#9ccc65", text: "#1a3300" },
  "enoc": { bg: "rgba(251, 192, 45, 0.85)", border: "#fbc02d", text: "#202124" },
  "antuan": { bg: "rgba(233, 30, 99, 0.85)", border: "#e91e63", text: "#ffffff" },
  "jorshan": { bg: "rgba(171, 71, 188, 0.85)", border: "#ab47bc", text: "#ffffff" },
  "sebas": { bg: "rgba(38, 166, 154, 0.85)", border: "#26a69a", text: "#ffffff" }
};

const PALETA_FALLBACK_STATS = [
  { bg: "rgba(0, 188, 212, 0.85)", border: "#00bcd4" },
  { bg: "rgba(255, 152, 0, 0.85)", border: "#ff9800" },
  { bg: "rgba(103, 58, 183, 0.85)", border: "#673ab7" },
  { bg: "rgba(233, 30, 99, 0.85)", border: "#e91e63" },
  { bg: "rgba(76, 175, 80, 0.85)", border: "#4caf50" },
  { bg: "rgba(255, 87, 34, 0.85)", border: "#ff5722" }
];

function obtenerColorSoporteStats(nombreSoporte, idx = 0) {
  const norm = (nombreSoporte || "").toLowerCase().trim();
  if (COLORES_SOPORTE_MAP[norm]) {
    return COLORES_SOPORTE_MAP[norm];
  }
  return PALETA_FALLBACK_STATS[idx % PALETA_FALLBACK_STATS.length];
}

function setRangoRapidoStats(tipo, btnElem) {
  const hoyObj = new Date();
  const hoyStr = `${hoyObj.getFullYear()}-${pad2(hoyObj.getMonth() + 1)}-${pad2(hoyObj.getDate())}`;
  
  document.querySelectorAll(".btn-rango-stats").forEach(b => b.classList.remove("active"));

  if (tipo === 'hoy') {
    document.getElementById("statsFechaDesde").value = hoyStr;
    document.getElementById("statsFechaHasta").value = hoyStr;
    if (btnElem) btnElem.classList.add("active");
  } else if (tipo === 'mes') {
    const primerDia = `${hoyObj.getFullYear()}-${pad2(hoyObj.getMonth() + 1)}-01`;
    document.getElementById("statsFechaDesde").value = primerDia;
    document.getElementById("statsFechaHasta").value = hoyStr;
    if (btnElem) btnElem.classList.add("active");
  } else if (tipo === 'todo') {
    document.getElementById("statsFechaDesde").value = "";
    document.getElementById("statsFechaHasta").value = "";
    document.getElementById("btnStatsTodo")?.classList.add("active");
  }
  actualizarEstadisticasYTablaDinamica();
}

function setChartType(type) {
  tipoGraficaActual = type;
  document.getElementById("btnChartBar")?.classList.toggle("active", type === "bar");
  document.getElementById("btnChartDoughnut")?.classList.toggle("active", type === "doughnut");
  actualizarEstadisticasYTablaDinamica();
}

function actualizarEstadisticasYTablaDinamica() {
  const desde = document.getElementById("statsFechaDesde")?.value || "";
  const hasta = document.getElementById("statsFechaHasta")?.value || "";
  const registros = obtenerRegistrosFiltradosPorFecha(desde, hasta);

  // 1. Conteo de Limpiezas Hechas por Soporte
  const conteoSoporte = {};
  let totalLimpiezasSoporte = 0;

  // 2. Conteo y matriz de "No Procede" por Agente y Soporte
  const noProcedeRegistros = [];
  const agentesSet = new Set();
  const soportesNoProcedeSet = new Set();
  const matrizNoProcede = {}; // { [agente]: { [soporte]: count } }

  registros.forEach(r => {
    const sop = (r.soporte || "").trim();
    const ag = (r.agente || "").trim() || "Sin Agente";
    const cat = (r.categoria || "").trim().toLowerCase();

    // Contabilizar limpiezas hechas por soporte
    if (sop) {
      conteoSoporte[sop] = (conteoSoporte[sop] || 0) + 1;
      totalLimpiezasSoporte++;
    }

    // Identificar casos No Procede
    if (cat === "no procede") {
      noProcedeRegistros.push(r);
      agentesSet.add(ag);
      if (sop) {
        soportesNoProcedeSet.add(sop);
      }
      if (!matrizNoProcede[ag]) {
        matrizNoProcede[ag] = {};
      }
      const sopKey = sop || "Sin Soporte";
      matrizNoProcede[ag][sopKey] = (matrizNoProcede[ag][sopKey] || 0) + 1;
    }
  });

  // Actualizar KPIs
  const totalNoProcede = noProcedeRegistros.length;
  const kpiSopElem = document.getElementById("kpiTotalSoporte");
  const kpiNoProcElem = document.getElementById("kpiTotalNoProcede");
  const kpiAgElem = document.getElementById("kpiTotalAgentes");
  if (kpiSopElem) kpiSopElem.textContent = totalLimpiezasSoporte.toLocaleString();
  if (kpiNoProcElem) kpiNoProcElem.textContent = totalNoProcede.toLocaleString();
  if (kpiAgElem) kpiAgElem.textContent = agentesSet.size.toLocaleString();

  // Soporte Líder
  let topSoporteNombre = "-";
  let topSoporteMax = 0;
  Object.entries(conteoSoporte).forEach(([sop, count]) => {
    if (count > topSoporteMax) {
      topSoporteMax = count;
      topSoporteNombre = sop;
    }
  });
  const kpiTopElem = document.getElementById("kpiSoporteTop");
  const kpiTopSubElem = document.getElementById("kpiSoporteTopSub");
  if (kpiTopElem) kpiTopElem.textContent = topSoporteNombre;
  if (kpiTopSubElem) kpiTopSubElem.textContent = `${topSoporteMax} limpiezas`;

  // 3. Renderizar Gráfica de Conteo de Limpiezas por Soporte
  renderizarGraficaSoporte(conteoSoporte, totalLimpiezasSoporte);

  // 4. Preparar datos para Tabla Dinámica
  const soportesEstandar = ["María", "Fabricio", "Enoc", "Antuan"];
  const todosSoportesSet = new Set([...soportesEstandar, ...Object.keys(conteoSoporte), ...soportesNoProcedeSet]);
  const columnasSoporte = Array.from(todosSoportesSet).filter(Boolean);

  matrizPivotActual = {
    agentes: Array.from(agentesSet).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })),
    soportes: columnasSoporte,
    matriz: matrizNoProcede,
    totalRegistros: totalNoProcede
  };

  renderizarTablaDinamicaHTML();
}

function renderizarGraficaSoporte(conteoSoporte, totalTotal) {
  const canvas = document.getElementById("chartSoporteLimpiezas");
  const contenedorResumen = document.getElementById("listaResumenSoporte");
  if (!canvas) return;

  const soportes = Object.keys(conteoSoporte).sort((a, b) => conteoSoporte[b] - conteoSoporte[a]);
  const cantidades = soportes.map(s => conteoSoporte[s]);

  const bgColors = soportes.map((s, idx) => obtenerColorSoporteStats(s, idx).bg);
  const borderColors = soportes.map((s, idx) => obtenerColorSoporteStats(s, idx).border);

  const esClaro = document.documentElement.getAttribute("data-theme") === "light";
  const textColor = esClaro ? "#0f172a" : "#ffffff";
  const textMutedColor = esClaro ? "#475569" : "#cccccc";
  const gridColor = esClaro ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.08)";

  // Renderizar lista de resumen lateral
  if (contenedorResumen) {
    if (soportes.length === 0) {
      contenedorResumen.innerHTML = `<div style="text-align:center; padding: 25px 10px; color:${textMutedColor}; font-style:italic;">No hay limpiezas atendidas por soporte en este período.</div>`;
    } else {
      let htmlResumen = `<h4 style="margin: 0 0 10px 0; font-size: 0.85rem; text-transform: uppercase; color: var(--accent-text); letter-spacing: 0.5px;">📋 Conteo por Resolutor</h4>`;
      soportes.forEach((sop, idx) => {
        const cant = conteoSoporte[sop];
        const pct = totalTotal > 0 ? ((cant / totalTotal) * 100).toFixed(1) : 0;
        const color = obtenerColorSoporteStats(sop, idx).border;
        htmlResumen += `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 7px 0; border-bottom: 1px solid var(--card-border); font-size: 0.84rem;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; width: 12px; height: 12px; border-radius: 3px; background: ${color};"></span>
              <strong>${sop}</strong>
            </div>
            <div>
              <strong style="color: ${textColor}; font-size: 0.92rem;">${cant}</strong>
              <span style="color: ${textMutedColor}; font-size: 0.75rem; margin-left: 4px;">(${pct}%)</span>
            </div>
          </div>
        `;
      });
      contenedorResumen.innerHTML = htmlResumen;
    }
  }

  // Renderizar o actualizar con Chart.js
  if (chartSoporteInstance) {
    try { chartSoporteInstance.destroy(); } catch(e){}
  }

  if (soportes.length === 0 || typeof Chart === "undefined") {
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }

  const isDoughnut = tipoGraficaActual === "doughnut";

  chartSoporteInstance = new Chart(canvas, {
    type: isDoughnut ? "doughnut" : "bar",
    data: {
      labels: soportes,
      datasets: [{
        label: "Limpiezas Realizadas",
        data: cantidades,
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: 1.5,
        borderRadius: isDoughnut ? 0 : 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: isDoughnut,
          position: "right",
          labels: {
            color: textColor,
            font: { size: 12, weight: "bold" },
            padding: 12
          }
        },
        tooltip: {
          backgroundColor: esClaro ? "rgba(255, 255, 255, 0.96)" : "rgba(10, 15, 25, 0.94)",
          titleColor: textColor,
          bodyColor: esClaro ? "#0078d7" : "#80cbc4",
          borderColor: "var(--accent)",
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: function(context) {
              const val = context.parsed.y !== undefined ? context.parsed.y : context.parsed;
              const pct = totalTotal > 0 ? ((val / totalTotal) * 100).toFixed(1) : 0;
              return ` Limpiezas realizadas: ${val} (${pct}%)`;
            }
          }
        }
      },
      scales: isDoughnut ? {} : {
        y: {
          beginAtZero: true,
          ticks: {
            color: textMutedColor,
            precision: 0,
            font: { size: 11 }
          },
          grid: {
            color: gridColor
          }
        },
        x: {
          ticks: {
            color: textColor,
            font: { size: 12, weight: "bold" }
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
}

function renderizarTablaDinamicaHTML() {
  if (!matrizPivotActual) return;

  const thead = document.getElementById("tablaDinamicaThead");
  const tbody = document.getElementById("tablaDinamicaTbody");
  const tfoot = document.getElementById("tablaDinamicaTfoot");
  const filtro = (document.getElementById("filtroTablaDinamica")?.value || "").toLowerCase().trim();

  if (!thead || !tbody || !tfoot) return;

  const { agentes, soportes, matriz } = matrizPivotActual;

  // Filtrar agentes según el buscador
  const agentesFiltrados = agentes.filter(ag => !filtro || ag.toLowerCase().includes(filtro));

  // 1. Construir Thead
  let theadHTML = `<tr><th>Agente</th>`;
  soportes.forEach(sop => {
    theadHTML += `<th>${sop}</th>`;
  });
  theadHTML += `<th>Suma total</th></tr>`;
  thead.innerHTML = theadHTML;

  // Si no hay datos
  if (agentesFiltrados.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${soportes.length + 2}" style="text-align:center; padding: 24px; color:#aaa; font-style:italic;">No se encontraron casos de "No Procede" para el período o filtro seleccionado.</td></tr>`;
    tfoot.innerHTML = "";
    return;
  }

  // 2. Construir Tbody y calcular Totales por Columna
  const totalesColumna = {};
  soportes.forEach(s => totalesColumna[s] = 0);
  let granTotalGeneral = 0;

  let tbodyHTML = "";
  agentesFiltrados.forEach(agente => {
    let sumaFila = 0;
    let filaCeldas = "";

    soportes.forEach(sop => {
      const cant = (matriz[agente] && matriz[agente][sop]) ? matriz[agente][sop] : 0;
      if (cant > 0) {
        filaCeldas += `<td><strong>${cant}</strong></td>`;
        sumaFila += cant;
        totalesColumna[sop] += cant;
      } else {
        filaCeldas += `<td></td>`;
      }
    });

    granTotalGeneral += sumaFila;

    tbodyHTML += `
      <tr>
        <td>${agente}</td>
        ${filaCeldas}
        <td><strong>${sumaFila > 0 ? sumaFila : ''}</strong></td>
      </tr>
    `;
  });
  tbody.innerHTML = tbodyHTML;

  // 3. Construir Tfoot (Fila de Totales)
  let tfootHTML = `<tr><th>Total general</th>`;
  soportes.forEach(sop => {
    const totCol = totalesColumna[sop];
    tfootHTML += `<th>${totCol > 0 ? totCol : ''}</th>`;
  });
  tfootHTML += `<th>${granTotalGeneral}</th></tr>`;
  tfoot.innerHTML = tfootHTML;
}

function exportarTablaDinamicaCSV() {
  if (!matrizPivotActual || !matrizPivotActual.agentes || matrizPivotActual.agentes.length === 0) {
    notificar("warning", "Sin Datos", "No hay datos de tabla dinámica para exportar en este período.");
    return;
  }

  const { agentes, soportes, matriz } = matrizPivotActual;

  let csv = "\uFEFFAgente," + soportes.map(s => `"${s}"`).join(",") + ',"Suma total"\n';

  const totalesColumna = {};
  soportes.forEach(s => totalesColumna[s] = 0);
  let granTotal = 0;

  agentes.forEach(ag => {
    let sumaFila = 0;
    const celdas = soportes.map(s => {
      const c = (matriz[ag] && matriz[ag][s]) ? matriz[ag][s] : 0;
      if (c > 0) {
        sumaFila += c;
        totalesColumna[s] += c;
        return `"${c}"`;
      }
      return '""';
    });
    granTotal += sumaFila;
    csv += `"${ag}",` + celdas.join(",") + `,"${sumaFila}"\n`;
  });

  // Fila Total General
  csv += `"Total general",` + soportes.map(s => `"${totalesColumna[s] || 0}"`).join(",") + `,"${granTotal}"\n`;

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Tabla_Dinamica_No_Procede_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);

  notificar("success", "Exportación Exitosa", "Se descargó la tabla dinámica en formato CSV.");
}
