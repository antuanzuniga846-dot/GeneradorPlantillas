// ==========================================
// SISTEMA DE USUARIOS, LOGIN, REGISTRO Y ADMIN
// ==========================================

let listaUsuarios = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS_V6)) || USUARIOS_INICIALES;
let usuarioLogueado = JSON.parse(localStorage.getItem(STORAGE_KEY_AUTH)) || null;

async function cargarUsuariosDesdeSupabase() {
  if (!supabaseClient) return;
  try {
    const { data, error } = await supabaseClient.from("usuarios_permisos").select("*");
    if (!error && data && data.length > 0) {
      listaUsuarios = data.map(u => ({
        id: u.id,
        usuario: (u.usuario || u.nombre).trim().toLowerCase(),
        nombre: u.nombre || u.usuario,
        password: u.password || "123456",
        rol: u.rol || "solicitante",
        activo: u.activo !== false
      }));
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(listaUsuarios));
      
      // Refrescar permisos de la sesión activa
      if (usuarioLogueado) {
        const match = listaUsuarios.find(u => u.usuario === usuarioLogueado.usuario);
        if (match) {
          usuarioLogueado = match;
          localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(usuarioLogueado));
          actualizarUIUsuario();
        }
      }
    }
  } catch (err) {
    console.error("Error cargando usuarios:", err);
  }
}

function esEditor() {
  return usuarioLogueado && usuarioLogueado.rol === "editor";
}

function cambiarTabLogin(tab) {
  const btnIngreso = document.getElementById("tabLoginIngreso");
  const btnRegistro = document.getElementById("tabLoginRegistro");
  const formIngreso = document.getElementById("formIngreso");
  const formRegistro = document.getElementById("formRegistro");

  if (tab === "ingreso") {
    btnIngreso.classList.add("active");
    btnRegistro.classList.remove("active");
    formIngreso.style.display = "block";
    formRegistro.style.display = "none";
  } else {
    btnIngreso.classList.remove("active");
    btnRegistro.classList.add("active");
    formIngreso.style.display = "none";
    formRegistro.style.display = "block";
  }
}

function togglePasswordVisibilidad(inputId, iconElem) {
  const input = document.getElementById(inputId);
  if (input.type === "password") {
    input.type = "text";
    iconElem.textContent = "🙈";
  } else {
    input.type = "password";
    iconElem.textContent = "👁️";
  }
}

function mostrarErrorLogin(mensaje) {
  const fb = document.getElementById("loginFeedback");
  if (fb) {
    fb.style.display = "block";
    fb.style.background = "rgba(211, 47, 47, 0.25)";
    fb.style.border = "1px solid #d32f2f";
    fb.style.color = "#ff8a80";
    fb.innerHTML = `⚠️ ${mensaje}`;
  }
  notificar("error", "Acceso Inválido", mensaje);
}

async function ejecutarLogin() {
  const fb = document.getElementById("loginFeedback");
  if (fb) fb.style.display = "none";

  const userInput = (document.getElementById("txtLoginUser").value || "").trim().toLowerCase();
  const passInput = (document.getElementById("txtLoginPass").value || "").trim();

  if (!userInput || !passInput) {
    mostrarErrorLogin("Por favor ingresa tu usuario y tu contraseña.");
    return;
  }

  const userNorm = normalizarStr(userInput);
  const passNorm = normalizarStr(passInput);

  // Intentar validar en Supabase primero si está conectado
  let usuarioValido = null;

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from("usuarios_permisos")
        .select("*")
        .eq("activo", true);

      if (!error && data && data.length > 0) {
        const u = data.find(item => {
          const uMatch = normalizarStr(item.usuario) === userNorm || normalizarStr(item.nombre) === userNorm;
          const pMatch = item.password === passInput || normalizarStr(item.password) === passNorm;
          return uMatch && pMatch;
        });
        if (u) {
          usuarioValido = {
            id: u.id,
            usuario: (u.usuario || u.nombre).trim().toLowerCase(),
            nombre: u.nombre || u.usuario,
            rol: u.rol || "solicitante",
            activo: true
          };
        }
      }
    } catch (e) {
      console.warn("Error validando en Supabase:", e);
    }
  }

  // Respaldo en base de datos local (incluye a los 28 agentes y soporte)
  if (!usuarioValido) {
    const localUser = listaUsuarios.find(u => {
      if (!u.activo) return false;
      const uMatch = normalizarStr(u.usuario) === userNorm || normalizarStr(u.nombre) === userNorm;
      const pMatch = u.password === passInput || normalizarStr(u.password) === passNorm;
      return uMatch && pMatch;
    });
    if (localUser) {
      usuarioValido = localUser;
    }
  }

  if (!usuarioValido) {
    mostrarErrorLogin("Usuario o contraseña incorrectos. Verifica tus datos.");
    return;
  }

  usuarioLogueado = usuarioValido;
  const recordar = document.getElementById("chkRecordarSesion").checked;
  if (recordar) {
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(usuarioLogueado));
  } else {
    sessionStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(usuarioLogueado));
  }

  if (fb) {
    fb.style.display = "block";
    fb.style.background = "rgba(46, 125, 50, 0.25)";
    fb.style.border = "1px solid #4caf50";
    fb.style.color = "#a5d6a7";
    fb.innerHTML = `✅ ¡Bienvenido(a), <strong>${usuarioLogueado.nombre}</strong>!`;
  }

  setTimeout(() => {
    document.getElementById("modalLogin").style.display = "none";
    if (fb) fb.style.display = "none";
    actualizarUIUsuario();
    notificar("success", "Sesión Iniciada", `Bienvenido(a), <strong>${usuarioLogueado.nombre}</strong>.`);
  }, 300);
}

async function ejecutarRegistro() {
  const nombre = document.getElementById("txtRegNombre").value.trim();
  const user = document.getElementById("txtRegUser").value.trim().toLowerCase();
  const pass = document.getElementById("txtRegPass").value.trim();

  if (!nombre || !user || !pass) {
    notificar("warning", "Campos Requeridos", "Completa todos los campos para crear tu cuenta.");
    return;
  }

  const existeLocal = listaUsuarios.some(u => u.usuario === user);
  if (existeLocal) {
    notificar("error", "Usuario Existente", "El nombre de usuario ya está en uso. Elige otro.");
    return;
  }

  const nuevoUsuario = {
    usuario: user,
    nombre: nombre,
    password: pass,
    rol: "solicitante",
    activo: true
  };

  if (supabaseClient) {
    try {
      const { error } = await supabaseClient.from("usuarios_permisos").insert({
        usuario: user,
        nombre: nombre,
        password: pass,
        rol: "solicitante",
        activo: true
      });
      if (error) {
        notificar("error", "Error Supabase", error.message);
        return;
      }
    } catch (err) {
      console.error(err);
    }
  }

  listaUsuarios.push(nuevoUsuario);
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(listaUsuarios));

  usuarioLogueado = nuevoUsuario;
  localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(usuarioLogueado));

  document.getElementById("modalLogin").style.display = "none";
  actualizarUIUsuario();
  notificar("success", "Cuenta Creada", `¡Bienvenido(a), <strong>${nombre}</strong>! Tu cuenta ha sido registrada.`);
}

function cerrarSesionUsuario() {
  usuarioLogueado = null;
  localStorage.removeItem(STORAGE_KEY_AUTH);
  sessionStorage.removeItem(STORAGE_KEY_AUTH);

  document.getElementById("txtLoginUser").value = "";
  document.getElementById("txtLoginPass").value = "";
  const fb = document.getElementById("loginFeedback");
  if (fb) fb.style.display = "none";
  document.getElementById("modalLogin").style.display = "flex";
  cambiarTabLogin('ingreso');
  actualizarUIUsuario();
  notificar("info", "Sesión Cerrada", "Has salido del sistema.");
}

function actualizarUIUsuario() {
  const lblNombre = document.getElementById("lblUsuarioNombre");
  const lblUser = document.getElementById("lblUsuarioUser");
  const lblRol = document.getElementById("lblRolActual");
  const btnAdmin = document.getElementById("btnAdminUsuarios");

  if (!usuarioLogueado) {
    lblNombre.textContent = "Invitado";
    lblUser.textContent = "-";
    lblRol.textContent = "Sin Sesión";
    lblRol.className = "role-badge role-reader";
    btnAdmin.style.display = "none";
  } else {
    lblNombre.textContent = usuarioLogueado.nombre;
    lblUser.textContent = usuarioLogueado.usuario;
    if (esEditor()) {
      lblRol.textContent = "Editor Autorizado";
      lblRol.className = "role-badge role-editor";
      btnAdmin.style.display = "inline-block";
    } else {
      lblRol.textContent = "Solicitante";
      lblRol.className = "role-badge role-reader";
      btnAdmin.style.display = "none";
    }
  }
  renderizarTablaSheet();
}

// ==========================================
// ADMINISTRACIÓN DE USUARIOS (SOLO EDITORES)
// ==========================================
function abrirModalAdminUsuarios() {
  if (!esEditor()) {
    notificar("error", "Acceso Restringido", "Solo administradores y editores pueden gestionar usuarios.");
    return;
  }
  renderizarListaUsuariosAdminUI();
  document.getElementById("modalAdminUsuarios").style.display = "flex";
}

function cerrarModalAdminUsuarios() {
  document.getElementById("modalAdminUsuarios").style.display = "none";
}

function renderizarListaUsuariosAdminUI() {
  const container = document.getElementById("listaUsuariosAdminUI");
  container.innerHTML = "";

  listaUsuarios.forEach((u, idx) => {
    const item = document.createElement("div");
    item.style = "display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 0.85rem;";
    item.innerHTML = `
      <div>
        <strong>${u.nombre}</strong> <span style="color:#aaa;">(@${u.usuario})</span>
        <div><span class="role-badge ${u.rol==='editor'?'role-editor':'role-reader'}" style="font-size:0.68rem;">${u.rol}</span> · Clave: <code style="color:#81c784;">${u.password}</code></div>
      </div>
      <div style="display: flex; gap: 4px;">
        <button onclick="cambiarRolUsuario('${u.usuario}', '${u.rol==='editor'?'solicitante':'editor'}')" style="padding: 4px 8px; font-size: 0.75rem; border: 1px solid #777; background: #2a2a3a; color: #fff; border-radius: 4px; cursor: pointer;">Hacer ${u.rol==='editor'?'Solicitante':'Editor'}</button>
        <button onclick="eliminarUsuarioAdmin(${idx})" style="padding: 4px 8px; font-size: 0.75rem; border: none; background: #d32f2f; color: #fff; border-radius: 4px; cursor: pointer;">🗑️</button>
      </div>
    `;
    container.appendChild(item);
  });
}

async function guardarUsuarioDesdeAdmin() {
  const user = document.getElementById("txtAdminNuevoUser").value.trim().toLowerCase();
  const nombre = document.getElementById("txtAdminNuevoNombre").value.trim();
  const pass = document.getElementById("txtAdminNuevoPass").value.trim();
  const rol = document.getElementById("selAdminNuevoRol").value;

  if (!user || !nombre || !pass) {
    notificar("warning", "Faltan Datos", "Ingresa usuario, nombre y contraseña.");
    return;
  }

  const idx = listaUsuarios.findIndex(u => u.usuario === user);
  if (idx !== -1) {
    listaUsuarios[idx].nombre = nombre;
    listaUsuarios[idx].password = pass;
    listaUsuarios[idx].rol = rol;
  } else {
    listaUsuarios.push({ usuario: user, nombre: nombre, password: pass, rol: rol, activo: true });
  }

  if (supabaseClient) {
    await supabaseClient.from("usuarios_permisos").upsert({
      usuario: user,
      nombre: nombre,
      password: pass,
      rol: rol,
      activo: true
    }, { onConflict: "usuario" });
  }

  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(listaUsuarios));
  renderizarListaUsuariosAdminUI();
  actualizarUIUsuario();

  document.getElementById("txtAdminNuevoUser").value = "";
  document.getElementById("txtAdminNuevoNombre").value = "";
  document.getElementById("txtAdminNuevoPass").value = "";

  notificar("success", "Usuario Guardado", `Se actualizaron las credenciales de: <strong>${nombre}</strong>.`);
}

async function cambiarRolUsuario(usuario, nuevoRol) {
  const item = listaUsuarios.find(u => u.usuario === usuario);
  if (item) {
    item.rol = nuevoRol;
    if (supabaseClient) {
      await supabaseClient.from("usuarios_permisos").update({ rol: nuevoRol }).eq("usuario", usuario);
    }
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(listaUsuarios));
    renderizarListaUsuariosAdminUI();
    actualizarUIUsuario();
    notificar("info", "Rol Actualizado", `@${usuario} ahora es <strong>${nuevoRol}</strong>.`);
  }
}

async function eliminarUsuarioAdmin(index) {
  const u = listaUsuarios[index];
  if (u.usuario === usuarioLogueado.usuario) {
    notificar("error", "Acción Bloqueada", "No puedes eliminar tu propio usuario activo.");
    return;
  }
  const confirmar = confirm(`¿Estás seguro de que deseas eliminar al usuario @${u.usuario} (${u.nombre})?`);
  if (!confirmar) return;

  if (supabaseClient) {
    await supabaseClient.from("usuarios_permisos").delete().eq("usuario", u.usuario);
  }
  listaUsuarios.splice(index, 1);
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(listaUsuarios));
  renderizarListaUsuariosAdminUI();
  notificar("info", "Usuario Eliminado", `Se borró la cuenta de @${u.usuario}.`);
}
