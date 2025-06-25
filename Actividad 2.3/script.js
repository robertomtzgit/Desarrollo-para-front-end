// Datos simulados para la demostración
const mockProducts = [
    { id: 1, name: "Laptop Gaming", description: "Potente laptop para gaming con RTX 4060", price: 1299.99 },
    { id: 2, name: "Smartphone Pro", description: "Último modelo con cámara de 108MP", price: 899.99 },
    { id: 3, name: "Auriculares Bluetooth", description: "Cancelación de ruido activa", price: 199.99 },
    { id: 4, name: "Tablet 10 pulgadas", description: "Perfecta para trabajo y entretenimiento", price: 349.99 },
    { id: 5, name: "Smartwatch", description: "Monitor de salud y fitness", price: 249.99 },
    { id: 6, name: "Cámara DSLR", description: "Cámara profesional 24MP", price: 799.99 },
]

const mockUsers = [
    { id: 1, name: "Ana García", email: "ana.garcia@email.com", role: "Administrador" },
    { id: 2, name: "Carlos López", email: "carlos.lopez@email.com", role: "Usuario" },
    { id: 3, name: "María Rodríguez", email: "maria.rodriguez@email.com", role: "Moderador" },
    { id: 4, name: "Juan Martínez", email: "juan.martinez@email.com", role: "Usuario" },
    { id: 5, name: "Laura Sánchez", email: "laura.sanchez@email.com", role: "Usuario" },
]

// Referencias a elementos del DOM
const loadProductsBtn = document.getElementById("loadProductsBtn")
const loadUsersBtn = document.getElementById("loadUsersBtn")
const clearBtn = document.getElementById("clearBtn")
const statusMessage = document.getElementById("statusMessage")
const loadingSpinner = document.getElementById("loadingSpinner")
const errorMessage = document.getElementById("errorMessage")
const productsGrid = document.getElementById("productsGrid")
const usersList = document.getElementById("usersList")

// Función que simula una llamada a API usando Promises
const fetchDataFromServer = (dataType, delay = 2000) => {
    return new Promise((resolve, reject) => {
        // Mostrar spinner de carga
        showLoadingSpinner()

        setTimeout(() => {
            // Simular posible error (20% de probabilidad)
            if (Math.random() < 0.2) {
                reject(new Error(`Error al cargar ${dataType}. Servidor no disponible.`))
                return
            }

            // Simular respuesta exitosa
            if (dataType === "productos") {
                resolve(mockProducts)
            } else if (dataType === "usuarios") {
                resolve(mockUsers)
            } else {
                reject(new Error("Tipo de datos no válido"))
            }
        }, delay)
    })
}

// Función para mostrar el spinner de carga
const showLoadingSpinner = () => {
    loadingSpinner.classList.remove("hidden")
    hideMessages()
}

// Función para ocultar el spinner de carga
const hideLoadingSpinner = () => {
    loadingSpinner.classList.add("hidden")
}

// Función para mostrar mensajes de estado
const showStatusMessage = (message, type = "success") => {
    statusMessage.textContent = message
    statusMessage.className = `status-message ${type}`
    statusMessage.style.display = "block"
}

// Función para mostrar mensajes de error
const showErrorMessage = (message) => {
    errorMessage.textContent = message
    errorMessage.classList.remove("hidden")
}

// Función para ocultar todos los mensajes
const hideMessages = () => {
    statusMessage.style.display = "none"
    errorMessage.classList.add("hidden")
}

// Función para renderizar productos usando arrow functions
const renderProducts = (products) => {
    productsGrid.innerHTML = ""

    products.forEach((product, index) => {
        const productCard = document.createElement("div")
        productCard.className = "product-card"
        productCard.style.animationDelay = `${index * 0.1}s`

        productCard.innerHTML = `
                        <h3>🛍️ ${product.name}</h3>
                        <p>${product.description}</p>
                        <div class="product-price">$${product.price.toFixed(2)}</div>
                `

        productsGrid.appendChild(productCard)
    })
}

// Función para renderizar usuarios usando arrow functions
const renderUsers = (users) => {
    usersList.innerHTML = '<h2 style="margin-bottom: 20px; color: #2c3e50;">👥 Lista de Usuarios</h2>'

    users.forEach((user, index) => {
        const userItem = document.createElement("div")
        userItem.className = "user-item"
        userItem.style.animationDelay = `${index * 0.1}s`

        const initials = user.name
            .split(" ")
            .map((n) => n[0])
            .join("")

        userItem.innerHTML = `
                        <div class="user-avatar">${initials}</div>
                        <div class="user-info">
                                <h4>${user.name}</h4>
                                <p>📧 ${user.email} | 👤 ${user.role}</p>
                        </div>
                `

        usersList.appendChild(userItem)
    })
}

// Función para limpiar el contenido
const clearContent = () => {
    productsGrid.innerHTML = ""
    usersList.innerHTML = ""
    hideMessages()
    hideLoadingSpinner()
    showStatusMessage("Contenido limpiado correctamente", "success")
}

// Callback para manejar éxito en la carga de productos
const onProductsLoadSuccess = (products) => {
    hideLoadingSpinner()
    renderProducts(products)
    showStatusMessage(`✅ ${products.length} productos cargados exitosamente`, "success")
}

// Callback para manejar errores en la carga de productos
const onProductsLoadError = (error) => {
    hideLoadingSpinner()
    showErrorMessage(`❌ ${error.message}`)
    console.error("Error cargando productos:", error)
}

// Función principal para cargar productos usando Promises y Callbacks
const loadProducts = () => {
    loadProductsBtn.disabled = true
    loadProductsBtn.textContent = "⏳ Cargando..."

    // Usar Promise con callbacks
    fetchDataFromServer("productos")
        .then(onProductsLoadSuccess) // Callback de éxito
        .catch(onProductsLoadError) // Callback de error
        .finally(() => {
            // Arrow function para restaurar el botón
            setTimeout(() => {
                loadProductsBtn.disabled = false
                loadProductsBtn.textContent = "📦 Cargar Productos (Promises)"
            }, 500)
        })
}

// Función async/await para cargar usuarios 
const loadUsers = async () => {
    try {
        loadUsersBtn.disabled = true
        loadUsersBtn.textContent = "⏳ Cargando..."

        // Usar async/await
        const users = await fetchDataFromServer("usuarios", 1500)

        hideLoadingSpinner()
        renderUsers(users)
        showStatusMessage(`✅ ${users.length} usuarios cargados exitosamente`, "success")
    } catch (error) {
        hideLoadingSpinner()
        showErrorMessage(`❌ ${error.message}`)
        console.error("Error cargando usuarios:", error)
    } finally {
        // Arrow function para restaurar el botón
        setTimeout(() => {
            loadUsersBtn.disabled = false
            loadUsersBtn.textContent = "👥 Cargar Usuarios (Async/Await)"
        }, 500)
    }
}

// Event Listeners usando arrow functions
loadProductsBtn.addEventListener("click", () => {
    console.log("🚀 Iniciando carga de productos...")
    loadProducts()
})

loadUsersBtn.addEventListener("click", () => {
    console.log("🚀 Iniciando carga de usuarios...")
    loadUsers()
})

clearBtn.addEventListener("click", () => {
    console.log("🧹 Limpiando contenido...")
    clearContent()
})

// Event listener para efectos hover usando arrow functions
document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ Aplicación cargada correctamente")
    showStatusMessage("🎉 Aplicación lista. Haz clic en los botones para cargar datos.", "success")

    // Agregar efectos hover a los botones
    const buttons = document.querySelectorAll(".btn")
    buttons.forEach((button) => {
        button.addEventListener("mouseenter", () => {
            button.style.transform = "translateY(-2px) scale(1.05)"
        })

        button.addEventListener("mouseleave", () => {
            if (!button.disabled) {
                button.style.transform = "translateY(0) scale(1)"
            }
        })
    })
})

// Función que demuestra el uso de callbacks anidados
const demonstrateCallbacks = () => {
    const step1 = (callback) => {
        setTimeout(() => {
            console.log("📝 Paso 1: Validando datos...")
            callback()
        }, 500)
    }

    const step2 = (callback) => {
        setTimeout(() => {
            console.log("📝 Paso 2: Procesando información...")
            callback()
        }, 500)
    }

    const step3 = (callback) => {
        setTimeout(() => {
            console.log("📝 Paso 3: Finalizando operación...")
            callback()
        }, 500)
    }

    // Ejemplo de callbacks anidados 
    step1(() => {
        step2(() => {
            step3(() => {
                console.log("✅ Proceso completado usando callbacks")
            })
        })
    })
}

// Función que demuestra diferentes tipos de arrow functions
const arrowFunctionExamples = () => {
    // Arrow function simple
    const greet = (name) => `Hola, ${name}!`

    // Arrow function con múltiples parámetros
    const add = (a, b) => a + b

    // Arrow function con cuerpo de función
    const processData = (data) => {
        const processed = data.map((item) => item.toUpperCase())
        return processed.filter((item) => item.length > 3)
    }

    // Arrow function que retorna un objeto
    const createUser = (name, email) => ({
        name,
        email,
        id: Date.now(),
        active: true,
    })

    console.log("🎯 Ejemplos de Arrow Functions:")
    console.log(greet("Estudiante"))
    console.log("Suma:", add(5, 3))
    console.log("Datos procesados:", processData(["html", "css", "js", "react"]))
    console.log("Usuario creado:", createUser("Juan", "juan@email.com"))
}

// Ejecutar ejemplos al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    arrowFunctionExamples()
})
