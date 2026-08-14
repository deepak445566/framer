import { useEffect, useState } from "react";
import { getMyCrops, deleteCrop, closeCropListing } from "../../api/cropApi.js";
import { Link } from "react-router-dom";
import {
  Sprout,
  PlusCircle,
  Gavel,
  Pencil,
  Lock,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  PackageSearch,
} from "lucide-react";

const MyCrops = () => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getMyCrops();
      setCrops(res.data.crops);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load crops");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (cropId) => {
    if (!confirm("Delete this crop listing permanently?")) return;
    setActionId(cropId);
    try {
      await deleteCrop(cropId);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete crop");
    } finally {
      setActionId(null);
    }
  };

  const handleClose = async (cropId) => {
    if (!confirm("Close this listing? It will no longer be visible to buyers.")) return;
    setActionId(cropId);
    try {
      await closeCropListing(cropId);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to close listing");
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-10 text-gray-500">
        <Loader2 size={18} className="animate-spin text-green-600" />
        Loading crops...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">My Crops</h2>
            <p className="text-sm text-gray-500 mt-0.5">Manage your active listings</p>
          </div>
          <Link
            to="/farmer/crops/create"
            className="flex items-center gap-1.5 bg-gradient-to-r from-green-600 to-green-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-md shadow-green-200 hover:shadow-lg transition-all"
          >
            <PlusCircle size={15} />
            Add Crop
          </Link>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-5 border border-red-100">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        {crops.length === 0 ? (
          <div className="bg-white rounded-2xl border border-green-100 p-10 text-center">
            <PackageSearch className="mx-auto text-green-300 mb-3" size={36} />
            <p className="text-gray-500">You haven't listed any crops yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {crops.map((crop) => (
              <div
                key={crop.id}
                className="bg-white rounded-2xl shadow-sm border border-green-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                {crop.images?.[0] ? (
                  <img src={crop.images[0]} alt={crop.title} className="w-full h-36 object-cover" />
                ) : (
                  <div className="w-full h-36 bg-green-50 flex items-center justify-center">
                    <Sprout className="text-green-300" size={32} />
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-gray-800">{crop.title}</h3>
                    <span
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                        crop.isAvailable
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {crop.isAvailable ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                      {crop.isAvailable ? "Active" : "Closed"}
                    </span>
                  </div>
                  <span className="inline-block mt-1 text-xs font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                    {crop.category}
                  </span>
                  <p className="text-sm text-gray-700 mt-2 font-medium">
                    {crop.quantity} {crop.unit} @ ₹{crop.pricePerUnit}/{crop.unit}
                  </p>

                  <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-green-100 text-sm">
                    <Link
                      to={`/farmer/crops/${crop.id}/bids`}
                      className="flex items-center gap-1 text-green-700 font-semibold hover:text-green-800 transition-colors"
                    >
                      <Gavel size={13} />
                      Bids
                    </Link>
                    <Link
                      to={`/farmer/crops/${crop.id}/edit`}
                      className="flex items-center gap-1 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                    >
                      <Pencil size={13} />
                      Edit
                    </Link>
                    {crop.isAvailable && (
                      <button
                        onClick={() => handleClose(crop.id)}
                        disabled={actionId === crop.id}
                        className="flex items-center gap-1 text-yellow-600 font-semibold hover:text-yellow-700 transition-colors disabled:opacity-50"
                      >
                        <Lock size={13} />
                        Close
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(crop.id)}
                      disabled={actionId === crop.id}
                      className="flex items-center gap-1 text-red-600 font-semibold hover:text-red-700 transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCrops;