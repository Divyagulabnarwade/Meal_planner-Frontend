import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Spinner from '../components/Spinner';
import { useToast } from '../context/ToastContext';
import {
  ArrowLeft,
  Clock,
  Users,
  Edit2,
  Trash2,
  CalendarPlus,
  Flame,
  Dna,
  Wheat,
  Droplet,
  Sparkles,
} from 'lucide-react';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/recipes/${id}`);
        if (res.data && res.data.data) {
          setRecipe(res.data.data);
        }
      } catch (err) {
        setError('Failed to load recipe details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm(`Delete recipe "${recipe?.title}"?`)) return;

    try {
      await api.delete(`/recipes/${id}`);
      toast.info(`Recipe "${recipe?.title}" was deleted.`);
      navigate('/recipes');
    } catch (err) {
      toast.error('Failed to delete recipe. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <Spinner size="lg" text="Loading recipe..." />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-2xl mb-4">
          {error || 'Recipe not found'}
        </div>
        <Link
          to="/recipes"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to recipes</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back and Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/recipes"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to recipes</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to={`/recipes/${id}/edit`}
            className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-2 px-3.5 py-2 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Recipe Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            {recipe.tags?.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 bg-brand-50 text-brand-700 font-semibold rounded-lg text-xs capitalize"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            {recipe.title}
          </h1>

          {recipe.description && (
            <p className="text-slate-600 mt-2 text-sm sm:text-base leading-relaxed">
              {recipe.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-slate-100 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <Users className="w-4 h-4 text-brand-600" />
              <span>
                <strong>{recipe.servings}</strong> servings
              </span>
            </div>
            {recipe.prepTimeMinutes && (
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-4 h-4 text-brand-600" />
                <span>
                  <strong>{recipe.prepTimeMinutes}</strong> minutes prep
                </span>
              </div>
            )}
            <Link
              to="/planner"
              className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 px-3 py-1.5 rounded-xl transition"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Add to Meal Planner</span>
            </Link>
          </div>
        </div>

        {/* Nutrition Card (if available) */}
        {recipe.calories != null && (
          <div className="pt-6 border-t border-slate-100">
            <h2 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Nutritional Facts (Per Serving)</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-orange-50/80 border border-orange-100 rounded-2xl p-3.5 text-center">
                <div className="flex items-center justify-center gap-1 text-xs font-bold text-orange-700 mb-1">
                  <Flame className="w-3.5 h-3.5" /> Calories
                </div>
                <div className="text-2xl font-black text-slate-800">{recipe.calories}</div>
                <div className="text-[10px] text-slate-500 font-medium">kcal</div>
              </div>

              <div className="bg-emerald-50/80 border border-emerald-100 rounded-2xl p-3.5 text-center">
                <div className="flex items-center justify-center gap-1 text-xs font-bold text-emerald-700 mb-1">
                  <Dna className="w-3.5 h-3.5" /> Protein
                </div>
                <div className="text-2xl font-black text-slate-800">{recipe.proteinGrams || 0}</div>
                <div className="text-[10px] text-slate-500 font-medium">grams</div>
              </div>

              <div className="bg-amber-50/80 border border-amber-100 rounded-2xl p-3.5 text-center">
                <div className="flex items-center justify-center gap-1 text-xs font-bold text-amber-700 mb-1">
                  <Wheat className="w-3.5 h-3.5" /> Carbs
                </div>
                <div className="text-2xl font-black text-slate-800">{recipe.carbsGrams || 0}</div>
                <div className="text-[10px] text-slate-500 font-medium">grams</div>
              </div>

              <div className="bg-rose-50/80 border border-rose-100 rounded-2xl p-3.5 text-center">
                <div className="flex items-center justify-center gap-1 text-xs font-bold text-rose-700 mb-1">
                  <Droplet className="w-3.5 h-3.5" /> Fat
                </div>
                <div className="text-2xl font-black text-slate-800">{recipe.fatGrams || 0}</div>
                <div className="text-[10px] text-slate-500 font-medium">grams</div>
              </div>
            </div>
          </div>
        )}

        {/* Ingredients Section */}
        <div className="pt-6 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Ingredients</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {recipe.ingredients?.map((ing, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm"
              >
                <div className="flex items-center gap-2.5 font-medium text-slate-800 capitalize">
                  <div className="w-2 h-2 rounded-full bg-brand-500" />
                  <span>{ing.name}</span>
                </div>
                <span className="font-semibold text-slate-600">
                  {ing.quantity} {ing.unit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions Section */}
        <div className="pt-6 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Instructions</h2>
          {recipe.instructions ? (
            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 whitespace-pre-line text-slate-700 text-sm sm:text-base leading-relaxed">
              {recipe.instructions}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">No instructions provided.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
