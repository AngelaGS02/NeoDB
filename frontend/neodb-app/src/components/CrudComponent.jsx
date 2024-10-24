import React, { useState } from 'react';
import { FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { CrudTableComponent } from './CrudTableComponent';
import { RelationshipForm } from './RelationshipForm';

const CrudComponent = () => {
  const [nodeType, setNodeType] = useState('application'); // Para seleccionar el tipo de nodo

  // Manejar cambio de tipo de nodo
  const handleNodeTypeChange = (event) => {
    setNodeType(event.target.value);
  };

  return (
    <div>
      <Typography variant="h5">CRUD de Nodos y Relaciones</Typography>

      {/* Selector de Tipo de Nodo */}
      <FormControl fullWidth>
        <InputLabel>Tipo de Nodo</InputLabel>
        <Select value={nodeType} onChange={handleNodeTypeChange}>
          <MenuItem value="application">Application</MenuItem>
          <MenuItem value="creator">Creator</MenuItem>
          <MenuItem value="technology">Technology</MenuItem>
        </Select>
      </FormControl>

      {/* Componente para Visualización y CRUD de Nodos */}
      <CrudTableComponent nodeType={nodeType} />

      {/* Componente para Crear Relaciones */}
      <RelationshipForm />
    </div>
  );
};

export default CrudComponent;
