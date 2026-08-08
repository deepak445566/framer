import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCrop } from "../../api/cropApi.js";

const CreateCrop = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "", description: "", category: "", quantity: "", unit: "kg", pricePerUnit: "",
  });
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleImages = (e) => setImages([...e.target.files].slice(0, 5));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      images.forEach((img) => formData.append("images", img));

      await createCrop(formData);
      navigate("/farmer/my-crops");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create crop listing");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-lg">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Add New Crop Listing</h2>

        {error && <p className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="title" placeholder="Crop Title (e.g. Fresh Wheat)" value={form.title} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={3} />
          <input name="category" placeholder="Category (e.g. Grains)" value={form.category} onChange={handleChange} className="w-full border rounded px-3 py-2" required />

          <div className="grid grid-cols-3 gap-3">
            <input
              type="number" name="quantity" placeholder="Quantity" value={form.quantity} onChange={handleChange}
              className="border rounded px-3 py-2" required min="0" step="0.01"
            />
            <select name="unit" value={form.unit} onChange={handleChange} className="border rounded px-3 py-2">
              <option value="kg">kg</option>
              <option value="quintal">quintal</option>
              <option value="ton">ton</option>
            </select>
            <input
              type="number" name="pricePerUnit" placeholder="Price/unit" value={form.pricePerUnit} onChange={handleChange}
              className="border rounded px-3 py-2" required min="0" step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Images (up to 5)</label>
            <input type="file" multiple accept="image/*" onChange={handleImages} className="w-full text-sm" />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create Listing"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCrop;