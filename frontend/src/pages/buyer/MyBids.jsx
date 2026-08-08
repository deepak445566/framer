import { useEffect, useState } from "react";
import { getMyBids, updateBid, cancelBid } from "../../api/bidApi.js";

const statusColor = {
  PENDING: "bg-yellow-100 text-yellow-700",
  ACCEPTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-600",
  CANCELLED: "bg-gray-100 text-gray-600",
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

  if (loading) return <div className="p-6 text-gray-500">Loading bids...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">My Bids</h2>

      {error && <p className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4">{error}</p>}

      {bids.length === 0 ? (
        <p className="text-gray-500">You haven't placed any bids yet.</p>
      ) : (
        <div className="space-y-4">
          {bids.map((bid) => (
            <div key={bid.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{bid.crop?.title}</h3>
                  <p className="text-sm text-gray-500">
                    Offered ₹{bid.amount} for {bid.quantity} {bid.crop?.unit}
                  </p>
                  {bid.message && <p className="text-sm text-gray-400 mt-1">"{bid.message}"</p>}
                </div>
                <span className={`px-2 py-1 rounded text-xs ${statusColor[bid.status]}`}>
                  {bid.status}
                </span>
              </div>

              {bid.status === "PENDING" && (
                <div className="mt-3">
                  {editingId === bid.id ? (
                    <div className="space-y-2 border-t pt-3">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          name="amount"
                          value={editForm.amount}
                          onChange={handleEditChange}
                          className="border rounded px-2 py-1 text-sm"
                          placeholder="Amount"
                        />
                        <input
                          type="number"
                          name="quantity"
                          value={editForm.quantity}
                          onChange={handleEditChange}
                          className="border rounded px-2 py-1 text-sm"
                          placeholder="Quantity"
                        />
                      </div>
                      <textarea
                        name="message"
                        value={editForm.message}
                        onChange={handleEditChange}
                        className="w-full border rounded px-2 py-1 text-sm"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdate(bid.id)}
                          disabled={actionLoading}
                          className="bg-green-600 text-white text-sm px-3 py-1 rounded hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-sm px-3 py-1 rounded border"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3 mt-2">
                      <button
                        onClick={() => startEdit(bid)}
                        className="text-sm text-green-700 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleCancel(bid.id)}
                        disabled={actionLoading}
                        className="text-sm text-red-600 font-medium"
                      >
                        Cancel Bid
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBids;