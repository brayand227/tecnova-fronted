import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ProductoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    loadProducto();
  }, [id]);

  const loadProducto = async () => {
    try {
      const response = await api.get(`/productos/${id}`);
      const data = response.data;

      setProducto(data);
      setSelectedImage(data.imagenUrl);

      if (data.coloresDisponibles?.length > 0) {
        setSelectedColor(data.coloresDisponibles[0]);
      }

      if (data.categoria?.id) {
        const relatedRes = await api.get(`/productos/categoria/${data.categoria.id}`);
        setRelatedProducts(
          relatedRes.data
            .filter(p => p.id !== parseInt(id))
            .slice(0, 4)
        );
      }
    } catch (error) {
      console.error('Error cargando producto:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  // Función para determinar si un color es claro (para texto oscuro)
  const isLightColor = (color) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155;
  };

  // Función para obtener nombre del color
  const getColorName = (color) => {
    const colorMap = {
      '#000000': 'Negro',
      '#ffffff': 'Blanco',
      '#1d1d1f': 'Gris espacial',
      '#86868b': 'Gris',
      '#0066cc': 'Azul',
      '#ff3b30': 'Rojo',
      '#34c759': 'Verde',
      '#5856d6': 'Púrpura',
      '#ff9500': 'Naranja',
      '#af52de': 'Morado',
      '#ff2d55': 'Rosa',
      '#a2845e': 'Oro'
    };
    return colorMap[color] || color;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!producto) return null;

  return (
    <div style={{ paddingTop: '80px' }}>
      {/* Breadcrumb */}
      <div className="container" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px', color: '#86868b', fontSize: '14px' }}>
          <a href="/" style={{ color: '#86868b', textDecoration: 'none' }}>Inicio</a>
          <span>/</span>
          {producto.categoria && (
            <>
              <a href={`/?categoria=${producto.categoria.id}`} style={{ color: '#86868b', textDecoration: 'none' }}>
                {producto.categoria.nombre}
              </a>
              <span>/</span>
            </>
          )}
          <span style={{ color: '#1d1d1f' }}>{producto.nombre}</span>
        </div>
      </div>

      {/* Contenido producto */}
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '60px',
          marginBottom: '60px'
        }}>
          {/* GALERÍA */}
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
                src={selectedImage}
                alt={producto.nombre}
                style={{
                  maxWidth: '100%',
                  maxHeight: '400px',
                  objectFit: 'contain'
                }}
              />
            </div>

            {/* Miniaturas */}
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto' }}>
              <div
                onClick={() => setSelectedImage(producto.imagenUrl)}
                style={{
                  width: '80px',
                  height: '80px',
                  background: '#f5f5f7',
                  borderRadius: '12px',
                  padding: '8px',
                  cursor: 'pointer',
                  border: selectedImage === producto.imagenUrl ? '2px solid #0066cc' : '2px solid transparent'
                }}
              >
                <img
                  src={producto.imagenUrl}
                  alt="Principal"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>

              {producto.imagenesAdicionales?.map((img, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  style={{
                    width: '80px',
                    height: '80px',
                    background: '#f5f5f7',
                    borderRadius: '12px',
                    padding: '8px',
                    cursor: 'pointer',
                    border: selectedImage === img ? '2px solid #0066cc' : '2px solid transparent'
                  }}
                >
                  <img
                    src={img}
                    alt={`Vista ${index + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* INFO PRODUCTO */}
          <div>
            <h1 style={{ fontSize: '40px', marginBottom: '16px' }}>
              {producto.nombre}
            </h1>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              {producto.sku && (
                <span style={{ color: '#86868b', fontSize: '14px' }}>
                  SKU: {producto.sku}
                </span>
              )}
              <span className={`badge ${producto.stock > 0 ? 'badge-active' : 'badge-inactive'}`}>
                {producto.stock > 0 ? `${producto.stock} disponibles` : 'Agotado'}
              </span>
            </div>

            {/* PRECIO */}
            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontSize: '32px', fontWeight: '600' }}>
                ${producto.precio}
              </span>
            </div>

            {/* SELECTOR DE COLORES ESTILO APPLE */}
            {producto.coloresDisponibles?.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ 
                  fontSize: '16px', 
                  marginBottom: '16px',
                  fontWeight: '500',
                  color: '#1d1d1f'
                }}>
                  Color: <span style={{ color: '#0066cc' }}>{getColorName(selectedColor) || 'Selecciona una opción'}</span>
                </h3>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  {producto.coloresDisponibles.map((color, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedColor(color)}
                      style={{
                        position: 'relative',
                        cursor: 'pointer'
                      }}
                    >
                      {/* Círculo de color */}
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: color,
                        border: selectedColor === color ? '3px solid #0066cc' : '2px solid #e5e5e7',
                        boxShadow: selectedColor === color 
                          ? '0 4px 12px rgba(0,102,204,0.3)' 
                          : '0 2px 8px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s ease',
                        transform: selectedColor === color ? 'scale(1.1)' : 'scale(1)',
                        marginBottom: '8px'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedColor !== color) {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedColor !== color) {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                        }
                      }}
                    />
                    
                    {/* Indicador de selección (check) */}
                    {selectedColor === color && (
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: isLightColor(color) ? '#000' : '#fff',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        pointerEvents: 'none'
                      }}>
                        ✓
                      </div>
                    )}
                    
                    {/* Nombre del color */}
                    <div style={{
                      fontSize: '12px',
                      textAlign: 'center',
                      color: selectedColor === color ? '#0066cc' : '#86868b',
                      fontWeight: selectedColor === color ? '500' : 'normal'
                    }}>
                      {getColorName(color)}
                    </div>
                  </div>
                  ))}
                </div>
              </div>
            )}

            {/* DESCRIPCIÓN */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>
                Descripción
              </h3>
              <p style={{ lineHeight: '1.6' }}>
                {producto.descripcion}
              </p>
            </div>

            {/* ESPECIFICACIONES */}
            {producto.especificaciones && (
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>
                  Especificaciones
                </h3>
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

            {/* BOTÓN WHATSAPP */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                className="btn btn-primary"
                style={{
                  flex: 1,
                  padding: '16px',
                  fontSize: '16px',
                  background: '#25D366',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  color: 'white',
                  fontWeight: '500'
                }}
                onClick={() => {
                  const number = "573207512431";
                  
                  // Construir mensaje detallado con color incluido usando getColorName
                  let text = `Hola, me interesa el producto: *${producto.nombre}*\n`;
                  text += `💰 Precio: $${producto.precio}\n`;
                  if (selectedColor) {
                    text += `🎨 Color: ${getColorName(selectedColor)}\n`;
                  }
                  if (producto.sku) {
                    text += `📦 SKU: ${producto.sku}\n`;
                  }
                  text += `\n¿Podrían darme más información?`;
                  
                  window.open(
                    `https://wa.me/${number}?text=${encodeURIComponent(text)}`,
                    '_blank'
                  );
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M19.05 4.91A9.816 9.816 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01z"/>
                  </svg>
                  <span>Consultar por WhatsApp</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* PRODUCTOS RELACIONADOS */}
        {relatedProducts.length > 0 && (
          <div style={{ marginBottom: '60px' }}>
            <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>
              También te puede interesar
            </h2>
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
                    style={{
                      width: '100%',
                      height: '180px',
                      objectFit: 'contain',
                      marginBottom: '16px'
                    }}
                  />
                  <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>
                    {rel.nombre}
                  </h3>
                  <p style={{ fontSize: '18px', fontWeight: '600' }}>
                    ${rel.precio}
                  </p>
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