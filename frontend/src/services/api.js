const API_URL = "http://localhost:8080/MediSphere/backend/api";

export const api = {
    async post(endpoint, data) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/${endpoint}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data),
        });
        return response.json();
    },

    async get(endpoint) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/${endpoint}`, {
            method: 'GET',
            headers: headers,
        });
        return response.json();
    },

    async upload(endpoint, formData) {
        const token = localStorage.getItem('token');
        const headers = {}; // Let browser set boundary for multipart
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/${endpoint}`, {
            method: 'POST',
            headers: headers,
            body: formData,
        });
        return response.json();
    }
};

export const BASE_URL = "http://localhost:8080/MediSphere/backend";
