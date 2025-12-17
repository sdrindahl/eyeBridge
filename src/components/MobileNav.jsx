import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Home as HomeIcon, Store, LayoutDashboard, LogOut, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const MobileNav = () => {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50">
      <div className="flex justify-around items-center py-2">
        <Link 
          to="/" 
          className={`flex flex-col items-center justify-center py-2 px-3 transition-colors ${
            isActive('/') 
              ? 'text-blue-600' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <HomeIcon className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Home</span>
        </Link>

        <Link 
          to="/vendors" 
          className={`flex flex-col items-center justify-center py-2 px-3 transition-colors ${
            isActive('/vendors') 
              ? 'text-blue-600' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Store className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Vendors</span>
        </Link>

        {isLoggedIn ? (
          <>
            <Link 
              to="/dashboard" 
              className={`flex flex-col items-center justify-center py-2 px-3 transition-colors ${
                isActive('/dashboard') 
                  ? 'text-blue-600' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">Dashboard</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex flex-col items-center justify-center py-2 px-3 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <LogOut className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">Logout</span>
            </button>
          </>
        ) : (
          <Link 
            to="/login" 
            className={`flex flex-col items-center justify-center py-2 px-3 transition-colors ${
              isActive('/login') 
                ? 'text-blue-600' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Login</span>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default MobileNav;