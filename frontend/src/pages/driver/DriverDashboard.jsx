import { useEffect, useState } from "react";
import {
  createDriverProfile,
  getDriverProfile,
  getDriverDashboard,
  toggleAvailability,
} from "../../api/driverApi.js";
import DriverNav from "../../components/driver/DriverNav.jsx";
import {
  Truck,
  Phone,
  Hash,
  MapPin,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Package,
  CheckCheck,
  Clock,
  XCircle,
} from "lucide-react";

const DriverDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");
  const [toggling, setToggling] = useState(false);

  const [form, setForm] = useState({
    phone: "", vehicleNo: "", vehicleType: "",perKmRate: "", latitude: "", longitude: "",
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
        perKmRate: parseFloat(form.perKmRate)
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
                <Truck size={22} />
                <h2 className="text-xl font-bold">Complete Your Driver Profile</h2>
              </div>
              <p className="text-green-50 text-sm mt-1">
                Just a few details to get you on the road
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
                  <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" />
                  <input
                    name="vehicleNo"
                    placeholder="Vehicle Number (e.g. UP32AB1234)"
                    value={form.vehicleNo}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                    required
                  />
                </div>

                <select
                  name="vehicleType"
                  value={form.vehicleType}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                  required
                >
                  <option value="">Select Vehicle Type</option>
                  <option value="TRUCK">Truck</option>
                  <option value="TEMPO">Tempo</option>
                  <option value="PICKUP">Pickup</option>
                  <option value="TRACTOR">Tractor</option>
                  <option value="OTHER">Other</option>
                </select>


<input
  type="number"
  name="perKmRate"
  placeholder="Your rate per km (₹)"
  value={form.perKmRate}
  onChange={handleChange}
  className="w-full border rounded px-3 py-2"
  required
  min="1"
  step="0.5"
/>
                <div className="border border-green-100 rounded-xl p-4 bg-green-50/50">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                      <MapPin size={15} className="text-green-600" />
                      Your Location
                    </span>
                    <button
                      type="button"
                      onClick={detectLocation}
                      className="flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-r from-green-600 to-green-500 text-white px-3 py-1.5 rounded-full shadow-sm shadow-green-200 hover:shadow-md transition-all"
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
                      value={form.latitude}
                      readOnly
                      placeholder="Latitude"
                      className="border border-gray-200 rounded-lg px-3 py-2 bg-white text-sm text-gray-600"
                    />
                    <input
                      value={form.longitude}
                      readOnly
                      placeholder="Longitude"
                      className="border border-gray-200 rounded-lg px-3 py-2 bg-white text-sm text-gray-600"
                    />
                  </div>
                  {locStatus === "done" && (
                    <p className="flex items-center gap-1.5 text-xs text-green-700 font-medium mt-2.5">
                      <CheckCircle2 size={13} />
                      Location detected
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
      <DriverNav />
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Driver Dashboard</h2>
            <p className="text-sm text-gray-500 mt-0.5">Your delivery overview at a glance</p>
          </div>
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 disabled:opacity-60 ${
              dashboard.isAvailable
                ? "bg-gradient-to-r from-green-600 to-green-500 text-white shadow-md shadow-green-200 hover:shadow-lg"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            {toggling ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <span
                  className={`w-2 h-2 rounded-full ${
                    dashboard.isAvailable ? "bg-white" : "bg-gray-400"
                  }`}
                />
                {dashboard.isAvailable ? "Available" : "Unavailable"}
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-5 border border-red-100">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Package size={18} />}
            label="Total Deliveries"
            value={dashboard.totalDeliveries}
          />
          <StatCard
            icon={<CheckCheck size={18} />}
            label="Completed"
            value={dashboard.completedDeliveries}
          />
          <StatCard
            icon={<Clock size={18} />}
            label="Pending / Active"
            value={dashboard.pendingDeliveries}
          />
          <StatCard
            icon={<XCircle size={18} />}
            label="Cancelled"
            value={dashboard.cancelledDeliveries}
          />
          <StatCard label="Total Earnings" value={`₹${dashboard.totalEarnings || 0}`} />
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

export default DriverDashboard;