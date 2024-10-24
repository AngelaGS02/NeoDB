import React, { useState } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import axios from 'axios';

const ApplicationByTechnology = () => {
  const [technology, setTechnology] = useState('');
  const [applicationsCount, setApplicationsCount] = useState(null);

  const handleSubmit = async () => {
    try {
        const response = await axios.get('http://localhost:5000/applications-by-technology', {
            params: {
              technology: technology,
            },
          });
          
          setApplicationsCount(response.data.applicationCount);
          
    } catch (error) {
      console.error('Error fetching applications by technology:', error);
    }
  };

  return (
    <div>
      <Typography variant="h5">Aplicaciones por Tecnología</Typography>
      <TextField
        label="Tecnología"
        value={technology}
        onChange={(e) => setTechnology(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Consultar
      </Button>
      {applicationsCount !== null && (
        <Typography variant="h6">
          Cantidad de aplicaciones usando {technology}: {applicationsCount}
        </Typography>
      )}
    </div>
  );
};

export default ApplicationByTechnology;
