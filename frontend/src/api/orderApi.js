import api from "./axios.js";

export const getMyOrders = () => api.get("/order/my-orders");
export const getOrderDetails = (orderId) => api.get(`/order/${orderId}`);
export const cancelOrder = (orderId) => api.patch(`/order/${orderId}/cancel`);
export const getFarmerOrders = (params) => api.get("/order/farmer-orders", { params });