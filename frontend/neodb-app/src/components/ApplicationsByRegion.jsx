import React, { useState } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import axios from 'axios';

const ApplicationsByRegion = () => {
  const [region, setRegion] = useState('');
  const [applications, setApplications] = useState([]);

  const handleSubmit = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/applications-by-region/${region}`);
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications by region:', error);
    }
  };

  return (
    <div>
      <Typography variant="h5">Aplicaciones por Región</Typography>
      <TextField
        label="Región"
        value={region}
        onChange={(e) => setRegion(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Consultar
      </Button>
      {applications.length > 0 && (
        <div>
          <Typography variant="h6">Aplicaciones de la región {region}:</Typography>
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

export default ApplicationsByRegion;
