import React, { useState } from 'react';
import { Button, Typography, Card, CardContent, CardActions, Box, Snackbar, Alert } from '@mui/material';
import { uploadCSV, clearDatabase } from '../services/neo4jServices';

const UploadComponent = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState({ text: '', severity: '' }); // Nuevo estado para el mensaje
  const [open, setOpen] = useState(false); // Nuevo estado para controlar el Snackbar

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
        setMessage({ text: 'Archivo cargado con éxito', severity: 'success' });
      } catch (error) {
        console.error('Error uploading file:', error);
        setMessage({ text: 'Error al cargar el archivo', severity: 'error' });
      }
      setOpen(true);
    }
  };

  const handleClearDatabase = async () => {
    try {
      const response = await clearDatabase();
      console.log('Database cleared successfully:', response);
      setMessage({ text: 'Base de datos limpiada con éxito', severity: 'success' });
    } catch (error) {
      console.error('Error clearing database:', error);
      setMessage({ text: 'Error al limpiar la base de datos', severity: 'error' });
    }
    setOpen(true);
  };

  // Función para manejar el cierre del Snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" sx={{ backgroundColor: '#f5f5f5' }}>
      <Card sx={{ maxWidth: 400, width: '90%', borderRadius: '10px', boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" component="div" align="center" gutterBottom>
            Gestión de Base de Datos
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 2 }}>
            Cargar Archivo CSV
          </Typography>
          <Box display="flex" justifyContent="center" sx={{ mb: 2 }}>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".csv"
              style={{ display: 'none' }}
              id="upload-csv"
            />
            <label htmlFor="upload-csv">
              <Button variant="contained" component="span" sx={{ textTransform: 'none', px: 3 }}>
                Seleccionar Archivo
              </Button>
            </label>
          </Box>
          <CardActions sx={{ justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              sx={{ textTransform: 'none', px: 4 }}
              disabled={!file}
            >
              Subir
            </Button>
          </CardActions>
        </CardContent>
        <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleClearDatabase}
            sx={{ textTransform: 'none', px: 3 }}
          >
            Limpiar Base de Datos
          </Button>
        </CardActions>
      </Card>

      {/* Snackbar para mostrar los mensajes de retroalimentación */}
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={message.severity} sx={{ width: '100%' }}>
          {message.text}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UploadComponent;
