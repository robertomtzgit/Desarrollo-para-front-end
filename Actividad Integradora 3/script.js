// Variables globales
let pagina = 1
let $

// Inicialización - ESPERAR A QUE JQUERY SE CARGUE
window.onload = () => {
  $ = window.jQuery
  console.log("✅ jQuery y jQuery UI cargados correctamente")

  // Inicializar dialogs de jQuery UI
  initializeDialogs()
  
  // Cargar datos iniciales
  cargarAutos()
  
  // Vincular eventos
  bindEvents()
  
  // Animación inicial del header
  animateHeader()
}

// Inicializar dialogs de jQuery UI
function initializeDialogs() {
  // DIALOG 1: Dialog de confirmación para eliminar
  $("#dialog-confirm").dialog({
    autoOpen: false,
    resizable: false,
    height: "auto",
    width: 400,
    modal: true,
    show: {
      effect: "bounce",
      duration: 400,
    },
    hide: {
      effect: "fade",
      duration: 300,
    },
  })

  // DIALOG 2: Dialog de éxito
  $("#dialog-success").dialog({
    autoOpen: false,
    resizable: false,
    height: "auto",
    width: 400,
    modal: true,
    show: {
      effect: "fadeIn",
      duration: 400,
    },
    hide: {
      effect: "fadeOut",
      duration: 300,
    },
    buttons: {
      Aceptar: function () {
        $(this).dialog("close")
      },
    },
  })

  // DIALOG 3: Dialog de error
  $("#dialog-error").dialog({
    autoOpen: false,
    resizable: false,
    height: "auto",
    width: 400,
    modal: true,
    show: {
      effect: "shake",
      duration: 400,
    },
    hide: {
      effect: "fadeOut",
      duration: 300,
    },
    buttons: {
      Cerrar: function () {
        $(this).dialog("close")
      },
    },
  })

  // DIALOG 4: Dialog de validación
  $("#dialog-validation").dialog({
    autoOpen: false,
    resizable: false,
    height: "auto",
    width: 450,
    modal: true,
    show: {
      effect: "shake",
      duration: 400,
    },
    hide: {
      effect: "fadeOut",
      duration: 300,
    },
    buttons: {
      Entendido: function () {
        $(this).dialog("close")
      },
    },
  })

  // DIALOG 5: Dialog de carga
  $("#dialog-loading").dialog({
    autoOpen: false,
    resizable: false,
    height: "auto",
    width: 300,
    modal: true,
    closeOnEscape: false,
    dialogClass: "no-close",
    show: {
      effect: "fadeIn",
      duration: 300,
    },
  })
}

// ANIMACION 1: Animación inicial del header
function animateHeader() {
  $(".header").addClass("animated")
}

// Vincular eventos
function bindEvents() {
  // ANIMACION 2: Controles de tabla con animación
  $("#buscar, #cantidad, #orden, #direccion").on("change keyup", () => {
    pagina = 1
    // Animación de actualización de tabla
    $(".table-wrapper").addClass("table-updating")
    setTimeout(() => {
      $(".table-wrapper").removeClass("table-updating")
    }, 800)
    cargarAutos()
  })

  $("#refrescar").click(() => {
    // Animación de refresh
    $("#refrescar").addClass("loading")
    cargarAutos()
    setTimeout(() => {
      $("#refrescar").removeClass("loading")
    }, 1000)
  })

  // Formulario
  $("#nuevo-auto").click(() => {
    abrirModal("agregar")
  })

  $("#form-auto").submit((e) => {
    e.preventDefault()
    if (validarFormulario()) {
      guardarAuto()
    }
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

  // Validación en tiempo real
  $("#form-auto input, #form-auto select").on("blur", function () {
    validarCampo($(this))
  })
}

// Función principal para cargar autos
function cargarAutos() {
  console.log("🔍 Cargando autos...")

  const search = $("#buscar").val()
  const cantidad = $("#cantidad").val()
  const orden = $("#orden").val()
  const direccion = $("#direccion").val()

  // Mostrar loading con animación
  $("#loading").fadeIn(300)

  // Limpiar tabla con animación
  $("#tabla-autos").fadeOut(200, function () {
    $(this).empty()
  })

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

        // ANIMACION 3: Al cambiar visualización de tabla
        mostrarAutosConAnimacion(autos)
        actualizarEstadisticas(total, cantidad)
        mostrarPaginacion(total, cantidad)

        if (autos.length === 0) {
          mostrarDialogInfo("No se encontraron registros", "info")
        }
      } else {
        mostrarDialogError("Error al cargar datos: " + (response.message || "Error desconocido"))
      }
    },
    error: (xhr, status, error) => {
      console.error("❌ Error AJAX:", error)
      console.error("❌ Respuesta:", xhr.responseText)
      mostrarDialogError("Error de conexión con el servidor")
    },
    complete: () => {
      $("#loading").fadeOut(300)
    },
  })
}

// ANIMACION 3: Mostrar autos con animación al cambiar visualización
function mostrarAutosConAnimacion(autos) {
  const tbody = $("#tabla-autos")

  // Fade in de la tabla
  tbody.fadeIn(400, () => {
    if (autos.length === 0) {
      tbody.append(`
                <tr class="no-data-row">
                    <td colspan="11">
                        <div class="no-data-icon">🚗</div>
                        <div style="font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem;">No se encontraron vehículos</div>
                        <div style="font-size: 0.875rem; opacity: 0.7;">Intenta cambiar los filtros de búsqueda</div>
                    </td>
                </tr>
            `)
      return
    }

    // Agregar cada fila con delay para efecto cascada
    autos.forEach((auto, index) => {
      setTimeout(() => {
        const precio = Number.parseFloat(auto.precio || 0).toLocaleString("es-MX", {
          style: "currency",
          currency: "MXN",
        })

        const kilometraje = Number.parseInt(auto.kilometraje || 0).toLocaleString() + " km"

        const row = $(`
                    <tr class="auto-row" style="opacity: 0; transform: translateX(-50px);" data-id="${auto.id}">
                        <td><strong>#${auto.id}</strong></td>
                        <td><strong>${auto.marca}</strong></td>
                        <td>${auto.modelo}</td>
                        <td>${auto.anio}</td>
                        <td>
                            <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: ${getColorCode(auto.color)}; margin-right: 8px; border: 1px solid #e2e8f0;"></span>
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
                          <div class="actions-cell">
                            <button onclick="editar(${auto.id})" class="btn btn-primary btn-small" title="Editar vehículo">✏️</button>
                            <button onclick="eliminar(${auto.id})" class="btn btn-danger btn-small" title="Eliminar vehículo">🗑️</button>
                          </div>
                        </td>
                    </tr>
                `)

        tbody.append(row)

        // Animar la aparición de la fila
        row.animate(
          {
            opacity: 1,
            transform: "translateX(0)",
          },
          300,
        )
      }, index * 80) // Delay progresivo
    })
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

// ANIMACION 4: Actualizar estadísticas con animación
function actualizarEstadisticas(total, cantidad) {
  const totalPaginas = Math.ceil(total / cantidad)

  // Animar cambio de números
  animateNumber("#total-registros", total)
  animateNumber("#pagina-actual", pagina)
  animateNumber("#total-paginas", totalPaginas)
}

// Animar cambio de números
function animateNumber(selector, newValue) {
  const element = $(selector)
  const currentValue = Number.parseInt(element.text()) || 0

  if (currentValue !== newValue) {
    element.addClass("stat-updating")
    $({ value: currentValue }).animate(
      { value: newValue },
      {
        duration: 800,
        easing: "swing",
        step: function () {
          element.text(Math.floor(this.value))
        },
        complete: () => {
          element.text(newValue)
          element.removeClass("stat-updating")
        },
      },
    )
  }
}

// ANIMACION 5: Mostrar paginación
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

// Cambiar página con animación
function cambiarPagina(num) {
  pagina = num

  // Animación de cambio de página
  $(".table-wrapper").addClass("table-updating")
  setTimeout(() => {
    $(".table-wrapper").removeClass("table-updating")
  }, 800)

  cargarAutos()
}

// Funciones del formulario
function abrirModal(modo, autoData) {
  // Limpiar errores previos
  limpiarErrores()

  if (modo === "agregar") {
    $("#form-titulo").text("➕ Agregar Nuevo Vehículo")
    $("#form-auto")[0].reset()
    $("#id").val("")
  } else if (modo === "editar" && autoData) {
    $("#form-titulo").text("✏️ Editar Vehículo")
    llenarFormulario(autoData)
  }

  // Mostrar modal con animación
  $("#modal-form").fadeIn(300)
  $(".modal-content").addClass("modal-enter")
}

function cerrarModal() {
  $("#modal-form").fadeOut(300)
  $("#form-auto")[0].reset()
  $("#id").val("")
  limpiarErrores()
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

// VALIDACIÓN COMPLETA: Sistema mejorado de validación
function validarFormulario() {
  let esValido = true
  const errores = []
  limpiarErrores()

  // Validar marca
  if (!validarCampo($("#marca"))) {
    errores.push("Marca es obligatoria y debe tener al menos 2 caracteres")
    esValido = false
  }

  // Validar modelo
  if (!validarCampo($("#modelo"))) {
    errores.push("Modelo es obligatorio y debe tener al menos 2 caracteres")
    esValido = false
  }

  // Validar año
  if (!validarCampo($("#anio"))) {
    errores.push("Año debe ser válido (1900-2024)")
    esValido = false
  }

  // Validar color
  if (!validarCampo($("#color"))) {
    errores.push("Color es obligatorio")
    esValido = false
  }

  // Validar precio
  if (!validarCampo($("#precio"))) {
    errores.push("Precio debe ser mayor a 0")
    esValido = false
  }

  // Validar combustible
  if (!validarCampo($("#combustible"))) {
    errores.push("Debe seleccionar un tipo de combustible")
    esValido = false
  }

  // Validar transmisión
  if (!validarCampo($("#transmision"))) {
    errores.push("Debe seleccionar un tipo de transmisión")
    esValido = false
  }

  // Validar estado
  if (!validarCampo($("#estado"))) {
    errores.push("Debe seleccionar el estado del vehículo")
    esValido = false
  }

  // Validar kilometraje
  const kilometraje = $("#kilometraje").val()
  if (kilometraje && isNaN(kilometraje)) {
    mostrarError("kilometraje", "El kilometraje debe ser un número válido")
    errores.push("Kilometraje debe ser numérico")
    esValido = false
  }

  // Validar versión
  if (!validarCampo($("#version"))) {
    errores.push("Versión es obligatoria")
    esValido = false
  }

  if (!esValido) {
    mostrarDialogoValidacion(errores)
  }

  return esValido
}

function validarCampo(campo) {
  const valor = campo.val().trim()
  const nombre = campo.attr("id")
  let esValido = true

  // Validar campos requeridos
  if (campo.prop("required") && !valor) {
    mostrarError(nombre, "Este campo es obligatorio")
    esValido = false
  }

  // Validaciones específicas
  switch (nombre) {
    case "anio":
      const anio = Number.parseInt(valor)
      if (valor && (isNaN(anio) || anio < 1900 || anio > new Date().getFullYear() + 1)) {
        mostrarError(nombre, "Ingresa un año válido")
        esValido = false
      }
      break
    case "precio":
      const precio = Number.parseFloat(valor)
      if (valor && (isNaN(precio) || precio <= 0)) {
        mostrarError(nombre, "Ingresa un precio válido mayor a 0")
        esValido = false
      }
      break
    case "marca":
    case "modelo":
    case "color":
      if (valor && valor.length < 2) {
        mostrarError(nombre, "Debe tener al menos 2 caracteres")
        esValido = false
      }
      break
  }

  // Aplicar estilos visuales
  if (esValido) {
    campo.removeClass("error")
  } else {
    campo.addClass("error")
  }

  return esValido
}

function mostrarError(campo, mensaje) {
  const errorElement = $(`#error-${campo}`)
  errorElement.text(mensaje).addClass("show")
}

function limpiarErrores() {
  $(".error-message").removeClass("show").text("")
  $(".form-group input, .form-group select").removeClass("error")
}

// Función para agregar nueva fila con animación SIN recargar toda la tabla
function agregarFilaConAnimacion(nuevoAuto) {
  const tbody = $("#tabla-autos")
  const precio = Number.parseFloat(nuevoAuto.precio || 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  })
  const kilometraje = Number.parseInt(nuevoAuto.kilometraje || 0).toLocaleString() + " km"

  const nuevaFila = $(`
    <tr class="auto-row row-adding" style="opacity: 0; transform: translateX(-100%);" data-id="${nuevoAuto.id}">
        <td><strong>#${nuevoAuto.id}</strong></td>
        <td><strong>${nuevoAuto.marca}</strong></td>
        <td>${nuevoAuto.modelo}</td>
        <td>${nuevoAuto.anio}</td>
        <td>
            <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: ${getColorCode(nuevoAuto.color)}; margin-right: 8px; border: 1px solid #e2e8f0;"></span>
            ${nuevoAuto.color}
        </td>
        <td><strong>${precio}</strong></td>
        <td>
            <span class="badge badge-${nuevoAuto.combustible.toLowerCase()}">${nuevoAuto.combustible}</span>
        </td>
        <td>${nuevoAuto.transmision || "N/A"}</td>
        <td>
            <span class="badge badge-${nuevoAuto.estado ? nuevoAuto.estado.toLowerCase() : "usado"}">${nuevoAuto.estado || "Usado"}</span>
        </td>
        <td>${kilometraje}</td>
        <td>
            <button onclick="editar(${nuevoAuto.id})" class="btn btn-primary btn-small" title="Editar vehículo">
                ✏️
            </button>
            <button onclick="eliminar(${nuevoAuto.id})" class="btn btn-danger btn-small" title="Eliminar vehículo">
                🗑️
            </button>
        </td>
    </tr>
  `)

  // Agregar al inicio de la tabla
  tbody.prepend(nuevaFila)

  // Animar la nueva fila
  setTimeout(() => {
    nuevaFila.animate(
      {
        opacity: 1,
        transform: "translateX(0)",
      },
      600,
      () => {
        // Remover clase de animación después de completar
        nuevaFila.removeClass("row-adding")
        // Actualizar solo las estadísticas
        actualizarEstadisticasSinRecargar()
      },
    )
  }, 100)
}

// Actualizar estadísticas sin recargar tabla
function actualizarEstadisticasSinRecargar() {
  const totalActual = Number.parseInt($("#total-registros").text()) + 1
  animateNumber("#total-registros", totalActual)
}

// Guardar auto con animación mejorada
function guardarAuto() {
  const id = $("#id").val()
  const url = id ? "api/editar_auto.php" : "api/agregar_auto.php"
  const accion = id ? "actualizado" : "agregado"

  const formData = {
    id: id,
    marca: $("#marca").val().trim(),
    modelo: $("#modelo").val().trim(),
    anio: $("#anio").val(),
    color: $("#color").val().trim(),
    precio: $("#precio").val(),
    combustible: $("#combustible").val(),
    transmision: $("#transmision").val(),
    estado: $("#estado").val(),
    kilometraje: $("#kilometraje").val() || 0,
    version: $("#version").val().trim(),
  }

  // Mostrar loading en el botón
  const btnGuardar = $("#guardar")
  const textoOriginal = btnGuardar.text()
  btnGuardar.text("💾 Guardando...").prop("disabled", true)

  $.ajax({
    url: url,
    type: "POST",
    data: formData,
    dataType: "json",
    success: (response) => {
      console.log("✅ Respuesta del servidor:", response)

      if (response.success !== false) {
        // DIALOG 2: Éxito
        mostrarDialogExito(`Vehículo ${accion} exitosamente! 🚗`)
        cerrarModal()

        if (!id) {
          // Si es un nuevo auto, usar el ID real del servidor
          const nuevoAuto = {
            id: response.id, // ID REAL de la base de datos
            ...formData,
          }
          agregarFilaConAnimacion(nuevoAuto)
        } else {
          // Si es edición, actualizar la fila existente
          actualizarFilaEditada(id, formData)
        }
      } else {
        // DIALOG 3: Error
        mostrarDialogError("Error al guardar: " + (response.message || response.error || "Error desconocido"))
      }
    },
    error: (xhr, status, error) => {
      console.error("Error al guardar:", error)
      console.error("Respuesta del servidor:", xhr.responseText)
      mostrarDialogError("Error de conexión al guardar")
    },
    complete: () => {
      btnGuardar.text(textoOriginal).prop("disabled", false)
    },
  })
}

// Función para actualizar fila editada sin recargar tabla
function actualizarFilaEditada(id, datosActualizados) {
  const fila = $(`tr[data-id="${id}"]`)
  if (fila.length > 0) {
    const precio = Number.parseFloat(datosActualizados.precio || 0).toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
    })
    const kilometraje = Number.parseInt(datosActualizados.kilometraje || 0).toLocaleString() + " km"

    // Actualizar contenido de la fila
    fila.find("td:eq(1)").html(`<strong>${datosActualizados.marca}</strong>`)
    fila.find("td:eq(2)").text(datosActualizados.modelo)
    fila.find("td:eq(3)").text(datosActualizados.anio)
    fila.find("td:eq(4)").html(`
      <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: ${getColorCode(datosActualizados.color)}; margin-right: 8px; border: 1px solid #e2e8f0;"></span>
      ${datosActualizados.color}
    `)
    fila.find("td:eq(5)").html(`<strong>${precio}</strong>`)
    fila
      .find("td:eq(6)")
      .html(
        `<span class="badge badge-${datosActualizados.combustible.toLowerCase()}">${datosActualizados.combustible}</span>`,
      )
    fila.find("td:eq(7)").text(datosActualizados.transmision || "N/A")
    fila
      .find("td:eq(8)")
      .html(
        `<span class="badge badge-${datosActualizados.estado ? datosActualizados.estado.toLowerCase() : "usado"}">${datosActualizados.estado || "Usado"}</span>`,
      )
    fila.find("td:eq(9)").text(kilometraje)

    // Animación de actualización
    fila.addClass("table-updating")
    setTimeout(() => {
      fila.removeClass("table-updating")
    }, 800)
  }
}

// Editar auto
function editar(id) {
  $.ajax({
    url: "api/listar_auto.php",
    type: "GET",
    data: { id: id },
    dataType: "json",
    success: (response) => {
      console.log("✅ Datos para editar:", response)
      if (response.data && response.data.length > 0) {
        abrirModal("editar", response.data[0])
      } else {
        mostrarDialogError("No se pudo cargar la información del vehículo")
      }
    },
    error: (xhr, status, error) => {
      console.error("Error al cargar datos para editar:", error)
      mostrarDialogError("Error al cargar datos para editar")
    },
  })
}

// Eliminar auto con animación de fila
function eliminar(id) {
  // DIALOG 1: Confirmación de eliminación
  $("#dialog-confirm").dialog({
    buttons: {
      Eliminar: function () {
        $(this).dialog("close")
        ejecutarEliminacion(id)
      },
      Cancelar: function () {
        $(this).dialog("close")
      },
    },
  })

  $("#dialog-confirm").dialog("open")
}

function ejecutarEliminacion(id) {
  // Encontrar la fila a eliminar
  const fila = $(`tr[data-id="${id}"]`)

  $.ajax({
    url: "api/eliminar_auto.php",
    type: "POST",
    data: { id: id },
    dataType: "json",
    success: (response) => {
      console.log("✅ Respuesta eliminación:", response)

      if (response.success !== false) {
        // Animación: Eliminar fila con animación
        fila.addClass("row-removing")
        setTimeout(() => {
          fila.fadeOut(300, function () {
            $(this).remove()
            // Actualizar solo estadísticas sin recargar tabla
            const totalActual = Number.parseInt($("#total-registros").text()) - 1
            animateNumber("#total-registros", totalActual)
          })
        }, 500)

        // DIALOG 2: Éxito al eliminar
        mostrarDialogExito("Vehículo eliminado exitosamente! 🗑️")
      } else {
        // DIALOG 3: Error al eliminar
        mostrarDialogError("Error al eliminar: " + (response.message || response.error || "Error desconocido"))
      }
    },
    error: (xhr, status, error) => {
      console.error("Error al eliminar:", error)
      console.error("Respuesta del servidor:", xhr.responseText)
      mostrarDialogError("Error de conexión al eliminar")
    },
  })
}

// DIALOG 2: Mostrar dialog de éxito
function mostrarDialogExito(mensaje) {
  $("#success-message").text(mensaje)
  $("#dialog-success").dialog("open")
}

// DIALOG 3: Mostrar dialog de error
function mostrarDialogError(mensaje) {
  $("#error-message").text(mensaje)
  $("#dialog-error").dialog("open")
}

// DIALOG 4: Mostrar diálogo de validación
function mostrarDialogoValidacion(errores) {
  const lista = $("#validation-errors")
  lista.empty()

  errores.forEach((error) => {
    lista.append(`<li>${error}</li>`)
  })

  $("#dialog-validation").dialog("open")
}

// Dialog informativo
function mostrarDialogInfo(mensaje, tipo = "info") {
  // Crear dialog temporal para información
  const dialogId = "dialog-info-" + Date.now()
  const dialogHtml = `
        <div id="${dialogId}" title="Información" style="display: none;">
            <p>
                <span class="ui-icon ui-icon-info" style="float:left; margin:12px 12px 20px 0;"></span>
                ${mensaje}
            </p>
        </div>
    `

  $("body").append(dialogHtml)

  $(`#${dialogId}`).dialog({
    modal: true,
    width: 400,
    show: {
      effect: "fadeIn",
      duration: 400,
    },
    hide: {
      effect: "fadeOut",
      duration: 300,
    },
    buttons: {
      Aceptar: function () {
        $(this).dialog("close")
      },
    },
    close: function () {
      $(this).remove()
    },
  })
}
