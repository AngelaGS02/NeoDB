import React, { useEffect, useState } from 'react';
import { Button, TextField, Typography, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { createNode, getNodes, updateNode, deleteNode, createRelation } from '../services/neo4jServices';

const CrudComponent = () => {
  const [nodes, setNodes] = useState([]);
  const [nodeType, setNodeType] = useState('application'); // Para seleccionar el tipo de nodo
  const [newNode, setNewNode] = useState({});
  const [editNode, setEditNode] = useState(null);

  const [relations, setRelations] = useState([]); // Para las relaciones
  const [relatedNode1, setRelatedNode1] = useState(''); // Nodo 1 para la relación
  const [relatedNode2, setRelatedNode2] = useState(''); // Nodo 2 para la relación
  const [relationType, setRelationType] = useState('CREATED_BY'); // Tipo de relación

  useEffect(() => {
    // Cargar los nodos existentes
    const fetchNodes = async () => {
      const response = await getNodes(nodeType); // Obtener nodos según el tipo
      setNodes(response);
    };

    fetchNodes();
  }, [nodeType]);

  // Crear nuevo nodo
  const handleCreate = async () => {
    if (newNode) {
      const response = await createNode(nodeType, newNode);
      setNodes([...nodes, response]);
      setNewNode({});
    }
  };

  // Actualizar nodo
  const handleUpdate = async () => {
    if (editNode) {
      const response = await updateNode(nodeType, editNode.id, editNode);
      setNodes(nodes.map(node => (node.id === editNode.id ? response : node)));
      setEditNode(null);
    }
  };

  // Eliminar nodo
  const handleDelete = async (id) => {
    await deleteNode(nodeType, id);
    setNodes(nodes.filter(node => node.id !== id));
  };

  // Crear relación
  const handleCreateRelation = async () => {
    if (relatedNode1 && relatedNode2 && relationType) {
      const response = await createRelation(relationType, relatedNode1, relatedNode2);
      setRelations([...relations, response]);
      setRelatedNode1('');
      setRelatedNode2('');
    }
  };

  // Manejar cambio de tipo de nodo
  const handleNodeTypeChange = (event) => {
    setNodeType(event.target.value);
    setNewNode({});
    setEditNode(null);
  };

  // Manejar cambios en los campos del nodo
  const handleFieldChange = (field, value) => {
    setNewNode({
      ...newNode,
      [field]: value,
    });
  };

  return (
    <div>
      <Typography variant="h5">CRUD de Nodos y Relaciones</Typography>

      <FormControl fullWidth>
        <InputLabel>Tipo de Nodo</InputLabel>
        <Select value={nodeType} onChange={handleNodeTypeChange}>
          <MenuItem value="application">Application</MenuItem>
          <MenuItem value="creator">Creator</MenuItem>
          <MenuItem value="technology">Technology</MenuItem>
        </Select>
      </FormControl>

      {/* Mostrar los campos específicos del tipo de nodo */}
      {nodeType === 'application' && (
        <>
          <TextField
            label="Título de la Aplicación"
            value={newNode.title || ''}
            onChange={(e) => handleFieldChange('title', e.target.value)}
          />
          <TextField
            label="Enlace del Proyecto"
            value={newNode.projectLink || ''}
            onChange={(e) => handleFieldChange('projectLink', e.target.value)}
          />
        </>
      )}

      {nodeType === 'creator' && (
        <>
          <TextField
            label="Nombre del Creador"
            value={newNode.creator || ''}
            onChange={(e) => handleFieldChange('creator', e.target.value)}
          />
          <TextField
            label="Ubicación"
            value={newNode.location || ''}
            onChange={(e) => handleFieldChange('location', e.target.value)}
          />
        </>
      )}

      {nodeType === 'technology' && (
        <TextField
          label="Nombre de la Tecnología"
          value={newNode.technology || ''}
          onChange={(e) => handleFieldChange('technology', e.target.value)}
        />
      )}

      <Button onClick={handleCreate} variant="contained" color="primary">
        Crear {nodeType}
      </Button>

      {nodes.map(node => (
        <div key={node.id}>
          <Typography>{nodeType === 'application' ? node.title : nodeType === 'creator' ? node.creator : node.technology}</Typography>
          <Button onClick={() => setEditNode(node)}>Editar</Button>
          <Button onClick={() => handleDelete(node.id)} color="secondary">Eliminar</Button>
        </div>
      ))}

      {editNode && (
        <>
          <TextField
            label={`Editar ${nodeType}`}
            value={editNode[nodeType === 'application' ? 'title' : nodeType === 'creator' ? 'creator' : 'technology'] || ''}
            onChange={(e) => setEditNode({ ...editNode, [nodeType === 'application' ? 'title' : nodeType === 'creator' ? 'creator' : 'technology']: e.target.value })}
          />
          <Button onClick={handleUpdate} variant="contained" color="primary">
            Actualizar
          </Button>
        </>
      )}

      {/* Relación entre nodos */}
      <Typography variant="h6">Crear Relaciones</Typography>
      <FormControl fullWidth>
        <InputLabel>Tipo de Relación</InputLabel>
        <Select value={relationType} onChange={(e) => setRelationType(e.target.value)}>
          <MenuItem value="CREATED_BY">CREATED_BY</MenuItem>
          <MenuItem value="USES">USES</MenuItem>
        </Select>
      </FormControl>

      <TextField
        label="Nodo 1 (ID)"
        value={relatedNode1}
        onChange={(e) => setRelatedNode1(e.target.value)}
      />
      <TextField
        label="Nodo 2 (ID)"
        value={relatedNode2}
        onChange={(e) => setRelatedNode2(e.target.value)}
      />
      <Button onClick={handleCreateRelation} variant="contained" color="primary">
        Crear Relación
      </Button>
    </div>
  );
};

export default CrudComponent;
