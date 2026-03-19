import React, { useState } from 'react';
import api from '../services/api';

const ImageUpload = ({ onImageUploaded, currentImage }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || '');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Mostrar preview
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
      alert('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

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
        id="image-upload-input"
      />
      <label
        htmlFor="image-upload-input"
        className="btn btn-outline"
        style={{ 
          display: 'inline-block',
          cursor: uploading ? 'not-allowed' : 'pointer',
          opacity: uploading ? 0.5 : 1
        }}
      >
        {uploading ? 'Subiendo...' : 'Seleccionar imagen'}
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