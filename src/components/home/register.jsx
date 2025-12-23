import 'react';
import { Toaster, toast } from 'sonner'
import { Link, Navigate, useNavigate } from 'react-router-dom';
import styles from '../../assets/styles/homeS/register.module.css'
import axios from 'axios';
import { url } from '../../utils/base.url';
import { useState } from 'react';


export default function Login() {

    const navigate = useNavigate();

    const [Data, setData] = useState({
        nombre: '',
        calle: '',
        numero: '',
        email: '',
        whatsapp: '',
        password: ''
    });

    const envio = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${url}/api/auth/register`, Data)
            setData({
                nombre: '',
                calle: '',
                numero: '',
                email: '',
                whatsapp: '',
                password: ''
            });
            toast.success('Registro exitoso');
            navigate('/login')
        } catch (error) {
            console.error(error.response?.data || error.message);
            toast.error('Error al registrar usuario');
        }
    }


    return (
        <div className={styles.container}>
            <Toaster position="top-center" richColors />

            <h1 className={styles.title}>SignUp</h1>
            <form className={styles.inputContainer} onSubmit={envio}>
                <input type="text" value={Data.nombre} className={styles.input} placeholder="Nombre Completo" onChange={(e) => setData({ ...Data, nombre: e.target.value })} />
                <input type="text" value={Data.email} className={styles.input} placeholder="Correo" onChange={(e) => setData({ ...Data, email: e.target.value })} />
                <input type="text" value={Data.calle} className={styles.input} placeholder="Calle" onChange={(e) => setData({ ...Data, calle: e.target.value })} />
                <input type="text" value={Data.numero} className={styles.input} placeholder="Numero de casa" onChange={(e) => setData({ ...Data, numero: e.target.value })} />
                <input type="text" value={Data.whatsapp} className={styles.input} placeholder="Numero de telefono" onChange={(e) => setData({ ...Data, whatsapp: e.target.value })} />
                <input type="password" value={Data.password} className={styles.input} placeholder="Contraseña" onChange={(e) => setData({ ...Data, password: e.target.value })} />
                <button type="submit" className={styles.btn}>
                    Registrarse
                </button>
            </form>
            <Link to={'/login'} state={'/login'} className={styles.registro}>¿Ya tienes cuenta?</Link>
            <Link to={'/'} state={'/login'} className={styles.regresar}>Volver al inicio</Link>

        </div>
    );


}