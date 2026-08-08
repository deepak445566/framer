import { useEffect, useState } from "react";
import {
  createDriverProfile,
  getDriverProfile,
  getDriverDashboard,
  toggleAvailability,
} from "../../api/driverApi.js";
import DriverNav from "../../components/driver/DriverNav.jsx";

const DriverDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");
  const [toggling, setToggling] = useState(false);

  const [form, setForm] = useState({
    phone: "", vehicleNo: "", vehicleType: "", latitude: "", longitude: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [locStatus, setLocStatus] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      await getDriverProfile();
      setHasProfile(true);
      const res = await getDriverDashboard();
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
      await createDriverProfile({
        ...form,
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

  const handleToggle = async () => {
    setToggling(true);
    try {
      await toggleAvailability();
      const res = await getDriverDashboard();
      setDashboard(res.data.dashboard);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to toggle availability");
    } finally {
      setToggling(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Loading dashboard...</div>;

  if (!hasProfile) {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Complete Your Driver Profile</h2>
          {error && <p className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4">{error}</p>}

          <form onSubmit={handleCreateProfile} className="space-y-3">
            <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            <input name="vehicleNo" placeholder="Vehicle Number (e.g. UP32AB1234)" value={form.vehicleNo} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            <select name="vehicleType" value={form.vehicleType} onChange={handleChange} className="w-full border rounded px-3 py-2" required>
              <option value="">Select Vehicle Type</option>
              <option value="TRUCK">Truck</option>
              <option value="TEMPO">Tempo</option>
              <option value="PICKUP">Pickup</option>
              <option value="TRACTOR">Tractor</option>
              <option value="OTHER">Other</option>
            </select>

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
                <input value={form.latitude} readOnly placeholder="Latitude" className="border rounded px-3 py-2 bg-gray-100 text-sm text-gray-600" />
                <input value={form.longitude} readOnly placeholder="Longitude" className="border rounded px-3 py-2 bg-gray-100 text-sm text-gray-600" />
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
      <DriverNav />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Driver Dashboard</h2>
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`px-4 py-2 rounded text-sm font-medium ${
              dashboard.isAvailable
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            } disabled:opacity-60`}
          >
            {toggling ? "Updating..." : dashboard.isAvailable ? "🟢 Available" : "⚪ Unavailable"}
          </button>
        </div>

        {error && <p className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4">{error}</p>}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Deliveries" value={dashboard.totalDeliveries} />
          <StatCard label="Completed" value={dashboard.completedDeliveries} />
          <StatCard label="Pending / Active" value={dashboard.pendingDeliveries} />
          <StatCard label="Cancelled" value={dashboard.cancelledDeliveries} />
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

export default DriverDashboard;