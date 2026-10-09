import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import {
  BookOpen,
  CalendarDays,
  ShoppingCart,
  Package,
  Plus,
  ArrowRight,
  Clock,
  Utensils,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await api.get('/dashboard/summary');
        if (res.data && res.data.data) {
          setSummary(res.data.data);
        }
      } catch (err) {
        setError('Failed to load dashboard metrics.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <Spinner size="lg" text="Loading dashboard overview..." />
      </div>
    );
  }

  const statCards = [
    {
      label: 'My Recipes',
      value: summary?.totalRecipes || 0,
      icon: BookOpen,
      color: 'bg-emerald-500',
      bg: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      link: '/recipes',
    },
    {
      label: 'Planned Meals This Week',
      value: summary?.plannedMealsThisWeek || 0,
      icon: CalendarDays,
      color: 'bg-blue-500',
      bg: 'bg-blue-50',
      textColor: 'text-blue-700',
      link: '/planner',
    },
    {
      label: 'Unchecked Groceries',
      value: summary?.uncheckedGroceryItems || 0,
      icon: ShoppingCart,
      color: 'bg-amber-500',
      bg: 'bg-amber-50',
      textColor: 'text-amber-700',
      link: '/grocery-list',
    },
    {
      label: 'Pantry Items On-Hand',
      value: summary?.totalPantryItems || 0,
      icon: Package,
      color: 'bg-purple-500',
      bg: 'bg-purple-50',
      textColor: 'text-purple-700',
      link: '/pantry',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-700 to-emerald-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-brand-900/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide uppercase">
            Kitchen Headquarters
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
            Welcome back, {user?.fullName || 'Chef'}!
          </h1>
          <p className="text-brand-100 text-sm sm:text-base mt-1 max-w-xl">
            Here is your weekly meal schedule, kitchen pantry, and shopping essentials.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/recommendations"
            className="px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-100 border border-emerald-400/40 rounded-xl font-semibold text-sm transition flex items-center gap-2 backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>Smart Recommendations</span>
          </Link>
          <Link
            to="/recipes/new"
            className="px-4 py-2.5 bg-white text-brand-800 rounded-xl font-semibold text-sm shadow hover:bg-brand-50 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Recipe</span>
          </Link>
          <Link
            to="/grocery-list"
            className="px-4 py-2.5 bg-brand-800/60 hover:bg-brand-800 text-white border border-brand-400/40 rounded-xl font-semibold text-sm transition flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Generate Groceries</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* Pantry Attention Alerts */}
      {(summary?.expiringPantryItems > 0 || summary?.lowStockPantryItems > 0) && (
        <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">Pantry Attention Needed</h4>
              <p className="text-xs text-amber-700 mt-0.5">
                {summary.expiringPantryItems > 0 && `${summary.expiringPantryItems} item(s) expiring within 7 days. `}
                {summary.lowStockPantryItems > 0 && `${summary.lowStockPantryItems} item(s) running low on stock.`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Link
              to="/recommendations"
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Cook With Stock
            </Link>
            <Link
              to="/pantry"
              className="px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition"
            >
              View Pantry &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              to={card.link}
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-2xl ${card.bg} ${card.textColor}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 transition-colors" />
              </div>
              <div className="mt-4">
                <p className="text-3xl font-extrabold text-slate-800">{card.value}</p>
                <p className="text-sm font-medium text-slate-500 mt-1">{card.label}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Planned Meals Preview (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-800">This Week's Meal Plan</h2>
              <p className="text-xs text-slate-500">Scheduled meals from your 7-day grid</p>
            </div>
            <Link
              to="/planner"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>Open Planner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {summary?.thisWeekMeals && summary.thisWeekMeals.length > 0 ? (
              summary.thisWeekMeals.map((meal) => (
                <div key={meal.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                      meal.mealType === 'BREAKFAST'
                        ? 'bg-amber-100 text-amber-800'
                        : meal.mealType === 'LUNCH'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {meal.mealType}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{meal.recipeTitle}</p>
                      <p className="text-xs text-slate-500">{meal.planDate}</p>
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">{meal.servings}</span> servings
                    {meal.prepTimeMinutes && (
                      <span className="ml-2 font-medium">· {meal.prepTimeMinutes}m</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <Utensils className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">No meals planned yet for this week.</p>
                <Link
                  to="/planner"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add meals to weekly grid</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Recipes (1 Column) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Your Recipes</h2>
              <p className="text-xs text-slate-500">Recently added cookbooks</p>
            </div>
            <Link
              to="/recipes"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {summary?.recentRecipes && summary.recentRecipes.length > 0 ? (
              summary.recentRecipes.map((r) => (
                <Link
                  key={r.id}
                  to={`/recipes/${r.id}`}
                  className="block p-3 rounded-2xl bg-slate-50 hover:bg-brand-50/50 border border-slate-100 transition group"
                >
                  <h4 className="text-sm font-semibold text-slate-800 group-hover:text-brand-700 transition">
                    {r.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                    <span>{r.servings} servings</span>
                    {r.prepTimeMinutes && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {r.prepTimeMinutes}m
                      </span>
                    )}
                    <span>{r.ingredientCount} items</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No recipes created yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
