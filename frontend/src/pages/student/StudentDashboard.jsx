import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { studentAPI, applicationAPI, driveAPI } from '../../services/api'
import { StatCard, PageHeader, Badge, Spinner } from '../../components/common/UI'
import { BookOpen, Briefcase, TrendingUp, User, ArrowRight, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [profile, setProfile]   = useState(null)
  const [apps, setApps]         = useState([])
  const [drives, setDrives]     = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      studentAPI.getMe(),
      applicationAPI.getMy(),
      driveAPI.getByStatus('ACTIVE'),
    ]).then(([p, a, d]) => {
      setProfile(p.data.data)
      setApps(a.data.data || [])
      setDrives(d.data.data || [])
    }).catch(console.error)
    .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const selected = apps.filter(a => a.status === 'SELECTED').length
  const pending  = apps.filter(a => ['APPLIED','SHORTLISTED','INTERVIEWED'].includes(a.status)).length

  return (
    <div className="space-y-6 fade-in">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-1">Welcome back 👋</p>
            <h1 className="font-display text-2xl font-bold">{user?.firstName} {user?.lastName}</h1>
            {profile?.rollNumber && <p className="text-blue-200 text-sm mt-1">{profile.rollNumber} · {profile.department} · {profile.batch}</p>}
            {profile?.isPlaced && (
              <div className="mt-2 flex items-center gap-2 bg-green-500/20 rounded-lg px-3 py-1.5 w-fit">
                <CheckCircle size={14} className="text-green-300" />
                <span className="text-green-200 text-sm font-medium">Placed at {profile.placedCompany}</span>
              </div>
            )}
          </div>
          {profile?.cgpa && (
            <div className="text-right">
              <p className="text-blue-200 text-xs mb-0.5">CGPA</p>
              <p className="font-display text-4xl font-bold">{profile.cgpa.toFixed(2)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Briefcase}  label="Active Drives"   value={drives.length}        color="blue" />
        <StatCard icon={BookOpen}   label="My Applications" value={apps.length}           color="purple" />
        <StatCard icon={TrendingUp} label="In Progress"     value={pending}               color="orange" />
        <StatCard icon={CheckCircle} label="Offers Received" value={selected}             color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-gray-900">My Applications</h2>
            <Link to="/student/applications" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {apps.length === 0
            ? <p className="text-sm text-gray-400 text-center py-6">No applications yet. <Link to="/student/drives" className="text-primary-600 underline">Browse drives</Link></p>
            : (
              <div className="space-y-3">
                {apps.slice(0, 4).map(a => (
                  <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{a.companyName}</p>
                      <p className="text-xs text-gray-400">{a.driveTitle}</p>
                    </div>
                    <Badge status={a.status} />
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* Open Drives */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-gray-900">Open Drives</h2>
            <Link to="/student/drives" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {drives.length === 0
            ? <p className="text-sm text-gray-400 text-center py-6">No active drives right now</p>
            : (
              <div className="space-y-3">
                {drives.slice(0, 4).map(d => (
                  <div key={d.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{d.companyName}</p>
                      <p className="text-xs text-gray-400">{d.jobRole} · {d.packageOffered ? `${d.packageOffered} LPA` : 'Package TBD'}</p>
                    </div>
                    <Link to="/student/drives"
                      className="text-xs bg-primary-600 text-white px-3 py-1 rounded-full hover:bg-primary-700 transition-colors">
                      Apply
                    </Link>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { to: '/student/profile',    icon: User,       label: 'Update Profile',     color: 'bg-blue-50 text-blue-700' },
          { to: '/student/drives',     icon: Briefcase,  label: 'Browse Drives',      color: 'bg-green-50 text-green-700' },
          { to: '/student/prediction', icon: TrendingUp, label: 'Predict Placement',  color: 'bg-purple-50 text-purple-700' },
          { to: '/student/feedback',   icon: BookOpen,   label: 'Give Feedback',      color: 'bg-orange-50 text-orange-700' },
        ].map(({ to, icon: Icon, label, color }) => (
          <Link key={to} to={to}
            className={`card flex flex-col items-center gap-2 text-center hover:shadow-card-hover transition-shadow cursor-pointer ${color}`}>
            <Icon size={24} />
            <span className="text-sm font-semibold">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
