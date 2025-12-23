    import React, { useState, useEffect } from 'react';
    import 'mapbox-gl/dist/mapbox-gl.css';
    import styles from '../../assets/styles/invitadoS/mapV.module.css';
    import { Link } from 'react-router-dom';
    import MapaPrincipal from '../components/mapaPrincipal';
    import axios from 'axios';
    import { url } from '../../utils/base.url';
    import NavbarV from '../components/navbarV';
    import ModalReporte from '../components/modalReporte';
    import { obtenerColorMarcador } from '../../utils/markerColors';
    import { Toaster, toast } from 'sonner'


    export default function MapboxMap() {
    const TOKEN = 'pk.eyJ1Ijoic2VyZ2lvMTE2IiwiYSI6ImNtZTZpdW5vcTBrcXAya25kcDZsbXNzaG4ifQ.MV0myv_YmAZm8swvJRyoAQ';

    const colores = {
        verde: '#28a745',
        amarillo: '#F2C94C',
        rojo: '#E63946'
    };

    const [markers, setMarkers] = useState([]);
    const [popupInfo, setPopupInfo] = useState(null);
    const [reportes, setReportes] = useState([]);
    const [imagenes, setImagenes] = useState([]);
    const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
    const [modalAbierto, setModalAbierto] = useState(false);

    const [mainMapView, setMainMapView] = useState({
        longitude: -99.1332,
        latitude: 19.4326,
        zoom: 13,
    });

    useEffect(() => {
        const fetchReportes = async () => {
        try {
            const response = await axios.get(`${url}/api/reports`);
            const reportes = response.data.data;

            setReportes(reportes);

            const allImages = reportes.flatMap((reporte) =>
            (reporte.multimedia || []).map((media) => ({
                reporteId: reporte.id,
                url: media.url ? media.url.replace(/\\/g, "/") : null
            }))
            ).filter(img => img.url !== null);

            setImagenes(allImages);

        } catch (error) {
        }
        };

        fetchReportes();
    }, []);



    useEffect(() => {
        const nuevosMarkers = reportes.map((rep) => {
        const imagenDelReporte = imagenes.find(img => img.reporteId === rep.id)?.url || 'https://via.placeholder.com/40';
        return {
            id: rep.id,
            longitude: rep.longitud,
            latitude: rep.latitud,
            color: obtenerColorMarcador(rep),
            imgSrc: imagenDelReporte,
            titulo: rep.titulo,
            descripcion: rep.descripcion,
            reporte: rep, // Agregar el reporte completo
        };
        });
        setMarkers(nuevosMarkers);
    }, [reportes, imagenes]);

    const handleMarkerClick = (marker) => {
        setReporteSeleccionado(marker.reporte);
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setReporteSeleccionado(null);
    };

    return (
        <div className={styles.container} style={{ height: '100vh', width: '100%' }}>
                        <Toaster position="top-center" richColors />

            <NavbarV />
        <MapaPrincipal
            mainMapView={mainMapView}
            setMainMapView={setMainMapView}
            markers={markers}
            setPopupInfo={setPopupInfo}
            TOKEN={TOKEN}
            onMarkerClick={handleMarkerClick}
        />

        <Link to={'/login'} state={'/mapV'}>
            <button className={styles.btn}>Reportar falla</button>
        </Link>

        {/* Modal de reporte */}
        {modalAbierto && reporteSeleccionado && (
            <ModalReporte
                reporte={reporteSeleccionado}
                onClose={cerrarModal}
            />
        )}
        </div>
    );
    }
