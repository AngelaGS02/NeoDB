import React, { useState } from 'react';
import { Button, Typography } from '@mui/material';
import { uploadCSV } from '../services/neo4jServices';

const UploadComponent = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (file) {
      try {
        const response = await uploadCSV(file);
        console.log('File uploaded successfully:', response);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };

  return (
    <div>
      <Typography variant="h5">Cargar Archivo CSV</Typography>
      <input type="file" onChange={handleFileChange} />
      <Button variant="contained" color="primary" onClick={handleUpload}>
        Subir
      </Button>
    </div>
  );
};

export default UploadComponent;
