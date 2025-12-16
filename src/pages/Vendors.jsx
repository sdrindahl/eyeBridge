import React, { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Search, MapPin, Phone, Mail, Globe, ChevronDown, Heart, X, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import vendorsData from "@/data/vendors.json";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "@/services/api";

  const navigate = useNavigate();
  const { isLoggedIn, userEmail } = useAuth();

  // Highlight matching text
  const highlightText = (text, query) => {
    if (!text || !query) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-blue-400 text-white px-0.5 rounded">{part}</mark>
      ) : (
        part
      )
    );
  };
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [selectedProduct, setSelectedProduct] = useState(searchParams.get("product") || "all");
  const [animationKey, setAnimationKey] = useState(0);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [favorites, setFavorites] = useState([]);
  // Remove local isLoggedIn state, use context instead
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [compareList, setCompareList] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [appliedSearchQuery, setAppliedSearchQuery] = useState(searchParams.get("q") || "");
  const [appliedCategory, setAppliedCategory] = useState(searchParams.get("category") || "all");
  const [appliedProduct, setAppliedProduct] = useState(searchParams.get("product") || "all");
  const [vendorReviews, setVendorReviews] = useState({});
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [vendorNotes, setVendorNotes] = useState({});
  const [currentNote, setCurrentNote] = useState("");
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  const categoryOptions = [
    "All Categories",
    "Equipment",
    "Contact Lens",
    "Pharmaceuticals",
    "Optical Lab",
    "Software",
    "Practice Management"
  ];

  // Category color mapping
  const getCategoryColor = (category) => {
    if (!category) return "bg-gradient-to-r from-slate-600 to-slate-700";
    
    const categoryLower = category.toLowerCase();
    
    if (categoryLower.includes("equipment")) return "bg-gradient-to-r from-slate-500 to-slate-600";
    if (categoryLower.includes("contact lens")) return "bg-gradient-to-r from-slate-600 to-slate-700";
    if (categoryLower.includes("pharmaceutical")) return "bg-gradient-to-r from-slate-700 to-slate-800";
    if (categoryLower.includes("optical lab")) return "bg-gradient-to-r from-gray-600 to-gray-700";
    if (categoryLower.includes("software")) return "bg-gradient-to-r from-zinc-600 to-zinc-700";
    if (categoryLower.includes("practice management")) return "bg-gradient-to-r from-neutral-600 to-neutral-700";
    
    return "bg-gradient-to-r from-slate-600 to-slate-700";
  };

  // Get unique product types from the filtered vendors
  const productOptions = useMemo(() => {
    let vendorsToCheck = vendorsData;
    
    // Only get products from the selected category
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

  // Filter vendors based on applied search query, category, and product
  const filteredVendors = useMemo(() => {
    let results = vendorsData;

    // First filter by category
    if (appliedCategory !== "all") {
      results = results.filter(vendor => 
        vendor.Category?.toLowerCase().includes(appliedCategory.toLowerCase())
      );
    }

    // Then filter by product type
    if (appliedProduct !== "all") {
      results = results.filter(vendor => 
        vendor["Products Offered"]?.includes(appliedProduct)
      );
    }

    // Then filter by search query (searches all fields)
    if (appliedSearchQuery !== "") {
      const query = appliedSearchQuery.toLowerCase();
      
      results = results.filter(vendor => {
        return (
          vendor["Company Name"]?.toLowerCase().includes(query) ||
          vendor.Category?.toLowerCase().includes(query) ||
          vendor["Category Tags"]?.toLowerCase().includes(query) ||
          vendor["Search Keywords"]?.toLowerCase().includes(query) ||
          vendor["Products Offered"]?.toLowerCase().includes(query)
        );
      });
    }

    // Filter by favorites if that option is selected
    if (showFavoritesOnly) {
      results = results.filter(vendor => favorites.includes(vendor["Company Name"]));
    }

    return results;
  }, [appliedSearchQuery, appliedCategory, appliedProduct, showFavoritesOnly, favorites]);

  // Group vendors by category
  const vendorsByCategory = useMemo(() => {
    const grouped = {};
    
    filteredVendors.forEach(vendor => {
      if (!vendor.Category) {
        if (!grouped["Other"]) grouped["Other"] = [];
        grouped["Other"].push(vendor);
        return;
      }
      
      // Get the primary category (first one before semicolon)
      const primaryCategory = vendor.Category.split(';')[0].trim();
      
      if (!grouped[primaryCategory]) {
        grouped[primaryCategory] = [];
      }
      grouped[primaryCategory].push(vendor);
    });
    
    // Define the exact order
    const categoryOrder = [
      "Equipment",
      "Equipment Distributor",
      "Contact Lens",
      "Pharmaceuticals",
      "Optical Lab",
      "Software",
      "Practice Management"
    ];
    
    // Sort categories based on the defined order
    return Object.keys(grouped)
      .sort((a, b) => {
        let indexA = categoryOrder.indexOf(a);
        let indexB = categoryOrder.indexOf(b);
        
        // If not exact match, try to find partial match
        if (indexA === -1) {
          indexA = categoryOrder.findIndex(cat => a.includes(cat) || cat.includes(a));
        }
        if (indexB === -1) {
          indexB = categoryOrder.findIndex(cat => b.includes(cat) || cat.includes(b));
        }
        
        // If both are in the order list, sort by their position
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        // If only A is in the list, it comes first
        if (indexA !== -1) return -1;
        // If only B is in the list, it comes first
        if (indexB !== -1) return 1;
        // If neither is in the list, sort alphabetically
        return a.localeCompare(b);
      })
      .reduce((acc, key) => {
        acc[key] = grouped[key];
        return acc;
      }, {});
  }, [filteredVendors]);

  // Load favorites and login state
  useEffect(() => {
    if (isLoggedIn) {
      // Load all user data from backend
      const loadUserData = async () => {
        try {
          const userData = await api.syncUserData();
          setFavorites(userData.favorites || []);
          setSearchHistory(userData.searchHistory || []);
          setVendorNotes(userData.notes || {});
          const reviewsObject = {};
          Object.entries(userData.reviews || {}).forEach(([vendorName, review]) => {
            reviewsObject[vendorName] = [{
              rating: review.rating,
              comment: review.comment,
              userEmail: userEmail,
              date: new Date().toISOString()
            }];
          });
          setVendorReviews(reviewsObject);
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      };
      loadUserData();
    }
  }, [isLoggedIn, userEmail]);

  // Track searches with debounce - only save after user stops typing for 2 seconds
  useEffect(() => {
    if (!isLoggedIn) return;
    
    const timeoutId = setTimeout(() => {
      if (searchQuery || selectedCategory !== "all" || selectedProduct !== "all") {
        const recentSearches = JSON.parse(localStorage.getItem("recentSearches") || "[]");
        const newSearch = {
          query: searchQuery,
          category: selectedCategory,
          product: selectedProduct,
          date: new Date().toISOString()
        };
        
        // Add to beginning and limit to 20 searches
        const updatedSearches = [newSearch, ...recentSearches.filter(s => 
          !(s.query === searchQuery && s.category === selectedCategory && s.product === selectedProduct)
        )].slice(0, 20);
        
        localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
      }
    }, 2000); // Wait 2 seconds after last keystroke
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory, selectedProduct, isLoggedIn]);

  const toggleFavorite = async (vendorName) => {
    if (!isLoggedIn) {
      alert("Please log in to save favorites");
      return;
    }

    try {
      const isFavorite = favorites.includes(vendorName);
      
      if (isFavorite) {
        await api.removeFavorite(vendorName);
        setFavorites(favorites.filter(f => f !== vendorName));
      } else {
        await api.addFavorite(vendorName);
        setFavorites([...favorites, vendorName]);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Failed to update favorite");
    }
  };

  const toggleCompare = (vendorName) => {
    if (compareList.includes(vendorName)) {
      setCompareList(compareList.filter(v => v !== vendorName));
    } else if (compareList.length < 4) {
      setCompareList([...compareList, vendorName]);
    } else {
      alert("You can compare up to 4 vendors at a time");
    }
  };

  const trackContact = (vendorName, type, note = "") => {
    if (!isLoggedIn) return;

    const contactHistory = JSON.parse(localStorage.getItem("contactHistory") || "[]");
    const newContact = {
      vendorName,
      type,
      note,
      date: new Date().toISOString()
    };
    
    const updatedHistory = [newContact, ...contactHistory].slice(0, 100);
    localStorage.setItem("contactHistory", JSON.stringify(updatedHistory));
  };

  const submitReview = async () => {
    if (!isLoggedIn) {
      alert("Please log in to submit a review");
      return;
    }

    if (userRating === 0) {
      alert("Please select a star rating");
      return;
    }

    const vendorName = selectedVendor["Company Name"];
    const userEmail = localStorage.getItem("userEmail");
    
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
      alert("Failed to save review");
    }
  };

  const saveVendorNote = async (vendorName, noteText) => {
    try {
      await api.saveNote(vendorName, noteText);
      const updatedNotes = { ...vendorNotes, [vendorName]: noteText };
      setVendorNotes(updatedNotes);
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Failed to save note");
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

  const calculateResultCount = (query, category, product) => {
    let results = vendorsData;

    // Filter by category
    if (category !== "all") {
      results = results.filter(vendor => 
        vendor.Category?.toLowerCase().includes(category.toLowerCase())
      );
    }

    // Filter by product type
    if (product !== "all") {
      results = results.filter(vendor => 
        vendor["Products Offered"]?.includes(product)
      );
    }

    // Filter by search query
    if (query !== "") {
      const searchQuery = query.toLowerCase();
      results = results.filter(vendor => {
        return (
          vendor["Company Name"]?.toLowerCase().includes(searchQuery) ||
          vendor.Category?.toLowerCase().includes(searchQuery) ||
          vendor["Category Tags"]?.toLowerCase().includes(searchQuery) ||
          vendor["Search Keywords"]?.toLowerCase().includes(searchQuery) ||
          vendor["Products Offered"]?.toLowerCase().includes(searchQuery)
        );
      });
    }

    // Filter by favorites if that option is selected
    if (showFavoritesOnly) {
      results = results.filter(vendor => favorites.includes(vendor["Company Name"]));
    }

    return results.length;
  };

  const saveSearchToHistory = (resultCount) => {
    if (!isLoggedIn) return;
    
    // Only save if there's actual search content
    if (!searchQuery.trim() && selectedCategory === "all" && selectedProduct === "all") return;
    
    const newSearch = {
      query: searchQuery,
      category: selectedCategory,
      product: selectedProduct,
      resultCount: resultCount,
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
    setAppliedSearchQuery(search.query);
    setAppliedCategory(search.category);
    setAppliedProduct(search.product);
    setShowSearchHistory(false);
    setAnimationKey(prev => prev + 1);
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("vendorSearchHistory");
  };

  return (
    <div className="min-h-screen bg-gray-300">
      {/* Header */}
      <header data-testid="vendors-header" className="border-b border-slate-800 sticky top-0 z-10" style={{ backgroundImage: 'url(/banner.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-slate-900/50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/" data-testid="logo-link" className="hover:opacity-80 transition-opacity">
                <img src="/logo.jpg" alt="Eye Bridges Logo" className="h-16 sm:h-20 w-auto cursor-pointer" />
              </Link>
              <div>
                <h1 data-testid="vendors-title" className="text-xl sm:text-3xl font-bold text-white">Vendor Directory</h1>
                <p className="text-slate-200 mt-1 text-xs sm:text-base hidden sm:block">
                  Search through {vendorsData.length} eye care vendors and suppliers
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <Button 
                data-testid="home-button"
                onClick={() => navigate("/")}
                variant="ghost" 
                className="text-white hover:bg-slate-800 text-xs sm:text-sm px-2 sm:px-4"
              >
                Home
              </Button>
              {isLoggedIn ? (
                <>
                  <Button 
                    data-testid="dashboard-button"
                    onClick={() => navigate("/dashboard")}
                    variant="ghost" 
                    className="text-white hover:bg-slate-800 text-xs sm:text-sm px-2 sm:px-4"
                  >
                    Dashboard
                  </Button>
                  <Button 
                    data-testid="logout-button"
                    onClick={() => {
                      localStorage.removeItem("isLoggedIn");
                      localStorage.removeItem("userEmail");
                      navigate("/");
                    }}
                    variant="outline" 
                    className="border-white text-white hover:bg-slate-800 text-xs sm:text-sm px-2 sm:px-4"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Button 
                  data-testid="login-button"
                  onClick={() => navigate("/login")}
                  variant="outline" 
                  className="border-white text-white hover:bg-slate-800 text-xs sm:text-sm px-2 sm:px-4"
                >
                  <span className="hidden sm:inline">Login to Your Dashboard</span>
                  <span className="sm:hidden">Login</span>
                </Button>
              )}
            </div>
          </div>

          {/* Search Controls */}
          <div className="mt-6 space-y-4">
            {/* Back Button */}
            <div className="hidden sm:block">
              {isLoggedIn ? (
                <Button 
                  variant="outline" 
                  className="border-white text-white hover:bg-slate-800" 
                  onClick={() => navigate("/dashboard")}
                >
                  ← Back to Dashboard
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="border-white text-white hover:bg-slate-800" 
                  onClick={() => window.location.href = "/"}
                >
                  ← Back to Home
                </Button>
              )}
            </div>

            {/* Mobile Compact Search */}
            <div className="sm:hidden">
              {/* Mobile Back Button */}
              <div className="mb-3">
                {isLoggedIn ? (
                  <Button 
                    variant="outline" 
                    className="border-white text-white hover:bg-slate-800 text-sm w-full" 
                    onClick={() => navigate("/dashboard")}
                  >
                    ← Back to Dashboard
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="border-white text-white hover:bg-slate-800 text-sm w-full" 
                    onClick={() => window.location.href = "/"}
                  >
                    ← Back to Home
                  </Button>
                )}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search vendors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const resultCount = calculateResultCount(searchQuery, selectedCategory, selectedProduct);
                      setAppliedSearchQuery(searchQuery);
                      setAppliedCategory(selectedCategory);
                      setAppliedProduct(selectedProduct);
                      saveSearchToHistory(resultCount);
                      setAnimationKey(prev => prev + 1);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 bg-slate-200 text-slate-800 text-sm"
                />
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => {
                    setShowCategoryDropdown(!showCategoryDropdown);
                    setShowProductDropdown(false);
                  }}
                  className="flex-1 flex items-center justify-between gap-2 px-3 py-1.5 bg-teal-500 text-white rounded-lg text-xs font-medium"
                >
                  <span className="truncate">{selectedCategory === "all" ? "Category" : selectedCategory}</span>
                  <ChevronDown className="w-3 h-3 flex-shrink-0" />
                </button>
                {selectedCategory !== "all" && (
                  <button
                    onClick={() => {
                      setShowProductDropdown(!showProductDropdown);
                      setShowCategoryDropdown(false);
                    }}
                    className="flex-1 flex items-center justify-between gap-2 px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-xs font-medium"
                  >
                    <span className="truncate">{selectedProduct === "all" ? "Product" : selectedProduct}</span>
                    <ChevronDown className="w-3 h-3 flex-shrink-0" />
                  </button>
                )}
                <Button 
                  onClick={() => {
                    const resultCount = calculateResultCount(searchQuery, selectedCategory, selectedProduct);
                    setAppliedSearchQuery(searchQuery);
                    setAppliedCategory(selectedCategory);
                    setAppliedProduct(selectedProduct);
                    saveSearchToHistory(resultCount);
                    setAnimationKey(prev => prev + 1);
                  }}
                  className="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white text-xs"
                >
                  Go
                </Button>
              </div>
            </div>

            {/* Desktop Filters and Search Row */}
            <div className="hidden sm:flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Category Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowCategoryDropdown(!showCategoryDropdown);
                    setShowProductDropdown(false);
                  }}
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
                    onClick={() => {
                      setShowProductDropdown(!showProductDropdown);
                      setShowCategoryDropdown(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors whitespace-nowrap"
                  >
                    <span className="font-medium">
                      {selectedProduct === "all" ? "All Products" : selectedProduct}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {showProductDropdown && (
                    <div className="absolute top-full mt-2 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-20 min-w-[200px] max-h-96 overflow-y-auto">
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
                  type="text"
                  placeholder={isLoggedIn && searchHistory.length > 0 ? "Search vendors... (view history below)" : "Search vendors..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (isLoggedIn) setShowSearchHistory(true);
                  }}
                  onBlur={() => setTimeout(() => setShowSearchHistory(false), 200)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const resultCount = calculateResultCount(searchQuery, selectedCategory, selectedProduct);
                      setAppliedSearchQuery(searchQuery);
                      setAppliedCategory(selectedCategory);
                      setAppliedProduct(selectedProduct);
                      saveSearchToHistory(resultCount);
                      setShowSearchHistory(false);
                      setAnimationKey(prev => prev + 1);
                    }
                  }}
                  className="w-full pl-12 pr-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent bg-slate-200 text-slate-800"
                />
                
                {/* Search History Dropdown */}
                {isLoggedIn && showSearchHistory && searchHistory.length > 0 && (
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

              {/* Search Button */}
              <Button 
                onClick={() => {
                  const resultCount = calculateResultCount(searchQuery, selectedCategory, selectedProduct);
                  setAppliedSearchQuery(searchQuery);
                  setAppliedCategory(selectedCategory);
                  setAppliedProduct(selectedProduct);
                  saveSearchToHistory(resultCount);
                  setShowSearchHistory(false);
                  setAnimationKey(prev => prev + 1);
                }}
                className="bg-slate-600 hover:bg-slate-700 text-white whitespace-nowrap"
              >
                Search Vendors
              </Button>

              {/* Clear Button */}
              {(appliedSearchQuery || appliedCategory !== "all" || appliedProduct !== "all") && (
                <Button 
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setSelectedProduct("all");
                    setAppliedSearchQuery("");
                    setAppliedCategory("all");
                    setAppliedProduct("all");
                    setAnimationKey(prev => prev + 1);
                  }}
                  variant="outline"
                  className="border-slate-400 text-slate-900 hover:bg-slate-100 bg-white whitespace-nowrap"
                >
                  Clear Search
                </Button>
              )}

              {/* Favorites Filter */}
              {isLoggedIn && favorites.length > 0 && (
                <Button 
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  variant={showFavoritesOnly ? "default" : "outline"}
                  className={showFavoritesOnly 
                    ? "bg-red-500 hover:bg-red-600 text-white whitespace-nowrap" 
                    : "border-slate-400 text-slate-900 hover:bg-slate-100 bg-white whitespace-nowrap"
                  }
                >
                  <Heart className={`w-4 h-4 mr-2 ${showFavoritesOnly ? "fill-white" : ""}`} />
                  {showFavoritesOnly ? "Show All" : `Favorites (${favorites.length})`}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Comparison Bar */}
      {compareList.length > 0 && (
        <div className="bg-blue-600 border-b border-blue-700 sticky top-[120px] z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <span className="text-white font-medium text-sm sm:text-base">
                  Comparing {compareList.length} vendor{compareList.length > 1 ? "s" : ""}
                </span>
                <div className="flex flex-wrap gap-2">
                  {compareList.map((vendorName, index) => (
                    <span key={index} className="bg-white/20 text-white px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm flex items-center gap-2">
                      <span className="truncate max-w-[120px] sm:max-w-none">{vendorName}</span>
                      <button onClick={() => toggleCompare(vendorName)} className="hover:text-red-200 flex-shrink-0">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                  onClick={() => setShowComparison(true)}
                  className="bg-white text-blue-600 hover:bg-blue-50 flex-1 sm:flex-none text-sm sm:text-base py-2 sm:py-2"
                  disabled={compareList.length < 2}
                >
                  View Comparison
                </Button>
                <Button 
                  onClick={() => setCompareList([])}
                  variant="ghost"
                  className="text-white hover:bg-blue-700 text-sm sm:text-base py-2 sm:py-2"
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Vendors Grid */}
        <main>
          <motion.div 
            key={`count-${animationKey}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <div className="text-2xl font-bold text-neutral-900">
              Showing {filteredVendors.length} vendor{filteredVendors.length !== 1 ? 's' : ''}
            </div>
            {(searchQuery || selectedCategory !== "all" || selectedProduct !== "all") && (
              <div className="mt-2 text-base text-slate-600 flex flex-wrap items-center gap-2">
                <span>for:</span>
                {searchQuery && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                    "{searchQuery}"
                  </span>
                )}
                {selectedCategory !== "all" && (
                  <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full font-medium">
                    Category: {selectedCategory}
                  </span>
                )}
                {selectedProduct !== "all" && (
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-medium">
                    Product: {selectedProduct}
                  </span>
                )}
              </div>
            )}
          </motion.div>

          {filteredVendors.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-slate-200 rounded-2xl border border-slate-300 p-12 text-center"
            >
              <p className="text-slate-500">No vendors found matching your search.</p>
            </motion.div>
          ) : (
            <div className="space-y-12">
              {Object.entries(vendorsByCategory).map(([category, vendors], categoryIndex) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: categoryIndex * 0.1, duration: 0.4 }}
                >
                  {/* Category Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">{category}</h2>
                    <span className="text-sm text-slate-500 bg-slate-200 px-3 py-1 rounded-full">
                      {vendors.length} vendor{vendors.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Vendors Grid for this Category */}
                  <motion.div 
                    key={`results-${animationKey}-${category}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {vendors.map((vendor, index) => {
                const colorClass = getCategoryColor(vendor.Category);
                return (
                <motion.div
                  key={index}
                  data-testid="vendor-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02, duration: 0.3 }}
                  onClick={() => {
                    setSelectedVendor(vendor);
                    setShowModal(true);
                    setShowReviewForm(false);
                    setShowNoteForm(false);
                    setShowReviews(false);
                    // Load existing review for this vendor
                    const vendorName = vendor["Company Name"];
                    const userEmail = localStorage.getItem("userEmail");
                    const reviews = vendorReviews[vendorName] || [];
                    const userReview = reviews.find(r => r.userEmail === userEmail);
                    if (userReview) {
                      setUserRating(userReview.rating);
                      setUserComment(userReview.comment || "");
                    } else {
                      setUserRating(0);
                      setUserComment("");
                    }
                    // Load existing note
                    setCurrentNote(vendorNotes[vendorName] || "");
                  }}
                  className="bg-slate-50 rounded-xl shadow-md border border-slate-200 hover:shadow-xl hover:border-blue-400 transition-all cursor-pointer overflow-hidden group"
                >
                  {/* Colored Header with Company Name */}
                  <div className={`${colorClass} p-3 relative`}>
                    {/* Action Buttons */}
                    <div className="absolute top-2 right-2 flex gap-1" onClick={(e) => e.stopPropagation()}>
                      {isLoggedIn && (
                        <>
                          <button
                            onClick={() => toggleFavorite(vendor["Company Name"])}
                            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all"
                            title={favorites.includes(vendor["Company Name"]) ? "Remove from favorites" : "Add to favorites"}
                          >
                            <Heart 
                              className={`w-4 h-4 ${favorites.includes(vendor["Company Name"]) ? "fill-red-500 text-red-500" : "text-white"}`}
                            />
                          </button>
                          <button
                            onClick={() => toggleCompare(vendor["Company Name"])}
                            className={`px-2 py-1 rounded-lg backdrop-blur-sm transition-all text-xs font-medium ${
                              compareList.includes(vendor["Company Name"]) 
                                ? "bg-blue-500 text-white hover:bg-blue-600" 
                                : "bg-white/20 hover:bg-white/30 text-white"
                            }`}
                            title={compareList.includes(vendor["Company Name"]) ? "Remove from comparison" : "Add to comparison"}
                          >
                            {compareList.includes(vendor["Company Name"]) ? "✓ Compare" : "Compare"}
                          </button>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-base font-bold text-white line-clamp-1 group-hover:text-blue-50 transition-colors">
                        {appliedSearchQuery ? highlightText(vendor["Company Name"], appliedSearchQuery) : vendor["Company Name"]}
                      </h3>
                      {vendorReviews[vendor["Company Name"]] && 
                       vendorReviews[vendor["Company Name"]].filter(r => r.rating && r.rating > 0).length > 0 && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= Math.round(calculateAverageRating(vendor["Company Name"]))
                                    ? "fill-yellow-300 text-yellow-300"
                                    : "text-white/30"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-white/90 font-medium">
                            {calculateAverageRating(vendor["Company Name"])}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {vendor.Category ? (
                        vendor.Category.split(';').slice(0, 2).map((cat, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white font-medium backdrop-blur-sm"
                          >
                            {appliedSearchQuery ? highlightText(cat.trim(), appliedSearchQuery) : cat.trim()}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white font-medium">
                          Vendor
                        </span>
                      )}
                      {vendor.Category && vendor.Category.split(';').length > 2 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/30 text-white font-medium">
                          +{vendor.Category.split(';').length - 2}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3">
                    {vendor["Products Offered"] && (
                      <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                        {appliedSearchQuery ? highlightText(vendor["Products Offered"], appliedSearchQuery) : vendor["Products Offered"]}
                      </p>
                    )}

                    {/* Quick Info Icons */}
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      {vendor.Phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                        </div>
                      )}
                      {vendor.Email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                        </div>
                      )}
                      {vendor.Website && (
                        <div className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                        </div>
                      )}
                      <span className="ml-auto text-blue-600 font-medium group-hover:translate-x-0.5 transition-transform">
                        Details →
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
              })}
                </motion.div>
              </motion.div>
            ))}
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
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
                {isLoggedIn && (
                  <div className="flex gap-2 mt-3">
                    <Button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                    >
                      {showReviewForm ? "Hide Review Form" : (
                        vendorReviews[selectedVendor["Company Name"]]?.some(r => r.userEmail === localStorage.getItem("userEmail") && r.rating > 0)
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
                )}
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-slate-900 text-2xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            {/* Review Form Section */}
            {showReviewForm && isLoggedIn && (
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
            {showNoteForm && isLoggedIn && (
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
                        onClick={() => {
                          setCurrentNote("");
                          const updatedNotes = { ...vendorNotes };
                          delete updatedNotes[selectedVendor["Company Name"]];
                          setVendorNotes(updatedNotes);
                          localStorage.setItem("vendorNotes", JSON.stringify(updatedNotes));
                          alert("Note deleted!");
                          setShowNoteForm(false);
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
                        onClick={() => trackContact(selectedVendor["Company Name"], "phone")}
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
                        onClick={() => trackContact(selectedVendor["Company Name"], "email")}
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
                        onClick={() => trackContact(selectedVendor["Company Name"], "website")}
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
                <h2 className="text-2xl font-bold text-slate-900">Vendor Comparison</h2>
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
                              <p className="text-slate-700 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {vendor.Email}
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
    </div>
  );
export default Vendors;