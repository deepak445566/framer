import api from "./axios.js";

// ---------------- Auth (/api/admin/auth) ----------------
export const adminLogin = (data) => api.post("/admin/auth/login", data);
export const adminLogout = () => api.post("/admin/auth/logout");
export const getAdminMe = () => api.get("/admin/auth/me");

// ---------------- Services (/api/admin/services) ----------------

// Dashboard
export const getDashboardStats = () => api.get("/admin/services/dashboard");

// Users
export const getAllUsers = () => api.get("/admin/services/users");
export const getUserDetails = (id) => api.get(`/admin/services/users/${id}`);
export const deleteUser = (id) => api.delete(`/admin/services/users/${id}`);

// Farmers / Buyers / Drivers
export const getAllFarmers = () => api.get("/admin/services/farmers");
export const getAllBuyers = () => api.get("/admin/services/buyers");
export const getAllDrivers = () => api.get("/admin/services/drivers");

// Crops
export const getAllCropListings = () => api.get("/admin/services/crops");
export const deleteCropListing = (id) => api.delete(`/admin/services/crops/${id}`);

// Orders
export const getAllOrders = () => api.get("/admin/services/orders");
export const updateOrderStatus = (id, status) =>
  api.patch(`/admin/services/orders/${id}/status`, { status });

// Bids
export const getAllBids = () => api.get("/admin/services/bids");

// Expenses
export const getAllExpenses = () => api.get("/admin/services/expenses");