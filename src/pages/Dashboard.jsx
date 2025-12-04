import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Search, Phone, Mail, Globe, TrendingUp, Clock, Star, X, MapPin, Trash2, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import vendorsData from "@/data/vendors.json";

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
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    // Load user data
    setUserEmail(localStorage.getItem("userEmail") || "");
    
    // Load favorites
    const storedFavorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setFavorites(storedFavorites);

    // Load recent searches
    const storedSearches = JSON.parse(localStorage.getItem("recentSearches") || "[]");
    setRecentSearches(storedSearches);

    // Load contact history
    const storedContacts = JSON.parse(localStorage.getItem("contactHistory") || "[]");
    setContactHistory(storedContacts);

    // Load saved comparisons
    const storedComparisons = JSON.parse(localStorage.getItem("savedComparisons") || "[]");
    setSavedComparisons(storedComparisons);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    navigate("/");
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

  return (
    <div className="min-h-screen bg-slate-300">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-700 to-slate-600 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo.jpg" alt="Eye Bridges Logo" className="h-20 w-auto" />
              <span className="text-2xl font-bold text-white">Eye Bridges</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" className="text-white hover:bg-slate-800">
                  Home
                </Button>
              </Link>
              <Link to="/vendors">
                <Button variant="ghost" className="text-white hover:bg-slate-800">
                  Browse Vendors
                </Button>
              </Link>
              <div className="flex items-center gap-3 text-white">
                <span className="text-sm">{userEmail}</span>
                <Button onClick={handleLogout} variant="outline" className="border-white text-white hover:bg-slate-800">
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">My Dashboard</h1>
          <p className="text-slate-700 mt-2">Welcome back! Here's your personalized overview.</p>
          
          {/* Quick Search with Filters */}
          <div className="mt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Category Dropdown */}
              <div className="relative">
                <button
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
                  type="text"
                  placeholder="Search vendors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
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
              </div>

              {/* Clear Button */}
              {(searchQuery || selectedCategory !== "all" || selectedProduct !== "all") && (
                <Button
                  onClick={() => {
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card 
            className="bg-white border-slate-300 rounded-xl cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => document.getElementById('favorites-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Favorites</p>
                  <p className="text-3xl font-bold text-slate-900">{favorites.length}</p>
                </div>
                <Heart className="w-8 h-8 text-red-500 fill-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-white border-slate-300 rounded-xl cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => document.getElementById('searches-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Recent Searches</p>
                  <p className="text-3xl font-bold text-slate-900">{recentSearches.length}</p>
                </div>
                <Search className="w-8 h-8 text-slate-600" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-white border-slate-300 rounded-xl cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => document.getElementById('contacts-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Contacted</p>
                  <p className="text-3xl font-bold text-slate-900">{contactHistory.length}</p>
                </div>
                <Phone className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-white border-slate-300 rounded-xl cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => document.getElementById('comparisons-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Comparisons</p>
                  <p className="text-3xl font-bold text-slate-900">{savedComparisons.length}</p>
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
                        <p className="font-medium text-slate-900 pr-16">{vendor["Company Name"]}</p>
                        <p className="text-xs text-slate-600 mt-1">{vendor.Category}</p>
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
                          onClick={(e) => {
                            e.stopPropagation();
                            const newFavorites = favorites.filter(f => f !== vendor["Company Name"]);
                            setFavorites(newFavorites);
                            localStorage.setItem("favorites", JSON.stringify(newFavorites));
                            // Also remove from compare list if it's there
                            if (compareList.includes(vendor["Company Name"])) {
                              setCompareList(compareList.filter(v => v !== vendor["Company Name"]));
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

          {/* Contact History */}
          <Card id="contacts-section" className="bg-white border-slate-300 rounded-xl scroll-mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-green-600" />
                Recent Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contactHistory.length === 0 ? (
                <p className="text-slate-600 text-sm">No contact history yet</p>
              ) : (
                <div className="space-y-3">
                  {getContactedVendors().map((contact, index) => (
                    <div
                      key={index}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-slate-900">{contact.vendorName}</p>
                          <p className="text-xs text-slate-600 mt-1">
                            {contact.type === "phone" && "📞 Phone"}
                            {contact.type === "email" && "📧 Email"}
                            {contact.type === "website" && "🌐 Website"}
                            {contact.type === "note" && "📝 Note"}
                          </p>
                          {contact.note && (
                            <p className="text-xs text-slate-700 mt-2 italic">"{contact.note}"</p>
                          )}
                        </div>
                        <span className="text-xs text-slate-500">
                          {new Date(contact.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
