import { useEffect, useState } from "react";
import { getMyBids, updateBid, cancelBid } from "../../api/bidApi.js";
import {
  Gavel,
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  Pencil,
  Loader2,
  AlertCircle,
  IndianRupee,
  Package,
} from "lucide-react";

const statusConfig = {
  PENDING: { color: "bg-yellow-100 text-yellow-700", icon: Clock },
  ACCEPTED: { color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  REJECTED: { color: "bg-red-100 text-red-600", icon: XCircle },
  CANCELLED: { color: "bg-gray-100 text-gray-600", icon: Ban },
};

const MyBids = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ amount: "", quantity: "", message: "" });
  const [actionLoading, setActionLoading] = useState(false);

  const loadBids = async () => {
    setLoading(true);
    try {
      const res = await getMyBids();
      setBids(res.data.bids);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load bids");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBids();
  }, []);

  const startEdit = (bid) => {
    setEditingId(bid.id);
    setEditForm({ amount: bid.amount, quantity: bid.quantity, message: bid.message || "" });
  };

  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleUpdate = async (bidId) => {
    setActionLoading(true);
    try {
      await updateBid(bidId, editForm);
      setEditingId(null);
      await loadBids();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update bid");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (bidId) => {
    if (!confirm("Cancel this bid?")) return;
    setActionLoading(true);
    try {
      await cancelBid(bidId);
      await loadBids();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel bid");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-10 text-gray-500">
        <Loader2 size={18} className="animate-spin text-green-600" />
        Loading bids...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Bids</h2>
          <p className="text-sm text-gray-500 mt-0.5">Track and manage your crop bids</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-5 border border-red-100">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        {bids.length === 0 ? (
          <div className="bg-white rounded-2xl border border-green-100 p-10 text-center">
            <Gavel className="mx-auto text-green-300 mb-3" size={36} />
            <p className="text-gray-500">You haven't placed any bids yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bids.map((bid) => {
              const config = statusConfig[bid.status] || {
                color: "bg-gray-100 text-gray-600",
                icon: Gavel,
              };
              const StatusIcon = config.icon;

              return (
                <div
                  key={bid.id}
                  className="bg-white rounded-2xl shadow-sm border border-green-100 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800">{bid.crop?.title}</h3>
                      <p className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                        <IndianRupee size={12} />
                        {bid.amount} for {bid.quantity} {bid.crop?.unit}
                      </p>
                      {bid.message && (
                        <p className="text-sm text-gray-400 italic mt-1">"{bid.message}"</p>
                      )}
                    </div>
                    <span
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}
                    >
                      <StatusIcon size={12} />
                      {bid.status}
                    </span>
                  </div>

                  {bid.status === "PENDING" && (
                    <div className="mt-4">
                      {editingId === bid.id ? (
                        <div className="space-y-3 border-t border-green-100 pt-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="relative">
                              <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" />
                              <input
                                type="number"
                                name="amount"
                                value={editForm.amount}
                                onChange={handleEditChange}
                                className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                                placeholder="Amount"
                              />
                            </div>
                            <div className="relative">
                              <Package size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" />
                              <input
                                type="number"
                                name="quantity"
                                value={editForm.quantity}
                                onChange={handleEditChange}
                                className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                                placeholder="Quantity"
                              />
                            </div>
                          </div>
                          <textarea
                            name="message"
                            value={editForm.message}
                            onChange={handleEditChange}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                            rows={2}
                            placeholder="Message (optional)"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdate(bid.id)}
                              disabled={actionLoading}
                              className="flex items-center gap-1.5 bg-gradient-to-r from-green-600 to-green-500 text-white text-sm font-semibold px-4 py-1.5 rounded-full shadow-sm shadow-green-200 hover:shadow-md transition-all disabled:opacity-50"
                            >
                              {actionLoading ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-sm font-medium px-4 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-3 mt-2 border-t border-green-100 pt-3">
                          <button
                            onClick={() => startEdit(bid)}
                            className="flex items-center gap-1.5 text-sm text-green-700 font-semibold hover:text-green-800 transition-colors"
                          >
                            <Pencil size={13} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleCancel(bid.id)}
                            disabled={actionLoading}
                            className="flex items-center gap-1.5 text-sm text-red-600 font-semibold hover:text-red-700 transition-colors disabled:opacity-50"
                          >
                            <XCircle size={13} />
                            Cancel Bid
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBids;