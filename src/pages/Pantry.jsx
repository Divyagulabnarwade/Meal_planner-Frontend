import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';
import {
  Package,
  Plus,
  Search,
  Trash2,
  Edit2,
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
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

const Pantry = () => {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'expiring', 'low-stock'

  // Add / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pcs');
  const [expiryDate, setExpiryDate] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPantry = async () => {
    try {
      setLoading(true);
      const res = await api.get('/pantry');
      setItems(res.data.data || []);
    } catch (err) {
      console.error('Failed to load pantry items', err);
      toast.error('Failed to load kitchen pantry items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPantry();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setQuantity('1');
    setUnit('pcs');
    setExpiryDate('');
    setLowStockThreshold('');
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setName(item.name);
    setQuantity(String(item.quantity));
    setUnit(item.unit);
    setExpiryDate(item.expiryDate || '');
    setLowStockThreshold(item.lowStockThreshold != null ? String(item.lowStockThreshold) : '');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSubmitting(true);
      const payload = {
        name: name.trim().toLowerCase(),
        quantity: parseFloat(quantity) || 1,
        unit: unit.trim().toLowerCase(),
        expiryDate: expiryDate ? expiryDate : null,
        lowStockThreshold: lowStockThreshold ? parseFloat(lowStockThreshold) : null,
      };

      if (editingItem) {
        await api.put(`/pantry/${editingItem.id}`, payload);
        toast.success(`Updated "${payload.name}" in pantry.`);
      } else {
        await api.post('/pantry', payload);
        toast.success(`Added "${payload.name}" to pantry.`);
      }

      setModalOpen(false);
      await fetchPantry();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save pantry item. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, itemName) => {
    if (!window.confirm(`Remove "${itemName}" from pantry?`)) return;

    try {
      await api.delete(`/pantry/${id}`);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.info(`Removed "${itemName}" from pantry.`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove pantry item.');
    }
  };

  const expiringCount = items.filter((i) => i.isExpired || i.isExpiringSoon).length;
  const lowStockCount = items.filter((i) => i.isLowStock).length;

  const filteredItems = items.filter((i) => {
    const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (activeFilter === 'expiring') return i.isExpired || i.isExpiringSoon;
    if (activeFilter === 'low-stock') return i.isLowStock;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Kitchen Pantry
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track on-hand staples, expiration alerts, and auto-deduct available items from grocery lists.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/recommendations"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-semibold rounded-xl border border-emerald-200 transition"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Find Recipes I Can Cook</span>
          </Link>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Stock ({items.length})
          </button>

          <button
            onClick={() => setActiveFilter('expiring')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeFilter === 'expiring'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Expiring Soon / Expired ({expiringCount})
          </button>

          <button
            onClick={() => setActiveFilter('low-stock')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeFilter === 'low-stock'
                ? 'bg-orange-600 text-white'
                : 'bg-orange-50 text-orange-800 hover:bg-orange-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Low Stock ({lowStockCount})
          </button>
        </div>

        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pantry by item name (e.g. olive oil, rice, salt)..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Pantry Items Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" text="Taking kitchen inventory..." />
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No pantry items found"
          description={
            search
              ? 'No matching pantry items found for your search query.'
              : activeFilter !== 'all'
              ? 'No items matching this alert category!'
              : 'Add your on-hand spices, grains, and oils to prevent buying duplicates!'
          }
          action={
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-xs font-semibold rounded-xl hover:bg-brand-700 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Item</span>
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            let statusBadge = null;
            if (item.isExpired) {
              statusBadge = (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                  <AlertTriangle className="w-3 h-3 text-rose-600" /> Expired
                </span>
              );
            } else if (item.isExpiringSoon) {
              statusBadge = (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                  <Clock className="w-3 h-3 text-amber-600" /> Expiring Soon
                </span>
              );
            } else if (item.isLowStock) {
              statusBadge = (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-100 text-orange-800 border border-orange-200">
                  <AlertTriangle className="w-3 h-3 text-orange-600" /> Low Stock
                </span>
              );
            } else {
              statusBadge = (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> In Stock
                </span>
              );
            }

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-800 capitalize truncate flex-1">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                        title="Edit item"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-xl font-black text-brand-700">
                      {item.quantity}{' '}
                      <span className="text-xs font-semibold text-slate-500">{item.unit}</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {statusBadge}
                  </div>

                  {/* Expiry date details */}
                  {item.expiryDate && (
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>Best before: {item.expiryDate}</span>
                    </div>
                  )}
                  {item.lowStockThreshold != null && (
                    <div className="text-[11px] text-slate-400">
                      Min threshold: {item.lowStockThreshold} {item.unit}
                    </div>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Pantry inventory</span>
                  <Sparkles className="w-3 h-3 text-brand-400" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Pantry Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit Pantry Item' : 'Add On-Hand Pantry Item'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Item Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Olive oil, Flour, Rice, Salt"
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
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Unit *
              </label>
              <input
                list="pantry-units"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                required
                placeholder="g, kg, ml, tbsp"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <datalist id="pantry-units">
                {COMMON_UNITS.map((u) => (
                  <option key={u} value={u} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Expiry Date
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Low-Stock Threshold
              </label>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="e.g. 2"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
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
              disabled={submitting || !name.trim()}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-sm transition disabled:opacity-60"
            >
              {submitting ? 'Saving...' : editingItem ? 'Update Stock' : 'Add to Pantry'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Pantry;
