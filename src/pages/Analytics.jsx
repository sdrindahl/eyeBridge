import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Search,
  Eye,
  Heart,
  Star,
  Download,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import {
  getOverallAnalytics,
  getSearchTrends,
  exportAnalyticsAsCSV,
} from "@/lib/analytics";

export default function Analytics() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState(30); // days
  const [analytics, setAnalytics] = useState(null);
  const [trends, setTrends] = useState(null);

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

        // Prepare search history
        let backendSearchHistory = [];
        let recentSearchesArray = [];

        if (userData?.searchHistory && userData.searchHistory.length > 0) {
          backendSearchHistory = userData.searchHistory;
          recentSearchesArray = backendSearchHistory
            .slice(0, 10)
            .map((search) => search.searchTerm || search);
        } else {
          // Fall back to localStorage
          const stored = JSON.parse(
            localStorage.getItem("recentSearches") || "[]"
          );
          recentSearchesArray = stored;
          backendSearchHistory = stored.map((term) => ({
            searchTerm: term,
            timestamp: new Date().toISOString(),
          }));
        }

        // Get recently viewed
        const storedRecentlyViewed = JSON.parse(
          localStorage.getItem("recentlyViewed") || "[]"
        );

        // Get favorites
        const storedFavorites = JSON.parse(
          localStorage.getItem("favorites") || "[]"
        );

        // Prepare reviews
        const reviewsObject = {};
        if (userData?.reviews) {
          Object.entries(userData.reviews).forEach(([vendorName, review]) => {
            reviewsObject[vendorName] = [
              {
                rating: review.rating,
                comment: review.comment,
                date: new Date().toISOString(),
              },
            ];
          });
        }

        // Compute analytics with fallback data
        const analyticsData = getOverallAnalytics({
          favorites: userData?.favorites || storedFavorites,
          recentlyViewed: storedRecentlyViewed,
          searchHistory: backendSearchHistory,
          vendorReviews: reviewsObject,
          recentSearches: recentSearchesArray,
        });

        const trendsData = getSearchTrends(backendSearchHistory, timeRange);

        setAnalytics(analyticsData);
        setTrends(trendsData);
        setUserEmail(userEmail);
        setLoading(false);
      } catch (err) {
        console.error("Error loading analytics:", err);
        setError("Failed to load analytics data: " + (err.message || "Unknown error"));
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [timeRange]);

  const handleExport = () => {
    if (!analytics) return;

    const userData = {
      favorites: analytics.userActivity.favoritesCount,
      recentlyViewed: analytics.userActivity.viewsCount,
      searchHistory: analytics.search.topSearches,
      vendorReviews: analytics.userActivity.reviewsCount,
    };

    const csv = exportAnalyticsAsCSV(userData);
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(csv));
    element.setAttribute("download", `eyeBridge-Analytics-${new Date().toISOString().split("T")[0]}.csv`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

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
            <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
          </div>
          <div className="text-center text-slate-600">Loading analytics data...</div>
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
            <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
          </div>
          <div className="text-center text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  const COLORS = [
    "#f59e0b",
    "#3b82f6",
    "#10b981",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
  ];

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
            <h1 className="text-3xl font-bold text-slate-900">Your Analytics</h1>
            <p className="text-slate-600 text-sm mt-1">
              Track your browsing patterns, search trends, and vendor engagement
            </p>
          </div>
          <Button
            onClick={handleExport}
            className="bg-amber-600 hover:bg-amber-700 text-white gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 mb-8">
          {[7, 14, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setTimeRange(days)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                timeRange === days
                  ? "bg-amber-600 text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              {days}d
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-slate-600">Engagement Score</div>
              <div className="text-3xl font-bold text-amber-600 mt-2">
                {analytics.summary.engagementScore}%
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {analytics.summary.activityLevel} activity
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-500" />
                <div className="text-sm text-slate-600">Total Searches</div>
              </div>
              <div className="text-3xl font-bold text-blue-600 mt-2">
                {analytics.search.totalSearches}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {analytics.search.uniqueTerms} unique terms
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-green-500" />
                <div className="text-sm text-slate-600">Vendor Views</div>
              </div>
              <div className="text-3xl font-bold text-green-600 mt-2">
                {analytics.userActivity.viewsCount}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {analytics.vendors.totalEngagedVendors} unique vendors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                <div className="text-sm text-slate-600">Favorites</div>
              </div>
              <div className="text-3xl font-bold text-red-600 mt-2">
                {analytics.userActivity.favoritesCount}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {analytics.userActivity.reviewsCount} reviewed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Search Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {trends && trends.trends.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trends.trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="displayDate" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="searches"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{ fill: "#f59e0b" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-300 flex items-center justify-center text-slate-500">
                  No search data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Category Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.categories.topCategories.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.categories.topCategories}
                      dataKey="totalInteractions"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {analytics.categories.topCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-300 flex items-center justify-center text-slate-500">
                  No category data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          {/* Top Searches */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Most Searched Terms</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.search.topSearches.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={analytics.search.topSearches}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="term" type="category" width={190} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-300 flex items-center justify-center text-slate-500">
                  No search data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Vendors */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Engaged Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.vendors.topVendors.length > 0 ? (
              <div className="space-y-3">
                {analytics.vendors.topVendors.slice(0, 10).map((vendor, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">
                        {vendor.vendorName}
                      </p>
                      <div className="flex gap-4 text-xs text-slate-600 mt-1">
                        {vendor.favorites > 0 && (
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3 text-red-500" />
                            {vendor.favorites} favorite
                          </span>
                        )}
                        {vendor.views > 0 && (
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3 text-green-500" />
                            {vendor.views} views
                          </span>
                        )}
                        {vendor.reviewed && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-500" />
                            Reviewed
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900">
                        {vendor.interactions}
                      </div>
                      <p className="text-xs text-slate-500">interactions</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-500 py-8">
                No vendor data available yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
