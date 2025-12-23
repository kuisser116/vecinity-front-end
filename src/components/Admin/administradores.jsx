import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { url } from '../../utils/base.url';
import { Toaster, toast } from 'sonner'
import styles from '../../assets/styles/user/reportes.module.css';
import { FaEye, FaTimes } from 'react-icons/fa';
import Navbar from '../components/navar';
import NavbarA from '../components/navbarAdmin';
import NavbarS from '../components/navbarS';

export default function Reportes() {
    const [reportes, setReportes] = useState([]);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modalRegistrar, setModalRegistrar] = useState(false);
    const [nuevoUsuario, setNuevoUsuario] = useState({
        nombre: '',
        calle: '',
        numero: '',
        email: '',
        whatsapp: '',
        password: '',
        role: 'admin_general'
    });
    const [paginaActual, setPaginaActual] = useState(1);
    const reportesPorPagina = 10;
    const role = localStorage.getItem('role');

    useEffect(() => {
        const fetchReportes = async () => {
            try {
                const response = await axios.get(`${url}/api/users`);
                setReportes(response.data.data);
                toast.success('Administradores cargados correctamente');
            } catch (error) {
                console.error('Error al obtener reportes:', error);
            }
        };
        fetchReportes();
    }, []);

    const registrarUsuario = async () => {
        try {
            // Ruta específica para registrar administradores
            const response = await axios.post(
                `${url}/api/auth/register-admin`,
                nuevoUsuario,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}` // Asegúrate de enviar token
                    }
                }
            );

            toast.success('Administrador registrado con éxito');
            setModalRegistrar(false);
            setNuevoUsuario({
                nombre: '',
                calle: '',
                numero: '',
                email: '',
                whatsapp: '',
                password: '',
                role: 'admin_general'
            });
            setReportes([...reportes, response.data.user]);
            window.location.reload();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error al registrar administrador');
        }
    };


    const indexOfLastReporte = paginaActual * reportesPorPagina;
    const indexOfFirstReporte = indexOfLastReporte - reportesPorPagina;
    const reportesActuales = reportes.slice(indexOfFirstReporte, indexOfLastReporte);
    const totalPaginas = Math.ceil(reportes.length / reportesPorPagina);

    return (
        <div className={styles.container}>

            {role === 'superadmin' ? <NavbarS /> : role === 'admin_general' ? <NavbarA /> : <Navbar />}
            <h2>Administradores</h2>

            {role === 'superadmin' && (
                <button className={styles.crearUser} onClick={() => setModalRegistrar(true)}>Registrar Usuario</button>
            )}

            {reportes.length === 0 ? (
                <p>No hay administradores disponibles.</p>
            ) : (
                <>
                    <table className={styles.tabla}>
                        <thead>
                            <tr className={styles.encabezado}>
                                <th>Nombre</th>
                                <th>Correo</th>
                                <th>Whatsapp</th>
                                <th>Rol</th>
                                <th>Creacion</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportesActuales.map((reporte) => (
                                <tr key={reporte.id}>
                                    <td style={{ padding: '15px' }}>{reporte.nombre || 'Sin título'}</td>
                                    <td style={{ padding: '15px' }}>{reporte.email || 'Sin título'}</td>
                                    <td style={{ padding: '15px' }}>{reporte.whatsapp || 'Sin título'}</td>
                                    <td style={{ padding: '15px' }}>{reporte.role || 'Sin título'}</td>
                                    <td style={{ padding: '15px' }}>{new Date(reporte.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className={styles.pagination}>
                        <button disabled={paginaActual === 1} onClick={() => setPaginaActual(paginaActual - 1)}>Anterior</button>
                        <span>Página {paginaActual} de {totalPaginas}</span>
                        <button disabled={paginaActual === totalPaginas} onClick={() => setPaginaActual(paginaActual + 1)}>Siguiente</button>
                    </div>
                </>
            )}

            {/* Modal registrar usuario */}
            {modalRegistrar && (
                <div className={styles.overlay}>
                    <div className={styles.modalA} style={{ maxWidth: '500px' }}>
                        <div className={styles.headerA}>
                            <button className={`close-btn ${styles.closebtn}`} onClick={() => setModalRegistrar(false)}>
                                <FaTimes size={20} color="white" />
                            </button>
                            <h2 className={styles.titleModal}>Registrar Usuario</h2>
                        </div>

                        <hr className={styles.hr} />

                        <div className={styles.formA} style={{ padding: '20px', display: 'grid', gap: '10px' }}>
                            <input className={styles.inputA} placeholder="Nombre" value={nuevoUsuario.nombre} onChange={e => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })} />
                            <input className={styles.inputA} placeholder="Calle" value={nuevoUsuario.calle} onChange={e => setNuevoUsuario({ ...nuevoUsuario, calle: e.target.value })} />
                            <input className={styles.inputA} placeholder="Número" value={nuevoUsuario.numero} onChange={e => setNuevoUsuario({ ...nuevoUsuario, numero: e.target.value })} />
                            <input className={styles.inputA} placeholder="Correo" type="email" value={nuevoUsuario.email} onChange={e => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })} />
                            <input className={styles.inputA} placeholder="Whatsapp" value={nuevoUsuario.whatsapp} onChange={e => setNuevoUsuario({ ...nuevoUsuario, whatsapp: e.target.value })} />
                            <input className={styles.inputA} placeholder="Contraseña" type="password" value={nuevoUsuario.password} onChange={e => setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })} />

                            {/* Campo oculto para rol */}
                            <input type="hidden" value="admin_general" />

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button className={styles.btnCancel} onClick={() => setModalRegistrar(false)} style={{ background: '#F4F4F4', color: 'black' }}>Cancelar</button>
                                <button className={styles.btnPrimary} onClick={registrarUsuario} style={{ background: '#3BAE8C', color: 'white' }}>Registrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
