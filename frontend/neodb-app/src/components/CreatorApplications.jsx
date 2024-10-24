import React, { useState } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import axios from 'axios';

const CreatorApplications = () => {
  const [creator, setCreator] = useState('');
  const [applications, setApplications] = useState([]);

  const handleSubmit = async () => {
    try {
        const response = await axios.get('http://localhost:5000/applications-by-creator', {
            params: {
              creatorName: creator, // Aquí se asigna el valor de `creatorName` al parámetro de consulta
            },
          });
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications by creator:', error);
    }
  };

  return (
    <div>
      <Typography variant="h5">Aplicaciones por Creador</Typography>
      <TextField
        label="Creador"
        value={creator}
        onChange={(e) => setCreator(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Consultar
      </Button>
      {applications.length > 0 && (
        <div>
          <Typography variant="h6">Aplicaciones creadas por {creator}:</Typography>
          <ul>
            {applications.map((app, index) => (
              <li key={index}>{app.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CreatorApplications;
