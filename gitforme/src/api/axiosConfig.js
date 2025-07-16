// apiClient.js
import axios from 'axios';
const apiServerUrl = import.meta.env.VITE_API_URL;
const apiClient = axios.create({
  baseURL: `${apiServerUrl}`, 
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;