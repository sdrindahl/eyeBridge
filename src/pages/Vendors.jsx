import React, { useState, useMemo, useEffect } from "react";
import { Search, MapPin, Phone, Mail, Globe, ChevronDown, Heart, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import vendorsData from "@/data/vendors.json";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Vendors() {
  const navigate = useNavigate();
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [compareList, setCompareList] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

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

  // Filter vendors based on search query, category, and product
  const filteredVendors = useMemo(() => {
    let results = vendorsData;

    // First filter by category
    if (selectedCategory !== "all") {
      results = results.filter(vendor => 
        vendor.Category?.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Then filter by product type
    if (selectedProduct !== "all") {
      results = results.filter(vendor => 
        vendor["Products Offered"]?.includes(selectedProduct)
      );
    }

    // Then filter by search query (searches all fields)
    if (searchQuery !== "") {
      const query = searchQuery.toLowerCase();
      
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
  }, [searchQuery, selectedCategory, selectedProduct, showFavoritesOnly, favorites]);

  // Load favorites and login state
  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);
    
    if (loggedIn) {
      const storedFavorites = JSON.parse(localStorage.getItem("favorites") || "[]");
      setFavorites(storedFavorites);
    }
  }, []);

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

  const toggleFavorite = (vendorName) => {
    if (!isLoggedIn) {
      alert("Please log in to save favorites");
      return;
    }

    const newFavorites = favorites.includes(vendorName)
      ? favorites.filter(f => f !== vendorName)
      : [...favorites, vendorName];
    
    setFavorites(newFavorites);
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
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

  return (
    <div className="min-h-screen bg-slate-300">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-700 to-slate-600 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <img src="/logo.jpg" alt="Eye Bridges Logo" className="h-20 w-auto" />
              <div>
                <h1 className="text-3xl font-bold text-white">Vendor Directory</h1>
                <p className="text-slate-200 mt-1">
                  Search through {vendorsData.length} eye care vendors and suppliers
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isLoggedIn ? (
                <>
                  <Button 
                    onClick={() => navigate("/dashboard")}
                    variant="ghost" 
                    className="text-white hover:bg-slate-800"
                  >
                    Dashboard
                  </Button>
                  <Button 
                    onClick={() => {
                      localStorage.removeItem("isLoggedIn");
                      localStorage.removeItem("userEmail");
                      navigate("/");
                    }}
                    variant="outline" 
                    className="border-white text-white hover:bg-slate-800"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => navigate("/login")}
                  variant="outline" 
                  className="border-white text-white hover:bg-slate-800"
                >
                  Login to Your Dashboard
                </Button>
              )}
            </div>
          </div>

          {/* Search Controls */}
          <div className="space-y-3">
            {/* Filter Dropdowns */}
            <div className="flex gap-2 flex-wrap items-center">
              {/* Back to Dashboard Button */}
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
              
              {/* Category Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowCategoryDropdown(!showCategoryDropdown);
                    setShowProductDropdown(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-teal-500 text-white hover:bg-teal-600 transition-colors"
                >
                  {selectedCategory === "all" ? "All Categories" : selectedCategory}
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {showCategoryDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-100 rounded-lg shadow-lg border border-slate-300 z-20">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setSelectedCategory("all");
                          setSelectedProduct("all");
                          setShowCategoryDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-neutral-100 ${
                          selectedCategory === "all" ? "bg-neutral-50 font-medium" : ""
                        }`}
                      >
                        All Categories
                      </button>
                      {categoryOptions.slice(1).map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            setSelectedCategory(category);
                            setSelectedProduct("all");
                            setShowCategoryDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-neutral-100 ${
                            selectedCategory === category ? "bg-neutral-50 font-medium" : ""
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Product Type Dropdown - Only show when category is selected */}
              {selectedCategory !== "all" && (
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowProductDropdown(!showProductDropdown);
                      setShowCategoryDropdown(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
                  >
                    {selectedProduct === "all" ? "All Products" : selectedProduct}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {showProductDropdown && (
                    <div className="absolute right-0 mt-2 w-64 max-h-96 overflow-y-auto bg-slate-100 rounded-lg shadow-lg border border-slate-300 z-20">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setSelectedProduct("all");
                            setShowProductDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-neutral-100 ${
                            selectedProduct === "all" ? "bg-neutral-50 font-medium" : ""
                          }`}
                        >
                          All Products
                        </button>
                        {productOptions.slice(1).map((product) => (
                          <button
                            key={product}
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowProductDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-neutral-100 ${
                              selectedProduct === product ? "bg-neutral-50 font-medium" : ""
                            }`}
                          >
                            {product}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Search Bar */}
            <div className="flex gap-2 items-center">
              <div className="relative max-w-xl">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search vendors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent bg-slate-200 text-slate-800"
                />
              </div>
              {(searchQuery || selectedCategory !== "all" || selectedProduct !== "all") && (
                <Button 
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setSelectedProduct("all");
                  }}
                  variant="outline"
                  className="px-6 py-3 whitespace-nowrap border-slate-400 text-slate-900 hover:bg-slate-200 bg-white"
                >
                  Clear Search
                </Button>
              )}
              {isLoggedIn && favorites.length > 0 && (
                <Button 
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  variant={showFavoritesOnly ? "default" : "outline"}
                  className={showFavoritesOnly 
                    ? "px-6 py-3 whitespace-nowrap bg-red-500 hover:bg-red-600 text-white" 
                    : "px-6 py-3 whitespace-nowrap border-slate-400 text-slate-900 hover:bg-slate-200 bg-white"
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-white font-medium">
                  Comparing {compareList.length} vendor{compareList.length > 1 ? "s" : ""}
                </span>
                <div className="flex gap-2">
                  {compareList.map((vendorName, index) => (
                    <span key={index} className="bg-white/20 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-2">
                      {vendorName}
                      <button onClick={() => toggleCompare(vendorName)} className="hover:text-red-200">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowComparison(true)}
                  className="bg-white text-blue-600 hover:bg-blue-50"
                  disabled={compareList.length < 2}
                >
                  View Comparison
                </Button>
                <Button 
                  onClick={() => setCompareList([])}
                  variant="ghost"
                  className="text-white hover:bg-blue-700"
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
            <motion.div 
              key={`results-${animationKey}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredVendors.map((vendor, index) => {
                const colorClass = getCategoryColor(vendor.Category);
                return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02, duration: 0.3 }}
                  onClick={() => {
                    setSelectedVendor(vendor);
                    setShowModal(true);
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
                    <h3 className="text-base font-bold text-white mb-2 line-clamp-1 group-hover:text-blue-50 transition-colors pr-20">
                      {vendor["Company Name"]}
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {vendor.Category ? (
                        vendor.Category.split(';').slice(0, 2).map((cat, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white font-medium backdrop-blur-sm"
                          >
                            {cat.trim()}
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
                        {vendor["Products Offered"]}
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
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-slate-900 text-2xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
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

              {/* Add Note Section */}
              {isLoggedIn && (
                <div className="border-t border-slate-300 pt-6">
                  <h3 className="text-sm font-semibold text-slate-600 uppercase mb-3">Add Note</h3>
                  <textarea
                    id={`note-${selectedVendor["Company Name"]}`}
                    placeholder="Add a note about this vendor..."
                    className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white text-slate-800 text-sm"
                    rows="3"
                  />
                  <Button
                    onClick={() => {
                      const noteText = document.getElementById(`note-${selectedVendor["Company Name"]}`).value;
                      if (noteText.trim()) {
                        trackContact(selectedVendor["Company Name"], "note", noteText);
                        document.getElementById(`note-${selectedVendor["Company Name"]}`).value = "";
                        alert("Note saved!");
                      }
                    }}
                    className="mt-2 bg-slate-600 hover:bg-slate-700 text-white"
                  >
                    Save Note
                  </Button>
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
}