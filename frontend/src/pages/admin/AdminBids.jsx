import { useEffect, useState } from "react";
import { getAllBids } from "../../api/adminApi.js";
import AdminLayout from "../../components/admin/AdminLayout.jsx";

const statusColor = {
  PENDING: "bg-yellow-100 text-yellow-700",
  ACCEPTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-600",
  CANCELLED: "bg-gray-100 text-gray-600",
};

const AdminBids = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAllBids();
        setBids(res.data.bids);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load bids");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <AdminLayout>
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-6">All Bids</h2>

        {error && <p className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4">{error}</p>}

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-3">Crop</th>
                  <th className="p-3">Buyer</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {bids.map((b) => (
                  <tr key={b.id} className="border-t">
                    <td className="p-3">{b.crop?.title}</td>
                    <td className="p-3">{b.buyer?.user?.name}</td>
                    <td className="p-3">₹{b.amount}</td>
                    <td className="p-3">{b.quantity}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${statusColor[b.status]}`}>{b.status}</span>
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

export default AdminBids;