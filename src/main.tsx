
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Function to get stored theme or detect system preference
const getInitialTheme = (): "dark" | "light" => {
  const savedTheme = localStorage.getItem("theme") as "dark" | "light";
  
  if (savedTheme) {
    return savedTheme;
  }
  
  // Check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return "dark";
  }
  
  return "light";
};

// Apply the theme to document before rendering to prevent flashing
const initialTheme = getInitialTheme();
document.documentElement.classList.add(initialTheme);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
