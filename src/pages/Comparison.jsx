import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Download, Share2, Trash2, Phone, Mail, Globe, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import vendorsData from "@/data/vendors.json";

export default function Comparison() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get vendor names from URL parameters
  useEffect(() => {
    const vendors = searchParams.getAll("vendors");
    if (vendors.length === 0) {
      // Check localStorage as fallback
      const stored = localStorage.getItem("comparisonList");
      if (stored) {
        setSelectedVendors(JSON.parse(stored));
      } else {
        navigate("/vendors");
        return;
      }
    } else {
      setSelectedVendors(vendors);
    }
    setLoading(false);
  }, [searchParams, navigate]);

  const getVendorData = (vendorName) => {
    return vendorsData.find(v => v["Company Name"] === vendorName);
  };

  const vendors = selectedVendors.map(getVendorData).filter(Boolean);

  const handleRemoveVendor = (vendorName) => {
    const updated = selectedVendors.filter(v => v !== vendorName);
    setSelectedVendors(updated);
    localStorage.setItem("comparisonList", JSON.stringify(updated));
  };

  const handleExportCSV = () => {
    // Create CSV content
    const headers = ["Field", ...vendors.map(v => v["Company Name"])];
    const fields = [
      "Category",
      "Products Offered",
      "Phone",
      "Email",
      "Website",
      "Address",
      "Notes"
    ];

    const csvContent = [
      headers.join(","),
      ...fields.map(field => {
        const values = [field, ...vendors.map(vendor => {
          const value = vendor[field] || "";
          // Escape quotes and wrap in quotes if contains comma
          return `"${String(value).replace(/"/g, '""')}"`;
        })];
        return values.join(",");
      })
    ].join("\n");

    // Download
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent));
    element.setAttribute("download", `eyebridge-comparison-${new Date().toISOString().split('T')[0]}.csv`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleShare = () => {
    const vendorList = selectedVendors.join(",");
    const url = `${window.location.origin}/comparison?vendors=${vendorList}`;
    navigator.clipboard.writeText(url);
    alert("Comparison link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <p className="text-slate-600">Loading comparison...</p>
      </div>
    );
  }

  if (vendors.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate("/vendors")}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Vendors
          </button>
          <div className="text-center py-12">
            <p className="text-xl text-slate-600 mb-4">No vendors to compare</p>
            <Button onClick={() => navigate("/vendors")}>
              Browse Vendors
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/vendors")}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Vendor Comparison
                </h1>
                <p className="text-sm text-slate-600">
                  Comparing {vendors.length} vendor{vendors.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleShare}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              <Button
                onClick={handleExportCSV}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Vendor Cards Overview */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {vendors.map((vendor) => (
            <div
              key={vendor["Company Name"]}
              className="bg-white rounded-lg border border-slate-200 p-4 relative group border-l-4 border-l-slate-600"
            >
              <button
                onClick={() => handleRemoveVendor(vendor["Company Name"])}
                className="absolute top-2 right-2 p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove from comparison"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <h3 className="font-bold text-slate-900 mb-2 pr-6">
                {vendor["Company Name"]}
              </h3>
              <div className="space-y-1 text-xs text-slate-600">
                <p className="line-clamp-2">{vendor.Category}</p>
                {vendor["Products Offered"] && (
                  <p className="line-clamp-2">{vendor["Products Offered"]}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle>Detailed Comparison</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left px-4 py-3 font-semibold text-slate-900 sticky left-0 bg-slate-50 w-32 min-w-[130px]">
                      Attribute
                    </th>
                    {vendors.map((vendor) => (
                      <th
                        key={vendor["Company Name"]}
                        className="text-left px-4 py-3 font-semibold text-slate-900 min-w-[250px]"
                      >
                        {vendor["Company Name"]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Category */}
                  <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-700 sticky left-0 bg-slate-50 w-32 min-w-[130px]">
                      Category
                    </td>
                    {vendors.map((vendor) => (
                      <td key={vendor["Company Name"]} className="px-4 py-3 text-slate-600">
                        {vendor.Category || "—"}
                      </td>
                    ))}
                  </tr>

                  {/* Products Offered */}
                  <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-700 sticky left-0 bg-slate-50 w-32 min-w-[130px]">
                      Products
                    </td>
                    {vendors.map((vendor) => (
                      <td key={vendor["Company Name"]} className="px-4 py-3 text-slate-600">
                        {vendor["Products Offered"] || "—"}
                      </td>
                    ))}
                  </tr>

                  {/* Phone */}
                  <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-700 sticky left-0 bg-slate-50 w-32 min-w-[130px]">
                      Phone
                    </td>
                    {vendors.map((vendor) => (
                      <td key={vendor["Company Name"]} className="px-4 py-3 text-slate-600">
                        {vendor.Phone ? (
                          <a
                            href={`tel:${vendor.Phone}`}
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            {vendor.Phone}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Email */}
                  <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-700 sticky left-0 bg-slate-50 w-32 min-w-[130px]">
                      Email
                    </td>
                    {vendors.map((vendor) => (
                      <td key={vendor["Company Name"]} className="px-4 py-3 text-slate-600">
                        {vendor.Email ? (
                          <a
                            href={`mailto:${vendor.Email}`}
                            className="text-blue-600 hover:underline flex items-center gap-1 break-all"
                          >
                            <Mail className="w-3 h-3 flex-shrink-0" />
                            <span className="text-xs">{vendor.Email}</span>
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Website */}
                  <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-700 sticky left-0 bg-slate-50 w-32 min-w-[130px]">
                      Website
                    </td>
                    {vendors.map((vendor) => (
                      <td key={vendor["Company Name"]} className="px-4 py-3 text-slate-600">
                        {vendor.Website ? (
                          <a
                            href={vendor.Website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1 break-all"
                          >
                            <Globe className="w-3 h-3 flex-shrink-0" />
                            <span className="text-xs">{vendor.Website}</span>
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Address */}
                  <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-700 sticky left-0 bg-slate-50 w-32 min-w-[130px]">
                      Address
                    </td>
                    {vendors.map((vendor) => (
                      <td key={vendor["Company Name"]} className="px-4 py-3 text-slate-600">
                        {vendor.Address ? (
                          <span className="flex items-start gap-1">
                            <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" />
                            <span className="text-xs">{vendor.Address}</span>
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Notes */}
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-700 sticky left-0 bg-slate-50 w-32 min-w-[130px] align-top">
                      Notes
                    </td>
                    {vendors.map((vendor) => (
                      <td key={vendor["Company Name"]} className="px-4 py-3 text-slate-600">
                        {vendor.Notes || "—"}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
