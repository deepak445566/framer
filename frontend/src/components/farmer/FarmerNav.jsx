import { NavLink } from "react-router-dom";

const tabClass = ({ isActive }) =>
  `px-4 py-2 rounded text-sm font-medium whitespace-nowrap ${
    isActive ? "bg-green-600 text-white" : "text-gray-600 hover:bg-gray-100"
  }`;

const FarmerNav = () => {
  return (
    <div className="flex gap-2 px-6 py-3 bg-white border-b overflow-x-auto">
      <NavLink to="/dashboard" end className={tabClass}>Dashboard</NavLink>
      <NavLink to="/farmer/my-crops" className={tabClass}>My Crops</NavLink>
      <NavLink to="/farmer/crops/create" className={tabClass}>Add Crop</NavLink>
      <NavLink to="/farmer/orders" className={tabClass}>Orders</NavLink>
      <NavLink to="/farmer/nearby-drivers" className={tabClass}>Nearby Drivers</NavLink>
      <NavLink to="/farmer/profile" className={tabClass}>Edit Profile</NavLink>
    </div>
  );
};

export default FarmerNav;