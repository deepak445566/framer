import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCropById } from "../../api/cropApi.js";
import { placeBid } from "../../api/bidApi.js";

const CropDetails = () => {
  const { cropId } = useParams();
  const navigate = useNavigate();
  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [bidForm, setBidForm] = useState({ amount: "", quantity: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [bidError, setBidError] = useState("");
  const [bidSuccess, setBidSuccess] = useState("");

  const loadCrop = async () => {
    try {
      const res = await getCropById(cropId);
      setCrop(res.data.crop);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load crop");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCrop();
  }, [cropId]);

  const handleChange = (e) => setBidForm({ ...bidForm, [e.target.name]: e.target.value });

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    setBidError("");
    setBidSuccess("");
    setSubmitting(true);
    try {
      await placeBid(cropId, bidForm);
      setBidSuccess("Bid placed successfully!");
      setBidForm({ amount: "", quantity: "", message: "" });
      setTimeout(() => navigate("/buyer/my-bids"), 1200);
    } catch (err) {
      setBidError(err.response?.data?.message || "Failed to place bid");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!crop) return null;

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Crop info */}
      <div className="bg-white rounded-lg shadow p-6">
        {crop.images?.[0] && (
          <img
            src={crop.images[0]}
            alt={crop.title}
            className="w-full h-64 object-cover rounded mb-4"
          />
        )}
        <h2 className="text-2xl font-bold">{crop.title}</h2>
        <p className="text-gray-500 mb-2">{crop.category}</p>
        <p className="text-gray-700 mb-4">{crop.description}</p>
        <p className="mb-1">
          <span className="font-medium">Available:</span> {crop.quantity} {crop.unit}
        </p>
        <p className="mb-1">
          <span className="font-medium">Price:</span> ₹{crop.pricePerUnit}/{crop.unit}
        </p>
        <p className="mb-1">
          <span className="font-medium">Farmer:</span> {crop.farmer?.user?.name}
        </p>
        <p
          className={`mt-3 inline-block px-2 py-1 rounded text-xs ${
            crop.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
          }`}
        >
          {crop.isAvailable ? "Available" : "Closed"}
        </p>
      </div>

      {/* Place bid form */}
      <div className="bg-white rounded-lg shadow p-6 h-fit">
        <h3 className="text-xl font-semibold mb-4">Place a Bid</h3>

        {bidError && <p className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4">{bidError}</p>}
        {bidSuccess && <p className="bg-green-100 text-green-700 text-sm p-2 rounded mb-4">{bidSuccess}</p>}

        {!crop.isAvailable ? (
          <p className="text-gray-500 text-sm">This listing is closed for bidding.</p>
        ) : (
          <form onSubmit={handlePlaceBid} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Your Offer Amount (₹)</label>
              <input
                type="number"
                name="amount"
                value={bidForm.amount}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quantity ({crop.unit})</label>
              <input
                type="number"
                name="quantity"
                value={bidForm.quantity}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
                min="0"
                max={crop.quantity}
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Message (optional)</label>
              <textarea
                name="message"
                value={bidForm.message}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                rows={3}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-60"
            >
              {submitting ? "Placing Bid..." : "Place Bid"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CropDetails;