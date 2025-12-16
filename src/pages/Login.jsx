import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/services/api";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic validation
    if (!email || !password) {
      setError("Please enter both email and password");
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const response = await api.login(email, password);
      
      if (response.token) {
        // Token is automatically stored by api.login
        login(email); // Update global auth state
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Invalid email or password");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-300">
      {/* Header */}
      <header className="border-b border-slate-800 relative" style={{ backgroundImage: 'url(/banner.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-slate-900/50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-24 relative z-10">
          <Link to="/" className="flex items-center gap-3 font-semibold text-white hover:opacity-80 transition-opacity">
            <img src="/logo.jpg" alt="Eye Bridges Logo" className="h-20 w-auto cursor-pointer" />
            <span className="text-xl">Eye Bridges</span>
          </Link>
          <Link to="/">
            <Button variant="ghost" className="text-white hover:bg-slate-800">
              Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex items-center justify-center px-4 py-16">
        <Card data-testid="login-card" className="w-full max-w-md rounded-3xl bg-white border-slate-300 shadow-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-3xl font-bold text-slate-900">Welcome Back</CardTitle>
            <p className="text-slate-600 mt-2">Sign in to your account</p>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} data-testid="login-form" className="space-y-4" noValidate>
              {error && (
                <div data-testid="login-error" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  data-testid="email-input"
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent bg-slate-50 text-slate-900"
                  noValidate
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <input
                  data-testid="password-input"
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent bg-slate-50 text-slate-900"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Min 6 characters, with uppercase, lowercase, number, and special character
                </p>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-slate-300 text-slate-600 focus:ring-slate-400" />
                  <span className="ml-2 text-sm text-slate-600">Remember me</span>
                </label>
                <a href="#" className="text-sm text-slate-600 hover:text-slate-900">
                  Forgot password?
                </a>
              </div>

              <Button 
                type="submit"
                disabled={loading}
                className="w-full rounded-lg py-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>

              <div className="text-center text-sm text-slate-600 mt-4">
                Don't have an account?{" "}
                <Link to="/register" className="text-slate-700 font-medium hover:text-slate-900">
                  Sign up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
export default Login;
