import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ImageUpload from '../components/ImageUpload';
import ImageGalleryUpload from '../components/ImageGalleryUpload';
import { formatPrice, parsePrice } from '../utils/formatters';

const AdminProductos = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Estado para variantes
  const [variantes, setVariantes] = useState([]);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: { id: '' },
    imagenUrl: '',
    imagenesAdicionales: [],
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
    setVariantes([]);
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      categoria: { id: '' },
      imagenUrl: '',
      imagenesAdicionales: [],
      destacado: false,
      stock: 0,
      sku: '',
      especificaciones: ''
    });
  };

  // Funciones para variantes
  const agregarVariante = () => {
    setVariantes([...variantes, {
      id: Date.now(),
      color: '',
      colorCodigo: '#000000',
      almacenamiento: '',
      precio: formData.precio || 0,
      stock: 0,
      imagenUrl: ''
    }]);
  };

  const eliminarVariante = (id) => {
    setVariantes(variantes.filter(v => v.id !== id));
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
          : null,
        variantes: variantes.map(v => ({
          color: v.color,
          colorCodigo: v.colorCodigo,
          almacenamiento: v.almacenamiento,
          precio: v.precio,
          stock: v.stock,
          imagenUrl: v.imagenUrl
        }))
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
      destacado: producto.destacado || false,
      stock: producto.stock || 0,
      sku: producto.sku || '',
      especificaciones: producto.especificaciones || ''
    });
    setVariantes(producto.variantes || []);
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
                
                {/* Precio base */}
                <div>
                  <label className="form-label">Precio base *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.precio ? formatPrice(formData.precio) : ''}
                    onChange={(e) => {
                      let value = e.target.value.replace(/[^\d.]/g, '');
                      const numericValue = parsePrice(value);
                      setFormData({...formData, precio: numericValue});
                    }}
                    placeholder="2.000.000"
                  />
                </div>
                
                {/* Stock base */}
                <div>
                  <label className="form-label">Stock base</label>
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

              {/* 🎨 VARIANTES (Colores + Almacenamiento) */}
              <div style={{ marginTop: '24px', borderTop: '1px solid #e5e5e7', paddingTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <label className="form-label" style={{ fontSize: '18px', fontWeight: '600' }}>Variantes (Colores + Almacenamiento)</label>
                  <button type="button" className="btn btn-primary" onClick={agregarVariante} style={{ padding: '8px 16px' }}>
                    + Agregar Variante
                  </button>
                </div>
                
                <p style={{ fontSize: '12px', color: '#86868b', marginBottom: '16px' }}>
                  Agrega diferentes colores, capacidades de almacenamiento y precios específicos para cada variante del producto.
                </p>
                
                {variantes.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', background: '#fafafc', borderRadius: '12px', color: '#86868b' }}>
                    No hay variantes. Haz clic en "+ Agregar Variante" para comenzar.
                  </div>
                )}
                
                {variantes.map((variante, idx) => (
                  <div key={variante.id} style={{ 
                    border: '1px solid #e5e5e7', 
                    borderRadius: '16px', 
                    padding: '20px', 
                    marginBottom: '16px',
                    background: '#fafafc'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '500' }}>Variante {idx + 1}</h4>
                      <button type="button" onClick={() => eliminarVariante(variante.id)} style={{ background: 'none', border: 'none', color: '#ff3b30', cursor: 'pointer', fontSize: '20px' }}>
                        ✕ Eliminar
                      </button>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                      <div>
                        <label className="form-label">Nombre del color *</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Ej: Negro, Blanco, Azul..."
                          value={variante.color}
                          onChange={(e) => {
                            const nuevas = [...variantes];
                            nuevas[idx].color = e.target.value;
                            setVariantes(nuevas);
                          }}
                        />
                      </div>
                      
                      <div>
                        <label className="form-label">Código del color (HEX)</label>
                        <input
                          type="color"
                          className="form-input"
                          value={variante.colorCodigo || '#000000'}
                          onChange={(e) => {
                            const nuevas = [...variantes];
                            nuevas[idx].colorCodigo = e.target.value;
                            setVariantes(nuevas);
                          }}
                          style={{ height: '48px', padding: '4px' }}
                        />
                      </div>
                      
                      <div>
                        <label className="form-label">Almacenamiento *</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Ej: 128GB, 256GB, 512GB"
                          value={variante.almacenamiento}
                          onChange={(e) => {
                            const nuevas = [...variantes];
                            nuevas[idx].almacenamiento = e.target.value;
                            setVariantes(nuevas);
                          }}
                        />
                      </div>
                      
                      <div>
                        <label className="form-label">Precio</label>
                        <input
                          type="number"
                          className="form-input"
                          placeholder="Precio de esta variante"
                          value={variante.precio || ''}
                          onChange={(e) => {
                            const nuevas = [...variantes];
                            nuevas[idx].precio = parseFloat(e.target.value);
                            setVariantes(nuevas);
                          }}
                        />
                      </div>
                      
                      <div>
                        <label className="form-label">Stock</label>
                        <input
                          type="number"
                          className="form-input"
                          placeholder="Stock de esta variante"
                          value={variante.stock || 0}
                          onChange={(e) => {
                            const nuevas = [...variantes];
                            nuevas[idx].stock = parseInt(e.target.value);
                            setVariantes(nuevas);
                          }}
                        />
                      </div>
                      
                      <div>
                        <label className="form-label">Imagen para esta variante (opcional)</label>
                        <ImageUpload 
                          onImageUploaded={(url) => {
                            const nuevas = [...variantes];
                            nuevas[idx].imagenUrl = url;
                            setVariantes(nuevas);
                          }}
                          currentImage={variante.imagenUrl}
                          buttonText="Subir imagen"
                        />
                      </div>
                    </div>
                  </div>
                ))}
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

              {/* 📸 GALERÍA DE IMÁGENES ADICIONALES */}
              <div style={{ marginTop: '24px' }}>
                <label className="form-label">Galería adicional</label>
                <p style={{ fontSize: '12px', color: '#86868b', marginBottom: '12px' }}>
                  Imágenes adicionales que se mostrarán en la galería del producto
                </p>
                
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
                            cursor: 'pointer'
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
                  <th style={{ padding: '16px', textAlign: 'left' }}>Variantes</th>
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
                      {prod.variantes && prod.variantes.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {prod.variantes.slice(0, 3).map((v, i) => (
                              <div
                                key={i}
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  background: v.colorCodigo || '#ccc',
                                  border: '1px solid #ddd',
                                  cursor: 'pointer',
                                  title: `${v.color} - ${v.almacenamiento}`
                                }}
                              />
                            ))}
                          </div>
                          <span style={{ fontSize: '11px', color: '#86868b' }}>
                            {prod.variantes.length} variante(s)
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: '#86868b', fontSize: '12px' }}>Sin variantes</span>
                      )}
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