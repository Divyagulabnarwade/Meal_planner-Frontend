import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';
import {
  ShoppingCart,
  Printer,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  RefreshCw,
  Sparkles,
  Calendar,
  Layers,
  ChevronDown,
  Edit2,
} from 'lucide-react';

const GroceryList = () => {
  const [searchParams] = useSearchParams();
  const toast = useToast();

  // Date range inputs (default to current week)
  const [startDate, setStartDate] = useState(() => {
    const param = searchParams.get('startDate');
    if (param) return param;
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(d.setDate(diff));
    return mon.toISOString().split('T')[0];
  });

  const [endDate, setEndDate] = useState(() => {
    const param = searchParams.get('endDate');
    if (param) return param;
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const sun = new Date(d.setDate(diff + 6));
    return sun.toISOString().split('T')[0];
  });

  const [subtractPantry, setSubtractPantry] = useState(true);
  const [activeList, setActiveList] = useState(null);
  const [previousLists, setPreviousLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Custom Item Modal State
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customQty, setCustomQty] = useState('1');
  const [customUnit, setCustomUnit] = useState('pcs');
  const [addingCustom, setAddingCustom] = useState(false);

  // Edit Quantity Modal State
  const [editQtyModalOpen, setEditQtyModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editQtyValue, setEditQtyValue] = useState('1');
  const [updatingQty, setUpdatingQty] = useState(false);

  // Fetch recent grocery lists on mount
  useEffect(() => {
    const fetchLists = async () => {
      try {
        setLoading(true);
        const res = await api.get('/grocery-lists');
        const lists = res.data.data || [];
        setPreviousLists(lists);
        if (lists.length > 0) {
          // If URL params exist or default, load latest
          loadList(lists[0].id);
        }
      } catch (err) {
        console.error('Failed to load grocery lists', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLists();
  }, []);

  const loadList = async (id) => {
    try {
      setLoading(true);
      const res = await api.get(`/grocery-lists/${id}`);
      setActiveList(res.data.data);
    } catch (err) {
      console.error('Failed to fetch list', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    try {
      setGenerating(true);
      const res = await api.post('/grocery-lists/generate', {
        startDate,
        endDate,
        subtractPantry,
      });
      const newList = res.data.data;
      setActiveList(newList);
      setPreviousLists((prev) => [newList, ...prev.filter((l) => l.id !== newList.id)]);
      toast.success('Generated grocery shopping list!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate grocery list.');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleItem = async (itemId, currentChecked) => {
    if (!activeList) return;

    // Optimistic UI update
    const nextChecked = !currentChecked;
    setActiveList((prev) => ({
      ...prev,
      items: prev.items.map((it) =>
        it.id === itemId ? { ...it, checked: nextChecked } : it
      ),
      checkedItems: nextChecked ? prev.checkedItems + 1 : prev.checkedItems - 1,
    }));

    try {
      await api.patch(`/grocery-lists/${activeList.id}/items/${itemId}`, {
        checked: nextChecked,
      });
    } catch (err) {
      // Revert on error
      setActiveList((prev) => ({
        ...prev,
        items: prev.items.map((it) =>
          it.id === itemId ? { ...it, checked: currentChecked } : it
        ),
        checkedItems: currentChecked ? prev.checkedItems + 1 : prev.checkedItems - 1,
      }));
      toast.error('Failed to update item check status.');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!activeList) return;
    try {
      await api.delete(`/grocery-lists/${activeList.id}/items/${itemId}`);
      setActiveList((prev) => ({
        ...prev,
        items: prev.items.filter((it) => it.id !== itemId),
        totalItems: prev.totalItems - 1,
      }));
      toast.info('Item removed from grocery list.');
    } catch (err) {
      toast.error('Failed to delete item.');
    }
  };

  const handleOpenEditQty = (e, item) => {
    e.stopPropagation();
    setEditingItem(item);
    setEditQtyValue(String(item.quantity));
    setEditQtyModalOpen(true);
  };

  const handleUpdateQuantity = async (e) => {
    e.preventDefault();
    if (!activeList || !editingItem) return;

    try {
      setUpdatingQty(true);
      const parsedQty = parseFloat(editQtyValue);
      if (isNaN(parsedQty) || parsedQty <= 0) {
        toast.error('Please enter a valid positive quantity.');
        return;
      }

      const res = await api.patch(
        `/grocery-lists/${activeList.id}/items/${editingItem.id}/quantity`,
        { quantity: parsedQty }
      );
      const updated = res.data.data;

      setActiveList((prev) => ({
        ...prev,
        items: prev.items.map((it) => (it.id === editingItem.id ? updated : it)),
      }));

      toast.success(`Updated quantity for "${editingItem.name}".`);
      setEditQtyModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update quantity.');
    } finally {
      setUpdatingQty(false);
    }
  };

  const handleAddCustomItem = async (e) => {
    e.preventDefault();
    if (!activeList || !customName.trim()) return;

    try {
      setAddingCustom(true);
      const res = await api.post(`/grocery-lists/${activeList.id}/items`, {
        name: customName.trim(),
        quantity: parseFloat(customQty) || 1,
        unit: customUnit.trim(),
      });
      const newItem = res.data.data;
      setActiveList((prev) => ({
        ...prev,
        items: [...prev.items, newItem],
        totalItems: prev.totalItems + 1,
      }));
      toast.success(`Added "${newItem.name}" to grocery list.`);
      setCustomModalOpen(false);
      setCustomName('');
      setCustomQty('1');
    } catch (err) {
      toast.error('Failed to add custom item.');
    } finally {
      setAddingCustom(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Printable Header (Visible only when printing) */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold">{activeList?.title || 'Grocery Shopping List'}</h1>
        <p className="text-sm text-gray-500">
          Generated on {new Date().toLocaleDateString()} · Range: {activeList?.startDate} to {activeList?.endDate}
        </p>
      </div>

      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Grocery List Generator
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Intelligently aggregate and convert recipe ingredients with automatic pantry subtraction
          </p>
        </div>

        {activeList && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCustomModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 shadow-sm transition"
            >
              <Plus className="w-4 h-4 text-brand-600" />
              <span>Add Custom Item</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print List</span>
            </button>
          </div>
        )}
      </div>

      {/* Generator Control Panel */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-2 pb-2.5">
            <input
              type="checkbox"
              id="subtractPantryCheck"
              checked={subtractPantry}
              onChange={(e) => setSubtractPantry(e.target.checked)}
              className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
            />
            <label htmlFor="subtractPantryCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Subtract On-Hand Pantry
            </label>
          </div>

          <div>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 transition disabled:opacity-60"
            >
              {generating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>Generate Grocery List</span>
            </button>
          </div>
        </div>

        {/* Previous Lists Selector */}
        {previousLists.length > 1 && (
          <div className="pt-4 border-t border-slate-100 flex items-center gap-3 text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Saved Lists:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {previousLists.slice(0, 5).map((l) => (
                <button
                  key={l.id}
                  onClick={() => loadList(l.id)}
                  className={`px-3 py-1 rounded-lg font-medium transition text-xs whitespace-nowrap ${
                    activeList?.id === l.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {l.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main List Content */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" text="Loading shopping list..." />
        </div>
      ) : !activeList || activeList.items.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="No grocery items found"
          description="Click 'Generate Grocery List' above for your scheduled dates to automatically merge all meal ingredients."
          action={
            <button
              onClick={handleGenerate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-xs font-semibold rounded-xl hover:bg-brand-700 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate For Current Week</span>
            </button>
          }
        />
      ) : (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">{activeList.title}</h2>
              <p className="text-xs text-slate-500">
                {activeList.startDate} to {activeList.endDate} · {activeList.items.length} items
              </p>
            </div>
            <div className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 self-start sm:self-auto">
              {activeList.checkedItems} of {activeList.items.length} items checked
            </div>
          </div>

          {/* Grocery Items List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {activeList.items.map((item) => (
              <div
                key={item.id}
                onClick={() => handleToggleItem(item.id, item.checked)}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  item.checked
                    ? 'bg-slate-50/70 border-slate-100 text-slate-400 line-through'
                    : 'bg-white border-slate-200/90 hover:border-brand-400 hover:shadow-sm text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.checked ? (
                    <CheckCircle2 className="w-5 h-5 text-brand-500 flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 group-hover:text-brand-500 flex-shrink-0" />
                  )}
                  <div className="overflow-hidden">
                    <p className={`text-sm font-semibold capitalize truncate ${item.checked ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {item.name}
                    </p>
                    {item.isCustom && (
                      <span className="inline-block text-[10px] font-bold text-brand-700 bg-brand-50 px-1.5 py-0.2 rounded mt-0.5">
                        Custom
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${item.checked ? 'text-slate-400' : 'text-brand-700'}`}>
                    {item.quantity} {item.unit}
                  </span>
                  <button
                    onClick={(e) => handleOpenEditQty(e, item)}
                    className="p-1 text-slate-300 hover:text-slate-700 hover:bg-slate-100 rounded transition no-print"
                    title="Edit quantity"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteItem(item.id);
                    }}
                    className="p-1 text-slate-300 hover:text-rose-600 rounded transition no-print"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Item Modal */}
      <Modal
        isOpen={customModalOpen}
        onClose={() => setCustomModalOpen(false)}
        title="Add Custom Grocery Item"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddCustomItem} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Item Name *
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              required
              placeholder="e.g. Dish soap, Paper towels, Sparkling water"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Quantity *
              </label>
              <input
                type="number"
                step="any"
                min="0.001"
                value={customQty}
                onChange={(e) => setCustomQty(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Unit *
              </label>
              <input
                type="text"
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value)}
                required
                placeholder="pcs, pack, bottle, g"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCustomModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addingCustom || !customName.trim()}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-sm transition disabled:opacity-60"
            >
              {addingCustom ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Quantity Modal */}
      <Modal
        isOpen={editQtyModalOpen}
        onClose={() => setEditQtyModalOpen(false)}
        title={`Adjust Quantity: ${editingItem?.name || ''}`}
        maxWidth="max-w-xs"
      >
        <form onSubmit={handleUpdateQuantity} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Quantity ({editingItem?.unit}) *
            </label>
            <input
              type="number"
              step="any"
              min="0.001"
              value={editQtyValue}
              onChange={(e) => setEditQtyValue(e.target.value)}
              required
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditQtyModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updatingQty}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-sm transition disabled:opacity-60"
            >
              {updatingQty ? 'Saving...' : 'Update'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default GroceryList;
