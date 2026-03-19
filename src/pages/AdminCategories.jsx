import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ImageUpload from '../components/ImageUpload';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    imagenUrl: '',
    imagenesAdicionales: [],
    orden: 0,
    activa: true
  });

  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/');
      return;
    }
    loadCategories();
  }, []);

  // Cargar categorías
  const loadCategories = async () => {
    try {
      const response = await api.get('/admin/categorias/todas');
      setCategories(response.data);
    } catch (error) {
      console.error('Error cargando categorías:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Recargar categorías después de eliminar productos
  const refreshCategories = async () => {
    try {
      const response = await api.get('/admin/categorias/todas');
      setCategories(response.data);
    } catch (error) {
      console.error('Error recargando categorías:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (editingCategory) {
        await api.put(`/admin/categorias/${editingCategory.id}`, formData);
        setSuccessMessage('✅ Categoría actualizada exitosamente');
      } else {
        await api.post('/admin/categorias', formData);
        setSuccessMessage('✅ Categoría creada exitosamente');
      }

      loadCategories();
      resetForm();
      setShowForm(false);

      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (error) {
      setErrorMessage('Error: ' + (error.response?.data || 'Error al guardar'));
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);

    setFormData({
      nombre: category.nombre,
      descripcion: category.descripcion || '',
      imagenUrl: category.imagenUrl || '',
      imagenesAdicionales: category.imagenesAdicionales || [],
      orden: category.orden || 0,
      activa: category.activa
    });

    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta categoría?')) return;

    try {
      await api.delete(`/admin/categorias/${id}`);
      loadCategories();

      setSuccessMessage('✅ Categoría eliminada exitosamente');
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (error) {
      const errorMsg = error.response?.data || 'Error al eliminar';
      alert(`❌ ${errorMsg}`);
    }
  };

  const handleToggleActive = async (id, currentActive) => {
    try {
      await api.patch(`/admin/categorias/${id}/estado?activa=${!currentActive}`);
      loadCategories();
    } catch (error) {
      alert('Error al cambiar estado');
    }
  };

  const resetForm = () => {
    setEditingCategory(null);

    setFormData({
      nombre: '',
      descripcion: '',
      imagenUrl: '',
      imagenesAdicionales: [],
      orden: 0,
      activa: true
    });
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
    <div style={{ padding: '100px 24px 48px', minHeight: '100vh', background: '#f5f5f7' }}>
      <div className="container">

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

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <h1>Gestión de Categorías</h1>

          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="btn btn-primary"
          >
            {showForm ? 'Cancelar' : '+ Nueva Categoría'}
          </button>
        </div>

        {showForm && (
          <div className="card" style={{ marginBottom: '32px' }}>

            <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </h2>

            <form onSubmit={handleSubmit}>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                <div>
                  <label className="form-label">Nombre *</label>

                  <input
                    type="text"
                    className="form-input"
                    value={formData.nombre}
                    onChange={(e) => setFormData({
                      ...formData,
                      nombre: e.target.value
                    })}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Orden</label>

                  <input
                    type="number"
                    className="form-input"
                    value={formData.orden}
                    onChange={(e) => setFormData({
                      ...formData,
                      orden: parseInt(e.target.value)
                    })}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Descripción</label>

                  <textarea
                    className="form-input"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({
                      ...formData,
                      descripcion: e.target.value
                    })}
                    rows="3"
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Imagen principal</label>

                  <ImageUpload
                    onImageUploaded={(url) => setFormData({
                      ...formData,
                      imagenUrl: url
                    })}
                    currentImage={formData.imagenUrl}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={formData.activa}
                      onChange={(e) => setFormData({
                        ...formData,
                        activa: e.target.checked
                      })}
                    />
                    <span>Categoría activa</span>
                  </label>
                </div>

              </div>

              <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>

                <button type="submit" className="btn btn-primary">
                  {editingCategory ? 'Actualizar' : 'Crear'} Categoría
                </button>

                {editingCategory && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn btn-outline"
                  >
                    Cancelar
                  </button>
                )}

              </div>

            </form>
          </div>
        )}

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>

            <thead style={{ background: '#f5f5f7', borderBottom: '1px solid #d2d2d7' }}>
              <tr>
                <th style={{ padding: '16px', textAlign: 'left' }}>Imagen</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Nombre</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Descripción</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Estado</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Productos</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>

            <tbody>

              {categories.map(cat => (
                <tr key={cat.id} style={{ borderBottom: '1px solid #e5e5e7' }}>

                  <td style={{ padding: '16px' }}>
                    {cat.imagenUrl ? (
                      <img
                        src={cat.imagenUrl}
                        alt={cat.nombre}
                        style={{
                          width: '60px',
                          height: '60px',
                          objectFit: 'cover',
                          borderRadius: '8px'
                        }}
                      />
                    ) : (
                      <span>📁</span>
                    )}
                  </td>

                  <td style={{ padding: '16px', fontWeight: '500' }}>
                    {cat.nombre}
                  </td>

                  <td style={{ padding: '16px', color: '#86868b' }}>
                    {cat.descripcion || '-'}
                  </td>

                  <td style={{ padding: '16px' }}>
                    {cat.activa ? '🟢 Activa' : '🔴 Inactiva'}
                  </td>

                  <td style={{ padding: '16px' }}>
                    {cat.productos?.length || 0} productos
                  </td>

                  <td style={{ padding: '16px', textAlign: 'right' }}>

                    <button
                      onClick={() => handleToggleActive(cat.id, cat.activa)}
                      style={{ marginRight: '12px' }}
                    >
                      {cat.activa ? 'Desactivar' : 'Activar'}
                    </button>

                    <button
                      onClick={() => handleEdit(cat)}
                      style={{ marginRight: '12px' }}
                    >
                      ✏️ Editar
                    </button>

                    <button
                      onClick={() => handleDelete(cat.id)}
                      disabled={cat.productos?.length > 0}
                    >
                      🗑️ Eliminar
                    </button>

                  </td>

                </tr>
              ))}

            </tbody>

          </table>
        </div>

      </div>
    </div>
  );
};

export default AdminCategories;