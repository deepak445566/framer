import { useEffect, useState } from "react";
import { getMyOrders, cancelOrder } from "../../api/orderApi.js";
import { Link } from "react-router-dom";

const statusColor = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  DRIVER_ASSIGNED: "bg-blue-100 text-blue-700",
  PICKED_UP: "bg-purple-100 text-purple-700",
  IN_TRANSIT: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-600",
};

const cancellableStatuses = ["PENDING", "CONFIRMED", "DRIVER_ASSIGNED"];

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await getMyOrders();
      setOrders(res.data.orders);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleCancel = async (orderId) => {
    if (!confirm("Cancel this order?")) return;
    setCancellingId(orderId);
    try {
      await cancelOrder(orderId);
      await loadOrders();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Loading orders...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">My Orders</h2>

      {error && <p className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4">{error}</p>}

      {orders.length === 0 ? (
        <p className="text-gray-500">You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{order.crop?.title}</h3>
                  <p className="text-sm text-gray-500">
                    Farmer: {order.farmer?.user?.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.quantity} units — ₹{order.totalAmount}
                  </p>
                  {order.delivery?.driver && (
                    <p className="text-xs text-gray-400 mt-1">
                      Driver: {order.delivery.driver.user?.name}
                    </p>
                  )}
                </div>
                <span className={`px-2 py-1 rounded text-xs ${statusColor[order.status] || "bg-gray-100 text-gray-600"}`}>
                  {order.status}
                </span>
              </div>

              <div className="flex gap-3 mt-3">
                <Link
                  to={`/buyer/orders/${order.id}`}
                  className="text-sm text-green-700 font-medium"
                >
                  View Details
                </Link>
                {cancellableStatuses.includes(order.status) && (
                  <button
                    onClick={() => handleCancel(order.id)}
                    disabled={cancellingId === order.id}
                    className="text-sm text-red-600 font-medium disabled:opacity-50"
                  >
                    {cancellingId === order.id ? "Cancelling..." : "Cancel Order"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;