import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderDetails, cancelOrder } from "../../api/orderApi.js";
import { bookDriver } from "../../api/deliveryApi.js";
import { getNearbyDrivers } from "../../api/driverApi.js";

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

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;
  if (!order) return null;

  return (
    <div className="p-6 max-w-2xl">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-500 mb-4">← Back</button>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold">Order #{order.id}</h2>
          <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">{order.status}</span>
        </div>

        {error && <p className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4">{error}</p>}

        <div className="space-y-2 text-sm">
          <p><span className="font-medium">Crop:</span> {order.crop?.title}</p>
          <p><span className="font-medium">Quantity:</span> {order.quantity}</p>
          <p><span className="font-medium">Total Amount:</span> ₹{order.totalAmount}</p>
        </div>

        <div className="border-t mt-4 pt-4">
          <h3 className="font-medium mb-2">Buyer Details</h3>
          <p className="text-sm">{order.buyer?.user?.name}</p>
          <p className="text-sm text-gray-500">{order.buyer?.user?.email}</p>
          <p className="text-sm text-gray-500">{order.buyer?.user?.phone}</p>
        </div>

        {/* Delivery / Book Driver */}
        <div className="border-t mt-4 pt-4">
          <h3 className="font-medium mb-2">Delivery</h3>
          {order.delivery ? (
            <>
              <p className="text-sm">Status: {order.delivery.status}</p>
              {order.delivery.driver && <p className="text-sm">Driver: {order.delivery.driver.user?.name}</p>}
            </>
          ) : order.status === "CONFIRMED" ? (
            <>
              {!showDriverPicker ? (
                <button
                  onClick={loadDrivers}
                  className="bg-green-600 text-white text-sm px-4 py-1.5 rounded hover:bg-green-700"
                >
                  Book a Driver
                </button>
              ) : (
                <div className="space-y-2">
                  {drivers.length === 0 ? (
                    <p className="text-sm text-gray-500">No nearby drivers available.</p>
                  ) : (
                    <>
                      <select
                        value={selectedDriver}
                        onChange={(e) => setSelectedDriver(e.target.value)}
                        className="w-full border rounded px-3 py-2 text-sm"
                      >
                        <option value="">Select a driver</option>
                        {drivers.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.user?.name} — {d.vehicleType} ({d.distanceKm} km)
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleBookDriver}
                        disabled={!selectedDriver || bookingLoading}
                        className="bg-green-600 text-white text-sm px-4 py-1.5 rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        {bookingLoading ? "Booking..." : "Confirm Booking"}
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
            className="mt-6 bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600"
          >
            Cancel Order
          </button>
        )}
      </div>
    </div>
  );
};

export default FarmerOrderDetails;