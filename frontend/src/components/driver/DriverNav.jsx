import { NavLink } from "react-router-dom";
import { LayoutDashboard, Truck, UserCircle } from "lucide-react";

const tabClass = ({ isActive }) =>
  `flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
    isActive
      ? "bg-gradient-to-r from-green-600 to-green-500 text-white shadow-md shadow-green-200"
      : "text-gray-600 hover:bg-green-50 hover:text-green-700"
  }`;

const DriverNav = () => {
  return (
    <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-green-100 overflow-x-auto sticky top-0 z-10 shadow-sm">
      <NavLink to="/dashboard" end className={tabClass}>
        <LayoutDashboard size={16} />
        Dashboard
      </NavLink>
      <NavLink to="/driver/deliveries" className={tabClass}>
        <Truck size={16} />
        My Deliveries
      </NavLink>
      <NavLink to="/driver/profile" className={tabClass}>
        <UserCircle size={16} />
        Edit Profile
      </NavLink>
    </div>
  );
};

export default DriverNav;