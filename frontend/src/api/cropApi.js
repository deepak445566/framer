import api from "./axios.js";

// Buyer/public
export const getAllCrops = (page = 1, limit = 10) =>
  api.get(`/crop/all?page=${page}&limit=${limit}`);
export const getNearbyCrops = () => api.get("/crop/nearby-crops");
export const searchCrops = (category) => api.get(`/crop/search?category=${category}`);
export const getCropById = (cropId) => api.get(`/crop/${cropId}`);

// Farmer
export const createCrop = (formData) =>
  api.post("/crop/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const getMyCrops = () => api.get("/crop/my-crops");
export const updateCrop = (cropId, data) => api.put(`/crop/${cropId}`, data);
export const deleteCrop = (cropId) => api.delete(`/crop/${cropId}`);
export const closeCropListing = (cropId) => api.patch(`/crop/${cropId}/close`);