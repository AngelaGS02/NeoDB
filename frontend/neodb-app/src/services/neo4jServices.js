import axios from 'axios';

const API_URL = 'http://localhost:5000';

export const uploadCSV = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(`${API_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const createNode = async (nodeType, nodeData) => {
  const response = await axios.post(`${API_URL}/nodes/${nodeType}`, nodeData);
  return response.data;
};

export const getNodes = async (nodeType) => {
  const response = await axios.get(`${API_URL}/nodes/${nodeType}`);
  return response.data;
};

export const updateNode = async (nodeType, nodeId, updatedData) => {
  const response = await axios.put(`${API_URL}/nodes/${nodeType}/${nodeId}`, updatedData);
  return response.data;
};

export const deleteNode = async (nodeType, nodeId) => {
  const response = await axios.delete(`${API_URL}/nodes/${nodeType}/${nodeId}`);
  return response.data;
};

export const createRelation = async (relationType, node1Id, node2Id) => {
  const response = await axios.post(`${API_URL}/relations`, {
    type: relationType,
    node1: node1Id,
    node2: node2Id,
  });
  return response.data;
};