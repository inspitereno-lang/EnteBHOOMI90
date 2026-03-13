import React, { useState } from "react";
import { ShieldCheck, LogIn, User, Leaf } from "lucide-react"; // Added User and Leaf icon
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../../services/adminAPI";

export const AdminLogin = () => {
  const [userName, setUserName] = useState(""); // Changed from email to userName
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!userName || !password) { // Changed check from email to userName
      setError("Both username and password are required.");
      setIsLoading(false);
      return;
    }

    try {
      // API call now sends userName
      const response = await adminLogin({ userName, password });

      if (response.token) {
        localStorage.setItem("adminToken", response.token);
        navigate("/admin");
      } else {
        setError("Login failed. Please try again.");
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message || "Invalid credentials. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F3F8F3]">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-2xl border-t-4" style={{ borderTopColor: '#14532D' }}>

        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg shadow-emerald-100" style={{ background: 'linear-gradient(135deg, #14532D 0%, #61CE70 100%)' }}>
              <Leaf className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold" style={{ color: '#14532D' }}>Ente Bhoomi Admin Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">Welcome back! Please sign in to continue.</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* UserName Input */}
          <div>
            <label
              htmlFor="userName"
              className="block text-sm font-medium"
              style={{ color: '#14532D' }}
            >
              Username
            </label>
            <input
              id="userName"
              name="userName"
              type="text" // Changed type to text
              autoComplete="username" // Changed autocomplete
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)} // Updated state handler
              className="w-full px-4 py-2 mt-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none transition-all"
              onFocus={(e) => { e.target.style.borderColor = '#14532D'; e.target.style.boxShadow = '0 0 0 3px rgba(20, 83, 45, 0.1)' }}
              onBlur={(e) => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none' }}
              placeholder="e.g., admin"
              disabled={isLoading}
            />
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium"
                style={{ color: '#14532D' }}
              >
                Password
              </label>

            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 mt-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none transition-all"
              onFocus={(e) => { e.target.style.borderColor = '#14532D'; e.target.style.boxShadow = '0 0 0 3px rgba(20, 83, 45, 0.1)' }}
              onBlur={(e) => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none' }}
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 text-sm text-center text-red-800 bg-red-100 rounded-lg">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center w-full px-4 py-3 font-semibold text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 disabled:cursor-not-allowed shadow-lg"
              style={{ background: isLoading ? '#9ca3af' : '#61CE70', boxShadow: isLoading ? 'none' : '0 4px 6px -1px rgba(97, 206, 112, 0.3)' }}
              onMouseEnter={(e) => !isLoading && (e.target.style.background = '#52b863')}
              onMouseLeave={(e) => !isLoading && (e.target.style.background = '#61CE70')}
            >
              <LogIn className="w-5 h-5 mr-2" />
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};