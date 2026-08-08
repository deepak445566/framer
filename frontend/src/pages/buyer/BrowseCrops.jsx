import { useEffect, useState } from "react";
import { getAllCrops, searchCrops } from "../../api/cropApi.js";
import { Link } from "react-router-dom";

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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Browse Crops</h2>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search by category..."
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
          >
            Search
          </button>
        </form>
      </div>

      {error && <p className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Loading crops...</p>
      ) : crops.length === 0 ? (
        <p className="text-gray-500">No crops found.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {crops.map((crop) => (
              <Link
                to={`/buyer/crop/${crop.id}`}
                key={crop.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition p-4"
              >
                {crop.images?.[0] && (
                  <img
                    src={crop.images[0]}
                    alt={crop.title}
                    className="w-full h-36 object-cover rounded mb-3"
                  />
                )}
                <h3 className="font-semibold text-lg">{crop.title}</h3>
                <p className="text-sm text-gray-500">{crop.category}</p>
                <p className="text-sm mt-1">
                  {crop.quantity} {crop.unit} @ ₹{crop.pricePerUnit}/{crop.unit}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  by {crop.farmer?.user?.name}
                </p>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                disabled={page <= 1}
                onClick={() => loadCrops(page - 1)}
                className="px-3 py-1 border rounded disabled:opacity-40"
              >
                Prev
              </button>
              <span className="px-3 py-1 text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => loadCrops(page + 1)}
                className="px-3 py-1 border rounded disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BrowseCrops;