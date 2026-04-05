import React, { useEffect, useState } from 'react'
import { driveAPI, applicationAPI } from '../../services/api'
import { PageHeader, Badge, Spinner, EmptyState, Modal } from '../../components/common/UI'
import { Briefcase, Search, MapPin, Calendar, DollarSign, Users, Mail } from 'lucide-react'
import toast from 'react-hot-toast'

export default function BrowseDrives() {
  const [drives, setDrives]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [statusFilter, setStatus]   = useState('ACTIVE')
  const [applyModal, setApplyModal] = useState(false)
  const [selected, setSelected]     = useState(null)
  const [coverLetter, setCover]     = useState('')
  const [applying, setApplying]     = useState(false)
  const [applied, setApplied]       = useState(new Set())

  useEffect(() => {
    setLoading(true)
    const fn = statusFilter === 'ALL' ? driveAPI.getAll() : driveAPI.getByStatus(statusFilter)
    fn.then(r => setDrives(r.data.data || []))
      .catch(() => toast.error('Failed to load drives'))
      .finally(() => setLoading(false))
  }, [statusFilter])

  useEffect(() => {
    applicationAPI.getMy()
      .then(r => setApplied(new Set((r.data.data || []).map(a => a.driveId))))
      .catch(() => {})
  }, [])

  const filtered = drives.filter(d =>
    d.companyName?.toLowerCase().includes(search.toLowerCase()) ||
    d.title?.toLowerCase().includes(search.toLowerCase()) ||
    d.jobRole?.toLowerCase().includes(search.toLowerCase())
  )

  const handleApply = async () => {
    if (!selected) return
    setApplying(true)
    try {
      await applicationAPI.apply({ driveId: selected.id, coverLetter })
      toast.success(`Applied to ${selected.companyName}!`)
      // Email notification toast
      toast((t) => (
        <div className="flex items-center gap-3">
          <Mail size={18} className="text-blue-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Confirmation email sent!</p>
            <p className="text-xs text-gray-500">
              Check your inbox for application details for {selected.companyName}.
            </p>
          </div>
        </div>
      ), { duration: 5000, icon: '📧' })
      setApplied(s => new Set([...s, selected.id]))
      setApplyModal(false); setCover('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Application failed')
    } finally { setApplying(false) }
  }

  if (loading) return <Spinner />

  return (
    <div className="space-y-6 fade-in">
      <PageHeader title="Browse Placement Drives" subtitle={`${filtered.length} drives found`} />

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9 text-sm" placeholder="Search company, role…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['ACTIVE','UPCOMING','COMPLETED','ALL'].map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all
                ${statusFilter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0
        ? <EmptyState icon={Briefcase} title="No drives found" message="Try changing the filter or check back later." />
        : (
          <div className="grid gap-4">
            {filtered.map(d => {
              const hasApplied = applied.has(d.id)
              return (
                <div key={d.id} className="card hover:shadow-card-hover transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-display font-bold text-gray-900">{d.title}</h3>
                        <Badge status={d.status} />
                      </div>
                      <p className="text-primary-600 font-semibold">{d.companyName}</p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                        {d.jobRole       && <div className="flex items-center gap-1.5 text-xs text-gray-500"><Briefcase size={12}/> {d.jobRole}</div>}
                        {d.packageOffered && <div className="flex items-center gap-1.5 text-xs text-gray-500"><DollarSign size={12}/> {d.packageOffered} LPA</div>}
                        {d.location      && <div className="flex items-center gap-1.5 text-xs text-gray-500"><MapPin size={12}/> {d.location}</div>}
                        {d.driveDate     && <div className="flex items-center gap-1.5 text-xs text-gray-500"><Calendar size={12}/> {d.driveDate}</div>}
                        {d.openings      && <div className="flex items-center gap-1.5 text-xs text-gray-500"><Users size={12}/> {d.openings} openings</div>}
                        {d.minimumCgpa   && <div className="flex items-center gap-1.5 text-xs text-gray-500">📊 Min CGPA: {d.minimumCgpa}</div>}
                        {d.eligibleDepartments && <div className="flex items-center gap-1.5 text-xs text-gray-500">🏛 {d.eligibleDepartments}</div>}
                        {d.applicationDeadline && <div className="flex items-center gap-1.5 text-xs text-red-500">⏰ Deadline: {d.applicationDeadline}</div>}
                      </div>

                      {d.requiredSkills && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {d.requiredSkills.split(',').map(sk => (
                            <span key={sk} className="badge bg-blue-50 text-blue-600 text-xs">{sk.trim()}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex-shrink-0">
                      {hasApplied ? (
                        <span className="badge bg-green-100 text-green-700 py-1.5 px-3">✓ Applied</span>
                      ) : d.status === 'ACTIVE' ? (
                        <button
                          onClick={() => { setSelected(d); setApplyModal(true) }}
                          className="btn-primary text-sm py-2 px-4">
                          Apply Now
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      {/* Apply Modal */}
      <Modal open={applyModal} onClose={() => setApplyModal(false)}
             title={`Apply to ${selected?.companyName}`}>
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="font-semibold text-blue-900">{selected?.title}</p>
            <p className="text-xs text-blue-600 mt-0.5">{selected?.jobRole} · {selected?.packageOffered} LPA</p>
          </div>
          <div>
            <label className="label">Cover Letter (optional)</label>
            <textarea className="input h-32 resize-none"
              placeholder="Write a brief cover letter explaining why you're a good fit…"
              value={coverLetter} onChange={e => setCover(e.target.value)} />
          </div>
          <div className="flex gap-3">
            <button onClick={handleApply} disabled={applying} className="btn-primary flex-1">
              {applying ? 'Submitting…' : 'Submit Application'}
            </button>
            <button onClick={() => setApplyModal(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
