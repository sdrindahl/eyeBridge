/**
 * Reviews utility functions for enhanced review system
 * Handles multi-category ratings, review analytics, and trust scoring
 */

import vendorsData from "@/data/vendors.json";

// Rating categories for detailed feedback
export const RATING_CATEGORIES = [
  { key: "productQuality", label: "Product Quality", icon: "Package" },
  { key: "customerService", label: "Customer Service", icon: "Users" },
  { key: "deliverySpeed", label: "Delivery Speed", icon: "Truck" },
  { key: "value", label: "Value for Money", icon: "DollarSign" },
];

/**
 * Calculate average ratings by category for a vendor
 * @param {Array} reviews - Array of review objects with category ratings
 * @returns {Object} Average rating for each category and overall
 */
export function calculateAverageRatings(reviews = []) {
  if (!reviews || reviews.length === 0) {
    return {
      overall: 0,
      productQuality: 0,
      customerService: 0,
      deliverySpeed: 0,
      value: 0,
      reviewCount: 0,
    };
  }

  const categoryTotals = {
    productQuality: 0,
    customerService: 0,
    deliverySpeed: 0,
    value: 0,
  };

  const validReviews = reviews.filter((r) => r && r.rating && r.rating > 0);

  if (validReviews.length === 0) {
    return {
      overall: 0,
      productQuality: 0,
      customerService: 0,
      deliverySpeed: 0,
      value: 0,
      reviewCount: 0,
    };
  }

  validReviews.forEach((review) => {
    if (review.categories) {
      Object.keys(categoryTotals).forEach((category) => {
        if (review.categories[category]) {
          categoryTotals[category] += review.categories[category];
        }
      });
    }
  });

  // Calculate averages
  const categoryAverages = {};
  const categoryCount = Object.keys(categoryTotals).length;
  let overallTotal = 0;

  Object.entries(categoryTotals).forEach(([category, total]) => {
    const average = validReviews.length > 0 ? (total / validReviews.length) * 5 : 0;
    categoryAverages[category] = Math.round(average * 10) / 10;
    overallTotal += categoryAverages[category];
  });

  const overallAverage = Math.round((overallTotal / categoryCount) * 10) / 10;

  return {
    overall: overallAverage,
    productQuality: categoryAverages.productQuality || 0,
    customerService: categoryAverages.customerService || 0,
    deliverySpeed: categoryAverages.deliverySpeed || 0,
    value: categoryAverages.value || 0,
    reviewCount: validReviews.length,
  };
}

/**
 * Get trust score for a review based on multiple factors
 * @param {Object} review - Review object
 * @param {Number} vendorReviewCount - Total reviews for the vendor
 * @returns {Number} Trust score 0-100
 */
export function getReviewTrustScore(review = {}, vendorReviewCount = 0) {
  let score = 50; // Base score

  // Has detailed categories (+15)
  if (review.categories && Object.keys(review.categories).length >= 3) {
    score += 15;
  }

  // Has text comment (+15)
  if (review.comment && review.comment.length > 20) {
    score += 15;
  }

  // Is recent (within 30 days) (+10)
  if (review.date) {
    const reviewDate = new Date(review.date);
    const daysSince = Math.floor(
      (Date.now() - reviewDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSince <= 30) {
      score += 10;
    } else if (daysSince <= 90) {
      score += 5;
    }
  }

  // Verified badge (+20)
  if (review.verified) {
    score += 20;
  }

  // Rating is moderate (not extreme) (+5)
  if (review.rating && review.rating >= 2 && review.rating <= 4) {
    score += 5;
  }

  return Math.min(score, 100);
}

/**
 * Aggregate review statistics for a vendor
 * @param {Array} reviews - Array of review objects
 * @returns {Object} Comprehensive review statistics
 */
export function aggregateReviewStats(reviews = []) {
  if (!reviews || reviews.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      categoryAverages: {
        productQuality: 0,
        customerService: 0,
        deliverySpeed: 0,
        value: 0,
      },
      verifiedReviews: 0,
      averageTrustScore: 0,
      mostRecentReview: null,
      recommendationRate: 0,
    };
  }

  const validReviews = reviews.filter((r) => r && r.rating && r.rating > 0);
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalTrustScore = 0;
  let verifiedCount = 0;
  let recommendationCount = 0;

  validReviews.forEach((review) => {
    const rating = Math.round(review.rating);
    if (rating >= 1 && rating <= 5) {
      ratingDistribution[rating]++;
    }

    const trustScore = getReviewTrustScore(review, validReviews.length);
    totalTrustScore += trustScore;

    if (review.verified) {
      verifiedCount++;
    }

    if (review.rating >= 4) {
      recommendationCount++;
    }
  });

  const averages = calculateAverageRatings(validReviews);

  return {
    totalReviews: validReviews.length,
    averageRating: averages.overall,
    ratingDistribution,
    categoryAverages: {
      productQuality: averages.productQuality,
      customerService: averages.customerService,
      deliverySpeed: averages.deliverySpeed,
      value: averages.value,
    },
    verifiedReviews: verifiedCount,
    averageTrustScore:
      validReviews.length > 0
        ? Math.round((totalTrustScore / validReviews.length) * 10) / 10
        : 0,
    mostRecentReview: validReviews.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    )[0],
    recommendationRate:
      validReviews.length > 0
        ? Math.round((recommendationCount / validReviews.length) * 100)
        : 0,
  };
}

/**
 * Filter and sort reviews by multiple criteria
 * @param {Array} reviews - Array of review objects
 * @param {Object} options - Filter and sort options
 * @returns {Array} Filtered and sorted reviews
 */
export function filterAndSortReviews(
  reviews = [],
  options = {
    minRating: 0,
    maxRating: 5,
    verifiedOnly: false,
    sortBy: "recent", // recent, helpful, rating-high, rating-low
    limit: 10,
  }
) {
  let filtered = [...reviews];

  // Filter by rating range
  filtered = filtered.filter(
    (r) => r.rating >= options.minRating && r.rating <= options.maxRating
  );

  // Filter verified only
  if (options.verifiedOnly) {
    filtered = filtered.filter((r) => r.verified);
  }

  // Sort
  switch (options.sortBy) {
    case "recent":
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
      break;
    case "helpful":
      filtered.sort((a, b) => {
        const scoreA = getReviewTrustScore(a, filtered.length);
        const scoreB = getReviewTrustScore(b, filtered.length);
        return scoreB - scoreA;
      });
      break;
    case "rating-high":
      filtered.sort((a, b) => b.rating - a.rating);
      break;
    case "rating-low":
      filtered.sort((a, b) => a.rating - b.rating);
      break;
    default:
      break;
  }

  return filtered.slice(0, options.limit || 10);
}

/**
 * Generate comprehensive review analytics
 * @param {Object} allReviews - Object with vendor names as keys, reviews array as values
 * @returns {Object} Analytics data for all vendors
 */
export function generateReviewAnalytics(allReviews = {}) {
  const vendorAnalytics = {};
  let totalReviews = 0;
  let averageOverallRating = 0;
  let highestRatedVendor = null;
  let mostReviewedVendor = null;
  let maxReviews = 0;

  Object.entries(allReviews).forEach(([vendorName, reviews]) => {
    if (!reviews || reviews.length === 0) return;

    const stats = aggregateReviewStats(reviews);
    vendorAnalytics[vendorName] = stats;

    totalReviews += stats.totalReviews;
    averageOverallRating += stats.averageRating * stats.totalReviews;

    if (
      !highestRatedVendor ||
      stats.averageRating > vendorAnalytics[highestRatedVendor].averageRating
    ) {
      highestRatedVendor = vendorName;
    }

    if (stats.totalReviews > maxReviews) {
      maxReviews = stats.totalReviews;
      mostReviewedVendor = vendorName;
    }
  });

  const platformAverage =
    totalReviews > 0 ? Math.round((averageOverallRating / totalReviews) * 10) / 10 : 0;

  return {
    vendorAnalytics,
    summary: {
      totalReviews,
      platformAverageRating: platformAverage,
      vendorsWithReviews: Object.keys(vendorAnalytics).length,
      highestRatedVendor,
      mostReviewedVendor,
    },
  };
}

/**
 * Get rating distribution as percentage
 * @param {Array} reviews - Array of review objects
 * @returns {Array} Distribution with percentages
 */
export function getRatingDistributionChart(reviews = []) {
  const stats = aggregateReviewStats(reviews);
  const total = stats.totalReviews;

  return [
    {
      rating: "5 Stars",
      count: stats.ratingDistribution[5],
      percentage: total > 0 ? Math.round((stats.ratingDistribution[5] / total) * 100) : 0,
    },
    {
      rating: "4 Stars",
      count: stats.ratingDistribution[4],
      percentage: total > 0 ? Math.round((stats.ratingDistribution[4] / total) * 100) : 0,
    },
    {
      rating: "3 Stars",
      count: stats.ratingDistribution[3],
      percentage: total > 0 ? Math.round((stats.ratingDistribution[3] / total) * 100) : 0,
    },
    {
      rating: "2 Stars",
      count: stats.ratingDistribution[2],
      percentage: total > 0 ? Math.round((stats.ratingDistribution[2] / total) * 100) : 0,
    },
    {
      rating: "1 Star",
      count: stats.ratingDistribution[1],
      percentage: total > 0 ? Math.round((stats.ratingDistribution[1] / total) * 100) : 0,
    },
  ];
}

/**
 * Create a review object with all required fields
 * @param {Object} data - Review data
 * @returns {Object} Complete review object
 */
export function createReview(data = {}) {
  return {
    rating: data.rating || 0,
    comment: data.comment || "",
    categories: data.categories || {
      productQuality: 0,
      customerService: 0,
      deliverySpeed: 0,
      value: 0,
    },
    date: data.date || new Date().toISOString(),
    verified: data.verified || false,
    helpful: data.helpful || 0,
    unhelpful: data.unhelpful || 0,
    userName: data.userName || "Anonymous",
  };
}

/**
 * Get most helpful reviews
 * @param {Array} reviews - Array of review objects
 * @param {Number} limit - Number of reviews to return
 * @returns {Array} Most helpful reviews
 */
export function getMostHelpfulReviews(reviews = [], limit = 5) {
  return filterAndSortReviews(reviews, {
    minRating: 0,
    maxRating: 5,
    verifiedOnly: false,
    sortBy: "helpful",
    limit,
  });
}
