import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import CategoryCard from '../components/CategoryCard';
import { formatPrice } from '../utils/formatters';

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

  // Filtrar productos por búsqueda
  const filterBySearch = (productsList) => {
    if (!searchTerm.trim()) return productsList;
    
    return productsList.filter(product =>
      product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.descripcion && product.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  // Ordenar productos
  const sortProducts = (productsList) => {
    const sorted = [...productsList];
    
    switch (sortBy) {
      case 'precio_asc':
        return sorted.sort((a, b) => a.precio - b.precio);
      case 'precio_desc':
        return sorted.sort((a, b) => b.precio - a.precio);
      default:
        return sorted.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }
  };

  // Obtener productos finales (filtrados + ordenados)
  const getFilteredAndSortedProducts = () => {
    const filtered = filterBySearch(products);
    return sortProducts(filtered);
  };

  const filteredProductsList = getFilteredAndSortedProducts();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f7'
      }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      background: '#f5f5f7'
    }}>
      {/* Fondo con logo en toda la página */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        overflow: 'hidden'
      }}>
        {/* Capa oscura sobre la imagen */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.25)',
          zIndex: 1
        }} />
        
        {/* Imagen de fondo */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.4
        }}>
          <img 
            src="/logo.jpeg"
            alt="TECNOVA"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center'
            }}
          />
        </div>
      </div>

      {/* Contenido (se mantiene encima del fondo) */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* HERO SECTION */}
        <section style={{
          background: 'transparent',
          padding: '100px 24px 60px',
          textAlign: 'center'
        }}>
          <div className="container">
            <h1 style={{ 
              marginBottom: '16px',
              color: 'white',
              fontSize: 'clamp(32px, 8vw, 56px)'
            }}>TECNOVA</h1>
            <p style={{
              fontSize: '20px',
              color: 'rgba(255, 255, 255, 0.8)',
              maxWidth: '600px',
              margin: '0 auto 32px'
            }}>
              Innovación en tecnología
            </p>

            {/* BUSCADOR */}
            <div style={{ maxWidth: '500px', margin: '0 auto 20px auto' }}>
              <input
                type="text"
                placeholder="🔍 Buscar productos..."
                className="form-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.9)',
                  padding: '14px 20px',
                  borderRadius: '30px',
                  border: 'none',
                  fontSize: '16px',
                  outline: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
            </div>

            {/* SELECTOR DE ORDEN */}
            <div style={{ maxWidth: '300px', margin: '0 auto' }}>
              <select
                className="form-input"
                style={{ 
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.9)',
                  padding: '12px 16px',
                  borderRadius: '30px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="nombre">Ordenar por nombre</option>
                <option value="precio_asc">Precio: menor a mayor</option>
                <option value="precio_desc">Precio: mayor a menor</option>
              </select>
            </div>
          </div>
        </section>

        {/* CATEGORIAS - CON ESTILO GLASSMORPHISM */}
        {categories.length > 0 && (
          <section style={{ padding: '60px 24px' }}>
            <div className="container">
              <h2 style={{ 
                marginBottom: '32px',
                color: 'white'
              }}>Categorías</h2>
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
          background: 'transparent'
        }}>
          <div className="container">
            <h2 style={{ 
              marginBottom: '32px',
              color: 'white'
            }}>
              Productos {filteredProductsList.length > 0 && `(${filteredProductsList.length})`}
            </h2>

            {filteredProductsList.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px',
                color: 'white',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                borderRadius: '24px'
              }}>
                {searchTerm ? 'No se encontraron productos con esa búsqueda' : 'No hay productos para mostrar'}
              </div>
            ) : (
              <div 
                className="products-grid" 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '24px'
                }}
              >
                {filteredProductsList.map(product => (
                  <div 
                    key={product.id} 
                    className="card" 
                    style={{ 
                      padding: '16px', 
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s, background 0.3s',
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '16px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                    onClick={() => navigate(`/producto/${product.id}`)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                    }}
                  >
                    {/* Contenedor de imagen */}
                    <div 
                      className="product-card-image" 
                      style={{
                        width: '100%',
                        height: '200px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: '12px',
                        marginBottom: '12px',
                        overflow: 'hidden'
                      }}
                    >
                      <img 
                        src={product.imagenUrl || 'https://via.placeholder.com/300'} 
                        alt={product.nombre}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'contain',
                          padding: '8px',
                          transition: 'transform 0.3s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      />
                    </div>

                    {/* Nombre del producto */}
                    <h3 style={{ 
                      fontSize: '16px', 
                      marginBottom: '8px',
                      fontWeight: '600',
                      color: 'white'
                    }}>
                      {product.nombre}
                    </h3>

                    {/* Mini círculos de colores */}
                    {product.coloresDisponibles && product.coloresDisponibles.length > 0 && (
                      <div style={{ 
                        display: 'flex', 
                        gap: '6px', 
                        marginBottom: '12px',
                        flexWrap: 'wrap',
                        alignItems: 'center'
                      }}>
                        {product.coloresDisponibles.slice(0, 5).map((color, idx) => (
                          <div
                            key={idx}
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              background: color,
                              border: color === '#ffffff' || color === '#fff' ? '1px solid rgba(255,255,255,0.5)' : 'none',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                              transition: 'transform 0.2s',
                              cursor: 'pointer'
                            }}
                            title={color}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          />
                        ))}
                        {product.coloresDisponibles.length > 5 && (
                          <span style={{ 
                            fontSize: '12px', 
                            color: 'rgba(255,255,255,0.7)',
                            fontWeight: '500'
                          }}>
                            +{product.coloresDisponibles.length - 5}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Descripción */}
                    <p style={{ 
                      fontSize: '14px', 
                      color: 'rgba(255, 255, 255, 0.7)', 
                      marginBottom: '12px',
                      flex: 1,
                      lineHeight: '1.4'
                    }}>
                      {product.descripcion?.substring(0, 60)}...
                    </p>

                    {/* Precio y botón WhatsApp */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginTop: 'auto',
                      gap: '12px'
                    }}>
                      <span style={{ 
                        fontSize: '18px', 
                        fontWeight: '600',
                        color: 'white'
                      }}>
                        ${formatPrice(product.precio)}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const number = "573207512431";
                          let text = `Hola, me interesa el producto: ${product.nombre}\n`;
                          text += `💰 Precio: $${formatPrice(product.precio)}\n`;
                          if (product.sku) {
                            text += `📦 SKU: ${product.sku}\n`;
                          }
                          text += `\n¿Podrían darme más información?`;
                          
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
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'transform 0.2s, opacity 0.2s',
                          fontWeight: '500'
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
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
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
    </div>
  );
};

export default Home;