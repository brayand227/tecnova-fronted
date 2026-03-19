import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

import Login from './pages/Login';
import Home from './pages/Home';
import AdminCategories from './pages/AdminCategories';
import AdminProductos from './pages/AdminProductos';
import ProductoDetalle from './pages/ProductoDetalle';
import CategoriaDetalle from './pages/CategoriaDetalle';

import WhatsAppButton from './components/WhatsAppButton';


// Componente para proteger rutas admin
const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return isAdmin() ? children : <Navigate to="/login" />;
};


// Navbar
const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <nav className="navbar">
      <div className="navbar-container">

        <a href="/" className="navbar-logo">
          TECNOVA
        </a>

        <div className="navbar-links">

          <a href="/">Inicio</a>

          {isAdmin() && (
            <>
              <a href="/admin/categorias">Categorías</a>
              <a href="/admin/productos">Productos</a>
            </>
          )}

          <button
            onClick={toggleDarkMode}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '20px',
              padding: '0 8px'
            }}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          {user ? (
            <>
              <span style={{ color: '#86868b' }}>
                {user.username} ({isAdmin() ? 'Admin' : 'Usuario'})
              </span>

              <button
                onClick={logout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ff3b30',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <a href="/login" style={{ color: '#0066cc' }}>
              Iniciar sesión
            </a>
          )}

        </div>
      </div>
    </nav>
  );
};


function AppContent() {
  return (
    <>
      <Navbar />

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        {/* DETALLE PRODUCTO */}
        <Route path="/producto/:id" element={<ProductoDetalle />} />

        {/* DETALLE CATEGORIA */}
        <Route path="/categoria/:id" element={<CategoriaDetalle />} />

        {/* ADMIN */}
        <Route
          path="/admin/categorias"
          element={
            <AdminRoute>
              <AdminCategories />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/productos"
          element={
            <AdminRoute>
              <AdminProductos />
            </AdminRoute>
          }
        />

      </Routes>

      <WhatsAppButton
        phoneNumber="573207512431"
        message="Hola, quiero recibir asesoría sobre sus productosss"
      />
    </>
  );
}


function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;