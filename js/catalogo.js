
/* ==========================================
   BIBLIOTECA DIGITAL ESCOLAR
   I.E. N.º 1206 Daniel Alcides Carrión
   Archivo: js/catalogo.js
========================================== */

// NOMBRES DE LOS NIVELES
const NOMBRES = {
  primaria: "Primaria",
  secundaria: "Secundaria",
  docente: "Formación docente",
  transversal: "Consulta y referencia"
};

// NOMBRES DE LAS ÁREAS
const AREAS = {
  "matematica": "Matemática",
  "comunicacion": "Comunicación",
  "ciencia": "Ciencia y Tecnología",
  "personal-social": "Personal Social",
  "ciencias-sociales": "Ciencias Sociales",
  "dpcc": "DPCC",
  "ept": "Educación para el Trabajo",
  "ingles": "Inglés",
  "arte": "Arte y Cultura",
  "religion": "Educación Religiosa",
  "educacion-fisica": "Educación Física",
  "tutoria": "Tutoría y materiales educativos",
  "sin-clasificar": "Área no especificada",
  "formacion-docente": "Formación docente",
  "consulta-referencia": "Consulta y referencia"
};

// IMÁGENES 3D DE CADA ÁREA
// Guardadas en imagenes/areas/
const IMAGENES_AREAS = {
  "matematica": "matematica.png",
  "comunicacion": "comunicacion.png",
  "ciencia": "ciencia.png",
  "personal-social": "personal-social.png",
  "ciencias-sociales": "ciencias-sociales.png",
  "dpcc": "dpcc.png",
  "ept": "ept.png",
  "ingles": "ingles.png",
  "arte": "arte.png",
  "religion": "religion.png",
  "educacion-fisica": "educacion-fisica.png",
  "tutoria": "tutoria.png",
  "sin-clasificar": "sin-clasificar.png",
  "formacion-docente": "formacion-docente.png",
  "consulta-referencia": "consulta-referencia.png"
};

// CARGAR LIBROS DESDE JSON
async function datos() {
  const respuesta = await fetch("datos/libros.json");

  if (!respuesta.ok) {
    throw new Error("No se pudo cargar datos/libros.json");
  }

  return await respuesta.json();
}

// PROTEGER TEXTOS HTML
function texto(valor) {
  return String(valor ?? "").replace(
    /[&<>"']/g,
    caracter => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[caracter])
  );
}

// CONTAR EJEMPLARES
function contarEjemplares(libros) {
  return libros.reduce(
    (total, libro) =>
      total + (Number(libro.ejemplares) || 0),
    0
  );
}

// CONTADORES POR NIVEL
async function cargarContadores() {
  try {
    const libros = await datos();

    document.querySelectorAll("[data-count]").forEach(elemento => {
      const nivel = elemento.dataset.count;

      const filtrados = libros.filter(
        libro => libro.nivel === nivel
      );

      elemento.textContent =
        `${filtrados.length} títulos · ` +
        `${contarEjemplares(filtrados)} ejemplares`;
    });

  } catch (error) {
    console.error("Error al cargar contadores:", error);
  }
}

// MOSTRAR ÁREAS CURRICULARES CON IMÁGENES
async function cargarAreas(nivel) {
  const contenedor = document.getElementById("areas");

  if (!contenedor) return;

  try {
    const libros = (await datos()).filter(
      libro => libro.nivel === nivel
    );

    const grupos = {};

    libros.forEach(libro => {
      const area = libro.area || "sin-clasificar";

      if (!grupos[area]) {
        grupos[area] = [];
      }

      grupos[area].push(libro);
    });

    const areasOrdenadas = Object.entries(grupos).sort(
      (a, b) =>
        (AREAS[a[0]] || a[0]).localeCompare(
          AREAS[b[0]] || b[0],
          "es"
        )
    );

    contenedor.innerHTML = areasOrdenadas.map(
      ([area, librosArea]) => {
        const imagen = IMAGENES_AREAS[area] ||
          "sin-clasificar.png";

        return `
          <a class="card tarjeta-area"
             href="libros.html?nivel=${encodeURIComponent(nivel)}&area=${encodeURIComponent(area)}">

            <div class="imagen-area">
              <img
                src="imagenes/areas/${imagen}"
                alt="Ilustración de ${texto(AREAS[area] || area)}"
                loading="lazy"
                onerror="this.style.display='none'"
              >
            </div>

            <div class="contenido-area">
              <h2>${texto(AREAS[area] || area)}</h2>

              <p class="muted">
                ${librosArea.length} títulos ·
                ${contarEjemplares(librosArea)} ejemplares
              </p>
            </div>

          </a>
        `;
      }
    ).join("") ||
    '<div class="empty">No hay libros registrados.</div>';

  } catch (error) {
    console.error("Error al cargar áreas:", error);

    contenedor.textContent =
      "No se pudo cargar el inventario.";
  }
}

// CATÁLOGO GENERAL Y FILTROS
async function iniciarCatalogo() {
  const panel = document.getElementById("resultados");
  const buscador = document.getElementById("q");
  const nivel = document.getElementById("nivel");
  const area = document.getElementById("area");
  const contador = document.getElementById("contador");

  if (!panel || !buscador || !nivel || !area || !contador) {
    return;
  }

  const parametros = new URLSearchParams(
    window.location.search
  );

  try {
    const libros = await datos();

    nivel.value = parametros.get("nivel") || "";

    // ACTUALIZAR ÁREAS SEGÚN EL NIVEL
    function actualizarAreas() {
      const areaAnterior = area.value;

      const disponibles = [
        ...new Set(
          libros
            .filter(libro =>
              !nivel.value ||
              libro.nivel === nivel.value
            )
            .map(libro =>
              libro.area || "sin-clasificar"
            )
        )
      ].sort(
        (a, b) =>
          (AREAS[a] || a).localeCompare(
            AREAS[b] || b,
            "es"
          )
      );

      area.innerHTML =
        '<option value="">Todas las áreas</option>' +
        disponibles.map(
          nombre => `
            <option value="${texto(nombre)}">
              ${texto(AREAS[nombre] || nombre)}
            </option>
          `
        ).join("");

      area.value = disponibles.includes(areaAnterior)
        ? areaAnterior
        : "";
    }

    actualizarAreas();

    const areaURL = parametros.get("area");

    if (areaURL) {
      area.value = areaURL;
    }

    // MOSTRAR LOS LIBROS
    function mostrarLibros() {
      const busqueda = buscador.value
        .toLocaleLowerCase("es")
        .trim();

      const filtrados = libros.filter(libro => {
        const coincideNivel =
          !nivel.value ||
          libro.nivel === nivel.value;

        const coincideArea =
          !area.value ||
          (libro.area || "sin-clasificar") === area.value;

        const coincideBusqueda = [
          libro.titulo,
          libro.autor,
          libro.editorial
        ].some(valor =>
          String(valor || "")
            .toLocaleLowerCase("es")
            .includes(busqueda)
        );

        return coincideNivel &&
               coincideArea &&
               coincideBusqueda;
      });

      contador.textContent =
        `${filtrados.length} títulos encontrados · ` +
        `${contarEjemplares(filtrados)} ejemplares`;

      panel.innerHTML = filtrados.map(libro => {
        const portada = libro.portada
          ? `<img
               loading="lazy"
               src="${texto(libro.portada)}"
               alt="Portada de ${texto(libro.titulo)}"
               onerror="this.remove()"
             >`
          : "📖";

        return `
          <article class="book">

            <div class="cover">
              ${portada}
            </div>

            <div class="body">

              <h3>${texto(libro.titulo)}</h3>

              ${libro.autor
                ? `<p><b>Autor:</b> ${texto(libro.autor)}</p>`
                : ""}

              ${libro.editorial
                ? `<p><b>Editorial:</b> ${texto(libro.editorial)}</p>`
                : ""}

              <p>
                <b>Nivel:</b>
                ${texto(NOMBRES[libro.nivel] || libro.nivel)}
              </p>

              <p>
                <b>Área:</b>
                ${texto(
                  AREAS[libro.area] ||
                  libro.area ||
                  "No especificada"
                )}
              </p>

              ${libro.grado
                ? `<p><b>Grado:</b> ${texto(libro.grado)}</p>`
                : ""}

              <span class="pill">
                ${Number(libro.ejemplares) || 0}
                ejemplares
              </span>

            </div>

          </article>
        `;
      }).join("") ||
      '<div class="empty">No se encontraron libros con esos filtros.</div>';
    }

    // EVENTOS DE BÚSQUEDA Y FILTROS
    buscador.addEventListener("input", mostrarLibros);

    nivel.addEventListener("change", () => {
      actualizarAreas();
      mostrarLibros();
    });

    area.addEventListener("change", mostrarLibros);

    mostrarLibros();

  } catch (error) {
    console.error("Error al cargar catálogo:", error);

    contador.textContent =
      "Error al cargar el inventario. Abre el proyecto con Live Server.";
  }
}
