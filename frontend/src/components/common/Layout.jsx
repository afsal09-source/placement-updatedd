import React, { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar  from './Navbar'

export default function Layout({ role }) {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024)
  const location = useLocation()

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }, [location.pathname])

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-20 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Wrapper */}
      <div className={`
        fixed inset-y-0 left-0 z-30 lg:relative
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0'}
      `}>
        {/* We keep open=true here because the wrapper hides it, or we can use open state */}
        <Sidebar role={role} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden w-full">
        <Navbar onMenuClick={() => setSidebarOpen(o => !o)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
