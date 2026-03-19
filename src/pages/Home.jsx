import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import CategoryCard from '../components/CategoryCard';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('nombre');

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    try {
      const [categoriesRes, productsRes] = await Promise.all([
        api.get('/categorias'),
        api.get('/productos')
      ]);

      console.log('📁 Categorías cargadas:', categoriesRes.data);
      console.log('📦 Productos cargados:', productsRes.data);

      setCategories(categoriesRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar y ordenar productos (solo búsqueda y orden)
  const filteredProducts = () => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    switch (sortBy) {
      case 'precio_asc':
        return filtered.sort((a, b) => a.precio - b.precio);
      case 'precio_desc':
        return filtered.sort((a, b) => b.precio - a.precio);
      default:
        return filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }
  };

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

  return (
    <div>
      {/* HERO */}
      <section style={{
        background: 'linear-gradient(to bottom, #f5f5f7, #ffffff)',
        padding: '100px 24px 60px',
        textAlign: 'center'
      }}>
        <div className="container">
          <h1 style={{ marginBottom: '16px' }}>TECNOVA</h1>
          <p style={{
            fontSize: '20px',
            color: '#86868b',
            maxWidth: '600px',
            margin: '0 auto 32px'
          }}>
            Tecnología innovadora para tu vida diaria
          </p>

          {/* BUSCADOR */}
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <input
              type="text"
              placeholder="Buscar productos..."
              className="form-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ marginBottom: '16px' }}
            />

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              <select
                className="form-input"
                style={{ width: 'auto' }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="nombre">Ordenar por nombre</option>
                <option value="precio_asc">Precio: menor a mayor</option>
                <option value="precio_desc">Precio: mayor a menor</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIAS */}
      {categories.length > 0 && (
        <section style={{ padding: '60px 24px' }}>
          <div className="container">
            <h2 style={{ marginBottom: '32px' }}>Categorías</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '24px'
            }}>
              {categories.map(category => (
                <CategoryCard
                  key={category.id}
                  category={category}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PRODUCTOS */}
      <section style={{
        padding: '60px 24px',
        background: '#f5f5f7'
      }}>
        <div className="container">
          <h2 style={{ marginBottom: '32px' }}>
            Productos
          </h2>

          {filteredProducts().length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              color: '#86868b',
              background: 'white',
              borderRadius: '24px'
            }}>
              No hay productos para mostrar
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '24px'
            }}>
              {filteredProducts().map(product => (
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

                  <h3 style={{
                    fontSize: '18px',
                    marginBottom: '8px'
                  }}>
                    {product.nombre}
                  </h3>

                  {/* Mini círculos de colores */}
                  {product.coloresDisponibles && product.coloresDisponibles.length > 0 && (
                    <div style={{ 
                      display: 'flex', 
                      gap: '6px', 
                      marginBottom: '12px',
                      justifyContent: 'center',
                      flexWrap: 'wrap'
                    }}>
                      {product.coloresDisponibles.slice(0, 5).map((color, idx) => (
                        <div
                          key={idx}
                          style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            background: color,
                            border: color === '#ffffff' || color === '#fff' ? '1px solid #ddd' : 'none',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            transition: 'transform 0.2s'
                          }}
                          title={color}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        />
                      ))}
                      {product.coloresDisponibles.length > 5 && (
                        <span style={{ 
                          fontSize: '12px', 
                          color: '#86868b',
                          fontWeight: '500'
                        }}>
                          +{product.coloresDisponibles.length - 5}
                        </span>
                      )}
                    </div>
                  )}

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
                    <span style={{
                      fontSize: '20px',
                      fontWeight: '600'
                    }}>
                      ${product.precio}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const number = "573207512431";
                        const text = `Hola, me interesa el producto: ${product.nombre} ($${product.precio})`;
                        window.open(
                          `https://wa.me/${number}?text=${encodeURIComponent(text)}`,
                          '_blank'
                        );
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
                        gap: '4px',
                        transition: 'transform 0.2s, opacity 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.opacity = '0.9';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.opacity = '1';
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

export default Home;