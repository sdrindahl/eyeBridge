/**
 * Vendor Recommendation Engine
 * Provides personalized vendor suggestions based on:
 * - User favorites
 * - Recently viewed vendors
 * - Browse history
 * - Category and product similarities
 */

import vendorsData from "@/data/vendors.json";

/**
 * Calculate similarity score between two vendors (0-100)
 * Based on: category overlap, product overlap, complementary services
 */
const calculateSimilarityScore = (vendor1, vendor2) => {
  if (!vendor1 || !vendor2) return 0;
  
  let score = 0;
  const weights = {
    category: 40,
    products: 50,
    tags: 10
  };
  
  // Category similarity
  const cat1 = (vendor1.Category || "").toLowerCase().split(";").map(c => c.trim());
  const cat2 = (vendor2.Category || "").toLowerCase().split(";").map(c => c.trim());
  const categoryOverlap = cat1.filter(c => cat2.includes(c)).length;
  const categoryScore = Math.min(categoryOverlap / Math.max(cat1.length, 1), 1) * weights.category;
  score += categoryScore;
  
  // Product similarity
  const prod1 = (vendor1["Products Offered"] || "").toLowerCase().split(",").map(p => p.trim());
  const prod2 = (vendor2["Products Offered"] || "").toLowerCase().split(",").map(p => p.trim());
  const productOverlap = prod1.filter(p => 
    prod2.some(p2 => p2.includes(p) || p.includes(p2))
  ).length;
  const productScore = Math.min(productOverlap / Math.max(prod1.length, 1), 1) * weights.products;
  score += productScore;
  
  // Category tags similarity
  const tags1 = (vendor1["Category Tags"] || "").toLowerCase().split(";").map(t => t.trim());
  const tags2 = (vendor2["Category Tags"] || "").toLowerCase().split(";").map(t => t.trim());
  const tagsOverlap = tags1.filter(t => tags2.includes(t)).length;
  const tagsScore = Math.min(tagsOverlap / Math.max(tags1.length, 1), 1) * weights.tags;
  score += tagsScore;
  
  return Math.round(score);
};

/**
 * Get similar vendors to a specific vendor
 * Returns up to 5 similar vendors with similarity scores
 */
export const getSimilarVendors = (vendorName, excludeNames = []) => {
  const vendor = vendorsData.find(v => v["Company Name"] === vendorName);
  if (!vendor) return [];
  
  const similarities = vendorsData
    .filter(v => 
      v["Company Name"] !== vendorName && 
      !excludeNames.includes(v["Company Name"])
    )
    .map(v => ({
      ...v,
      similarityScore: calculateSimilarityScore(vendor, v)
    }))
    .filter(v => v.similarityScore > 20) // Only include reasonably similar vendors
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, 5);
  
  return similarities;
};

/**
 * Get recommended vendors for a user based on their:
 * - Favorite vendors
 * - Recently viewed vendors
 * - Category/product preferences
 */
export const getRecommendedVendors = (options = {}) => {
  const {
    favorites = [],
    recentlyViewed = [],
    maxResults = 6,
    excludeNames = []
  } = options;
  
  const allExclude = [...new Set([...favorites, ...recentlyViewed.map(v => v.name), ...excludeNames])];
  
  // If user has no history, recommend popular vendors in various categories
  if (favorites.length === 0 && recentlyViewed.length === 0) {
    return getPopularVendorsByCategory(maxResults, allExclude);
  }
  
  // Build recommendation pool based on user's favorites and recently viewed
  const recommendationScores = new Map();
  
  // Score vendors similar to favorites (higher weight)
  favorites.forEach(favName => {
    const similar = getSimilarVendors(favName, allExclude);
    similar.forEach(v => {
      const currentScore = recommendationScores.get(v["Company Name"]) || 0;
      // Weight: similarity score + bonus for being similar to favorite
      const newScore = currentScore + (v.similarityScore * 1.5);
      recommendationScores.set(v["Company Name"], newScore);
    });
  });
  
  // Score vendors similar to recently viewed (medium weight)
  recentlyViewed.slice(0, 5).forEach(item => {
    const similar = getSimilarVendors(item.name, allExclude);
    similar.forEach(v => {
      const currentScore = recommendationScores.get(v["Company Name"]) || 0;
      const newScore = currentScore + v.similarityScore;
      recommendationScores.set(v["Company Name"], newScore);
    });
  });
  
  // Convert to array and sort
  const recommendations = Array.from(recommendationScores.entries())
    .map(([name, score]) => {
      const vendor = vendorsData.find(v => v["Company Name"] === name);
      return { ...vendor, recommendationScore: Math.round(score) };
    })
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, maxResults);
  
  return recommendations;
};

/**
 * Get popular/diverse vendors from different categories
 * Used as default recommendation for new users
 */
export const getPopularVendorsByCategory = (maxResults = 6, excludeNames = []) => {
  const categories = [
    "Equipment",
    "Contact Lens",
    "Pharmaceuticals",
    "Optical Lab",
    "Software",
    "Practice Management"
  ];
  
  const recommended = [];
  const vendorsPerCategory = Math.max(1, Math.floor(maxResults / categories.length));
  
  categories.forEach(category => {
    const categoryVendors = vendorsData
      .filter(v => 
        v.Category?.toLowerCase().includes(category.toLowerCase()) &&
        !excludeNames.includes(v["Company Name"])
      )
      .slice(0, vendorsPerCategory);
    
    recommended.push(...categoryVendors);
  });
  
  return recommended.slice(0, maxResults);
};

/**
 * Get vendors in the same category as the given vendor
 * Useful for cross-selling and discovery
 */
export const getVendorsInSameCategory = (vendorName, maxResults = 4) => {
  const vendor = vendorsData.find(v => v["Company Name"] === vendorName);
  if (!vendor) return [];
  
  const categories = vendor.Category?.split(";").map(c => c.trim().toLowerCase()) || [];
  
  const sameCategory = vendorsData
    .filter(v => 
      v["Company Name"] !== vendorName &&
      categories.some(cat => v.Category?.toLowerCase().includes(cat))
    )
    .slice(0, maxResults);
  
  return sameCategory;
};
