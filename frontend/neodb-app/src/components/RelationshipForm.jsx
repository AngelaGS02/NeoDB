import React, { useState, useEffect } from 'react';
import { Button, Select, MenuItem, FormControl, InputLabel, Typography, Box, Card, CardContent, CardActions } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { createRelation, getNodes, getRelations, deleteRelation } from '../services/neo4jServices';

export const RelationshipForm = () => {
  const [relationType, setRelationType] = useState('CREATED_BY');
  const [relatedNode1, setRelatedNode1] = useState('');
  const [relatedNode2, setRelatedNode2] = useState('');
  const [nodes1, setNodes1] = useState([]);
  const [nodes2, setNodes2] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [relations, setRelations] = useState([]);

  // Fetch nodes según el tipo de relación seleccionado
  useEffect(() => {
    const fetchNodes = async () => {
      try {
        if (relationType === 'CREATED_BY') {
          const applications = await getNodes('application');
          const creators = await getNodes('creator');
          setNodes1(applications.map((node, index) => ({ ...node.a, id: node.id || `application-${index}` })));
          setNodes2(creators.map((node, index) => ({ ...node.c, id: node.id || `creator-${index}` })));
        } else if (relationType === 'USES') {
          const applications = await getNodes('application');
          const technologies = await getNodes('technology');
          setNodes1(applications.map((node, index) => ({ ...node.a, id: node.id || `application-${index}` })));
          setNodes2(technologies.map((node, index) => ({ ...node.t, id: node.id || `technology-${index}` })));
        }
      } catch (error) {
        console.error('Error fetching nodes:', error);
      }
    };
    fetchNodes();
  }, [relationType]);

  // Fetch relations según el tipo de relación seleccionado
  useEffect(() => {
    const fetchRelations = async () => {
      try {
        const response = await getRelations(relationType);
        console.log("Get de Relations:");
        console.log(response);
        
        
        setRelations(response);
      } catch (error) {
        console.error('Error fetching relations:', error);
      }
    };
    fetchRelations();
  }, [relationType]);

  const handleCreateRelation = async () => {
    if (relatedNode1 && relatedNode2 && relationType) {
      try {
        await createRelation(relationType, relatedNode1, relatedNode2);
        setRelatedNode1('');
        setRelatedNode2('');
        setSuccessMessage('Relación creada exitosamente');
      } catch (error) {
        console.error('Error creando relación:', error);
        setSuccessMessage('Error al crear la relación');
      }
    } else {
      setSuccessMessage('Por favor, complete todos los campos');
    }
  };

  const handleDeleteRelation = async (id) => {
    try {
      await deleteRelation(id);
      setRelations(relations.filter((relation) => relation.id !== id));
    } catch (error) {
      console.error('Error deleting relation:', error);
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'node1', headerName: 'Nodo 1', width: 150 },
    { field: 'node2', headerName: 'Nodo 2', width: 150 },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 200,
      renderCell: (params) => (
        <>
          <Button color="secondary" onClick={() => handleDeleteRelation(params.row.id)}>Eliminar</Button>
        </>
      ),
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '70vh' }}>
      <Card sx={{ width: '100%', maxWidth: 1280, borderRadius: '10px', boxShadow: 3, marginBottom: 4 }}>
        <CardContent>
          <Typography variant="h5" component="div" align="center" gutterBottom>
            Crear Relaciones
          </Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel>Tipo de Relación</InputLabel>
            <Select
              value={relationType}
              onChange={(e) => setRelationType(e.target.value)}
              variant="outlined"
              fullWidth
            >
              <MenuItem value="CREATED_BY">CREATED_BY</MenuItem>
              <MenuItem value="USES">USES</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Nodo 1</InputLabel>
            <Select
              value={relatedNode1 || ''}
              onChange={(e) => setRelatedNode1(e.target.value)}
              variant="outlined"
              fullWidth
            >
              {nodes1.map((node) => (
                <MenuItem key={node.id} value={node.title || node.creator || node.technology}>
                  {node.title || node.creator || node.technology}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Nodo 2</InputLabel>
            <Select
              value={relatedNode2 || ''}
              onChange={(e) => setRelatedNode2(e.target.value)}
              variant="outlined"
              fullWidth
            >
              {nodes2.map((node) => (
                <MenuItem key={node.id} value={node.title || node.creator || node.technology}>
                  {node.title || node.creator || node.technology}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {successMessage && (
            <Typography variant="body2" color="primary" align="center" gutterBottom>
              {successMessage}
            </Typography>
          )}
        </CardContent>
        <CardActions sx={{ justifyContent: 'center' }}>
          <Button
            onClick={handleCreateRelation}
            variant="contained"
            color="primary"
            size="large"
            sx={{ width: '90%', marginBottom: 2 }}
          >
            Crear Relación
          </Button>
        </CardActions>
      </Card>

      {/* Tabla de Relaciones */}
      <Box sx={{ width: '100%', maxWidth: 1280, borderRadius: '10px', boxShadow: 3 }}>
        <Typography variant="h6" align="center" gutterBottom>
          Relaciones Existentes
        </Typography>
        <div style={{ height: 400, width: '100%' }}>
          <DataGrid rows={relations} columns={columns} pageSize={5} />
        </div>
      </Box>
    </Box>
  );
};
