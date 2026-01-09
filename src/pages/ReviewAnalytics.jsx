import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Star,
  TrendingUp,
  Award,
  ThumbsUp,
  ArrowLeft,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import {
  aggregateReviewStats,
  calculateAverageRatings,
  filterAndSortReviews,
  getRatingDistributionChart,
  generateReviewAnalytics,
  RATING_CATEGORIES,
} from "@/lib/reviews";

export default function ReviewAnalytics() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vendorReviews, setVendorReviews] = useState({});
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const handleAddSampleData = () => {
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
    };

    localStorage.setItem("reviews", JSON.stringify(sampleReviews));
    
    // Convert to review objects
    const reviewsObject = {};
    Object.entries(sampleReviews).forEach(([vendorName, review]) => {
      reviewsObject[vendorName] = [
        {
          rating: review.rating || 0,
          comment: review.comment || "",
          categories: review.categories || {},
          date: review.date || new Date().toISOString(),
          verified: review.verified || false,
        },
      ];
    });
    
    setVendorReviews(reviewsObject);
    const vendorList = Object.keys(reviewsObject).filter(
      (v) => reviewsObject[v] && reviewsObject[v].length > 0
    );
    if (vendorList.length > 0) {
      setSelectedVendor(vendorList[0]);
    }
    console.log("✅ Sample reviews added");
  };

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        let userData = null;
        let userEmail = "";

        // Try to fetch from backend
        try {
          const user = await api.verifyToken();
          userEmail = user.user?.email || "";
          userData = await api.syncUserData();
        } catch (err) {
          console.warn("Backend unavailable, using localStorage:", err.message);
          // Fall back to localStorage if backend is unavailable
          userData = null;
        }

        // Convert reviews data to proper format
        const reviewsObject = {};
        
        if (userData?.reviews) {
          Object.entries(userData.reviews).forEach(([vendorName, review]) => {
            reviewsObject[vendorName] = [
              {
                rating: review.rating,
                comment: review.comment,
                categories: review.categories || {},
                date: new Date().toISOString(),
                verified: review.verified || false,
              },
            ];
          });
        } else {
          // Fall back to localStorage reviews
          const storedReviews = JSON.parse(
            localStorage.getItem("reviews") || "{}"
          );
          console.log("Stored reviews from localStorage:", storedReviews);
          Object.entries(storedReviews).forEach(([vendorName, review]) => {
            reviewsObject[vendorName] = [
              {
                rating: review.rating || 0,
                comment: review.comment || "",
                categories: review.categories || {},
                date: review.date || new Date().toISOString(),
                verified: review.verified || false,
              },
            ];
          });
        }

        console.log("Final reviewsObject:", reviewsObject);
        setVendorReviews(reviewsObject);
        setUserEmail(userEmail);
        
        // Set first vendor with reviews as selected
        const vendorsWithReviews = Object.keys(reviewsObject).filter(
          (v) => reviewsObject[v] && reviewsObject[v].length > 0
        );
        console.log("Vendors with reviews:", vendorsWithReviews);
        if (vendorsWithReviews.length > 0) {
          setSelectedVendor(vendorsWithReviews[0]);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error loading review analytics:", err);
        setError("Failed to load review analytics data: " + (err.message || "Unknown error"));
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">Review Analytics</h1>
          </div>
          <div className="text-center text-slate-600">Loading review data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">Review Analytics</h1>
          </div>
          <div className="text-center text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  const vendorsWithReviews = Object.keys(vendorReviews).filter(
    (v) => vendorReviews[v] && vendorReviews[v].length > 0
  );

  const platformAnalytics = useMemo(() => {
    const result = generateReviewAnalytics(vendorReviews);
    return result || {
      vendorAnalytics: {},
      summary: {
        totalReviews: 0,
        platformAverageRating: 0,
        vendorsWithReviews: 0,
        highestRatedVendor: null,
        mostReviewedVendor: null,
      },
    };
  }, [vendorReviews]);

  const selectedVendorStats = useMemo(() => {
    if (!selectedVendor || !vendorReviews[selectedVendor] || vendorReviews[selectedVendor].length === 0) {
      return null;
    }
    return aggregateReviewStats(vendorReviews[selectedVendor]);
  }, [selectedVendor, vendorReviews]);

  const selectedVendorDistribution = useMemo(() => {
    if (!selectedVendor || !vendorReviews[selectedVendor] || vendorReviews[selectedVendor].length === 0) {
      return [];
    }
    return getRatingDistributionChart(vendorReviews[selectedVendor]);
  }, [selectedVendor, vendorReviews]);

  const categoryData = useMemo(() => {
    if (!selectedVendorStats) return [];
    return [
      {
        category: "Product Quality",
        rating: selectedVendorStats.categoryAverages?.productQuality || 0,
      },
      {
        category: "Customer Service",
        rating: selectedVendorStats.categoryAverages?.customerService || 0,
      },
      {
        category: "Delivery Speed",
        rating: selectedVendorStats.categoryAverages?.deliverySpeed || 0,
      },
      {
        category: "Value for Money",
        rating: selectedVendorStats.categoryAverages?.value || 0,
      },
    ];
  }, [selectedVendorStats]);

  const vendorComparisonData = useMemo(() => {
    if (!platformAnalytics || !platformAnalytics.vendorAnalytics) {
      return [];
    }
    return Object.entries(platformAnalytics.vendorAnalytics)
      .map(([name, stats]) => ({
        name,
        rating: stats?.averageRating || 0,
        reviews: stats?.totalReviews || 0,
        verified: stats?.verifiedReviews || 0,
      }))
      .filter(v => v.reviews > 0)
      .sort((a, b) => b.reviews - a.reviews)
      .slice(0, 10);
  }, [platformAnalytics]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900">Review Analytics</h1>
            <p className="text-slate-600 text-sm mt-1">
              Analyze vendor ratings and review patterns
            </p>
          </div>
        </div>

        {vendorsWithReviews.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Star className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 text-lg mb-2">No reviews yet</p>
              <p className="text-slate-500 text-sm mb-6">
                Start leaving reviews on vendors to see analytics and insights here.
              </p>
              <div className="flex gap-4 justify-center">
                <Link to="/dashboard">
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                    Back to Dashboard
                  </Button>
                </Link>
                <Button
                  onClick={handleAddSampleData}
                  variant="outline"
                  className="border-amber-200 text-amber-700 hover:bg-amber-50"
                >
                  Add Sample Reviews
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Platform Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-slate-600">Platform Average</div>
                  <div className="text-3xl font-bold text-amber-600 mt-2">
                    {platformAnalytics.summary?.platformAverageRating || 0}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.round(platformAnalytics.summary?.platformAverageRating || 0)
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300"
                        }`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-slate-600">Total Reviews</div>
                  <div className="text-3xl font-bold text-blue-600 mt-2">
                    {platformAnalytics.summary?.totalReviews || 0}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {platformAnalytics.summary?.vendorsWithReviews || 0} vendors
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-green-500" />
                    <div className="text-sm text-slate-600">Top Rated</div>
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-2 line-clamp-1">
                    {platformAnalytics.summary?.highestRatedVendor || "N/A"}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {platformAnalytics.summary?.highestRatedVendor && platformAnalytics.vendorAnalytics[platformAnalytics.summary.highestRatedVendor]
                      ? `${platformAnalytics.vendorAnalytics[platformAnalytics.summary.highestRatedVendor].averageRating} stars`
                      : "No reviews"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-500" />
                    <div className="text-sm text-slate-600">Most Active</div>
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-2 line-clamp-1">
                    {platformAnalytics.summary?.mostReviewedVendor || "N/A"}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {platformAnalytics.summary?.mostReviewedVendor && platformAnalytics.vendorAnalytics[platformAnalytics.summary.mostReviewedVendor]
                      ? `${platformAnalytics.vendorAnalytics[platformAnalytics.summary.mostReviewedVendor].totalReviews} reviews`
                      : "No reviews"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Vendor Selection and Filters */}
            <div className="mb-8 p-4 bg-white rounded-lg border border-slate-200">
              <div className="flex items-center gap-4 mb-4">
                <Filter className="w-4 h-4 text-slate-600" />
                <h3 className="font-semibold text-slate-900">Vendor</h3>
              </div>
              <select
                value={selectedVendor || ""}
                onChange={(e) => setSelectedVendor(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Select a vendor to analyze</option>
                {vendorsWithReviews.map((vendor) => (
                  <option key={vendor} value={vendor}>
                    {vendor} ({vendorReviews[vendor]?.length || 0} reviews)
                  </option>
                ))}
              </select>
            </div>

            {selectedVendor && selectedVendorStats ? (
              <>
                {/* Selected Vendor Details */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-sm text-slate-600">Average Rating</div>
                      <div className="text-3xl font-bold text-amber-600 mt-2">
                        {selectedVendorStats.averageRating || 0}
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.round(selectedVendorStats.averageRating || 0)
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300"
                            }`}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-sm text-slate-600">Total Reviews</div>
                      <div className="text-3xl font-bold text-blue-600 mt-2">
                        {selectedVendorStats.totalReviews || 0}
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        {selectedVendorStats.verifiedReviews || 0} verified
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="w-4 h-4 text-green-500" />
                        <div className="text-sm text-slate-600">Recommendation</div>
                      </div>
                      <div className="text-3xl font-bold text-green-600 mt-2">
                        {selectedVendorStats.recommendationRate || 0}%
                      </div>
                      <p className="text-xs text-slate-500 mt-2">recommend</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-sm text-slate-600">Trust Score</div>
                      <div className="text-3xl font-bold text-purple-600 mt-2">
                        {selectedVendorStats.averageTrustScore || 0}
                      </div>
                      <p className="text-xs text-slate-500 mt-2">average</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Rating Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Rating Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedVendorDistribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={selectedVendorDistribution}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="rating" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#f59e0b" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-[300px] flex items-center justify-center text-slate-500">
                          No rating data
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Category Ratings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Rating by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {categoryData.some(c => c.rating > 0) ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <RadarChart data={categoryData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="category" />
                            <PolarRadiusAxis angle={90} domain={[0, 5]} />
                            <Radar
                              name="Rating"
                              dataKey="rating"
                              stroke="#f59e0b"
                              fill="#f59e0b"
                              fillOpacity={0.6}
                            />
                            <Tooltip />
                          </RadarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-[300px] flex items-center justify-center text-slate-500">
                          No category data
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Category Breakdown */}
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="text-lg">Category Ratings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {RATING_CATEGORIES.map((category) => {
                        const rating =
                          selectedVendorStats.categoryAverages?.[category.key] || 0;
                        const percentage = (rating / 5) * 100;
                        return (
                          <div key={category.key}>
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium text-slate-900">
                                {category.label}
                              </p>
                              <span className="text-sm font-bold text-amber-600">
                                {rating.toFixed(1)}/5
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : vendorsWithReviews.length > 0 ? (
              <Card className="text-center py-8">
                <CardContent>
                  <p className="text-slate-500">Select a vendor to view detailed analytics</p>
                </CardContent>
              </Card>
            ) : null}

            {/* Top Vendors Comparison */}
            {vendorComparisonData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Vendors by Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={vendorComparisonData}
                      margin={{ top: 20, right: 30, left: 200, bottom: 20 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={190} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="reviews" fill="#3b82f6" name="Total Reviews" />
                      <Bar dataKey="verified" fill="#10b981" name="Verified" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
