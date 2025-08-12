$(document).ready(() => {
  // Variables globales
  let autosData = []
  let filteredData = []
  let currentPage = 1
  let recordsPerPage = 10
  let sortColumn = ""
  let sortDirection = "asc"

  // Inicializar la aplicación
  initializeApp()

  function initializeApp() {
    // Aplicar estilos de jQuery UI a los controles
    $("#search-input").addClass("ui-widget ui-widget-content ui-corner-all")
    $("#records-per-page").selectmenu({
      width: 100,
      change: (event, ui) => {
        recordsPerPage = Number.parseInt(ui.item.value)
        currentPage = 1
        displayTable()
      },
    })

    // Cargar datos desde XML
    loadXMLData()

    // Configurar eventos
    setupEventListeners()
  }

  function loadXMLData() {
    $.ajax({
      type: "GET",
      url: "autos.xml",
      dataType: "xml",
      success: (xml) => {
        parseXMLData(xml)
        $("#loading-message").hide()
        displayTable()
      },
      error: () => {
        $("#loading-message").hide()
        $("#error-message").show()
        console.error("Error al cargar el archivo XML")
      },
    })
  }

  function parseXMLData(xml) {
    autosData = []
    $(xml)
      .find("auto")
      .each(function () {
        const auto = {
          marca: $(this).find("marca").text(),
          modelo: $(this).find("modelo").text(),
          año: Number.parseInt($(this).find("año").text()),
          color: $(this).find("color").text(),
          precio: Number.parseFloat($(this).find("precio").text()),
          tipo: $(this).find("tipo").text(),
          transmision: $(this).find("transmision").text(),
          combustible: $(this).find("combustible").text(),
        }
        autosData.push(auto)
      })

    filteredData = [...autosData]
    updateTotalRecords()
  }

  function setupEventListeners() {
    // Busqueda en tiempo real
    $("#search-input").on("input", function () {
      const searchTerm = $(this).val().toLowerCase()
      filterData(searchTerm)
    })

    // Ordenamiento por columnas
    $(".sortable").on("click", function () {
      const column = $(this).data("column")
      handleSort(column)
    })

    // Cambio de registros por pagina (ya manejado en selectmenu)
  }

  function filterData(searchTerm) {
    if (searchTerm === "") {
      filteredData = [...autosData]
    } else {
      filteredData = autosData.filter((auto) => {
        return Object.values(auto).some((value) => value.toString().toLowerCase().includes(searchTerm))
      })
    }

    currentPage = 1
    updateTotalRecords()
    displayTable()
  }

  function handleSort(column) {
    // Actualizar direccion de ordenamiento
    if (sortColumn === column) {
      sortDirection = sortDirection === "asc" ? "desc" : "asc"
    } else {
      sortColumn = column
      sortDirection = "asc"
    }

    // Actualizar indicadores visuales
    $(".sortable").removeClass("sort-asc sort-desc")
    $(`.sortable[data-column="${column}"]`).addClass(`sort-${sortDirection}`)

    // Ordenar datos
    filteredData.sort((a, b) => {
      let valueA = a[column]
      let valueB = b[column]

      // Manejar diferentes tipos de datos
      if (typeof valueA === "string") {
        valueA = valueA.toLowerCase()
        valueB = valueB.toLowerCase()
      }

      if (sortDirection === "asc") {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0
      }
    })

    displayTable()
  }

  function displayTable() {
    const startIndex = (currentPage - 1) * recordsPerPage
    const endIndex = startIndex + recordsPerPage
    const pageData = filteredData.slice(startIndex, endIndex)

    // Limpiar tabla
    $("#table-body").empty()

    // Agregar filas
    pageData.forEach((auto) => {
      const row = `
                <tr class="fade-in">
                    <td>${auto.marca}</td>
                    <td>${auto.modelo}</td>
                    <td>${auto.año}</td>
                    <td>${auto.color}</td>
                    <td>$${auto.precio.toLocaleString("es-MX")}</td>
                    <td>${auto.tipo}</td>
                    <td>${auto.transmision}</td>
                    <td>${auto.combustible}</td>
                </tr>
            `
      $("#table-body").append(row)
    })

    updateShowingRecords(startIndex + 1, Math.min(endIndex, filteredData.length))
    generatePagination()
  }

  function updateTotalRecords() {
    $("#total-records").text(`Total de registros: ${filteredData.length}`)
  }

  function updateShowingRecords(start, end) {
    $("#showing-records").text(`Mostrando: ${start} - ${end}`)
  }

  function generatePagination() {
    const totalPages = Math.ceil(filteredData.length / recordsPerPage)
    const paginationContainer = $("#pagination-controls")

    paginationContainer.empty()

    if (totalPages <= 1) return

    // Boton anterior
    const prevBtn = $(`<button class="pagination-btn ${currentPage === 1 ? "disabled" : ""}">&laquo; Anterior</button>`)
    prevBtn.on("click", () => {
      if (currentPage > 1) {
        currentPage--
        displayTable()
      }
    })
    paginationContainer.append(prevBtn)

    // Numeros de página
    const startPage = Math.max(1, currentPage - 2)
    const endPage = Math.min(totalPages, currentPage + 2)

    if (startPage > 1) {
      const firstBtn = $('<button class="pagination-btn">1</button>')
      firstBtn.on("click", () => {
        currentPage = 1
        displayTable()
      })
      paginationContainer.append(firstBtn)

      if (startPage > 2) {
        paginationContainer.append('<span class="pagination-info">...</span>')
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = $(`<button class="pagination-btn ${i === currentPage ? "active" : ""}">${i}</button>`)
      pageBtn.on("click", () => {
        currentPage = i
        displayTable()
      })
      paginationContainer.append(pageBtn)
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        paginationContainer.append('<span class="pagination-info">...</span>')
      }

      const lastBtn = $(`<button class="pagination-btn">${totalPages}</button>`)
      lastBtn.on("click", () => {
        currentPage = totalPages
        displayTable()
      })
      paginationContainer.append(lastBtn)
    }

    // Boton siguiente
    const nextBtn = $(
      `<button class="pagination-btn ${currentPage === totalPages ? "disabled" : ""}">Siguiente &raquo;</button>`,
    )
    nextBtn.on("click", () => {
      if (currentPage < totalPages) {
        currentPage++
        displayTable()
      }
    })
    paginationContainer.append(nextBtn)

    // Informacion de página
    const pageInfo = $(`<span class="pagination-info">Página ${currentPage} de ${totalPages}</span>`)
    paginationContainer.append(pageInfo)
  }

  // Funcion auxiliar para formatear precios
  function formatPrice(price) {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(price)
  }
})
