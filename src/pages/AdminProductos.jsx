import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ImageUpload from '../components/ImageUpload';

const AdminProductos = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: { id: '' },
    imagenUrl: '',
    imagenesAdicionales: [],
    coloresDisponibles: [],
    destacado: false,
    stock: 0,
    sku: '',
    especificaciones: ''
  });
  
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/');
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productosRes, categoriasRes] = await Promise.all([
        api.get('/admin/productos'),
        api.get('/categorias')
      ]);
      
      setProductos(productosRes.data);
      setCategorias(categoriasRes.data);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const productoData = {
        ...formData,
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock) || 0,
        categoria: formData.categoria?.id ? { id: parseInt(formData.categoria.id) } : null
      };

      if (editingProduct) {
        await api.put(`/admin/productos/${editingProduct.id}`, productoData);
        setSuccessMessage('Producto actualizado correctamente');
      } else {
        await api.post('/admin/productos', productoData);
        setSuccessMessage('Producto creado correctamente');
      }
      
      setTimeout(() => setSuccessMessage(''), 3000);
      loadData();
      resetForm();
      setShowForm(false);
    } catch (error) {
      setErrorMessage('Error al guardar el producto');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleEdit = (producto) => {
    setEditingProduct(producto);
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: producto.precio,
      categoria: producto.categoria || { id: '' },
      imagenUrl: producto.imagenUrl || '',
      imagenesAdicionales: producto.imagenesAdicionales || [],
      coloresDisponibles: producto.coloresDisponibles || [],
      destacado: producto.destacado || false,
      stock: producto.stock || 0,
      sku: producto.sku || '',
      especificaciones: producto.especificaciones || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await api.delete(`/admin/productos/${id}`);
        loadData();
        setSuccessMessage('Producto eliminado correctamente');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        setErrorMessage('Error al eliminar el producto');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      categoria: { id: '' },
      imagenUrl: '',
      imagenesAdicionales: [],
      coloresDisponibles: [],
      destacado: false,
      stock: 0,
      sku: '',
      especificaciones: ''
    });
  };

  // Colores predefinidos estilo Apple
  const appleColors = [
    { code: '#000000', name: 'Negro' },
    { code: '#ffffff', name: 'Blanco' },
    { code: '#1d1d1f', name: 'Gris espacial' },
    { code: '#86868b', name: 'Gris' },
    { code: '#0066cc', name: 'Azul' },
    { code: '#ff3b30', name: 'Rojo' },
    { code: '#34c759', name: 'Verde' },
    { code: '#5856d6', name: 'Púrpura' },
    { code: '#ff9500', name: 'Naranja' },
    { code: '#af52de', name: 'Morado' },
    { code: '#ff2d55', name: 'Rosa' },
    { code: '#a2845e', name: 'Oro' }
  ];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ padding: '100px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Mensajes de éxito/error */}
      {successMessage && (
        <div style={{
          backgroundColor: '#34c759',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          marginBottom: '20px',
          position: 'fixed',
          top: '80px',
          right: '24px',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div style={{
          backgroundColor: '#ff3b30',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          marginBottom: '20px',
          position: 'fixed',
          top: '80px',
          right: '24px',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          {errorMessage}
        </div>
      )}

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '40px'
      }}>
        <h1 style={{ fontSize: '32px', margin: 0 }}>Administrar Productos</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
        >
          {showForm ? 'Cancelar' : '➕ Nuevo Producto'}
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div style={{
          background: '#f5f5f7',
          borderRadius: '24px',
          padding: '32px',
          marginBottom: '40px'
        }}>
          <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>
            {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: '24px' }}>
              {/* Información básica */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label className="form-label">Nombre del producto *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.nombre}
                    onChange={e => setFormData({...formData, nombre: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">SKU (opcional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.sku}
                    onChange={e => setFormData({...formData, sku: e.target.value})}
                  />
                </div>
              </div>

              {/* Precio y stock */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label className="form-label">Precio *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={formData.precio}
                    onChange={e => setFormData({...formData, precio: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Stock</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.stock}
                    onChange={e => setFormData({...formData, stock: e.target.value})}
                  />
                </div>
              </div>

              {/* Categoría */}
              <div>
                <label className="form-label">Categoría</label>
                <select
                  className="form-input"
                  value={formData.categoria?.id || ''}
                  onChange={e => setFormData({
                    ...formData, 
                    categoria: { id: e.target.value }
                  })}
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Descripción */}
              <div>
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-input"
                  rows="4"
                  value={formData.descripcion}
                  onChange={e => setFormData({...formData, descripcion: e.target.value})}
                />
              </div>

              {/* Especificaciones */}
              <div>
                <label className="form-label">Especificaciones</label>
                <textarea
                  className="form-input"
                  rows="4"
                  value={formData.especificaciones}
                  onChange={e => setFormData({...formData, especificaciones: e.target.value})}
                  placeholder="Ej: Procesador: Intel i7&#10;Memoria RAM: 16GB&#10;Almacenamiento: 512GB SSD"
                />
              </div>

              {/* 🎨 SELECTOR DE COLORES ESTILO APPLE */}
              <div style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
                <label className="form-label">Colores disponibles</label>
                <p style={{ fontSize: '12px', color: '#86868b', marginBottom: '12px' }}>
                  Ingresa códigos de color HEX (ej: #FF0000 para rojo, #000000 para negro)
                </p>
                
                {/* Lista de colores agregados */}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  {formData.coloresDisponibles?.map((color, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: color,
                        border: '2px solid #fff',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const nuevosColores = formData.coloresDisponibles.filter((_, i) => i !== index);
                          setFormData({...formData, coloresDisponibles: nuevosColores});
                        }}
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          background: '#ff3b30',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        ×
                      </button>
                      <div style={{ 
                        fontSize: '11px', 
                        textAlign: 'center', 
                        marginTop: '4px',
                        color: '#666'
                      }}>
                        {color}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Agregar nuevo color */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="color"
                    id="colorPicker"
                    value="#0066cc"
                    onChange={(e) => {
                      const input = document.getElementById('colorInput');
                      input.value = e.target.value;
                    }}
                    style={{
                      width: '48px',
                      height: '48px',
                      border: 'none',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  />
                  <input
                    type="text"
                    id="colorInput"
                    placeholder="#0066cc"
                    className="form-input"
                    style={{ width: '150px' }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      const input = document.getElementById('colorInput');
                      const colorValue = input.value.trim();
                      
                      // Validar formato HEX
                      if (colorValue && /^#[0-9A-Fa-f]{6}$/i.test(colorValue)) {
                        setFormData({
                          ...formData, 
                          coloresDisponibles: [...(formData.coloresDisponibles || []), colorValue]
                        });
                        input.value = '';
                        document.getElementById('colorPicker').value = '#0066cc';
                      } else if (colorValue) {
                        alert('Por favor ingresa un color válido en formato HEX (ej: #FF0000)');
                      }
                    }}
                  >
                    Agregar color
                  </button>
                </div>
                
                {/* Colores predefinidos estilo Apple */}
                <div style={{ marginTop: '16px' }}>
                  <p style={{ fontSize: '12px', color: '#86868b', marginBottom: '8px' }}>
                    Colores Apple sugeridos:
                  </p>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {appleColors.map(color => (
                      <div
                        key={color.code}
                        onClick={() => {
                          setFormData({
                            ...formData, 
                            coloresDisponibles: [...(formData.coloresDisponibles || []), color.code]
                          });
                        }}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: color.code,
                          border: color.code === '#ffffff' ? '1px solid #ddd' : 'none',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          cursor: 'pointer',
                          transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Upload de imágenes */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Imagen principal</label>
                <ImageUpload
                  onImageUploaded={(url) => setFormData({...formData, imagenUrl: url})}
                  currentImage={formData.imagenUrl}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Imágenes adicionales</label>
                <ImageUpload
                  onImageUploaded={(url) => {
                    setFormData({
                      ...formData,
                      imagenesAdicionales: [...(formData.imagenesAdicionales || []), url]
                    });
                  }}
                  multiple
                />
                {formData.imagenesAdicionales?.length > 0 && (
                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
                    {formData.imagenesAdicionales.map((img, index) => (
                      <div key={index} style={{ position: 'relative' }}>
                        <img
                          src={img}
                          alt={`Adicional ${index + 1}`}
                          style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const nuevas = formData.imagenesAdicionales.filter((_, i) => i !== index);
                            setFormData({...formData, imagenesAdicionales: nuevas});
                          }}
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            background: '#ff3b30',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            cursor: 'pointer'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Destacado */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={formData.destacado}
                    onChange={e => setFormData({...formData, destacado: e.target.checked})}
                  />
                  Producto destacado
                </label>
              </div>

              {/* Botones */}
              <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Actualizar' : 'Crear'} Producto
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Lista de productos */}
      <div style={{ background: '#f5f5f7', borderRadius: '24px', padding: '32px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Productos existentes</h2>
        
        <div style={{ display: 'grid', gap: '16px' }}>
          {productos.map(producto => (
            <div
              key={producto.id}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '20px',
                display: 'grid',
                gridTemplateColumns: '80px 1fr auto auto',
                gap: '20px',
                alignItems: 'center'
              }}
            >
              <img
                src={producto.imagenUrl || '/placeholder.jpg'}
                alt={producto.nombre}
                style={{ width: '80px', height: '80px', objectFit: 'contain' }}
              />
              
              <div>
                <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>{producto.nombre}</h3>
                <p style={{ color: '#666', fontSize: '14px' }}>SKU: {producto.sku || 'N/A'}</p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  {producto.coloresDisponibles?.slice(0, 3).map((color, i) => (
                    <div
                      key={i}
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: color,
                        border: '1px solid #ddd'
                      }}
                      title={color}
                    />
                  ))}
                  {producto.coloresDisponibles?.length > 3 && (
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      +{producto.coloresDisponibles.length - 3}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '20px', fontWeight: '600' }}>${producto.precio}</div>
                <div style={{ fontSize: '14px', color: producto.stock > 0 ? '#34c759' : '#ff3b30' }}>
                  Stock: {producto.stock}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-outline"
                  onClick={() => handleEdit(producto)}
                  style={{ padding: '8px 16px' }}
                >
                  Editar
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => handleDelete(producto.id)}
                  style={{ padding: '8px 16px', color: '#ff3b30' }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminProductos;