import { useEffect, useState } from "react";
import { getBuyerProfile, updateBuyerProfile } from "../../api/buyerApi.js";
import {
  UserCircle,
  Phone,
  Home,
  MapPin,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const BuyerProfileEdit = () => {
  const [form, setForm] = useState({
    phone: "", village: "", district: "", state: "", latitude: "", longitude: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getBuyerProfile();
        const b = res.data.buyer;
        setForm({
          phone: b.phone || "",
          village: b.village || "",
          district: b.district || "",
          state: b.state || "",
          latitude: b.coordinates?.coordinates?.[1] || "",
          longitude: b.coordinates?.coordinates?.[0] || "",
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      await updateBuyerProfile({
        ...form,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
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
              <h2 className="text-xl font-bold">Edit Profile</h2>
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

              <div className="border border-green-100 rounded-xl p-4 bg-green-50/50">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-3">
                  <MapPin size={15} className="text-green-600" />
                  Coordinates
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    name="latitude"
                    placeholder="Latitude"
                    value={form.latitude}
                    onChange={handleChange}
                    className="border border-gray-200 rounded-lg px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                    required
                  />
                  <input
                    name="longitude"
                    placeholder="Longitude"
                    value={form.longitude}
                    onChange={handleChange}
                    className="border border-gray-200 rounded-lg px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                    required
                  />
                </div>
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

export default BuyerProfileEdit;