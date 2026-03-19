import React from 'react';

const WhatsAppButton = ({ phoneNumber = "573207512431", message, product }) => {
  const handleClick = () => {
    let text = message || 'Hola, quiero recibir asesoría sobre sus productos.';
    
    // Si hay un producto específico
    if (product) {
      text = `Hola, me interesa el producto:*${product.nombre}*\n`;
      text += `💰 Precio: $${product.precio}\n`;
      if (product.color) text += `🎨 Color: ${product.color}\n`;
      if (product.sku) text += `📦 SKU: ${product.sku}\n`;
      text += `\n¿Podrían darme más información?`;
    }
    
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: '#25D366',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        transition: 'transform 0.3s'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      <svg 
        width="30" 
        height="30" 
        viewBox="0 0 24 24" 
        fill="white"
      >
        <path d="M19.05 4.91A9.816 9.816 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01zm-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.32a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.183 8.183 0 0 1 2.41 5.83c.02 4.54-3.68 8.24-8.22 8.24z"/>
        <path d="M16.15 13.99c-.25-.12-1.47-.72-1.7-.8-.23-.08-.4-.12-.56.12-.16.24-.64.8-.78.96-.14.16-.29.18-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.12.25-.31.37-.47.12-.16.16-.27.24-.45.08-.18.04-.34-.02-.46-.06-.12-.56-1.35-.77-1.85-.2-.49-.4-.42-.56-.43-.14-.01-.31-.01-.48-.01-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.72 4.31 3.72.6.24 1.07.39 1.44.5.6.18 1.15.15 1.58.09.48-.06 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28z"/>
      </svg>
    </button>
  );
};

export default WhatsAppButton;