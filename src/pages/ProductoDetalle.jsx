import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { formatPrice } from '../utils/formatters';

const ProductoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariante, setSelectedVariante] = useState(null);
  const [variantes, setVariantes] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    loadProducto();
  }, [id]);

  const loadProducto = async () => {
    try {
      const response = await api.get(`/productos/${id}`);
      const data = response.data;
      setProducto(data);
      
      // Cargar variantes
      const variantesList = data.variantes || [];
      setVariantes(variantesList);
      if (variantesList.length > 0) {
        setSelectedVariante(variantesList[0]);
      }

      // Productos relacionados
      if (data.categoria?.id) {
        const relatedRes = await api.get(`/productos/categoria/${data.categoria.id}`);
        setRelatedProducts(relatedRes.data.filter(p => p.id !== parseInt(id)).slice(0, 4));
      }
    } catch (error) {
      console.error('Error cargando producto:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    const number = "573207512431";
    let text = `Hola, me interesa el producto: *${producto.nombre}*\n`;
    
    if (selectedVariante) {
      text += `🎨 Color: ${selectedVariante.color}\n`;
      text += `💾 Almacenamiento: ${selectedVariante.almacenamiento}\n`;
      text += `💰 Precio: $${formatPrice(selectedVariante.precio)}\n`;
    } else {
      text += `💰 Precio: $${formatPrice(producto.precio)}\n`;
    }
    
    if (producto.sku) text += `📦 SKU: ${producto.sku}\n`;
    text += `\n¿Podrían darme más información?`;
    
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!producto) return null;

  // Obtener la imagen a mostrar (de la variante seleccionada o la principal)
  const currentImage = selectedVariante?.imagenUrl || producto.imagenUrl;

  return (
    <div style={{ paddingTop: '80px' }}>
      <div className="container">
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '60px',
          marginBottom: '60px'
        }}>
          {/* Imagen del producto */}
          <div>
            <div style={{
              background: '#f5f5f7',
              borderRadius: '24px',
              padding: '40px',
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px'
            }}>
              <img 
                src={currentImage} 
                alt={producto.nombre}
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '400px', 
                  objectFit: 'contain',
                  transition: 'transform 0.3s'
                }}
              />
            </div>
          </div>

          {/* Información del producto */}
          <div>
            <h1 style={{ fontSize: '40px', marginBottom: '16px' }}>{producto.nombre}</h1>
            
            {/* Precio (dinámico según variante) */}
            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontSize: '32px', fontWeight: '600' }}>
                ${formatPrice(selectedVariante?.precio || producto.precio)}
              </span>
            </div>

            {/* Selector de variantes */}
            {variantes.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                {/* Selector de color */}
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>
                    Color: <span style={{ color: '#0066cc' }}>{selectedVariante?.color || 'Selecciona'}</span>
                  </h3>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    {variantes.map((variante, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedVariante(variante)}
                        style={{
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                      >
                        <div style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '50%',
                          background: variante.colorCodigo || '#ccc',
                          border: selectedVariante?.id === variante.id ? '3px solid #0066cc' : '2px solid #e5e5e7',
                          transition: 'all 0.2s',
                          transform: selectedVariante?.id === variante.id ? 'scale(1.1)' : 'scale(1)',
                          boxShadow: selectedVariante?.id === variante.id ? '0 0 0 2px white, 0 0 0 4px #0066cc' : 'none'
                        }} />
                        <div style={{
                          fontSize: '12px',
                          marginTop: '8px',
                          color: selectedVariante?.id === variante.id ? '#0066cc' : '#86868b'
                        }}>
                          {variante.color}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selector de almacenamiento */}
                <div>
                  <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>
                    Almacenamiento: <span style={{ color: '#0066cc' }}>{selectedVariante?.almacenamiento || 'Selecciona'}</span>
                  </h3>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {variantes.map((variante, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedVariante(variante)}
                        style={{
                          padding: '10px 20px',
                          borderRadius: '30px',
                          border: selectedVariante?.id === variante.id ? '2px solid #0066cc' : '1px solid #d2d2d7',
                          background: selectedVariante?.id === variante.id ? '#f0f7ff' : 'white',
                          cursor: 'pointer',
                          fontSize: '14px',
                          transition: 'all 0.2s'
                        }}
                      >
                        {variante.almacenamiento}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Descripción */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Descripción</h3>
              <p style={{ color: '#1d1d1f', lineHeight: '1.6' }}>{producto.descripcion}</p>
            </div>

            {/* Especificaciones */}
            {producto.especificaciones && (
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Especificaciones</h3>
                <div style={{ 
                  background: '#f5f5f7', 
                  borderRadius: '16px', 
                  padding: '20px',
                  whiteSpace: 'pre-line'
                }}>
                  {producto.especificaciones}
                </div>
              </div>
            )}

            {/* Botón WhatsApp */}
            <button 
              className="btn btn-primary"
              style={{ 
                width: '100%', 
                padding: '16px', 
                fontSize: '16px', 
                background: '#25D366', 
                border: 'none',
                borderRadius: '30px',
                cursor: 'pointer',
                color: 'white',
                fontWeight: '500'
              }}
              onClick={handleWhatsApp}
            >
              Consultar por WhatsApp
            </button>
          </div>
        </div>

        {/* Productos relacionados */}
        {relatedProducts.length > 0 && (
          <div style={{ marginBottom: '60px' }}>
            <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>También te puede interesar</h2>
            <div className="grid grid-4">
              {relatedProducts.map(rel => (
                <div 
                  key={rel.id} 
                  className="card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/producto/${rel.id}`)}
                >
                  <img 
                    src={rel.imagenUrl} 
                    alt={rel.nombre}
                    style={{ width: '100%', height: '180px', objectFit: 'contain', marginBottom: '16px' }}
                  />
                  <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>{rel.nombre}</h3>
                  <p style={{ fontSize: '18px', fontWeight: '600' }}>${formatPrice(rel.precio)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductoDetalle;