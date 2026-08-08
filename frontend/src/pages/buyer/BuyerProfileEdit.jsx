import { useEffect, useState } from "react";
import { getBuyerProfile, updateBuyerProfile } from "../../api/buyerApi.js";

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

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;

  return (
    <div className="p-6 max-w-lg">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>

        {error && <p className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4">{error}</p>}
        {success && <p className="bg-green-100 text-green-700 text-sm p-2 rounded mb-4">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          <input name="village" placeholder="Village" value={form.village} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          <input name="district" placeholder="District" value={form.district} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          <input name="state" placeholder="State" value={form.state} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          <div className="grid grid-cols-2 gap-3">
            <input name="latitude" placeholder="Latitude" value={form.latitude} onChange={handleChange} className="border rounded px-3 py-2" required />
            <input name="longitude" placeholder="Longitude" value={form.longitude} onChange={handleChange} className="border rounded px-3 py-2" required />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Update Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BuyerProfileEdit;