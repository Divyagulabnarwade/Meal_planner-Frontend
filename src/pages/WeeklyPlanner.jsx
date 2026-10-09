import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  ShoppingCart,
  Clock,
  Users,
  ChefHat,
  Search,
  Flame,
  Dna,
} from 'lucide-react';

const MEAL_TYPES = [
  { key: 'BREAKFAST', label: 'Breakfast', color: 'bg-amber-500/10 text-amber-800 border-amber-200' },
  { key: 'LUNCH', label: 'Lunch', color: 'bg-sky-500/10 text-sky-800 border-sky-200' },
  { key: 'DINNER', label: 'Dinner', color: 'bg-indigo-500/10 text-indigo-800 border-indigo-200' },
];

const WeeklyPlanner = () => {
  const navigate = useNavigate();
  const toast = useToast();

  // Reference Monday of current week
  const [currentMonday, setCurrentMonday] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const [mealPlans, setMealPlans] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state for assigning slot
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null); // { date: string, mealType: string, currentEntry: obj }
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [servingsOverride, setServingsOverride] = useState('');
  const [recipeSearch, setRecipeSearch] = useState('');
  const [savingSlot, setSavingSlot] = useState(false);

  // Calculate daily nutrition summary
  const getDailyNutrition = (dateStr) => {
    const dayEntries = mealPlans.filter((m) => m.planDate === dateStr);
    const totalCal = dayEntries.reduce((sum, e) => sum + (e.calories || 0), 0);
    const totalProt = dayEntries.reduce((sum, e) => sum + (e.proteinGrams ? Number(e.proteinGrams) : 0), 0);
    return {
      hasNutrition: totalCal > 0 || totalProt > 0,
      calories: Math.round(totalCal),
      protein: Math.round(totalProt * 10) / 10,
    };
  };

  // Helper formatting
  const formatDateISO = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentMonday);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays();
  const startDateStr = formatDateISO(weekDays[0]);
  const endDateStr = formatDateISO(weekDays[6]);

  // Fetch meal plans for selected week
  const fetchMealPlans = async () => {
    try {
      setLoading(true);
      const res = await api.get('/meal-plans', {
        params: {
          startDate: startDateStr,
          endDate: endDateStr,
        },
      });
      setMealPlans(res.data.data || []);
    } catch (err) {
      console.error('Failed to load meal plans', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all user recipes for slot picker
  useEffect(() => {
    const fetchAllRecipes = async () => {
      try {
        const res = await api.get('/recipes', { params: { size: 100 } });
        setRecipes(res.data.data.content || []);
      } catch (err) {
        console.error('Failed to load recipes', err);
      }
    };
    fetchAllRecipes();
  }, []);

  useEffect(() => {
    fetchMealPlans();
  }, [currentMonday]);

  const handlePrevWeek = () => {
    const prev = new Date(currentMonday);
    prev.setDate(prev.getDate() - 7);
    setCurrentMonday(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentMonday);
    next.setDate(next.getDate() + 7);
    setCurrentMonday(next);
  };

  const handleToday = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    setCurrentMonday(monday);
  };

  const openSlotModal = (dateStr, mealType, existingEntry = null) => {
    setSelectedSlot({ date: dateStr, mealType, currentEntry: existingEntry });
    if (existingEntry) {
      setSelectedRecipeId(String(existingEntry.recipeId));
      setServingsOverride(String(existingEntry.servings));
    } else {
      setSelectedRecipeId(recipes.length > 0 ? String(recipes[0].id) : '');
      setServingsOverride(recipes.length > 0 ? String(recipes[0].servings) : '2');
    }
    setRecipeSearch('');
    setModalOpen(true);
  };

  const handleRecipeChange = (recId) => {
    setSelectedRecipeId(recId);
    const found = recipes.find((r) => String(r.id) === String(recId));
    if (found) {
      setServingsOverride(String(found.servings));
    }
  };

  const handleSaveSlot = async (e) => {
    e.preventDefault();
    if (!selectedRecipeId) {
      alert('Please select a recipe.');
      return;
    }

    try {
      setSavingSlot(true);
      await api.post('/meal-plans', {
        recipeId: parseInt(selectedRecipeId, 10),
        planDate: selectedSlot.date,
        mealType: selectedSlot.mealType,
        servings: servingsOverride ? parseInt(servingsOverride, 10) : null,
      });
      toast.success(`Scheduled meal for ${selectedSlot.mealType.toLowerCase()}.`);
      setModalOpen(false);
      await fetchMealPlans();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule meal.');
    } finally {
      setSavingSlot(false);
    }
  };

  const handleDeleteSlot = async (e, dateStr, mealType) => {
    e.stopPropagation();
    if (!window.confirm('Remove this recipe from your schedule?')) return;

    try {
      await api.delete('/meal-plans/slot', {
        params: { planDate: dateStr, mealType },
      });
      setMealPlans((prev) =>
        prev.filter((m) => !(m.planDate === dateStr && m.mealType === mealType))
      );
      toast.info('Removed meal from planner.');
    } catch (err) {
      toast.error('Failed to remove meal.');
    }
  };

  // Find scheduled entry for a given day and meal type
  const getEntryForSlot = (dateStr, mealType) => {
    return mealPlans.find((m) => m.planDate === dateStr && m.mealType === mealType);
  };

  const filteredRecipes = recipes.filter((r) =>
    r.title.toLowerCase().includes(recipeSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Weekly Meal Planner
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Map out your breakfast, lunch, and dinner for the week
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Week Navigation */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <button
              onClick={handlePrevWeek}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
              title="Previous Week"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              Today
            </button>
            <button
              onClick={handleNextWeek}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
              title="Next Week"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <span className="text-xs font-bold text-slate-600 px-3 py-2 bg-white rounded-xl border border-slate-200 shadow-sm hidden sm:inline-block">
            {startDateStr} &nbsp;—&nbsp; {endDateStr}
          </span>

          <Link
            to={`/grocery-list?startDate=${startDateStr}&endDate=${endDateStr}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Generate Groceries</span>
          </Link>
        </div>
      </div>

      {/* 7-Day Grid */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <Spinner size="lg" text="Loading your meal planner..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map((day) => {
            const dateStr = formatDateISO(day);
            const isToday = formatDateISO(new Date()) === dateStr;
            const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNumber = day.getDate();
            const monthName = day.toLocaleDateString('en-US', { month: 'short' });
            const nutrition = getDailyNutrition(dateStr);

            return (
              <div
                key={dateStr}
                className={`bg-white rounded-2xl border ${
                  isToday ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-md' : 'border-slate-200/80'
                } flex flex-col overflow-hidden shadow-sm`}
              >
                {/* Day Header */}
                <div
                  className={`p-3 text-center border-b ${
                    isToday ? 'bg-brand-600 text-white' : 'bg-slate-50 text-slate-800'
                  }`}
                >
                  <p className="text-xs font-bold uppercase tracking-wider">{dayName}</p>
                  <p className="text-lg font-black mt-0.5">
                    {monthName} {dayNumber}
                  </p>

                  {/* Daily Aggregated Nutrition */}
                  {nutrition.hasNutrition && (
                    <div
                      className={`mt-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 ${
                        isToday ? 'bg-brand-700 text-brand-100' : 'bg-slate-200/80 text-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5 text-orange-500" />
                        {nutrition.calories} kcal
                      </span>
                      {nutrition.protein > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Dna className="w-2.5 h-2.5 text-emerald-600" />
                          {nutrition.protein}g P
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Meal Slots: Breakfast, Lunch, Dinner */}
                <div className="p-2.5 flex-1 flex flex-col gap-2.5">
                  {MEAL_TYPES.map((type) => {
                    const entry = getEntryForSlot(dateStr, type.key);

                    return (
                      <div
                        key={type.key}
                        onClick={() => openSlotModal(dateStr, type.key, entry)}
                        className={`group relative rounded-xl p-2.5 border text-left cursor-pointer transition-all ${
                          entry
                            ? 'bg-slate-50/90 border-slate-200 hover:border-brand-400 hover:bg-brand-50/30'
                            : 'border-dashed border-slate-200 hover:border-brand-400 hover:bg-brand-50/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded ${type.color}`}
                          >
                            {type.label}
                          </span>

                          {entry && (
                            <button
                              onClick={(e) => handleDeleteSlot(e, dateStr, type.key)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-600 rounded transition"
                              title="Clear slot"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {entry ? (
                          <div>
                            <p className="text-xs font-bold text-slate-800 line-clamp-2">
                              {entry.recipeTitle}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                              <span className="flex items-center gap-0.5 font-medium">
                                <Users className="w-3 h-3 text-slate-400" />
                                {entry.servings}s
                              </span>
                              {entry.prepTimeMinutes && (
                                <span className="flex items-center gap-0.5 font-medium">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {entry.prepTimeMinutes}m
                                </span>
                              )}
                              {entry.calories != null && (
                                <span className="flex items-center gap-0.5 font-bold text-orange-700 bg-orange-50 px-1 py-0.2 rounded text-[10px]">
                                  <Flame className="w-2.5 h-2.5 text-orange-500" />
                                  {entry.calories}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="py-2 flex items-center justify-center text-slate-300 group-hover:text-brand-600 transition">
                            <Plus className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recipe Selection Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Schedule ${selectedSlot?.mealType} on ${selectedSlot?.date}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveSlot} className="space-y-4">
          {recipes.length === 0 ? (
            <div className="py-6 text-center text-slate-500 text-sm">
              <ChefHat className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p>You haven't created any recipes yet.</p>
              <Link
                to="/recipes/new"
                className="mt-2 inline-block font-semibold text-brand-600 hover:underline text-xs"
              >
                + Create a recipe first
              </Link>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Recipe
                </label>
                <div className="relative mb-2">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={recipeSearch}
                    onChange={(e) => setRecipeSearch(e.target.value)}
                    placeholder="Filter recipes..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-100 rounded-xl p-1">
                  {filteredRecipes.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => handleRecipeChange(String(r.id))}
                      className={`p-2 rounded-lg cursor-pointer text-xs flex items-center justify-between transition ${
                        String(selectedRecipeId) === String(r.id)
                          ? 'bg-brand-50 text-brand-900 font-bold border border-brand-200'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{r.title}</span>
                      <span className="text-slate-400 font-normal">
                        {r.servings} servings
                      </span>
                    </div>
                  ))}
                  {filteredRecipes.length === 0 && (
                    <p className="text-center py-4 text-xs text-slate-400">
                      No recipes matching "{recipeSearch}"
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Servings Override (optional)
                </label>
                <input
                  type="number"
                  min="1"
                  value={servingsOverride}
                  onChange={(e) => setServingsOverride(e.target.value)}
                  placeholder="Defaults to recipe servings"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Ingredients will automatically be scaled to this quantity in your grocery list.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSlot || !selectedRecipeId}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-sm transition disabled:opacity-60"
                >
                  {savingSlot ? 'Saving...' : 'Confirm Slot'}
                </button>
              </div>
            </>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default WeeklyPlanner;
