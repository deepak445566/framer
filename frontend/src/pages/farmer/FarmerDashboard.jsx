import { useEffect, useState } from "react";
import { createFarmerProfile, getFarmerProfile, getFarmerDashboard } from "../../api/farmerApi.js";
import FarmerNav from "../../components/farmer/FarmerNav.jsx";
import { Link } from "react-router-dom";

const FarmerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    phone: "", village: "", district: "", state: "", cropTypes: "", latitude: "", longitude: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [locStatus, setLocStatus] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      await getFarmerProfile();
      setHasProfile(true);
      const res = await getFarmerDashboard();
      setDashboard(res.data.dashboard);
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
    load();
  }, []);

  useEffect(() => {
    if (!loading && !hasProfile) detectLocation();
  }, [loading, hasProfile]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocStatus("error");
      setError("Geolocation not supported by your browser");
      return;
    }
    setLocStatus("loading");
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
        setLocStatus("error");
        setError(err.code === 1 ? "Location permission denied" : "Failed to detect location");
      },
      { enableHighAccuracy: true, timeout: 10000 }
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
      await createFarmerProfile({
        ...form,
        cropTypes: form.cropTypes.split(",").map((c) => c.trim()).filter(Boolean),
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Profile creation failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Loading dashboard...</div>;

  if (!hasProfile) {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Complete Your Farmer Profile</h2>
          {error && <p className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4">{error}</p>}

          <form onSubmit={handleCreateProfile} className="space-y-3">
            <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            <input name="village" placeholder="Village" value={form.village} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            <input name="district" placeholder="District" value={form.district} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            <input name="state" placeholder="State" value={form.state} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            <input
              name="cropTypes"
              placeholder="Crop Types (comma separated e.g. Wheat, Rice)"
              value={form.cropTypes}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />

            <div className="border rounded-lg p-3 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Your Location</span>
                <button
                  type="button"
                  onClick={detectLocation}
                  className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  {locStatus === "loading" ? "Detecting..." : "Detect Location"}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input name="latitude" value={form.latitude} readOnly placeholder="Latitude" className="border rounded px-3 py-2 bg-gray-100 text-sm text-gray-600" />
                <input name="longitude" value={form.longitude} readOnly placeholder="Longitude" className="border rounded px-3 py-2 bg-gray-100 text-sm text-gray-600" />
              </div>
              {locStatus === "done" && <p className="text-xs text-green-600 mt-2">✓ Location detected</p>}
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
      <FarmerNav />
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-6">Farmer Dashboard</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Crops" value={dashboard.totalCrops} />
          <StatCard label="Active Crops" value={dashboard.activeCrops} />
          <StatCard label="Total Orders" value={dashboard.totalOrders} />
          <StatCard label="Pending Orders" value={dashboard.pendingOrders} />
          <StatCard label="Delivered Orders" value={dashboard.deliveredOrders} />
          <StatCard label="Total Bids" value={dashboard.totalBids} />
          <StatCard label="Pending Bids" value={dashboard.pendingBids} />
          <StatCard label="Total Revenue" value={`₹${dashboard.totalRevenue}`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-3 border-b font-medium">Recent Orders</div>
            {dashboard.recentOrders.length === 0 ? (
              <p className="p-4 text-gray-500 text-sm">No orders yet</p>
            ) : (
              <ul className="divide-y">
                {dashboard.recentOrders.map((o) => (
                  <li key={o.id} className="p-3 text-sm flex justify-between">
                    <span>{o.crop?.title} — {o.buyer?.user?.name}</span>
                    <span className="text-gray-500">₹{o.totalAmount}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recent Bids */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-3 border-b font-medium">Recent Bids</div>
            {dashboard.recentBids.length === 0 ? (
              <p className="p-4 text-gray-500 text-sm">No bids yet</p>
            ) : (
              <ul className="divide-y">
                {dashboard.recentBids.map((b) => (
                  <li key={b.id} className="p-3 text-sm flex justify-between">
                    <span>{b.crop?.title} — {b.buyer?.user?.name}</span>
                    <span className="text-gray-500">₹{b.amount}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-6">
          <Link
            to="/farmer/crops/create"
            className="inline-block bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 text-sm"
          >
            + Add New Crop
          </Link>
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

export default FarmerDashboard;