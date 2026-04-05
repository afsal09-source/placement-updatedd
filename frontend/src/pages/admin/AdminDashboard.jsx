import React, { useEffect, useState } from 'react'
import { Users, Briefcase, TrendingUp, Award, BarChart2, Star, Building } from 'lucide-react'
import { analyticsAPI } from '../../services/api'
import { StatCard, PageHeader, Spinner } from '../../components/common/UI'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4']

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyticsAPI.getDashboard()
      .then(r => setStats(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />
  if (!stats)  return <p className="text-gray-500">Failed to load analytics.</p>

  const deptData = (stats.departmentStats || []).map(d => ({
    name: d.department, placed: d.placedStudents, total: d.totalStudents,
    rate: d.placementRate,
  }))

  const statusData = Object.entries(stats.applicationsByStatus || {}).map(([k, v]) => ({
    name: k, value: v
  }))

  const driveStatusData = Object.entries(stats.drivesByStatus || {}).map(([k, v]) => ({
    name: k, value: v
  }))

  return (
    <div className="space-y-6 fade-in">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Real-time placement analytics for CAHCET"
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Briefcase}   label="Total Drives"     value={stats.totalDrives}   color="blue" />
        <StatCard icon={Users}       label="Total Students"   value={stats.totalStudents}  color="green" />
        <StatCard icon={Award}       label="Students Placed"  value={stats.totalStudentsPlaced} color="purple" />
        <StatCard icon={TrendingUp}  label="Placement %"      value={`${stats.placementPercentage?.toFixed(1)}%`} color="orange" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Briefcase}  label="Active Drives"   value={stats.activeDrives}       color="teal" />
        <StatCard icon={BarChart2}  label="Applications"    value={stats.totalApplications}   color="blue" />
        <StatCard icon={Building}   label="Recruiters"      value={stats.totalRecruiters}     color="purple" />
        <StatCard icon={Star}       label="Avg CGPA"        value={stats.avgCgpa?.toFixed(2)} color="orange" />
      </div>

      {/* Skill Ratings */}
      <div className="card">
        <h2 className="font-display font-bold text-gray-900 mb-1">Skill Performance Overview</h2>
        <p className="text-xs text-gray-400 mb-4">
          Average scores across all interview evaluations
          {stats.weakSkill && stats.weakSkill !== 'None' && (
            <span className="ml-2 badge bg-red-100 text-red-700">⚠ Weak Skill: {stats.weakSkill}</span>
          )}
        </p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Technical',       val: stats.avgTechnical,       color: 'bg-blue-500' },
            { label: 'Communication',   val: stats.avgCommunication,   color: 'bg-green-500' },
            { label: 'Problem Solving', val: stats.avgProblemSolving,  color: 'bg-purple-500' },
          ].map(({ label, val, color }) => (
            <div key={label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">{label}</span>
                <span className="text-gray-500">{val?.toFixed(1) ?? '–'}/5</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all`}
                     style={{ width: `${((val || 0) / 5) * 100}%` }} />
              </div>
              {val < 3 && (
                <p className="text-xs text-red-500 mt-0.5">Needs improvement</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department-wise placement bar chart */}
        <div className="card">
          <h2 className="font-display font-bold text-gray-900 mb-4">Department-wise Placement</h2>
          {deptData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={deptData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="total"  fill="#bfdbfe" name="Total" radius={[4,4,0,0]} />
                <Bar dataKey="placed" fill="#2563eb" name="Placed" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-10">No data yet</p>}
        </div>

        {/* Application status pie chart */}
        <div className="card">
          <h2 className="font-display font-bold text-gray-900 mb-4">Application Status Distribution</h2>
          {statusData.filter(d => d.value > 0).length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statusData.filter(d => d.value > 0)}
                     dataKey="value" nameKey="name"
                     cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-10">No applications yet</p>}
        </div>
      </div>

      {/* Top Companies */}
      {stats.topCompanies?.length > 0 && (
        <div className="card">
          <h2 className="font-display font-bold text-gray-900 mb-4">Top Rated Companies</h2>
          <div className="space-y-3">
            {stats.topCompanies.map((c, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-lg flex items-center justify-center font-bold text-sm">
                  #{i + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">{c.companyName}</p>
                </div>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star size={14} fill="currentColor" />
                  <span className="text-sm font-semibold text-gray-700">{c.rating?.toFixed(1) ?? '—'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
