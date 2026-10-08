document.addEventListener("DOMContentLoaded", () => {

  // ===================== 0. PROTEGER LA PÁGINA =====================
  const sesionRaw = sessionStorage.getItem("usuarioActual");

  if (!sesionRaw) {
    // Sin sesión → regresar al login antes de mostrar nada
    window.location.href = "login.html";
    return;
  }

  let sesion;
  try {
    sesion = JSON.parse(sesionRaw);
  } catch (e) {
    sessionStorage.removeItem("usuarioActual");
    window.location.href = "login.html";
    return;
  }

  // Si llegamos aquí, hay sesión válida → mostrar el body
  document.getElementById("appBody").classList.remove("d-none");

  // ===================== REFERENCIAS DOM =====================
  const sidebar           = document.getElementById("sidebar");
  const content           = document.getElementById("content");
  const btnHamburguesa    = document.getElementById("btnHamburguesa");
  const linkInicio        = document.getElementById("linkInicio");
  const linkCaptura       = document.getElementById("linkCaptura");
  const seccionBienvenida = document.getElementById("seccionBienvenida");
  const seccionCaptura    = document.getElementById("seccionCaptura");
  const btnSalir          = document.getElementById("btnSalir");
  const nombreUsuarioNav  = document.getElementById("nombreUsuarioNav");
  const formAlumno        = document.getElementById("formAlumno");

  const inputNombre   = document.getElementById("nombreAlumno");
  const inputCorreo   = document.getElementById("correoAlumno");
  const inputPassword = document.getElementById("passwordAlumno");
  const inputNumCtrl  = document.getElementById("numControl");
  const inputEdad     = document.getElementById("edadAlumno");

  // Modal edad
  const modalEdad     = new bootstrap.Modal(document.getElementById("modalEdad"));
  const modalEdadBody = document.getElementById("modalEdadBody");

  // Modal eliminar
  const modalEliminar        = new bootstrap.Modal(document.getElementById("modalEliminar"));
  const btnAbrirEliminar     = document.getElementById("btnAbrirEliminar");
  const btnConfirmarEliminar = document.getElementById("btnConfirmarEliminar");
  const inputNumEliminar     = document.getElementById("numControlEliminar");
  const alertaEliminar       = document.getElementById("alertaEliminar");
  const alertaEliminarTexto  = document.getElementById("alertaEliminarTexto");

  const tablaAlumnos  = document.getElementById("tablaAlumnos");

  // ===================== 1. NOMBRE DEL USUARIO EN NAVBAR =====================
  nombreUsuarioNav.textContent = sesion.nombre || sesion.usuario || "Usuario";

  // ===================== 2. TOGGLE DEL SIDEBAR =====================
  function cerrarSidebarMovil() {
    if (window.innerWidth <= 768) {
      sidebar.classList.remove("show");
    }
  }

  btnHamburguesa.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    sidebar.classList.toggle("show");
    content.classList.toggle("expanded");
  });

  // ===================== 3. NAVEGACIÓN ENTRE SECCIONES =====================
  linkInicio.addEventListener("click", (e) => {
    e.preventDefault();
    seccionCaptura.classList.add("d-none");
    seccionBienvenida.classList.remove("d-none");
    cerrarSidebarMovil();
  });

  linkCaptura.addEventListener("click", (e) => {
    e.preventDefault();
    seccionBienvenida.classList.add("d-none");
    seccionCaptura.classList.remove("d-none");
    cerrarSidebarMovil();
    renderAlumnos();
  });

  // ===================== 4. "BASE DE DATOS" CON ARREGLO + localStorage =====
  const STORAGE_KEY = "alumnosDB";

  function cargarAlumnos() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn("Error al leer alumnos:", e);
      return [];
    }
  }

  function guardarAlumnos(arr) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  }

  let alumnos = cargarAlumnos();

  function renderAlumnos() {
    if (!tablaAlumnos) return;

    if (alumnos.length === 0) {
      tablaAlumnos.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-muted">Sin alumnos registrados</td>
        </tr>`;
      return;
    }

    tablaAlumnos.innerHTML = alumnos.map((a, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${a.nombre}</td>
        <td>${a.correo}</td>
        <td>${a.numControl}</td>
        <td>${a.edad}</td>
      </tr>
    `).join("");
  }

  // Helper para limpiar validaciones y resetear el formulario
  function limpiarFormulario() {
    formAlumno.reset();
    formAlumno.classList.remove("was-validated");
    [inputNombre, inputCorreo, inputPassword, inputNumCtrl, inputEdad]
      .forEach(inp => inp.setCustomValidity(""));
  }

  // ===================== 5. VALIDACIÓN Y GUARDADO =====================
  formAlumno.addEventListener("submit", (e) => {
    e.preventDefault();
    e.stopPropagation();

    let valido = true;

    // --- Nombre ---
    if (inputNombre.value.trim().length < 3) {
      inputNombre.setCustomValidity("error");
      valido = false;
    } else {
      inputNombre.setCustomValidity("");
    }

    // --- Correo (utileria.js) ---
    const correoOk = validarCorreo(inputCorreo.value.trim());
    inputCorreo.setCustomValidity(correoOk ? "" : "error");
    if (!correoOk) valido = false;

    // --- Password (utileria.js) ---
    const passOk = validarPassword(inputPassword.value);
    inputPassword.setCustomValidity(passOk ? "" : "error");
    if (!passOk) valido = false;

    // --- Número de control: 6 dígitos ---
    const numOk = /^\d{6}$/.test(inputNumCtrl.value.trim());
    inputNumCtrl.setCustomValidity(numOk ? "" : "error");
    if (!numOk) valido = false;

    // --- Edad ---
    const edad = parseInt(inputEdad.value, 10);
    const edadOk = !isNaN(edad) && edad > 0 && edad < 120;
    inputEdad.setCustomValidity(edadOk ? "" : "error");
    if (!edadOk) valido = false;

    formAlumno.classList.add("was-validated");
    if (!valido) return;

    // --- Verificar número de control duplicado ---
    if (alumnos.some(a => a.numControl === inputNumCtrl.value.trim())) {
      modalEdadBody.innerHTML = `
        <div class="text-center">
          <i class="bi bi-x-circle-fill text-danger display-4"></i>
          <h4 class="mt-3 text-danger">Número de control duplicado</h4>
          <p class="mb-0">Ya existe un alumno con el número
            <strong>${inputNumCtrl.value.trim()}</strong>.</p>
        </div>`;
      modalEdad.show();
      return;
    }

    // --- Crear objeto alumno (aún sin guardar) ---
    const nuevoAlumno = {
      nombre: inputNombre.value.trim(),
      correo: inputCorreo.value.trim(),
      numControl: inputNumCtrl.value.trim(),
      edad: edad,
      fechaRegistro: new Date().toISOString()
    };

    // --- Si es menor de edad, NO se guarda ---
    if (edad < 18) {
      modalEdadBody.innerHTML = `
        <div class="text-center">
          <i class="bi bi-exclamation-triangle-fill text-warning display-4"></i>
          <h4 class="mt-3 text-warning">Menor de edad</h4>
          <p class="mb-0">El alumno <strong>${nuevoAlumno.nombre}</strong>
            tiene <strong>${edad}</strong> años y <strong>no puede registrarse</strong>.</p>
          <small class="text-muted d-block mt-2">Solo se permiten alumnos mayores de 18 años.</small>
        </div>`;
      modalEdad.show();
      limpiarFormulario();
      return;
    }

    // --- Es mayor de edad → se guarda ---
    alumnos.push(nuevoAlumno);
    guardarAlumnos(alumnos);
    renderAlumnos();

    modalEdadBody.innerHTML = `
      <div class="text-center">
        <i class="bi bi-check-circle-fill text-success display-4"></i>
        <h4 class="mt-3 text-success">Mayor de edad</h4>
        <p class="mb-0">El alumno <strong>${nuevoAlumno.nombre}</strong>
          tiene <strong>${edad}</strong> años y fue registrado correctamente.</p>
      </div>`;
    modalEdad.show();

    limpiarFormulario();
  });

  // ===================== 6. ELIMINAR ALUMNO =====================
  btnAbrirEliminar.addEventListener("click", () => {
    inputNumEliminar.value = "";
    alertaEliminar.classList.add("d-none");
    modalEliminar.show();
  });

  btnConfirmarEliminar.addEventListener("click", () => {
    const num = inputNumEliminar.value.trim();
    alertaEliminar.classList.add("d-none");

    // Validar que sea un número de 6 dígitos
    if (!/^\d{6}$/.test(num)) {
      alertaEliminarTexto.textContent = "Ingresa un número de control válido de 6 dígitos.";
      alertaEliminar.classList.remove("d-none");
      return;
    }

    // Buscar el índice del alumno
    const index = alumnos.findIndex(a => a.numControl === num);

    if (index === -1) {
      alertaEliminarTexto.textContent = `No se encontró ningún alumno con el número de control ${num}.`;
      alertaEliminar.classList.remove("d-none");
      return;
    }

    // Eliminar del arreglo
    const eliminado = alumnos.splice(index, 1)[0];

    // Persistir y refrescar tabla
    guardarAlumnos(alumnos);
    renderAlumnos();

    // Cerrar modal y avisar con el modal de edad (reutilizado)
    modalEliminar.hide();
    modalEdadBody.innerHTML = `
      <div class="text-center">
        <i class="bi bi-check-circle-fill text-success display-4"></i>
        <h4 class="mt-3 text-success">Alumno eliminado</h4>
        <p class="mb-0">Se eliminó a <strong>${eliminado.nombre}</strong>
          (N° control: <strong>${eliminado.numControl}</strong>).</p>
      </div>`;
    modalEdad.show();
  });

  // Permitir Enter dentro del modal de eliminar
  inputNumEliminar.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      btnConfirmarEliminar.click();
    }
  });

    // ===================== 7. SALIR DEL SISTEMA =====================
  btnSalir.addEventListener("click", (e) => {
    e.preventDefault();

    sessionStorage.removeItem("usuarioActual");
    window.location.href = "login.html";
  });

  // ===================== 8. RENDER INICIAL =====================
  renderAlumnos();
});