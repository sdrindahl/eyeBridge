import React, { useState, useMemo } from "react";
import { Search, MapPin, Phone, Mail, Globe, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import vendorsData from "@/data/vendors.json";

export default function Vendors() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showModal, setShowModal] = useState(false);

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

    return results;
  }, [searchQuery, selectedCategory, selectedProduct]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-600 border-b border-blue-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <img src="/logo.jpg" alt="Eye Bridges Logo" className="h-20 w-auto" />
              <div>
                <h1 className="text-3xl font-bold text-white">Vendor Directory</h1>
                <p className="text-blue-100 mt-1">
                  Search through {vendorsData.length} eye care vendors and suppliers
                </p>
              </div>
            </div>
            <Button variant="outline" className="border-white text-white hover:bg-blue-800" onClick={() => window.location.href = "/"}>
              ← Back to Home
            </Button>
          </div>

          {/* Search Controls */}
          <div className="space-y-3">
            {/* Filter Dropdowns */}
            <div className="flex gap-2 flex-wrap items-center">
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
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by company name, products, category, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent bg-slate-100 text-slate-800"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Vendors Grid */}
        <main>
          <div className="mb-4 text-sm text-neutral-600">
            Showing {filteredVendors.length} vendor{filteredVendors.length !== 1 ? 's' : ''}
          </div>

          {filteredVendors.length === 0 ? (
            <div className="bg-slate-200 rounded-2xl border border-slate-300 p-12 text-center">
              <p className="text-slate-500">No vendors found matching your search.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredVendors.map((vendor, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setSelectedVendor(vendor);
                    setShowModal(true);
                  }}
                  className="bg-slate-200 border border-slate-300 rounded-xl p-4 hover:shadow-lg hover:border-teal-400 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{vendor["Company Name"]}</h3>
                      {vendor["Products Offered"] && (
                        <p className="text-sm text-slate-600 line-clamp-2">
                          <span className="font-semibold">Products: </span>
                          {vendor["Products Offered"]}
                        </p>
                      )}
                    </div>
                    {vendor.Category && (
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {vendor.Category.split(';').slice(0, 2).map((cat, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-1 rounded-full bg-teal-100 text-teal-700 border border-teal-300"
                          >
                            {cat.trim()}
                          </span>
                        ))}
                        {vendor.Category.split(';').length > 2 && (
                          <span className="text-xs px-2 py-1 rounded-full bg-slate-300 text-slate-700">
                            +{vendor.Category.split(';').length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
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
            className="bg-slate-100 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
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
                  <h3 className="text-sm font-semibold text-slate-500 uppercase mb-2">About</h3>
                  <p className="text-slate-700">{selectedVendor.Notes}</p>
                </div>
              )}

              {selectedVendor["Products Offered"] && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase mb-2">Products Offered</h3>
                  <p className="text-slate-700">{selectedVendor["Products Offered"]}</p>
                </div>
              )}

              {selectedVendor["Category Tags"] && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase mb-2">Tags</h3>
                  <p className="text-slate-700">{selectedVendor["Category Tags"]}</p>
                </div>
              )}

              <div className="border-t border-slate-300 pt-6 space-y-4">
                <h3 className="text-sm font-semibold text-slate-500 uppercase">Contact Information</h3>
                
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
                      <a href={`tel:${selectedVendor.Phone}`} className="text-slate-700 hover:text-teal-600">
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
                      <a href={`mailto:${selectedVendor.Email}`} className="text-slate-700 hover:text-teal-600">
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