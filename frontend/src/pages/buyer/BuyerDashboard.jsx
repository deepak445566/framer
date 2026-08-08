import { useEffect, useState } from "react";
import {
  getBuyerProfile,
  createBuyerProfile,
  getBuyerDashboard,
  getMyOrders,
} from "../../api/buyerApi.js";
import BuyerNav from "../../components/buyer/BuyerNav.jsx";

const BuyerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    phone: "", village: "", district: "", state: "", latitude: "", longitude: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [locStatus, setLocStatus] = useState(""); // "loading" | "done" | "error"

  const loadDashboard = async () => {
    try {
      setLoading(true);
      await getBuyerProfile();
      setHasProfile(true);

      const [dashRes, ordersRes] = await Promise.all([getBuyerDashboard(), getMyOrders()]);
      setStats(dashRes.data.dashboard);
      setOrders(ordersRes.data.orders.slice(0, 5));
    } catch (err) {
      if (err.response?.status === 404) {
        setHasProfile(false);
      } else {
        setError(err.response?.data?.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Profile na ho to seedha browser ka location popup trigger karo (auto, koi extra click nahi)
  useEffect(() => {
    if (!loading && !hasProfile) {
      detectLocation();
    }
  }, [loading, hasProfile]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocStatus("error");
      setError("Geolocation is not supported by your browser");
      return;
    }
    setLocStatus("loading");
    setError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        setLocStatus("done");
      },
      (err) => {
        console.error("Geolocation error:", err.code, err.message);
        setLocStatus("error");
        setError(
          err.code === 1
            ? "Location permission denied. Please allow location access."
            : err.code === 2
            ? "Location unavailable. Check your device's GPS/location setting."
            : err.code === 3
            ? "Location request timed out. Please try again."
            : "Failed to detect location"
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.latitude || !form.longitude) {
      setError("Please detect your location before submitting");
      return;
    }

    setSubmitting(true);
    try {
      await createBuyerProfile({
        ...form,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      });
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || "Profile creation failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Loading dashboard...</div>;

  if (!hasProfile) {
    return (
      <div className="p-6 max-w-lg mx-auto relative">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Complete Your Buyer Profile</h2>
          {error && <p className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4">{error}</p>}

          <form onSubmit={handleCreateProfile} className="space-y-3">
            <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            <input name="village" placeholder="Village" value={form.village} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            <input name="district" placeholder="District" value={form.district} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            <input name="state" placeholder="State" value={form.state} onChange={handleChange} className="w-full border rounded px-3 py-2" required />

            {/* Location section */}
            <div className="border rounded-lg p-3 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Your Location</span>
                <button
                  type="button"
                  onClick={detectLocation}
                  className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-60"
                  disabled={locStatus === "loading"}
                >
                  {locStatus === "loading" ? "Detecting..." : "Detect Location"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  name="latitude"
                  placeholder="Latitude"
                  value={form.latitude}
                  readOnly
                  className="border rounded px-3 py-2 bg-gray-100 text-sm text-gray-600"
                />
                <input
                  name="longitude"
                  placeholder="Longitude"
                  value={form.longitude}
                  readOnly
                  className="border rounded px-3 py-2 bg-gray-100 text-sm text-gray-600"
                />
              </div>

              {locStatus === "done" && (
                <p className="text-xs text-green-600 mt-2">✓ Location detected</p>
              )}
              {locStatus === "error" && (
                <p className="text-xs text-red-600 mt-2">Location detect nahi ho payi, upar wala button try karein.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || !form.latitude}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <BuyerNav />
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-6">Buyer Dashboard</h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard label="Total Orders" value={stats.totalOrders} />
          <StatCard label="Pending" value={stats.pendingOrders} />
          <StatCard label="Delivered" value={stats.deliveredOrders} />
          <StatCard label="Total Bids" value={stats.totalBids} />
          <StatCard label="Total Spent" value={`₹${stats.totalSpent}`} />
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-3 border-b font-medium">Recent Orders</div>
          {orders.length === 0 ? (
            <p className="p-4 text-gray-500 text-sm">No orders yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-3">Crop</th>
                  <th className="p-3">Farmer</th>
                  <th className="p-3">Qty</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t">
                    <td className="p-3">{order.crop?.title}</td>
                    <td className="p-3">{order.farmer?.user?.name}</td>
                    <td className="p-3">{order.quantity}</td>
                    <td className="p-3">₹{order.totalAmount}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div className="bg-white rounded-lg shadow p-4">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-2xl font-bold text-green-700">{value}</p>
  </div>
);

export default BuyerDashboard;