import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderDetails, cancelOrder } from "../../api/orderApi.js";
import { bookDriver } from "../../api/deliveryApi.js";
import { getNearbyDrivers } from "../../api/driverApi.js";
import {
  ArrowLeft,
  Sprout,
  Package,
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
  MapPin,
  Send,
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

const FarmerOrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showDriverPicker, setShowDriverPicker] = useState(false);

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

  const loadDrivers = async () => {
    setShowDriverPicker(true);
    try {
      const res = await getNearbyDrivers();
      setDrivers(res.data.drivers);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load nearby drivers");
    }
  };

  const handleBookDriver = async () => {
    if (!selectedDriver) return;
    setBookingLoading(true);
    try {
      await bookDriver(orderId, selectedDriver);
      setShowDriverPicker(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to book driver");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Cancel this order?")) return;
    try {
      await cancelOrder(orderId);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel order");
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
            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-4 border border-red-100">
                <AlertCircle size={15} />
                {error}
              </div>
            )}

            <div className="space-y-2.5 text-sm">
              <p className="flex items-center gap-2 text-gray-700">
                <Sprout size={15} className="text-green-600" />
                <span className="font-medium">Crop:</span> {order.crop?.title}
              </p>
              <p className="flex items-center gap-2 text-gray-700">
                <Package size={15} className="text-green-600" />
                <span className="font-medium">Quantity:</span> {order.quantity}
              </p>
              <p className="flex items-center gap-2 text-gray-800 font-semibold">
                <IndianRupee size={15} className="text-green-600" />
                <span className="font-medium">Total Amount:</span> ₹{order.totalAmount}
              </p>
            </div>

            <div className="border-t border-green-100 mt-5 pt-5">
              <h3 className="flex items-center gap-1.5 font-semibold text-gray-800 mb-3">
                <User size={15} className="text-green-600" />
                Buyer Details
              </h3>
              <div className="bg-green-50/50 border border-green-100 rounded-xl p-3 space-y-1">
                <p className="text-sm font-medium text-gray-800">{order.buyer?.user?.name}</p>
                <p className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Mail size={12} />
                  {order.buyer?.user?.email}
                </p>
                <p className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Phone size={12} />
                  {order.buyer?.user?.phone}
                </p>
              </div>
            </div>

            {/* Delivery / Book Driver */}
            <div className="border-t border-green-100 mt-5 pt-5">
              <h3 className="flex items-center gap-1.5 font-semibold text-gray-800 mb-3">
                <Truck size={15} className="text-green-600" />
                Delivery
              </h3>

              {order.delivery ? (
                <div className="bg-green-50/50 border border-green-100 rounded-xl p-3 space-y-1">
                  <p className="text-sm text-gray-700">
                    Status: <span className="font-semibold">{order.delivery.status}</span>
                  </p>
                  {order.delivery.driver && (
                    <p className="flex items-center gap-1.5 text-sm text-gray-700">
                      <Truck size={12} />
                      {order.delivery.driver.user?.name}
                    </p>
                  )}
                </div>
              ) : order.status === "CONFIRMED" ? (
                <>
                  {!showDriverPicker ? (
                    <button
                      onClick={loadDrivers}
                      className="flex items-center gap-1.5 bg-gradient-to-r from-green-600 to-green-500 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-sm shadow-green-200 hover:shadow-md transition-all"
                    >
                      <Truck size={14} />
                      Book a Driver
                    </button>
                  ) : (
                    <div className="bg-green-50/50 border border-green-100 rounded-xl p-4 space-y-3">
                      {drivers.length === 0 ? (
                        <p className="text-sm text-gray-500">No nearby drivers available.</p>
                      ) : (
                        <>
                          <div className="relative">
                            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" />
                           <select
  value={selectedDriver}
  onChange={(e) => setSelectedDriver(e.target.value)}
  className="w-full border rounded px-3 py-2 text-sm"
>
  <option value="">Select a driver</option>
  {drivers.map((d) => (
    <option key={d.id} value={d.id}>
      {d.user?.name} — {d.vehicleType} — ₹{d.perKmRate}/km — {d.distanceKm} km away
    </option>
  ))}
</select>
                          </div>
                          <button
                            onClick={handleBookDriver}
                            disabled={!selectedDriver || bookingLoading}
                            className="flex items-center gap-1.5 bg-gradient-to-r from-green-600 to-green-500 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-sm shadow-green-200 hover:shadow-md transition-all disabled:opacity-50"
                          >
                            {bookingLoading ? (
                              <>
                                <Loader2 size={13} className="animate-spin" />
                                Booking...
                              </>
                            ) : (
                              <>
                                <Send size={13} />
                                Confirm Booking
                              </>
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-400">Not applicable at this stage</p>
              )}
            </div>

            {["PENDING", "CONFIRMED", "DRIVER_ASSIGNED"].includes(order.status) && (
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 mt-6 bg-red-50 text-red-600 border border-red-200 px-5 py-2 rounded-full text-sm font-semibold hover:bg-red-100 transition-all"
              >
                <XCircle size={14} />
                Cancel Order
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerOrderDetails;