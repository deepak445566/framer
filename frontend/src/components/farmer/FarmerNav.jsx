import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Sprout,
  PlusCircle,
  ShoppingCart,
  Truck,
  UserCircle,
} from "lucide-react";

const tabClass = ({ isActive }) =>
  `flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
    isActive
      ? "bg-gradient-to-r from-green-600 to-green-500 text-white shadow-md shadow-green-200"
      : "text-gray-600 hover:bg-green-50 hover:text-green-700"
  }`;

const FarmerNav = () => {
  return (
    <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-green-100 overflow-x-auto sticky top-0 z-10 shadow-sm">
      <NavLink to="/dashboard" end className={tabClass}>
        <LayoutDashboard size={16} />
        Dashboard
      </NavLink>
      <NavLink to="/farmer/my-crops" className={tabClass}>
        <Sprout size={16} />
        My Crops
      </NavLink>
      <NavLink to="/farmer/crops/create" className={tabClass}>
        <PlusCircle size={16} />
        Add Crop
      </NavLink>
      <NavLink to="/farmer/orders" className={tabClass}>
        <ShoppingCart size={16} />
        Orders
      </NavLink>
      <NavLink to="/farmer/nearby-drivers" className={tabClass}>
        <Truck size={16} />
        Nearby Drivers
      </NavLink>
      <NavLink to="/farmer/profile" className={tabClass}>
        <UserCircle size={16} />
        Edit Profile
      </NavLink>
    </div>
  );
};

export default FarmerNav;