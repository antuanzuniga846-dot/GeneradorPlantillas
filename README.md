# 📄 Generador de Plantillas BURO & Control de Limpiezas

Sistema web integral de alta productividad (SPA) diseñado para la generación ágil de plantillas BURO, gestión en tiempo real de la **Hoja de Control de Limpiezas**, analítica con tabla dinámica interactiva, sincronización en la nube con **Supabase**, autenticación por roles y un motor de personalización visual avanzado.

---

## 📸 Módulos Principales de la Aplicación

1. **📄 Generador de Plantillas**:
   - **Índice Lateral de Acceso Rápido**: Explorador categorizado (`✅ Procede`, `⛔ No Procede`, `🚫 Rechazos`) con sistema de favoritos (`★`).
   - **Scroll Independiente**: Desplazamiento vertical propio en la lista de plantillas; la pantalla principal permanece estática.
   - **Selección al Clic**: Activación instantánea al hacer clic en cualquier parte de la fila o casilla de la plantilla.
   - **Fijación Dinámica (Pin)**: Permite anclar la tarjeta del generador para mantenerla visible en pantalla mientras se navega el índice.
   - **Formatos Automáticos**: Reemplazo inteligente de variables (gestión, cliente, cédula, monto formateado en colones ¢, fechas y penalidades por terminal ligado).
   - **Opciones de Limpieza de Saldos**: Detección de reversiones y casilla REC (generar formato sin subir a la hoja).

2. **📊 Hoja de Control de Limpiezas (Sheets UI)**:
   - Tabla interactiva estilo hoja de cálculo para seguimiento de casos en tiempo real.
   - **Edición Rápida (0ms)** con menús desplegables tipo píldora para `Soporte`, `Categoría` y `Motivo`.
   - **Copiado Inmediato**: Un clic sobre cualquier cédula la copia directo al portapapeles.
   - **Búsqueda & Filtros en Vivo**: Filtrado instantáneo por número de cédula, agente o estado.
   - **Exportación CSV**: Descarga directa de la base de registros en formato compatible con Excel.

3. **📈 Métricas & Tabla Dinámica (Estadísticas)**:
   - Indicadores KPI clave en tiempo real: total de limpiezas, casos atendidos, pendientes y montos gestionados.
   - **Tabla Dinámica (Pivot)** interactiva con desglose por agente, categoría de soporte y fecha.
   - Gráficos visuales de distribución y rendimiento.

4. **🧮 Calculadora Flotante Integrada**:
   - Herramienta para cálculo rápido de sumas de saldos y penalidades.
   - Posibilidad de **arrastrar (Drag & Drop)** por la pantalla.
   - **Control de Visibilidad**: Botón de activación/desactivación en la barra lateral, interruptor en personalización y botón de cierre directo (`✕`) en la cabecera.
   - Plegado rápido con un clic en su título.

5. **🎨 Motor de Personalización (Theme Engine)**:
   - **Modos Claro y Oscuro**: Ajuste dinámico de contraste (texto blanco nítido en modo oscuro y texto oscuro en modo claro).
   - **Paleta de Colores de Acento**: Selector visual y código HEX para cambiar el color de acento del sistema en tiempo real.
   - **Opacidad y Tinte de Cajas**: Ajuste de transparencia de formularios y tablas sin desenfoque (vidrio nítido 100%).
   - **Fondo Personalizado**: Carga de imágenes con compresión local en Canvas y deslizador de oscuridad (0% - 90%).

6. **🔒 Autenticación & Control de Acceso (RBAC)**:
   - Inicio de sesión seguro con usuario y contraseña.
   - Roles definidos:
     - **Administrador / Editor**: Modificación de estados, motivos, gestión de limpiezas y administración de usuarios.
     - **Lector / Solicitante**: Generación de plantillas, subida de casos y consulta en modo lectura.
   - Panel de administración para altas, asignación de roles y reseteo de credenciales.

---

## 📁 Estructura del Código Fuente

El proyecto sigue una arquitectura modular en JavaScript nativo (Vanilla ES6+) sin dependencias pesadas:

```text
Sistema limpiezas/
│
├── 📄 index.html              # Estructura principal SPA, barra superior, sidebar y modales
├── 📄 README.md                # Documentación técnica del sistema
├── 📄 supabase_schema.sql      # Tablas SQL, índices y políticas de seguridad RLS
│
├── 📂 css/
│   └── 🎨 styles.css          # Sistema de diseño, temas Dark/Light, cards de vidrio y animaciones
│
└── 📂 js/
    ├── ⚙️ config.js           # Parámetros globales, credenciales Supabase y formatos
    ├── 🔔 notifications.js    # Sistema de notificaciones emergentes Toast y alertas
    ├── 👤 auth.js             # Autenticación, control de sesiones y gestión de usuarios
    ├── 📋 limpiezas.js        # Lógica de la Hoja de Control, tabla en vivo y exportador CSV
    ├── 📈 estadisticas.js     # Cálculos KPI, tabla dinámica pivot y gráficos
    ├── 📝 plantillas.js       # Diccionario de plantillas BURO, accesos rápidos y favoritos
    ├── 🎛️ ui.js               # Control de sidebar, reloj, temas, fondo, pin y calculadora
    └── 🚀 app.js              # Inicialización general (DOMContentLoaded) y event listeners
```

---

## 🛠️ Configuración de Supabase (Base de Datos en la Nube)

1. Crea una cuenta o ingresa a [Supabase](https://supabase.com).
2. Crea un nuevo proyecto.
3. Dirígete a la pestaña **SQL Editor** y ejecuta el script [`supabase_schema.sql`](supabase_schema.sql).
4. Copia tu **Project URL** y tu **API Anon Key** desde *Project Settings > API*.
5. Abre la aplicación web y actualiza las credenciales en `js/config.js` o mediante el modal de configuración de la barra de estado.

---

## 👥 Credenciales Iniciales Demo

| Usuario | Contraseña | Rol Asignado |
| :--- | :--- | :--- |
| `admin` | `admin123` | Administrador |
| `cristofer` | `123456` | Editor |
| `antuan` | `123456` | Editor |
| `adriel` | `123456` | Editor |
| `fabricio` | `123456` | Editor |
| `enoc` | `123456` | Editor |
| `solicitante` | `123456` | Solicitante (Lector) |

---

## 🌐 Despliegue en Producción (GitHub Pages / Vercel / Netlify)

Al tratarse de una solución 100% Client-Side:
1. Sube los archivos a tu repositorio en GitHub.
2. Ve a **Settings** > **Pages**.
3. En **Branch**, selecciona `main` (o `master`) y la carpeta `/ (root)`.
4. Guarda los cambios. Tu sistema estará disponible de forma inmediata y segura en la web.

---

## 📜 Historial de Versiones Recientes

- **v2.9 (17/10/2026)**:
  - Scroll independiente en el índice de Acceso Rápido con cabecera fija y pantalla estática.
  - Botón completo para activar/desactivar la calculadora desde el sidebar, cabecera (`✕`) y personalización.
  - Corrección de contraste en modo oscuro (texto blanco con sombra) y modo claro (texto oscuro limpio).
- **v2.8 (13/10/2026)**:
  - Botón de Fijado (**Pin**) del generador para scroll cómodo.
  - Rediseño de botones estilo cápsula píldora.
  - Selección de plantilla al hacer clic en cualquier parte de la fila.
- **v2.7 (13/10/2026)**:
  - Sincronización de tarjetas de vidrio con paleta de acento y deslizador de opacidad.
  - Eliminación total de desenfoque (blur) para máxima nitidez.

---

© 2026 Generador de Plantillas BURO & Control de Limpiezas. Todos los derechos reservados.
