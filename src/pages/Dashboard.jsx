import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Search, Phone, Mail, Globe, TrendingUp, Clock, Star, X, MapPin, Trash2, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import vendorsData from "@/data/vendors.json";
import api from "@/services/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [contactHistory, setContactHistory] = useState([]);
  const [savedComparisons, setSavedComparisons] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [compareList, setCompareList] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [vendorNotes, setVendorNotes] = useState({});
  const [currentNote, setCurrentNote] = useState("");
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [vendorReviews, setVendorReviews] = useState({});
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const categoryOptions = [
    "All Categories",
    "Equipment",
    "Contact Lens",
    "Pharmaceuticals",
    "Optical Lab",
    "Software",
    "Practice Management"
  ];

  // Get unique product types from the filtered vendors
  const productOptions = useMemo(() => {
    let vendorsToCheck = vendorsData;
    
    if (selectedCategory !== "all") {
      vendorsToCheck = vendorsData.filter(vendor => 
        vendor.Category?.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    const products = new Set();
    vendorsToCheck.forEach(vendor => {
      if (vendor["Products Offered"]) {
        vendor["Products Offered"].split(',').forEach(product => {
          const trimmed = product.trim();
          if (trimmed) products.add(trimmed);
        });
      }
    });
    
    return ["All Products", ...Array.from(products).sort()];
  }, [selectedCategory]);

  useEffect(() => {
    // Check if user is logged in and load data
    const initializeDashboard = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Verify token first
        const user = await api.verifyToken();
        setUserEmail(user.user?.email || "");
        
        // Load user data from backend
        const userData = await api.syncUserData();
        
        // Set favorites - backend returns array of vendor names
        setFavorites(userData.favorites || []);
        
        // Set search history - backend returns array of objects with searchTerm
        const recentSearchesArray = (userData.searchHistory || [])
          .slice(0, 10)
          .map(search => search.searchTerm);
        setRecentSearches(recentSearchesArray);
        setSearchHistory(userData.searchHistory || []);
        
        // Set vendor notes - backend returns object keyed by vendor name
        setVendorNotes(userData.notes || {});
        
        // Set vendor reviews - backend returns object with rating and comment per vendor
        // Convert to array format expected by UI
        const reviewsObject = {};
        Object.entries(userData.reviews || {}).forEach(([vendorName, review]) => {
          reviewsObject[vendorName] = [{
            rating: review.rating,
            comment: review.comment,
            date: new Date().toISOString()
          }];
        });
        setVendorReviews(reviewsObject);
        
        // Contact history and comparisons will be empty for now (backend feature not yet implemented)
        setContactHistory([]);
        setSavedComparisons([]);
        
        setLoading(false);
        
      } catch (error) {
        console.error("Error loading user data:", error);
        // If token is invalid, redirect to login
        if (error.message?.includes('Unauthorized') || error.message?.includes('Invalid token')) {
          api.logout();
          navigate("/login");
          return;
        }
        
        // For network or other errors, show error message and fallback to localStorage
        setError(error.message || 'Failed to load user data');
        
        // Fallback to localStorage if API fails for other reasons
        const storedFavorites = JSON.parse(localStorage.getItem("favorites") || "[]");
        setFavorites(storedFavorites);
        
        const storedSearches = JSON.parse(localStorage.getItem("recentSearches") || "[]");
        setRecentSearches(storedSearches);
        
        const storedContacts = JSON.parse(localStorage.getItem("contactHistory") || "[]");
        setContactHistory(storedContacts);
        
        const storedComparisons = JSON.parse(localStorage.getItem("savedComparisons") || "[]");
        setSavedComparisons(storedComparisons);
        
        const storedNotes = JSON.parse(localStorage.getItem("vendorNotes") || "{}");
        setVendorNotes(storedNotes);
        
        setLoading(false);
      }
    };
    
    initializeDashboard();
  }, [navigate]);

  const handleLogout = () => {
    api.logout();
    navigate("/");
  };

  const saveVendorNote = async (vendorName, noteText) => {
    try {
      await api.saveNote(vendorName, noteText);
      const updatedNotes = { ...vendorNotes, [vendorName]: noteText };
      setVendorNotes(updatedNotes);
      
      // Track in contact history (still using localStorage for now)
      const contactHistory = JSON.parse(localStorage.getItem("contactHistory") || "[]");
      const newContact = {
        vendorName,
        type: "note",
        note: noteText,
        date: new Date().toISOString()
      };
      const updatedHistory = [newContact, ...contactHistory].slice(0, 100);
      localStorage.setItem("contactHistory", JSON.stringify(updatedHistory));
      setContactHistory(updatedHistory);
    } catch (error) {
      console.error("Error saving note:", error);
      alert(`Failed to save note: ${error.message}`);
    }
  };

  const openVendorModal = (vendorName) => {
    const vendor = vendorsData.find(v => v["Company Name"] === vendorName);
    if (vendor) {
      setSelectedVendor(vendor);
      setCurrentNote(vendorNotes[vendorName] || "");
      setShowModal(true);
      setShowReviewForm(false);
      setShowNoteForm(false);
      setShowReviews(false);
      // Load existing review for this vendor
      const reviews = vendorReviews[vendorName] || [];
      const userReview = reviews.find(r => r.userEmail === userEmail);
      if (userReview) {
        setUserRating(userReview.rating);
        setUserComment(userReview.comment);
      } else {
        setUserRating(0);
        setUserComment("");
      }
    }
  };

  const calculateAverageRating = (vendorName) => {
    const reviews = vendorReviews[vendorName] || [];
    // Filter out invalid reviews (no rating or rating is 0)
    const validReviews = reviews.filter(r => r.rating && r.rating > 0);
    if (validReviews.length === 0) return 0;
    const sum = validReviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / validReviews.length).toFixed(1);
  };

  const submitReview = async () => {
    if (userRating === 0) {
      alert("Please select a star rating");
      return;
    }

    const vendorName = selectedVendor["Company Name"];
    
    try {
      await api.saveReview(vendorName, userRating, userComment);

      const newReview = {
        userEmail,
        rating: userRating,
        comment: userComment,
        date: new Date().toISOString()
      };

      const updatedReviews = { ...vendorReviews };
      if (!updatedReviews[vendorName]) {
        updatedReviews[vendorName] = [];
      }

      // Remove any existing review from this user
      updatedReviews[vendorName] = updatedReviews[vendorName].filter(r => r.userEmail !== userEmail);
      // Add new review
      updatedReviews[vendorName].push(newReview);

      setVendorReviews(updatedReviews);
      
      alert("Review submitted successfully!");
    } catch (error) {
      console.error("Error saving review:", error);
      alert(`Failed to save review: ${error.message}`);
    }
  };

  const saveSearchToHistory = () => {
    // Only save if there's actual search content
    if (!searchQuery.trim() && selectedCategory === "all" && selectedProduct === "all") return;
    
    const newSearch = {
      query: searchQuery,
      category: selectedCategory,
      product: selectedProduct,
      date: new Date().toISOString()
    };
    
    // Remove duplicates based on query, category, and product
    const updatedHistory = [
      newSearch,
      ...searchHistory.filter(s => 
        !(s.query.toLowerCase() === searchQuery.toLowerCase() && 
          s.category === selectedCategory && 
          s.product === selectedProduct)
      )
    ].slice(0, 10); // Keep only last 10 searches
    
    setSearchHistory(updatedHistory);
    localStorage.setItem("vendorSearchHistory", JSON.stringify(updatedHistory));
  };

  const loadSearchFromHistory = (search) => {
    setSearchQuery(search.query);
    setSelectedCategory(search.category);
    setSelectedProduct(search.product);
    setShowSearchHistory(false);
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("vendorSearchHistory");
  };

  const getFavoriteVendors = () => {
    return vendorsData.filter(vendor => 
      favorites.includes(vendor["Company Name"])
    ).slice(0, 6);
  };

  const getContactedVendors = () => {
    return contactHistory
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6);
  };

  const getRecommendedVendors = () => {
    // Get categories from recent searches and favorites
    const categories = new Set();
    recentSearches.forEach(search => {
      if (search.category && search.category !== "all") {
        categories.add(search.category);
      }
    });
    
    const favoriteVendors = getFavoriteVendors();
    favoriteVendors.forEach(vendor => {
      if (vendor.Category) {
        categories.add(vendor.Category);
      }
    });

    // Find vendors in those categories that aren't already favorites
    if (categories.size === 0) {
      return vendorsData.slice(0, 6);
    }

    return vendorsData
      .filter(vendor => 
        vendor.Category && 
        Array.from(categories).some(cat => vendor.Category.includes(cat)) &&
        !favorites.includes(vendor["Company Name"])
      )
      .slice(0, 6);
  };

  const executeSearch = (search) => {
    const params = new URLSearchParams();
    if (search.query) params.append("q", search.query);
    if (search.category && search.category !== "all") params.append("category", search.category);
    if (search.product && search.product !== "all") params.append("product", search.product);
    navigate(`/vendors?${params.toString()}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-300 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-700 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-300">
      {/* Header */}
      <header data-testid="dashboard-header" className="border-b border-slate-800 sticky top-0 z-10" style={{ backgroundImage: 'url(/banner.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-slate-900/50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Link to="/" data-testid="logo-link" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
              <img src="/logo.jpg" alt="Eye Bridges Logo" className="h-16 sm:h-20 w-auto cursor-pointer" />
              <span className="text-xl sm:text-2xl font-bold text-white">Eye Bridges</span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              <Link to="/">
                <Button data-testid="home-button" variant="ghost" className="text-white hover:bg-slate-800 text-xs sm:text-sm px-2 sm:px-4">
                  Home
                </Button>
              </Link>
              <Link to="/vendors">
                <Button data-testid="browse-vendors-button" variant="ghost" className="text-white hover:bg-slate-800 text-xs sm:text-sm px-2 sm:px-4">
                  Browse Vendors
                </Button>
              </Link>
              <div className="flex items-center gap-2 sm:gap-3 text-white">
                <span data-testid="user-email" className="text-xs sm:text-sm">{userEmail}</span>
                <Button data-testid="logout-button" onClick={handleLogout} variant="outline" className="border-white text-white hover:bg-slate-800 text-xs sm:text-sm px-2 sm:px-4">
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-2">
              <span className="text-yellow-800">⚠️</span>
              <p className="text-sm text-yellow-800">
                {error} - Showing cached data.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main data-testid="dashboard-main" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 data-testid="dashboard-title" className="text-4xl font-bold text-slate-900">My Dashboard</h1>
          <p className="text-slate-700 mt-2">Welcome back! Here's your personalized overview.</p>
          
          {/* Quick Search with Filters */}
          <div className="mt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Category Dropdown */}
              <div className="relative">
                <button
                  data-testid="category-dropdown"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap"
                >
                  <span className="font-medium">
                    {selectedCategory === "all" ? "All Categories" : selectedCategory}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showCategoryDropdown && (
                  <div className="absolute top-full mt-2 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-20 min-w-[200px]">
                    {categoryOptions.map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          setSelectedCategory(category === "All Categories" ? "all" : category);
                          setSelectedProduct("all");
                          setShowCategoryDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-700"
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Dropdown */}
              {selectedCategory !== "all" && (
                <div className="relative">
                  <button
                    onClick={() => setShowProductDropdown(!showProductDropdown)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors whitespace-nowrap"
                  >
                    <span className="font-medium">
                      {selectedProduct === "all" ? "All Products" : selectedProduct}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {showProductDropdown && (
                    <div className="absolute top-full mt-2 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-20 max-h-[300px] overflow-y-auto min-w-[200px]">
                      {productOptions.map((product) => (
                        <button
                          key={product}
                          onClick={() => {
                            setSelectedProduct(product === "All Products" ? "all" : product);
                            setShowProductDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-700"
                        >
                          {product}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Search Input */}
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  data-testid="search-input"
                  type="text"
                  placeholder={searchHistory.length > 0 ? "Search vendors... (view history below)" : "Search vendors..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSearchHistory(true)}
                  onBlur={() => setTimeout(() => setShowSearchHistory(false), 200)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      saveSearchToHistory();
                      let url = '/vendors';
                      const params = new URLSearchParams();
                      if (searchQuery) params.append('q', searchQuery);
                      if (selectedCategory !== 'all') params.append('category', selectedCategory);
                      if (selectedProduct !== 'all') params.append('product', selectedProduct);
                      if (params.toString()) url += '?' + params.toString();
                      navigate(url);
                    }
                  }}
                  className="w-full pl-12 pr-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent bg-slate-200 text-slate-800"
                />
                
                {/* Search History Dropdown */}
                {showSearchHistory && searchHistory.length > 0 && (
                  <div className="absolute top-full mt-2 w-full bg-white border border-slate-300 rounded-xl shadow-lg z-20 max-h-80 overflow-y-auto">
                    <div className="p-2 border-b border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600 uppercase">Recent Searches</span>
                      <button
                        onClick={clearSearchHistory}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Clear All
                      </button>
                    </div>
                    {searchHistory.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => loadSearchFromHistory(search)}
                        className="w-full text-left p-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-900 truncate">{search.query || "All vendors"}</p>
                            <div className="flex gap-2 mt-1 flex-wrap">
                              {search.category !== "all" && (
                                <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                  {search.category}
                                </span>
                              )}
                              {search.product !== "all" && (
                                <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded truncate max-w-[150px]">
                                  {search.product}
                                </span>
                              )}
                              {search.resultCount !== undefined && (
                                <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded font-medium">
                                  {search.resultCount} result{search.resultCount !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-slate-400 flex-shrink-0">
                            {new Date(search.date).toLocaleDateString()}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Clear Button */}
              {(searchQuery || selectedCategory !== "all" || selectedProduct !== "all") && (
                <Button
                  data-testid="clear-search-button"
                  onClick={() => {
                    saveSearchToHistory();
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setSelectedProduct("all");
                  }}
                  variant="outline"
                  className="border-slate-400 text-slate-900 hover:bg-slate-100 bg-white whitespace-nowrap"
                >
                  Clear Search
                </Button>
              )}

              {/* Search Button */}
              <Button
                data-testid="search-button"
                onClick={() => {
                  let url = '/vendors';
                  const params = new URLSearchParams();
                  if (searchQuery) params.append('q', searchQuery);
                  if (selectedCategory !== 'all') params.append('category', selectedCategory);
                  if (selectedProduct !== 'all') params.append('product', selectedProduct);
                  if (params.toString()) url += '?' + params.toString();
                  navigate(url);
                }}
                className="bg-slate-600 hover:bg-slate-700 text-white whitespace-nowrap"
              >
                Search Vendors
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div data-testid="quick-stats" className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card 
            data-testid="favorites-stat-card"
            className="bg-white border-slate-300 rounded-xl cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => document.getElementById('favorites-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p data-testid="favorites-label" className="text-sm text-slate-600">Favorites</p>
                  <p data-testid="favorites-count" className="text-3xl font-bold text-slate-900">{favorites.length}</p>
                </div>
                <Heart className="w-8 h-8 text-red-500 fill-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card 
            data-testid="searches-stat-card"
            className="bg-white border-slate-300 rounded-xl cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => document.getElementById('searches-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p data-testid="searches-label" className="text-sm text-slate-600">Recent Searches</p>
                  <p data-testid="searches-count" className="text-3xl font-bold text-slate-900">{recentSearches.length}</p>
                </div>
                <Search className="w-8 h-8 text-slate-600" />
              </div>
            </CardContent>
          </Card>

          <Card 
            data-testid="contacted-stat-card"
            className="bg-white border-slate-300 rounded-xl cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => document.getElementById('contacts-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p data-testid="contacted-label" className="text-sm text-slate-600">Contacted</p>
                  <p data-testid="contacted-count" className="text-3xl font-bold text-slate-900">{contactHistory.length}</p>
                </div>
                <Phone className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card 
            data-testid="comparisons-stat-card"
            className="bg-white border-slate-300 rounded-xl cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => document.getElementById('comparisons-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p data-testid="comparisons-label" className="text-sm text-slate-600">Comparisons</p>
                  <p data-testid="comparisons-count" className="text-3xl font-bold text-slate-900">{savedComparisons.length}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Searches */}
          <Card id="searches-section" className="bg-white border-slate-300 rounded-xl scroll-mt-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Searches
                </CardTitle>
                {recentSearches.length > 0 && (
                  <Button
                    onClick={() => {
                      if (confirm("Are you sure you want to clear all recent searches?")) {
                        localStorage.setItem("recentSearches", "[]");
                        setRecentSearches([]);
                      }
                    }}
                    variant="ghost"
                    className="text-xs text-slate-600 hover:text-red-600 h-auto py-1"
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {recentSearches.length === 0 ? (
                <p className="text-slate-600 text-sm">No recent searches yet</p>
              ) : (
                <div className="space-y-3">
                  {recentSearches.slice(0, 5).map((search, index) => (
                    <div
                      key={index}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200 group relative"
                    >
                      <div 
                        onClick={() => executeSearch(search)}
                        className="flex items-center justify-between cursor-pointer hover:bg-slate-100 -m-3 p-3 rounded-lg pr-10"
                      >
                        <div>
                          {search.name && (
                            <p className="font-medium text-slate-900">{search.name}</p>
                          )}
                          <div className="flex flex-wrap gap-2 mt-1">
                            {search.query && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                "{search.query}"
                              </span>
                            )}
                            {search.category && search.category !== "all" && (
                              <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded">
                                {search.category}
                              </span>
                            )}
                            {search.product && search.product !== "all" && (
                              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                                {search.product}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const updatedSearches = recentSearches.filter((_, i) => i !== index);
                          setRecentSearches(updatedSearches);
                          localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
                        }}
                        className="absolute top-2 right-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-1 transition-colors"
                        title="Remove this search"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Favorite Vendors */}
          <Card id="favorites-section" className="bg-white border-slate-300 rounded-xl scroll-mt-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  Favorite Vendors
                </CardTitle>
                {compareList.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowComparison(true)}
                      disabled={compareList.length < 2}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white h-auto py-1 px-3"
                    >
                      Compare ({compareList.length})
                    </Button>
                    <Button
                      onClick={() => setCompareList([])}
                      variant="ghost"
                      className="text-xs text-slate-600 hover:text-red-600 h-auto py-1 px-2"
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {favorites.length === 0 ? (
                <p className="text-slate-600 text-sm">No favorites yet. Start adding vendors from the browse page!</p>
              ) : (
                <div className="space-y-3">
                  {getFavoriteVendors().map((vendor, index) => (
                    <div
                      key={index}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all relative group"
                    >
                      <div
                        onClick={() => {
                          setSelectedVendor(vendor);
                          setShowModal(true);
                        }}
                        className="cursor-pointer"
                      >
                        <div className="pr-28">
                          <p className="font-medium text-slate-900">{vendor["Company Name"]}</p>
                          {vendorReviews[vendor["Company Name"]] && 
                           vendorReviews[vendor["Company Name"]].filter(r => r.rating && r.rating > 0).length > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-3 h-3 ${
                                      star <= Math.round(calculateAverageRating(vendor["Company Name"]))
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-slate-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-slate-600 font-medium">
                                {calculateAverageRating(vendor["Company Name"])}
                              </span>
                            </div>
                          )}
                          <p className="text-xs text-slate-600 mt-1">{vendor.Category}</p>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (compareList.includes(vendor["Company Name"])) {
                              setCompareList(compareList.filter(v => v !== vendor["Company Name"]));
                            } else if (compareList.length < 4) {
                              setCompareList([...compareList, vendor["Company Name"]]);
                            } else {
                              alert("You can compare up to 4 vendors at a time");
                            }
                          }}
                          className={`px-2 py-1 rounded-lg transition-all text-xs font-medium ${
                            compareList.includes(vendor["Company Name"]) 
                              ? "bg-blue-500 text-white hover:bg-blue-600" 
                              : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                          }`}
                          title={compareList.includes(vendor["Company Name"]) ? "Remove from comparison" : "Add to comparison"}
                        >
                          {compareList.includes(vendor["Company Name"]) ? "✓ Compare" : "Compare"}
                        </button>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await api.removeFavorite(vendor["Company Name"]);
                              const newFavorites = favorites.filter(f => f !== vendor["Company Name"]);
                              setFavorites(newFavorites);
                              // Also remove from compare list if it's there
                              if (compareList.includes(vendor["Company Name"])) {
                                setCompareList(compareList.filter(v => v !== vendor["Company Name"]));
                              }
                            } catch (error) {
                              console.error("Error removing favorite:", error);
                              alert(`Failed to remove favorite: ${error.message}`);
                            }
                          }}
                          className="rounded-full p-1.5 transition-all bg-red-100 hover:bg-red-200 text-red-600"
                          title="Remove from favorites"
                        >
                          <Heart className="w-3 h-3 fill-red-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {favorites.length > 6 && (
                    <Link to="/vendors">
                      <Button variant="ghost" className="w-full text-sm">
                        View all {favorites.length} favorites →
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommended Vendors */}
          <Card className="bg-white border-slate-300 rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                Recommended for You
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getRecommendedVendors().map((vendor, index) => (
                  <div
                    key={index}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <p className="font-medium text-slate-900">{vendor["Company Name"]}</p>
                    <p className="text-xs text-slate-600 mt-1">{vendor.Category}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Saved Comparisons */}
          <Card id="comparisons-section" className="bg-white border-slate-300 rounded-xl lg:col-span-2 scroll-mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Saved Comparisons
              </CardTitle>
            </CardHeader>
            <CardContent>
              {savedComparisons.length === 0 ? (
                <p className="text-slate-600 text-sm">No saved comparisons yet. Start comparing vendors from the browse page!</p>
              ) : (
                <div className="space-y-3">
                  {savedComparisons.map((comparison, index) => (
                    <div
                      key={index}
                      className="p-4 bg-slate-50 rounded-lg border border-slate-200 relative group hover:bg-slate-100 hover:border-slate-300 transition-all"
                    >
                      <div className="pr-20">
                        <p className="font-medium text-slate-900 mb-2">
                          {comparison.name || `Comparison ${index + 1}`}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {comparison.vendors.map((vendorName, vIndex) => (
                            <span key={vIndex} className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded">
                              {vendorName}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                          Saved {new Date(comparison.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCompareList(comparison.vendors);
                            setShowComparison(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-auto py-1 px-3"
                        >
                          View
                        </Button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Remove "${comparison.name || `Comparison ${index + 1}`}"?`)) {
                              const updatedComparisons = savedComparisons.filter((_, i) => i !== index);
                              setSavedComparisons(updatedComparisons);
                              localStorage.setItem("savedComparisons", JSON.stringify(updatedComparisons));
                            }
                          }}
                          className="bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-1"
                          title="Remove this comparison"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Comparison Modal */}
      {showComparison && compareList.length >= 2 && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowComparison(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-slate-200 border-b border-slate-300 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Favorite Vendors Comparison</h2>
                <p className="text-slate-600 text-sm mt-1">Comparing {compareList.length} vendors</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    const comparisonName = prompt("Enter a name for this comparison:");
                    if (comparisonName) {
                      const savedComparisons = JSON.parse(localStorage.getItem("savedComparisons") || "[]");
                      const newComparison = {
                        name: comparisonName,
                        vendors: compareList,
                        date: new Date().toISOString()
                      };
                      localStorage.setItem("savedComparisons", JSON.stringify([newComparison, ...savedComparisons]));
                      setSavedComparisons([newComparison, ...savedComparisons]);
                      alert("Comparison saved!");
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Save Comparison
                </Button>
                <button
                  onClick={() => setShowComparison(false)}
                  className="text-slate-500 hover:text-slate-900 text-2xl font-bold leading-none px-2"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {compareList.map((vendorName, index) => {
                  const vendor = vendorsData.find(v => v["Company Name"] === vendorName);
                  if (!vendor) return null;
                  
                  return (
                    <div key={index} className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                      <h3 className="font-bold text-slate-900 mb-3 text-lg">{vendor["Company Name"]}</h3>
                      
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="text-xs text-slate-500 uppercase font-semibold">Category</p>
                          <p className="text-slate-700">{vendor.Category || "N/A"}</p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500 uppercase font-semibold">Products</p>
                          <p className="text-slate-700 line-clamp-3">{vendor["Products Offered"] || "N/A"}</p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500 uppercase font-semibold">Location</p>
                          <p className="text-slate-700 line-clamp-2">{vendor.Address || "N/A"}</p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500 uppercase font-semibold">Contact</p>
                          <div className="space-y-1">
                            {vendor.Phone && (
                              <p className="text-slate-700 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {vendor.Phone}
                              </p>
                            )}
                            {vendor.Email && (
                              <p className="text-slate-700 flex items-center gap-1 break-all">
                                <Mail className="w-3 h-3 flex-shrink-0" />
                                <span className="text-xs">{vendor.Email}</span>
                              </p>
                            )}
                            {vendor.Website && (
                              <a 
                                href={vendor.Website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-1"
                              >
                                <Globe className="w-3 h-3" />
                                Website
                              </a>
                            )}
                          </div>
                        </div>

                        {vendor.Notes && (
                          <div>
                            <p className="text-xs text-slate-500 uppercase font-semibold">Notes</p>
                            <p className="text-slate-700 line-clamp-3">{vendor.Notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vendor Details Modal */}
      {showModal && selectedVendor && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-slate-50 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-slate-200 border-b border-slate-300 p-6 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{selectedVendor["Company Name"]}</h2>
                
                {/* Star Rating Display */}
                {vendorReviews[selectedVendor["Company Name"]] && 
                 vendorReviews[selectedVendor["Company Name"]].filter(r => r.rating && r.rating > 0).length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= Math.round(calculateAverageRating(selectedVendor["Company Name"]))
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-slate-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-bold text-slate-900">
                      {calculateAverageRating(selectedVendor["Company Name"])}
                    </span>
                    <span className="text-sm text-slate-500">
                      ({vendorReviews[selectedVendor["Company Name"]].filter(r => r.rating && r.rating > 0).length} review{vendorReviews[selectedVendor["Company Name"]].filter(r => r.rating && r.rating > 0).length !== 1 ? 's' : ''})
                    </span>
                  </div>
                )}

                {selectedVendor.Category && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedVendor.Category.split(';').map((cat, i) => (
                      <span
                        key={i}
                        className="text-xs px-3 py-1 rounded-full bg-teal-100 text-teal-700 border border-teal-300"
                      >
                        {cat.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Leave a Review and Add Note Buttons */}
                <div className="flex gap-2 mt-3">
                  <Button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                  >
                    {showReviewForm ? "Hide Review Form" : (
                      vendorReviews[selectedVendor["Company Name"]]?.some(r => r.userEmail === userEmail && r.rating > 0)
                        ? "Edit Review"
                        : "Leave a Review"
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowNoteForm(!showNoteForm);
                      if (!showNoteForm) {
                        setCurrentNote(vendorNotes[selectedVendor["Company Name"]] || "");
                      }
                    }}
                    className="bg-slate-600 hover:bg-slate-700 text-white text-sm"
                  >
                    {showNoteForm ? "Hide Note" : (
                      vendorNotes[selectedVendor["Company Name"]]
                        ? "Edit Note"
                        : "Add Note"
                    )}
                  </Button>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-slate-900 text-2xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            {/* Review Form Section */}
            {showReviewForm && (
              <div className="px-6 py-4 bg-slate-100 border-b border-slate-300">
                <h3 className="text-sm font-semibold text-slate-700 uppercase mb-4">Your Review</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Your Rating:</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(0)}
                          onClick={() => setUserRating(star)}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 cursor-pointer ${
                              star <= (hoveredStar || userRating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-slate-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-slate-600 mb-2">Your Comment (optional):</p>
                    <textarea
                      value={userComment}
                      onChange={(e) => setUserComment(e.target.value)}
                      placeholder="Share your experience with this vendor..."
                      className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-slate-800 text-sm"
                      rows="4"
                    />
                  </div>

                  <Button
                    onClick={() => {
                      submitReview();
                      setShowReviewForm(false);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Submit Review
                  </Button>
                </div>
              </div>
            )}

            {/* Note Form Section */}
            {showNoteForm && (
              <div className="px-6 py-4 bg-slate-100 border-b border-slate-300">
                <h3 className="text-sm font-semibold text-slate-700 uppercase mb-4">My Note</h3>
                <div className="space-y-4">
                  <textarea
                    value={currentNote}
                    onChange={(e) => setCurrentNote(e.target.value)}
                    placeholder="Add a note about this vendor..."
                    className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white text-slate-800 text-sm"
                    rows="4"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        if (currentNote.trim()) {
                          saveVendorNote(selectedVendor["Company Name"], currentNote);
                          alert("Note saved!");
                          setShowNoteForm(false);
                        }
                      }}
                      className="flex-1 bg-slate-600 hover:bg-slate-700 text-white"
                    >
                      {vendorNotes[selectedVendor["Company Name"]] ? "Update Note" : "Save Note"}
                    </Button>
                    {vendorNotes[selectedVendor["Company Name"]] && (
                      <Button
                        onClick={async () => {
                          try {
                            await api.deleteNote(selectedVendor["Company Name"]);
                            setCurrentNote("");
                            const updatedNotes = { ...vendorNotes };
                            delete updatedNotes[selectedVendor["Company Name"]];
                            setVendorNotes(updatedNotes);
                            alert("Note deleted!");
                            setShowNoteForm(false);
                          } catch (error) {
                            console.error("Error deleting note:", error);
                            alert("Failed to delete note");
                          }
                        }}
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-50"
                      >
                        Delete Note
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="p-6 space-y-6">
              {/* Display existing note */}
              {vendorNotes[selectedVendor["Company Name"]] && !showNoteForm && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-slate-700 uppercase mb-2 flex items-center gap-2">
                    <span>📝</span> My Note
                  </h3>
                  <p className="text-slate-700 whitespace-pre-wrap">{vendorNotes[selectedVendor["Company Name"]]}</p>
                </div>
              )}

              {selectedVendor.Notes && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 uppercase mb-2">About</h3>
                  <p className="text-slate-700">{selectedVendor.Notes}</p>
                </div>
              )}

              {selectedVendor["Products Offered"] && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 uppercase mb-2">Products Offered</h3>
                  <p className="text-slate-700">{selectedVendor["Products Offered"]}</p>
                </div>
              )}

              {selectedVendor["Category Tags"] && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 uppercase mb-2">Tags</h3>
                  <p className="text-slate-700">{selectedVendor["Category Tags"]}</p>
                </div>
              )}

              <div className="border-t border-slate-300 pt-6 space-y-4">
                <h3 className="text-sm font-semibold text-slate-600 uppercase">Contact Information</h3>
                
                {selectedVendor.Address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold">Address</p>
                      <p className="text-slate-700">{selectedVendor.Address}</p>
                    </div>
                  </div>
                )}

                {selectedVendor.Phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-teal-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold">Phone</p>
                      <a 
                        href={`tel:${selectedVendor.Phone}`} 
                        className="text-slate-700 hover:text-teal-600"
                      >
                        {selectedVendor.Phone}
                      </a>
                    </div>
                  </div>
                )}

                {selectedVendor.Email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-teal-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold">Email</p>
                      <a 
                        href={`mailto:${selectedVendor.Email}`} 
                        className="text-slate-700 hover:text-teal-600"
                      >
                        {selectedVendor.Email}
                      </a>
                    </div>
                  </div>
                )}

                {selectedVendor.Website && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-teal-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold">Website</p>
                      <a
                        href={selectedVendor.Website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-600 hover:underline font-medium"
                      >
                        Visit Website
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Display Reviews */}
              {vendorReviews[selectedVendor["Company Name"]] && 
               vendorReviews[selectedVendor["Company Name"]].filter(r => r.rating && r.rating > 0).length > 0 && (
                <div className="border-t border-slate-300 pt-6">
                  <button
                    onClick={() => setShowReviews(!showReviews)}
                    className="w-full flex items-center justify-between text-left mb-4 hover:opacity-70 transition-opacity"
                  >
                    <h3 className="text-sm font-semibold text-slate-600 uppercase">
                      Reviews ({vendorReviews[selectedVendor["Company Name"]].filter(r => r.rating && r.rating > 0).length})
                    </h3>
                    <span className="text-slate-600 text-xl">{showReviews ? "−" : "+"}</span>
                  </button>
                  {showReviews && (
                  <div className="space-y-4">
                    {vendorReviews[selectedVendor["Company Name"]]
                      .filter(r => r.rating && r.rating > 0)
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((review, index) => (
                        <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= review.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-slate-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-semibold text-slate-700">{review.rating}.0</span>
                            </div>
                            <span className="text-xs text-slate-500">
                              {new Date(review.date).toLocaleDateString()}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{review.comment}</p>
                          )}
                          <p className="text-xs text-slate-500 mt-2">
                            by {review.userEmail}
                          </p>
                        </div>
                      ))}
                  </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
