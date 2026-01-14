const API_BASE = "http://localhost:5001";
const API_KEY = "12345ABCDEF";

const API_HEADERS = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${API_KEY}`
};

const GET_HEADERS = {
  "Authorization": `Bearer ${API_KEY}`
};

document.addEventListener("DOMContentLoaded", () => {
  cargarCarrerasSelects();

  const formAlumno = document.getElementById("formAlumno");
  if (formAlumno) {
    formAlumno.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nombre = document.getElementById("nombreAlumno").value;
      const carrera = document.getElementById("carreraAlumno").value;
      if (!nombre || !carrera) return;

      try {
        const res = await fetch(`${API_BASE}/api/students`, {
          method: "POST",
          headers: API_HEADERS,
          body: JSON.stringify({ name: nombre, career: carrera })
        });

        if (res.ok) {
          Swal.fire("¡Éxito!", "Alumno registrado correctamente.", "success");
          formAlumno.reset();
          cargarAlumnos();
        } else {
          Swal.fire("Error", "No se pudo registrar el alumno.", "error");
        }
      } catch {
        Swal.fire("Error", "Error de conexión con la API.", "error");
      }
    });
  }

  if (document.querySelector("#tablaAlumnos")) cargarAlumnos();

  // =============== CARRERAS ===================
  const formCarrera = document.getElementById("formCarrera");
  if (formCarrera) {
    formCarrera.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nombre = document.getElementById("nombreCarrera").value;
      const categoriaId = document.getElementById("categoriaCarrera").value;
      if (!nombre || !categoriaId) return;

      // Buscar el nombre de la categoría seleccionada
      let categoriaNombre = "";
      try {
        const resCat = await fetch(`${API_BASE}/api/categories`, {
          method: "GET",
          headers: GET_HEADERS
        });
        const categorias = await resCat.json();
        const categoriaObj = categorias.find(cat => String(cat.id) === String(categoriaId));
        categoriaNombre = categoriaObj ? categoriaObj.name : "";
      } catch {
        Swal.fire("Error", "No se pudo obtener la categoría.", "error");
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/careers`, {
          method: "POST",
          headers: API_HEADERS,
          body: JSON.stringify({ name: nombre, category: categoriaId, categoryName: categoriaNombre })
        });

        if (res.ok) {
          Swal.fire("¡Éxito!", "Carrera registrada correctamente.", "success");
          formCarrera.reset();
          cargarCarreras();
        } else if (res.status === 409) {
          Swal.fire("Error", "Ya existe una carrera con ese nombre.", "warning");
        } else {
          Swal.fire("Error", "No se pudo registrar la carrera.", "error");
        }
      } catch {
        Swal.fire("Error", "Error de conexión con la API.", "error");
      }
    });
  }

  if (document.querySelector("#tablaCarreras")) cargarCarreras();
  if (document.getElementById("categoriaCarrera")) cargarCategorias();

  // =============== CATEGORÍAS ===================
  const formCategoria = document.getElementById("formCategoria");
  if (formCategoria) {
    formCategoria.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nombre = document.getElementById("nombreCategoria").value.trim();
      if (!nombre) {
        Swal.fire("Error", "El nombre de la categoría es obligatorio.", "error");
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/categories`, {
          method: "POST",
          headers: API_HEADERS,
          body: JSON.stringify({ name: nombre })
        });

        if (res.status === 201) {
          Swal.fire("¡Éxito!", "Categoría registrada correctamente.", "success");
          formCategoria.reset();
          cargarCategorias();
        } else if (res.status === 409) {
          Swal.fire("Error", "Ya existe una categoría con ese nombre.", "warning");
        } else {
          Swal.fire("Error", "No se pudo registrar la categoría.", "error");
        }
      } catch {
        Swal.fire("Error", "Error de conexión con la API.", "error");
      }
    });
  }

  if (document.querySelector("#tablaCategorias")) cargarCategorias();
});

// =================== FUNCIONES ===================

async function cargarCarrerasSelects() {
  try {
    const res = await fetch(`${API_BASE}/api/careers`, {
      method: "GET",
      headers: GET_HEADERS
    });
    const carreras = await res.json();

    const select = document.getElementById("carreraAlumno");
    const selectCarrera = document.getElementById("carreraCarrera");

    if (select) {
      select.innerHTML = '<option selected disabled>Seleccione una carrera</option>';
      carreras.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.name;
        opt.textContent = c.name;
        select.appendChild(opt);
      });
    }

    if (selectCarrera) {
      selectCarrera.innerHTML = '<option selected disabled>Seleccione una carrera</option>';
      carreras.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.name;
        opt.textContent = c.name;
        selectCarrera.appendChild(opt);
      });
    }
  } catch (err) {
    console.error("Error al cargar carreras:", err);
  }
}

async function cargarAlumnos() {
  try {
    const res = await fetch(`${API_BASE}/api/students`, {
      method: "GET",
      headers: GET_HEADERS
    });
    let alumnos = await res.json();

    // Asegura que alumnos sea un array
    if (!Array.isArray(alumnos)) alumnos = [];

    const tbody = document.querySelector("#tablaAlumnos tbody");
    if (!tbody) return;

    tbody.innerHTML = "";
    alumnos.forEach(alumno => {
      tbody.innerHTML += `
        <tr>
          <td>${alumno.id}</td>
          <td>${alumno.name}</td>
          <td>${alumno.career}</td>
          <td>
            <button class="btn btn-danger btn-sm" onclick="eliminarAlumno(${alumno.id})">Eliminar</button>
          </td>
        </tr>
      `;
    });
  } catch (err) {
    console.error("Error al cargar alumnos:", err);
  }
}

async function cargarCarreras() {
  try {
    const [resCarreras, resCategorias] = await Promise.all([
      fetch(`${API_BASE}/api/careers`, { method: "GET", headers: GET_HEADERS }),
      fetch(`${API_BASE}/api/categories`, { method: "GET", headers: GET_HEADERS })
    ]);
    const carreras = await resCarreras.json();
    const categorias = await resCategorias.json();

    const tbody = document.querySelector("#tablaCarreras tbody");
    if (!tbody) return;

    tbody.innerHTML = "";
    carreras.forEach(carrera => {
      const categoriaObj = categorias.find(cat =>
        String(cat.id) === String(carrera.category)
      );
      const categoriaNombre = categoriaObj
        ? categoriaObj.name
        : carrera.categoryName || carrera.category;

      tbody.innerHTML += `
        <tr>
          <td>${carrera.id}</td>
          <td>${carrera.name}</td>
          <td>${categoriaNombre}</td>
          <td>
            <button class="btn btn-danger btn-sm" onclick="eliminarCarrera(${carrera.id})">Eliminar</button>
          </td>
        </tr>
      `;
    });
  } catch (err) {
    console.error("Error al cargar carreras:", err);
  }
}

async function cargarCategorias() {
  try {
    const res = await fetch(`${API_BASE}/api/categories`, {
      method: "GET",
      headers: GET_HEADERS
    });
    const categorias = await res.json();

    const select = document.getElementById("categoriaCarrera");
    const tbody = document.querySelector("#tablaCategorias tbody");

    if (select) {
      select.innerHTML = '<option selected disabled>Seleccione una categoría</option>';
      categorias.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat.id;
        opt.textContent = cat.name;
        select.appendChild(opt);
      });
    }

    if (tbody) {
      tbody.innerHTML = "";
      categorias.forEach(cat => {
        tbody.innerHTML += `
          <tr>
            <td>${cat.id}</td>
            <td>${cat.name}</td>
            <td>
              <button class="btn btn-danger btn-sm" onclick="eliminarCategoria(${cat.id})">Eliminar</button>
            </td>
          </tr>
        `;
      });
    }
  } catch (err) {
    console.error("Error al cargar categorías:", err);
  }
}

async function eliminarCarrera(id) {
  if (!id) return;
  try {
    const res = await fetch(`${API_BASE}/api/careers/${id}`, {
      method: "DELETE",
      headers: GET_HEADERS
    });
    if (res.ok) {
      Swal.fire("Eliminada", "Carrera eliminada correctamente.", "success");
      cargarCarreras();
    } else {
      Swal.fire("Error", "No se pudo eliminar la carrera", "error");
    }
  } catch {
    Swal.fire("Error", "Error de conexión al eliminar carrera", "error");
  }
}
window.eliminarCarrera = eliminarCarrera;

async function eliminarAlumno(id) {
  if (!id) return;
  try {
    const res = await fetch(`${API_BASE}/api/students/${id}`, {
      method: "DELETE",
      headers: GET_HEADERS
    });
    if (res.ok) {
      Swal.fire("Eliminado", "Alumno eliminado correctamente.", "success");
      cargarAlumnos();
    } else if (res.status === 404) {
      Swal.fire("Error", "El alumno ya no existe.", "warning");
      cargarAlumnos();
    } else {
      Swal.fire("Error", "No se pudo eliminar el alumno", "error");
    }
  } catch {
    Swal.fire("Error", "Error de conexión al eliminar alumno", "error");
  }
}
// Hacer la función global para que el HTML la vea
window.eliminarAlumno = eliminarAlumno;

async function buscarAlumno() {
  const id = document.getElementById("buscarAlumnoId").value;
  if (!id) {
    Swal.fire("Error", "Debes ingresar un ID de alumno.", "error");
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/api/students`, {
      method: "GET",
      headers: GET_HEADERS
    });
    const alumnos = await res.json();
    const alumno = alumnos.find(a => String(a.id) === String(id));
    if (alumno) {
      Swal.fire("Alumno encontrado", `ID: ${alumno.id}<br>Nombre: ${alumno.name}<br>Carrera: ${alumno.career}`, "info");
    } else {
      Swal.fire("No encontrado", "No existe un alumno con ese ID.", "warning");
    }
  } catch {
    Swal.fire("Error", "No se pudo buscar el alumno.", "error");
  }
}
// Hacer la función global
window.buscarAlumno = buscarAlumno;

async function eliminarCategoria(id) {
  if (!id) return;
  try {
    const res = await fetch(`${API_BASE}/api/categories/${id}`, {
      method: "DELETE",
      headers: GET_HEADERS
    });
    if (res.ok) {
      Swal.fire("Eliminada", "Categoría eliminada correctamente.", "success");
      cargarCategorias();
    } else {
      Swal.fire("Error", "No se pudo eliminar la categoría", "error");
    }
  } catch {
    Swal.fire("Error", "Error de conexión al eliminar categoría", "error");
  }
}
window.eliminarCategoria = eliminarCategoria;

/* ==========================================================
   RESUMEN DEL FLUJO DE FUNCIONAMIENTO DE LA APLICACIÓN
==========================================================

1. Los archivos HTML muestran formularios y tablas para alumnos, carreras y categorías.
2. Al cargar la página, app.js detecta los elementos presentes y:
   - Asocia eventos a los formularios para registrar datos.
   - Llama funciones para cargar y mostrar los listados.
   - Expone funciones globales para eliminar y buscar registros.
3. Cuando el usuario registra, elimina o busca:
   - app.js toma los datos y realiza peticiones fetch a la API (index.js) usando la API Key.
   - La API valida, procesa la acción y responde en JSON.
   - app.js actualiza la interfaz y muestra alertas según el resultado.
4. Los datos se almacenan en archivos JSON en el backend.
5. El frontend nunca accede directamente a los archivos, solo a través de la API.

En resumen:  
Usuario (HTML) → app.js (fetch) → API (index.js) → Archivos JSON  
         ←         ← respuesta JSON ←

========================================================== */