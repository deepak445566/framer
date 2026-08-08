import { useEffect, useState } from "react";
import { getMyCrops, deleteCrop, closeCropListing } from "../../api/cropApi.js";
import { Link } from "react-router-dom";

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

  if (loading) return <div className="p-6 text-gray-500">Loading crops...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">My Crops</h2>
        <Link to="/farmer/crops/create" className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">
          + Add Crop
        </Link>
      </div>

      {error && <p className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4">{error}</p>}

      {crops.length === 0 ? (
        <p className="text-gray-500">You haven't listed any crops yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {crops.map((crop) => (
            <div key={crop.id} className="bg-white rounded-lg shadow p-4">
              {crop.images?.[0] && (
                <img src={crop.images[0]} alt={crop.title} className="w-full h-36 object-cover rounded mb-3" />
              )}
              <h3 className="font-semibold">{crop.title}</h3>
              <p className="text-sm text-gray-500">{crop.category}</p>
              <p className="text-sm mt-1">{crop.quantity} {crop.unit} @ ₹{crop.pricePerUnit}/{crop.unit}</p>
              <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${crop.isAvailable ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                {crop.isAvailable ? "Active" : "Closed"}
              </span>

              <div className="flex gap-3 mt-3 text-sm">
                <Link to={`/farmer/crops/${crop.id}/bids`} className="text-green-700 font-medium">
                  View Bids
                </Link>
                <Link to={`/farmer/crops/${crop.id}/edit`} className="text-blue-600 font-medium">
                  Edit
                </Link>
                {crop.isAvailable && (
                  <button
                    onClick={() => handleClose(crop.id)}
                    disabled={actionId === crop.id}
                    className="text-yellow-600 font-medium disabled:opacity-50"
                  >
                    Close
                  </button>
                )}
                <button
                  onClick={() => handleDelete(crop.id)}
                  disabled={actionId === crop.id}
                  className="text-red-600 font-medium disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCrops;