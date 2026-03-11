import axios from 'axios';

const API_URL = "http://localhost:8082/api/auth";

export const registerUser = async (username, password) => {
    const response = await axios.post(`${API_URL}/register`, {
        username: username,
        password: password
    });
    return response.data; 
};

export const loginUser = async (username, password) => {
    const response = await axios.post(`${API_URL}/login`, {
        username: username,
        password: password
    });
    return response.data;
};