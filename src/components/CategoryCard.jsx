import React from 'react';
import { useNavigate } from 'react-router-dom';

const CategoryCard = ({ category }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/categoria/${category.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      style={{ 
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(10px)',
        borderRadius: '18px',
        padding: '24px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        transition: 'all 0.3s',
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 20px 30px rgba(0,0,0,0.2)';
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
      }}
    >
      {/* Imagen */}
      <div style={{
        width: '100%',
        height: '160px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '12px',
        marginBottom: '16px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {category.imagenUrl ? (
          <img 
            src={category.imagenUrl} 
            alt={category.nombre}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover' 
            }}
          />
        ) : (
          <div style={{ 
            fontSize: '48px',
            color: 'rgba(255,255,255,0.6)'
          }}>
            📁
          </div>
        )}
      </div>

      {/* Info */}
      <h3 style={{ 
        fontSize: '20px', 
        marginBottom: '8px',
        fontWeight: '600',
        color: 'white'
      }}>
        {category.nombre}
      </h3>
      
      {category.descripcion && (
        <p style={{ 
          color: 'rgba(255, 255, 255, 0.7)', 
          fontSize: '14px', 
          marginBottom: '16px',
          flex: 1,
          lineHeight: '1.5'
        }}>
          {category.descripcion}
        </p>
      )}

      {/* Ver productos link */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        color: 'rgba(255,255,255,0.9)', 
        fontSize: '14px',
        fontWeight: '500',
        marginTop: 'auto'
      }}>
        <span>Ver productos</span>
        <span style={{ marginLeft: '4px', fontSize: '16px' }}>→</span>
      </div>

      {/* Badge de cantidad de productos */}
      {category.productos && category.productos.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(5px)',
          color: 'white',
          borderRadius: '20px',
          padding: '4px 8px',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          {category.productos.length} productos
        </div>
      )}
    </div>
  );
};

export default CategoryCard;