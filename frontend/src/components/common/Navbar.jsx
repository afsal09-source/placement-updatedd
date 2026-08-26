import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, Bell, LogOut, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { notificationAPI } from '../../services/api'

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    notificationAPI.getUnread()
      .then(r => setUnread(r.data.data || 0))
      .catch(() => {})
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  const role = user?.role?.toLowerCase()
  const notifPath = `/${role}/notifications`

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="text-gray-500 hover:text-gray-800 transition-colors p-1 rounded-lg hover:bg-gray-100"
        >
          <Menu size={22} />
        </button>
        <div>
          <h1 className="font-display font-bold text-gray-900 text-base leading-none">
            C. Abdul Hakeem College of Engineering and Technology
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Smart Placement Analytics & Feedback Management System</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <Link
          to={notifPath}
          className="relative p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
        >
          <Bell size={20} />
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs
                             rounded-full flex items-center justify-center font-bold">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Link>

        {/* Avatar / name */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center
                          justify-center text-sm font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-800 leading-none">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-400">{user?.role}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
