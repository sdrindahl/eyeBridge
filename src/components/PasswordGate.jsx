import React, { useState, useEffect } from "react";
import { Lock } from "lucide-react";

export default function PasswordGate({ children }) {
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState("");

  // Change this to your desired password
  const SITE_PASSWORD = "eyebridges2025";

  useEffect(() => {
    // Check if already authorized in this session
    const authorized = sessionStorage.getItem("siteAuthorized");
    if (authorized === "true") {
      setIsAuthorized(true);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (password === SITE_PASSWORD) {
      setIsAuthorized(true);
      sessionStorage.setItem("siteAuthorized", "true");
      setError("");
    } else {
      setError("Incorrect password. Please try again.");
      setPassword("");
    }
  };

  if (isAuthorized) {
    return children;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-slate-100 rounded-full p-4 mb-4">
              <Lock className="w-8 h-8 text-slate-700" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Eye Bridges</h1>
            <p className="text-slate-600 text-center">
              This site is currently in development and requires a password to access.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Access Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                placeholder="Enter password"
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-lg transition-colors"
            >
              Access Site
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            <p>For access, please contact the site administrator.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
