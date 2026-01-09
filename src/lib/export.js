/**
 * Export utility functions for vendor comparisons
 * Handles PDF/CSV export, sharing, and snapshot management
 */

/**
 * Generate CSV content from vendor comparison data
 * @param {Array} vendors - Array of vendor objects to compare
 * @param {Array} selectedFields - Fields to include in export
 * @returns {String} CSV formatted string
 */
export function generateComparisonCSV(vendors = [], selectedFields = []) {
  if (!vendors.length) return "";

  // Default fields if none selected
  if (!selectedFields.length) {
    selectedFields = [
      "Company Name",
      "Category",
      "Products Offered",
      "Phone",
      "Email",
      "Website",
      "Address",
    ];
  }

  // Create header row
  const headers = selectedFields.map((field) => `"${field}"`).join(",");

  // Create data rows
  const rows = vendors.map((vendor) => {
    return selectedFields
      .map((field) => {
        const value = vendor[field] || "";
        // Escape quotes and wrap in quotes if contains comma
        const escapedValue = String(value)
          .replace(/"/g, '""')
          .trim();
        return `"${escapedValue}"`;
      })
      .join(",");
  });

  return [headers, ...rows].join("\n");
}

/**
 * Download CSV file
 * @param {String} csvContent - CSV content string
 * @param {String} filename - Filename for download
 */
export function downloadCSV(csvContent, filename = "vendor-comparison.csv") {
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent)
  );
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

/**
 * Generate printable HTML for comparison
 * @param {Array} vendors - Array of vendor objects
 * @param {Array} selectedFields - Fields to include
 * @returns {String} HTML string
 */
export function generatePrintableHTML(vendors = [], selectedFields = []) {
  if (!vendors.length) return "";

  if (!selectedFields.length) {
    selectedFields = [
      "Company Name",
      "Category",
      "Products Offered",
      "Phone",
      "Email",
      "Website",
    ];
  }

  const date = new Date().toLocaleDateString();

  let html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Vendor Comparison</title>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #f59e0b;
            padding-bottom: 15px;
          }
          .header h1 {
            margin: 0 0 5px 0;
            color: #1f2937;
          }
          .header p {
            margin: 5px 0;
            color: #6b7280;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          thead {
            background: #f3f4f6;
          }
          th {
            padding: 12px;
            text-align: left;
            font-weight: 600;
            border: 1px solid #e5e7eb;
            color: #374151;
          }
          td {
            padding: 12px;
            border: 1px solid #e5e7eb;
            color: #1f2937;
            word-break: break-word;
          }
          tr:nth-child(even) {
            background: #f9fafb;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            color: #9ca3af;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
          }
          @media print {
            body { margin: 0; padding: 10px; }
            .no-print { display: none; }
            table { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Vendor Comparison Report</h1>
          <p>Generated on ${date}</p>
          <p>Comparing ${vendors.length} vendor(s)</p>
        </div>
        
        <table>
          <thead>
            <tr>
              ${selectedFields.map((field) => `<th>${field}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${vendors
              .map(
                (vendor) => `
              <tr>
                ${selectedFields
                  .map((field) => `<td>${vendor[field] || ""}</td>`)
                  .join("")}
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        
        <div class="footer">
          <p>eyeBridge Vendor Directory | www.eyebridge.com</p>
        </div>
      </body>
    </html>
  `;

  return html;
}

/**
 * Open print dialog with vendor comparison
 * @param {Array} vendors - Array of vendor objects
 * @param {Array} selectedFields - Fields to include
 */
export function printComparison(vendors = [], selectedFields = []) {
  const html = generatePrintableHTML(vendors, selectedFields);
  const printWindow = window.open("", "", "height=600,width=800");
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 250);
}

/**
 * Create a snapshot of current comparison
 * @param {Array} vendors - Array of vendor objects
 * @param {String} name - Name for the snapshot
 * @returns {Object} Snapshot object
 */
export function createSnapshot(vendors = [], name = "") {
  return {
    id: Date.now(),
    name: name || `Comparison ${new Date().toLocaleDateString()}`,
    vendors: vendors.map((v) => ({
      "Company Name": v["Company Name"],
      Category: v.Category,
      "Products Offered": v["Products Offered"],
      Phone: v.Phone,
      Email: v.Email,
      Website: v.Website,
      Address: v.Address,
    })),
    createdAt: new Date().toISOString(),
    vendorCount: vendors.length,
  };
}

/**
 * Save comparison snapshot to localStorage
 * @param {Array} vendors - Array of vendor objects
 * @param {String} name - Name for the snapshot
 */
export function saveSnapshot(vendors = [], name = "") {
  const snapshot = createSnapshot(vendors, name);
  const snapshots = JSON.parse(localStorage.getItem("comparisonSnapshots") || "[]");
  snapshots.unshift(snapshot);
  // Keep only last 20 snapshots
  const trimmed = snapshots.slice(0, 20);
  localStorage.setItem("comparisonSnapshots", JSON.stringify(trimmed));
  return snapshot;
}

/**
 * Load all comparison snapshots
 * @returns {Array} Array of snapshot objects
 */
export function loadSnapshots() {
  return JSON.parse(localStorage.getItem("comparisonSnapshots") || "[]");
}

/**
 * Load a specific snapshot by ID
 * @param {Number} snapshotId - ID of the snapshot
 * @returns {Object|null} Snapshot object or null
 */
export function loadSnapshot(snapshotId) {
  const snapshots = loadSnapshots();
  return snapshots.find((s) => s.id === snapshotId) || null;
}

/**
 * Delete a snapshot
 * @param {Number} snapshotId - ID of the snapshot to delete
 */
export function deleteSnapshot(snapshotId) {
  const snapshots = loadSnapshots();
  const filtered = snapshots.filter((s) => s.id !== snapshotId);
  localStorage.setItem("comparisonSnapshots", JSON.stringify(filtered));
}

/**
 * Create a shareable link for comparison (mock implementation)
 * @param {Array} vendors - Array of vendor objects
 * @param {String} email - Email to share with
 * @returns {Object} Share info object
 */
export function createShareLink(vendors = [], email = "") {
  // This is a mock - in production, this would save to backend and create shareable URL
  return {
    shareId: Math.random().toString(36).substr(2, 9),
    email,
    vendors: vendors.map((v) => v["Company Name"]),
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    shareLink: `${window.location.origin}/comparison?share=SHARE_ID`, // Mock URL
  };
}

/**
 * Generate email body for sharing comparison
 * @param {Array} vendors - Array of vendor objects
 * @param {Object} shareInfo - Share information
 * @returns {String} Email body text
 */
export function generateShareEmailBody(vendors = [], shareInfo = {}) {
  const vendorList = vendors.map((v) => `• ${v["Company Name"]}`).join("\n");

  return `
Hi there,

I wanted to share a vendor comparison with you from eyeBridge.

Vendors in this comparison:
${vendorList}

You can view and manage this comparison here:
${shareInfo.shareLink}

This link will expire on ${new Date(shareInfo.expiresAt).toLocaleDateString()}.

Best regards
  `;
}

/**
 * Get default export fields
 * @returns {Array} Array of field names
 */
export function getDefaultExportFields() {
  return [
    "Company Name",
    "Category",
    "Products Offered",
    "Phone",
    "Email",
    "Website",
    "Address",
    "Notes",
  ];
}

/**
 * Generate filename for export
 * @param {String} format - Export format (pdf, csv)
 * @returns {String} Filename with timestamp
 */
export function generateExportFilename(format = "csv") {
  const timestamp = new Date().toISOString().split("T")[0];
  const ext = format === "pdf" ? ".pdf" : ".csv";
  return `vendor-comparison-${timestamp}${ext}`;
}

/**
 * Export snapshot to CSV
 * @param {Object} snapshot - Snapshot object
 * @returns {String} CSV content
 */
export function exportSnapshotAsCSV(snapshot = {}) {
  if (!snapshot.vendors) return "";

  const fields = [
    "Company Name",
    "Category",
    "Products Offered",
    "Phone",
    "Email",
    "Website",
  ];
  const headers = fields.map((f) => `"${f}"`).join(",");
  const rows = snapshot.vendors.map((vendor) =>
    fields.map((field) => `"${vendor[field] || ""}"`).join(",")
  );

  return [headers, ...rows].join("\n");
}
