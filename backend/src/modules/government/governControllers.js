import axios from "axios";

const MANDI_RESOURCE_URL =
  "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";

export const getMandiPrices = async (req, res) => {
  try {
    const {
      state,
      district,
      market,
      commodity,
      limit = 50,
      offset = 0,
      minPrice,
      maxPrice,
      arrivalDate,
    } = req.query;

    // Validate limit
    const parsedLimit = parseInt(limit);
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      return res.status(400).json({
        success: false,
        message: "Limit must be between 1 and 100",
      });
    }

    const params = {
      "api-key": process.env.DATA_GOV_API_KEY,
      format: "json",
      limit: parsedLimit,
      offset: parseInt(offset) || 0,
    };

    // ✅ FIX: use the exact capitalized field names shown in the
    // official Swagger docs — filters[state.keyword], filters[district], etc.
    if (state) {
      params["filters[state.keyword]"] = state;
    }

    if (district) {
      params["filters[district]"] = district;
    }

    if (market) {
      params["filters[market]"] = market;
    }

    if (commodity) {
      params["filters[commodity]"] = commodity;
    }

    if (arrivalDate) {
      params["filters[arrival_date]"] = arrivalDate;
    }

    console.log("Params sent:", params);

    // Make API request
    const response = await axios.get(MANDI_RESOURCE_URL, {
      params,
      timeout: 10000, // 10 second timeout
      headers: {
        Accept: "application/json",
      },
    });

    console.log("Raw response:", response.data);

    // Process records with optional price filtering
    let records = response.data.records || [];

    if (minPrice || maxPrice) {
      records = records.filter((record) => {
        const price = parseFloat(record.modal_price);
        if (isNaN(price)) return true;

        if (minPrice && price < parseFloat(minPrice)) return false;
        if (maxPrice && price > parseFloat(maxPrice)) return false;
        return true;
      });
    }

    // Calculate statistics
    const prices = records
      .map((r) => parseFloat(r.modal_price))
      .filter((p) => !isNaN(p));

    const stats = {
      totalRecords: response.data.total || records.length,
      filteredCount: records.length,
      averagePrice:
        prices.length > 0
          ? prices.reduce((sum, p) => sum + p, 0) / prices.length
          : 0,
      minPrice: prices.length > 0 ? Math.min(...prices) : 0,
      maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
    };

    return res.status(200).json({
      success: true,
      stats,
      records,
      pagination: {
        limit: parsedLimit,
        offset: parseInt(offset) || 0,
        total: response.data.total || records.length,
      },
    });
  } catch (error) {
    console.error("Mandi Prices API Error:", error.message);

    if (error.code === "ECONNABORTED") {
      return res.status(504).json({
        success: false,
        message: "Request timeout - please try again",
      });
    }

    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: `API Error: ${
          error.response.data?.message || error.response.statusText
        }`,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch mandi prices. Please try again later.",
    });
  }
};

// Additional endpoint: Get current rate of ALL commodities for a single state
// (this is the one to use when the user only enters State — no district/commodity needed)
export const getStateWiseCommodityRates = async (req, res) => {
  try {
    const { state, district } = req.query;

    if (!state) {
      return res.status(400).json({
        success: false,
        message: "State parameter is required",
      });
    }

    const params = {
      "api-key": process.env.DATA_GOV_API_KEY,
      format: "json",
      limit: 1000, // pull a big batch so we can group across all commodities/markets
      "filters[state.keyword]": state, // ✅ dataset ka actual field_exposed.id
    };

    if (district) {
      params["filters[district]"] = district;
    }

    const response = await axios.get(MANDI_RESOURCE_URL, {
      params,
      timeout: 10000,
    });

    const records = response.data.records || [];

    // Group by commodity, keep the record with the latest arrival_date per commodity.
    // If multiple markets report the same commodity on the same latest date,
    // average their modal price so the "current rate" isn't just one random market.
    const byCommodity = {};

    for (const r of records) {
      const commodity = r.commodity;
      if (!commodity || !r.arrival_date) continue;

      if (!byCommodity[commodity]) {
        byCommodity[commodity] = { latestDate: r.arrival_date, rows: [r] };
        continue;
      }

      const bucket = byCommodity[commodity];
      const cmp = compareDates(r.arrival_date, bucket.latestDate);

      if (cmp > 0) {
        // newer date found — reset bucket
        bucket.latestDate = r.arrival_date;
        bucket.rows = [r];
      } else if (cmp === 0) {
        // same latest date — collect alongside
        bucket.rows.push(r);
      }
      // older date — ignore
    }

    const currentRates = Object.keys(byCommodity)
      .sort()
      .map((commodity) => {
        const { latestDate, rows } = byCommodity[commodity];
        const modalPrices = rows
          .map((r) => parseFloat(r.modal_price))
          .filter((p) => !isNaN(p));
        const minPrices = rows
          .map((r) => parseFloat(r.min_price))
          .filter((p) => !isNaN(p));
        const maxPrices = rows
          .map((r) => parseFloat(r.max_price))
          .filter((p) => !isNaN(p));

        return {
          commodity,
          arrivalDate: latestDate,
          market: rows.length === 1 ? rows[0].market : `${rows.length} markets`,
          modalPrice:
            modalPrices.length > 0
              ? Math.round(
                  modalPrices.reduce((a, b) => a + b, 0) / modalPrices.length
                )
              : null,
          minPrice: minPrices.length > 0 ? Math.min(...minPrices) : null,
          maxPrice: maxPrices.length > 0 ? Math.max(...maxPrices) : null,
        };
      });

    return res.status(200).json({
      success: true,
      state,
      district: district || "All",
      totalCommodities: currentRates.length,
      rates: currentRates,
    });
  } catch (error) {
    console.error("State-wise Commodity Rates Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// helper: compares dates in DD/MM/YYYY (data.gov.in's format) — returns >0 if a is newer than b
function compareDates(a, b) {
  const toComparable = (d) => {
    const [dd, mm, yyyy] = d.split("/");
    return `${yyyy}${mm}${dd}`;
  };
  return toComparable(a) > toComparable(b)
    ? 1
    : toComparable(a) < toComparable(b)
    ? -1
    : 0;
}

// Additional endpoint: Get unique states
export const getMandiStates = async (req, res) => {
  try {
    const response = await axios.get(MANDI_RESOURCE_URL, {
      params: {
        "api-key": process.env.DATA_GOV_API_KEY,
        format: "json",
        limit: 1000,
      },
      timeout: 10000,
    });

    const states = [
      ...new Set(response.data.records.map((r) => r.state).filter(Boolean)),
    ].sort();

    return res.status(200).json({
      success: true,
      total: states.length,
      states,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Additional endpoint: Get commodities by state
export const getMandiCommodities = async (req, res) => {
  try {
    const { state, district } = req.query;

    if (!state) {
      return res.status(400).json({
        success: false,
        message: "State parameter is required",
      });
    }

    const params = {
      "api-key": process.env.DATA_GOV_API_KEY,
      format: "json",
      limit: 1000,
      "filters[state.keyword]": state,
    };

    if (district) {
      params["filters[district]"] = district;
    }

    const response = await axios.get(MANDI_RESOURCE_URL, {
      params,
      timeout: 10000,
    });

    const commodities = [
      ...new Set(
        response.data.records.map((r) => r.commodity).filter(Boolean)
      ),
    ].sort();

    return res.status(200).json({
      success: true,
      state,
      district: district || "All",
      total: commodities.length,
      commodities,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Additional endpoint: Get price trends for a commodity
export const getMandiPriceTrends = async (req, res) => {
  try {
    const { commodity, state, district, market, days = 30 } = req.query;

    if (!commodity) {
      return res.status(400).json({
        success: false,
        message: "Commodity parameter is required",
      });
    }

    const params = {
      "api-key": process.env.DATA_GOV_API_KEY,
      format: "json",
      limit: 1000,
      "filters[commodity]": commodity,
    };

    if (state) {
      params["filters[state.keyword]"] = state;
    }

    if (district) {
      params["filters[district]"] = district;
    }

    if (market) {
      params["filters[market]"] = market;
    }

    const response = await axios.get(MANDI_RESOURCE_URL, {
      params,
      timeout: 10000,
    });

    // Process records for trends
    const records = response.data.records || [];

    // Group by arrival date
    const groupedByDate = records.reduce((acc, record) => {
      if (!record.arrival_date) return acc;

      const date = record.arrival_date;
      if (!acc[date]) {
        acc[date] = {
          date,
          prices: [],
          minPrice: [],
          maxPrice: [],
          modalPrice: [],
        };
      }

      acc[date].prices.push(parseFloat(record.modal_price) || 0);
      acc[date].minPrice.push(parseFloat(record.min_price) || 0);
      acc[date].maxPrice.push(parseFloat(record.max_price) || 0);
      acc[date].modalPrice.push(parseFloat(record.modal_price) || 0);

      return acc;
    }, {});

    // Calculate daily averages
    const trends = Object.keys(groupedByDate)
      .sort()
      .slice(-parseInt(days))
      .map((date) => {
        const data = groupedByDate[date];
        return {
          date,
          averagePrice:
            data.modalPrice.reduce((a, b) => a + b, 0) /
            data.modalPrice.length,
          minPrice: Math.min(...data.minPrice),
          maxPrice: Math.max(...data.maxPrice),
          totalRecords: data.prices.length,
        };
      });

    // Calculate overall statistics
    const allPrices = records
      .map((r) => parseFloat(r.modal_price))
      .filter((p) => !isNaN(p));

    const stats = {
      currentPrice: allPrices.length > 0 ? allPrices[allPrices.length - 1] : 0,
      averagePrice:
        allPrices.length > 0
          ? allPrices.reduce((a, b) => a + b, 0) / allPrices.length
          : 0,
      minPrice: allPrices.length > 0 ? Math.min(...allPrices) : 0,
      maxPrice: allPrices.length > 0 ? Math.max(...allPrices) : 0,
      totalRecords: records.length,
    };

    return res.status(200).json({
      success: true,
      commodity,
      state: state || "All",
      district: district || "All",
      market: market || "All",
      stats,
      trends,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Additional endpoint: Compare prices across markets
export const compareMandiPrices = async (req, res) => {
  try {
    const { commodity, states } = req.query;

    if (!commodity) {
      return res.status(400).json({
        success: false,
        message: "Commodity parameter is required",
      });
    }

    // Parse states (comma-separated)
    const stateList = states ? states.split(",").map((s) => s.trim()) : [];

    const params = {
      "api-key": process.env.DATA_GOV_API_KEY,
      format: "json",
      limit: 1000,
      "filters[commodity]": commodity,
    };

    const response = await axios.get(MANDI_RESOURCE_URL, {
      params,
      timeout: 10000,
    });

    // Filter records
    let records = response.data.records || [];

    if (stateList.length > 0) {
      records = records.filter((r) =>
        stateList.some((state) =>
          r.state?.toLowerCase().includes(state.toLowerCase())
        )
      );
    }

    // Group by state and market
    const groupedByMarket = records.reduce((acc, record) => {
      const key = `${record.state || "Unknown"} - ${record.market || "Unknown"}`;
      if (!acc[key]) {
        acc[key] = {
          state: record.state || "Unknown",
          market: record.market || "Unknown",
          prices: [],
          records: [],
        };
      }
      const price = parseFloat(record.modal_price);
      if (!isNaN(price)) {
        acc[key].prices.push(price);
      }
      acc[key].records.push(record);
      return acc;
    }, {});

    // Calculate statistics per market
    const comparison = Object.keys(groupedByMarket).map((key) => {
      const data = groupedByMarket[key];
      const prices = data.prices;
      return {
        state: data.state,
        market: data.market,
        averagePrice:
          prices.length > 0
            ? prices.reduce((a, b) => a + b, 0) / prices.length
            : 0,
        minPrice: prices.length > 0 ? Math.min(...prices) : 0,
        maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
        totalRecords: data.records.length,
      };
    });

    // Sort by average price
    comparison.sort((a, b) => a.averagePrice - b.averagePrice);

    return res.status(200).json({
      success: true,
      commodity,
      comparison,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};