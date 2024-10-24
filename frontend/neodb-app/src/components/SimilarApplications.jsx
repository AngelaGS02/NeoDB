import React, { useState } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import axios from 'axios';

const SimilarApplications = () => {
  const [application, setApplication] = useState('');
  const [similarApplications, setSimilarApplications] = useState([]);
  const [message, setMessage] = useState(''); // Para manejar el mensaje de "No se encontraron aplicaciones similares"

  const handleSubmit = async () => {
    try {
      const response = await axios.get('http://localhost:5000/similar-applications', {
        params: {
          appTitle: application, // Aquí se asigna el valor de `application` al parámetro `appTitle`
        },
      });
      console.log(response.data);

      // Verificar si la respuesta contiene un mensaje
      if (response.data.message) {
        setMessage(response.data.message);
        setSimilarApplications([]); // Vaciar la lista de aplicaciones similares si hay un mensaje
      } else {
        setMessage(''); // Limpiar cualquier mensaje previo
        setSimilarApplications(response.data); // Asignar aplicaciones similares
      }
    } catch (error) {
      console.error('Error fetching similar applications:', error);
      setMessage('Error al buscar aplicaciones similares');
    }
  };

  return (
    <div>
      <Typography variant="h5">Aplicaciones Similares</Typography>
      <TextField
        label="Nombre de la Aplicación"
        value={application}
        onChange={(e) => setApplication(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Consultar
      </Button>
      {message && (
        <Typography variant="body1" color="error">
          {message}
        </Typography>
      )}
      {similarApplications.length > 0 && (
        <div>
          <Typography variant="h6">Aplicaciones similares a {application}:</Typography>
          <ul>
            {similarApplications.map((app, index) => (
              <li key={index}>
                {app.name} - Coincidencias: {app.matches}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SimilarApplications;
