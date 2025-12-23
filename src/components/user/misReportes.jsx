import React, { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner'
import axios from 'axios';
import { url } from '../../utils/base.url';
import styles from '../../assets/styles/user/misReportes.module.css';
import { FaEdit, FaTrash } from 'react-icons/fa';
import FormularioActualizarReporte from '../components/actualizarReporte';
import Navbar from '../components/navar';
import NavbarA from '../components/navbarAdmin';
import NavbarS from '../components/navbarS';



export default function MisReportes() {
    const [reportes, setReportes] = useState([]);
    const [abrirActualizar, setAbrirActualizar] = useState(false);
    const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
    const [imagenes, setImagenes] = useState([]);
    const [ubicacion, setUbicacion] = useState({
        calle: '', colonia: '', ciudad: '', estado: '', cp: '', lng: null, lat: null
    });
    const [descripcion, setDescripcion] = useState("");
    const [titulo, setTitulo] = useState("");


    // --- Estado del mapa ---
    const [modalMapView, setModalMapView] = useState({
        longitude: -99.1332,
        latitude: 19.4326,
        zoom: 13,
    });
    const [markers, setMarkers] = useState([]);

    const [paginaActual, setPaginaActual] = useState(1);
    const reportesPorPagina = 10;
    const [reporteDestacado, setReporteDestacado] = useState(null);

    const TOKEN = 'pk.eyJ1Ijoic2VyZ2lvMTE2IiwiYSI6ImNtZTZpdW5vcTBrcXAya25kcDZsbXNzaG4ifQ.MV0myv_YmAZm8swvJRyoAQ';

    // Obtener reportes del usuario
    useEffect(() => {
        const fetchReportes = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${url}/api/reports/user/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setReportes(response.data.data);
                toast.success('Reportes cargados correctamente');
            } catch (error) {
                console.error(error);
                toast.error('Error al cargar los reportes');
            }
        };
        fetchReportes();
    }, []);

    // Verificar si hay un reporte para destacar
    useEffect(() => {
        const reporteParaEditar = localStorage.getItem('reporteParaEditar');
        if (reporteParaEditar) {
            setReporteDestacado(parseInt(reporteParaEditar));
            localStorage.removeItem('reporteParaEditar');
            
            // Remover el destacado después de 3 segundos
            setTimeout(() => {
                setReporteDestacado(null);
            }, 3000);
        }
    }, []);

    // Obtener categorías
    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const response = await axios.get(`${url}/api/categories`);
                setCategorias(response.data.data);
                toast.success('Categorías cargadas correctamente');
            } catch (error) {
                console.error(error);
                toast.error('Error al cargar las categorías');
            }
        };
        fetchCategorias();
    }, []);

    const handleEliminar = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este reporte?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${url}/api/reports/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReportes(prev => prev.filter(r => r.id !== id));
            toast.success('Reporte eliminado correctamente');
        } catch (error) {
            console.error(error);
            toast.error('Error al eliminar el reporte');
        }
    };

    const handleActualizarClick = (reporte) => {
    setReporteSeleccionado(reporte);
    setCategoriaSeleccionada(reporte.categoria_id || '');
    setDescripcion(reporte.descripcion || '');
    setTitulo(reporte.titulo || '');

    // Parsear la dirección del reporte
    let calle = '', colonia = '', ciudad = '', estado = '', cp = '';

   if (reporte.direccion) {
        // 👉 Separa usando comas y limpia espacios
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

    setMarkers([{
        id: reporte.id,
        longitude: parseFloat(reporte.longitud),
        latitude: parseFloat(reporte.latitud),
        imgSrc: reporte.multimedia?.[0]?.url || 'https://via.placeholder.com/40',
        color: '#E63946'
    }]);

    setModalMapView({
        longitude: parseFloat(reporte.longitud) || -99.1332,
        latitude: parseFloat(reporte.latitud) || 19.4326,
        zoom: 15
    });

    setAbrirActualizar(true);
};


    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImagenes(files);
    };

    const actualizarReporte = async (event, id) => {
        event.preventDefault();
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
            await axios.put(`${url}/api/reports/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success("Reporte actualizado correctamente");
            setAbrirActualizar(false);
            window.location.reload();
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar el reporte");
        }
    };
    

    // --- Paginación ---
    const indexOfLastReporte = paginaActual * reportesPorPagina;
    const indexOfFirstReporte = indexOfLastReporte - reportesPorPagina;
    const reportesActuales = reportes.slice(indexOfFirstReporte, indexOfLastReporte);
    const totalPaginas = Math.ceil(reportes.length / reportesPorPagina);

    const role = localStorage.getItem('role');
    console.log(role);

    return (
        <div className={styles.container}>
                        <Toaster position="top-center" richColors />

            {role === 'superadmin' ? <NavbarS /> : role === 'admin_general' ? <NavbarA /> : <Navbar />}
            <h2>Mis Reportes</h2>

            {reportes.length === 0 ? (
                <p>No tienes reportes registrados.</p>
            ) : (
                <>
                    <table className={styles.tabla}>
                        <thead>
                            <tr className={styles.encabezado}>
                                <th>Título</th>
                                <th>Descripción</th>
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
                                        transition: 'background-color 0.3s ease',
                                        border: reporteDestacado === reporte.id ? '2px solid #ffc107' : 'none'
                                    }}
                                >
                                    <td>{reporte.titulo || 'Sin título'}</td>
                                    <td>{reporte.descripcion}</td>
                                    <td>
                                        {reporte.multimedia?.[0]?.url && (
                                            <img 
                                                src={reporte.multimedia[0].url} 
                                                alt="reporte" 
                                                style={{ width: '80px', borderRadius: '5px' }} 
                                            />
                                        )}
                                    </td>
                                    <td>
                                        <button 
                                            className={styles.btn}
                                            onClick={() => handleActualizarClick(reporte)}
                                        >
                                            <FaEdit /> Editar
                                        </button>
                                        <button 
                                            className={styles.btnEliminar}
                                            onClick={() => handleEliminar(reporte.id)}
                                        >
                                            <FaTrash /> Eliminar
                                        </button>
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

            {abrirActualizar && reporteSeleccionado && (
                <div className={styles.overlay}>
                <FormularioActualizarReporte
                        categorias={categorias}
                        reporte={reporteSeleccionado}
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
                                    id: reporteSeleccionado.id,
                                    longitude: nuevaUbicacion.lng,
                                    latitude: nuevaUbicacion.lat,
                                    imgSrc: reporteSeleccionado.multimedia?.[0]?.url || 'https://via.placeholder.com/40',
                                    color: '#E63946'
                                }]);
                                return nuevaUbicacion;
                            });
                        }}
                        handleImageChange={handleImageChange}
                        actualizarReporte={(e) => actualizarReporte(e, reporteSeleccionado.id)}
                        onClose={() => setAbrirActualizar(false)}
                        TOKEN={TOKEN}
                        modalMapView={modalMapView}
                        setModalMapView={setModalMapView}
                        markers={markers}
                        setMarkers={setMarkers} 
                    />

                </div>
            )}
        </div>
    );
}
