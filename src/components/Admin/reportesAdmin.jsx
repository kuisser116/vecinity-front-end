import React, { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner'
import axios from 'axios';
import { url } from '../../utils/base.url';
import styles from '../../assets/styles/user/reportes.module.css';
import { FaEye, FaTimes, FaEdit } from 'react-icons/fa';
import Navbar from '../components/navbarAdmin.jsx';
import NavbarV from '../components/navbarV.jsx';
import NavbarA from '../components/navbarAdmin';
import NavbarS from '../components/navbarS';
import Map from 'react-map-gl';
import CustomMarker from '../components/customMaker';
import FormularioActualizarReporte from '../components/actualizarReporte.jsx';
import { obtenerColorMarcador } from '../../utils/markerColors';

export default function Reportes() {
    const [reportes, setReportes] = useState([]);
    const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modalEdicionAbierto, setModalEdicionAbierto] = useState(false);
    const [reporteEnEdicion, setReporteEnEdicion] = useState(null);
    const [paginaActual, setPaginaActual] = useState(1);
    const [categorias, setCategorias] = useState([]);
    const reportesPorPagina = 10;

    // Estados para el formulario de edición (reutilizando el componente existente)
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
    const [ubicacion, setUbicacion] = useState({
        calle: '',
        colonia: '',
        ciudad: '',
        estado: '',
        cp: '',
        lng: null,
        lat: null
    });
    const [modalMapView, setModalMapView] = useState({
        longitude: -99.1332,
        latitude: 19.4326,
        zoom: 10
    });
    const [markers, setMarkers] = useState([]);
    const [imagenes, setImagenes] = useState([]);
    const [reporteDestacado, setReporteDestacado] = useState(null);

    const TOKEN = 'pk.eyJ1Ijoic2VyZ2lvMTE2IiwiYSI6ImNtZTZpdW5vcTBrcXAya25kcDZsbXNzaG4ifQ.MV0myv_YmAZm8swvJRyoAQ';

    const token = localStorage.getItem('token');

    // Obtener todos los reportes y categorías
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [reportesResponse, categoriasResponse] = await Promise.all([
                    axios.get(`${url}/api/reports`),
                    axios.get(`${url}/api/categories`)
                ]);
                setReportes(reportesResponse.data.data);
                setCategorias(categoriasResponse.data.data);
                toast.success('Reportes y categorías cargados correctamente');
            } catch (error) {
                console.error('Error al obtener datos:', error);
            }
        };
        fetchData();
    }, []);

    // Verificar si hay un reporte para editar (cuando viene desde el mapa principal)
    useEffect(() => {
        const reporteParaEditar = localStorage.getItem('reporteParaEditar');
        if (reporteParaEditar && reportes.length > 0) {
            const reporteId = parseInt(reporteParaEditar);
            const reporteEncontrado = reportes.find(r => r.id === reporteId);
            if (reporteEncontrado) {
                // Destacar el reporte en la tabla
                setReporteDestacado(reporteId);
                // Abrir automáticamente el modal de edición
                handleEditarReporte(reporteEncontrado);
                // Remover el destacado después de 5 segundos
                setTimeout(() => {
                    setReporteDestacado(null);
                }, 5000);
            }
            localStorage.removeItem('reporteParaEditar');
        }
    }, [reportes]);

    const handleVerReporte = (reporte) => {
        setReporteSeleccionado(reporte);
        setModalAbierto(true);
    };

    const handleEditarReporte = (reporte) => {
        setReporteEnEdicion(reporte);
        setTitulo(reporte.titulo || '');
        setDescripcion(reporte.descripcion || '');
        setCategoriaSeleccionada(reporte.categoria?.id || '');

        // Parsear la dirección del reporte
        let calle = '', colonia = '', ciudad = '', estado = '', cp = '';

        if (reporte.direccion) {
            // Separa usando comas y limpia espacios
            const partes = reporte.direccion.split(',').map(p => p.trim());

            // Asigna según la posición
            calle = partes[0] || '';
            colonia = partes[1] || '';
            ciudad = partes[2] || '';
            estado = partes[3] || '';
            cp = partes[4] || '';
        }

        setUbicacion({
            calle,
            colonia,
            ciudad,
            estado,
            cp,
            lng: parseFloat(reporte.longitud),
            lat: parseFloat(reporte.latitud)
        });

        setModalMapView({
            longitude: parseFloat(reporte.longitud) || -99.1332,
            latitude: parseFloat(reporte.latitud) || 19.4326,
            zoom: 15
        });

        setMarkers([{
            id: reporte.id,
            longitude: parseFloat(reporte.longitud) || -99.1332,
            latitude: parseFloat(reporte.latitud) || 19.4326,
            imgSrc: reporte.multimedia?.[0]?.url || 'https://via.placeholder.com/40',
            color: '#E63946'
        }]);

        setImagenes([]);
        setModalEdicionAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setReporteSeleccionado(null);
    };

    const cerrarModalEdicion = () => {
        setModalEdicionAbierto(false);
        setReporteEnEdicion(null);
        setTitulo('');
        setDescripcion('');
        setCategoriaSeleccionada('');
        setUbicacion({
            calle: '',
            colonia: '',
            ciudad: '',
            estado: '',
            cp: '',
            lng: null,
            lat: null
        });
        setMarkers([]);
        setImagenes([]);
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImagenes(files);
    };

    const actualizarReporte = async (e) => {
        e.preventDefault();

        if (!reporteEnEdicion) return;

        const formData = new FormData();
        formData.append("titulo", titulo);
        formData.append("descripcion", descripcion);
        formData.append("categoria_id", categoriaSeleccionada);
        formData.append("latitud", ubicacion.lat);
        formData.append("longitud", ubicacion.lng);

        const direccionPartes = [
            ubicacion.calle,
            ubicacion.colonia,
            ubicacion.ciudad,
            ubicacion.estado,
            ubicacion.cp
        ].filter(Boolean);
        const direccionCompleta = direccionPartes.join(', ');
        formData.append('direccion', direccionCompleta);

        if (imagenes.length > 0) {
            imagenes.forEach(file => formData.append("files", file));
        }

        try {
            const token = localStorage.getItem("token");
            await axios.put(`${url}/api/reports/${reporteEnEdicion.id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success("Reporte actualizado correctamente");
            cerrarModalEdicion();
            window.location.reload();
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar el reporte");
        }
    };

    // Función para cambiar el estado del reporte
    const cambiarEstadoReporte = async (reporteId, nuevoEstado) => {
        try {
            const response = await axios.put(
                `${url}/api/reports/${reporteId}/status`,
                {
                    estatus: nuevoEstado,
                    comentario: `Estado cambiado a ${nuevoEstado} por administrador`
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.status === 200) {
                // Actualizar la lista de reportes
                const reportesActualizados = reportes.map(reporte =>
                    reporte.id === reporteId ? response.data.data : reporte
                );
                setReportes(reportesActualizados);

                // Mostrar mensaje con el color del nuevo estado
                const coloresEstado = {
                    'nuevo': '🔴 Rojo',
                    'en_proceso': '🟡 Amarillo',
                    'resuelto': '🟢 Verde',
                    'cerrado': '⚫ Gris'
                };
                toast.info(`Estado del reporte cambiado a: ${nuevoEstado} (${coloresEstado[nuevoEstado]})`);
            }
        } catch (error) {
            console.error('Error al cambiar estado del reporte:', error);
            toast.error('Error al cambiar el estado del reporte');
        }
    };

    // --- Paginación ---
    const indexOfLastReporte = paginaActual * reportesPorPagina;
    const indexOfFirstReporte = indexOfLastReporte - reportesPorPagina;
    const reportesActuales = reportes.slice(indexOfFirstReporte, indexOfLastReporte);
    const totalPaginas = Math.ceil(reportes.length / reportesPorPagina);

    // Función para formatear fecha
    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const role = localStorage.getItem('role');
    console.log(role);


    return (
        <div className={styles.container}>
            {role === 'superadmin' ? <NavbarS /> : role === 'admin_general' ? <NavbarA /> : <Navbar />}
            <h2>Todos los Reportes</h2>

            {reportes.length === 0 ? (
                <p>No hay reportes disponibles.</p>
            ) : (
                <>
                    <table className={styles.tabla}>
                        <thead>
                            <tr className={styles.encabezado}>
                                <th>Título</th>
                                <th>Descripción</th>
                                <th>Categoría</th>
                                <th>Estado</th>
                                <th>Fecha</th>
                                <th>Imagen</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportesActuales.map((reporte) => (
                                <tr
                                    key={reporte.id}
                                    style={{
                                        backgroundColor: reporteDestacado === reporte.id ? '#fff3cd' : 'transparent',
                                        border: reporteDestacado === reporte.id ? '2px solid #ffc107' : 'none',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <td>{reporte.titulo || 'Sin título'}</td>
                                    <td>
                                        {reporte.descripcion?.length > 50
                                            ? `${reporte.descripcion.substring(0, 50)}...`
                                            : reporte.descripcion}
                                    </td>
                                    <td>{reporte.categoria?.nombre || 'Sin categoría'}</td>
                                    <td>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            backgroundColor: reporte.estatus === 'resuelto' ? '#28a745' :
                                                reporte.estatus === 'en_proceso' ? '#F2C94C' : '#E63946',
                                            color: 'white'
                                        }}>
                                            {reporte.estatus || 'nuevo'}
                                        </span>
                                    </td>
                                    <td>{formatearFecha(reporte.created_at)}</td>
                                    <td>
                                        {reporte.multimedia?.[0]?.url && (
                                            <img
                                                src={reporte.multimedia[0].url}
                                                alt="reporte"
                                                style={{ width: '80px', objectFit: 'cover', borderRadius: '5px' }}
                                            />
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <button
                                                className={styles.btn}
                                                onClick={() => handleVerReporte(reporte)}
                                                style={{ backgroundColor: '#F4F4F4' }}
                                            >
                                                <FaEye /> Ver
                                            </button>
                                            <button
                                                className={styles.btn}
                                                onClick={() => handleEditarReporte(reporte)}
                                                style={{ backgroundColor: '#3BAE8C' }}
                                            >
                                                <FaEdit /> Editar
                                            </button>
                                            <select
                                                value={reporte.estatus || 'nuevo'}
                                                onChange={(e) => cambiarEstadoReporte(reporte.id, e.target.value)}
                                                style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    border: '1px solid #ddd',
                                                    backgroundColor: 'white',
                                                    fontSize: '12px',
                                                    cursor: 'pointer',
                                                    borderLeft: `4px solid ${obtenerColorMarcador(reporte)}`
                                                }}
                                            >
                                                <option value="nuevo">🆕 Nuevo</option>
                                                <option value="en_proceso">🔄 En Proceso</option>
                                                <option value="resuelto">✅ Resuelto</option>
                                                <option value="cerrado">🔒 Cerrado</option>
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Controles de paginación */}
                    <div className={styles.pagination}>
                        <button
                            disabled={paginaActual === 1}
                            onClick={() => setPaginaActual(paginaActual - 1)}
                        >
                            Anterior
                        </button>
                        <span>Página {paginaActual} de {totalPaginas}</span>
                        <button
                            disabled={paginaActual === totalPaginas}
                            onClick={() => setPaginaActual(paginaActual + 1)}
                        >
                            Siguiente
                        </button>
                    </div>
                </>
            )}

            {/* Modal de visualización */}
            {modalAbierto && reporteSeleccionado && (
                <div className={styles.overlay}>
                    <div className={styles.modal} style={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}>
                        <div className={styles.header}>
                            <button
                                type="button"
                                className={`close-btn ${styles.closebtn}`}
                                onClick={cerrarModal}
                            >
                                <FaTimes size={20} color="white" />
                            </button>
                            <h2 className={styles.titleModal}>Detalles del Reporte</h2>
                        </div>

                        <hr className={styles.hr} />

                        <div style={{ padding: '20px' }}>
                            {/* Información básica */}
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ color: '#333', marginBottom: '10px' }}>Información General</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div>
                                        <strong>Título:</strong> {reporteSeleccionado.titulo || 'Sin título'}
                                    </div>
                                    <div>
                                        <strong>Categoría:</strong> {reporteSeleccionado.categoria?.nombre || 'Sin categoría'}
                                    </div>
                                    <div>
                                        <strong>Estado:</strong>
                                        <span style={{
                                            marginLeft: '8px',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            backgroundColor: reporteSeleccionado.estatus === 'resuelto' ? '#28a745' :
                                                reporteSeleccionado.estatus === 'en_proceso' ? '#F2C94C' : '#E63946',
                                            color: 'white'
                                        }}>
                                            {reporteSeleccionado.estatus || 'nuevo'}
                                        </span>
                                    </div>
                                    <div>
                                        <strong>Prioridad:</strong> {reporteSeleccionado.prioridad || 'No especificada'}
                                    </div>
                                    <div>
                                        <strong>Fecha de creación:</strong> {formatearFecha(reporteSeleccionado.created_at)}
                                    </div>

                                </div>
                            </div>

                            {/* Descripción */}
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ marginBottom: '10px' }}>Descripción</h3>
                                <p style={{ lineHeight: '1.6' }}>
                                    {reporteSeleccionado.descripcion || 'Sin descripción'}
                                </p>
                            </div>

                            {/* Dirección */}
                            {reporteSeleccionado.direccion && (
                                <div style={{ marginBottom: '20px' }}>
                                    <h3 style={{ marginBottom: '10px' }}>Ubicación</h3>
                                    <p >{reporteSeleccionado.direccion}</p>
                                </div>
                            )}

                            {/* Mapa */}
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ color: '#333', marginBottom: '10px' }}>Ubicación en el mapa</h3>
                                <div style={{ height: '200px', borderRadius: '8px', overflow: 'hidden' }}>
                                    <Map
                                        longitude={parseFloat(reporteSeleccionado.longitud) || -99.1332}
                                        latitude={parseFloat(reporteSeleccionado.latitud) || 19.4326}
                                        zoom={15}
                                        style={{ width: "100%", height: "100%" }}
                                        mapStyle="mapbox://styles/sergio116/cme6j20dn00z501s7ed5lbeyu"
                                        mapboxAccessToken={TOKEN}
                                    >
                                        <CustomMarker
                                            longitude={parseFloat(reporteSeleccionado.longitud)}
                                            latitude={parseFloat(reporteSeleccionado.latitud)}
                                            color={obtenerColorMarcador(reporteSeleccionado)}
                                            imgSrc={reporteSeleccionado.multimedia?.[0]?.url || 'https://via.placeholder.com/40'}
                                        />
                                    </Map>
                                </div>
                            </div>

                            {/* Imágenes */}
                            {reporteSeleccionado.multimedia && reporteSeleccionado.multimedia.length > 0 && (
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                        {reporteSeleccionado.multimedia.map((media, index) => (
                                            <img
                                                key={index}
                                                src={media.url}
                                                alt={`Imagen ${index + 1}`}
                                                style={{
                                                    width: '100px',
                                                    height: '50px',
                                                    objectFit: 'cover',
                                                    borderRadius: '8px',
                                                    border: '2px solid #ddd'
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Información adicional */}
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>


                                    <div>
                                        <strong>Reportado por:</strong> {reporteSeleccionado.usuario?.nombre || 'Usuario anónimo'}
                                    </div>


                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de edición usando el componente existente */}
            {modalEdicionAbierto && reporteEnEdicion && (
                <div className={styles.overlay}>
                    <div className={styles.modal} style={{ maxWidth: '900px', maxHeight: '95vh', overflow: 'auto' }}>
                        <div className={styles.header}>
                            <button
                                type="button"
                                className={`close-btn ${styles.closebtn}`}
                                onClick={cerrarModalEdicion}
                            >
                                <FaTimes size={20} color="white" />
                            </button>
                            <h2 className={styles.titleModal}>Editar Reporte (Admin)</h2>
                        </div>

                        <hr className={styles.hr} />

                        <div style={{ padding: '20px' }}>
                            {/* Formulario de actualización reutilizado */}
                            <FormularioActualizarReporte
                                categorias={categorias}
                                reporte={reporteEnEdicion}
                                titulo={titulo}
                                setTitulo={setTitulo}
                                descripcion={descripcion}
                                setDescripcion={setDescripcion}
                                categoriaSeleccionada={categoriaSeleccionada}
                                setCategoriaSeleccionada={setCategoriaSeleccionada}
                                ubicacion={ubicacion}
                                handleUbicacionChange={(campo, valor) => {
                                    setUbicacion(prev => {
                                        const nuevaUbicacion = { ...prev, [campo]: valor };
                                        setMarkers([{
                                            id: reporteEnEdicion.id,
                                            longitude: nuevaUbicacion.lng,
                                            latitude: nuevaUbicacion.lat,
                                            imgSrc: reporteEnEdicion.multimedia?.[0]?.url || 'https://via.placeholder.com/40',
                                            color: '#E63946'
                                        }]);
                                        return nuevaUbicacion;
                                    });
                                }}
                                handleImageChange={handleImageChange}
                                actualizarReporte={actualizarReporte}
                                onClose={cerrarModalEdicion}
                                TOKEN={TOKEN}
                                modalMapView={modalMapView}
                                setModalMapView={setModalMapView}
                                markers={markers}
                                setMarkers={setMarkers}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}