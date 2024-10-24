import axios from 'axios';

const API_URL = 'http://localhost:5000';

export const uploadCSV = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(`${API_URL}/upload-csv`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const clearDatabase = async () => {
  try {
    const response = await axios.delete('http://localhost:5000/clear-database');
    return response.data;
  } catch (error) {
    console.error('Error clearing the database:', error);
    throw error;
  }
}

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
  const response = await axios.delete(`http://localhost:5000/nodes/${nodeType}/${encodeURIComponent(nodeId)}`, {
    withCredentials: false,
  });
  console.log('Respuesta de eliminación:', response.data);
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


export const getRelations = async (relationType) => {
  try {
    const response = await axios.get('http://localhost:5000/relations', {
      params: { relationType },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching relations:', error);
    return [];
  }
};

export const deleteRelation = async (id) => {
  try {
    await axios.delete(`http://localhost:5000/relations/${id}`);
  } catch (error) {
    console.error('Error deleting relation:', error);
  }
};

export const getApplicationsByTechnology = async (technology) => {
  const response = await axios.get(`http://localhost:5000/applications-by-technology/${technology}`);
  return response.data;
};

export const getSimilarApplications = async (application) => {
  const response = await axios.get(`http://localhost:5000/similar-applications/${application}`);
  return response.data;
};

export const getCreatorApplications = async (creator) => {
  const response = await axios.get(`http://localhost:5000/creator-applications/${creator}`);
  return response.data;
};

export const getTopTechnologies = async () => {
  const response = await axios.get('http://localhost:5000/top-technologies');
  return response.data;
};

export const getUnconnectedCreators = async (technologies) => {
  const response = await axios.post('http://localhost:5000/unconnected-creators', { technologies });
  return response.data;
};

export const getApplicationsByRegion = async (region) => {
  const response = await axios.get(`http://localhost:5000/applications-by-region/${region}`);
  return response.data;
};
