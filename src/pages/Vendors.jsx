import React, { useState, useMemo } from "react";
import { Search, MapPin, Phone, Mail, Globe, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import vendorsData from "@/data/vendors.json";

export default function Vendors() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
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

  // Filter vendors based on search query, selected field, category, and product
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

    // Then filter by search query
    if (searchQuery !== "") {
      const query = searchQuery.toLowerCase();
      
      results = results.filter(vendor => {
        switch (searchField) {
          case "company":
            return vendor["Company Name"]?.toLowerCase().includes(query);
          case "category":
            return vendor.Category?.toLowerCase().includes(query);
          case "tags":
            return vendor["Category Tags"]?.toLowerCase().includes(query);
          case "keywords":
            return vendor["Search Keywords"]?.toLowerCase().includes(query);
          case "all":
          default:
            return (
              vendor["Company Name"]?.toLowerCase().includes(query) ||
              vendor.Category?.toLowerCase().includes(query) ||
              vendor["Category Tags"]?.toLowerCase().includes(query) ||
              vendor["Search Keywords"]?.toLowerCase().includes(query)
            );
        }
      });
    }

    return results;
  }, [searchQuery, searchField, selectedCategory, selectedProduct]);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Vendor Directory</h1>
              <p className="text-neutral-600 mt-1">
                Search through {vendorsData.length} eye care vendors and suppliers
              </p>
            </div>
            <Button variant="outline" onClick={() => window.location.href = "/"}>
              ← Back to Home
            </Button>
          </div>

          {/* Search Controls */}
          <div className="space-y-3">
            {/* Search Field Selector and Category Filter */}
            <div className="flex gap-2 flex-wrap items-center">
              <button
                onClick={() => setSearchField("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  searchField === "all"
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                All Fields
              </button>
              <button
                onClick={() => setSearchField("company")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  searchField === "company"
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                Company Name
              </button>
              <button
                onClick={() => setSearchField("category")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  searchField === "category"
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                Category
              </button>
              <button
                onClick={() => setSearchField("tags")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  searchField === "tags"
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                Category Tags
              </button>
              <button
                onClick={() => setSearchField("keywords")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  searchField === "keywords"
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                Search Keywords
              </button>

              {/* Category Dropdown */}
              <div className="relative ml-auto">
                <button
                  onClick={() => {
                    setShowCategoryDropdown(!showCategoryDropdown);
                    setShowProductDropdown(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  {selectedCategory === "all" ? "All Categories" : selectedCategory}
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {showCategoryDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-neutral-200 z-20">
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
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                  >
                    {selectedProduct === "all" ? "All Products" : selectedProduct}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {showProductDropdown && (
                    <div className="absolute right-0 mt-2 w-64 max-h-96 overflow-y-auto bg-white rounded-lg shadow-lg border border-neutral-200 z-20">
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
                placeholder={`Search ${searchField === "all" ? "all fields" : searchField}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent"
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
            <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
              <p className="text-neutral-500">No vendors found matching your search.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredVendors.map((vendor, index) => (
                  <Card key={index} className="rounded-2xl hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-xl">{vendor["Company Name"]}</CardTitle>
                      {vendor.Category && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {vendor.Category.split(';').map((cat, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-1 rounded-full bg-neutral-100 border border-neutral-200"
                            >
                              {cat.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {vendor.Notes && (
                        <p className="text-sm text-neutral-600">{vendor.Notes}</p>
                      )}

                      {vendor["Products Offered"] && (
                        <div>
                          <p className="text-xs font-semibold text-neutral-500 uppercase mb-1">
                            Products
                          </p>
                          <p className="text-sm text-neutral-700">{vendor["Products Offered"]}</p>
                        </div>
                      )}

                      <div className="pt-3 border-t border-neutral-100 space-y-2">
                        {vendor.Address && (
                          <div className="flex items-start gap-2 text-sm text-neutral-600">
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{vendor.Address}</span>
                          </div>
                        )}
                        {vendor.Phone && (
                          <div className="flex items-center gap-2 text-sm text-neutral-600">
                            <Phone className="w-4 h-4 flex-shrink-0" />
                            <a href={`tel:${vendor.Phone}`} className="hover:text-neutral-900">
                              {vendor.Phone}
                            </a>
                          </div>
                        )}
                        {vendor.Email && (
                          <div className="flex items-center gap-2 text-sm text-neutral-600">
                            <Mail className="w-4 h-4 flex-shrink-0" />
                            <a href={`mailto:${vendor.Email}`} className="hover:text-neutral-900">
                              {vendor.Email}
                            </a>
                          </div>
                        )}
                        {vendor.Website && (
                          <div className="flex items-center gap-2 text-sm">
                            <Globe className="w-4 h-4 flex-shrink-0" />
                            <a
                              href={vendor.Website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-neutral-900 hover:underline font-medium"
                            >
                              Visit Website
                            </a>
                          </div>
                        )}
                      </div>
                    </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
