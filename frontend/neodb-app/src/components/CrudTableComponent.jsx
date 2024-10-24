import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Typography, Box, Card, CardContent, CardActions } from '@mui/material';
import { NodeFormModal } from './NodeFormModal';
import { getNodes, deleteNode } from '../services/neo4jServices';

export const CrudTableComponent = ({ nodeType }) => {
  const [nodes, setNodes] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editNode, setEditNode] = useState(null);

  useEffect(() => {
    const fetchNodes = async () => {
      const response = await getNodes(nodeType);
  
      const keyField = {
        application: 'a',
        creator: 'c',
        technology: 't',
      }[nodeType];
  
      const nodesWithId = response.map((node, index) => {
        const flattenedNode = {
          ...node[keyField],
          id: node.id || `${nodeType}-${index}`,
        };
        return flattenedNode;
      });
  
      setNodes(nodesWithId);
    };
  
    fetchNodes();
  }, [nodeType]);

  const handleDelete = async (row) => {
    const keyField = {
      application: 'title',
      creator: 'creator',
      technology: 'technology',
    }[nodeType];

    await deleteNode(nodeType, row[keyField]);
    setNodes(nodes.filter((node) => node[keyField] !== row[keyField]));
  };

  const handleEdit = (node) => {
    setEditNode(node);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setEditNode(null);
    setOpenModal(false);
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 100 },
    ...(nodeType === 'application'
      ? [
          { field: 'title', headerName: 'Título', width: 180 },
          { field: 'projectLink', headerName: 'Enlace del Proyecto', width: 270 },
        ]
      : nodeType === 'creator'
      ? [
          { field: 'creator', headerName: 'Nombre del Creador', width: 150 },
          { field: 'location', headerName: 'Ubicación', width: 150 },
        ]
      : nodeType === 'technology'
      ? [
          { field: 'technology', headerName: 'Tecnología', width: 150 },
        ]
      : []),
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 200,
      renderCell: (params) => (
        <>
          <Button variant="outlined" size="small" onClick={() => handleEdit(params.row)}>
            Editar
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="secondary"
            onClick={() => handleDelete(params.row)}
            sx={{ ml: 1 }}
          >
            Eliminar
          </Button>
        </>
      ),
    },
  ];

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Card sx={{ width: '100%', maxWidth: 1280, borderRadius: '10px', boxShadow: 3, p: 2 }}>
        <CardContent>
          <Typography variant="h5" component="div" align="center" gutterBottom>
            Lista de {nodeType.charAt(0).toUpperCase() + nodeType.slice(1)}
          </Typography>
          <Box display="flex" justifyContent="center" mb={2}>
            <Button variant="contained" color="primary" onClick={() => setOpenModal(true)}>
              Crear Nuevo
            </Button>
          </Box>
          <div style={{ height: 400, width: '100%' }}>
            <DataGrid rows={nodes} columns={columns} pageSize={5} disableSelectionOnClick />
          </div>
        </CardContent>
      </Card>

      {openModal && (
        <NodeFormModal
          open={openModal}
          onClose={handleCloseModal}
          nodeType={nodeType}
          editNode={editNode}
          setNodes={setNodes}
          nodes={nodes}
        />
      )}
    </Box>
  );
};
