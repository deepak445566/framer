import { useEffect, useState } from "react";
import { getDashboardStats } from "../../api/adminApi.js";
import AdminLayout from "../../components/admin/AdminLayout.jsx";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getDashboardStats();
        setStats(res.data.dashboard);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <AdminLayout>
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-6">Platform Overview</h2>

        {error && <p className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4">{error}</p>}

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Users" value={stats.totalUsers} />
            <StatCard label="Farmers" value={stats.totalFarmers} />
            <StatCard label="Buyers" value={stats.totalBuyers} />
            <StatCard label="Drivers" value={stats.totalDrivers} />
            <StatCard label="Crop Listings" value={stats.totalCropListings} />
            <StatCard label="Total Bids" value={stats.totalBids} />
            <StatCard label="Total Orders" value={stats.totalOrders} />
            <StatCard label="Total Deliveries" value={stats.totalDeliveries} />
            <StatCard label="Pending Orders" value={stats.pendingOrders} />
            <StatCard label="Delivered Orders" value={stats.deliveredOrders} />
            <StatCard label="Total Expenses" value={stats.totalExpenses} />
            <StatCard label="Total Commission Earned" value={`₹${stats.totalCommissionEarned || 0}`} />
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

const StatCard = ({ label, value }) => (
  <div className="bg-white rounded-lg shadow p-4">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
  </div>
);

export default AdminDashboard;