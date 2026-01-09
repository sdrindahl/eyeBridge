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

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        const user = await api.verifyToken();
        setUserEmail(user.user?.email || "");

        const userData = await api.syncUserData();

        // Convert reviews data to proper format
        const reviewsObject = {};
        Object.entries(userData.reviews || {}).forEach(([vendorName, review]) => {
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

        setVendorReviews(reviewsObject);
        
        // Set first vendor with reviews as selected
        const vendorsWithReviews = Object.keys(reviewsObject).filter(
          (v) => reviewsObject[v].length > 0
        );
        if (vendorsWithReviews.length > 0) {
          setSelectedVendor(vendorsWithReviews[0]);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error loading review analytics:", err);
        if (err.message?.includes("Unauthorized") || err.message?.includes("Invalid token")) {
          api.logout();
          navigate("/login");
          return;
        }
        setError("Failed to load review analytics data");
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [navigate]);

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
    (v) => vendorReviews[v].length > 0
  );

  const platformAnalytics = useMemo(
    () => generateReviewAnalytics(vendorReviews),
    [vendorReviews]
  );

  const selectedVendorStats = useMemo(() => {
    if (!selectedVendor || !vendorReviews[selectedVendor]) {
      return null;
    }
    return aggregateReviewStats(vendorReviews[selectedVendor]);
  }, [selectedVendor, vendorReviews]);

  const selectedVendorDistribution = useMemo(() => {
    if (!selectedVendor || !vendorReviews[selectedVendor]) {
      return [];
    }
    return getRatingDistributionChart(vendorReviews[selectedVendor]);
  }, [selectedVendor, vendorReviews]);

  const categoryData = useMemo(() => {
    if (!selectedVendorStats) return [];
    return [
      {
        category: "Product Quality",
        rating: selectedVendorStats.categoryAverages.productQuality,
      },
      {
        category: "Customer Service",
        rating: selectedVendorStats.categoryAverages.customerService,
      },
      {
        category: "Delivery Speed",
        rating: selectedVendorStats.categoryAverages.deliverySpeed,
      },
      {
        category: "Value for Money",
        rating: selectedVendorStats.categoryAverages.value,
      },
    ];
  }, [selectedVendorStats]);

  const vendorComparisonData = useMemo(() => {
    return Object.entries(platformAnalytics.vendorAnalytics)
      .map(([name, stats]) => ({
        name,
        rating: stats.averageRating,
        reviews: stats.totalReviews,
        verified: stats.verifiedReviews,
      }))
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

        {/* Platform Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-slate-600">Platform Average</div>
              <div className="text-3xl font-bold text-amber-600 mt-2">
                {platformAnalytics.summary.platformAverageRating}
              </div>
              <div className="flex items-center gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.round(platformAnalytics.summary.platformAverageRating)
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
                {platformAnalytics.summary.totalReviews}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {platformAnalytics.summary.vendorsWithReviews} vendors
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
                {platformAnalytics.summary.highestRatedVendor || "N/A"}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {platformAnalytics.summary.highestRatedVendor
                  ? `${platformAnalytics.vendorAnalytics[
                      platformAnalytics.summary.highestRatedVendor
                    ].averageRating} stars`
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
                {platformAnalytics.summary.mostReviewedVendor || "N/A"}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {platformAnalytics.summary.mostReviewedVendor
                  ? `${platformAnalytics.vendorAnalytics[
                      platformAnalytics.summary.mostReviewedVendor
                    ].totalReviews} reviews`
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
                {vendor} ({vendorReviews[vendor].length} reviews)
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
                    {selectedVendorStats.averageRating}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.round(selectedVendorStats.averageRating)
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
                    {selectedVendorStats.totalReviews}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {selectedVendorStats.verifiedReviews} verified
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
                    {selectedVendorStats.recommendationRate}%
                  </div>
                  <p className="text-xs text-slate-500 mt-2">recommend</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-slate-600">Trust Score</div>
                  <div className="text-3xl font-bold text-purple-600 mt-2">
                    {selectedVendorStats.averageTrustScore}
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
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={selectedVendorDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="rating" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category Ratings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Rating by Category</CardTitle>
                </CardHeader>
                <CardContent>
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
                      selectedVendorStats.categoryAverages[category.key] || 0;
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
        ) : vendorsWithReviews.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <p className="text-slate-500">No reviews yet. Start leaving reviews to see analytics!</p>
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
      </div>
    </div>
  );
}
