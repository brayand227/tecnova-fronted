// Formatear precios en pesos colombianos
export const formatPrice = (price) => {
  if (!price && price !== 0) return '$0';
  
  // Convertir a número si es string
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  // Formato colombiano: puntos como separadores de miles, sin decimales
  return numericPrice.toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

// Convertir string con puntos a número (para inputs)
export const parsePrice = (priceString) => {
  if (!priceString) return 0;
  // Eliminar todos los puntos y convertir a número
  const cleanNumber = priceString.replace(/\./g, '');
  return parseFloat(cleanNumber);
};