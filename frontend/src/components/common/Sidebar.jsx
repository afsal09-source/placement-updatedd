import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Users, Briefcase, BarChart2, Bell, Building,
  FileText, UserCircle, BookOpen, TrendingUp, LogOut,
  GraduationCap, Star, ChevronRight
} from 'lucide-react'

const NAV = {
  ADMIN: [
    { to: '/admin',              icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/students',     icon: Users,           label: 'Students' },
    { to: '/admin/companies',    icon: Building,        label: 'Companies' },
    { to: '/admin/drives',       icon: Briefcase,       label: 'Placement Drives' },
    { to: '/admin/feedback',     icon: Star,            label: 'Feedback' },
    { to: '/admin/analytics',    icon: BarChart2,       label: 'Analytics' },
    { to: '/admin/notifications',icon: Bell,            label: 'Notifications' },
  ],
  STUDENT: [
    { to: '/student',              icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/profile',      icon: UserCircle,      label: 'My Profile' },
    { to: '/student/drives',       icon: Briefcase,       label: 'Browse Drives' },
    { to: '/student/applications', icon: BookOpen,        label: 'My Applications' },
    { to: '/student/prediction',   icon: TrendingUp,      label: 'Placement Prediction' },
    { to: '/student/feedback',     icon: Star,            label: 'Give Feedback' },
    { to: '/student/notifications',icon: Bell,            label: 'Notifications' },
  ],
  RECRUITER: [
    { to: '/recruiter',          icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/recruiter/drives',   icon: Briefcase,       label: 'My Drives' },
    { to: '/recruiter/students', icon: Users,           label: 'Students' },
    { to: '/recruiter/notifications', icon: Bell,       label: 'Notifications' },
  ],
  COORDINATOR: [
    { to: '/coordinator',           icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/coordinator/students',  icon: Users,           label: 'Student Details' },
    { to: '/coordinator/companies', icon: Building,        label: 'Company Details' },
    { to: '/coordinator/drives',    icon: Briefcase,       label: 'Drives' },
    { to: '/coordinator/analytics', icon: BarChart2,       label: 'Analytics' },
    { to: '/coordinator/notifications', icon: Bell,        label: 'Notifications' },
  ],
}

const ROLE_COLORS = {
  ADMIN: 'from-blue-900 to-blue-800',
  STUDENT: 'from-emerald-800 to-emerald-700',
  RECRUITER: 'from-purple-900 to-purple-800',
  COORDINATOR: 'from-orange-800 to-orange-700',
}

const ROLE_LABELS = {
  ADMIN: 'Placement Officer',
  STUDENT: 'Student',
  RECRUITER: 'Recruiter',
  COORDINATOR: 'Coordinator',
}

export default function Sidebar({ role, open }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const links = NAV[role] || []

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <aside className={`
      ${open ? 'w-64' : 'w-0 overflow-hidden'}
      transition-all duration-300 ease-in-out
      flex flex-col h-full bg-gradient-to-b ${ROLE_COLORS[role] || 'from-gray-900 to-gray-800'}
      text-white shadow-xl flex-shrink-0
    `}>
      {/* Header */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
            <GraduationCap size={20} className="text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-sm leading-tight">CAHCET</p>
            <p className="text-white/60 text-xs">Placement Portal</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-white/50 text-xs">{ROLE_LABELS[role]}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === `/${role.toLowerCase()}`}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={18} className="flex-shrink-0" />
            <span className="flex-1 truncate">{label}</span>
            <ChevronRight size={14} className="opacity-0 group-hover:opacity-50 transition-opacity" />
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-white/70 hover:text-white hover:bg-white/10"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
