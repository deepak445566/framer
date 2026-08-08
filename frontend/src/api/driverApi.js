import api from "./axios.js";

// Farmer/Buyer access
export const getAvailableDrivers = () => api.get("/driver/available");
export const getNearbyDrivers = (radius = 50) => api.get(`/driver/nearby?radius=${radius}`);

// Driver own
export const createDriverProfile = (data) => api.post("/driver/create", data);
export const getDriverProfile = () => api.get("/driver/profile");
export const updateDriverProfile = (data) => api.put("/driver/profile", data);
export const getDriverDashboard = () => api.get("/driver/dashboard");
export const toggleAvailability = () => api.patch("/driver/toggle");