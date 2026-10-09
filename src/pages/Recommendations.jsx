import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';
import {
  Sparkles,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Filter,
  Flame,
  Dna,
  Wheat,
  Droplet,
  ExternalLink,
  ChefHat,
  PackageCheck,
  RefreshCw,
} from 'lucide-react';

const COMMON_TAGS = [
  'vegetarian',
  'high-protein',
  'quick',
  'dinner',
  'lunch',
  'breakfast',
  'healthy',
  'italian',
  'vegan',
];

const Recommendations = () => {
  const toast = useToast();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchPantry, setMatchPantry] = useState(true);
  const [maxPrepTime, setMaxPrepTime] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (matchPantry !== undefined) params.append('matchPantry', matchPantry);
      if (maxPrepTime) params.append('maxPrepTime', maxPrepTime);
      if (selectedTags.length > 0) {
        selectedTags.forEach((tag) => params.append('dietaryTags', tag));
      }
      params.append('limit', '12');

      const res = await axios.get(`/recommendations?${params.toString()}`);
      setRecommendations(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load recommendations', err);
      toast.error('Unable to fetch recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [matchPantry, maxPrepTime, selectedTags]);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 75) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (score >= 50) return 'bg-blue-100 text-blue-800 border-blue-300';
    return 'bg-amber-100 text-amber-800 border-amber-300';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-600 via-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Transparent Rule-Based Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Smart Recipe Recommendations
          </h1>
          <p className="text-sm sm:text-base text-emerald-50 leading-relaxed">
            Our multi-factor heuristic algorithm analyzes your on-hand pantry ingredients, dietary preferences, and preparation times to suggest what you can cook today with zero food waste.
          </p>
        </div>
      </div>

      {/* Filter Controls Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Filter className="w-4 h-4 text-brand-600" />
            <span>Customize Recommendation Filters</span>
          </div>
          <button
            onClick={fetchRecommendations}
            className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Pantry Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-emerald-600" />
              <div>
                <div className="text-sm font-semibold text-slate-800">Pantry Availability</div>
                <div className="text-xs text-slate-500">Prioritize ingredients you own</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={matchPantry}
                onChange={(e) => setMatchPantry(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Prep Time Max Filter */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Max Total Time (Minutes)
            </label>
            <select
              value={maxPrepTime}
              onChange={(e) => setMaxPrepTime(e.target.value)}
              className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            >
              <option value="">Any Time</option>
              <option value="15">Under 15 minutes</option>
              <option value="30">Under 30 minutes</option>
              <option value="45">Under 45 minutes</option>
              <option value="60">Under 60 minutes</option>
            </select>
          </div>

          {/* Direct Pantry Link */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-brand-50/60 border border-brand-100">
            <div>
              <div className="text-xs font-semibold text-brand-900">Manage Stock</div>
              <div className="text-xs text-brand-700">Update what's in your pantry</div>
            </div>
            <Link
              to="/pantry"
              className="text-xs font-bold text-brand-700 hover:text-brand-800 bg-white px-3 py-1.5 rounded-lg border border-brand-200 shadow-sm"
            >
              Go to Pantry &rarr;
            </Link>
          </div>
        </div>

        {/* Dietary Tag Chips */}
        <div>
          <span className="text-xs font-semibold text-slate-500 block mb-2">Dietary Constraints & Categories:</span>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_TAGS.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-colors border ${
                    active
                      ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results Section */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner />
        </div>
      ) : recommendations.length === 0 ? (
        <EmptyState
          icon={ChefHat}
          title="No recommendations match current filters"
          description="Try turning off dietary tag restrictions or adding more ingredients to your pantry inventory."
          actionText="Clear Filters"
          onAction={() => {
            setMatchPantry(true);
            setMaxPrepTime('');
            setSelectedTags([]);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="p-5 space-y-4">
                {/* Header: Title and Match Score */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <Link
                      to={`/recipes/${item.id}`}
                      className="font-bold text-slate-900 hover:text-brand-600 text-lg leading-snug line-clamp-1 transition-colors"
                    >
                      {item.title}
                    </Link>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {item.totalTimeMinutes || item.prepTimeMinutes || 20}m
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {item.servings} serv.
                      </span>
                    </div>
                  </div>

                  {/* Heuristic Score Badge */}
                  <div
                    className={`shrink-0 px-2.5 py-1 rounded-xl border text-xs font-black tracking-wide ${getScoreBadgeColor(
                      item.matchScore
                    )}`}
                    title="Computed match score based on pantry availability & preferences"
                  >
                    {Math.round(item.matchScore)}% MATCH
                  </div>
                </div>

                {/* Explanation heuristic card */}
                {item.explanation && (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-xs text-slate-600 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="leading-tight">{item.explanation}</span>
                  </div>
                )}

                {/* Nutrition Pills (if present) */}
                {item.calories != null && (
                  <div className="grid grid-cols-4 gap-1.5 py-1 border-t border-b border-slate-100 text-center">
                    <div className="bg-orange-50/70 p-1.5 rounded-lg">
                      <div className="text-[10px] uppercase font-bold text-orange-600 flex items-center justify-center gap-0.5">
                        <Flame className="w-2.5 h-2.5" /> Cal
                      </div>
                      <div className="text-xs font-black text-slate-800">{item.calories}</div>
                    </div>
                    <div className="bg-emerald-50/70 p-1.5 rounded-lg">
                      <div className="text-[10px] uppercase font-bold text-emerald-600 flex items-center justify-center gap-0.5">
                        <Dna className="w-2.5 h-2.5" /> Prot
                      </div>
                      <div className="text-xs font-black text-slate-800">{item.proteinGrams || 0}g</div>
                    </div>
                    <div className="bg-amber-50/70 p-1.5 rounded-lg">
                      <div className="text-[10px] uppercase font-bold text-amber-600 flex items-center justify-center gap-0.5">
                        <Wheat className="w-2.5 h-2.5" /> Carb
                      </div>
                      <div className="text-xs font-black text-slate-800">{item.carbsGrams || 0}g</div>
                    </div>
                    <div className="bg-rose-50/70 p-1.5 rounded-lg">
                      <div className="text-[10px] uppercase font-bold text-rose-600 flex items-center justify-center gap-0.5">
                        <Droplet className="w-2.5 h-2.5" /> Fat
                      </div>
                      <div className="text-xs font-black text-slate-800">{item.fatGrams || 0}g</div>
                    </div>
                  </div>
                )}

                {/* Pantry Coverage Details */}
                <div className="space-y-2 pt-1">
                  {item.matchedIngredients && item.matchedIngredients.length > 0 && (
                    <div>
                      <div className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 mb-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        In Pantry ({item.matchedIngredients.length}):
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.matchedIngredients.map((ing, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200"
                          >
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.missingIngredients && item.missingIngredients.length > 0 && (
                    <div>
                      <div className="text-[11px] font-bold text-amber-700 flex items-center gap-1 mb-1">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        Need to buy ({item.missingIngredients.length}):
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.missingIngredients.map((ing, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200"
                          >
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                <Link
                  to={`/recipes/${item.id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Recipe
                </Link>
                <Link
                  to={`/planner`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors shadow-sm"
                >
                  Add to Plan
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
