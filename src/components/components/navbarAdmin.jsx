import 'react'
import styles from '../../assets/styles/components/navar.module.css'
import { Link, useNavigate } from 'react-router-dom';

export default function Navegacion() {
    const navigate = useNavigate()

    const mapa = () => {
        navigate('/homeUser');
    }

    const misReportes = () => {
        navigate('/misReportes');
    }

    const reportes = () => {
        navigate('/reportesAdmin');
    }

    const cerrarSesion = () => {
        localStorage.removeItem('token');
        navigate('/');
    };



    return(
        <div className={styles.container}>
            <h3 onClick={mapa}>Mapa</h3>
            <h3 onClick={misReportes}>Mis reportes</h3>
            <h3 onClick={reportes}>Reportes de la comunidad</h3>
            <button className={styles.btn2} onClick={cerrarSesion}>Cerrar sesión</button>
        </div>
    )
}
