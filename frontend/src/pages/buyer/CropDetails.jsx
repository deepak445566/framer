import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCropById } from "../../api/cropApi.js";
import { placeBid } from "../../api/bidApi.js";
import {
  ArrowLeft,
  Sprout,
  User,
  IndianRupee,
  Package,
  Gavel,
  MessageSquare,
  Loader2,
  CheckCircle2,
  AlertCircle,
  CircleDot,
  Send,
} from "lucide-react";

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

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-10 text-gray-500">
        <Loader2 size={18} className="animate-spin text-green-600" />
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-100">
          <AlertCircle size={16} />
          {error}
        </div>
      </div>
    );
  }

  if (!crop) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-700 mb-5 transition-colors"
        >
          <ArrowLeft size={15} />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Crop info */}
          <div className="lg:col-span-3 bg-white rounded-3xl shadow-sm border border-green-100 overflow-hidden">
            <div className="relative">
              {crop.images?.[0] ? (
                <img
                  src={crop.images[0]}
                  alt={crop.title}
                  className="w-full h-80 object-cover"
                />
              ) : (
                <div className="w-full h-80 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                  <Sprout className="text-green-300" size={64} />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />

              <span
                className={`absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-md backdrop-blur-sm ${
                  crop.isAvailable
                    ? "bg-green-500/90 text-white"
                    : "bg-red-500/90 text-white"
                }`}
              >
                <CircleDot size={10} className={crop.isAvailable ? "animate-pulse" : ""} />
                {crop.isAvailable ? "Available" : "Closed"}
              </span>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="inline-block text-xs font-semibold text-green-100 bg-green-600/70 backdrop-blur-sm px-2.5 py-1 rounded-full mb-2">
                  {crop.category}
                </span>
                <h2 className="text-3xl font-bold text-white drop-shadow-sm">{crop.title}</h2>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-600 leading-relaxed mb-6">{crop.description}</p>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-green-50/60 border border-green-100 rounded-2xl p-4 text-center">
                  <Package className="mx-auto text-green-600 mb-1.5" size={18} />
                  <p className="text-xs text-gray-500 mb-0.5">Available</p>
                  <p className="font-bold text-gray-800 text-sm">
                    {crop.quantity} {crop.unit}
                  </p>
                </div>
                <div className="bg-green-50/60 border border-green-100 rounded-2xl p-4 text-center">
                  <IndianRupee className="mx-auto text-green-600 mb-1.5" size={18} />
                  <p className="text-xs text-gray-500 mb-0.5">Price</p>
                  <p className="font-bold text-gray-800 text-sm">
                    ₹{crop.pricePerUnit}/{crop.unit}
                  </p>
                </div>
                <div className="bg-green-50/60 border border-green-100 rounded-2xl p-4 text-center">
                  <User className="mx-auto text-green-600 mb-1.5" size={18} />
                  <p className="text-xs text-gray-500 mb-0.5">Farmer</p>
                  <p className="font-bold text-gray-800 text-sm truncate">
                    {crop.farmer?.user?.name}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Place bid form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-green-100 overflow-hidden sticky top-6">
              <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-5">
                <div className="flex items-center gap-2 text-white">
                  <Gavel size={20} />
                  <h3 className="text-lg font-bold">Place a Bid</h3>
                </div>
                <p className="text-green-50 text-xs mt-1">Make your offer to the farmer</p>
              </div>

              <div className="p-6">
                {bidError && (
                  <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-4 border border-red-100">
                    <AlertCircle size={15} />
                    {bidError}
                  </div>
                )}
                {bidSuccess && (
                  <div className="flex items-center gap-2 bg-green-50 text-green-700 text-sm px-3 py-2 rounded-lg mb-4 border border-green-100">
                    <CheckCircle2 size={15} />
                    {bidSuccess}
                  </div>
                )}

                {!crop.isAvailable ? (
                  <div className="text-center py-6">
                    <Gavel className="mx-auto text-gray-300 mb-2" size={30} />
                    <p className="text-gray-500 text-sm">This listing is closed for bidding.</p>
                  </div>
                ) : (
                  <form onSubmit={handlePlaceBid} className="space-y-4">
                    <div>
                      <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                        <IndianRupee size={13} className="text-green-600" />
                        Your Offer Amount
                      </label>
                      <input
                        type="number"
                        name="amount"
                        value={bidForm.amount}
                        onChange={handleChange}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                        required
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                        <Package size={13} className="text-green-600" />
                        Quantity ({crop.unit})
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={bidForm.quantity}
                        onChange={handleChange}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                        required
                        min="0"
                        max={crop.quantity}
                        step="0.01"
                        placeholder={`Max ${crop.quantity}`}
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                        <MessageSquare size={13} className="text-green-600" />
                        Message (optional)
                      </label>
                      <textarea
                        name="message"
                        value={bidForm.message}
                        onChange={handleChange}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                        rows={3}
                        placeholder="Add a note to the farmer..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold py-3 rounded-full shadow-md shadow-green-200 hover:shadow-lg hover:from-green-700 hover:to-green-600 transition-all disabled:opacity-50 disabled:shadow-none"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Placing Bid...
                        </>
                      ) : (
                        <>
                          <Send size={15} />
                          Place Bid
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropDetails;