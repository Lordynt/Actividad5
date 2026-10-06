document.addEventListener("DOMContentLoaded", () => {
  // ===== Referencias =====
  const sidebar         = document.getElementById("sidebar");
  const content         = document.getElementById("content");
  const btnHamburguesa  = document.getElementById("btnHamburguesa");
  const linkCaptura     = document.getElementById("linkCaptura");
  const seccionBienvenida = document.getElementById("seccionBienvenida");
  const seccionCaptura  = document.getElementById("seccionCaptura");
  const btnSalir        = document.getElementById("btnSalir");
  const nombreUsuarioNav = document.getElementById("nombreUsuarioNav");
  const formAlumno      = document.getElementById("formAlumno");

  // ===== 1. Mostrar nombre del usuario logueado =====
  // TODO: leer desde localStorage (lo pondrá login.js)
  const usuario = localStorage.getItem("usuarioLogueado");
  if (usuario) {
    nombreUsuarioNav.textContent = usuario;
  }

  // ===== 2. Toggle del sidebar (hamburguesa) =====
  btnHamburguesa.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    sidebar.classList.toggle("show");
    content.classList.toggle("expanded");
  });

  // ===== 3. Mostrar sección de captura =====
  linkCaptura.addEventListener("click", (e) => {
    e.preventDefault();
    seccionBienvenida.classList.add("d-none");
    seccionCaptura.classList.remove("d-none");
  });

  // ===== 4. Validación del formulario de alumnos =====
  // TODO: integrar validarCorreo y validarPassword de utileria.js
  formAlumno.addEventListener("submit", (e) => {
    e.preventDefault();
    // Aquí irá la lógica con las funciones de utileria.js
    console.log("Submit pendiente de conectar utileria.js");
  });

  // ===== 5. Salir del sistema =====
  btnSalir.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("usuarioLogueado");
    window.location.href = "login.html";
  });
});