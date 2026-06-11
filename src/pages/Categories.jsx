import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import MainLayout from '../layouts/MainLayout'

const CATEGORY_COLORS = {
  Food: 'bg-blue-500',
  Transport: 'bg-green-500',
  Shopping: 'bg-yellow-500',
  Bills: 'bg-red-500',
  Entertainment: 'bg-purple-500',
  Other: 'bg-gray-500',
}

const CATEGORY_LIGHT = {
  Food: 'bg-blue-50 text-blue-600',
  Transport: 'bg-green-50 text-green-600',
  Shopping: 'bg-yellow-50 text-yellow-600',
  Bills: 'bg-red-50 text-red-600',
  Entertainment: 'bg-purple-50 text-purple-600',
  Other: 'bg-gray-50 text-gray-600',
}

function Categories() {
  const [expenses, setExpenses] = useState([])

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
    setExpenses(data || [])
  }

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)

  const categoryData = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other'].map(cat => {
    const catExpenses = expenses.filter(e => e.category === cat)
    const total = catExpenses.reduce((sum, e) => sum + e.amount, 0)
    const percentage = totalSpent > 0 ? ((total / totalSpent) * 100).toFixed(1) : 0
    const count = catExpenses.length
    return { cat, total, percentage, count }
  }).filter(c => c.count > 0)

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
          <p className="text-gray-500 mt-1">Spending breakdown by category</p>
        </div>

        {categoryData.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center text-gray-400 text-sm">
            No expenses yet — add some to see your category breakdown!
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {categoryData.map(({ cat, total, percentage, count }) => (
                <div key={cat} className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-600">
                      {cat}
                    </span>
                    <span className="text-xs text-gray-400">{count} transaction{count !== 1 ? 's' : ''}</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">${total.toFixed(2)}</p>
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">of total spending</span>
                      <span className="text-xs font-medium text-gray-600">{percentage}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div
                        className={`h-1.5 rounded-full ${CATEGORY_COLORS[cat]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Category Table */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-sm font-bold text-gray-800 mb-4">Category Summary</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 uppercase border-b border-gray-100">
                    <th className="pb-2">Category</th>
                    <th className="pb-2 text-center hidden md:table-cell">Transactions</th>
                    <th className="pb-2 text-right">Total Spent</th>
                    <th className="pb-2 text-right hidden md:table-cell">% of Total</th>
                  </tr>
                </thead>
              <tbody>
                  {categoryData.sort((a, b) => b.total - a.total).map(({ cat, total, percentage, count }) => (
                    <tr key={cat} className="border-b border-gray-50 last:border-0">
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${CATEGORY_COLORS[cat]}`} />
                          <span className="text-gray-700">{cat}</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-center text-gray-500 hidden md:table-cell">{count}</td>
                      <td className="py-2.5 text-right font-medium text-gray-800">${total.toFixed(2)}</td>
                      <td className="py-2.5 text-right text-gray-500 hidden md:table-cell">{percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  )
}

export default Categories