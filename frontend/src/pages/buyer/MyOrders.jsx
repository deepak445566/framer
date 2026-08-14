import { useEffect, useState } from "react";
import { getMyOrders, cancelOrder } from "../../api/orderApi.js";
import { Link } from "react-router-dom";
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  User,
  Eye,
  Loader2,
  AlertCircle,
  IndianRupee,
} from "lucide-react";

const statusConfig = {
  PENDING: { color: "bg-yellow-100 text-yellow-700", icon: Clock },
  CONFIRMED: { color: "bg-blue-100 text-blue-700", icon: CheckCircle2 },
  DRIVER_ASSIGNED: { color: "bg-blue-100 text-blue-700", icon: Truck },
  PICKED_UP: { color: "bg-purple-100 text-purple-700", icon: Truck },
  IN_TRANSIT: { color: "bg-purple-100 text-purple-700", icon: Truck },
  DELIVERED: { color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  CANCELLED: { color: "bg-red-100 text-red-600", icon: XCircle },
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

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-10 text-gray-500">
        <Loader2 size={18} className="animate-spin text-green-600" />
        Loading orders...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Orders</h2>
          <p className="text-sm text-gray-500 mt-0.5">Track all your crop purchases</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-5 border border-red-100">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-green-100 p-10 text-center">
            <Package className="mx-auto text-green-300 mb-3" size={36} />
            <p className="text-gray-500">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const config = statusConfig[order.status] || {
                color: "bg-gray-100 text-gray-600",
                icon: Package,
              };
              const StatusIcon = config.icon;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-sm border border-green-100 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800">{order.crop?.title}</h3>
                      <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                        <User size={12} />
                        {order.farmer?.user?.name}
                      </p>
                      <p className="flex items-center gap-1 text-sm text-gray-600 mt-0.5 font-medium">
                        <Package size={12} />
                        {order.quantity} units
                        <span className="text-gray-300">•</span>
                        <IndianRupee size={12} />
                        {order.totalAmount}
                      </p>
                      {order.delivery?.driver && (
                        <p className="flex items-center gap-1.5 text-xs text-gray-400 mt-1.5">
                          <Truck size={11} />
                          Driver: {order.delivery.driver.user?.name}
                        </p>
                      )}
                    </div>
                    <span
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${config.color}`}
                    >
                      <StatusIcon size={12} />
                      {order.status}
                    </span>
                  </div>

                  <div className="flex gap-3 mt-4 pt-3 border-t border-green-100">
                    <Link
                      to={`/buyer/orders/${order.id}`}
                      className="flex items-center gap-1.5 text-sm text-green-700 font-semibold hover:text-green-800 transition-colors"
                    >
                      <Eye size={13} />
                      View Details
                    </Link>
                    {cancellableStatuses.includes(order.status) && (
                      <button
                        onClick={() => handleCancel(order.id)}
                        disabled={cancellingId === order.id}
                        className="flex items-center gap-1.5 text-sm text-red-600 font-semibold hover:text-red-700 transition-colors disabled:opacity-50"
                      >
                        {cancellingId === order.id ? (
                          <>
                            <Loader2 size={13} className="animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <XCircle size={13} />
                            Cancel Order
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;