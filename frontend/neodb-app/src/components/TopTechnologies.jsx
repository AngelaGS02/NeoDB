import React, { useState } from 'react';
import { Button, Typography } from '@mui/material';
import axios from 'axios';

const TopTechnologies = () => {
  const [technologies, setTechnologies] = useState([]);

  const handleSubmit = async () => {
    try {
      const response = await axios.get('http://localhost:5000/top-technologies');
      setTechnologies(response.data);
    } catch (error) {
      console.error('Error fetching top technologies:', error);
    }
  };

  return (
    <div>
      <Typography variant="h5">Top 5 Tecnologías Emergentes</Typography>
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Consultar
      </Button>
      {technologies.length > 0 && (
        <div>
          <Typography variant="h6">Top Tecnologías:</Typography>
          <ul>
            {technologies.map((tech, index) => (
              <li key={index}>{tech.name} - Usada en {tech.count} aplicaciones</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TopTechnologies;
