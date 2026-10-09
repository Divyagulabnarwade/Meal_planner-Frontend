import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Recipes from './pages/Recipes';
import RecipeDetail from './pages/RecipeDetail';
import RecipeForm from './pages/RecipeForm';
import Recommendations from './pages/Recommendations';
import WeeklyPlanner from './pages/WeeklyPlanner';
import GroceryList from './pages/GroceryList';
import Pantry from './pages/Pantry';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
            <Navbar />
            <main className="flex-1">
            <Routes>
              {/* Public Authentication Pages */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Application Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recipes"
                element={
                  <ProtectedRoute>
                    <Recipes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recipes/new"
                element={
                  <ProtectedRoute>
                    <RecipeForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recipes/:id"
                element={
                  <ProtectedRoute>
                    <RecipeDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recipes/:id/edit"
                element={
                  <ProtectedRoute>
                    <RecipeForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recommendations"
                element={
                  <ProtectedRoute>
                    <Recommendations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/planner"
                element={
                  <ProtectedRoute>
                    <WeeklyPlanner />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/grocery-list"
                element={
                  <ProtectedRoute>
                    <GroceryList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pantry"
                element={
                  <ProtectedRoute>
                    <Pantry />
                  </ProtectedRoute>
                }
              />

              {/* Default Redirects */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
