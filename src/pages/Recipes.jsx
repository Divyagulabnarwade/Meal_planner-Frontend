import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import {
  BookOpen,
  Search,
  Plus,
  Clock,
  Users,
  Tag,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch distinct tags for user
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await api.get('/recipes/tags');
        if (res.data && res.data.data) {
          setTags(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load recipe tags', err);
      }
    };
    fetchTags();
  }, []);

  // Fetch recipes whenever search, selectedTag, or page changes
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const params = {
          page,
          size: 9,
          sort: 'updatedAt,desc',
        };
        if (search.trim()) params.search = search.trim();
        if (selectedTag) params.tag = selectedTag;

        const res = await api.get('/recipes', { params });
        const pageData = res.data.data;
        setRecipes(pageData.content || []);
        setTotalPages(pageData.totalPages || 0);
        setTotalElements(pageData.totalElements || 0);
      } catch (err) {
        setError('Failed to fetch recipes.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchRecipes();
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [search, selectedTag, page]);

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;

    try {
      await api.delete(`/recipes/${id}`);
      setRecipes((prev) => prev.filter((r) => r.id !== id));
      setTotalElements((prev) => Math.max(0, prev - 1));
    } catch (err) {
      alert('Failed to delete recipe. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Recipe Box
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse, search, and manage your culinary creations ({totalElements} total)
          </p>
        </div>
        <Link
          to="/recipes/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Recipe</span>
        </Link>
      </div>

      {/* Search & Tag Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search recipes by title (e.g. Pasta, Salad, Pancakes)..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
          />
        </div>

        {tags.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1 pl-1">
              <Tag className="w-3.5 h-3.5" /> Filter:
            </span>
            <button
              onClick={() => {
                setSelectedTag('');
                setPage(0);
              }}
              className={`px-3 py-1 rounded-full font-medium transition ${
                selectedTag === ''
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {tags.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setSelectedTag(selectedTag === t ? '' : t);
                  setPage(0);
                }}
                className={`px-3 py-1 rounded-full font-medium capitalize transition ${
                  selectedTag === t
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Recipe Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" text="Finding recipes..." />
        </div>
      ) : recipes.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No recipes found"
          description={
            search || selectedTag
              ? 'Try adjusting your search query or tag filter.'
              : 'Your recipe book is empty. Add your favorite dishes to start planning!'
          }
          action={
            <Link
              to="/recipes/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Recipe</span>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <Link
              key={recipe.id}
              to={`/recipes/${recipe.id}`}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-slate-800 group-hover:text-brand-600 transition line-clamp-1">
                    {recipe.title}
                  </h3>
                  <button
                    onClick={(e) => handleDelete(e, recipe.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete Recipe"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-500 mt-2 line-clamp-2 min-h-[32px]">
                  {recipe.description || 'No description provided.'}
                </p>

                {recipe.tags && recipe.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {recipe.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-brand-50 text-brand-700 rounded-md text-[11px] font-semibold capitalize"
                      >
                        {tag}
                      </span>
                    ))}
                    {recipe.tags.length > 3 && (
                      <span className="text-[11px] text-slate-400 self-center">
                        +{recipe.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-medium">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {recipe.servings} serv
                  </span>
                  {recipe.prepTimeMinutes && (
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {recipe.prepTimeMinutes}m
                    </span>
                  )}
                </div>
                <span className="text-brand-700 font-semibold bg-brand-50 px-2 py-0.5 rounded">
                  {recipe.ingredientCount} ingr.
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recipes;
