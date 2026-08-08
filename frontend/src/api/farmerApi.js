import api from "./axios.js";

export const createFarmerProfile = (data) => api.post("/farmer/create-profile", data);
export const getFarmerProfile = () => api.get("/farmer/profile");
export const updateFarmerProfile = (data) => api.put("/farmer/update-profile", data);
export const getFarmerDashboard = () => api.get("/farmer/dashboard");