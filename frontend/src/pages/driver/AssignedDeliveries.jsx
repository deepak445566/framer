import { useEffect, useState } from "react";
import {
  getAssignedDeliveries,
  acceptDelivery,
  rejectDelivery,
  updateDeliveryStatus,
} from "../../api/deliveryApi.js";
import DeliveryMap from "../../components/driver/DeliveryMap.jsx";
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  MapPin,
  Loader2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

const statusConfig = {
  PENDING: { color: "bg-yellow-100 text-yellow-700", icon: Clock },
  ASSIGNED: { color: "bg-blue-100 text-blue-700", icon: Package },
  PICKED_UP: { color: "bg-purple-100 text-purple-700", icon: Truck },
  IN_TRANSIT: { color: "bg-purple-100 text-purple-700", icon: Truck },
  DELIVERED: { color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  REJECTED: { color: "bg-red-100 text-red-600", icon: XCircle },
};

// PENDING -> accept/reject
// ASSIGNED -> PICKED_UP -> IN_TRANSIT -> DELIVERED
const nextStatusMap = {
  ASSIGNED: "PICKED_UP",
  PICKED_UP: "IN_TRANSIT",
  IN_TRANSIT: "DELIVERED",
};

const nextStatusLabel = {
  PICKED_UP: "Mark as Picked Up",
  IN_TRANSIT: "Mark as In Transit",
  DELIVERED: "Mark as Delivered",
};

const AssignedDeliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAssignedDeliveries();
      setDeliveries(res.data.deliveries);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load deliveries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAccept = async (id) => {
    setActionId(id);
    try {
      await acceptDelivery(id);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to accept delivery");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id) => {
    if (!confirm("Reject this delivery request?")) return;
    setActionId(id);
    try {
      await rejectDelivery(id);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject delivery");
    } finally {
      setActionId(null);
    }
  };

  const handleStatusUpdate = async (id, currentStatus) => {
    const nextStatus = nextStatusMap[currentStatus];
    if (!nextStatus) return;
    setActionId(id);
    try {
      await updateDeliveryStatus(id, nextStatus);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-10 text-gray-500">
        <Loader2 size={18} className="animate-spin text-green-600" />
        Loading deliveries...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Deliveries</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage your assigned pickups and drops</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-5 border border-red-100">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        {deliveries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-green-100 p-10 text-center">
            <Package className="mx-auto text-green-300 mb-3" size={36} />
            <p className="text-gray-500">No active or pending deliveries right now.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deliveries.map((delivery) => {
              const config = statusConfig[delivery.status] || {
                color: "bg-gray-100 text-gray-600",
                icon: Package,
              };
              const StatusIcon = config.icon;

              return (
                <div
                  key={delivery.id}
                  className="bg-white rounded-2xl shadow-sm border border-green-100 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      
                      <h3 className="font-semibold text-gray-800">{delivery.order?.crop?.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Order #{delivery.order?.id} — {delivery.order?.quantity} units — ₹{delivery.order?.totalAmount}
                      </p>
                      {delivery.deliveryFee && (
  <div className="mt-2 text-xs text-gray-500 border-t pt-2">
    Delivery Fee: ₹{delivery.deliveryFee} — Your Earning: <span className="text-green-600 font-medium">₹{delivery.driverEarning}</span>
  </div>
)}
                    </div>
                    <span
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}
                    >
                      <StatusIcon size={12} />
                      {delivery.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-sm">
                    <div className="border border-green-100 rounded-xl p-3 bg-green-50/40">
                      <p className="flex items-center gap-1.5 font-semibold text-gray-700 mb-1">
                        <MapPin size={13} className="text-green-600" />
                        Pickup — Farmer
                      </p>
                      <p className="text-gray-800">{delivery.order?.farmer?.user?.name}</p>
                      <p className="text-gray-500">
                        {delivery.order?.farmer?.village}, {delivery.order?.farmer?.district}
                      </p>
                    </div>
                    <div className="border border-green-100 rounded-xl p-3 bg-green-50/40">
                      <p className="flex items-center gap-1.5 font-semibold text-gray-700 mb-1">
                        <MapPin size={13} className="text-green-600" />
                        Drop — Buyer
                      </p>
                      <p className="text-gray-800">{delivery.order?.buyer?.user?.name}</p>
                      <p className="text-gray-500">
                        {delivery.order?.buyer?.village}, {delivery.order?.buyer?.district}
                      </p>
                    </div>
                  </div>

                  {["ASSIGNED", "PICKED_UP", "IN_TRANSIT"].includes(delivery.status) && (
                    <DeliveryMap delivery={delivery} />
                  )}

                  <div className="flex gap-3 mt-4">
                    {delivery.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleAccept(delivery.id)}
                          disabled={actionId === delivery.id}
                          className="flex items-center gap-1.5 bg-gradient-to-r from-green-600 to-green-500 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-sm shadow-green-200 hover:shadow-md transition-all disabled:opacity-50"
                        >
                          <CheckCircle2 size={14} />
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(delivery.id)}
                          disabled={actionId === delivery.id}
                          className="flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 text-sm font-semibold px-4 py-2 rounded-full hover:bg-red-100 transition-all disabled:opacity-50"
                        >
                          <XCircle size={14} />
                          Reject
                        </button>
                      </>
                    )}

                    {nextStatusMap[delivery.status] && (
                      <button
                        onClick={() => handleStatusUpdate(delivery.id, delivery.status)}
                        disabled={actionId === delivery.id}
                        className="flex items-center gap-1.5 bg-gradient-to-r from-green-600 to-green-500 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-sm shadow-green-200 hover:shadow-md transition-all disabled:opacity-50"
                      >
                        {actionId === delivery.id ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            {nextStatusLabel[nextStatusMap[delivery.status]]}
                            <ArrowRight size={14} />
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

export default AssignedDeliveries;