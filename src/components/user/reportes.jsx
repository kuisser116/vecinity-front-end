import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'sonner'
import { url } from '../../utils/base.url';
import styles from '../../assets/styles/user/reportes.module.css';
import { FaEye, FaTimes } from 'react-icons/fa';
import { obtenerColorMarcador } from '../../utils/markerColors';
import Navbar from '../components/navar';
import NavbarV from '../components/navbarV.jsx';
import Map from 'react-map-gl';
import CustomMarker from '../components/customMaker';

export default function Reportes() {
    const [reportes, setReportes] = useState([]);
    const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [paginaActual, setPaginaActual] = useState(1);
    const reportesPorPagina = 10;

    const TOKEN = 'pk.eyJ1Ijoic2VyZ2lvMTE2IiwiYSI6ImNtZTZpdW5vcTBrcXAya25kcDZsbXNzaG4ifQ.MV0myv_YmAZm8swvJRyoAQ';

    const token = localStorage.getItem('token');

    // Obtener todos los reportes
    useEffect(() => {
        const fetchReportes = async () => {
            try {
                const response = await axios.get(`${url}/api/reports`);
                setReportes(response.data.data);
                toast.success('Reportes cargados correctamente');
            } catch (error) {
                console.error('Error al obtener reportes:', error);
            }
        };
        fetchReportes();
    }, []);

    const handleVerReporte = (reporte) => {
        setReporteSeleccionado(reporte);
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setReporteSeleccionado(null);
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



    return (
        <div className={styles.container}>
                        <Toaster position="top-center" richColors />

            {token ? <Navbar/> : <NavbarV/>}
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
                                <tr key={reporte.id}>
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
                                                style={{ width: '80px',  objectFit: 'cover', borderRadius: '5px' }} 
                                            />
                                        )}
                                    </td>
                                    <td>
                                        <button 
                                            className={styles.btn}
                                            onClick={() => handleVerReporte(reporte)}
                                        >
                                            <FaEye /> Ver
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
                                <h3 style={{  marginBottom: '10px' }}>Descripción</h3>
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
                                    {/*<div>
                                        <strong>Votos:</strong> {typeof reporteSeleccionado.votos === 'object' ? reporteSeleccionado.votos?.positivos || 0 : reporteSeleccionado.votos || 0}
                                    </div>*/}


                                </div>
                            </div>


                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}