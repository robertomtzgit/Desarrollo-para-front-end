document.getElementById('btnRegistrar').addEventListener('click', function () {
    let esValido = true;

    // Lista de campos a validar (todos obligatorios)
    const camposTexto = [
        'nombre', 'dorsal', 'fechaNacimiento', 'lugarNacimiento',
        'nacionalidad', 'altura', 'peso', 'descripcion', 'equiposAnteriores'
    ];

    // Validar campos de texto, número y fecha
    camposTexto.forEach(id => {
        const campo = document.getElementById(id);
        if (!campo.value.trim()) {
        campo.classList.add('error');
        campo.classList.remove('success');
        esValido = false;
        } else {
        campo.classList.remove('error');
        campo.classList.add('success');
        }
    });

    // Validar select de pie dominante
    const pie = document.getElementById('pie');
    if (pie.value === '') {
        pie.classList.add('error');
        pie.classList.remove('success');
        esValido = false;
    } else {
        pie.classList.remove('error');
        pie.classList.add('success');
    }

    // Validar select de posición
    const posicion = document.getElementById('posicion');
    if (posicion.value === '') {
        posicion.classList.add('error');
        posicion.classList.remove('success');
        esValido = false;
    } else {
        posicion.classList.remove('error');
        posicion.classList.add('success');
    }

    // Validar que al menos una habilidad esté seleccionada
    const habilidadesSeleccionadas = document.querySelectorAll('input[name="habilidades"]:checked');
    const seccionCheckbox = document.querySelector('input[name="habilidades"]').parentElement;

    if (habilidadesSeleccionadas.length === 0) {
        seccionCheckbox.classList.add('error');
        esValido = false;
        alert('Debes seleccionar al menos una habilidad.');
    } else {
        seccionCheckbox.classList.remove('error');
    }

    // Mostrar alertas finales
    if (esValido) {
        alert('✅ ¡Futbolista registrado correctamente!');
        document.getElementById('formularioFutbolista').reset();
        document.querySelectorAll('.success').forEach(el => el.classList.remove('success'));
    } else {
        alert('⚠️ Por favor completa todos los campos obligatorios.');
    }
});
