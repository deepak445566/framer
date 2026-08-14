import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderDetails, cancelOrder } from "../../api/orderApi.js";
import {
  ArrowLeft,
  Package,
  Sprout,
  IndianRupee,
  User,
  Mail,
  Phone,
  Truck,
  XCircle,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";

const cancellableStatuses = ["PENDING", "CONFIRMED", "DRIVER_ASSIGNED"];

const statusConfig = {
  PENDING: { color: "bg-yellow-100 text-yellow-700", icon: Clock },
  CONFIRMED: { color: "bg-blue-100 text-blue-700", icon: CheckCircle2 },
  DRIVER_ASSIGNED: { color: "bg-blue-100 text-blue-700", icon: Truck },
  PICKED_UP: { color: "bg-purple-100 text-purple-700", icon: Truck },
  IN_TRANSIT: { color: "bg-purple-100 text-purple-700", icon: Truck },
  DELIVERED: { color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  CANCELLED: { color: "bg-red-100 text-red-600", icon: XCircle },
};

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

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-10 text-gray-500">
        <Loader2 size={18} className="animate-spin text-green-600" />
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-100">
          <AlertCircle size={16} />
          {error}
        </div>
      </div>
    );
  }

  if (!order) return null;

  const config = statusConfig[order.status] || { color: "bg-gray-100 text-gray-600", icon: Package };
  const StatusIcon = config.icon;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-700 mb-4 transition-colors"
        >
          <ArrowLeft size={15} />
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-green-100 overflow-hidden">
          <div className="flex justify-between items-center px-6 py-5 bg-gradient-to-r from-green-50 to-white border-b border-green-100">
            <h2 className="text-xl font-bold text-gray-800">Order #{order.id}</h2>
            <span
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}
            >
              <StatusIcon size={12} />
              {order.status}
            </span>
          </div>

          <div className="p-6">
            <div className="space-y-2.5 text-sm">
              <p className="flex items-center gap-2 text-gray-700">
                <Sprout size={15} className="text-green-600" />
                <span className="font-medium">Crop:</span> {order.crop?.title}
              </p>
              <p className="flex items-center gap-2 text-gray-700">
                <Package size={15} className="text-green-600" />
                <span className="font-medium">Quantity:</span> {order.quantity}
              </p>
              <p className="flex items-center gap-2 text-gray-700">
                <IndianRupee size={15} className="text-green-600" />
                <span className="font-medium">Price per unit:</span> ₹{order.pricePerUnit}
              </p>
              <p className="flex items-center gap-2 text-gray-800 font-semibold">
                <IndianRupee size={15} className="text-green-600" />
                <span className="font-medium">Total Amount:</span> ₹{order.totalAmount}
              </p>
            </div>

            <div className="border-t border-green-100 mt-5 pt-5">
              <h3 className="flex items-center gap-1.5 font-semibold text-gray-800 mb-3">
                <User size={15} className="text-green-600" />
                Farmer Details
              </h3>
              <div className="bg-green-50/50 border border-green-100 rounded-xl p-3 space-y-1">
                <p className="text-sm font-medium text-gray-800">{order.farmer?.user?.name}</p>
                <p className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Mail size={12} />
                  {order.farmer?.user?.email}
                </p>
                <p className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Phone size={12} />
                  {order.farmer?.user?.phone}
                </p>
              </div>
            </div>

            {order.delivery && (
              <div className="border-t border-green-100 mt-5 pt-5">
                <h3 className="flex items-center gap-1.5 font-semibold text-gray-800 mb-3">
                  <Truck size={15} className="text-green-600" />
                  Delivery Status
                </h3>
                <div className="bg-green-50/50 border border-green-100 rounded-xl p-3 space-y-1">
                  <p className="text-sm text-gray-700">
                    Status: <span className="font-semibold">{order.delivery.status}</span>
                  </p>
                  {order.delivery.driver && (
                    <>
                      <p className="text-sm text-gray-700 mt-1">{order.delivery.driver.user?.name}</p>
                      <p className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Mail size={12} />
                        {order.delivery.driver.user?.email}
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            {cancellableStatuses.includes(order.status) && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex items-center gap-1.5 mt-6 bg-red-50 text-red-600 border border-red-200 px-5 py-2 rounded-full text-sm font-semibold hover:bg-red-100 transition-all disabled:opacity-60"
              >
                {cancelling ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <XCircle size={14} />
                    Cancel Order
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;