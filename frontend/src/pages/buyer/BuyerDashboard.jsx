import { useEffect, useState } from "react";
import {
  getBuyerProfile,
  createBuyerProfile,
  getBuyerDashboard,
  getMyOrders,
} from "../../api/buyerApi.js";
import BuyerNav from "../../components/buyer/BuyerNav.jsx";
import {
  ShoppingBasket,
  Phone,
  Home,
  MapPin,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Package,
  Clock,
  CheckCheck,
  Gavel,
  Wallet,
  Receipt,
} from "lucide-react";

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

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-10 text-gray-500">
        <Loader2 size={18} className="animate-spin text-green-600" />
        Loading dashboard...
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <div className="min-h-[80vh] bg-gradient-to-b from-green-50 via-white to-white p-6 flex items-start justify-center">
        <div className="w-full max-w-lg">
          <div className="bg-white shadow-xl shadow-green-100 rounded-2xl border border-green-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-5">
              <div className="flex items-center gap-2 text-white">
                <ShoppingBasket size={22} />
                <h2 className="text-xl font-bold">Complete Your Buyer Profile</h2>
              </div>
              <p className="text-green-50 text-sm mt-1">
                Set up your details to start buying crops
              </p>
            </div>

            <div className="p-6">
              {error && (
                <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-4 border border-red-100">
                  <AlertCircle size={15} />
                  {error}
                </div>
              )}

              <form onSubmit={handleCreateProfile} className="space-y-4">
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" />
                  <input
                    name="phone"
                    placeholder="Phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                    required
                  />
                </div>

                <div className="relative">
                  <Home size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" />
                  <input
                    name="village"
                    placeholder="Village"
                    value={form.village}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    name="district"
                    placeholder="District"
                    value={form.district}
                    onChange={handleChange}
                    className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                    required
                  />
                  <input
                    name="state"
                    placeholder="State"
                    value={form.state}
                    onChange={handleChange}
                    className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                    required
                  />
                </div>

                {/* Location section */}
                <div className="border border-green-100 rounded-xl p-4 bg-green-50/50">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                      <MapPin size={15} className="text-green-600" />
                      Your Location
                    </span>
                    <button
                      type="button"
                      onClick={detectLocation}
                      disabled={locStatus === "loading"}
                      className="flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-r from-green-600 to-green-500 text-white px-3 py-1.5 rounded-full shadow-sm shadow-green-200 hover:shadow-md transition-all disabled:opacity-60"
                    >
                      {locStatus === "loading" ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          Detecting...
                        </>
                      ) : (
                        "Detect Location"
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      name="latitude"
                      placeholder="Latitude"
                      value={form.latitude}
                      readOnly
                      className="border border-gray-200 rounded-lg px-3 py-2 bg-white text-sm text-gray-600"
                    />
                    <input
                      name="longitude"
                      placeholder="Longitude"
                      value={form.longitude}
                      readOnly
                      className="border border-gray-200 rounded-lg px-3 py-2 bg-white text-sm text-gray-600"
                    />
                  </div>

                  {locStatus === "done" && (
                    <p className="flex items-center gap-1.5 text-xs text-green-700 font-medium mt-2.5">
                      <CheckCircle2 size={13} />
                      Location detected
                    </p>
                  )}
                  {locStatus === "error" && (
                    <p className="flex items-center gap-1.5 text-xs text-red-600 mt-2.5">
                      <AlertCircle size={13} />
                      Location detect nahi ho payi, upar wala button try karein.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting || !form.latitude}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold py-2.5 rounded-full shadow-md shadow-green-200 hover:shadow-lg hover:from-green-700 hover:to-green-600 transition-all disabled:opacity-50 disabled:shadow-none"
                >
                  {submitting ? "Saving..." : "Save Profile"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BuyerNav />
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Buyer Dashboard</h2>
          <p className="text-sm text-gray-500 mt-0.5">Your buying activity at a glance</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard icon={<Package size={18} />} label="Total Orders" value={stats.totalOrders} />
          <StatCard icon={<Clock size={18} />} label="Pending" value={stats.pendingOrders} />
          <StatCard icon={<CheckCheck size={18} />} label="Delivered" value={stats.deliveredOrders} />
          <StatCard icon={<Gavel size={18} />} label="Total Bids" value={stats.totalBids} />
          <StatCard icon={<Wallet size={18} />} label="Total Spent" value={`₹${stats.totalSpent}`} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-green-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-green-100 bg-gradient-to-r from-green-50 to-white flex items-center gap-2 font-semibold text-gray-800">
            <Receipt size={16} className="text-green-600" />
            Recent Orders
          </div>
          {orders.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="mx-auto text-green-300 mb-2" size={30} />
              <p className="text-gray-500 text-sm">No orders yet</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-green-50/60 text-left">
                <tr>
                  <th className="p-3 font-semibold text-gray-600">Crop</th>
                  <th className="p-3 font-semibold text-gray-600">Farmer</th>
                  <th className="p-3 font-semibold text-gray-600">Qty</th>
                  <th className="p-3 font-semibold text-gray-600">Amount</th>
                  <th className="p-3 font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t border-green-50 hover:bg-green-50/30 transition-colors">
                    <td className="p-3 font-medium text-gray-800">{order.crop?.title}</td>
                    <td className="p-3 text-gray-600">{order.farmer?.user?.name}</td>
                    <td className="p-3 text-gray-600">{order.quantity}</td>
                    <td className="p-3 text-gray-800 font-medium">₹{order.totalAmount}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
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

const StatCard = ({ icon, label, value }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-4 hover:shadow-md transition-shadow">
    <div className="flex items-center gap-2 mb-2">
      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-50 text-green-600">
        {icon}
      </span>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
    <p className="text-2xl font-bold text-green-700">{value}</p>
  </div>
);

export default BuyerDashboard;