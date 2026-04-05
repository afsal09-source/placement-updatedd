import React, { useEffect, useState } from 'react'
import { driveAPI, applicationAPI } from '../../services/api'
import { StatCard, PageHeader, Badge, Spinner, EmptyState, Modal } from '../../components/common/UI'
import { Briefcase, Users, CheckCircle, Clock, Link as LinkIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function RecruiterDashboard() {
  const [drives, setDrives] = useState([])
  const [apps, setApps]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([driveAPI.getAll(), applicationAPI.getAll()])
      .then(([d, a]) => { setDrives(d.data.data || []); setApps(a.data.data || []) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const active   = drives.filter(d => d.status === 'ACTIVE').length
  const selected = apps.filter(a => a.status === 'SELECTED').length

  return (
    <div className="space-y-6 fade-in">
      <PageHeader title="Recruiter Dashboard" subtitle="Manage your placement drives and applicants" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Briefcase}   label="My Drives"      value={drives.length} color="blue" />
        <StatCard icon={Clock}       label="Active Drives"  value={active}        color="green" />
        <StatCard icon={Users}       label="Applications"   value={apps.length}   color="purple" />
        <StatCard icon={CheckCircle} label="Selected"       value={selected}      color="orange" />
      </div>
      <div className="card">
        <h2 className="font-display font-bold text-gray-900 mb-4">Your Drives</h2>
        {drives.length === 0
          ? <EmptyState icon={Briefcase} title="No drives yet" message="Create a drive from the Drives section." />
          : (
            <div className="space-y-3">
              {drives.map(d => (
                <div key={d.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{d.title}</p>
                    <p className="text-xs text-gray-400">{d.companyName} · {d.totalApplications || 0} applicants</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge status={d.status} />
                    <Link to={`/recruiter/drives/${d.id}/applicants`}
                      className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                      View <LinkIcon size={11} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  )
}
