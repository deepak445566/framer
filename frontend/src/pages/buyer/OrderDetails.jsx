import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderDetails, cancelOrder } from "../../api/orderApi.js";

const cancellableStatuses = ["PENDING", "CONFIRMED", "DRIVER_ASSIGNED"];

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const load = async () => {
    try {
      const res = await getOrderDetails(orderId);
      setOrder(res.data.order);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [orderId]);

  const handleCancel = async () => {
    if (!confirm("Cancel this order?")) return;
    setCancelling(true);
    try {
      await cancelOrder(orderId);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!order) return null;

  return (
    <div className="p-6 max-w-2xl">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-500 mb-4">
        ← Back
      </button>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold">Order #{order.id}</h2>
          <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">
            {order.status}
          </span>
        </div>

        <div className="space-y-2 text-sm">
          <p><span className="font-medium">Crop:</span> {order.crop?.title}</p>
          <p><span className="font-medium">Quantity:</span> {order.quantity}</p>
          <p><span className="font-medium">Price per unit:</span> ₹{order.pricePerUnit}</p>
          <p><span className="font-medium">Total Amount:</span> ₹{order.totalAmount}</p>
        </div>

        <div className="border-t mt-4 pt-4">
          <h3 className="font-medium mb-2">Farmer Details</h3>
          <p className="text-sm">{order.farmer?.user?.name}</p>
          <p className="text-sm text-gray-500">{order.farmer?.user?.email}</p>
          <p className="text-sm text-gray-500">{order.farmer?.user?.phone}</p>
        </div>

        {order.delivery && (
          <div className="border-t mt-4 pt-4">
            <h3 className="font-medium mb-2">Delivery Status</h3>
            <p className="text-sm mb-1">
              Status: <span className="font-medium">{order.delivery.status}</span>
            </p>
            {order.delivery.driver && (
              <>
                <p className="text-sm">Driver: {order.delivery.driver.user?.name}</p>
                <p className="text-sm text-gray-500">{order.delivery.driver.user?.email}</p>
              </>
            )}
          </div>
        )}

        {cancellableStatuses.includes(order.status) && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="mt-6 bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600 disabled:opacity-60"
          >
            {cancelling ? "Cancelling..." : "Cancel Order"}
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;