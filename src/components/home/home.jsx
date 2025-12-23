import 'react';
import styles from '../../assets/styles/homeS/home.module.css'
import figure from '../../assets/styles/homeS/image/fondo principal beta 8.png'
import text from '../../assets/styles/homeS/image/text.png'
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Toaster, toast } from 'sonner'




export default function Login() {


    if(localStorage.getItem('overlayShow') === null){
        localStorage.setItem('overlayShow', 'true');
    }

    const valor = localStorage.getItem('overlayShow');

    const iniciarOverlay = valor === null ? true : valor === 'true';
    console.log('inicializar overlay: ',iniciarOverlay);

    const [showOverlay, setShowOverlay] = useState(iniciarOverlay);





    const handleOverlay = () => {
        setShowOverlay(false);
        localStorage.setItem('overlayShow', 'false');
    };

    return (
    
    <div className={styles.container}>

        {showOverlay && (
            <>
                <div className={styles.overlay} onAnimationEnd={handleOverlay}></div>
                <img className={styles.text} src={text} onAnimationEnd={handleOverlay}/>
            </>
        )}

        
        <h1 className={styles.title}>FIX VICINITY</h1>
        <Link to={'/login'} state={'/'}><button  className={styles.btn}>Comenzar</button></Link>
        <Link to={'/mapV'} state={'/'}><img  className={styles.figure} src={figure}></img></Link>


    </div>
    );
}