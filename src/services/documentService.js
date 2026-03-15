import axios from 'axios';

const API_URL = "http://localhost:8080/api/workspace";

export const shareDocument = async (documentId, sharedUserId, token) => {
    const response = await axios.post(`${API_URL}/${documentId}/share`,
        {
            targetUserId: sharedUserId,
            role: 'EDITOR'
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    return response.data;
};

export const createDocument = async (token) => {
    const response = await axios.post("http://localhost:8080/api/workspace/create",
        {},
        {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    return response.data;
    
};

export const myDocuments = async (token) => {
    const response = await axios.get("http://localhost:8080/api/workspace/my-documents",
        {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    return response.data;
    
};

export const deleteDocument = async (token, documentId) => {
    await axios.delete(`http://localhost:8080/api/workspace/${documentId}`,
        {
            headers: { 'Authorization': `Bearer ${token}` }
        });
};
