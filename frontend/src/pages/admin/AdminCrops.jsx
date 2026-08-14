import { useEffect, useState } from "react";
import { getAllCropListings, deleteCropListing } from "../../api/adminApi.js";
import AdminLayout from "../../components/admin/AdminLayout.jsx";

const AdminCrops = () => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAllCropListings();
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

  const handleDelete = async (id) => {
    if (!confirm("Delete this crop listing permanently?")) return;
    setDeletingId(id);
    try {
      await deleteCropListing(id);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete crop");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-6">All Crop Listings</h2>

        {error && <p className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4">{error}</p>}

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-3">Title</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Farmer</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {crops.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="p-3">{c.title}</td>
                    <td className="p-3">{c.category}</td>
                    <td className="p-3">{c.farmer?.user?.name}</td>
                    <td className="p-3">₹{c.pricePerUnit}/{c.unit}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${c.isAvailable ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                        {c.isAvailable ? "Active" : "Closed"}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleDelete(c.id)}
                        disabled={deletingId === c.id}
                        className="text-red-600 font-medium disabled:opacity-50"
                      >
                        {deletingId === c.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
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

export default AdminCrops;