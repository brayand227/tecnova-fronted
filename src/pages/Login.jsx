import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(to bottom, #f5f5f7, #ffffff)',
      padding: '48px 24px'
    }}>
      <div style={{ maxWidth: '400px', width: '100%' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: '#1d1d1f',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <span style={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}>S</span>
          </div>
          <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Bienvenido</h1>
          <p style={{ color: '#86868b' }}>Inicia sesión para continuar</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <div style={{ marginBottom: '20px' }}>
            <label className="form-label">Usuario</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="usuario o admin"
              required
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div style={{ 
              background: '#fff0f0', 
              color: '#ff3b30', 
              padding: '12px', 
              borderRadius: '12px',
              marginBottom: '20px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '16px' }}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>

          {/* Credenciales de prueba */}
          <div style={{ 
            marginTop: '24px', 
            padding: '16px', 
            background: '#f5f5f7', 
            borderRadius: '12px',
            fontSize: '12px',
            color: '#86868b',
            textAlign: 'center'
          }}>
            <p style={{ marginBottom: '8px', fontWeight: '500' }}>Credenciales  Tecnova:</p>
            <p>Admin: --------------</p>
            <p>Usuario:  </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;