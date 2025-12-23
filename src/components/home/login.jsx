import 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../../assets/styles/homeS/login.module.css'
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'sonner'
import { delay } from 'framer-motion';
import { url } from '../../utils/base.url';

export default function Login() {
    const navigate = useNavigate();

    useEffect(() =>{
        const token = localStorage.getItem('token');
        token ? localStorage.removeItem('token') : navigate('/login');
    }, []);


    const [Data, setData] = useState({
            email:'',
            password:''
        });

        const envio = async (e) => {
            e.preventDefault();
            try{
                const res = await axios.post(`${url}/api/auth/login`, Data);
                setData({
                    email: '',
                    password: ''
                })
                const role = res.data.user.role;
                const token = res.data.token;
                const userId = res.data.user.id;
                localStorage.setItem('token', token);
                localStorage.setItem('role', role);
                localStorage.setItem('userId', userId);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                toast.success('Inicio de sesión exitoso');
                await new Promise(resolve => setTimeout(resolve, 1500));
                if(role === 'admin_general'){
                    navigate('/homeUser')
                }else if(role === 'usuario'){
                    navigate('/homeUser')
                }else if (role === 'superadmin'){
                    navigate('/homeUser')
                };
            }catch(error){
                console.log(error);
                toast.error('Correo o contraseña incorrectos');
            }

        };



    return(
        <div className={styles.container}>
            <Toaster position="top-center" richColors />
            <h1 className={styles.title}>Login</h1>
            <form className={styles.inputContainer} onSubmit={envio}>
                <input type="text" value={Data.email} className={styles.input} placeholder="Correo" onChange={(e) => setData({ ...Data, email: e.target.value })}/>
                <input type="password" value={Data.password} className={styles.input} placeholder="Contraseña" onChange={(e) => setData({ ...Data, password: e.target.value })} />
            
            <button type="submit" className={styles.btn}>
                    Iniciar sesion
                </button>
            </form>
            <Link to={'/register'} state={'/login'} className={styles.registro}>¿Aun no tienes cuenta?</Link>
            <Link to={'/'} state={'/login'} className={styles.regresar}>Volver al inicio</Link>

        </div>
    );


}