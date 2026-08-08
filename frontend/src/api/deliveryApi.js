import api from "./axios.js";

// Farmer
export const bookDriver = (orderId, driverId) =>
  api.post(`/delivery/${orderId}/book-driver`, { driverId });

// Driver
export const getAssignedDeliveries = () => api.get("/delivery/assigned-deliveries");
export const acceptDelivery = (deliveryId) => api.patch(`/delivery/${deliveryId}/accept`);
export const rejectDelivery = (deliveryId) => api.patch(`/delivery/${deliveryId}/reject`);
export const updateDeliveryStatus = (deliveryId, status) =>
  api.patch(`/delivery/${deliveryId}/status`, { status });