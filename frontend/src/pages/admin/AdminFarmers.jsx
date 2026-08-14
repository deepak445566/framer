import { useEffect, useState } from "react";
import { getAllFarmers } from "../../api/adminApi.js";
import AdminLayout from "../../components/admin/AdminLayout.jsx";

const AdminFarmers = () => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAllFarmers();
        setFarmers(res.data.farmers);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load farmers");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <AdminLayout>
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-6">All Farmers</h2>

        {error && <p className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4">{error}</p>}

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Crops Listed</th>
                </tr>
              </thead>
              <tbody>
                {farmers.map((f) => (
                  <tr key={f.id} className="border-t">
                    <td className="p-3">{f.user?.name}</td>
                    <td className="p-3">{f.user?.email}</td>
                    <td className="p-3">{f.phone}</td>
                    <td className="p-3">{f.village}, {f.district}</td>
                    <td className="p-3">{f.crops?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminFarmers;