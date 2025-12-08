import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Vendors from "./pages/Vendors";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PasswordGate from "./components/PasswordGate";

console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);

export default function App() {
  return (
    <PasswordGate>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </PasswordGate>
  );
}
