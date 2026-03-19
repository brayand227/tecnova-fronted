import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const CategoriaDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categoria, setCategoria] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('nombre');

  useEffect(() => {
    loadCategoriaYProductos();
  }, [id]);

  const loadCategoriaYProductos = async () => {
    setLoading(true);
    try {
      // Cargar detalles de la categoría
      const catRes = await api.get(`/categorias/${id}`);
      setCategoria(catRes.data);
      
      // Cargar productos de esta categoría
      const prodRes = await api.get(`/productos/categoria/${id}`);
      setProductos(prodRes.data);
      
      console.log('📁 Categoría:', catRes.data);
      console.log('📦 Productos:', prodRes.data);
    } catch (error) {
      console.error('Error cargando categoría:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  // Ordenar productos
  const productosOrdenados = () => {
    let sorted = [...productos];
    switch(sortBy) {
      case 'precio_asc':
        return sorted.sort((a, b) => a.precio - b.precio);
      case 'precio_desc':
        return sorted.sort((a, b) => b.precio - a.precio);
      default:
        return sorted.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '80px' }}>
      {/* Hero de la categoría */}
      <section style={{ 
        background: 'linear-gradient(to bottom, #f5f5f7, #ffffff)',
        padding: '60px 24px',
        textAlign: 'center'
      }}>
        <div className="container">
          {categoria?.imagenUrl && (
            <img 
              src={categoria.imagenUrl} 
              alt={categoria.nombre}
              style={{ 
                width: '120px', 
                height: '120px', 
                objectFit: 'cover', 
                borderRadius: '60px',
                marginBottom: '24px'
              }} 
            />
          )}
          <h1 style={{ fontSize: '48px', marginBottom: '16px' }}>{categoria?.nombre}</h1>
          {categoria?.descripcion && (
            <p style={{ 
              fontSize: '20px', 
              color: '#86868b',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              {categoria.descripcion}
            </p>
          )}
        </div>
      </section>

      {/* Productos de la categoría */}
      <section style={{ padding: '60px 24px', background: '#f5f5f7' }}>
        <div className="container">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '32px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <h2 style={{ fontSize: '32px' }}>
              Productos ({productos.length})
            </h2>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <select 
                className="form-input" 
                style={{ width: '200px' }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="nombre">Ordenar por nombre</option>
                <option value="precio_asc">Precio: menor a mayor</option>
                <option value="precio_desc">Precio: mayor a menor</option>
              </select>
              
              <button 
                onClick={() => navigate('/')}
                className="btn btn-outline"
              >
                ← Volver
              </button>
            </div>
          </div>

          {productos.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '80px',
              color: '#86868b',
              background: 'white',
              borderRadius: '24px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
              <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>No hay productos</h3>
              <p>Esta categoría aún no tiene productos disponibles</p>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '24px'
            }}>
              {productosOrdenados().map(product => (
                <div 
                  key={product.id} 
                  className="card" 
                  style={{ 
                    padding: '20px', 
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onClick={() => navigate(`/producto/${product.id}`)}
                >
                  <img 
                    src={product.imagenUrl || 'https://via.placeholder.com/300'} 
                    alt={product.nombre}
                    style={{ 
                      width: '100%', 
                      height: '180px', 
                      objectFit: 'contain', 
                      borderRadius: '12px',
                      marginBottom: '16px',
                      background: '#f5f5f7'
                    }}
                  />
                  <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{product.nombre}</h3>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#86868b', 
                    marginBottom: '12px',
                    flex: 1
                  }}>
                    {product.descripcion?.substring(0, 60)}...
                  </p>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginTop: 'auto'
                  }}>
                    <span style={{ fontSize: '20px', fontWeight: '600' }}>${product.precio}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const number = "573207512431";
                        const text = `Hola, me interesa el producto:  ${product.nombre} ($${product.precio}) de la categoría ${categoria?.nombre}`;
                        window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, '_blank');
                      }}
                      style={{
                        background: '#25D366',
                        color: 'white',
                        border: 'none',
                        borderRadius: '30px',
                        padding: '8px 16px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                        <path d="M19.05 4.91A9.816 9.816 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01z"/>
                      </svg>
                      WhatsApp
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CategoriaDetalle;