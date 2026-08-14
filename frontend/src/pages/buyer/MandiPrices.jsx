import { useState, useEffect } from "react";
import { getStatesList, getStateWiseRates } from "../../api/govApi";
import {
  LineChart,
  MapPin,
  Loader2,
  AlertCircle,
  TrendingUp,
  Calendar,
} from "lucide-react";

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
        setStates(res.data.states || []);
      } catch (err) {
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-green-600 to-green-500 text-white shadow-md shadow-green-200">
            <LineChart size={18} />
          </span>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Mandi Prices</h2>
            <p className="text-sm text-gray-500 mt-0.5">Current rates from government sources</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-5 mb-6">
          <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
            <MapPin size={14} className="text-green-600" />
            State chuno
          </label>
          <select
            value={selectedState}
            onChange={handleStateChange}
            disabled={statesLoading}
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 disabled:opacity-60"
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

        {loading && (
          <div className="flex items-center gap-2 text-gray-500 mb-4">
            <Loader2 size={16} className="animate-spin text-green-600" />
            Rates load ho rahe hain...
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-4 border border-red-100">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        {searched && !loading && rates.length === 0 && !error && (
          <div className="bg-white rounded-2xl border border-green-100 p-10 text-center">
            <TrendingUp className="mx-auto text-green-300 mb-3" size={36} />
            <p className="text-gray-500">Is state ke liye koi data nahi mila.</p>
          </div>
        )}

        {rates.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-green-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-green-50/60 text-left">
                  <tr>
                    <th className="p-3 font-semibold text-gray-600">Commodity</th>
                    <th className="p-3 font-semibold text-gray-600">Market</th>
                    <th className="p-3 font-semibold text-gray-600">Min Price</th>
                    <th className="p-3 font-semibold text-gray-600">Max Price</th>
                    <th className="p-3 font-semibold text-gray-600">Modal Price</th>
                    <th className="p-3 font-semibold text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        Date
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rates.map((r, i) => (
                    <tr
                      key={i}
                      className="border-t border-green-50 hover:bg-green-50/30 transition-colors"
                    >
                      <td className="p-3 font-medium text-gray-800">{r.commodity}</td>
                      <td className="p-3 text-gray-600">{r.market}</td>
                      <td className="p-3 text-gray-600">₹{r.minPrice ?? "-"}</td>
                      <td className="p-3 text-gray-600">₹{r.maxPrice ?? "-"}</td>
                      <td className="p-3">
                        <span className="inline-block font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full text-xs">
                          ₹{r.modalPrice ?? "-"}
                        </span>
                      </td>
                      <td className="p-3 text-gray-500 text-xs">{r.arrivalDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MandiPrices;