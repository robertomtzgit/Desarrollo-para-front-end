document.getElementById("btnRegistrar").addEventListener("click", () => {
    let esValido = true

    // Lista de campos a validar (todos obligatorios)
    const camposTexto = [
        "nombre", "dorsal", "fechaNacimiento", "lugarNacimiento", 
        "nacionalidad", "altura", "peso", "descripcion", "equiposAnteriores",
    ];

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
    }

    // Guardar en localStorage
    const lista = JSON.parse(localStorage.getItem("futbolistas")) || []
    lista.push(futbolista)
    localStorage.setItem("futbolistas", JSON.stringify(lista))

    agregarTarjeta(futbolista)

    Swal.fire("✅ ¡Registrado!", "Futbolista agregado al catálogo.", "success")

    document.getElementById("formularioFutbolista").reset()
    document.querySelectorAll(".success").forEach((el) => el.classList.remove("success"))
    })

    function agregarTarjeta(f) {
    const contenedor = document.getElementById("catalogoFutbolistas")

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

    // Crear botón de eliminar
    const btnEliminar = document.createElement("button")
    btnEliminar.classList.add("btn-eliminar")
    btnEliminar.textContent = "Eliminar"
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

        Swal.fire("¡Eliminado!", "El futbolista ha sido eliminado.", "success")
        }
    })
    }

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
})
