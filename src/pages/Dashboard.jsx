import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import AddExpenseModal from '../components/AddExpenseModal'
import EditExpenseModal from '../components/EditExpenseModal'
import ConfirmModal from '../components/ConfirmModal'
// import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

function Dashboard() {
  const [expenses, setExpenses] = useState([])
  const [budget, setBudget] = useState(0)
  const [lastMonthTotal, setLastMonthTotal] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate() 

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch this month's expenses
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

    const { data: expenseData } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', firstDay)
      .lte('date', lastDay)

    setExpenses(expenseData || [])

    // Fetch last month's expenses
    const firstDayLast = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
    const lastDayLast = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()

    const { data: lastMonthData } = await supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', user.id)
      .gte('date', firstDayLast)
      .lte('date', lastDayLast)

    const lastTotal = lastMonthData?.reduce((sum, e) => sum + e.amount, 0) || 0
    setLastMonthTotal(lastTotal)

    // Fetch budget
    const { data: budgetData } = await supabase
      .from('budgets')
      .select('amount')
      .eq('user_id', user.id)
      .single()

    setBudget(budgetData?.amount || 0)
    setLoading(false)
  }
  
  // Delete expense
  const handleDelete = async () => {
  await supabase.from('expenses').delete().eq('id', deletingId)
  setDeletingId(null)
  fetchData()
  }
  // Total spent this month
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
  const remaining = budget - totalSpent
  const budgetPercent = budget > 0 ? (totalSpent / budget) * 100 : 0

  // vs last month
  const vsLastMonth = lastMonthTotal > 0
    ? (((totalSpent - lastMonthTotal) / lastMonthTotal) * 100).toFixed(1)
    : null

  // Weekly chart data
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const weeklyData = days.map((day, i) => {
  const jsDay = i === 6 ? 0 : i + 1
  const dayTotal = expenses
    .filter(e => {
      const parts = e.date.split('-')
      const d = new Date(parts[0], parts[1] - 1, parts[2])
      return d.getDay() === jsDay
    })
    .reduce((sum, e) => sum + e.amount, 0)
  return { day, amount: dayTotal }
})

  // Top categories
  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {})
  const topCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)

  const categoryColors = {
    Food: 'bg-blue-500',
    Transport: 'bg-green-500',
    Shopping: 'bg-yellow-500',
    Bills: 'bg-red-500',
    Entertainment: 'bg-purple-500',
    Other: 'bg-gray-500',
  }

  // Recent transactions
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)

return (
    <MainLayout>
      <div className="p-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Financial Overview</h1>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition cursor-pointer"
              >
                + Add Expense
              </button>
            </div>

            {/* Budget Alert */}
            {budgetPercent >= 80 && budget > 0 && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6 text-sm font-medium">
                ⚠️ Budget Alert — You've used {budgetPercent.toFixed(0)}% of your monthly budget!
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Monthly Spending</p>
                <p className="text-3xl font-bold text-gray-800">${totalSpent.toFixed(2)}</p>
                {vsLastMonth !== null && (
                  <p className={`text-xs mt-1 font-medium ${parseFloat(vsLastMonth) > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {parseFloat(vsLastMonth) > 0 ? '↑' : '↓'} {Math.abs(vsLastMonth)}% vs last month
                  </p>
                )}
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Remaining Budget</p>
                <p className="text-3xl font-bold text-gray-800">${remaining.toFixed(2)}</p>
                <div className="mt-2 h-1.5 bg-gray-100 rounded-full">
                  <div
                    className={`h-1.5 rounded-full ${budgetPercent >= 80 ? 'bg-red-500' : 'bg-yellow-400'}`}
                    style={{ width: `${Math.min(budgetPercent, 100)}%` }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Total Transactions</p>
                <p className="text-3xl font-bold text-gray-800">{expenses.length}</p>
                <p className="text-xs text-gray-400 mt-1">This month</p>
              </div>
            </div>

            {/* Chart + Top Categories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="col-span-2 bg-white rounded-2xl p-5 shadow-sm">
                <p className="text-sm font-bold text-gray-800 mb-4">Weekly Spending Habits</p>
                {expenses.length === 0 ? (
                  <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
                    No expenses yet
                  </div>
                ) : (
                  <div className="flex items-end justify-between gap-2 h-40 px-2">
                    {weeklyData.map(({ day, amount }) => {
                      const maxAmount = Math.max(...weeklyData.map(d => d.amount))
                      const heightPercent = maxAmount > 0 ? (amount / maxAmount) * 100 : 0
                      return (
                        <div key={day} className="flex flex-col items-center gap-1 flex-1">
                          <span className="text-xs text-gray-500">{amount > 0 ? `$${amount}` : ''}</span>
                          <div className="w-full flex items-end" style={{ height: '100px' }}>
                            <div
                              className="w-full bg-blue-500 rounded-t-md transition-all"
                              style={{ height: `${heightPercent}%`, minHeight: amount > 0 ? '4px' : '0' }}
                            />
                          </div>
                          <span className="text-xs text-gray-400">{day}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <p className="text-sm font-bold text-gray-800 mb-4">Top Categories</p>
                {topCategories.length === 0 ? (
                  <p className="text-gray-400 text-sm">No data yet</p>
                ) : (
                  <div className="space-y-3">
                    {topCategories.map(([category, amount]) => (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${categoryColors[category] || 'bg-gray-400'}`} />
                          <span className="text-sm text-gray-600">{category}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-800">${amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-gray-800">Recent Transactions</p>
                <button onClick={() => navigate('/transactions')} className="text-sm text-blue-600 hover:underline cursor-pointer">View All</button>
              </div>
              {recentExpenses.length === 0 ? (
                <p className="text-gray-400 text-sm">No transactions yet</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-400 uppercase border-b border-gray-100">
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Note</th>
                      <th className="pb-2">Category</th>
                      <th className="pb-2 text-right">Amount</th>
                      <th className="pb-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentExpenses.map(expense => (
                      <tr key={expense.id} className="border-b border-gray-50 last:border-0">
                        <td className="py-2.5 text-gray-500">{expense.date}</td>
                        <td className="py-2.5 text-gray-700">{expense.note || '—'}</td>
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
          </>
        )}
      </div>

      {showModal && (
        <AddExpenseModal
          onClose={() => setShowModal(false)}
          onAdded={fetchData}
        />
      )}
      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
          onUpdated={fetchData}
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

export default Dashboard