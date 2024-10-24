import React, { useState } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import axios from 'axios';

const UnconnectedCreators = () => {
  const [technologies, setTechnologies] = useState('');
  const [creators, setCreators] = useState([]);

  const handleSubmit = async () => {
    try {
      const techList = technologies.split(',').map((tech) => tech.trim());
      const response = await axios.post('http://localhost:5000/unconnected-creators', { technologies: techList });
      setCreators(response.data);
    } catch (error) {
      console.error('Error fetching unconnected creators:', error);
    }
  };

  return (
    <div>
      <Typography variant="h5">Creadores que Nunca han Trabajado Juntos</Typography>
      <TextField
        label="Tecnologías (separadas por comas)"
        value={technologies}
        onChange={(e) => setTechnologies(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Consultar
      </Button>
      {creators.length > 0 && (
        <div>
          <Typography variant="h6">Creadores disponibles:</Typography>
          <ul>
            {creators.map((creator, index) => (
              <li key={index}>{creator.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UnconnectedCreators;
