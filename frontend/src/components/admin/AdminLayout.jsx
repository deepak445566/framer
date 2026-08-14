import AdminNav from "./AdminNav.jsx";

const AdminLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav />
      <div className="flex-1">{children}</div>
    </div>
  );
};

export default AdminLayout;