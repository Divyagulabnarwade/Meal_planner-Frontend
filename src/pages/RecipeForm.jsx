import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Spinner from '../components/Spinner';
import { useToast } from '../context/ToastContext';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  Flame,
  Dna,
  Wheat,
  Droplet,
} from 'lucide-react';

const COMMON_UNITS = [
  'g',
  'kg',
  'ml',
  'l',
  'cup',
  'tbsp',
  'tsp',
  'pcs',
  'cloves',
  'slice',
  'can',
  'pinch',
  'bunch',
];

const RecipeForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [servings, setServings] = useState(2);
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(20);
  const [instructions, setInstructions] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [calories, setCalories] = useState('');
  const [proteinGrams, setProteinGrams] = useState('');
  const [carbsGrams, setCarbsGrams] = useState('');
  const [fatGrams, setFatGrams] = useState('');
  const [ingredients, setIngredients] = useState([
    { name: '', quantity: '1', unit: 'pcs' },
  ]);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      const fetchRecipe = async () => {
        try {
          const res = await api.get(`/recipes/${id}`);
          const data = res.data.data;
          setTitle(data.title);
          setDescription(data.description || '');
          setServings(data.servings || 2);
          setPrepTimeMinutes(data.prepTimeMinutes || 15);
          setInstructions(data.instructions || '');
          setTagsInput(data.tags ? data.tags.join(', ') : '');
          setCalories(data.calories != null ? String(data.calories) : '');
          setProteinGrams(data.proteinGrams != null ? String(data.proteinGrams) : '');
          setCarbsGrams(data.carbsGrams != null ? String(data.carbsGrams) : '');
          setFatGrams(data.fatGrams != null ? String(data.fatGrams) : '');
          if (data.ingredients && data.ingredients.length > 0) {
            setIngredients(
              data.ingredients.map((ing) => ({
                name: ing.name,
                quantity: String(ing.quantity),
                unit: ing.unit,
              }))
            );
          }
        } catch (err) {
          setError('Failed to load recipe data for editing.');
        } finally {
          setLoading(false);
        }
      };
      fetchRecipe();
    }
  }, [id, isEdit]);

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: '1', unit: 'g' }]);
  };

  const handleRemoveIngredient = (index) => {
    if (ingredients.length <= 1) {
      alert('A recipe must have at least one ingredient.');
      return;
    }
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (index, field, value) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Recipe title is required.');
      return;
    }

    // Validate ingredients
    const validIngredients = ingredients
      .filter((ing) => ing.name.trim().length > 0)
      .map((ing) => ({
        name: ing.name.trim(),
        quantity: parseFloat(ing.quantity) || 1,
        unit: ing.unit.trim().toLowerCase(),
      }));

    if (validIngredients.length === 0) {
      setError('Please add at least one ingredient with a valid name.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      servings: parseInt(servings, 10) || 1,
      prepTimeMinutes: parseInt(prepTimeMinutes, 10) || null,
      instructions: instructions.trim(),
      calories: calories ? parseInt(calories, 10) : null,
      proteinGrams: proteinGrams ? parseFloat(proteinGrams) : null,
      carbsGrams: carbsGrams ? parseFloat(carbsGrams) : null,
      fatGrams: fatGrams ? parseFloat(fatGrams) : null,
      tags,
      ingredients: validIngredients,
    };

    try {
      setSaving(true);
      if (isEdit) {
        await api.put(`/recipes/${id}`, payload);
        toast.success(`Recipe "${payload.title}" updated.`);
        navigate(`/recipes/${id}`);
      } else {
        const res = await api.post('/recipes', payload);
        const newId = res.data.data.id;
        toast.success(`Recipe "${payload.title}" created successfully.`);
        navigate(`/recipes/${newId}`);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to save recipe. Please check your entries.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <Spinner size="lg" text="Loading recipe form..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to={isEdit ? `/recipes/${id}` : '/recipes'}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel & Return</span>
        </Link>
        <h1 className="text-xl font-bold text-slate-800">
          {isEdit ? 'Edit Recipe' : 'Create New Recipe'}
        </h1>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Recipe Information */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-800">Basic Details</h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Recipe Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Grandma's Lemon Herb Roast Chicken"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the dish, flavor profile, or origin..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Servings *
              </label>
              <input
                type="number"
                min="1"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Prep Time (minutes)
              </label>
              <input
                type="number"
                min="1"
                value={prepTimeMinutes}
                onChange={(e) => setPrepTimeMinutes(e.target.value)}
                placeholder="25"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="dinner, italian, quick, high-protein"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Nutritional Information (Optional) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">Nutritional Profile (Per Serving - Optional)</h2>
            <p className="text-xs text-slate-500">
              Provide optional nutrition facts to automatically track daily calorie and macronutrient intake in the weekly planner.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-orange-700 uppercase tracking-wider mb-1.5">
                <Flame className="w-3.5 h-3.5" />
                Calories (kcal)
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 450"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1.5">
                <Dna className="w-3.5 h-3.5" />
                Protein (g)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder="e.g. 32.5"
                value={proteinGrams}
                onChange={(e) => setProteinGrams(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1.5">
                <Wheat className="w-3.5 h-3.5" />
                Carbs (g)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder="e.g. 48.0"
                value={carbsGrams}
                onChange={(e) => setCarbsGrams(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-rose-700 uppercase tracking-wider mb-1.5">
                <Droplet className="w-3.5 h-3.5" />
                Fat (g)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder="e.g. 14.0"
                value={fatGrams}
                onChange={(e) => setFatGrams(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Ingredients Section */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800">Ingredients *</h2>
              <p className="text-xs text-slate-500">
                Specify realistic units (g, kg, ml, l, cup, tbsp, tsp, pcs) for automatic merge & conversion.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddIngredient}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl text-xs font-semibold transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Row</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {ingredients.map((ing, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={ing.name}
                  onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                  placeholder="Ingredient name (e.g. Tomatoes, Olive Oil)"
                  required
                  className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                />

                <input
                  type="number"
                  step="any"
                  min="0.001"
                  value={ing.quantity}
                  onChange={(e) => handleIngredientChange(idx, 'quantity', e.target.value)}
                  placeholder="Qty"
                  required
                  className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition text-center"
                />

                <div className="relative w-28">
                  <input
                    list={`units-list-${idx}`}
                    value={ing.unit}
                    onChange={(e) => handleIngredientChange(idx, 'unit', e.target.value)}
                    placeholder="Unit"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition text-center"
                  />
                  <datalist id={`units-list-${idx}`}>
                    {COMMON_UNITS.map((u) => (
                      <option key={u} value={u} />
                    ))}
                  </datalist>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveIngredient(idx)}
                  className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Remove row"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions Section */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-800">Preparation & Cooking Steps</h2>
          <textarea
            rows={5}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="1. Chop onions and sauté in olive oil...&#10;2. Add tomatoes and simmer...&#10;3. Serve hot with pasta."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
          />
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to={isEdit ? `/recipes/${id}` : '/recipes'}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-brand-500/20 flex items-center gap-2 transition disabled:opacity-60"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isEdit ? 'Update Recipe' : 'Save Recipe'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecipeForm;
