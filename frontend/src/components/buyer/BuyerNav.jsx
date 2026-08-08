import { NavLink } from "react-router-dom";

const tabClass = ({ isActive }) =>
  `px-4 py-2 rounded text-sm font-medium whitespace-nowrap ${
    isActive ? "bg-green-600 text-white" : "text-gray-600 hover:bg-gray-100"
  }`;

const BuyerNav = () => {
  return (
    <div className="flex gap-2 px-6 py-3 bg-white border-b overflow-x-auto">
      <NavLink to="/dashboard" end className={tabClass}>Dashboard</NavLink>
      <NavLink to="/buyer/browse" className={tabClass}>Browse Crops</NavLink>
      <NavLink to="/buyer/nearby" className={tabClass}>Nearby Crops</NavLink>
      <NavLink to="/buyer/my-bids" className={tabClass}>My Bids</NavLink>
      <NavLink to="/buyer/orders" className={tabClass}>My Orders</NavLink>
      <NavLink to="/buyer/mandi-prices" className={tabClass}>Mandi Prices</NavLink>
      <NavLink to="/buyer/drivers" className={tabClass}>Available Drivers</NavLink>
      <NavLink to="/buyer/profile" className={tabClass}>Edit Profile</NavLink>
    </div>
  );
};

export default BuyerNav;