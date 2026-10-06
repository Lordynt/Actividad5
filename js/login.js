// Login simulado (sin base de datos)
// Los usuarios están definidos aquí. Cámbialos por los que necesiten.
const USUARIOS = [
  { usuario: "admin",  correo: "admin@itoaxaca.edu.mx",    password: "admin123", nombre: "Administrador" },
  { usuario: "roque",  correo: "roque@itoaxaca.edu.mx",    password: "1234",     nombre: "Roque Antonio" },
  { usuario: "jesus",  correo: "23160870@itoaxaca.edu.mx", password: "1234",     nombre: "Jesús Cortés" }
];

const form = document.getElementById("formLogin");
const inputUsuario = document.getElementById("usuario");
const inputPassword = document.getElementById("password");
const alerta = document.getElementById("alertaLogin");
const alertaTexto = document.getElementById("alertaTexto");
const btnVer = document.getElementById("btnVerPassword");

// Si ya hay sesión, ir directo al sistema
if (sessionStorage.getItem("usuarioActual")) {
  window.location.href = "index.html";
}

function mostrarError(mensaje) {
  alertaTexto.textContent = mensaje;
  alerta.classList.remove("d-none");
}

// Mostrar / ocultar contraseña
btnVer.addEventListener("click", () => {
  const visible = inputPassword.type === "text";
  inputPassword.type = visible ? "password" : "text";
  btnVer.innerHTML = visible ? '<i class="bi bi-eye"></i>' : '<i class="bi bi-eye-slash"></i>';
  btnVer.setAttribute("aria-label", visible ? "Mostrar contraseña" : "Ocultar contraseña");
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  alerta.classList.add("d-none");

  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    return;
  }

  const entrada = inputUsuario.value.trim().toLowerCase();
  const password = inputPassword.value;

  const encontrado = USUARIOS.find(u =>
    (u.usuario.toLowerCase() === entrada || u.correo.toLowerCase() === entrada) &&
    u.password === password
  );

  if (!encontrado) {
    mostrarError("Usuario o contraseña incorrectos. Revisa tus datos e inténtalo de nuevo.");
    inputPassword.value = "";
    inputPassword.focus();
    return;
  }

  // Guardar sesión (se borra al cerrar la pestaña)
  sessionStorage.setItem("usuarioActual", JSON.stringify({
    usuario: encontrado.usuario,
    nombre: encontrado.nombre
  }));

  window.location.href = "index.html";
});