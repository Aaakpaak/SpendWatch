import { create } from 'zustand'

const DEFAULT_CATEGORIES = [
  { id: 'food', name: 'Food', icon: '🍔', color: '#f59e0b', isDefault: true },
  { id: 'transport', name: 'Travel', icon: '🚗', color: '#3b82f6', isDefault: true },
  { id: 'shopping', name: 'Shop', icon: '🛍️', color: '#ec4899', isDefault: true },
  { id: 'health', name: 'Health', icon: '💊', color: '#10b981', isDefault: true },
  { id: 'entertainment', name: 'Fun', icon: '🎮', color: '#8b5cf6', isDefault: true },
  { id: 'utilities', name: 'Bills', icon: '💡', color: '#06b6d4', isDefault: true },
  { id: 'education', name: 'Study', icon: '📚', color: '#6366f1', isDefault: true },
  { id: 'other', name: 'Other', icon: '💰', color: '#9ca3af', isDefault: true },
]

const CAT_COLORS = [
  '#f59e0b','#3b82f6','#ec4899','#10b981',
  '#8b5cf6','#06b6d4','#ef4444','#6366f1',
  '#14b8a6','#f97316','#a855f7','#84cc16'
]

function loadFromStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch {
    return fallback
  }
}

const initialExpenses = loadFromStorage('spendwatch_expenses', [])

const useExpenseStore = create((set, get) => ({
  // ── State ──────────────────────────────
  expenses: initialExpenses,
  categories: loadFromStorage('spendwatch_categories', DEFAULT_CATEGORIES),
  currentScreen: 'landing',
  currentMonth: new Date().toISOString(),

  // ── Navigation ─────────────────────────
  setScreen: (screen) => set({ currentScreen: screen }),

  // ── Month navigation ───────────────────
  setCurrentMonth: (date) => set({ currentMonth: date.toISOString() }),

  // ── Expenses ───────────────────────────
  addExpense: (expense) => {
    const updated = [...get().expenses, expense]
    localStorage.setItem('spendwatch_expenses', JSON.stringify(updated))
    set({ expenses: updated })
  },

  deleteExpense: (id) => {
    const updated = get().expenses.filter(e => e.id !== id)
    localStorage.setItem('spendwatch_expenses', JSON.stringify(updated))
    set({ expenses: updated })
  },

  // ── Categories ─────────────────────────
  addCategory: (name, icon) => {
    const cats = get().categories
    const newCat = {
      id: 'custom_' + Date.now(),
      name: name.slice(0, 14),
      icon: icon || '📝',
      color: CAT_COLORS[cats.length % CAT_COLORS.length],
      isDefault: false
    }
    const updated = [...cats, newCat]
    localStorage.setItem('spendwatch_categories', JSON.stringify(updated))
    set({ categories: updated })
    return newCat
  },

  deleteCategory: (id) => {
    const updated = get().categories.filter(c => c.id !== id)
    localStorage.setItem('spendwatch_categories', JSON.stringify(updated))
    set({ categories: updated })
  },

  getCat: (id) => {
    return get().categories.find(c => c.id === id)
      || { name: id, icon: '📝', color: '#9ca3af' }
  },

  // ── Computed helpers ───────────────────
  getExpensesForDate: (dateStr) => {
    return get().expenses.filter(e => e.date === dateStr)
  },

  getDayTotal: (dateStr) => {
    return get().expenses
      .filter(e => e.date === dateStr)
      .reduce((s, e) => s + e.amount, 0)
  },

  getMonthTotal: (year, month) => {
    return get().expenses
      .filter(e => {
        const d = new Date(e.date)
        return d.getFullYear() === year && d.getMonth() === month
      })
      .reduce((s, e) => s + e.amount, 0)
  },

  getYearTotal: (year) => {
    return get().expenses
      .filter(e => new Date(e.date).getFullYear() === year)
      .reduce((s, e) => s + e.amount, 0)
  },
}))

export default useExpenseStore