
const campoBusqueda = document.getElementById("busqueda");
const contenedor = document.getElementById("resultados");
const tituloResultados = document.getElementById("tituloResultados");

let registros = [];

const nombresAreas = {
  "matematica": "Matemática",
  "comunicacion": "Comunicación",
  "ciencia": "Ciencia y Tecnología",
  "personal-social": "Personal Social",
  "ciencias-sociales": "Ciencias Sociales",
  "dpcc": "Desarrollo Personal, Ciudadanía y Cívica",
  "ept": "Educación para el Trabajo",
  "ingles": "Inglés",
  "arte": "Arte y Cultura",
  "religion": "Educación Religiosa",
  "educacion-fisica": "Educación Física"
};

async function leerJSON(ruta) {
  const respuesta = await fetch(ruta);

  if (!respuesta.ok) {
    throw new Error(`No se pudo cargar ${ruta}`);
  }

  const datos = await respuesta.json();

  if (!Array.isArray(datos)) {
    throw new Error(`Formato incorrecto en ${ruta}`);
  }

  return datos;
}

function normalizar(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

async function cargarDatos() {
  mostrarMensaje("Cargando biblioteca...");

  const fuentes = await Promise.allSettled([
    leerJSON("datos/libros.json"),
    leerJSON("datos/cuentos.json"),
    leerJSON("datos/audiocuentos.json")
  ]);

  registros = [];

  const [libros, cuentos, audios] = fuentes;
  
if (libros.status === "fulfilled") {
  libros.value.forEach(libro => {

    const nivelTexto =
      libro.nivel === "primaria" ? "Primaria" :
      libro.nivel === "secundaria" ? "Secundaria" :
      "Nivel pendiente";

    const areaTexto =
      nombresAreas[libro.area] ||
      libro.area ||
      "Área pendiente";

    const enlaceCatalogo =
      (libro.nivel === "primaria" ||
       libro.nivel === "secundaria") &&
      nombresAreas[libro.area]
        ? `libros.html?${new URLSearchParams({
            nivel: libro.nivel,
            area: libro.area
          })}`
        : "libros.html?vista=todos";

    registros.push({
      tipo: "Libro físico",
      titulo: libro.titulo,
      autor: libro.autor,
      descripcion: `${nivelTexto} - ${areaTexto}`,
      enlace: enlaceCatalogo,
      boton: "Ver en el catálogo"
    });

  });
} else {
  console.error(libros.reason);
}

  if (cuentos.status === "fulfilled") {
    cuentos.value.forEach(cuento => {
      registros.push({
        tipo: "Cuento digital",
        titulo: cuento.titulo,
        autor: cuento.autor,
        descripcion: cuento.descripcion || "",
        enlace: "cuentos.html",
        boton: "Ver cuentos"
      });
    });
  } else {
    console.error(cuentos.reason);
  }

  if (audios.status === "fulfilled") {
    audios.value.forEach(audio => {
      registros.push({
        tipo: "Audiocuento",
        titulo: audio.titulo,
        autor: audio.narrador,
        descripcion: audio.descripcion || "",
        enlace: "audiocuentos.html",
        boton: "Escuchar audiocuentos"
      });
    });
  } else {
    console.error(audios.reason);
  }

  if (fuentes.every(fuente => fuente.status === "rejected")) {
    mostrarMensaje(
      "No se pudieron cargar los datos. Revisa Live Server y los archivos JSON."
    );
    return;
  }

  ejecutarBusqueda();
}

function mostrarMensaje(texto) {
  contenedor.replaceChildren();

  const mensaje = document.createElement("div");
  mensaje.className = "mensaje";
  mensaje.textContent = texto;

  contenedor.appendChild(mensaje);
}

function ejecutarBusqueda() {
  const consulta = normalizar(campoBusqueda.value.trim());

  if (!consulta) {
    tituloResultados.textContent = "Resultados de búsqueda";
    mostrarMensaje("Escribe una palabra para comenzar a buscar.");
    return;
  }

  const encontrados = registros.filter(registro => {
    const contenido = normalizar(
      [
        registro.titulo,
        registro.autor,
        registro.descripcion,
        registro.tipo
      ].join(" ")
    );

    return contenido.includes(consulta);
  });

  tituloResultados.textContent =
    `${encontrados.length} resultado(s) encontrados`;

  contenedor.replaceChildren();

  if (encontrados.length === 0) {
    mostrarMensaje("No encontramos resultados para tu búsqueda.");
    return;
  }

  encontrados.forEach(registro => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "resultado";

    const tipo = document.createElement("span");
    tipo.className = "tipo";
    tipo.textContent = registro.tipo;

    const titulo = document.createElement("h3");
    titulo.textContent = registro.titulo || "Sin título";

    const autor = document.createElement("p");
    autor.textContent =
      `Autor/Narrador: ${registro.autor || "No registrado"}`;

    const descripcion = document.createElement("p");
    descripcion.textContent = registro.descripcion;

    const enlace = document.createElement("a");
    enlace.className = "boton";
    enlace.href = registro.enlace;
    enlace.textContent = registro.boton;

    tarjeta.append(tipo, titulo, autor, descripcion, enlace);
    contenedor.appendChild(tarjeta);
  });
}

campoBusqueda.addEventListener("input", ejecutarBusqueda);

const parametros = new URLSearchParams(window.location.search);
campoBusqueda.value = parametros.get("q") || "";

cargarDatos();
