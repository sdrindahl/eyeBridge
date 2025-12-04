import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    // Password validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter");
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError("Password must contain at least one lowercase letter");
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number");
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setError("Password must contain at least one special character (!@#$%^&*(),.?\":{}|<>)");
      return;
    }

    // For demo purposes, accept any login that meets requirements
    // In production, this would make an API call to authenticate
    console.log("Login attempt:", { email, password });
    
    // Store login state (in production, you'd use proper auth tokens)
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", email);
    
    // Redirect to vendors page
    navigate("/vendors");
  };

  return (
    <div className="min-h-screen bg-slate-300">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-700 to-slate-600 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-24">
          <Link to="/" className="flex items-center gap-3 font-semibold text-white">
            <img src="/logo.jpg" alt="Eye Bridges Logo" className="h-20 w-auto" />
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
        <Card className="w-full max-w-md rounded-3xl bg-white border-slate-300 shadow-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-3xl font-bold text-slate-900">Welcome Back</CardTitle>
            <p className="text-slate-600 mt-2">Sign in to your account</p>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent bg-slate-50 text-slate-900"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <input
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
                className="w-full rounded-lg py-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-medium"
              >
                Sign In
              </Button>

              <div className="text-center text-sm text-slate-600 mt-4">
                Don't have an account?{" "}
                <a href="#" className="text-slate-700 font-medium hover:text-slate-900">
                  Sign up
                </a>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
