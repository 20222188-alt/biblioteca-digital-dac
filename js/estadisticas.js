
async function cargarEstadisticas() {
  try {
    // 1. CARGAR EL INVENTARIO DE LIBROS
    const respuesta = await fetch("datos/libros.json");

    if (!respuesta.ok) {
      throw new Error("No se pudo cargar el inventario");
    }

    const libros = await respuesta.json();

    // Función para contar los ejemplares
    const contarEjemplares = (lista) => {
      return lista.reduce(
        (total, libro) =>
          total + Number(libro.ejemplares || 0),
        0
      );
    };

    // 2. CONTADOR GENERAL DE LIBROS
    const totalLibros = document.getElementById("totalLibros");

    if (totalLibros) {
      totalLibros.textContent = contarEjemplares(libros);
    }

    // 3. CONTADOR DE CUENTOS DIGITALES
    const totalCuentos = document.getElementById("totalCuentos");

    if (totalCuentos) {
      try {
        const respuestaCuentos = await fetch("datos/cuentos.json");

        if (!respuestaCuentos.ok) {
          throw new Error("No se pudo cargar cuentos.json");
        }

        const cuentos = await respuestaCuentos.json();

        totalCuentos.textContent = cuentos.length;

      } catch (error) {
        console.error("Error al cargar cuentos:", error);
      }
    }

    // CONTADOR DE AUDIOCUENTOS
const totalAudios = document.getElementById("totalAudios");

if (totalAudios) {
  try {
    const respuestaAudios = await fetch("datos/audiocuentos.json");

    if (!respuestaAudios.ok) {
      throw new Error("No se pudo cargar audiocuentos.json");
    }

    const audios = await respuestaAudios.json();

    totalAudios.textContent = audios.length;

  } catch (error) {
    console.error("Error al cargar audiocuentos:", error);
  }
}
    // 4. CONTADORES DE PRIMARIA Y SECUNDARIA
    document.querySelectorAll("[data-grado]").forEach(elemento => {

      const grado = Number(elemento.dataset.grado);

      // Identificar si pertenece a Primaria o Secundaria
      const nivel = elemento.dataset.nivel || "primaria";

      const filtrados = libros.filter(libro =>
        libro.nivel === nivel &&
        libro.grado === grado
      );

      elemento.textContent =
        `${contarEjemplares(filtrados)} libros registrados`;

    });

    
    // 5. CONTADORES DE ÁREAS EDUCATIVAS
    const parametros = new URLSearchParams(window.location.search);

    const nivelURL = parametros.get("nivel");
    const nivelPagina = window.location.pathname
      .split("/")
      .pop()
      .replace(".html", "");

    const nivelActual = nivelURL || nivelPagina;

    document.querySelectorAll("[data-area]").forEach(elemento => {
      const area = elemento.dataset.area;
      const nivelArea = elemento.dataset.nivel || nivelActual;

      const filtrados = libros.filter(libro =>
        libro.nivel === nivelArea &&
        libro.area === area
      );

      elemento.textContent =
        `${contarEjemplares(filtrados)} ejemplares registrados`;
    });

  } catch (error) {
    console.error("Error al cargar estadísticas:", error);
  }
}

// 6. EJECUTAR CUANDO CARGUE LA PÁGINA
document.addEventListener("DOMContentLoaded", cargarEstadisticas);
