
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, PrivateRoute } from "./context/AuthContext";
import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import SplashScreen from "./components/SplashScreen";

import Index from "./pages/Index";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Features from "./pages/Features";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import AddProduct from "./pages/AddProduct";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

const App = () => {
  // Create a new QueryClient instance inside the component
  const [queryClient] = React.useState(() => new QueryClient());
  const [showSplash, setShowSplash] = useState(true);
  
  // Check if this is the first visit in this session
  useEffect(() => {
    const hasVisited = sessionStorage.getItem('hasVisited');
    if (hasVisited) {
      setShowSplash(false);
    } else {
      sessionStorage.setItem('hasVisited', 'true');
    }
  }, []);
  
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/features" element={<Features />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
                <Route path="/product/:id" element={<PrivateRoute><ProductDetail /></PrivateRoute>} />
                <Route path="/add-product" element={<PrivateRoute><AddProduct /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
                <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
                <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AnimatePresence>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
