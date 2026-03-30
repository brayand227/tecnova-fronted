import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ImageUpload from '../components/ImageUpload';
import ImageGalleryUpload from '../components/ImageGalleryUpload';
import { formatPrice, parsePrice } from '../utils/formatters';

const AdminProductos = () => {
  const [nuevoColor, setNuevoColor] = useState('#0066cc');
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
    imagenesPorColor: {},
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
      console.error('Error cargando datos:', error);
      setErrorMessage('Error al cargar los datos');
    } finally {
      setLoading(false);
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
      imagenesPorColor: {},
      destacado: false,
      stock: 0,
      sku: '',
      especificaciones: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const productoData = {
        ...formData,
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock) || 0,
        categoria: formData.categoria?.id
          ? { id: parseInt(formData.categoria.id) }
          : null
      };

      if (editingProduct) {
        await api.put(`/admin/productos/${editingProduct.id}`, productoData);
        setSuccessMessage('✅ Producto actualizado exitosamente');
      } else {
        await api.post('/admin/productos', productoData);
        setSuccessMessage('✅ Producto creado exitosamente');
      }

      loadData();
      resetForm();
      setShowForm(false);
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error guardando producto:', error);
      setErrorMessage('Error al guardar: ' + (error.response?.data || 'Intenta de nuevo'));
    }
  };

  const handleEdit = (producto) => {
    setEditingProduct(producto);
    setFormData({
      nombre: producto.nombre || '',
      descripcion: producto.descripcion || '',
      precio: producto.precio || '',
      categoria: producto.categoria || { id: '' },
      imagenUrl: producto.imagenUrl || '',
      imagenesAdicionales: producto.imagenesAdicionales || [],
      coloresDisponibles: producto.coloresDisponibles || [],
      imagenesPorColor: producto.imagenesPorColor || {},
      destacado: producto.destacado || false,
      stock: producto.stock || 0,
      sku: producto.sku || '',
      especificaciones: producto.especificaciones || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
    
    try {
      await api.delete(`/admin/productos/${id}`);
      setSuccessMessage('✅ Producto eliminado');
      loadData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      alert('Error al eliminar: ' + (error.response?.data || 'Intenta de nuevo'));
    }
  };

  const agregarColor = () => {
    const color = nuevoColor.trim();

    if (!/^#[0-9A-Fa-f]{6}$/i.test(color)) {
      alert('Color inválido. Usa formato HEX (#RRGGBB)');
      return;
    }

    setFormData(prev => {
      if (prev.coloresDisponibles.includes(color)) return prev;
      return {
        ...prev,
        coloresDisponibles: [...prev.coloresDisponibles, color]
      };
    });

    setNuevoColor('#0066cc');
  };

  const eliminarColor = (colorAEliminar) => {
    setFormData(prev => {
      const nuevosColores = prev.coloresDisponibles.filter(c => c !== colorAEliminar);
      const nuevasImagenesPorColor = { ...prev.imagenesPorColor };
      delete nuevasImagenesPorColor[colorAEliminar];
      
      return {
        ...prev,
        coloresDisponibles: nuevosColores,
        imagenesPorColor: nuevasImagenesPorColor
      };
    });
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ padding: '100px 24px 48px', minHeight: '100vh', background: '#f5f5f7' }}>
      <div className="container">
        {/* Mensajes */}
        {successMessage && (
          <div style={{
            background: '#e5f5e5',
            color: '#00a400',
            padding: '12px 20px',
            borderRadius: '12px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {successMessage}
          </div>
        )}
        
        {errorMessage && (
          <div style={{
            background: '#fff0f0',
            color: '#ff3b30',
            padding: '12px 20px',
            borderRadius: '12px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {errorMessage}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1>Gestión de Productos</h1>
          <button 
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="btn btn-primary"
          >
            {showForm ? 'Cancelar' : '+ Nuevo Producto'}
          </button>
        </div>

        {/* Formulario */}
        {showForm && (
          <div className="card" style={{ marginBottom: '32px', padding: '24px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Nombre */}
                <div>
                  <label className="form-label">Nombre *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    required
                  />
                </div>
                
                {/* SKU */}
                <div>
                  <label className="form-label">SKU (Código)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                    placeholder="PROD-001"
                  />
                </div>
                
                {/* Precio con formato colombiano */}
                <div>
                  <label className="form-label">Precio *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.precio ? formatPrice(formData.precio) : ''}
                    onChange={(e) => {
                      // Permitir solo números y puntos
                      let value = e.target.value.replace(/[^\d.]/g, '');
                      // Convertir a número limpio
                      const numericValue = parsePrice(value);
                      setFormData({...formData, precio: numericValue});
                    }}
                    placeholder="2.000.000"
                  />
                </div>
                
                {/* Stock */}
                <div>
                  <label className="form-label">Stock</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  />
                </div>
                
                {/* Categoría */}
                <div>
                  <label className="form-label">Categoría</label>
                  <select
                    className="form-input"
                    value={formData.categoria?.id || ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      categoria: e.target.value ? { id: parseInt(e.target.value) } : null
                    })}
                  >
                    <option value="">Sin categoría</option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Destacado */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={formData.destacado}
                      onChange={(e) => setFormData({...formData, destacado: e.target.checked})}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span>Producto destacado</span>
                  </label>
                </div>

                {/* Descripción */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Descripción</label>
                  <textarea
                    className="form-input"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    rows="3"
                  />
                </div>

                {/* Especificaciones */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Especificaciones técnicas</label>
                  <textarea
                    className="form-input"
                    value={formData.especificaciones}
                    onChange={(e) => setFormData({...formData, especificaciones: e.target.value})}
                    rows="4"
                    placeholder="Pantalla: 6.1&#34;, Procesador: A16, Batería: 24h..."
                  />
                </div>
              </div>

              {/* 🎨 COLORES DISPONIBLES */}
              <div style={{ marginTop: '24px', padding: '16px', background: '#fafafc', borderRadius: '12px' }}>
                <label className="form-label">Colores disponibles</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <input
                    type="color"
                    value={nuevoColor}
                    onChange={(e) => setNuevoColor(e.target.value)}
                    style={{ width: '48px', height: '48px', borderRadius: '8px', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={nuevoColor}
                    onChange={(e) => setNuevoColor(e.target.value)}
                    className="form-input"
                    style={{ width: '150px' }}
                    placeholder="#0066cc"
                  />
                  <button type="button" className="btn btn-primary" onClick={agregarColor}>
                    Agregar color
                  </button>
                </div>

                {/* Lista de colores */}
                {formData.coloresDisponibles.length > 0 && (
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {formData.coloresDisponibles.map((color, index) => (
                      <div key={`${color}-${index}`} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'white',
                        padding: '4px 12px 4px 8px',
                        borderRadius: '30px',
                        border: '1px solid #e5e5e7'
                      }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: color,
                          border: color === '#ffffff' ? '1px solid #ddd' : 'none'
                        }} />
                        <span style={{ fontSize: '14px' }}>{color}</span>
                        <button
                          type="button"
                          onClick={() => eliminarColor(color)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#ff3b30',
                            fontSize: '18px'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 🖼️ IMAGEN PRINCIPAL */}
              <div style={{ marginTop: '24px' }}>
                <label className="form-label">Imagen principal del producto</label>
                <ImageUpload
                  uploadId="imagen-principal"
                  currentImage={formData.imagenUrl}
                  onImageUploaded={(url) => setFormData(prev => ({ ...prev, imagenUrl: url }))}
                  buttonText="Subir imagen principal"
                />
                {formData.imagenUrl && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#00a400' }}>
                    ✅ Imagen principal guardada
                  </div>
                )}
              </div>

              {/* 🎨 IMÁGENES POR COLOR */}
              {formData.coloresDisponibles.length > 0 && (
                <div style={{ marginTop: '24px' }}>
                  <label className="form-label">Imágenes por color</label>
                  <p style={{ fontSize: '12px', color: '#86868b', marginBottom: '12px' }}>
                    Sube una imagen específica para cada color
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {formData.coloresDisponibles.map((color) => (
                      <div key={color} style={{
                        border: '1px solid #e5e5e7',
                        borderRadius: '12px',
                        padding: '16px',
                        background: '#fafafc'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: color,
                            border: color === '#ffffff' ? '1px solid #ddd' : 'none'
                          }} />
                          <span style={{ fontWeight: '500' }}>{color}</span>
                        </div>
                        
                        {formData.imagenesPorColor[color] && (
                          <img 
                            src={formData.imagenesPorColor[color]} 
                            alt={color}
                            style={{ 
                              width: '100%', 
                              height: '120px', 
                              objectFit: 'contain',
                              borderRadius: '8px',
                              marginBottom: '12px',
                              background: '#f5f5f7'
                            }}
                          />
                        )}
                        
                        <ImageUpload
                          key={color}
                          uploadId={`color-${color.replace('#', '')}`}
                          currentImage={formData.imagenesPorColor[color]}
                          onImageUploaded={(url) => {
                            setFormData(prev => ({
                              ...prev,
                              imagenesPorColor: {
                                ...prev.imagenesPorColor,
                                [color]: url
                              }
                            }));
                          }}
                          buttonText={`Subir imagen para ${color}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 📸 GALERÍA DE IMÁGENES ADICIONALES */}
              <div style={{ marginTop: '24px' }}>
                <label className="form-label">Galería adicional</label>
                <p style={{ fontSize: '12px', color: '#86868b', marginBottom: '12px' }}>
                  Imágenes adicionales que se mostrarán en la galería del producto
                </p>
                
                {/* Mostrar imágenes adicionales existentes */}
                {formData.imagenesAdicionales.length > 0 && (
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {formData.imagenesAdicionales.map((img, imgIndex) => (
                      <div key={imgIndex} style={{ position: 'relative' }}>
                        <img 
                          src={img} 
                          alt={`Adicional ${imgIndex + 1}`} 
                          style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} 
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const nuevas = formData.imagenesAdicionales.filter((_, i) => i !== imgIndex);
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
                            width: '24px',
                            height: '24px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <ImageGalleryUpload
                  existingImages={formData.imagenesAdicionales}
                  onImageUploaded={(url) =>
                    setFormData(prev => ({
                      ...prev,
                      imagenesAdicionales: [...prev.imagenesAdicionales, url]
                    }))
                  }
                />
              </div>

              {/* Botones de acción */}
              <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Actualizar Producto' : 'Crear Producto'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de productos */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {productos.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#86868b' }}>
              No hay productos creados. ¡Crea tu primer producto!
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f5f5f7', borderBottom: '1px solid #d2d2d7' }}>
                <tr>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Imagen</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Nombre</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Categoría</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Precio</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Stock</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Colores</th>
                  <th style={{ padding: '16px', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map(prod => (
                  <tr key={prod.id} style={{ borderBottom: '1px solid #e5e5e7' }}>
                    <td style={{ padding: '16px' }}>
                      {prod.imagenUrl ? (
                        <img src={prod.imagenUrl} alt={prod.nombre} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                      ) : (
                        <div style={{ width: '60px', height: '60px', background: '#f5f5f7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '24px' }}>📷</span>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: '500' }}>{prod.nombre}</div>
                      <div style={{ fontSize: '12px', color: '#86868b' }}>{prod.sku}</div>
                    </td>
                    <td style={{ padding: '16px' }}>{prod.categoria?.nombre || 'Sin categoría'}</td>
                    <td style={{ padding: '16px', fontWeight: '600' }}>${formatPrice(prod.precio)}</td>
                    <td style={{ padding: '16px' }}>
                      <span className={`badge ${prod.stock > 0 ? 'badge-active' : 'badge-inactive'}`}>
                        {prod.stock > 0 ? prod.stock : 'Agotado'}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {prod.coloresDisponibles?.slice(0, 3).map(color => (
                          <div
                            key={color}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: color,
                              border: color === '#ffffff' ? '1px solid #ddd' : 'none'
                            }}
                            title={color}
                          />
                        ))}
                        {prod.coloresDisponibles?.length > 3 && (
                          <span style={{ fontSize: '12px', color: '#86868b' }}>
                            +{prod.coloresDisponibles.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleEdit(prod)}
                        style={{ background: 'none', border: 'none', color: '#0066cc', cursor: 'pointer', marginRight: '12px' }}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDelete(prod.id)}
                        style={{ background: 'none', border: 'none', color: '#ff3b30', cursor: 'pointer' }}
                      >
                        🗑️ Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProductos;