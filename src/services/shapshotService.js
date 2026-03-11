import axios from 'axios';

const API_URL = "http://localhost:8081/api/documents";

export const getInitialDocument = async (documentId) => {
    const response = await axios.get(`${API_URL}/${documentId}/snapshot`);
    return response.data; 
};
