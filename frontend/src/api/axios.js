import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // Adjust to your backend URL if needed
  withCredentials: true,
});

// Automatically attach the token to every request if it exists in localStorage
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;