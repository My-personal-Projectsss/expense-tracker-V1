import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import MainLayout from '../layouts/MainLayout'
import AddExpenseModal from '../components/AddExpenseModal'
import EditExpenseModal from '../components/EditExpenseModal'
import ConfirmModal from '../components/ConfirmModal'

const CATEGORIES = ['All', 'Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other']

function Transactions() {
  const [expenses, setExpenses] = useState([])
  const [filtered, setFiltered] = useState([])
  const [category, setCategory] = useState('All')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    fetchExpenses()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [expenses, category, startDate, endDate])

  const fetchExpenses = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
    setExpenses(data || [])
  }

  const applyFilters = () => {
    let result = [...expenses]
    if (category !== 'All') {
      result = result.filter(e => e.category === category)
    }
    if (startDate) {
      result = result.filter(e => e.date >= startDate)
    }
    if (endDate) {
      result = result.filter(e => e.date <= endDate)
    }
    setFiltered(result)
  }

  const handleDelete = async () => {
    await supabase.from('expenses').delete().eq('id', deletingId)
    setDeletingId(null)
    fetchExpenses()
  }

  const totalFiltered = filtered.reduce((sum, e) => sum + e.amount, 0)

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
            <p className="text-gray-500 mt-1">All your recorded expenses</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition cursor-pointer"
          >
            + Add Expense
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs text-gray-400 uppercase font-semibold mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 uppercase font-semibold mb-1">From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 uppercase font-semibold mb-1">To</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => { setCategory('All'); setStartDate(''); setEndDate('') }}
              className="text-sm text-gray-400 hover:text-gray-600 transition cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-gray-800">
              {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
            </p>
            <p className="text-sm font-bold text-gray-800">
              Total: <span className="text-red-500">${totalFiltered.toFixed(2)}</span>
            </p>
          </div>
          {filtered.length === 0 ? (
            <p className="text-gray-400 text-sm">No transactions found</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase border-b border-gray-100">
                  <th className="pb-2">Date</th>
                  <th className="pb-2 hidden md:table-cell">Note</th>
                  <th className="pb-2">Category</th>
                  <th className="pb-2 text-right">Amount</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(expense => (
                  <tr key={expense.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 text-gray-500">{expense.date}</td>
                    <td className="py-2.5 text-gray-700 hidden md:table-cell">{expense.note || '—'}</td>
                    <td className="py-2.5">
                      <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full">
                        {expense.category}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-medium text-red-500">
                      -${expense.amount.toFixed(2)}
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => setEditingExpense(expense)}
                        className="text-gray-400 hover:text-blue-500 transition cursor-pointer text-xs mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingId(expense.id)}
                        className="text-gray-400 hover:text-red-500 transition cursor-pointer text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddExpenseModal
          onClose={() => setShowAddModal(false)}
          onAdded={fetchExpenses}
        />
      )}
      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
          onUpdated={fetchExpenses}
        />
      )}
      {deletingId && (
        <ConfirmModal
          message="This expense will be permanently deleted."
          onConfirm={handleDelete}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </MainLayout>
  )
}

export default Transactions