import { useEffect, useState } from "react";
import { getNearbyCrops } from "../../api/cropApi.js";
import { Link } from "react-router-dom";

const NearbyCrops = () => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getNearbyCrops();
        setCrops(res.data.crops);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load nearby crops");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Nearby Crops (within 50km)</h2>

      {error && <p className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : crops.length === 0 ? (
        <p className="text-gray-500">No crops found near you.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {crops.map((crop) => (
            <Link
              to={`/buyer/crop/${crop.id}`}
              key={crop.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition p-4"
            >
              <h3 className="font-semibold text-lg">{crop.title}</h3>
              <p className="text-sm text-gray-500">{crop.category}</p>
              <p className="text-sm mt-1">
                {crop.quantity} {crop.unit} @ ₹{crop.pricePerUnit}/{crop.unit}
              </p>
              <p className="text-xs text-green-600 font-medium mt-2">
                {crop.distanceKm} km away
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default NearbyCrops;