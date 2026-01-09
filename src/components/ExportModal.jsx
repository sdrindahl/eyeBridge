import React, { useState, useMemo } from "react";
import {
  X,
  Download,
  Mail,
  Printer,
  Copy,
  Trash2,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  generateComparisonCSV,
  downloadCSV,
  printComparison,
  saveSnapshot,
  loadSnapshots,
  deleteSnapshot,
  createShareLink,
  generateShareEmailBody,
  generateExportFilename,
  getDefaultExportFields,
  exportSnapshotAsCSV,
} from "@/lib/export";

export default function ExportModal({
  isOpen = false,
  onClose = () => {},
  vendors = [],
}) {
  const [exportFormat, setExportFormat] = useState("csv"); // csv, print, pdf
  const [selectedFields, setSelectedFields] = useState(
    getDefaultExportFields()
  );
  const [snapshots, setSnapshots] = useState(loadSnapshots());
  const [snapshotName, setSnapshotName] = useState("");
  const [shareEmail, setShareEmail] = useState("");
  const [showShareForm, setShowShareForm] = useState(false);
  const [copied, setCopied] = useState(false);

  const allFields = useMemo(() => getDefaultExportFields(), []);

  const handleToggleField = (field) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  const handleExportCSV = () => {
    const csv = generateComparisonCSV(vendors, selectedFields);
    const filename = generateExportFilename("csv");
    downloadCSV(csv, filename);
    onClose();
  };

  const handlePrint = () => {
    printComparison(vendors, selectedFields);
    onClose();
  };

  const handleSaveSnapshot = () => {
    if (!snapshotName.trim()) {
      alert("Please enter a name for the snapshot");
      return;
    }
    saveSnapshot(vendors, snapshotName);
    setSnapshots(loadSnapshots());
    setSnapshotName("");
    alert("Snapshot saved successfully!");
  };

  const handleDeleteSnapshot = (snapshotId) => {
    if (confirm("Are you sure you want to delete this snapshot?")) {
      deleteSnapshot(snapshotId);
      setSnapshots(loadSnapshots());
    }
  };

  const handleShare = () => {
    if (!shareEmail.trim()) {
      alert("Please enter an email address");
      return;
    }
    const shareInfo = createShareLink(vendors, shareEmail);
    const emailBody = generateShareEmailBody(vendors, shareInfo);
    
    // Open email client (mock - would integrate with backend for real sharing)
    const subject = "Vendor Comparison from eyeBridge";
    const mailtoLink = `mailto:${shareEmail}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoLink;
    
    setShareEmail("");
    setShowShareForm(false);
    onClose();
  };

  const handleCopyShareLink = () => {
    const shareInfo = createShareLink(vendors, "");
    const shareLink = `${window.location.origin}/comparison?share=${shareInfo.shareId}`;
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-slate-900">Export Comparison</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Export Format</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setExportFormat("csv")}
                className={`p-3 rounded-lg border-2 transition ${
                  exportFormat === "csv"
                    ? "border-amber-500 bg-amber-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <Download className="w-4 h-4 mb-1 mx-auto" />
                <p className="text-sm font-medium">CSV Export</p>
              </button>
              <button
                onClick={() => setExportFormat("print")}
                className={`p-3 rounded-lg border-2 transition ${
                  exportFormat === "print"
                    ? "border-amber-500 bg-amber-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <Printer className="w-4 h-4 mb-1 mx-auto" />
                <p className="text-sm font-medium">Print</p>
              </button>
              <button
                onClick={() => setExportFormat("share")}
                className={`p-3 rounded-lg border-2 transition ${
                  exportFormat === "share"
                    ? "border-amber-500 bg-amber-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <Mail className="w-4 h-4 mb-1 mx-auto" />
                <p className="text-sm font-medium">Share</p>
              </button>
            </div>
          </div>

          {/* Field Selection (CSV only) */}
          {exportFormat === "csv" && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">
                Fields to Include
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allFields.map((field) => (
                  <label key={field} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFields.includes(field)}
                      onChange={() => handleToggleField(field)}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <span className="text-sm text-slate-700">{field}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* CSV Export Button */}
          {exportFormat === "csv" && (
            <Button
              onClick={handleExportCSV}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white gap-2"
            >
              <Download className="w-4 h-4" />
              Export as CSV
            </Button>
          )}

          {/* Print Button */}
          {exportFormat === "print" && (
            <Button
              onClick={handlePrint}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <Printer className="w-4 h-4" />
              Open Print Preview
            </Button>
          )}

          {/* Share Section */}
          {exportFormat === "share" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <Button
                onClick={handleShare}
                className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
              >
                <Mail className="w-4 h-4" />
                Send Comparison
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">Or</span>
                </div>
              </div>

              <Button
                onClick={handleCopyShareLink}
                variant="outline"
                className="w-full gap-2 border-slate-300"
              >
                <Copy className="w-4 h-4" />
                {copied ? "Copied!" : "Copy Share Link"}
              </Button>
            </div>
          )}

          {/* Save Snapshot Section */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="font-semibold text-slate-900 mb-3">
              Save as Snapshot
            </h3>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={snapshotName}
                onChange={(e) => setSnapshotName(e.target.value)}
                placeholder="e.g., Summer 2024 Review"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <Button
                onClick={handleSaveSnapshot}
                variant="outline"
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </Button>
            </div>

            {snapshots.length > 0 && (
              <div>
                <p className="text-sm text-slate-600 mb-2 font-medium">
                  Saved Snapshots ({snapshots.length})
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {snapshots.map((snapshot) => (
                    <div
                      key={snapshot.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {snapshot.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {snapshot.vendorCount} vendors •{" "}
                          {new Date(snapshot.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const csv = exportSnapshotAsCSV(snapshot);
                            downloadCSV(csv, `${snapshot.name}.csv`);
                          }}
                          className="p-1 text-slate-400 hover:text-amber-600 transition"
                          title="Export snapshot"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSnapshot(snapshot.id)}
                          className="p-1 text-slate-400 hover:text-red-600 transition"
                          title="Delete snapshot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 flex justify-end gap-3 sticky bottom-0 bg-slate-50">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-slate-300"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
