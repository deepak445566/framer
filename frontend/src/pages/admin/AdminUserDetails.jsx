import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserDetails, deleteUser } from "../../api/adminApi.js";
import AdminLayout from "../../components/admin/AdminLayout.jsx";

const AdminUserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getUserDetails(id);
        setUser(res.data.user);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load user");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Delete this user permanently?")) return;
    try {
      await deleteUser(id);
      navigate("/admin/users");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
    }
  };

  if (loading) return <AdminLayout><div className="p-6 text-gray-500">Loading...</div></AdminLayout>;
  if (!user) return <AdminLayout><div className="p-6 text-red-600">{error}</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="p-6 max-w-2xl">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 mb-4">← Back</button>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">{user.role}</span>
          </div>

          <p className="text-sm text-gray-500 mb-4">
            Joined: {new Date(user.createdAt).toLocaleDateString()}
          </p>

          {user.farmer && (
            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium mb-2">Farmer Profile</h3>
              <p className="text-sm">Phone: {user.farmer.phone}</p>
              <p className="text-sm">Village: {user.farmer.village}, {user.farmer.district}</p>
              <p className="text-sm">Total Crops Listed: {user.farmer.crops?.length || 0}</p>
            </div>
          )}

          {user.buyer && (
            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium mb-2">Buyer Profile</h3>
              <p className="text-sm">Phone: {user.buyer.phone}</p>
              <p className="text-sm">Village: {user.buyer.village}, {user.buyer.district}</p>
            </div>
          )}

          {user.driver && (
            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium mb-2">Driver Profile</h3>
              <p className="text-sm">Phone: {user.driver.phone}</p>
              <p className="text-sm">Vehicle: {user.driver.vehicleType} ({user.driver.vehicleNo})</p>
              <p className="text-sm">Available: {user.driver.isAvailable ? "Yes" : "No"}</p>
            </div>
          )}

          <button
            onClick={handleDelete}
            className="mt-6 bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600"
          >
            Delete User
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUserDetails;