// src/api/request.js
import axiosInstance from './axiosInstance';

const request = async ({ method, url, data = null, params = null, headers = {} }) => {
    try {
        const response = await axiosInstance({
            method,
            url,
            data,
            params,
            headers,
        });
        return response;
    } catch (error) {
        // Optional: central error logging
        throw error;
    }
};

export default request;
