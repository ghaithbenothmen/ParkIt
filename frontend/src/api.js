import axios from 'axios';

export const api = axios.create({
    baseURL: "http://localhost:4000/api/auth/",
     /* withCredentials: true, */
});

export const googleAuth = (code) => api.get(`/google?code=${code}`);