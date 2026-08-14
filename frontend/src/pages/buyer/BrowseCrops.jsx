import { useEffect, useState } from "react";
import { getAllCrops, searchCrops } from "../../api/cropApi.js";
import { Link } from "react-router-dom";
import {
  Search,
  Sprout,
  User,
  ChevronLeft,
  ChevronRight,
  PackageSearch,
  Loader2,
  AlertCircle,
} from "lucide-react";

const BrowseCrops = () => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState("");

  const loadCrops = async (pageNum = 1) => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllCrops(pageNum, 9);
      setCrops(res.data.crops);
      setTotalPages(res.data.totalPages);
      setPage(res.data.page);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load crops");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCrops(1);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!category.trim()) return loadCrops(1);
    setLoading(true);
    setError("");
    try {
      const res = await searchCrops(category);
      setCrops(res.data.crops);
      setTotalPages(1);
      setPage(1);
    } catch (err) {
      setError(err.response?.data?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Browse Crops</h2>
            <p className="text-sm text-gray-500 mt-0.5">Fresh produce, straight from farmers</p>
          </div>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" />
              <input
                type="text"
                placeholder="Search by category..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border border-gray-200 rounded-full pl-9 pr-4 py-2 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
              />
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-green-600 to-green-500 text-white px-5 py-2 rounded-full text-sm font-semibold shadow-sm shadow-green-200 hover:shadow-md transition-all"
            >
              Search
            </button>
          </form>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-5 border border-red-100">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-gray-500">
            <Loader2 size={18} className="animate-spin text-green-600" />
            Loading crops...
          </div>
        ) : crops.length === 0 ? (
          <div className="bg-white rounded-2xl border border-green-100 p-10 text-center">
            <PackageSearch className="mx-auto text-green-300 mb-3" size={36} />
            <p className="text-gray-500">No crops found.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {crops.map((crop) => (
                <Link
                  to={`/buyer/crop/${crop.id}`}
                  key={crop.id}
                  className="group bg-white rounded-2xl shadow-sm border border-green-100 hover:shadow-lg hover:border-green-200 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                >
                  {crop.images?.[0] ? (
                    <img
                      src={crop.images[0]}
                      alt={crop.title}
                      className="w-full h-36 object-cover"
                    />
                  ) : (
                    <div className="w-full h-36 bg-green-50 flex items-center justify-center">
                      <Sprout className="text-green-300" size={32} />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-800 group-hover:text-green-700 transition-colors">
                      {crop.title}
                    </h3>
                    <span className="inline-block mt-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                      {crop.category}
                    </span>
                    <p className="text-sm text-gray-700 mt-2 font-medium">
                      {crop.quantity} {crop.unit} @ ₹{crop.pricePerUnit}/{crop.unit}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                      <User size={11} />
                      {crop.farmer?.user?.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-8">
                <button
                  disabled={page <= 1}
                  onClick={() => loadCrops(page - 1)}
                  className="flex items-center gap-1 px-4 py-2 rounded-full border border-green-200 text-sm font-medium text-green-700 hover:bg-green-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronLeft size={14} />
                  Prev
                </button>
                <span className="px-3 py-1 text-sm text-gray-600 font-medium">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => loadCrops(page + 1)}
                  className="flex items-center gap-1 px-4 py-2 rounded-full border border-green-200 text-sm font-medium text-green-700 hover:bg-green-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BrowseCrops;