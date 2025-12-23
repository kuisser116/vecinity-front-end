import React, { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner'
import axios from 'axios';
import { url } from '../../utils/base.url';
import styles from '../../assets/styles/user/reportes.module.css';
import { FaTimes } from 'react-icons/fa';
import Navbar from '../components/navar';
import NavbarA from '../components/navbarAdmin';
import NavbarS from '../components/navbarS';

export default function Categorias() {
    const [categorias, setCategorias] = useState([]);
    const [paginaActual, setPaginaActual] = useState(1);
    const categoriasPorPagina = 10;

    const [modalCrear, setModalCrear] = useState(false);
    const [nuevaCategoria, setNuevaCategoria] = useState({
        nombre: '',
        descripcion: ''
    });

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    // Obtener categorías
    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const response = await axios.get(`${url}/api/categories`);
                setCategorias(response.data.data);
                toast.success('Categorías cargadas correctamente');
            } catch (error) {
                console.error('Error al obtener categorías:', error);
            }
        };
        fetchCategorias();
    }, []);

    // Crear categoría
    const handleCrearCategoria = async () => {
        try {
            await axios.post(`${url}/api/categories`, nuevaCategoria, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Categoría creada correctamente');
            setModalCrear(false);
            setNuevaCategoria({ nombre: '', descripcion: '' });
            // refrescar
            const response = await axios.get(`${url}/api/categories`);
            setCategorias(response.data.data);
        } catch (error) {
            console.error('Error al crear categoría:', error);
            toast.error('Error al crear categoría');
        }
    };

    // Eliminar categoría
    const handleEliminarCategoria = async (id) => {
        try {
            await axios.delete(`${url}/api/categories/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Categoría eliminada correctamente');
            setCategorias(categorias.filter(cat => cat.id !== id));
            window.location.reload();
        } catch (error) {
            console.error('Error al eliminar categoría:', error);
            toast.error('Error al eliminar categoría');
        }
    };


    // Paginación
    const indexOfLast = paginaActual * categoriasPorPagina;
    const indexOfFirst = indexOfLast - categoriasPorPagina;
    const categoriasActuales = categorias.slice(indexOfFirst, indexOfLast);
    const totalPaginas = Math.ceil(categorias.length / categoriasPorPagina);

    // Formatear fecha
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

            {role === 'superadmin' ? <NavbarS /> : role === 'admin_general' ? <NavbarA /> : <Navbar />}
            <h2>Categorías</h2>

            {/* Botón crear categoría */}
            <button className={styles.crearCategoria} onClick={() => setModalCrear(true)} style={{ marginBottom: '15px' }}>
                Crear Categoría
            </button>

            {categorias.length === 0 ? (
                <p>No hay categorías disponibles.</p>
            ) : (
                <>
                    <table className={styles.tabla}>
                        <thead>
                            <tr className={styles.encabezado}>
                                <th>Título</th>
                                <th>Descripción</th>
                                <th>Creación</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categoriasActuales.map((cat) => (
                                <tr key={cat.id}>
                                    <td style={{ padding: '15px' }}>{cat.nombre}</td>
                                    <td style={{ padding: '15px' }}>{cat.descripcion}</td>
                                    <td style={{ padding: '15px' }}>{formatearFecha(cat.created_at)}</td>
                                    <td style={{ padding: '15px' }}>
                                        <button
                                            onClick={() => handleEliminarCategoria(cat.id, cat.nombre)}
                                            style={{ background: '#E63946', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}
                                        >
                                            <FaTimes /> Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Paginación */}
                    <div className={styles.pagination}>
                        <button disabled={paginaActual === 1} onClick={() => setPaginaActual(paginaActual - 1)}>Anterior</button>
                        <span>Página {paginaActual} de {totalPaginas}</span>
                        <button disabled={paginaActual === totalPaginas} onClick={() => setPaginaActual(paginaActual + 1)}>Siguiente</button>
                    </div>
                </>
            )}

            {/* Modal Crear Categoría */}
            {modalCrear && (
                <div className={styles.overlay}>
                    <div className={styles.modalC} style={{ maxWidth: '500px' }}>
                        <div className={styles.headerC}>
                            <button className={`close-btn ${styles.closebtn}`} onClick={() => setModalCrear(false)}>
                                <FaTimes size={20} color="white" />
                            </button>
                            <h2 className={styles.titleModal}>Crear Categoría</h2>
                        </div>

                        <hr className={styles.hr} />

                        <div className={styles.formA} style={{ padding: '20px', display: 'grid', gap: '10px' }}>
                            <input
                                className={styles.inputA}
                                placeholder="Nombre"
                                value={nuevaCategoria.nombre}
                                onChange={(e) => setNuevaCategoria({ ...nuevaCategoria, nombre: e.target.value })}
                            />
                            <textarea
                                className={styles.inputA}
                                placeholder="Descripción"
                                value={nuevaCategoria.descripcion}
                                onChange={(e) => setNuevaCategoria({ ...nuevaCategoria, descripcion: e.target.value })}
                                style={{ resize: 'none', height: '80px' }} // opcional para tamaño consistente
                            />

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', position: 'absolute', top: '80%', right: '20px' }}>
                                <button
                                    className={styles.btnCancel}
                                    onClick={() => setModalCrear(false)}
                                    style={{ background: '#F4F4F4', color: 'black' }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className={styles.btnPrimary}
                                    onClick={handleCrearCategoria}
                                    style={{ background: '#3BAE8C', color: 'white' }}
                                >
                                    Crear
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
