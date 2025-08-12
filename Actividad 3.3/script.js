// Variables globales
let pagina = 1
let $ 

// Inicialización - ESPERAR A QUE JQUERY SE CARGUE
window.onload = () => {
  $ = window.jQuery 
  console.log("✅ jQuery cargado correctamente")
  cargarAutos()
  bindEvents()
}

// Vincular eventos
function bindEvents() {
  // Controles de tabla
  $("#buscar, #cantidad, #orden, #direccion").on("change keyup", () => {
    pagina = 1
    cargarAutos()
  })

  $("#refrescar").click(() => {
    cargarAutos()
  })

  // Formulario
  $("#nuevo-auto").click(() => {
    abrirModal("agregar")
  })

  $("#form-auto").submit((e) => {
    e.preventDefault()
    guardarAuto()
  })

  $("#cancelar, .close-modal").click(() => {
    cerrarModal()
  })

  // Cerrar modal al hacer clic fuera
  $(window).click((e) => {
    if (e.target.id === "modal-form") {
      cerrarModal()
    }
  })

  // Enter en búsqueda
  $("#buscar").keypress((e) => {
    if (e.which === 13) {
      pagina = 1
      cargarAutos()
    }
  })
}

// Función principal para cargar autos
function cargarAutos() {
  console.log("🔍 Cargando autos...")

  const search = $("#buscar").val()
  const cantidad = $("#cantidad").val()
  const orden = $("#orden").val()
  const direccion = $("#direccion").val()

  // Mostrar loading
  $("#loading").show()
  $("#tabla-autos").empty()

  $.ajax({
    url: "api/listar_auto.php",
    type: "GET",
    data: {
      search: search,
      limit: cantidad,
      orderBy: orden,
      orderDir: direccion,
      page: pagina,
    },
    dataType: "json",
    success: (response) => {
      console.log("✅ Respuesta recibida:", response)

      if (response.success !== false) {
        const autos = response.data || []
        const total = response.total || 0

        mostrarAutos(autos)
        actualizarEstadisticas(total, cantidad)
        mostrarPaginacion(total, cantidad)

        if (autos.length === 0) {
          showMessage("No se encontraron registros", "info")
        }
      } else {
        showMessage("Error al cargar datos: " + (response.message || "Error desconocido"), "error")
      }
    },
    error: (xhr, status, error) => {
      console.error("❌ Error AJAX:", error)
      console.error("❌ Respuesta:", xhr.responseText)
      showMessage("Error de conexión con el servidor", "error")
    },
    complete: () => {
      $("#loading").hide()
    },
  })
}

// 🎨 Mostrar autos en la tabla
function mostrarAutos(autos) {
  const tbody = $("#tabla-autos")
  tbody.empty()

  if (autos.length === 0) {
    tbody.append(`
            <tr>
                <td colspan="11" style="text-align: center; padding: 40px; color: #6b7280;">
                    <div style="font-size: 48px; margin-bottom: 10px;">🚗</div>
                    <div>No se encontraron autos</div>
                    <div style="font-size: 14px; opacity: 0.7;">Intenta cambiar los filtros de búsqueda</div>
                </td>
            </tr>
        `)
    return
  }

  autos.forEach((auto) => {
    const precio = Number.parseFloat(auto.precio || 0).toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
    })

    const kilometraje = Number.parseInt(auto.kilometraje || 0).toLocaleString() + " km"

    tbody.append(`
            <tr>
                <td><strong>#${auto.id}</strong></td>
                <td><strong>${auto.marca}</strong></td>
                <td>${auto.modelo}</td>
                <td>${auto.anio}</td>
                <td>
                    <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: ${getColorCode(auto.color)}; margin-right: 5px;"></span>
                    ${auto.color}
                </td>
                <td><strong>${precio}</strong></td>
                <td>
                    <span class="badge badge-${auto.combustible.toLowerCase()}">${auto.combustible}</span>
                </td>
                <td>${auto.transmision || "N/A"}</td>
                <td>
                    <span class="badge badge-${auto.estado ? auto.estado.toLowerCase() : "usado"}">${auto.estado || "Usado"}</span>
                </td>
                <td>${kilometraje}</td>
                <td>
                    <button onclick="editar(${auto.id})" class="btn btn-primary btn-small" title="Editar">
                        ✏️
                    </button>
                    <button onclick="eliminar(${auto.id})" class="btn btn-danger btn-small" title="Eliminar">
                        🗑️
                    </button>
                </td>
            </tr>
        `)
  })
}

// Función auxiliar para colores
function getColorCode(color) {
  const colors = {
    blanco: "#ffffff",
    negro: "#000000",
    gris: "#808080",
    plata: "#c0c0c0",
    rojo: "#ff0000",
    azul: "#0000ff",
    verde: "#008000",
    amarillo: "#ffff00",
  }
  return colors[color.toLowerCase()] || "#cccccc"
}

// Actualizar estadísticas
function actualizarEstadisticas(total, cantidad) {
  const totalPaginas = Math.ceil(total / cantidad)

  $("#total-registros").text(total)
  $("#pagina-actual").text(pagina)
  $("#total-paginas").text(totalPaginas)
}

// Mostrar paginación
function mostrarPaginacion(total, cantidad) {
  const totalPaginas = Math.ceil(total / cantidad)
  const pagDiv = $("#paginacion")
  pagDiv.empty()

  if (totalPaginas <= 1) return

  // Botón anterior
  if (pagina > 1) {
    pagDiv.append(`<button onclick="cambiarPagina(${pagina - 1})">⬅️ Anterior</button>`)
  }

  // Números de página
  const inicio = Math.max(1, pagina - 2)
  const fin = Math.min(totalPaginas, pagina + 2)

  if (inicio > 1) {
    pagDiv.append(`<button onclick="cambiarPagina(1)">1</button>`)
    if (inicio > 2) {
      pagDiv.append(`<span style="padding: 10px;">...</span>`)
    }
  }

  for (let i = inicio; i <= fin; i++) {
    const activeClass = i === pagina ? "active" : ""
    pagDiv.append(`<button class="${activeClass}" onclick="cambiarPagina(${i})">${i}</button>`)
  }

  if (fin < totalPaginas) {
    if (fin < totalPaginas - 1) {
      pagDiv.append(`<span style="padding: 10px;">...</span>`)
    }
    pagDiv.append(`<button onclick="cambiarPagina(${totalPaginas})">${totalPaginas}</button>`)
  }

  // Botón siguiente
  if (pagina < totalPaginas) {
    pagDiv.append(`<button onclick="cambiarPagina(${pagina + 1})">Siguiente ➡️</button>`)
  }
}

// Cambiar página
function cambiarPagina(num) {
  pagina = num
  cargarAutos()
}

// Funciones del formulario
function abrirModal(modo, autoData) {
  if (modo === "agregar") {
    $("#form-titulo").text("➕ Agregar Nuevo Auto")
    $("#form-auto")[0].reset()
    $("#id").val("")
  } else if (modo === "editar" && autoData) {
    $("#form-titulo").text("✏️ Editar Auto")
    llenarFormulario(autoData)
  }

  $("#modal-form").show()
}

function cerrarModal() {
  $("#modal-form").hide()
  $("#form-auto")[0].reset()
  $("#id").val("")
}

function llenarFormulario(auto) {
  $("#id").val(auto.id)
  $("#marca").val(auto.marca)
  $("#modelo").val(auto.modelo)
  $("#anio").val(auto.anio)
  $("#color").val(auto.color)
  $("#precio").val(auto.precio)
  $("#combustible").val(auto.combustible)
  $("#transmision").val(auto.transmision || "")
  $("#estado").val(auto.estado || "")
  $("#kilometraje").val(auto.kilometraje || 0)
  $("#version").val(auto.version || "")
}

// Guardar auto
function guardarAuto() {
  const id = $("#id").val()
  const url = id ? "api/editar_auto.php" : "api/agregar_auto.php"
  const accion = id ? "actualizado" : "agregado"

  const formData = {
    id: id,
    marca: $("#marca").val(),
    modelo: $("#modelo").val(),
    anio: $("#anio").val(),
    color: $("#color").val(),
    precio: $("#precio").val(),
    combustible: $("#combustible").val(),
    transmision: $("#transmision").val(),
    estado: $("#estado").val(),
    kilometraje: $("#kilometraje").val(),
    version: $("#version").val(),
  }

  // Validaciones básicas
  if (!formData.marca || !formData.modelo || !formData.anio || !formData.precio) {
    showMessage("Por favor complete todos los campos obligatorios", "error")
    return
  }

  $.ajax({
    url: url,
    type: "POST",
    data: formData,
    dataType: "json",
    success: (response) => {
      if (response.success !== false) {
        showMessage(`Auto ${accion} exitosamente! 🚗`, "success")
        cerrarModal()
        cargarAutos()
      } else {
        showMessage("Error al guardar: " + (response.message || response.error || "Error desconocido"), "error")
      }
    },
    error: (xhr, status, error) => {
      console.error("Error al guardar:", error)
      showMessage("Error de conexión al guardar", "error")
    },
  })
}

// Editar auto
function editar(id) {
  $.ajax({
    url: "api/listar_auto.php",
    type: "GET",
    data: { id: id },
    dataType: "json",
    success: (response) => {
      if (response.data && response.data.length > 0) {
        abrirModal("editar", response.data[0])
      } else {
        showMessage("No se pudo cargar la información del auto", "error")
      }
    },
    error: () => {
      showMessage("Error al cargar datos para editar", "error")
    },
  })
}

// Eliminar auto
function eliminar(id) {
  if (!confirm("¿Estás seguro de que deseas eliminar este auto?\n\nEsta acción no se puede deshacer.")) {
    return
  }

  $.ajax({
    url: "api/eliminar_auto.php",
    type: "POST",
    data: { id: id },
    dataType: "json",
    success: (response) => {
      if (response.success !== false) {
        showMessage("Auto eliminado exitosamente! 🗑️", "success")
        cargarAutos()
      } else {
        showMessage("Error al eliminar: " + (response.message || response.error || "Error desconocido"), "error")
      }
    },
    error: (xhr, status, error) => {
      console.error("Error al eliminar:", error)
      showMessage("Error de conexión al eliminar", "error")
    },
  })
}

// Sistema de mensajes
function showMessage(message, type) {
  const messageContainer = $("#message-container")
  const messageId = "msg-" + Date.now()

  const messageDiv = $(`
        <div id="${messageId}" class="message ${type}">
            ${message}
        </div>
    `)

  messageContainer.append(messageDiv)

  // Mostrar mensaje
  setTimeout(() => {
    messageDiv.addClass("show")
  }, 100)

  // Ocultar mensaje después de 4 segundos
  setTimeout(() => {
    messageDiv.removeClass("show")
    setTimeout(() => {
      messageDiv.remove()
    }, 300)
  }, 4000)
}
