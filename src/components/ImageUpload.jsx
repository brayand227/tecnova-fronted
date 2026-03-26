import React, { useState } from 'react';
import api from '../services/api';

const ImageUpload = ({ onImageUploaded, currentImage, buttonText = "Seleccionar imagen", uploadId }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || '');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (ejemplo: máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('El archivo es demasiado grande. Máximo 5MB');
      return;
    }

    // Mostrar preview SOLO para esta instancia
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Subir archivo
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/upload/imagen', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      onImageUploaded(response.data.url);
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      alert(error.response?.data?.message || 'Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  // ID único para el input
  const inputId = `image-upload-${uploadId || Math.random().toString(36).substr(2, 9)}`;

  return (
    <div>
      <div style={{ marginBottom: '12px' }}>
        {preview ? (
          <img 
            src={preview} 
            alt="Preview" 
            style={{ 
              width: '100%', 
              maxHeight: '200px', 
              objectFit: 'cover',
              borderRadius: '12px',
              marginBottom: '8px'
            }} 
          />
        ) : (
          <div style={{
            width: '100%',
            height: '150px',
            background: '#f5f5f7',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#86868b',
            marginBottom: '8px'
          }}>
            Vista previa
          </div>
        )}
      </div>
      
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        style={{ display: 'none' }}
        id={inputId}
      />
      <label
        htmlFor={inputId}
        className="btn btn-outline"
        style={{ 
          display: 'inline-block',
          cursor: uploading ? 'not-allowed' : 'pointer',
          opacity: uploading ? 0.5 : 1
        }}
      >
        {uploading ? 'Subiendo...' : buttonText}
      </label>
      
      {uploading && (
        <div style={{ marginTop: '8px' }}>
          <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;