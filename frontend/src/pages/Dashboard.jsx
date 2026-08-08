import { useAuth } from "../context/AuthContext.jsx";
import BuyerDashboard from "./buyer/BuyerDashboard.jsx";
import FarmerDashboard from "./farmer/FarmerDashboard.jsx";
import DriverDashboard from "./driver/DriverDashboard.jsx";

const Dashboard = () => {
  const { user } = useAuth();

  if (user?.role === "BUYER") return <BuyerDashboard />;
  if (user?.role === "FARMER") return <FarmerDashboard />;
  if (user?.role === "DRIVER") return <DriverDashboard />;

  return <div className="p-6">Unknown role</div>;
};

export default Dashboard;