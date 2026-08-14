import { NavLink, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext.jsx";

const linkClass = ({ isActive }) =>
  `block px-4 py-2 rounded text-sm font-medium ${
    isActive ? "bg-green-600 text-white" : "text-gray-600 hover:bg-gray-100"
  }`;

const AdminNav = () => {
  const { logout, admin } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <div className="w-56 bg-white border-r min-h-screen p-4 flex flex-col">
      <h1 className="text-lg font-bold text-green-700 mb-1">Admin Panel</h1>
      <p className="text-xs text-gray-500 mb-6">{admin?.email}</p>

      <nav className="space-y-1 flex-1">
        <NavLink to="/admin/dashboard" className={linkClass}>Dashboard</NavLink>
        <NavLink to="/admin/users" className={linkClass}>Users</NavLink>
        <NavLink to="/admin/farmers" className={linkClass}>Farmers</NavLink>
        <NavLink to="/admin/buyers" className={linkClass}>Buyers</NavLink>
        <NavLink to="/admin/drivers" className={linkClass}>Drivers</NavLink>
        <NavLink to="/admin/crops" className={linkClass}>Crop Listings</NavLink>
        <NavLink to="/admin/orders" className={linkClass}>Orders</NavLink>
        <NavLink to="/admin/bids" className={linkClass}>Bids</NavLink>
        <NavLink to="/admin/expenses" className={linkClass}>Expenses</NavLink>
      </nav>

      <button
        onClick={handleLogout}
        className="bg-red-500 text-white text-sm px-4 py-2 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
};

export default AdminNav;