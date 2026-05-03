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

  // 🔥 NUEVO: variantes
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
    try {
      const [prod, cat] = await Promise.all([
        api.get('/admin/productos'),
        api.get('/categorias')
      ]);
      setProductos(prod.data);
      setCategorias(cat.data);
    } catch (err) {
      setErrorMessage('Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setVariantes([]); // 👈 reset variantes
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

  // 🔥 FUNCIONES VARIANTES
  const agregarVariante = () => {
    setVariantes(prev => [
      ...prev,
      {
        id: Date.now(),
        color: '',
        colorCodigo: '#000000',
        almacenamiento: '',
        precio: 0,
        stock: 0,
        imagenUrl: ''
      }
    ]);
  };

  const eliminarVariante = (id) => {
    setVariantes(prev => prev.filter(v => v.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const productoData = {
        ...formData,
        variantes, // 👈 aquí se envían
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock) || 0,
        categoria: formData.categoria?.id
          ? { id: parseInt(formData.categoria.id) }
          : null
      };

      if (editingProduct) {
        await api.put(`/admin/productos/${editingProduct.id}`, productoData);
        setSuccessMessage('Producto actualizado');
      } else {
        await api.post('/admin/productos', productoData);
        setSuccessMessage('Producto creado');
      }

      resetForm();
      setShowForm(false);
      loadData();

    } catch (err) {
      setErrorMessage('Error al guardar');
    }
  };

  const handleEdit = (producto) => {
    setEditingProduct(producto);
    setVariantes(producto.variantes || []);

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

    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Eliminar producto?')) return;

    await api.delete(`/admin/productos/${id}`);
    loadData();
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div style={{ padding: '40px' }}>

      <h1>Admin Productos</h1>

      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancelar' : 'Nuevo'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit}>

          <input
            placeholder="Nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          />

          <input
            placeholder="Precio"
            value={formData.precio}
            onChange={(e) => setFormData({ ...formData, precio: parsePrice(e.target.value) })}
          />

          <input
            placeholder="Stock"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
          />

          {/* 🔥 VARIANTES */}
          <div style={{ marginTop: '20px' }}>
            <h3>Variantes</h3>

            <button type="button" onClick={agregarVariante}>
              + Variante
            </button>

            {variantes.map((v, i) => (
              <div key={v.id} style={{ border: '1px solid #ccc', padding: '10px', marginTop: '10px' }}>

                <input
                  placeholder="Color"
                  value={v.color}
                  onChange={(e) => {
                    const copy = [...variantes];
                    copy[i].color = e.target.value;
                    setVariantes(copy);
                  }}
                />

                <input
                  type="color"
                  value={v.colorCodigo}
                  onChange={(e) => {
                    const copy = [...variantes];
                    copy[i].colorCodigo = e.target.value;
                    setVariantes(copy);
                  }}
                />

                <input
                  placeholder="Almacenamiento"
                  value={v.almacenamiento}
                  onChange={(e) => {
                    const copy = [...variantes];
                    copy[i].almacenamiento = e.target.value;
                    setVariantes(copy);
                  }}
                />

                <input
                  type="number"
                  placeholder="Precio"
                  value={v.precio}
                  onChange={(e) => {
                    const copy = [...variantes];
                    copy[i].precio = parseFloat(e.target.value);
                    setVariantes(copy);
                  }}
                />

                <input
                  type="number"
                  placeholder="Stock"
                  value={v.stock}
                  onChange={(e) => {
                    const copy = [...variantes];
                    copy[i].stock = parseInt(e.target.value);
                    setVariantes(copy);
                  }}
                />

                <ImageUpload
                  currentImage={v.imagenUrl}
                  onImageUploaded={(url) => {
                    const copy = [...variantes];
                    copy[i].imagenUrl = url;
                    setVariantes(copy);
                  }}
                />

                <button type="button" onClick={() => eliminarVariante(v.id)}>
                  Eliminar
                </button>

              </div>
            ))}
          </div>

          <button type="submit">Guardar</button>
        </form>
      )}

      {/* LISTA */}
      <ul>
        {productos.map(p => (
          <li key={p.id}>
            {p.nombre} - ${p.precio}
            <button onClick={() => handleEdit(p)}>Editar</button>
            <button onClick={() => handleDelete(p.id)}>Eliminar</button>
          </li>
        ))}
      </ul>

    </div>
  );
};

export default AdminProductos;