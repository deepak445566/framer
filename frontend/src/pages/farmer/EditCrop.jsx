import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCropById, updateCrop } from "../../api/cropApi.js";

const EditCrop = () => {
  const { cropId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "", description: "", category: "", quantity: "", unit: "kg", pricePerUnit: "", isAvailable: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getCropById(cropId);
        const c = res.data.crop;
        setForm({
          title: c.title || "",
          description: c.description || "",
          category: c.category || "",
          quantity: c.quantity || "",
          unit: c.unit || "kg",
          pricePerUnit: c.pricePerUnit || "",
          isAvailable: c.isAvailable,
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load crop");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [cropId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await updateCrop(cropId, form);
      navigate("/farmer/my-crops");
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
        <h2 className="text-xl font-semibold mb-4">Edit Crop</h2>

        {error && <p className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="title" value={form.title} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          <textarea name="description" value={form.description} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={3} />
          <input name="category" value={form.category} onChange={handleChange} className="w-full border rounded px-3 py-2" required />

          <div className="grid grid-cols-3 gap-3">
            <input type="number" name="quantity" value={form.quantity} onChange={handleChange} className="border rounded px-3 py-2" required min="0" step="0.01" />
            <select name="unit" value={form.unit} onChange={handleChange} className="border rounded px-3 py-2">
              <option value="kg">kg</option>
              <option value="quintal">quintal</option>
              <option value="ton">ton</option>
            </select>
            <input type="number" name="pricePerUnit" value={form.pricePerUnit} onChange={handleChange} className="border rounded px-3 py-2" required min="0" step="0.01" />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isAvailable" checked={form.isAvailable} onChange={handleChange} />
            Listing Active
          </label>

          <button type="submit" disabled={saving} className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-60">
            {saving ? "Saving..." : "Update Crop"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditCrop;