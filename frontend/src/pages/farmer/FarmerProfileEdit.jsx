import { useEffect, useState } from "react";
import { getFarmerProfile, updateFarmerProfile } from "../../api/farmerApi.js";

const FarmerProfileEdit = () => {
  const [form, setForm] = useState({
    phone: "", village: "", district: "", state: "", cropTypes: "", latitude: "", longitude: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [locStatus, setLocStatus] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getFarmerProfile();
        const f = res.data.farmer;
        setForm({
          phone: f.phone || "",
          village: f.village || "",
          district: f.district || "",
          state: f.state || "",
          cropTypes: (f.cropTypes || []).join(", "),
          latitude: f.coordinates?.coordinates?.[1] || "",
          longitude: f.coordinates?.coordinates?.[0] || "",
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
      await updateFarmerProfile({
        ...form,
        cropTypes: form.cropTypes.split(",").map((c) => c.trim()).filter(Boolean),
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
        <h2 className="text-xl font-semibold mb-4">Edit Farmer Profile</h2>

        {error && <p className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4">{error}</p>}
        {success && <p className="bg-green-100 text-green-700 text-sm p-2 rounded mb-4">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          <input name="village" placeholder="Village" value={form.village} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          <input name="district" placeholder="District" value={form.district} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          <input name="state" placeholder="State" value={form.state} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          <input name="cropTypes" placeholder="Crop Types (comma separated)" value={form.cropTypes} onChange={handleChange} className="w-full border rounded px-3 py-2" required />

          <div className="border rounded-lg p-3 bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Location</span>
              <button type="button" onClick={detectLocation} className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
                {locStatus === "loading" ? "Detecting..." : "Update Location"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input value={form.latitude} readOnly className="border rounded px-3 py-2 bg-gray-100 text-sm text-gray-600" />
              <input value={form.longitude} readOnly className="border rounded px-3 py-2 bg-gray-100 text-sm text-gray-600" />
            </div>
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

export default FarmerProfileEdit;