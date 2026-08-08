import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import BuyerNav from "./components/buyer/BuyerNav.jsx";
import FarmerNav from "./components/farmer/FarmerNav.jsx";

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
import DriverNav from "./components/driver/DriverNav.jsx";
import AssignedDeliveries from "./pages/driver/AssignedDeliveries.jsx";
import DriverProfileEdit from "./pages/driver/DriverProfileEdit.jsx";
const TopNav = ({ user, logout }) => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };
  return (
    <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-green-700">Farm Marketplace</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{user?.name} ({user?.role})</span>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">
          Logout
        </button>
      </div>
    </nav>
  );
};

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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forget-password" element={<ForgetPassword />} />

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
          <Route path="/driver/deliveries" element={<ProtectedRoute><DriverLayout><AssignedDeliveries /></DriverLayout></ProtectedRoute>} />
<Route path="/driver/profile" element={<ProtectedRoute><DriverLayout><DriverProfileEdit /></DriverLayout></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;