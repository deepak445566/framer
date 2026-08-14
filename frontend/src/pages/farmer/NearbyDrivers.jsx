import { useEffect, useState } from "react";
import { getNearbyDrivers } from "../../api/driverApi.js";
import {
  Truck,
  Hash,
  MapPin,
  CircleDot,
  Loader2,
  AlertCircle,
  UserX,
} from "lucide-react";

const NearbyDrivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getNearbyDrivers();
        setDrivers(res.data.drivers);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load drivers");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-10 text-gray-500">
        <Loader2 size={18} className="animate-spin text-green-600" />
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-green-600 to-green-500 text-white shadow-md shadow-green-200">
            <Truck size={18} />
          </span>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Nearby Drivers</h2>
            <p className="text-sm text-gray-500 mt-0.5">Drivers close to your location</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-5 border border-red-100">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        {drivers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-green-100 p-10 text-center">
            <UserX className="mx-auto text-green-300 mb-3" size={36} />
            <p className="text-gray-500">No drivers available nearby.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {drivers.map((driver) => (
              <div
                key={driver.id}
                className="bg-white rounded-2xl shadow-sm border border-green-100 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex items-center justify-center w-11 h-11 rounded-full bg-green-100 text-green-700 font-bold text-sm">
                    {driver.user?.name?.charAt(0)?.toUpperCase() || "D"}
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-800">{driver.user?.name}</h3>
                    <p className="flex items-center gap-1 text-xs text-gray-500">
                      <Hash size={11} />
                      {driver.vehicleType} ({driver.vehicleNo})
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-green-100 pt-3">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                    <CircleDot size={10} className="animate-pulse" />
                    Available
                  </span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-green-700">
                    <MapPin size={12} />
                    {driver.distanceKm} km away
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NearbyDrivers;