import { useEffect, useState } from "react";
import { getNearbyDrivers } from "../../api/driverApi.js";

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

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Nearby Drivers</h2>

      {error && <p className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4">{error}</p>}

      {drivers.length === 0 ? (
        <p className="text-gray-500">No drivers available nearby.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {drivers.map((driver) => (
            <div key={driver.id} className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold">{driver.user?.name}</h3>
              <p className="text-sm text-gray-500">{driver.vehicleType} ({driver.vehicleNo})</p>
              <p className="text-sm text-green-600 font-medium mt-1">{driver.distanceKm} km away</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NearbyDrivers;