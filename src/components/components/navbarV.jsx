import 'react'
import styles from '../../assets/styles/components/navar.module.css'
import { Link, useNavigate } from 'react-router-dom';

export default function Navegacion() {
    const navigate = useNavigate()

    const mapa = () => {
        navigate('/mapV')
    }

    const Reportes = () => {
        navigate('/reportes')
    }

    const menu = () => {
        navigate('/')
    }


    return(
        <div className={styles.container}>
            <h3 onClick={menu}>Menu</h3>
            <h3 onClick={mapa}>Mapa</h3>
            <h3 onClick={Reportes}>Reportes de la comunidad</h3>

        </div>
    )
}
