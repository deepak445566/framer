import { useEffect, useState } from "react";
import { getAllExpenses } from "../../api/adminApi.js";
import AdminLayout from "../../components/admin/AdminLayout.jsx";

const AdminExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAllExpenses();
        setExpenses(res.data.expenses);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load expenses");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <AdminLayout>
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-6">All Expenses</h2>

        {error && <p className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4">{error}</p>}

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : expenses.length === 0 ? (
          <p className="text-gray-500">No expenses recorded yet.</p>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id} className="border-t">
                    <td className="p-3">{e.user?.name}</td>
                    <td className="p-3">{e.user?.role}</td>
                    <td className="p-3">{e.title}</td>
                    <td className="p-3">₹{e.amount}</td>
                    <td className="p-3">{new Date(e.createdAt).toLocaleDateString()}</td>
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

export default AdminExpenses;