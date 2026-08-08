import axios from "axios";

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

    // Add filters
    if (state) {
      params["filters[state.keyword]"] = state;
    }

    if (district) {
      params["filters[district.keyword]"] = district;
    }

    if (market) {
      params["filters[market.keyword]"] = market;
    }

    if (commodity) {
      params["filters[commodity.keyword]"] = commodity;
    }

    if (arrivalDate) {
      params["filters[arrival_date]"] = arrivalDate;
    }

    // Make API request
    const response = await axios.get(
      "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070",
      {
        params,
        timeout: 10000, // 10 second timeout
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    // Process records with optional price filtering
    let records = response.data.records || [];

    if (minPrice || maxPrice) {
      records = records.filter(record => {
        const price = parseFloat(record.modal_price);
        if (isNaN(price)) return true;
        
        if (minPrice && price < parseFloat(minPrice)) return false;
        if (maxPrice && price > parseFloat(maxPrice)) return false;
        return true;
      });
    }

    // Calculate statistics
    const prices = records
      .map(r => parseFloat(r.modal_price))
      .filter(p => !isNaN(p));

    const stats = {
      totalRecords: response.data.total || records.length,
      filteredCount: records.length,
      averagePrice: prices.length > 0 
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
    
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        success: false,
        message: "Request timeout - please try again",
      });
    }

    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: `API Error: ${error.response.data?.message || error.response.statusText}`,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch mandi prices. Please try again later.",
    });
  }
};

// Additional endpoint: Get unique states
export const getMandiStates = async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070",
      {
        params: {
          "api-key": process.env.DATA_GOV_API_KEY,
          format: "json",
          limit: 1000,
        },
        timeout: 10000,
      }
    );

    const states = [...new Set(
      response.data.records
        .map(r => r.state)
        .filter(Boolean)
    )].sort();

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
      params["filters[district.keyword]"] = district;
    }

    const response = await axios.get(
      "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070",
      {
        params,
        timeout: 10000,
      }
    );

    const commodities = [...new Set(
      response.data.records
        .map(r => r.commodity)
        .filter(Boolean)
    )].sort();

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
      "filters[commodity.keyword]": commodity,
    };

    if (state) {
      params["filters[state.keyword]"] = state;
    }

    if (district) {
      params["filters[district.keyword]"] = district;
    }

    if (market) {
      params["filters[market.keyword]"] = market;
    }

    const response = await axios.get(
      "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070",
      {
        params,
        timeout: 10000,
      }
    );

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
      .map(date => {
        const data = groupedByDate[date];
        return {
          date,
          averagePrice: data.modalPrice.reduce((a, b) => a + b, 0) / data.modalPrice.length,
          minPrice: Math.min(...data.minPrice),
          maxPrice: Math.max(...data.maxPrice),
          totalRecords: data.prices.length,
        };
      });

    // Calculate overall statistics
    const allPrices = records
      .map(r => parseFloat(r.modal_price))
      .filter(p => !isNaN(p));

    const stats = {
      currentPrice: allPrices.length > 0 ? allPrices[allPrices.length - 1] : 0,
      averagePrice: allPrices.length > 0 
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
    const stateList = states ? states.split(',').map(s => s.trim()) : [];

    const params = {
      "api-key": process.env.DATA_GOV_API_KEY,
      format: "json",
      limit: 1000,
      "filters[commodity.keyword]": commodity,
    };

    const response = await axios.get(
      "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070",
      {
        params,
        timeout: 10000,
      }
    );

    // Filter records
    let records = response.data.records || [];
    
    if (stateList.length > 0) {
      records = records.filter(r => 
        stateList.some(state => 
          r.state?.toLowerCase().includes(state.toLowerCase())
        )
      );
    }

    // Group by state and market
    const groupedByMarket = records.reduce((acc, record) => {
      const key = `${record.state || 'Unknown'} - ${record.market || 'Unknown'}`;
      if (!acc[key]) {
        acc[key] = {
          state: record.state || 'Unknown',
          market: record.market || 'Unknown',
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
    const comparison = Object.keys(groupedByMarket).map(key => {
      const data = groupedByMarket[key];
      const prices = data.prices;
      return {
        state: data.state,
        market: data.market,
        averagePrice: prices.length > 0 
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