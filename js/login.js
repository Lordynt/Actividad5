// Login simulado (sin base de datos)
const USUARIOS = [
  { usuario: "admin", correo: "admin@itoaxaca.edu.mx",    password: "admin123", nombre: "Administrador" },
  { usuario: "roque", correo: "roque@itoaxaca.edu.mx",    password: "1234",     nombre: "Roque Antonio" },
  { usuario: "jesus", correo: "23160870@itoaxaca.edu.mx", password: "1234",     nombre: "Jesús Cortés" }
];

const CLAVE_SESION = "usuarioActual"; // misma clave en login e index

const form = document.getElementById("formLogin");
const inputUsuario = document.getElementById("usuario");
const inputPassword = document.getElementById("password");
const alerta = document.getElementById("alertaLogin");
const alertaTexto = document.getElementById("alertaTexto");
const btnVer = document.getElementById("btnVerPassword");

// Si ya hay sesión válida, ir directo al sistema
try {
  const sesionPrevia = JSON.parse(sessionStorage.getItem(CLAVE_SESION));
  if (sesionPrevia && sesionPrevia.usuario) {
    window.location.href = "index.html";
  }
} catch (error) {
  sessionStorage.removeItem(CLAVE_SESION); // sesión dañada: se limpia
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

  // Se guarda usuario, nombre y correo (nunca la contraseña)
  sessionStorage.setItem(CLAVE_SESION, JSON.stringify({
    usuario: encontrado.usuario,
    nombre: encontrado.nombre,
    correo: encontrado.correo
  }));

  window.location.href = "index.html";
});