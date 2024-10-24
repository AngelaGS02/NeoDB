import React, { useState, useEffect } from 'react';
import { Modal, Box, TextField, Button } from '@mui/material';
import { createNode, updateNode } from '../services/neo4jServices';

export const NodeFormModal = ({ open, onClose, nodeType, editNode, setNodes, nodes }) => {
  const [nodeData, setNodeData] = useState(editNode || {});

  useEffect(() => {
    setNodeData(editNode || {});
  }, [editNode]);

  const handleFieldChange = (field, value) => {
    setNodeData({ ...nodeData, [field]: value });
  };



  const handleSubmit = async () => {
    if (editNode) {      
      let updatedNode = await updateNode(nodeType, editNode.title, nodeData);
      updatedNode = Array.isArray(updatedNode) ? updatedNode[0] : updatedNode;
      if (!updatedNode) {
        console.error("Error: updatedNode no se ha definido correctamente.");
        return;
      }
      updatedNode = updatedNode.a
      updatedNode["id"] = `${nodeType}-${nodes.length}`;
      updatedNode = assignNode(updatedNode, nodeType);
      setNodes(nodes.map((node) => (node.id === editNode.id ? updatedNode : node)));
    } else {
      const response = await createNode(nodeType, nodeData);
      let newNode = Array.isArray(response) ? response[0] : response;
      if (!newNode) {
        console.error("Error: newNode no se ha definido correctamente.");
        return;
      }  
      newNode["id"] = `${nodeType}-${nodes.length}`;
      newNode = assignNode(newNode, nodeType);
      setNodes([...nodes, newNode]);
    }
    onClose();
  };
  
  const assignNode = (node, nodeType) => {
    if (!node) return {};
    if (nodeType === 'application') {
      return {
        ...node,
        title: node.title || '',
        projectLink: node.projectLink || '',
      };
    } else if (nodeType === 'creator') {
      return {
        ...node,
        creator: node.creator || '',
        location: node.location || '',
      };
    } else if (nodeType === 'technology') {
      return {
        ...node,
        technology: node.technology || '',
      };
    }
    return node;
  };
  

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', p: 4 }}>
        <h2>{editNode ? `Editar ${nodeType}` : `Crear Nuevo ${nodeType}`}</h2>
        {nodeType === 'application' && (
          <>
            <TextField
              label="Título de la Aplicación"
              value={nodeData.title || ''}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Enlace del Proyecto"
              value={nodeData.projectLink || ''}
              onChange={(e) => handleFieldChange('projectLink', e.target.value)}
              fullWidth
              margin="normal"
            />
          </>
        )}
        {nodeType === 'creator' && (
          <>
            <TextField
              label="Nombre del Creador"
              value={nodeData.creator || ''}
              onChange={(e) => handleFieldChange('creator', e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Ubicación"
              value={nodeData.location || ''}
              onChange={(e) => handleFieldChange('location', e.target.value)}
              fullWidth
              margin="normal"
            />
          </>
        )}
        {nodeType === 'technology' && (
          <TextField
            label="Nombre de la Tecnología"
            value={nodeData.technology || ''}
            onChange={(e) => handleFieldChange('technology', e.target.value)}
            fullWidth
            margin="normal"
          />
        )}
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {editNode ? 'Actualizar' : 'Crear'}
        </Button>
      </Box>
    </Modal>
  );
};
