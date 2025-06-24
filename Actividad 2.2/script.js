// FORMULARIO 1: JavaScript → JSON
document.getElementById("btnRegistrar").addEventListener("click", () => {
    let esValido = true

    // Lista de campos a validar (todos obligatorios)
        const camposTexto = [
            "nombre", "dorsal", "fechaNacimiento", "lugarNacimiento",
            "nacionalidad", "altura", "peso", "descripcion", "equiposAnteriores",
        ]

    // Validar campos de texto, número y fecha
    camposTexto.forEach((id) => {
        const campo = document.getElementById(id)
        if (!campo.value.trim()) {
        campo.classList.add("error")
        campo.classList.remove("success")
        esValido = false
        } else {
        campo.classList.remove("error")
        campo.classList.add("success")
        }
    })

    // Validación específica para campos numéricos
    const camposNumericos = ["dorsal", "altura", "peso"]
    camposNumericos.forEach((id) => {
        const campo = document.getElementById(id)
        const valor = Number.parseInt(campo.value)
        if (isNaN(valor) || valor <= 0) {
        campo.classList.add("error")
        campo.classList.remove("success")
        esValido = false
        Swal.fire("⚠️ Error", `El campo ${id} debe ser un número positivo mayor a cero.`, "warning")
        }
    })

    // Validación para campos de texto que no deben contener números
    const camposTextoSinNumeros = ["nombre", "lugarNacimiento", "nacionalidad"]
    const regexSoloTexto = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s,.'-]+$/

    camposTextoSinNumeros.forEach((id) => {
        const campo = document.getElementById(id)
        if (campo.value.trim() && !regexSoloTexto.test(campo.value)) {
        campo.classList.add("error")
        campo.classList.remove("success")
        esValido = false
        Swal.fire("⚠️ Error", `El campo ${id} solo debe contener texto.`, "warning")
        }
    })

    const pie = document.getElementById("pie")
    const posicion = document.getElementById("posicion")
    const habilidadesSeleccionadas = document.querySelectorAll('input[name="habilidades"]:checked')
    const seccionCheckbox = document.querySelector('input[name="habilidades"]').parentElement

    if (pie.value === "") {
        pie.classList.add("error")
        pie.classList.remove("success")
        esValido = false
    } else {
        pie.classList.remove("error")
        pie.classList.add("success")
    }

    if (posicion.value === "") {
        posicion.classList.add("error")
        posicion.classList.remove("success")
        esValido = false
    } else {
        posicion.classList.remove("error")
        posicion.classList.add("success")
    }

    if (habilidadesSeleccionadas.length === 0) {
        seccionCheckbox.classList.add("error")
        esValido = false
        Swal.fire("⚠️ Error", "Debes seleccionar al menos una habilidad.", "warning")
    } else {
        seccionCheckbox.classList.remove("error")
    }

    if (!esValido) {
        Swal.fire("⚠️ Campos incompletos", "Por favor completa todos los campos obligatorios.", "error")
        return
    }

    // Crear objeto JavaScript
    const futbolista = {
        nombre: document.getElementById("nombre").value,
        dorsal: document.getElementById("dorsal").value,
        nacimiento: document.getElementById("fechaNacimiento").value,
        lugar: document.getElementById("lugarNacimiento").value,
        nacionalidad: document.getElementById("nacionalidad").value,
        altura: document.getElementById("altura").value,
        peso: document.getElementById("peso").value,
        pie: pie.value,
        posicion: posicion.value,
        habilidades: Array.from(habilidadesSeleccionadas).map((h) => h.value),
        equipos: document.getElementById("equiposAnteriores").value,
        descripcion: document.getElementById("descripcion").value,
        id: Date.now(),
        fechaRegistro: new Date().toISOString(),
    }

    // Convertir objeto a JSON y mostrarlo
    mostrarJSON(futbolista)

    // Guardar en localStorage
    const lista = JSON.parse(localStorage.getItem("futbolistas")) || []
    lista.push(futbolista)
    localStorage.setItem("futbolistas", JSON.stringify(lista))

    agregarTarjeta(futbolista)
    mostrarOcultarBotonVaciar()

    Swal.fire("✅ ¡Registrado!", "Futbolista agregado al catálogo y JSON generado.", "success")

    document.getElementById("formularioFutbolista").reset()
    document.querySelectorAll(".success").forEach((el) => el.classList.remove("success"))
})

// Función para mostrar el JSON del objeto creado
function mostrarJSON(objeto) {
    const seccionJSON = document.getElementById("seccionJSON")
    const jsonOutput = document.getElementById("jsonOutput")

    // Convertir objeto a JSON con formato legible
    const jsonString = JSON.stringify(objeto, null, 2)

    jsonOutput.textContent = jsonString
    seccionJSON.style.display = "block"

    // Scroll suave hacia la sección JSON
    seccionJSON.scrollIntoView({ behavior: "smooth", block: "nearest" })
}

// Función para copiar JSON al portapapeles
document.getElementById("btnCopiarJSON").addEventListener("click", () => {
    const jsonOutput = document.getElementById("jsonOutput")
    const texto = jsonOutput.textContent

    navigator.clipboard
        .writeText(texto)
        .then(() => {
        Swal.fire({
            title: "📋 ¡Copiado!",
            text: "JSON copiado al portapapeles",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
        })
        })
        .catch(() => {
        const textArea = document.createElement("textarea")
        textArea.value = texto
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)

        Swal.fire({
            title: "📋 ¡Copiado!",
            text: "JSON copiado al portapapeles",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
        })
        })
})

// FORMULARIO 2: JSON → JavaScript
document.getElementById("btnConvertirJSON").addEventListener("click", () => {
    const jsonInput = document.getElementById("jsonInput")
    const jsonString = jsonInput.value.trim()

    if (!jsonString) {
        Swal.fire("⚠️ Error", "Por favor ingresa una cadena JSON válida.", "warning")
        jsonInput.focus()
        return
    }

    try {
        // Convertir JSON string a objeto JavaScript
        const objetoJS = JSON.parse(jsonString)

        // Mostrar el objeto en la tabla
        mostrarObjetoEnTabla(objetoJS)

        Swal.fire("✅ ¡Éxito!", "JSON convertido a objeto JavaScript correctamente.", "success")
    } catch (error) {
        Swal.fire({
        title: "❌ Error de JSON",
        text: `El JSON no es válido: ${error.message}`,
        icon: "error",
        footer: "Verifica la sintaxis del JSON (comillas dobles, comas, llaves, etc.)",
        })
        jsonInput.focus()
    }
})

// Función para mostrar objeto JavaScript en tabla
function mostrarObjetoEnTabla(objeto) {
    const seccionTabla = document.getElementById("seccionTabla")
    const tablaBody = document.getElementById("tablaObjetoBody")

    // Limpiar tabla anterior
    tablaBody.innerHTML = ""

    // Recorrer todas las propiedades del objeto
    for (const [propiedad, valor] of Object.entries(objeto)) {
        const fila = document.createElement("tr")

        // Columna de propiedad
        const celdaPropiedad = document.createElement("td")
        celdaPropiedad.textContent = propiedad

        // Columna de valor (manejar diferentes tipos)
        const celdaValor = document.createElement("td")
        if (Array.isArray(valor)) {
        celdaValor.textContent = valor.join(", ")
        } else if (typeof valor === "object" && valor !== null) {
        celdaValor.textContent = JSON.stringify(valor)
        } else {
        celdaValor.textContent = valor
        }

        // Columna de tipo
        const celdaTipo = document.createElement("td")
        if (Array.isArray(valor)) {
        celdaTipo.textContent = `Array (${valor.length} elementos)`
        } else {
        celdaTipo.textContent = typeof valor
        }

        fila.appendChild(celdaPropiedad)
        fila.appendChild(celdaValor)
        fila.appendChild(celdaTipo)

        tablaBody.appendChild(fila)
    }

    // Mostrar la sección de tabla
    seccionTabla.style.display = "block"

    // Scroll suave hacia la tabla
    seccionTabla.scrollIntoView({ behavior: "smooth", block: "nearest" })
}

// Botón para usar ejemplo de JSON
document.getElementById("btnEjemploJSON").addEventListener("click", () => {
    const ejemploJSON = {
        nombre: "Cristiano Ronaldo",
        dorsal: "7",
        nacimiento: "1985-02-05",
        lugar: "Funchal, Portugal",
        nacionalidad: "Portugal",
        altura: "187",
        peso: "84",
        pie: "derecho",
        posicion: "ED",
        habilidades: ["velocidad", "tiro", "salto", "definicion"],
        equipos: "Sporting CP, Manchester United, Real Madrid, Juventus, Al-Nassr",
        descripcion:
        "Considerado uno de los mejores futbolistas de todos los tiempos. Conocido por su velocidad, técnica y capacidad goleadora.",
        id: 1640995200000,
        fechaRegistro: "2024-01-15T10:30:00.000Z",
    }

    const jsonInput = document.getElementById("jsonInput")
    jsonInput.value = JSON.stringify(ejemploJSON, null, 2)

    Swal.fire({
        title: "📝 Ejemplo cargado",
        text: "Se ha cargado un ejemplo de JSON. Puedes modificarlo o convertirlo directamente.",
        icon: "info",
        timer: 2000,
        showConfirmButton: false,
    })
})

// FUNCIONES PARA TARJETAS 
function agregarTarjeta(f) {
    const contenedor = document.getElementById("listaFutbolistas")

    // Crear elementos dinámicamente
    const tarjeta = document.createElement("div")
    tarjeta.classList.add("tarjeta-futbolista")
    tarjeta.dataset.id = f.id

    const tarjetaContenido = document.createElement("div")
    tarjetaContenido.classList.add("tarjeta-contenido")

    // Crear la sección de imagen
    const jugadorImagen = document.createElement("div")
    jugadorImagen.classList.add("jugador-imagen")

    const imagen = document.createElement("img")
    imagen.src = "https://cdn-icons-png.flaticon.com/512/847/847969.png"
    imagen.alt = "Jugador"

    jugadorImagen.appendChild(imagen)

    // Crear la sección de detalles
    const jugadorDetalles = document.createElement("div")
    jugadorDetalles.classList.add("jugador-detalles")

    // Crear el encabezado con nombre y dorsal
    const encabezado = document.createElement("h3")
    encabezado.textContent = f.nombre + " "

    const spanDorsal = document.createElement("span")
    spanDorsal.textContent = "#" + f.dorsal
    encabezado.appendChild(spanDorsal)

    // Crear los párrafos con la información
    const crearParrafo = (etiqueta, valor) => {
        const p = document.createElement("p")
        const strong = document.createElement("strong")
        strong.textContent = etiqueta
        p.appendChild(strong)
        p.innerHTML += " " + valor
        return p
    }

    jugadorDetalles.appendChild(encabezado)
    jugadorDetalles.appendChild(crearParrafo("📆 Nacimiento:", `${f.nacimiento} (${f.lugar})`))
    jugadorDetalles.appendChild(crearParrafo("🌍 Nacionalidad:", f.nacionalidad))
    jugadorDetalles.appendChild(crearParrafo("📏 Altura:", `${f.altura} cm | ⚖️ Peso: ${f.peso} kg`))
    jugadorDetalles.appendChild(crearParrafo("🦶 Pie dominante:", f.pie))
    jugadorDetalles.appendChild(crearParrafo("📌 Posición:", f.posicion))
    jugadorDetalles.appendChild(crearParrafo("💪 Habilidades:", f.habilidades.join(", ")))
    jugadorDetalles.appendChild(crearParrafo("📋 Equipos anteriores:", f.equipos))
    jugadorDetalles.appendChild(crearParrafo("📝 Descripción:", f.descripcion))

    // Crear botón de eliminar individual
    const btnEliminar = document.createElement("button")
    btnEliminar.classList.add("btn-eliminar")
    btnEliminar.textContent = "❌ Eliminar"

    // Usar addEventListener
    btnEliminar.addEventListener("click", () => {
        eliminarFutbolista(f.id)
    })

    // Ensamblar la tarjeta
    tarjetaContenido.appendChild(jugadorImagen)
    tarjetaContenido.appendChild(jugadorDetalles)
    tarjeta.appendChild(tarjetaContenido)
    tarjeta.appendChild(btnEliminar)

    // Agregar la tarjeta al contenedor
    contenedor.appendChild(tarjeta)
}

function eliminarFutbolista(id) {
    Swal.fire({
        title: "¿Estás seguro?",
        text: "No podrás revertir esta acción",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
    }).then((result) => {
        if (result.isConfirmed) {
        // Eliminar del DOM
        const tarjeta = document.querySelector(`.tarjeta-futbolista[data-id="${id}"]`)
        if (tarjeta) {
            tarjeta.remove()
        }

        // Eliminar del localStorage
        let lista = JSON.parse(localStorage.getItem("futbolistas")) || []
        lista = lista.filter((f) => f.id !== id)
        localStorage.setItem("futbolistas", JSON.stringify(lista))

        // Mostrar/ocultar botón de vaciar según si quedan elementos
        mostrarOcultarBotonVaciar()

        Swal.fire("¡Eliminado!", "El futbolista ha sido eliminado.", "success")
        }
    })
}

// Vaciar toda la lista
function vaciarListaCompleta() {
    Swal.fire({
        title: "⚠️ ¿Vaciar lista completa?",
        text: "Se eliminarán TODOS los futbolistas registrados. Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#e74c3c",
        cancelButtonColor: "#95a5a6",
        confirmButtonText: "Sí, vaciar todo",
        cancelButtonText: "Cancelar",
    }).then((result) => {
        if (result.isConfirmed) {
        // Limpiar el DOM
        const listaFutbolistas = document.getElementById("listaFutbolistas")
        listaFutbolistas.innerHTML = ""

        // Limpiar localStorage
        localStorage.removeItem("futbolistas")

        // Ocultar botón de vaciar
        mostrarOcultarBotonVaciar()

        Swal.fire({
            title: "¡Lista vacía!",
            text: "Todos los futbolistas han sido eliminados.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
        })
        }
    })
}

// Función para mostrar/ocultar el botón de vaciar según si hay elementos
function mostrarOcultarBotonVaciar() {
    const btnVaciar = document.getElementById("btnVaciarLista")
    const tarjetas = document.querySelectorAll(".tarjeta-futbolista")

    if (tarjetas.length > 0) {
        btnVaciar.style.display = "block"
    } else {
        btnVaciar.style.display = "none"
    }
}

// Agregar event listener al botón de vaciar
document.getElementById("btnVaciarLista").addEventListener("click", vaciarListaCompleta)

// Cargar futbolistas previos en localStorage al inicio
window.addEventListener("DOMContentLoaded", () => {
    const lista = JSON.parse(localStorage.getItem("futbolistas")) || []
    lista.forEach((f) => {
        // Nos aseguramos de que cada futbolista tenga un ID
        if (!f.id) {
        f.id = Date.now() + Math.random()
        }
        agregarTarjeta(f)
    })

    // Mostrar/ocultar botón de vaciar al cargar
    mostrarOcultarBotonVaciar()
})
