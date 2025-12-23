import React, { useState } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import styles from '../../assets/styles/user/user.module.css';

export default function ModalReporte({ reporte, onClose, onEdit = null }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (!reporte) return null;

    const images = reporte.multimedia || [];
    const hasMultipleImages = images.length > 1;

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const userId = localStorage.getItem('userId');


    let user = null;

    try {
    const storedUser = localStorage.getItem('user');
    user = storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
    console.error("Error al parsear user desde localStorage:", error);
    user = null;
    }
    

    return (
        <div className={styles.overlay}>
            <div className={styles.modal} style={{ maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
                <div className={styles.header}>
                    <button
                        type="button"
                        className={`close-btn ${styles.closebtn}`}
                        onClick={onClose}
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
                                <strong>Título:</strong> {reporte.titulo || 'Sin título'}
                            </div>
                            <div>
                                <strong>Categoría:</strong> {reporte.categoria?.nombre || 'Sin categoría'}
                            </div>
                            <div>
                                <strong>Estado:</strong> 
                                <span style={{
                                    marginLeft: '8px',
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
                            </div>
                            <div>
                                <strong>Prioridad:</strong> {reporte.prioridad || 'No especificada'}
                            </div>
                            <div>
                                <strong>Fecha de creación:</strong> {formatearFecha(reporte.created_at)}
                            </div>
                            <div>
                                <strong>Folio:</strong> {reporte.folio || 'Sin folio'}
                            </div>
                        </div>
                    </div>

                    {/* Descripción */}
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{  marginBottom: '10px' }}>Descripción</h3>
                        <p style={{ lineHeight: '1.6'}}>
                            {reporte.descripcion || 'Sin descripción'}
                        </p>
                    </div>

                    {/* Dirección */}
                    {reporte.direccion && (
                        <div style={{ marginBottom: '20px' }}>
                            <h3 style={{  marginBottom: '10px' }}>Ubicación</h3>
                            <p >{reporte.direccion}</p>
                        </div>
                    )}

                    {/* Carrusel de imágenes */}
                    {images.length > 0 && (
                        <div style={{ marginBottom: '20px' }}>
                            <h3 style={{ color: '#333', marginBottom: '10px' }}>Imágenes</h3>
                            <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
                                <img
                                    src={images[currentImageIndex]?.url}
                                    alt={`Imagen ${currentImageIndex + 1}`}
                                    style={{
                                        width: '100%',
                                        height: '200px',
                                        objectFit: 'cover',
                                        display: 'block'
                                    }}
                                />
                                
                                {/* Controles del carrusel */}
                                {hasMultipleImages && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            style={{
                                                position: 'absolute',
                                                left: '10px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'rgba(0,0,0,0.7)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '40px',
                                                height: '40px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <FaChevronLeft />
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            style={{
                                                position: 'absolute',
                                                right: '10px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'rgba(0,0,0,0.7)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '40px',
                                                height: '40px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <FaChevronRight />
                                        </button>
                                        
                                        {/* Indicadores */}
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '10px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            display: 'flex',
                                            gap: '8px'
                                        }}>
                                            {images.map((_, index) => (
                                                <div
                                                    key={index}
                                                    style={{
                                                        width: '12px',
                                                        height: '12px',
                                                        borderRadius: '50%',
                                                        backgroundColor: index === currentImageIndex ? 'white' : 'rgba(255,255,255,0.5)',
                                                        cursor: 'pointer'
                                                    }}
                                                    onClick={() => setCurrentImageIndex(index)}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Información adicional */}
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ color: '#333', marginBottom: '10px' }}>Información Adicional</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div>
                                <strong>Reportado por:</strong> {reporte.usuario?.nombre || 'Usuario anónimo'}
                            </div>

                        </div>
                    </div>

                    {/* Botón de editar (solo si se proporciona la función) */}
                    {onEdit && user && (
                        (reporte.usuario?.id === user.id || user.role === 'admin_general' || user.role === 'superadmin') && (
                            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                                <button
                                    onClick={onEdit}
                                    className={styles.btn3}
                                >
                                    Editar Reporte
                                </button>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
