import { useEffect, useState } from "react";
import { getNearbyCrops } from "../../api/cropApi.js";
import { Link } from "react-router-dom";
import {
  MapPin,
  Navigation,
  PackageSearch,
  Loader2,
  AlertCircle,
  Sprout,
} from "lucide-react";

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
    <div className="min-h-screen bg-gray-50 p-6">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes softPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.35); }
          50% { box-shadow: 0 0 0 5px rgba(34,197,94,0); }
        }
        @keyframes spinIn {
          from { opacity: 0; transform: scale(0.9) rotate(-8deg); }
          to { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        .crop-card {
          animation: fadeSlideUp 0.45s ease-out both;
        }
        .distance-badge {
          animation: softPulse 2.2s ease-in-out infinite;
        }
        .header-icon {
          animation: spinIn 0.5s ease-out both;
        }
      `}</style>

      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6 header-icon">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-green-600 to-green-500 text-white shadow-md shadow-green-200">
            <Navigation size={18} />
          </span>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Nearby Crops</h2>
            <p className="text-sm text-gray-500 mt-0.5">Within 50km of your location</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-5 border border-red-100">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-gray-500">
            <Loader2 size={18} className="animate-spin text-green-600" />
            Loading...
          </div>
        ) : crops.length === 0 ? (
          <div className="bg-white rounded-2xl border border-green-100 p-10 text-center crop-card">
            <PackageSearch className="mx-auto text-green-300 mb-3" size={36} />
            <p className="text-gray-500">No crops found near you.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {crops.map((crop, index) => (
              <Link
                to={`/buyer/crop/${crop.id}`}
                key={crop.id}
                style={{ animationDelay: `${index * 70}ms` }}
                className="crop-card group bg-white rounded-2xl shadow-sm border border-green-100 p-4 hover:shadow-xl hover:border-green-200 hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 ease-out"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-green-50 text-green-600 group-hover:bg-green-100 transition-colors">
                    <Sprout size={16} />
                  </div>
                  <span className="distance-badge flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                    <MapPin size={11} />
                    {crop.distanceKm} km
                  </span>
                </div>

                <h3 className="font-semibold text-lg text-gray-800 mt-3 group-hover:text-green-700 transition-colors">
                  {crop.title}
                </h3>
                <span className="inline-block mt-1 text-xs font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                  {crop.category}
                </span>
                <p className="text-sm text-gray-700 mt-2 font-medium">
                  {crop.quantity} {crop.unit} @ ₹{crop.pricePerUnit}/{crop.unit}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NearbyCrops;