import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCropBids, acceptBid, rejectBid } from "../../api/bidApi.js";

const statusColor = {
  PENDING: "bg-yellow-100 text-yellow-700",
  ACCEPTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-600",
  CANCELLED: "bg-gray-100 text-gray-600",
};

const CropBids = () => {
  const { cropId } = useParams();
  const navigate = useNavigate();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getCropBids(cropId);
      setBids(res.data.bids);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load bids");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [cropId]);

  const handleAccept = async (bidId) => {
    if (!confirm("Accept this bid? An order will be created and other bids will remain pending.")) return;
    setActionId(bidId);
    try {
      await acceptBid(bidId);
      await load();
      navigate("/farmer/orders");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to accept bid");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (bidId) => {
    if (!confirm("Reject this bid?")) return;
    setActionId(bidId);
    try {
      await rejectBid(bidId);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject bid");
    } finally {
      setActionId(null);
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Loading bids...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Bids on This Crop</h2>

      {error && <p className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4">{error}</p>}

      {bids.length === 0 ? (
        <p className="text-gray-500">No bids received yet.</p>
      ) : (
        <div className="space-y-4">
          {bids.map((bid) => (
            <div key={bid.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{bid.buyer?.user?.name}</h3>
                  <p className="text-sm text-gray-500">{bid.buyer?.user?.email}</p>
                  <p className="text-sm mt-1">
                    Offered ₹{bid.amount} for {bid.quantity} units
                  </p>
                  {bid.message && <p className="text-sm text-gray-400 mt-1">"{bid.message}"</p>}
                </div>
                <span className={`px-2 py-1 rounded text-xs ${statusColor[bid.status]}`}>
                  {bid.status}
                </span>
              </div>

              {bid.status === "PENDING" && (
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={() => handleAccept(bid.id)}
                    disabled={actionId === bid.id}
                    className="bg-green-600 text-white text-sm px-4 py-1.5 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(bid.id)}
                    disabled={actionId === bid.id}
                    className="bg-red-500 text-white text-sm px-4 py-1.5 rounded hover:bg-red-600 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CropBids;