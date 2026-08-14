import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCrop } from "../../api/cropApi.js";
import {
  Sprout,
  Tag,
  FileText,
  Package,
  IndianRupee,
  ImagePlus,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";

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
  const removeImage = (index) => setImages(images.filter((_, i) => i !== index));

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
    <div className="min-h-[80vh] bg-gradient-to-b from-green-50 via-white to-white p-6 flex items-start justify-center">
      <div className="w-full max-w-lg">
        <div className="bg-white shadow-xl shadow-green-100 rounded-2xl border border-green-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-5">
            <div className="flex items-center gap-2 text-white">
              <Sprout size={22} />
              <h2 className="text-xl font-bold">Add New Crop Listing</h2>
            </div>
            <p className="text-green-50 text-sm mt-1">List your produce for buyers to discover</p>
          </div>

          <div className="p-6">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-4 border border-red-100">
                <AlertCircle size={15} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Sprout size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" />
                <input
                  name="title"
                  placeholder="Crop Title (e.g. Fresh Wheat)"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                  required
                />
              </div>

              <div className="relative">
                <FileText size={16} className="absolute left-3 top-3 text-green-600" />
                <textarea
                  name="description"
                  placeholder="Description"
                  value={form.description}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                  rows={3}
                />
              </div>

              <div className="relative">
                <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" />
                <input
                  name="category"
                  placeholder="Category (e.g. Grains)"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="relative">
                  <Package size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" />
                  <input
                    type="number"
                    name="quantity"
                    placeholder="Qty"
                    value={form.quantity}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg pl-8 pr-2 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <select
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  className="border border-gray-200 rounded-lg px-2 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                >
                  <option value="kg">kg</option>
                  <option value="quintal">quintal</option>
                  <option value="ton">ton</option>
                </select>
                <div className="relative">
                  <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" />
                  <input
                    type="number"
                    name="pricePerUnit"
                    placeholder="Price"
                    value={form.pricePerUnit}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg pl-8 pr-2 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="border border-green-100 rounded-xl p-4 bg-green-50/50">
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2.5">
                  <ImagePlus size={15} className="text-green-600" />
                  Images (up to 5)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImages}
                  className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700 file:cursor-pointer cursor-pointer"
                />

                {images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {images.map((img, index) => (
                      <div key={index} className="relative w-16 h-16 rounded-lg overflow-hidden border border-green-200">
                        <img
                          src={URL.createObjectURL(img)}
                          alt={`preview-${index}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80 transition-colors"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold py-2.5 rounded-full shadow-md shadow-green-200 hover:shadow-lg hover:from-green-700 hover:to-green-600 transition-all disabled:opacity-50 disabled:shadow-none"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Listing"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCrop;