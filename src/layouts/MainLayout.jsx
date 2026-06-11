import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useEffect } from 'react'

function MainLayout({ children }) {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(data)
      }
    }
    getProfile()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const navLinks = [
    { to: '/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/transactions', icon: '💳', label: 'Transactions' },
    { to: '/categories', icon: '🗂️', label: 'Categories' },
    { to: '/budget', icon: '🎯', label: 'Budget' },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-white flex flex-col shadow-sm transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        {/* Logo */}
        <div className="p-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">$</div>
            <span className="text-lg font-bold text-gray-800">ExpenseTracker</span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`
              }
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Profile + Logout */}
        <div className="p-4 border-t border-gray-100">
          <div
            onClick={() => { navigate('/profile'); setSidebarOpen(false) }}
            className="bg-gray-50 rounded-xl p-3 cursor-pointer hover:bg-gray-100 transition mb-3"
          >
            <p className="text-xs text-gray-400 uppercase font-semibold mb-1">User Profile</p>
            <p className="text-sm font-bold text-gray-800 truncate">
              {profile?.name || 'My Account'}
            </p>
            <p className="text-xs text-gray-500 truncate">{profile?.email || ''}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition px-1"
          >
            <span>→</span>
            <span className="font-medium uppercase tracking-wide text-xs">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">$</div>
            <span className="text-base font-bold text-gray-800">ExpenseTracker</span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 cursor-pointer text-xl"
          >
            ☰
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

export default MainLayout