# 📋 Generador de Plantillas BURO & Control de Limpiezas

Sistema integral web (SPA) para generación ágil de plantillas BURO y gestión en tiempo real de la **Hoja de Control de Limpiezas** con base de datos en la nube **Supabase**, autenticación de usuarios con contraseñas, roles de acceso y personalización estética avanzada.

---

## 📁 Estructura del Proyecto

El código está organizado de manera modular en carpetas para facilitar su mantenimiento y escalabilidad:

```text
Sistema limpiezas/
│
├── 📄 index.html              # Estructura principal de la aplicación y modales
├── 📄 README.md                # Documentación técnica y guía de uso
├── 📄 supabase_schema.sql      # Esquema de tablas y políticas SQL para Supabase
│
├── 📂 css/
│   └── 🎨 styles.css          # Todos los estilos, temas oscuros/claros, tablas, modales y animaciones
│
└── 📂 js/
    ├── ⚙️ config.js           # Constantes, configuración Supabase, listas de opciones y formato de datos
    ├── 🔔 notifications.js    # Sistema de alertas sonoras y notificaciones emergentes Toast
    ├── 👤 auth.js             # Autenticación (login/registro), roles y gestión de usuarios
    ├── 📋 limpiezas.js        # Lógica de la Hoja de Control, tabla en vivo, edición 0ms y exportación CSV
    ├── 📈 estadisticas.js     # Métricas en tiempo real, Gráficos Chart.js y Tabla Dinámica Pivot
    ├── 📝 plantillas.js       # Diccionario completo de plantillas BURO, cálculo de reversiones y validaciones
    ├── 🎛️ ui.js               # Navegación SPA, temas visuales, fondo personalizable y calculadora flotante
    └── 🚀 app.js              # Inicialización de la aplicación (DOMContentLoaded) y eventos globales
```

---

## 🚀 Características Principales

1. **Navegación SPA (Pestañas Superiores)**:
   - `📄 Generador de Plantillas`: Plantillas completas, índices de acceso rápido con favoritos, validaciones y calculadora interactiva.
   - `📊 Hoja de Control de Limpiezas`: Tabla estilo Google Sheets con selectores tipo píldora (`Soporte`, `Categoría`, `Motivo`), filtros en vivo y exportación a CSV.

2. **Sistema de Autenticación & Usuarios**:
   - Inicio de sesión con **Usuario y Contraseña**.
   - Registro de nuevas cuentas.
   - Roles definidos:
     - **Editor / Administrador**: Modifica estados de soporte, motivos, categorías, elimina registros y administra usuarios.
     - **Solicitante**: Genera plantillas, sube limpiezas y visualiza la hoja en modo lectura.
   - Modal de administración para crear usuarios, asignar roles y restablecer contraseñas.

3. **Sincronización en Tiempo Real con Supabase**:
   - Notificaciones automáticas emergentes (`bottom-right`) cuando un agente de soporte atiende una limpieza.
   - Respaldo automático en `localStorage` ante desconexiones.

4. **Reglas de Negocio y Control de Duplicados**:
   - Casilla `¿Es una Reversión?` y botón `Subir a Hoja de Limpiezas` exclusivos para la plantilla `LIMPIEZA DE SALDOS`.
   - Prevención de duplicados con excepciones inteligentes para reversiones o estados no procedentes.

5. **Personalización Estética (Theme Engine)**:
   - Subida y compresión de fondo personalizado (Canvas).
   - Control de oscuridad del fondo (0% - 90%).
   - Control de opacidad y transparencia de campos (20% - 100%).
   - Selector de color de acento y modos Claro/Oscuro.

---

## 🛠️ Configuración de la Base de Datos (Supabase)

1. Crea un proyecto en [Supabase](https://supabase.com).
2. Dirígete a la sección **SQL Editor**.
3. Ejecuta el contenido del archivo `supabase_schema.sql`:
   ```sql
   -- Ver el archivo supabase_schema.sql en este repositorio
   ```
4. Obtén tu **Project URL** y **Anon Key** desde *Project Settings > API*.
5. En la aplicación, haz clic en **`⚙️ Supabase`** y pega tus credenciales.

---

## 🔑 Credenciales Iniciales Demo

| Usuario | Contraseña | Rol |
| :--- | :--- | :--- |
| `admin` | `admin123` | Editor / Administrador |
| `cristofer` | `123456` | Editor |
| `antuan` | `123456` | Editor |
| `adriel` | `123456` | Editor |
| `fabricio` | `123456` | Editor |
| `enoc` | `123456` | Editor |
| `solicitante` | `123456` | Solicitante |

---

## 💻 Despliegue en GitHub Pages

Este proyecto funciona 100% en el cliente (sin servidores requeridos):
1. Sube este repositorio a GitHub.
2. Ve a **Settings > Pages**.
3. En *Branch*, selecciona `main` / `root` y haz clic en **Save**.
4. ¡Tu aplicación estará en línea y accesible desde cualquier dispositivo!
