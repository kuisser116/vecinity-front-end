import 'react';
import { Toaster, toast } from 'sonner'
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { url } from '../../utils/base.url';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from '../../assets/styles/user/user.module.css';
import { FaTimes, FaArrowLeft } from 'react-icons/fa';
import MapboxClient from '@mapbox/mapbox-sdk/services/geocoding';
import Map, { Marker, Popup } from 'react-map-gl';
import CustomMarker from '../components/customMaker';
import FormularioReporte from '../components/formularioReporte';
import FormularioActualizarReporte from '../components/actualizarReporte';
import MapaPrincipal from '../components/mapaPrincipal';
import Navbar from '../components/navar';
import NavbarA from '../components/navbarAdmin';
import NavbarS from '../components/navbarS';
import ModalReporte from '../components/modalReporte';
import { obtenerColorMarcador } from '../../utils/markerColors';

export default function Home() {
    const TOKEN = 'pk.eyJ1Ijoic2VyZ2lvMTE2IiwiYSI6ImNtZTZpdW5vcTBrcXAya25kcDZsbXNzaG4ifQ.MV0myv_YmAZm8swvJRyoAQ';
    const colores = {
        verde: '#28a745',
        amarillo: '#F2C94C',
        rojo: '#E63946'
    };

    const geocodingClient = MapboxClient({ accessToken: TOKEN });
    const navigate = useNavigate();
    const [abrirModal, setAbrirModal] = useState(false);
    const [imagenes, setImagenes] = useState([]);
    const [markers, setMarkers] = useState([]);
    const [colorSeleccionado, setColorSeleccionado] = useState('rojo');
    const [categorias, setCategorias] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
    const [titulo, setTitulo] = useState('');
    const [reportes, setReportes] = useState([]);
    const [popupInfo, setPopupInfo] = useState(null);
    const [abrirActualizar, setAbrirActualizar] = useState(false);
    const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
    const [modalReporteAbierto, setModalReporteAbierto] = useState(false);
    const [reporteParaEditar, setReporteParaEditar] = useState(null);

    const [ubicacion, setUbicacion] = useState({
        calle: '', colonia: '', ciudad: '', estado: '', cp: '', lng: null, lat: null
    });

    const [mainMapView, setMainMapView] = useState({
        longitude: -99.1332,
        latitude: 19.4326,
        zoom: 13,
    });

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const response = await axios.get(`${url}/api/categories`);
                const dataCategorias = response.data.data;
                setCategorias(dataCategorias);
                toast.success('Categorías cargadas correctamente');
            } catch (error) {
                console.error(error);
            }
        };

        fetchCategorias();
    }, []);

    useEffect(() => {
        const fetchRepotes = async () => {
            try {
                const response = await axios.get(`${url}/api/reports`);
                const reportes = response.data.data;
                setReportes(reportes);
                toast.success('Reportes cargados correctamente');
                console.log(reportes);
            } catch (error) {
                console.error('Error fetching reports:', error);
                if (error.response) {
                    console.error('Server Error Data:', error.response.data);
                }
            }
        };
        fetchRepotes();
    }, []);



    useEffect(() => {
        const nuevosMarkers = reportes.map((rep) => ({
            id: rep.id,
            longitude: rep.longitud,
            latitude: rep.latitud,
            color: obtenerColorMarcador(rep),
            imgSrc: rep.multimedia?.[0]?.url || 'https://via.placeholder.com/40',
            titulo: rep.titulo,
            descripcion: rep.descripcion,
            reporte: rep, // Agregar el reporte completo
        }));

        setMarkers(nuevosMarkers);
    }, [reportes]);

    const [modalMapView, setModalMapView] = useState({
        longitude: -99.1332,
        latitude: 19.4326,
        zoom: 13,
    });

    const handleClick = async (event) => {
        let lng, lat;
        if (event.lngLat && typeof event.lngLat === 'object' && 'lng' in event.lngLat) {
            lng = event.lngLat.lng;
            lat = event.lngLat.lat;
        } else if (Array.isArray(event.lngLat)) {
            [lng, lat] = event.lngLat;
        }

        setMarkers([
            {
                id: Date.now(),
                longitude: lng,
                latitude: lat,
                color: colores[colorSeleccionado],
                imgSrc: 'https://via.placeholder.com/40',
            },
        ]);

        try {
            const response = await geocodingClient.reverseGeocode({ query: [lng, lat], limit: 1 }).send();
            if (response.body.features.length > 0) {
                const place = response.body.features[0];
                const calle = place.text;
                const colonia = place.context?.find(c => c.id.includes('neighborhood'))?.text || '';
                const ciudad = place.context?.find(c => c.id.includes('place'))?.text || '';
                const estado = place.context?.find(c => c.id.includes('region'))?.text || '';
                const cp = place.context?.find(c => c.id.includes('postcode'))?.text || '';

                setUbicacion({ calle, colonia, ciudad, estado, cp, lng, lat });
            }
        } catch (error) {
            console.error('Error obteniendo ubicación:', error);
        }
    };

    const handleUbicacionChange = (campo, valor) => {
        setUbicacion(prev => ({ ...prev, [campo]: valor }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImagenes(files);
    };

    const envioReporte = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('titulo', titulo);

        // 👉 Construcción de dirección con comas y sin vacíos
        const direccionPartes = [
            ubicacion.calle,
            ubicacion.colonia,
            ubicacion.ciudad,
            ubicacion.estado,
            ubicacion.cp
        ].filter(Boolean); // elimina undefined, null o ''

        const direccionCompleta = direccionPartes.join(', ');
        formData.append('direccion', direccionCompleta);

        formData.append('descripcion', document.querySelector(`.${styles.descriptionInput}`).value);
        formData.append('categoria_id', categoriaSeleccionada);
        formData.append('latitud', ubicacion.lat);
        formData.append('longitud', ubicacion.lng);

        formData.append('prioridad', 'alta');
        formData.append('is_publico', true);

        if (imagenes.length > 0) {
            imagenes.forEach(file => formData.append('files', file));
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${url}/api/reports`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Reporte enviado:', response.data);
            toast.success('Reporte enviado correctamente');
            setAbrirModal(false);
            window.location.reload();
        } catch (error) {
            console.error('Error enviando reporte:', error.response?.data || error);
            toast.error('Error al enviar el reporte');
        }
    };

    const handleMarkerClick = (marker) => {
        setReporteParaEditar(marker.reporte);
        setModalReporteAbierto(true);
    };

    const cerrarModalReporte = () => {
        setModalReporteAbierto(false);
        setReporteParaEditar(null);
    };

    const handleEditarReporte = () => {
        const role = localStorage.getItem('role');

        if (role === 'admin_general' || role === 'superadmin') {
            // Para administradores, ir directamente a reportesAdmin.jsx
            localStorage.setItem('reporteParaEditar', reporteParaEditar.id);
            setModalReporteAbierto(false);
            setReporteParaEditar(null);
            navigate('/reportesAdmin');
        } else {
            // Para usuarios normales, ir a misReportes.jsx
            localStorage.setItem('reporteParaEditar', reporteParaEditar.id);
            setModalReporteAbierto(false);
            setReporteParaEditar(null);
            navigate('/misReportes');
        }
    };

    const cerrar = () => {
        setAbrirModal(false);
        window.location.reload();
    }

    const role = localStorage.getItem('role');


    return (
        <>
            <div className={styles.container} style={{ height: '100vh', width: '100%' }}>
                <Toaster position="top-center" richColors />

                {role === 'superadmin' ? <NavbarS /> : role === 'admin_general' ? <NavbarA /> : <Navbar />}
                <MapaPrincipal
                    mainMapView={mainMapView}
                    setMainMapView={setMainMapView}
                    markers={markers}
                    setPopupInfo={setPopupInfo}
                    TOKEN={TOKEN}
                    onMarkerClick={handleMarkerClick}
                />

                <button className={styles.btn} onClick={() => setAbrirModal(true)}>
                    Reportar falla
                </button>

                {abrirModal && (
                    <div className={styles.overlay}>
                        <FormularioReporte
                            categorias={categorias}
                            categoriaSeleccionada={categoriaSeleccionada}
                            setCategoriaSeleccionada={setCategoriaSeleccionada}
                            titulo={titulo}
                            setTitulo={setTitulo}
                            ubicacion={ubicacion}
                            handleUbicacionChange={handleUbicacionChange}
                            modalMapView={modalMapView}
                            setModalMapView={setModalMapView}
                            handleClick={handleClick}
                            markers={markers}
                            imagenes={imagenes}
                            handleImageChange={handleImageChange}
                            envioReporte={envioReporte}
                            onClose={cerrar}
                            TOKEN={TOKEN}
                        />
                    </div>
                )}

                {/* Modal de reporte con botón editar */}
                {modalReporteAbierto && reporteParaEditar && (
                    <ModalReporte
                        reporte={reporteParaEditar}
                        onClose={cerrarModalReporte}
                        onEdit={handleEditarReporte}
                    />
                )}
            </div>
        </>
    );
}


