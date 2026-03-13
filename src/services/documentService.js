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