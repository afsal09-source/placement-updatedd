import React, { useEffect, useState } from 'react'
import { analyticsAPI } from '../../services/api'
import { StatCard, PageHeader, Spinner } from '../../components/common/UI'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, LineChart, Line, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'
import {
  Users, Briefcase, TrendingUp, Award, BarChart2, Star, Building, Target
} from 'lucide-react'

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="text-xs">
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

export default function AnalyticsDashboard() {
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyticsAPI.getDashboard()
      .then(r => setStats(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />
  if (!stats) return (
    <div className="card text-center py-16 text-gray-400">Failed to load analytics data.</div>
  )

  // Data shapes for charts
  const deptData = (stats.departmentStats || []).map(d => ({
    dept: d.department,
    Total: d.totalStudents,
    Placed: d.placedStudents,
    Rate: d.placementRate,
  }))

  const appStatusData = Object.entries(stats.applicationsByStatus || {})
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: k.replace(/_/g, ' '), value: v }))

  const driveStatusData = Object.entries(stats.drivesByStatus || {})
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: k, value: v }))

  const skillRadarData = [
    { skill: 'Technical',       score: stats.avgTechnical     || 0 },
    { skill: 'Communication',   score: stats.avgCommunication || 0 },
    { skill: 'Problem Solving', score: stats.avgProblemSolving || 0 },
  ]

  const placementRateData = (stats.departmentStats || []).map(d => ({
    dept: d.department,
    Rate: d.placementRate,
  }))

  return (
    <div className="space-y-6 fade-in">
      <PageHeader title="Analytics Dashboard" subtitle="Comprehensive placement analytics for CAHCET" />

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Briefcase}   label="Total Drives"      value={stats.totalDrives}          color="blue"   />
        <StatCard icon={Users}       label="Total Students"    value={stats.totalStudents}         color="green"  />
        <StatCard icon={Award}       label="Students Placed"   value={stats.totalStudentsPlaced}   color="purple" />
        <StatCard icon={TrendingUp}  label="Placement Rate"    value={`${stats.placementPercentage?.toFixed(1)}%`} color="orange" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BarChart2}   label="Applications"      value={stats.totalApplications}     color="blue"   />
        <StatCard icon={Building}    label="Recruiters"        value={stats.totalRecruiters}        color="teal"   />
        <StatCard icon={Star}        label="Avg CGPA"          value={stats.avgCgpa?.toFixed(2)}    color="orange" />
        <StatCard icon={Target}      label="Active Drives"     value={stats.activeDrives}           color="green"  />
      </div>

      {/* Skill Weakness Alert */}
      {stats.weakSkill && stats.weakSkill !== 'None' && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Target size={16} className="text-red-600" />
          </div>
          <div>
            <p className="font-semibold text-red-800 text-sm">Weak Skill Identified: {stats.weakSkill}</p>
            <p className="text-xs text-red-600 mt-0.5">
              Average rating below 3.0. Recommend conducting targeted workshops to improve this skill area.
            </p>
          </div>
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dept bar chart */}
        <div className="card">
          <h2 className="font-display font-bold text-gray-900 mb-1">Department-wise Placement</h2>
          <p className="text-xs text-gray-400 mb-4">Total vs placed students per department</p>
          {deptData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={deptData} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="dept" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} />
                <Bar dataKey="Total"  fill="#bfdbfe" radius={[6,6,0,0]} />
                <Bar dataKey="Placed" fill="#2563eb" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-12">No department data available yet</p>}
        </div>

        {/* Application status pie */}
        <div className="card">
          <h2 className="font-display font-bold text-gray-900 mb-1">Application Status</h2>
          <p className="text-xs text-gray-400 mb-4">Distribution of all applications by current status</p>
          {appStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={appStatusData}
                  cx="50%" cy="50%"
                  outerRadius={95}
                  innerRadius={45}
                  dataKey="value"
                  nameKey="name"
                  paddingAngle={3}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {appStatusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-12">No application data available yet</p>}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Placement rate line */}
        <div className="card">
          <h2 className="font-display font-bold text-gray-900 mb-1">Placement Rate by Department</h2>
          <p className="text-xs text-gray-400 mb-4">Percentage of students placed per department</p>
          {placementRateData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={placementRateData} barCategoryGap="40%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="dept" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" axisLine={false} tickLine={false} />
                <Tooltip formatter={v => `${v}%`} content={<CustomTooltip />} />
                <Bar dataKey="Rate" radius={[6,6,0,0]}>
                  {placementRateData.map((entry, i) => (
                    <Cell key={i}
                      fill={entry.Rate >= 70 ? '#10b981' : entry.Rate >= 40 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-12">No data yet</p>}
        </div>

        {/* Skill radar */}
        <div className="card">
          <h2 className="font-display font-bold text-gray-900 mb-1">Skill Performance Radar</h2>
          <p className="text-xs text-gray-400 mb-4">Average scores across all interview evaluations (out of 5)</p>
          {skillRadarData.some(s => s.score > 0) ? (
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart cx="50%" cy="50%" outerRadius={90} data={skillRadarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 10 }} />
                <Radar name="Avg Score" dataKey="score" stroke="#2563eb" fill="#2563eb" fillOpacity={0.25} strokeWidth={2} />
                <Tooltip formatter={v => v?.toFixed(2)} />
              </RadarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-12">No evaluation data yet</p>}
        </div>
      </div>

      {/* Drive status + top companies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Drive status pie */}
        <div className="card">
          <h2 className="font-display font-bold text-gray-900 mb-4">Drives by Status</h2>
          {driveStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={driveStatusData} cx="50%" cy="50%"
                     outerRadius={85} dataKey="value" nameKey="name"
                     label={({ name, value }) => `${name}: ${value}`}>
                  {driveStatusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-12">No drives data yet</p>}
        </div>

        {/* Top Companies */}
        <div className="card">
          <h2 className="font-display font-bold text-gray-900 mb-4">Top Rated Companies</h2>
          {stats.topCompanies?.length > 0 ? (
            <div className="space-y-3">
              {stats.topCompanies.map((c, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0
                    ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : 'bg-orange-50 text-orange-600'}`}>
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{c.companyName}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-bold text-gray-800">{c.rating?.toFixed(1) ?? '—'}</span>
                  </div>
                  <div className="w-24">
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div className="h-full bg-yellow-400 rounded-full"
                           style={{ width: `${((c.rating || 0) / 5) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-12">No company ratings yet</p>
          )}
        </div>
      </div>

      {/* Skill metrics summary */}
      <div className="card">
        <h2 className="font-display font-bold text-gray-900 mb-5">Detailed Skill Metrics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { label: 'Avg Technical Score',       val: stats.avgTechnical,       color: '#3b82f6', bg: '#eff6ff' },
            { label: 'Avg Communication Score',   val: stats.avgCommunication,   color: '#10b981', bg: '#f0fdf4' },
            { label: 'Avg Problem Solving Score', val: stats.avgProblemSolving,  color: '#8b5cf6', bg: '#f5f3ff' },
          ].map(({ label, val, color, bg }) => {
            const pct = ((val || 0) / 5) * 100
            const isWeak = val && val < 3
            return (
              <div key={label} className="p-4 rounded-xl border" style={{ background: bg }}>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</p>
                <div className="flex items-end gap-2 mb-3">
                  <p className="text-3xl font-display font-bold" style={{ color }}>
                    {val?.toFixed(2) ?? '—'}
                  </p>
                  <p className="text-sm text-gray-400 mb-1">/ 5.0</p>
                </div>
                <div className="h-2 bg-white rounded-full overflow-hidden shadow-inner">
                  <div className="h-full rounded-full transition-all duration-700"
                       style={{ width: `${pct}%`, background: color }} />
                </div>
                {isWeak && (
                  <p className="text-xs text-red-500 font-semibold mt-2">
                    ⚠ Below threshold — needs improvement
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
