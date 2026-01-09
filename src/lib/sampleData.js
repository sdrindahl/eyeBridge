/**
 * Sample data generator for testing
 * Run this in browser console to populate localStorage with test data
 */

export function addSampleReviews() {
  const sampleReviews = {
    "VSP Vision Care": {
      rating: 4.5,
      comment: "Great coverage and network",
      date: new Date().toISOString(),
      verified: true,
      categories: {
        productQuality: 4,
        customerService: 5,
        deliverySpeed: 4,
        value: 4,
      }
    },
    "Specsavers": {
      rating: 4,
      comment: "Good selection of frames",
      date: new Date(Date.now() - 86400000).toISOString(),
      verified: true,
      categories: {
        productQuality: 4,
        customerService: 4,
        deliverySpeed: 3,
        value: 4,
      }
    },
    "Warby Parker": {
      rating: 5,
      comment: "Excellent customer service",
      date: new Date(Date.now() - 172800000).toISOString(),
      verified: true,
      categories: {
        productQuality: 5,
        customerService: 5,
        deliverySpeed: 5,
        value: 4,
      }
    },
    "EyeBuyDirect": {
      rating: 3.5,
      comment: "Affordable but quality varies",
      date: new Date(Date.now() - 259200000).toISOString(),
      verified: false,
      categories: {
        productQuality: 3,
        customerService: 3,
        deliverySpeed: 4,
        value: 4,
      }
    },
    "LensCrafters": {
      rating: 4,
      comment: "Good in-store experience",
      date: new Date(Date.now() - 345600000).toISOString(),
      verified: true,
      categories: {
        productQuality: 4,
        customerService: 4,
        deliverySpeed: 4,
        value: 3,
      }
    },
  };

  localStorage.setItem("reviews", JSON.stringify(sampleReviews));
  console.log("✅ Sample reviews added to localStorage:", sampleReviews);
  return sampleReviews;
}

export function addSampleAnalyticsData() {
  const sampleSearches = ["VSP Vision Care", "affordable glasses", "Warby Parker", "blue light glasses", "progressive lenses", "contact lenses"];
  const sampleRecentlyViewed = ["VSP Vision Care", "Specsavers", "Warby Parker", "EyeBuyDirect"];
  const sampleFavorites = ["Warby Parker", "VSP Vision Care"];

  localStorage.setItem("recentSearches", JSON.stringify(sampleSearches));
  localStorage.setItem("recentlyViewed", JSON.stringify(sampleRecentlyViewed));
  localStorage.setItem("favorites", JSON.stringify(sampleFavorites));

  console.log("✅ Sample analytics data added to localStorage");
  return { sampleSearches, sampleRecentlyViewed, sampleFavorites };
}

export function clearAllData() {
  localStorage.removeItem("reviews");
  localStorage.removeItem("recentSearches");
  localStorage.removeItem("recentlyViewed");
  localStorage.removeItem("favorites");
  console.log("✅ All sample data cleared");
}

// Export for use in browser console
if (typeof window !== "undefined") {
  window.sampleData = {
    addSampleReviews,
    addSampleAnalyticsData,
    clearAllData,
  };
  console.log("💡 Use window.sampleData.addSampleReviews() to add test data");
}
