import { FaTimes } from "react-icons/fa";
import styles from "../../assets/styles/user/user.module.css";
import { useState, useEffect, useRef, useMemo } from "react";
import Map from "react-map-gl";
import CustomMarker from "./customMaker";
import MapboxClient from '@mapbox/mapbox-sdk/services/geocoding';
import { obtenerColorMarcador } from '../../utils/markerColors';
import { Toaster, toast } from 'sonner'

export default function FormularioActualizarReporte({
    categorias,
    reporte,
    titulo,
    setTitulo,
    descripcion,
    setDescripcion,
    setCategoriaSeleccionada,
    ubicacion,
    handleUbicacionChange,
    modalMapView,
    setModalMapView,
    markers,
    setMarkers,
    handleImageChange,
    actualizarReporte,
    onClose,
    TOKEN,
}) {
    const geocodingClient = useMemo(() => MapboxClient({ accessToken: TOKEN }), [TOKEN]);
    const [busqueda, setBusqueda] = useState(reporte.categoria?.nombre || "");
    const [sugerenciasVisibles, setSugerenciasVisibles] = useState(false);
    const [imagenesPreview, setImagenesPreview] = useState([]);

    const normalizarTexto = (texto) =>
        texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const categoriasFiltradas = categorias.filter((cat) =>
        normalizarTexto(cat.nombre).includes(normalizarTexto(busqueda))
    );

    const seleccionarCategoria = (cat) => {
        setCategoriaSeleccionada(cat.id);
        setBusqueda(cat.nombre);
        setSugerenciasVisibles(false);
    };

    const wrapperRef = useRef(null);

    useEffect(() => {
        function manejarClickFuera(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setSugerenciasVisibles(false);
            }
        }
        document.addEventListener("mousedown", manejarClickFuera);
        return () => {
            document.removeEventListener("mousedown", manejarClickFuera);
        };
    }, []);

    const handleImageChangeWithPreview = (e) => {
        const files = Array.from(e.target.files);
        setImagenesPreview(files.map((file) => URL.createObjectURL(file)));
        handleImageChange(e);
    };

    const actualizarDesdeDireccion = async (direccionParcial) => {
        try {
            const partes = [
                direccionParcial.calle,
                direccionParcial.colonia,
                direccionParcial.ciudad,
                direccionParcial.estado,
                direccionParcial.cp,
            ].filter(Boolean);
            if (partes.length === 0) return;
            const query = partes.join(', ');
            const resp = await geocodingClient.forwardGeocode({ query, limit: 1 }).send();
            if (resp.body.features && resp.body.features.length > 0) {
                const [lng, lat] = resp.body.features[0].center;
                handleUbicacionChange('lng', lng);
                handleUbicacionChange('lat', lat);
                setMarkers([{
                    id: reporte.id,
                    longitude: lng,
                    latitude: lat,
                    imgSrc: reporte.multimedia?.[0]?.url || 'https://via.placeholder.com/40',
                    color: '#E63946'
                }]);
            }
        } catch (error) {
            console.error('Error geocodificando dirección:', error);
        }
    };

    // ✅ Validación de campos de dirección
    const camposDireccionValidos = () => {
        const { calle, colonia, ciudad, estado, cp } = ubicacion;
        return calle.trim() && colonia.trim() && ciudad.trim() && estado.trim() && cp.trim();
    };

    return (
        <div className={styles.modal}>
            <form onSubmit={(e) => {
                if (!camposDireccionValidos()) {
                    e.preventDefault();
                    alert("Todos los campos de dirección son obligatorios");
                    return;
                }
                actualizarReporte(e);
            }}>
                <div className={styles.header}>
                    <button
                        type="button"
                        className={`close-btn ${styles.closebtn}`}
                        onClick={onClose}
                    >
                        <FaTimes size={20} color="white" />
                    </button>
                    <h2 className={styles.titleModal}>Reporte urbano</h2>
                    <input
                    className={styles.tituloR}
                    type="text"
                    placeholder="Título del reporte"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                />
                </div>

                <hr className={styles.hr} />

                {/* Título */}
                

                {/* Descripción */}
                <h3 className={styles.description}>Descripción del problema</h3>
                <textarea
                    className={styles.descriptionInput}
                    type="text"
                    placeholder="Descripción"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                />

                {/* Categorías con buscador */}
                <div ref={wrapperRef}>
                    <input
                        type="text"
                        placeholder="Buscar tema..."
                        value={busqueda}
                        onChange={(e) => {
                            setBusqueda(e.target.value);
                            setSugerenciasVisibles(true);
                        }}
                        onFocus={() => setSugerenciasVisibles(true)}
                        className={styles.searchInput}
                    />
                    {sugerenciasVisibles && categoriasFiltradas.length > 0 && (
                        <ul className={styles.suggestionsList}>
                            {categoriasFiltradas.map((cat) => (
                                <li
                                    key={cat.id}
                                    className={styles.suggestionItem}
                                    style={{ padding: "8px", cursor: "pointer" }}
                                    onClick={() => seleccionarCategoria(cat)}
                                >
                                    {cat.nombre}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Mapa de ubicación */}
                <h3 className={styles.ubicacion}>Ubicación del problema</h3>
                <div className={styles.mapContainer}>
                    <Map
                        {...modalMapView}
                        onMove={(evt) => setModalMapView(evt.viewState)}
                        onClick={async (e) => {
                            let lng, lat;
                            if (e.lngLat && typeof e.lngLat === 'object' && 'lng' in e.lngLat) {
                                lng = e.lngLat.lng;
                                lat = e.lngLat.lat;
                            } else if (Array.isArray(e.lngLat)) {
                                [lng, lat] = e.lngLat;
                            }

                            handleUbicacionChange('lng', lng);
                            handleUbicacionChange('lat', lat);


                            setMarkers([{
                                id: reporte.id,
                                longitude: lng,
                                latitude: lat,
                                imgSrc: reporte.multimedia?.[0]?.url || 'https://via.placeholder.com/40',
                                color: obtenerColorMarcador(reporte)
                            }]);

                            try {
                                const response = await geocodingClient.reverseGeocode({ query: [lng, lat], limit: 1 }).send();
                                if (response.body.features.length > 0) {
                                    const place = response.body.features[0];
                                    const calle = place.text;
                                    const colonia = place.context?.find(c => c.id.includes('neighborhood'))?.text || '';
                                    const ciudad = place.context?.find(c => c.id.includes('place'))?.text || '';
                                    const estado = place.context?.find(c => c.id.includes('region'))?.text || '';
                                    const cp = place.context?.find(c => c.id.includes('postcode'))?.text || '';

                                    handleUbicacionChange('calle', calle);
                                    handleUbicacionChange('colonia', colonia);
                                    handleUbicacionChange('ciudad', ciudad);
                                    handleUbicacionChange('estado', estado);
                                    handleUbicacionChange('cp', cp);
                                }
                            } catch (error) {
                                console.error('Error obteniendo ubicación:', error);
                            }
                        }}
                        style={{ width: "100%", height: "100%" }}
                        mapStyle="mapbox://styles/sergio116/cme6j20dn00z501s7ed5lbeyu"
                        mapboxAccessToken={TOKEN}
                    >
                        {markers.map(({ id, longitude, latitude, color, imgSrc }) => (
                            <CustomMarker
                                key={id}
                                longitude={longitude}
                                latitude={latitude}
                                color={color}
                                imgSrc={imgSrc}
                            />
                        ))}
                    </Map>
                </div>

                {/* Dirección */}
                <div className={styles.ubicacionText}>
                    <label>Calle:</label>
                    <input
                        type="text"
                        value={ubicacion.calle || ""}
                        onChange={(e) => {
                            const value = e.target.value;
                            handleUbicacionChange("calle", value);
                        }}
                    />
                    <label>Colonia:</label>
                    <input
                        type="text"
                        value={ubicacion.colonia || ""}
                        onChange={(e) => {
                            const value = e.target.value;
                            handleUbicacionChange("colonia", value);
                        }}
                    />
                    <label>Ciudad:</label>
                    <input
                        type="text"
                        value={ubicacion.ciudad || ""}
                        onChange={(e) => {
                            const value = e.target.value;
                            handleUbicacionChange("ciudad", value);
                        }}
                    />
                    <label>Estado:</label>
                    <input
                        type="text"
                        value={ubicacion.estado || ""}
                        onChange={(e) => handleUbicacionChange("estado", e.target.value)}
                    />
                    <label>CP:</label>
                    <input
                        type="text"
                        value={ubicacion.cp || ""}
                        onChange={(e) => {
                            const value = e.target.value;
                            handleUbicacionChange("cp", value);

                        }}
                    />
                </div>

                {/* Imagen */}
                <h3 className={styles.imagenText}>Imagen del lugar: opcional</h3>
                <input
                    className={styles.imagenInput}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChangeWithPreview}
                />

                {/* Contenedor de previews */}
                {imagenesPreview.length > 0 && (
                    <div className={styles.previewContainer}>
                        {imagenesPreview.slice(0, 1).map((src, idx) => (
                            <img
                                key={idx}
                                src={src}
                                alt={`preview-${idx}`}
                                className={styles.previewImage}
                            />
                        ))}
                    </div>
                )}

                {/* Botón */}
                <button 
                    className={styles.btnEnviar} 
                    disabled={!camposDireccionValidos()}
                >
                    Enviar reporte
                </button>
            </form>
        </div>
    );
}
