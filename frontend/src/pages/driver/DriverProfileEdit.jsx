import { useEffect, useState } from "react";
import { getDriverProfile, updateDriverProfile } from "../../api/driverApi.js";
import {
  UserCircle,
  Phone,
  Hash,
  MapPin,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const DriverProfileEdit = () => {
  const [form, setForm] = useState({
    phone: "", vehicleNo: "", vehicleType: "",perKmRate: "", latitude: "", longitude: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [locStatus, setLocStatus] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getDriverProfile();
        const d = res.data.driver;
        setForm({
          phone: d.phone || "",
          vehicleNo: d.vehicleNo || "",
          vehicleType: d.vehicleType || "",
          latitude: d.coordinates?.coordinates?.[1] || "",
          longitude: d.coordinates?.coordinates?.[0] || "",
          perKmRate: d.perKmRate || ""
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) return setError("Geolocation not supported");
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
      () => setLocStatus("error"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      await updateDriverProfile({
        ...form,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        perKmRate: parseFloat(form.perKmRate)
      });
      setSuccess("Profile updated successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
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

  return (
    <div className="min-h-[80vh] bg-gradient-to-b from-green-50 via-white to-white p-6 flex items-start justify-center">
      <div className="w-full max-w-lg">
        <div className="bg-white shadow-xl shadow-green-100 rounded-2xl border border-green-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-5">
            <div className="flex items-center gap-2 text-white">
              <UserCircle size={22} />
              <h2 className="text-xl font-bold">Edit Driver Profile</h2>
            </div>
            <p className="text-green-50 text-sm mt-1">Keep your details up to date</p>
          </div>

          <div className="p-6">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-4 border border-red-100">
                <AlertCircle size={15} />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 bg-green-50 text-green-700 text-sm px-3 py-2 rounded-lg mb-4 border border-green-100">
                <CheckCircle2 size={15} />
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="Vehicle Number"
                  value={form.vehicleNo}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                  required
                />
              </div>
              <input
  type="number"
  name="perKmRate"
  placeholder="Rate per km (₹)"
  value={form.perKmRate}
  onChange={handleChange}
  className="w-full border rounded px-3 py-2"
  required
  min="1"
  step="0.5"
/>

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

              <div className="border border-green-100 rounded-xl p-4 bg-green-50/50">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <MapPin size={15} className="text-green-600" />
                    Location
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
                      "Update Location"
                    )}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={form.latitude}
                    readOnly
                    className="border border-gray-200 rounded-lg px-3 py-2 bg-white text-sm text-gray-600"
                  />
                  <input
                    value={form.longitude}
                    readOnly
                    className="border border-gray-200 rounded-lg px-3 py-2 bg-white text-sm text-gray-600"
                  />
                </div>
                {locStatus === "done" && (
                  <p className="flex items-center gap-1.5 text-xs text-green-700 font-medium mt-2.5">
                    <CheckCircle2 size={13} />
                    Location updated
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold py-2.5 rounded-full shadow-md shadow-green-200 hover:shadow-lg hover:from-green-700 hover:to-green-600 transition-all disabled:opacity-50 disabled:shadow-none"
              >
                {saving ? "Saving..." : "Update Profile"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverProfileEdit;