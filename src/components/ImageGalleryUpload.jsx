import React, { useState } from 'react';
import api from '../services/api';

const ImageGalleryUpload = ({ onImageUploaded, existingImages = [] }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/upload/imagen', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // 🔥 IMPORTANTE: devolver objeto con ID único + URL
      const imageObject = {
        id: Date.now() + Math.random(), // ID único para React
        url: response.data.url
      };

      onImageUploaded(imageObject);

    } catch (error) {
      console.error('Error subiendo imagen:', error);
      alert('Error al subir la imagen');
    } finally {
      setUploading(false);
      e.target.value = null; // 👈 reset input (evita bugs al subir misma imagen)
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        style={{ display: 'none' }}
        id="gallery-upload-input"
      />

      <label
        htmlFor="gallery-upload-input"
        className="btn btn-outline"
        style={{ 
          display: 'inline-block',
          cursor: uploading ? 'not-allowed' : 'pointer',
          opacity: uploading ? 0.5 : 1
        }}
      >
        {uploading ? 'Subiendo...' : '+ Agregar imagen a galería'}
      </label>

      {uploading && (
        <div style={{ marginTop: '8px' }}>
          <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
        </div>
      )}
    </div>
  );
};

export default ImageGalleryUpload;