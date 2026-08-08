import api from "./axios.js";

export const getBuyerProfile = () => api.get("/buyer/profile");
export const createBuyerProfile = (data) => api.post("/buyer/profile", data);
export const updateBuyerProfile = (data) => api.put("/buyer/profile", data);
export const getBuyerDashboard = () => api.get("/buyer/dashboard");
export const getMyOrders = () => api.get("/buyer/orders");
export const getPurchaseHistory = () => api.get("/buyer/purchase-history");