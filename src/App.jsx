import './App.css'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion';
import PrivateRoute from './components/components/privateRoute'
import Home from './components/home/home';
import MapV from './components/invitado/map';
import Login from './components/home/login';
import Register from './components/home/register'
import HomeUser from './components/user/home';
import MisResportes from './components/user/misReportes';
import Reportes from './components/user/reportes';
import ReportesAdmin from './components/Admin/reportesAdmin';
import Administradores from './components/Admin/administradores'
import Categorias from './components/Admin/categorias'

function App() {
  const location = useLocation();

  return (
    <div className="App">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
          <Route path="/mapV" element={<PageWrapper><MapV /></PageWrapper>} />
          <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
          <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
          <Route path="/reportes" element={<PageWrapper><Reportes /></PageWrapper>} />
          <Route element={<PrivateRoute />}>
            <Route path="/homeUser" element={<PageWrapper><HomeUser /></PageWrapper>} />
            <Route path="/misReportes" element={<PageWrapper><MisResportes /></PageWrapper>} />
            <Route path="/reportesAdmin" element={<PageWrapper><ReportesAdmin /></PageWrapper>} />
            <Route path="/administradores" element={<PageWrapper><Administradores /></PageWrapper>} />
            <Route path="/categorias" element={<PageWrapper><Categorias /></PageWrapper>} />
          </Route>
        </Routes>
      </AnimatePresence>
    </div>
  )
}

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 0 }}     // inicio animación
      animate={{ opacity: 1, x: 0 }}       // entrada
      exit={{ opacity: 0, x: 0 }}         // salida
      transition={{ duration: 0.4 }}
      style={{ height: "100%" }}
    >
      {children}
    </motion.div>
  );
}

export default App
