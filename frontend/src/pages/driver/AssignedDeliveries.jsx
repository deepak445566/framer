import { useEffect, useState } from "react";
import {
  getAssignedDeliveries,
  acceptDelivery,
  rejectDelivery,
  updateDeliveryStatus,
} from "../../api/deliveryApi.js";
import DeliveryMap from "../../components/driver/DeliveryMap.jsx";

const statusColor = {
  PENDING: "bg-yellow-100 text-yellow-700",
  ASSIGNED: "bg-blue-100 text-blue-700",
  PICKED_UP: "bg-purple-100 text-purple-700",
  IN_TRANSIT: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-600",
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

  if (loading) return <div className="p-6 text-gray-500">Loading deliveries...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">My Deliveries</h2>

      {error && <p className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4">{error}</p>}

      {deliveries.length === 0 ? (
        <p className="text-gray-500">No active or pending deliveries right now.</p>
      ) : (
        <div className="space-y-4">
          {deliveries.map((delivery) => (
            <div key={delivery.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{delivery.order?.crop?.title}</h3>
                  <p className="text-sm text-gray-500">
                    Order #{delivery.order?.id} — {delivery.order?.quantity} units — ₹{delivery.order?.totalAmount}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${statusColor[delivery.status] || "bg-gray-100 text-gray-600"}`}>
                  {delivery.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 text-sm">
                <div className="border rounded p-2">
                  <p className="font-medium text-gray-700 mb-1">Pickup — Farmer</p>
                  <p>{delivery.order?.farmer?.user?.name}</p>
                  <p className="text-gray-500">
                    {delivery.order?.farmer?.village}, {delivery.order?.farmer?.district}
                  </p>
                </div>
                <div className="border rounded p-2">
                  <p className="font-medium text-gray-700 mb-1">Drop — Buyer</p>
                  <p>{delivery.order?.buyer?.user?.name}</p>
                  <p className="text-gray-500">
                    {delivery.order?.buyer?.village}, {delivery.order?.buyer?.district}
                  </p>
                </div>
              </div>

               {["ASSIGNED", "PICKED_UP", "IN_TRANSIT"].includes(delivery.status) && (
      <DeliveryMap delivery={delivery} />
    )}

              <div className="flex gap-3 mt-3">
                {delivery.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => handleAccept(delivery.id)}
                      disabled={actionId === delivery.id}
                      className="bg-green-600 text-white text-sm px-4 py-1.5 rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(delivery.id)}
                      disabled={actionId === delivery.id}
                      className="bg-red-500 text-white text-sm px-4 py-1.5 rounded hover:bg-red-600 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </>
                )}

                {nextStatusMap[delivery.status] && (
                  <button
                    onClick={() => handleStatusUpdate(delivery.id, delivery.status)}
                    disabled={actionId === delivery.id}
                    className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {actionId === delivery.id ? "Updating..." : nextStatusLabel[nextStatusMap[delivery.status]]}
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

export default AssignedDeliveries;