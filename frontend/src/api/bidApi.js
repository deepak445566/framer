import api from "./axios.js";

// Buyer
export const placeBid = (cropId, data) => api.post(`/bid/${cropId}/place`, data);
export const updateBid = (bidId, data) => api.put(`/bid/${bidId}`, data);
export const cancelBid = (bidId) => api.patch(`/bid/${bidId}/cancel`);
export const getMyBids = () => api.get("/bid/my-bids");

// Farmer
export const getCropBids = (cropId) => api.get(`/bid/crop/${cropId}`);
export const acceptBid = (bidId) => api.patch(`/bid/${bidId}/accept`);
export const rejectBid = (bidId) => api.patch(`/bid/${bidId}/reject`);