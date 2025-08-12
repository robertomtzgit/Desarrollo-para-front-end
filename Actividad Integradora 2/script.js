// ===== ELEMENTOS DEL DOM =====
const tablaUsuarios = document.querySelector("#tablaUsuarios tbody")
const tablaTareas = document.querySelector("#tablaTareas tbody")
const seccionTareas = document.getElementById("seccionTareas")
const tituloTareas = document.getElementById("tituloTareas")
const filtroEstado = document.getElementById("filtroEstado")

// Elementos adicionales del HTML
const busquedaUsuario = document.getElementById("busquedaUsuario")
const btnBuscar = document.getElementById("btnBuscar")
const btnLimpiar = document.getElementById("btnLimpiar")
const btnVolverUsuarios = document.getElementById("btnVolverUsuarios")
const loadingUsuarios = document.getElementById("loadingUsuarios")
const errorUsuarios = document.getElementById("errorUsuarios")
const btnReintentarUsuarios = document.getElementById("btnReintentarUsuarios")
const noResultados = document.getElementById("noResultados")
const loadingTareas = document.getElementById("loadingTareas")
const errorTareas = document.getElementById("errorTareas")
const btnReintentarTareas = document.getElementById("btnReintentarTareas")
const estadisticasTareas = document.getElementById("estadisticasTareas")
const totalTareas = document.getElementById("totalTareas")
const tareasCompletadas = document.getElementById("tareasCompletadas")
const tareasPendientes = document.getElementById("tareasPendientes")

// ===== VARIABLES GLOBALES =====
let usuariosOriginales = [] 
let tareasActuales = []

// ===== FUNCIONES PRINCIPALES =====

// Función para cargar usuarios con indicadores de carga y manejo de errores
function cargarUsuarios() {
    // Mostrar loading y ocultar errores
    loadingUsuarios.style.display = "flex"
    errorUsuarios.style.display = "none"

    fetch("https://jsonplaceholder.typicode.com/users")
        .then((res) => {
            if (!res.ok) throw new Error("Error al cargar usuarios")
            return res.json()
        })
        .then((usuarios) => {
            usuariosOriginales = usuarios // Guardar usuarios originales para búsqueda
            mostrarUsuarios(usuarios)
            loadingUsuarios.style.display = "none"
        })
        .catch((err) => {
            console.error("Error al obtener usuarios:", err)
            loadingUsuarios.style.display = "none"
            mostrarError(errorUsuarios, "Error al cargar usuarios. Verifica tu conexión.")
        })
}

// Función para mostrar usuarios en la tabla
function mostrarUsuarios(usuarios) {
    tablaUsuarios.innerHTML = ""

    // Si no hay usuarios, mostrar mensaje
    if (usuarios.length === 0) {
        noResultados.style.display = "block"
        return
    }

    noResultados.style.display = "none"

    usuarios.forEach((usuario) => {
        const fila = document.createElement("tr")
        fila.innerHTML = `
            <td>${usuario.id}</td>
            <td>${usuario.name}</td>
            <td>${usuario.email}</td>
            <td>${usuario.address.city}</td>
            <td><button onclick="verTareas(${usuario.id}, '${usuario.name.replace(/'/g, "\\'")}')">Ver tareas</button></td>
        `
        tablaUsuarios.appendChild(fila)
    })
}

// Función para ver tareas 
function verTareas(userId, userName) {
    // Mostrar loading de tareas
    loadingTareas.style.display = "flex"
    errorTareas.style.display = "none"
    seccionTareas.style.display = "block"

    fetch(`https://jsonplaceholder.typicode.com/todos?userId=${userId}`)
        .then((res) => {
            if (!res.ok) throw new Error("Error al cargar tareas")
            return res.json()
        })
        .then((tareas) => {
            tareasActuales = tareas
            tituloTareas.textContent = `Tareas de ${userName}`
            mostrarTareas(tareas)
            actualizarEstadisticas(tareas)
            loadingTareas.style.display = "none"

            seccionTareas.scrollIntoView({ behavior: "smooth" })
        })
        .catch((err) => {
            console.error("Error al obtener tareas:", err)
            loadingTareas.style.display = "none"
            mostrarError(errorTareas, "Error al cargar tareas. Intenta de nuevo.")
        })
}

function mostrarTareas(tareas) {
    tablaTareas.innerHTML = ""
    tareas.forEach((tarea) => {
        const fila = document.createElement("tr")
        fila.innerHTML = `
            <td>${tarea.id}</td>
            <td>${tarea.title}</td>
            <td>${tarea.completed ? "✅ Completada" : "❌ Pendiente"}</td>
        `
        tablaTareas.appendChild(fila)
    })
}

// ===== FUNCIONES AUXILIARES =====

// Función para mostrar errores
function mostrarError(contenedor, mensaje) {
    const textoError = contenedor.querySelector(".error-text")
    textoError.textContent = mensaje
    contenedor.style.display = "flex"
}

// Función para actualizar estadísticas de tareas
function actualizarEstadisticas(tareas) {
    const total = tareas.length
    const completadas = tareas.filter((t) => t.completed).length
    const pendientes = total - completadas

    totalTareas.textContent = total
    tareasCompletadas.textContent = completadas
    tareasPendientes.textContent = pendientes

    estadisticasTareas.style.display = "flex"
}

// Función para filtrar usuarios por búsqueda
function filtrarUsuarios(textoBusqueda) {
    const texto = textoBusqueda.toLowerCase().trim()

    if (!texto) {
        mostrarUsuarios(usuariosOriginales)
        return
    }

    const usuariosFiltrados = usuariosOriginales.filter(
        (usuario) =>
            usuario.name.toLowerCase().includes(texto) ||
            usuario.email.toLowerCase().includes(texto) ||
            usuario.address.city.toLowerCase().includes(texto),
    )

    mostrarUsuarios(usuariosFiltrados)
}

// ===== EVENT LISTENERS =====

// Inicialización cuando carga la página
document.addEventListener("DOMContentLoaded", () => {
    cargarUsuarios()
})

// Búsqueda en tiempo real
busquedaUsuario.addEventListener("input", (e) => {
    filtrarUsuarios(e.target.value)
})

// Botón buscar
btnBuscar.addEventListener("click", () => {
    filtrarUsuarios(busquedaUsuario.value)
})

// Botón limpiar búsqueda
btnLimpiar.addEventListener("click", () => {
    busquedaUsuario.value = ""
    mostrarUsuarios(usuariosOriginales)
    busquedaUsuario.focus()
})

// Búsqueda con Enter
busquedaUsuario.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        e.preventDefault()
        filtrarUsuarios(busquedaUsuario.value)
    }
})

// Filtro de tareas por estado
filtroEstado.addEventListener("change", () => {
    const estado = filtroEstado.value
    let filtradas = tareasActuales

    if (estado === "completadas") {
        filtradas = tareasActuales.filter((t) => t.completed)
    } else if (estado === "pendientes") {
        filtradas = tareasActuales.filter((t) => !t.completed)
    }

    mostrarTareas(filtradas)
})

// Botón volver a usuarios
btnVolverUsuarios.addEventListener("click", () => {
    seccionTareas.style.display = "none"
    document.querySelector(".usuarios-section").scrollIntoView({ behavior: "smooth" })
})

// Botones de reintentar
btnReintentarUsuarios.addEventListener("click", () => {
    cargarUsuarios()
})

btnReintentarTareas.addEventListener("click", () => {
    // Necesitamos guardar el userId y userName para reintentar
    const tituloActual = tituloTareas.textContent
    if (tituloActual.includes("Tareas de ")) {
        const userName = tituloActual.replace("Tareas de ", "")
        // Buscar el usuario en la lista original para obtener su ID
        const usuario = usuariosOriginales.find((u) => u.name === userName)
        if (usuario) {
            verTareas(usuario.id, usuario.name)
        }
    }
})

// Hacer la función verTareas global para que funcione con onclick
window.verTareas = verTareas
