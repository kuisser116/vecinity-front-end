    import Map from "react-map-gl";
    import { FaTimes } from "react-icons/fa";
    import CustomMarker from "./customMaker";
    import styles from "../../assets/styles/user/user.module.css";
    import { useState, useEffect, useRef } from "react";
import { Toaster, toast } from 'sonner'

    export default function FormularioReporte({
    categorias,
    categoriaSeleccionada,
    setCategoriaSeleccionada,
    titulo,
    setTitulo,
    ubicacion,
    handleUbicacionChange,
    modalMapView,
    setModalMapView,
    handleClick,
    markers,
    handleImageChange,
    envioReporte,
    onClose,
    TOKEN,
    }) {
    const [busqueda, setBusqueda] = useState("");
    const [sugerenciasVisibles, setSugerenciasVisibles] = useState(false);
    const [imagenesPreview, setImagenesPreview] = useState([]);

    // Función para normalizar texto (quita acentos y lo pasa a lowercase)
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

    // Ref para detectar click fuera
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

    // Manejo de imágenes con preview
    const handleImageChangeWithPreview = (e) => {
        const files = Array.from(e.target.files);
        setImagenesPreview(files.map((file) => URL.createObjectURL(file)));
        handleImageChange(e); // mantiene tu lógica original
    };

    // ✅ Validaciones completas
    const validarFormulario = () => {
        // Validar título
            if (!titulo.trim()) {
                toast.error("El título es obligatorio");
            return false;
        }

        // Validar descripción
        const descripcion = document.querySelector(`.${styles.descriptionInput}`).value;
            if (!descripcion.trim()) {
                toast.error("La descripción es obligatoria");
            return false;
        }

        // Validar categoría
            if (!categoriaSeleccionada) {
                toast.error("Debes seleccionar una categoría");
            return false;
        }

        // Validar ubicación en el mapa
            if (!ubicacion.lat || !ubicacion.lng) {
                toast.error("Debes seleccionar una ubicación en el mapa");
            return false;
        }

        // Validar campos de dirección
        const { calle, colonia, ciudad, estado, cp } = ubicacion;
            if (!calle.trim() || !colonia.trim() || !ciudad.trim() || !estado.trim() || !cp.trim()) {
                toast.error("Todos los campos de dirección son obligatorios");
            return false;
        }

 
        return true;
    };

    return (
        <div className={styles.modal}>
        <form onSubmit={(e) => {
            e.preventDefault();
            if (validarFormulario()) {
                envioReporte(e);
            }
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
                onClick={handleClick}
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
            {ubicacion.calle && (
            <div className={styles.ubicacionText}>
                <label>Calle:</label>
                <input
                type="text"
                value={ubicacion.calle}
                onChange={(e) => handleUbicacionChange("calle", e.target.value)}
                />
                <label>Colonia:</label>
                <input
                type="text"
                value={ubicacion.colonia}
                onChange={(e) => handleUbicacionChange("colonia", e.target.value)}
                />
                <label>Ciudad:</label>
                <input
                type="text"
                value={ubicacion.ciudad}
                onChange={(e) => handleUbicacionChange("ciudad", e.target.value)}
                />
                <label>Estado:</label>
                <input
                type="text"
                value={ubicacion.estado}
                onChange={(e) => handleUbicacionChange("estado", e.target.value)}
                />
                <label>CP:</label>
                <input
                type="text"
                value={ubicacion.cp}
                onChange={(e) => handleUbicacionChange("cp", e.target.value)}
                />
            </div>
            )}

            {/* Imagen */}
            <h3 className={styles.imagenText}>Imagen del lugar: obligatoria</h3>
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
            <button className={styles.btnEnviar}>Enviar reporte</button>
        </form>
        </div>
    );
    }
