import { Link } from 'react-router-dom'

function Landing() {
  return (
    <div className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 md:px-16 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">$</div>
          <span className="text-lg font-bold text-gray-800">TrackIt</span>
        </div>
      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
        <Link to="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
          Get Started
        </Link>
        <Link to="/login" className="text-sm text-gray-600 font-medium hover:text-gray-800 transition">
          Log In
        </Link>
      </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col md:flex-row items-center justify-between px-8 md:px-16 py-16 md:py-24 gap-12">
        {/* Left */}
        <div className="flex-1 max-w-lg">
          <span className="bg-gray-100 text-gray-600 text-sm px-4 py-1.5 rounded-full font-medium">
            Simple. Fast. Powerful.
          </span>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 mt-6 mb-5 leading-tight">
            TrackIt
          </h1>
          <p className="text-lg text-gray-500 mb-8 leading-relaxed">
            Take control of your finances. Log expenses in seconds, set budgets, and see exactly where your money goes — all in one clean dashboard.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Link
              to="/signup"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
            >
              Get Started for Free →
            </Link>
            <Link
              to="/login"
              className="text-sm text-gray-500 font-medium hover:text-gray-700 transition"
            >
              Already have an account?
            </Link>
          </div>
        </div>

        {/* Right — Mock Dashboard */}
        <div className="flex-1 w-full max-w-lg">
          <div className="bg-gray-50 rounded-3xl p-6 shadow-sm">
            {/* Mock stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Monthly Spending</p>
                <p className="text-2xl font-bold text-gray-800">$1,240.00</p>
                <p className="text-xs text-green-500 mt-1">↓ 8% vs last month</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Remaining Budget</p>
                <p className="text-2xl font-bold text-gray-800">$760.00</p>
                <div className="mt-2 h-1.5 bg-gray-100 rounded-full">
                  <div className="h-1.5 rounded-full bg-yellow-400 w-3/5" />
                </div>
              </div>
            </div>
            {/* Mock chart */}
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-3">
              <p className="text-xs font-bold text-gray-700 mb-3">Weekly Spending Habits</p>
              <div className="flex items-end justify-between gap-1 h-16">
                {[40, 70, 50, 90, 60, 30, 45].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-blue-500 rounded-t-sm"
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <span key={i} className="flex-1 text-center text-xs text-gray-400">{d}</span>
                ))}
              </div>
            </div>
            {/* Mock transactions */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-bold text-gray-700 mb-3">Recent Transactions</p>
              <div className="space-y-2">
                {[
                  { note: 'Grocery Store', cat: 'Food', amount: '-$45.00' },
                  { note: 'Uber Ride', cat: 'Transport', amount: '-$12.50' },
                  { note: 'Netflix', cat: 'Entertainment', amount: '-$15.99' },
                ].map((t, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">{t.note}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{t.cat}</span>
                      <span className="text-xs font-medium text-red-500">{t.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 px-8 md:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div>
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm mb-4">
              ⚡
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Fast Logging</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Add an expense in seconds. Amount, category, note — done. No friction, no fuss.
            </p>
          </div>
          <div>
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm mb-4">
              📊
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Clear Dashboard</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              See your spending at a glance. Weekly charts, top categories, and real-time budget tracking.
            </p>
          </div>
          <div>
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm mb-4">
              🚨
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Budget Alerts</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Set a monthly budget and get warned before you overspend. Stay in control every month.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="flex flex-col sm:flex-row items-center justify-between px-8 md:px-16 py-6 border-t border-gray-100 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold text-xs">$</div>
          <span className="text-sm font-bold text-gray-800">TrackIt</span>
        </div>
        <p className="text-xs text-gray-400">© 2026 TrackIt. All rights reserved.</p>
      </footer>

    </div>
  )
}

export default Landing