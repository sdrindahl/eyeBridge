import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const syncAuthState = () => {
      const loggedIn = localStorage.getItem("isLoggedIn") === "true";
      const email = localStorage.getItem("userEmail") || "";
      setIsLoggedIn(loggedIn);
      setUserEmail(email);
    };
    syncAuthState();

    // Listen for localStorage changes (cross-tab and navigation)
    window.addEventListener("storage", syncAuthState);

    return () => {
      window.removeEventListener("storage", syncAuthState);
    };
  }, []);

  const login = (email) => {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", email);
    setIsLoggedIn(true);
    setUserEmail(email);
  };

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    setIsLoggedIn(false);
    setUserEmail("");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
