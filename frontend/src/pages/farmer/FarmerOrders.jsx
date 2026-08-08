import { useEffect, useState } from "react";
import { getFarmerOrders } from "../../api/orderApi.js";
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

const FarmerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const load = async (status = "") => {
    setLoading(true);
    try {
      const res = await getFarmerOrders(status ? { status } : {});
      setOrders(res.data.orders);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
    load(e.target.value);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Orders</h2>
        <select value={statusFilter} onChange={handleFilterChange} className="border rounded px-3 py-2 text-sm">
          <option value="">All Statuses</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="DRIVER_ASSIGNED">Driver Assigned</option>
          <option value="IN_TRANSIT">In Transit</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {error && <p className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{order.crop?.title}</h3>
                <p className="text-sm text-gray-500">Buyer: {order.buyer?.user?.name}</p>
                <p className="text-sm text-gray-500">{order.quantity} units — ₹{order.totalAmount}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-2 py-1 rounded text-xs ${statusColor[order.status] || "bg-gray-100 text-gray-600"}`}>
                  {order.status}
                </span>
                <Link to={`/farmer/orders/${order.id}`} className="text-sm text-green-700 font-medium">
                  Manage
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FarmerOrders;