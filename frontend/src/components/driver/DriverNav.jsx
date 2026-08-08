import { NavLink } from "react-router-dom";

const tabClass = ({ isActive }) =>
  `px-4 py-2 rounded text-sm font-medium whitespace-nowrap ${
    isActive ? "bg-green-600 text-white" : "text-gray-600 hover:bg-gray-100"
  }`;

const DriverNav = () => {
  return (
    <div className="flex gap-2 px-6 py-3 bg-white border-b overflow-x-auto">
      <NavLink to="/dashboard" end className={tabClass}>Dashboard</NavLink>
      <NavLink to="/driver/deliveries" className={tabClass}>My Deliveries</NavLink>
      <NavLink to="/driver/profile" className={tabClass}>Edit Profile</NavLink>
    </div>
  );
};

export default DriverNav;