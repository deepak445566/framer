import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { AdminAuthProvider } from "./context/AdminAuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute.jsx";
import BuyerNav from "./components/buyer/BuyerNav.jsx";
import FarmerNav from "./components/farmer/FarmerNav.jsx";
import DriverNav from "./components/driver/DriverNav.jsx";
import { Sprout, LogOut } from "lucide-react";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgetPassword from "./pages/ForgetPassword.jsx";
import Dashboard from "./pages/Dashboard.jsx";

import BrowseCrops from "./pages/buyer/BrowseCrops.jsx";
import NearbyCrops from "./pages/buyer/NearbyCrops.jsx";
import CropDetails from "./pages/buyer/CropDetails.jsx";
import MyBids from "./pages/buyer/MyBids.jsx";
import BuyerProfileEdit from "./pages/buyer/BuyerProfileEdit.jsx";
import MyOrders from "./pages/buyer/MyOrders.jsx";
import OrderDetails from "./pages/buyer/OrderDetails.jsx";
import MandiPrices from "./pages/buyer/MandiPrices.jsx";
import AvailableDrivers from "./pages/buyer/AvailableDrivers.jsx";

import MyCrops from "./pages/farmer/MyCrops.jsx";
import CreateCrop from "./pages/farmer/CreateCrop.jsx";
import EditCrop from "./pages/farmer/EditCrop.jsx";
import CropBids from "./pages/farmer/CropBids.jsx";
import FarmerOrders from "./pages/farmer/FarmerOrders.jsx";
import FarmerOrderDetails from "./pages/farmer/FarmerOrderDetails.jsx";
import NearbyDrivers from "./pages/farmer/NearbyDrivers.jsx";
import FarmerProfileEdit from "./pages/farmer/FarmerProfileEdit.jsx";

import AssignedDeliveries from "./pages/driver/AssignedDeliveries.jsx";
import DriverProfileEdit from "./pages/driver/DriverProfileEdit.jsx";

import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminUserDetails from "./pages/admin/AdminUserDetails.jsx";
import AdminFarmers from "./pages/admin/AdminFarmers.jsx";
import AdminBuyers from "./pages/admin/AdminBuyers.jsx";
import AdminDrivers from "./pages/admin/AdminDrivers.jsx";
import AdminCrops from "./pages/admin/AdminCrops.jsx";
import AdminOrders from "./pages/admin/AdminOrders.jsx";
import AdminBids from "./pages/admin/AdminBids.jsx";
import AdminExpenses from "./pages/admin/AdminExpenses.jsx";

// ---------------- Shared Top Nav (user side) ----------------
const TopNav = ({ user, logout }) => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const initial = user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <nav className="bg-white shadow-sm border-b border-green-100 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-r from-green-600 to-green-500 text-white shadow-sm shadow-green-200">
          <Sprout size={18} />
        </span>
        <h1 className="text-xl font-bold text-green-700">Farm Marketplace</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-full pl-1 pr-3 py-1">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-green-600 text-white text-xs font-bold">
            {initial}
          </span>
          <span className="text-sm text-gray-700 font-medium">
            {user?.name} <span className="text-gray-400 font-normal">({user?.role})</span>
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-full text-sm font-semibold hover:bg-red-100 transition-all"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </nav>
  );
};

// ---------------- Role Layouts ----------------
const BuyerLayout = ({ children }) => {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav user={user} logout={logout} />
      <BuyerNav />
      {children}
    </div>
  );
};

const FarmerLayout = ({ children }) => {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav user={user} logout={logout} />
      <FarmerNav />
      {children}
    </div>
  );
};

const DriverLayout = ({ children }) => {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav user={user} logout={logout} />
      <DriverNav />
      {children}
    </div>
  );
};

// ---------------- 404 Page ----------------
const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    <h1 className="text-4xl font-bold text-gray-300 mb-2">404</h1>
    <p className="text-gray-500 mb-4">Page not found</p>
    <a href="/dashboard" className="text-green-700 font-medium">Go to Dashboard</a>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Root — login page pe bhej do */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Public / Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forget-password" element={<ForgetPassword />} />

            {/* Shared dashboard — role ke hisaab se andar redirect hota hai */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

            {/* Buyer routes */}
            <Route path="/buyer/browse" element={<ProtectedRoute><BuyerLayout><BrowseCrops /></BuyerLayout></ProtectedRoute>} />
            <Route path="/buyer/nearby" element={<ProtectedRoute><BuyerLayout><NearbyCrops /></BuyerLayout></ProtectedRoute>} />
            <Route path="/buyer/crop/:cropId" element={<ProtectedRoute><BuyerLayout><CropDetails /></BuyerLayout></ProtectedRoute>} />
            <Route path="/buyer/my-bids" element={<ProtectedRoute><BuyerLayout><MyBids /></BuyerLayout></ProtectedRoute>} />
            <Route path="/buyer/orders" element={<ProtectedRoute><BuyerLayout><MyOrders /></BuyerLayout></ProtectedRoute>} />
            <Route path="/buyer/orders/:orderId" element={<ProtectedRoute><BuyerLayout><OrderDetails /></BuyerLayout></ProtectedRoute>} />
            <Route path="/buyer/mandi-prices" element={<ProtectedRoute><BuyerLayout><MandiPrices /></BuyerLayout></ProtectedRoute>} />
            <Route path="/buyer/drivers" element={<ProtectedRoute><BuyerLayout><AvailableDrivers /></BuyerLayout></ProtectedRoute>} />
            <Route path="/buyer/profile" element={<ProtectedRoute><BuyerLayout><BuyerProfileEdit /></BuyerLayout></ProtectedRoute>} />

            {/* Farmer routes */}
            <Route path="/farmer/my-crops" element={<ProtectedRoute><FarmerLayout><MyCrops /></FarmerLayout></ProtectedRoute>} />
            <Route path="/farmer/crops/create" element={<ProtectedRoute><FarmerLayout><CreateCrop /></FarmerLayout></ProtectedRoute>} />
            <Route path="/farmer/crops/:cropId/edit" element={<ProtectedRoute><FarmerLayout><EditCrop /></FarmerLayout></ProtectedRoute>} />
            <Route path="/farmer/crops/:cropId/bids" element={<ProtectedRoute><FarmerLayout><CropBids /></FarmerLayout></ProtectedRoute>} />
            <Route path="/farmer/orders" element={<ProtectedRoute><FarmerLayout><FarmerOrders /></FarmerLayout></ProtectedRoute>} />
            <Route path="/farmer/orders/:orderId" element={<ProtectedRoute><FarmerLayout><FarmerOrderDetails /></FarmerLayout></ProtectedRoute>} />
            <Route path="/farmer/nearby-drivers" element={<ProtectedRoute><FarmerLayout><NearbyDrivers /></FarmerLayout></ProtectedRoute>} />
            <Route path="/farmer/profile" element={<ProtectedRoute><FarmerLayout><FarmerProfileEdit /></FarmerLayout></ProtectedRoute>} />

            {/* Driver routes */}
            <Route path="/driver/deliveries" element={<ProtectedRoute><DriverLayout><AssignedDeliveries /></DriverLayout></ProtectedRoute>} />
            <Route path="/driver/profile" element={<ProtectedRoute><DriverLayout><DriverProfileEdit /></DriverLayout></ProtectedRoute>} />

            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
            <Route path="/admin/users" element={<AdminProtectedRoute><AdminUsers /></AdminProtectedRoute>} />
            <Route path="/admin/users/:id" element={<AdminProtectedRoute><AdminUserDetails /></AdminProtectedRoute>} />
            <Route path="/admin/farmers" element={<AdminProtectedRoute><AdminFarmers /></AdminProtectedRoute>} />
            <Route path="/admin/buyers" element={<AdminProtectedRoute><AdminBuyers /></AdminProtectedRoute>} />
            <Route path="/admin/drivers" element={<AdminProtectedRoute><AdminDrivers /></AdminProtectedRoute>} />
            <Route path="/admin/crops" element={<AdminProtectedRoute><AdminCrops /></AdminProtectedRoute>} />
            <Route path="/admin/orders" element={<AdminProtectedRoute><AdminOrders /></AdminProtectedRoute>} />
            <Route path="/admin/bids" element={<AdminProtectedRoute><AdminBids /></AdminProtectedRoute>} />
            <Route path="/admin/expenses" element={<AdminProtectedRoute><AdminExpenses /></AdminProtectedRoute>} />

            {/* 404 — hamesha sabse last me */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;