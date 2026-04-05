import React, { useEffect, useState } from 'react'
import { feedbackAPI } from '../../services/api'
import { PageHeader, Badge, Spinner, EmptyState } from '../../components/common/UI'
import { Star, CheckCircle, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'

function Stars({ rating }) {
  return (
    <span className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={13} className={i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
      ))}
    </span>
  )
}

export default function ManageFeedback() {
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('ALL')

  const load = () => {
    setLoading(true)
    feedbackAPI.getAll()
      .then(r => setFeedbacks(r.data.data || []))
      .catch(() => toast.error('Failed to load feedback'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleApprove = async (id) => {
    try {
      await feedbackAPI.approve(id)
      toast.success('Feedback approved')
      load()
    } catch { toast.error('Failed') }
  }

  const list = feedbacks.filter(f => {
    if (filter === 'APPROVED')   return f.isApproved
    if (filter === 'PENDING')    return !f.isApproved
    return true
  })

  if (loading) return <Spinner />

  return (
    <div className="space-y-6 fade-in">
      <PageHeader title="Feedback Management" subtitle={`${feedbacks.length} submissions`} />

      <div className="flex gap-2">
        {['ALL','PENDING','APPROVED'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all
              ${filter === f ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {f}
          </button>
        ))}
      </div>

      {list.length === 0
        ? <EmptyState icon={MessageSquare} title="No feedback found" />
        : (
          <div className="space-y-4">
            {list.map(f => (
              <div key={f.id} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-sm text-gray-900">{f.submittedBy}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-400">{f.companyName || 'General'}</span>
                      <span className="badge bg-gray-100 text-gray-600 text-xs">{f.type}</span>
                      {f.isApproved
                        ? <span className="badge bg-green-100 text-green-700">Approved</span>
                        : <span className="badge bg-yellow-100 text-yellow-700">Pending</span>}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                      {[
                        { label: 'Overall', val: f.overallRating },
                        { label: 'Interview', val: f.interviewProcessRating },
                        { label: 'Company', val: f.companyRating },
                        { label: 'Placement Cell', val: f.placementCellRating },
                      ].map(({ label, val }) => val && (
                        <div key={label}>
                          <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                          <Stars rating={val} />
                        </div>
                      ))}
                    </div>
                    {f.comments && <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mb-2">{f.comments}</p>}
                    {f.suggestions && <p className="text-xs text-gray-500 italic">Suggestion: {f.suggestions}</p>}
                  </div>
                  {!f.isApproved && (
                    <button onClick={() => handleApprove(f.id)}
                      className="btn-primary flex items-center gap-1.5 text-sm py-2 px-3 flex-shrink-0">
                      <CheckCircle size={14} /> Approve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  )
}
