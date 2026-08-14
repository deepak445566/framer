import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBasket,
  MapPin,
  Gavel,
  Package,
  LineChart,
  Truck,
  UserCircle,
} from "lucide-react";

const tabClass = ({ isActive }) =>
  `flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
    isActive
      ? "bg-gradient-to-r from-green-600 to-green-500 text-white shadow-md shadow-green-200"
      : "text-gray-600 hover:bg-green-50 hover:text-green-700"
  }`;

const BuyerNav = () => {
  return (
    <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-green-100 overflow-x-auto sticky top-0 z-10 shadow-sm">
      <NavLink to="/dashboard" end className={tabClass}>
        <LayoutDashboard size={16} />
        Dashboard
      </NavLink>
      <NavLink to="/buyer/browse" className={tabClass}>
        <ShoppingBasket size={16} />
        Browse Crops
      </NavLink>
      <NavLink to="/buyer/nearby" className={tabClass}>
        <MapPin size={16} />
        Nearby Crops
      </NavLink>
      <NavLink to="/buyer/my-bids" className={tabClass}>
        <Gavel size={16} />
        My Bids
      </NavLink>
      <NavLink to="/buyer/orders" className={tabClass}>
        <Package size={16} />
        My Orders
      </NavLink>
      <NavLink to="/buyer/mandi-prices" className={tabClass}>
        <LineChart size={16} />
        Mandi Prices
      </NavLink>
      <NavLink to="/buyer/drivers" className={tabClass}>
        <Truck size={16} />
        Available Drivers
      </NavLink>
      <NavLink to="/buyer/profile" className={tabClass}>
        <UserCircle size={16} />
        Edit Profile
      </NavLink>
    </div>
  );
};

export default BuyerNav;