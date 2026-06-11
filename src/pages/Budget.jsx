import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import MainLayout from '../layouts/MainLayout'

function Budget() {
  const [budget, setBudget] = useState(null)
  const [totalSpent, setTotalSpent] = useState(0)
  const [inputAmount, setInputAmount] = useState('')
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    const { data: budgetData } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .single()

    setBudget(budgetData || null)
    setInputAmount(budgetData?.amount || '')

    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

    const { data: expenses } = await supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', user.id)
      .gte('date', firstDay)
      .lte('date', lastDay)

    const total = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0
    setTotalSpent(total)
  }

  const handleSave = async () => {
    if (!inputAmount || isNaN(inputAmount) || parseFloat(inputAmount) <= 0) {
      setError('Please enter a valid budget amount')
      return
    }
    setLoading(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()

    if (budget) {
      await supabase
        .from('budgets')
        .update({ amount: parseFloat(inputAmount) })
        .eq('user_id', user.id)
    } else {
      await supabase
        .from('budgets')
        .insert({ user_id: user.id, amount: parseFloat(inputAmount) })
    }

    await fetchData()
    setEditing(false)
    setLoading(false)
  }

  const budgetAmount = budget?.amount || 0
  const remaining = budgetAmount - totalSpent
  const percentage = budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Budget</h1>
          <p className="text-gray-500 mt-1">Manage your monthly budget</p>
        </div>

        {/* Budget Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-xs text-gray-400 uppercase font-semibold mb-4">Monthly Budget</p>

            {!editing ? (
              <>
                <p className="text-4xl font-bold text-gray-800 mb-1">
                  ${budgetAmount.toFixed(2)}
                </p>
                <p className="text-sm text-gray-400 mb-6">Current monthly limit</p>
                <button
                  onClick={() => setEditing(true)}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition cursor-pointer"
                >
                  {budget ? 'Edit Budget' : 'Set Budget'}
                </button>
              </>
            ) : (
              <>
                {error && (
                  <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg mb-4">
                    {error}
                  </div>
                )}
                <input
                  type="number"
                  value={inputAmount}
                  onChange={(e) => setInputAmount(e.target.value)}
                  placeholder="Enter budget amount"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => { setEditing(false); setError('') }}
                    className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Spending Overview */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-xs text-gray-400 uppercase font-semibold mb-4">This Month</p>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Spent</span>
                <span className="text-sm font-bold text-red-500">${totalSpent.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Remaining</span>
                <span className={`text-sm font-bold ${remaining < 0 ? 'text-red-500' : 'text-green-500'}`}>
                  ${remaining.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Budget</span>
                <span className="text-sm font-bold text-gray-800">${budgetAmount.toFixed(2)}</span>
              </div>

              {/* Progress Bar */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Usage</span>
                  <span className={`text-xs font-medium ${percentage >= 80 ? 'text-red-500' : 'text-gray-600'}`}>
                    {percentage.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div
                    className={`h-2 rounded-full transition-all ${percentage >= 100 ? 'bg-red-500' : percentage >= 80 ? 'bg-yellow-400' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>

              {percentage >= 80 && budgetAmount > 0 && (
                <div className={`text-xs p-3 rounded-lg font-medium ${percentage >= 100 ? 'bg-red-50 text-red-500' : 'bg-yellow-50 text-yellow-600'}`}>
                  {percentage >= 100
                    ? '⚠️ You have exceeded your monthly budget!'
                    : `⚠️ You've used ${percentage.toFixed(0)}% of your budget!`}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default Budget