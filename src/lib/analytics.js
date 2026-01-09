/**
 * Analytics utility functions for user behavior insights
 * Computes metrics from user data: search patterns, vendor popularity, category trends, etc.
 */

import vendorsData from "@/data/vendors.json";

/**
 * Calculate search analytics metrics
 * @param {Array} searchHistory - Array of search objects with searchTerm, timestamp
 * @returns {Object} Search metrics including count, top terms, frequency
 */
export function getSearchAnalytics(searchHistory = []) {
  if (!searchHistory || searchHistory.length === 0) {
    return {
      totalSearches: 0,
      uniqueTerms: 0,
      topSearches: [],
      searchFrequency: {},
    };
  }

  // Count search frequencies
  const searchFrequency = {};
  searchHistory.forEach((search) => {
    const term = search.searchTerm || search;
    const key = String(term).toLowerCase();
    searchFrequency[key] = (searchFrequency[key] || 0) + 1;
  });

  // Get top searches sorted by frequency
  const topSearches = Object.entries(searchFrequency)
    .map(([term, count]) => ({
      term: term.charAt(0).toUpperCase() + term.slice(1),
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return {
    totalSearches: searchHistory.length,
    uniqueTerms: Object.keys(searchFrequency).length,
    topSearches,
    searchFrequency,
  };
}

/**
 * Calculate category popularity based on various user interactions
 * @param {Array} favorites - Array of favorite vendor names
 * @param {Array} recentlyViewed - Array of recently viewed vendor names
 * @param {Array} searchHistory - Array of search history
 * @returns {Object} Category popularity metrics
 */
export function getCategoryAnalytics(
  favorites = [],
  recentlyViewed = [],
  searchHistory = []
) {
  const categoryMetrics = {};

  // Helper function to extract category from vendor name or search term
  const getCategoryFromVendor = (vendorName) => {
    const vendor = vendorsData.find(
      (v) => v["Company Name"]?.toLowerCase() === vendorName.toLowerCase()
    );
    return vendor?.Category || "Unknown";
  };

  // Count favorites by category
  favorites.forEach((vendorName) => {
    const category = getCategoryFromVendor(vendorName);
    categoryMetrics[category] = categoryMetrics[category] || {
      category,
      favorites: 0,
      views: 0,
      searches: 0,
      totalInteractions: 0,
    };
    categoryMetrics[category].favorites += 1;
  });

  // Count views by category
  recentlyViewed.forEach((vendorName) => {
    const category = getCategoryFromVendor(vendorName);
    categoryMetrics[category] = categoryMetrics[category] || {
      category,
      favorites: 0,
      views: 0,
      searches: 0,
      totalInteractions: 0,
    };
    categoryMetrics[category].views += 1;
  });

  // Count searches mentioning categories
  const categoryKeywords = [
    "equipment",
    "contact lens",
    "pharmaceuticals",
    "optical lab",
    "software",
    "practice management",
  ];

  searchHistory.forEach((search) => {
    const searchTerm = String(search.searchTerm || search).toLowerCase();
    categoryKeywords.forEach((keyword) => {
      if (searchTerm.includes(keyword.toLowerCase())) {
        const capitalizedKeyword =
          keyword.charAt(0).toUpperCase() + keyword.slice(1);
        categoryMetrics[capitalizedKeyword] =
          categoryMetrics[capitalizedKeyword] || {
            category: capitalizedKeyword,
            favorites: 0,
            views: 0,
            searches: 0,
            totalInteractions: 0,
          };
        categoryMetrics[capitalizedKeyword].searches += 1;
      }
    });
  });

  // Calculate total interactions and sort
  const categories = Object.values(categoryMetrics)
    .map((cat) => ({
      ...cat,
      totalInteractions: cat.favorites + cat.views + cat.searches,
    }))
    .sort((a, b) => b.totalInteractions - a.totalInteractions);

  return {
    categories,
    topCategories: categories.slice(0, 6),
    categoryCount: categories.length,
  };
}

/**
 * Calculate vendor engagement metrics
 * @param {Array} favorites - Array of favorite vendor names
 * @param {Array} recentlyViewed - Array of recently viewed vendor names
 * @param {Object} vendorReviews - Object of vendor reviews
 * @returns {Object} Vendor engagement metrics
 */
export function getVendorEngagementAnalytics(
  favorites = [],
  recentlyViewed = [],
  vendorReviews = {}
) {
  const vendorMetrics = {};

  // Count favorites
  favorites.forEach((vendorName) => {
    vendorMetrics[vendorName] = vendorMetrics[vendorName] || {
      vendorName,
      favorites: 0,
      views: 0,
      reviewed: false,
      interactions: 0,
    };
    vendorMetrics[vendorName].favorites += 1;
  });

  // Count views
  recentlyViewed.forEach((vendorName) => {
    vendorMetrics[vendorName] = vendorMetrics[vendorName] || {
      vendorName,
      favorites: 0,
      views: 0,
      reviewed: false,
      interactions: 0,
    };
    vendorMetrics[vendorName].views += 1;
  });

  // Mark vendors with reviews
  Object.keys(vendorReviews).forEach((vendorName) => {
    vendorMetrics[vendorName] = vendorMetrics[vendorName] || {
      vendorName,
      favorites: 0,
      views: 0,
      reviewed: false,
      interactions: 0,
    };
    vendorMetrics[vendorName].reviewed = true;
  });

  // Calculate total interactions
  const vendors = Object.values(vendorMetrics)
    .map((vendor) => ({
      ...vendor,
      interactions: vendor.favorites + vendor.views + (vendor.reviewed ? 1 : 0),
    }))
    .sort((a, b) => b.interactions - a.interactions);

  return {
    totalEngagedVendors: vendors.length,
    topVendors: vendors.slice(0, 10),
    vendorEngagementScore:
      vendors.length > 0
        ? Math.round(
            (vendors.reduce((sum, v) => sum + v.interactions, 0) /
              vendors.length) *
              10
          ) / 10
        : 0,
  };
}

/**
 * Calculate overall platform usage analytics
 * @param {Object} allMetrics - Object containing all user data
 * @returns {Object} Overall usage metrics and insights
 */
export function getOverallAnalytics(allMetrics = {}) {
  const {
    favorites = [],
    recentlyViewed = [],
    searchHistory = [],
    vendorReviews = {},
    recentSearches = [],
  } = allMetrics;

  const searchAnalytics = getSearchAnalytics(searchHistory);
  const categoryAnalytics = getCategoryAnalytics(
    favorites,
    recentlyViewed,
    searchHistory
  );
  const vendorAnalytics = getVendorEngagementAnalytics(
    favorites,
    recentlyViewed,
    vendorReviews
  );

  // Calculate engagement score (0-100)
  const hasSearched = searchAnalytics.totalSearches > 0;
  const hasFavorites = favorites.length > 0;
  const hasViewed = recentlyViewed.length > 0;
  const hasReviewed = Object.keys(vendorReviews).length > 0;

  const engagementFactors = [
    hasSearched,
    hasFavorites,
    hasViewed,
    hasReviewed,
  ].filter((v) => v).length;
  const engagementScore = (engagementFactors / 4) * 100;

  // Calculate activity level (low/medium/high)
  const activityLevel =
    searchAnalytics.totalSearches + recentlyViewed.length === 0
      ? "Low"
      : searchAnalytics.totalSearches + recentlyViewed.length < 20
        ? "Medium"
        : "High";

  return {
    summary: {
      engagementScore: Math.round(engagementScore),
      activityLevel,
      totalInteractions:
        searchAnalytics.totalSearches +
        recentlyViewed.length +
        favorites.length +
        Object.keys(vendorReviews).length,
    },
    search: searchAnalytics,
    categories: categoryAnalytics,
    vendors: vendorAnalytics,
    userActivity: {
      favoritesCount: favorites.length,
      viewsCount: recentlyViewed.length,
      reviewsCount: Object.keys(vendorReviews).length,
      uniqueSearchTerms: searchAnalytics.uniqueTerms,
    },
  };
}

/**
 * Get time-based trends for search activity
 * @param {Array} searchHistory - Array of search history with timestamps
 * @param {Number} days - Number of days to analyze (default 30)
 * @returns {Object} Daily search trends
 */
export function getSearchTrends(searchHistory = [], days = 30) {
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const dailyData = {};

  // Initialize all days with 0
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const dateKey = date.toISOString().split("T")[0];
    dailyData[dateKey] = 0;
  }

  // Count searches per day
  searchHistory.forEach((search) => {
    if (search.timestamp) {
      const searchDate = new Date(search.timestamp);
      if (searchDate >= startDate) {
        const dateKey = searchDate.toISOString().split("T")[0];
        dailyData[dateKey] = (dailyData[dateKey] || 0) + 1;
      }
    }
  });

  const trends = Object.entries(dailyData)
    .map(([date, count]) => ({
      date,
      searches: count,
      displayDate: new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }))
    .filter((item) => item.date >= startDate.toISOString().split("T")[0]);

  return {
    trends,
    averageSearchesPerDay: Math.round(
      trends.reduce((sum, item) => sum + item.searches, 0) / trends.length
    ),
    peakSearchDay: trends.reduce((max, item) =>
      item.searches > max.searches ? item : max
    ),
  };
}

/**
 * Generate analytics export data
 * @param {Object} allMetrics - All analytics metrics
 * @returns {String} CSV formatted string of analytics data
 */
export function exportAnalyticsAsCSV(allMetrics = {}) {
  const analytics = getOverallAnalytics(allMetrics);

  let csv = "eyeBridge Analytics Report\n";
  csv += `Generated: ${new Date().toLocaleString()}\n\n`;

  csv += "=== SUMMARY ===\n";
  csv += `Engagement Score,${analytics.summary.engagementScore}\n`;
  csv += `Activity Level,${analytics.summary.activityLevel}\n`;
  csv += `Total Interactions,${analytics.summary.totalInteractions}\n\n`;

  csv += "=== SEARCH ANALYTICS ===\n";
  csv += `Total Searches,${analytics.search.totalSearches}\n`;
  csv += `Unique Search Terms,${analytics.search.uniqueTerms}\n`;
  csv += `Top Searches\n`;
  analytics.search.topSearches.forEach((search) => {
    csv += `${search.term},${search.count}\n`;
  });

  csv += "\n=== CATEGORY ANALYTICS ===\n";
  csv += `Top Categories\n`;
  analytics.categories.topCategories.forEach((cat) => {
    csv += `${cat.category},Favorites: ${cat.favorites} Views: ${cat.views} Searches: ${cat.searches}\n`;
  });

  csv += "\n=== VENDOR ENGAGEMENT ===\n";
  csv += `Total Engaged Vendors,${analytics.vendors.totalEngagedVendors}\n`;
  csv += `Average Engagement Score,${analytics.vendors.vendorEngagementScore}\n`;

  return csv;
}
