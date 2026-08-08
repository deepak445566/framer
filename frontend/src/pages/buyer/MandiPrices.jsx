import { useState, useEffect } from "react";
import { getStatesList, getStateWiseRates } from "../../api/govApi";


const MandiPrices = () => {
  const [states, setStates] = useState([]);
  const [statesLoading, setStatesLoading] = useState(true);
  const [selectedState, setSelectedState] = useState("");

  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  // Page load hote hi states dropdown ke liye data laao
 useEffect(() => {
  const fetchStates = async () => {
    try {
      const res = await getStatesList();
      console.log("States API response:", res.data);   // 👈 ye line add karo
      setStates(res.data.states || []);
    } catch (err) {
      console.log("States fetch error:", err);           // 👈 ye bhi add karo
      setError("States list load nahi ho payi. Page refresh karo.");
    } finally {
      setStatesLoading(false);
    }
  };
  fetchStates();
}, []);

  const handleStateChange = async (e) => {
    const state = e.target.value;
    setSelectedState(state);

    if (!state) {
      setRates([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const res = await getStateWiseRates(state);
      setRates(res.data.rates || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch mandi prices");
      setRates([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Mandi Prices — Current Rates</h2>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          State chuno
        </label>
        <select
          value={selectedState}
          onChange={handleStateChange}
          disabled={statesLoading}
          className="border rounded px-3 py-2 text-sm w-full max-w-sm"
        >
          <option value="">
            {statesLoading ? "States load ho rahe hain..." : "-- Select State --"}
          </option>
          {states.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-gray-500">Rates load ho rahe hain...</p>}

      {error && (
        <p className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4">{error}</p>
      )}

      {searched && !loading && rates.length === 0 && !error && (
        <p className="text-gray-500">Is state ke liye koi data nahi mila.</p>
      )}

      {rates.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3">Commodity</th>
                <th className="p-3">Market</th>
                <th className="p-3">Min Price</th>
                <th className="p-3">Max Price</th>
                <th className="p-3">Modal Price</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="p-3 font-medium">{r.commodity}</td>
                  <td className="p-3">{r.market}</td>
                  <td className="p-3">₹{r.minPrice ?? "-"}</td>
                  <td className="p-3">₹{r.maxPrice ?? "-"}</td>
                  <td className="p-3 font-semibold text-green-700">
                    ₹{r.modalPrice ?? "-"}
                  </td>
                  <td className="p-3">{r.arrivalDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MandiPrices;