import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // apna backend base URL yahan daalo
  withCredentials: true, // cookie (token) bhejne ke liye zaroori hai
});

export default api;