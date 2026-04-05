import React, { useEffect, useState } from 'react'
import { applicationAPI } from '../../services/api'
import { PageHeader, Badge, Spinner, EmptyState } from '../../components/common/UI'
import ResumeViewer from '../../components/common/ResumeViewer'
import { useAuth } from '../../context/AuthContext'
import { BookOpen, Calendar, Building } from 'lucide-react'
import { format } from 'date-fns'

export default function MyApplications() {
  const [apps, setApps]       = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('ALL')
  const { user } = useAuth()

  useEffect(() => {
    applicationAPI.getMy()
      .then(r => setApps(r.data.data || []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'ALL' ? apps : apps.filter(a => a.status === filter)

  if (loading) return <Spinner />

  return (
    <div className="space-y-6 fade-in">
      <PageHeader title="My Applications" subtitle={`${apps.length} total applications`} />

      <div className="flex gap-2 flex-wrap">
        {['ALL','APPLIED','SHORTLISTED','INTERVIEWED','SELECTED','REJECTED'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all
              ${filter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0
        ? <EmptyState icon={BookOpen} title="No applications found" message="Apply to placement drives to see them here." />
        : (
          <div className="space-y-4">
            {filtered.map(a => (
              <div key={a.id} className="card hover:shadow-card-hover transition-shadow">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-xl flex items-center justify-center">
                      <Building size={18} />
                    </div>
                    <div>
                      <p className="font-display font-bold text-gray-900">{a.companyName}</p>
                      <p className="text-xs text-gray-500">{a.driveTitle}</p>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
                        <Calendar size={11} />
                        Applied: {a.appliedAt ? format(new Date(a.appliedAt), 'dd MMM yyyy') : '—'}
                      </div>
                    </div>
                  </div>
                  <Badge status={a.status} />
                </div>
                {a.coverLetter && (
                  <div className="mt-3 pt-3 border-t border-gray-50">
                    <p className="text-xs text-gray-400 font-medium mb-1">Cover Letter:</p>
                    <p className="text-xs text-gray-600 line-clamp-2">{a.coverLetter}</p>
                  </div>
                )}
                {/* Resume view/download for the submitted resume snapshot */}
                {a.resumeSnapshot && (
                  <div className="mt-3 pt-3 border-t border-gray-50">
                    <p className="text-xs text-gray-400 font-medium mb-2">Submitted Resume:</p>
                    <ResumeViewer
                      studentId={a.studentId}
                      resumeName={a.resumeSnapshot ? a.resumeSnapshot.split('/').pop() : 'resume.pdf'}
                      hasResume={!!a.resumeSnapshot}
                      compact
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
    </div>
  )
}
