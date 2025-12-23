// Función para obtener el color del marcador según el estado del reporte
export const obtenerColorMarcador = (reporte) => {
    const coloresEstado = {
        'nuevo': '#E63946',        // Rojo para nuevo
        'en_proceso': '#F2C94C',   // Amarillo para en proceso
        'resuelto': '#28a745',     // Verde para resuelto
        'cerrado': '#6c757d'       // Gris para cerrado
    };
    return coloresEstado[reporte?.estatus] || '#E63946';
};

// Función para obtener el color del marcador según la categoría (para formularios de creación)
export const obtenerColorCategoria = (categoria) => {
    const coloresCategoria = {
        'verde': '#28a745',
        'amarillo': '#F2C94C', 
        'rojo': '#E63946'
    };
    return coloresCategoria[categoria?.color] || '#E63946';
};
