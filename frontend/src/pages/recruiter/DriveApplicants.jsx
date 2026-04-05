import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { applicationAPI, driveAPI, studentAPI } from '../../services/api'
import { PageHeader, Badge, Spinner, EmptyState, Modal } from '../../components/common/UI'
import ResumeViewer from '../../components/common/ResumeViewer'
import { Users, Star, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUSES = ['APPLIED','SHORTLISTED','INTERVIEWED','SELECTED','REJECTED']

function EvalModal({ app, onClose, onSaved }) {
  const [form, setForm] = useState({
    technicalScore: 3, communicationScore: 3, problemSolvingScore: 3,
    aptitudeScore: 3, hrScore: 3, evaluatorComments: '', recommendation: 'HOLD',
  })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const SCORES = [
    { key: 'technicalScore',      label: 'Technical' },
    { key: 'communicationScore',  label: 'Communication' },
    { key: 'problemSolvingScore', label: 'Problem Solving' },
    { key: 'aptitudeScore',       label: 'Aptitude' },
    { key: 'hrScore',             label: 'HR / Attitude' },
  ]

  const handleSave = async () => {
    setSaving(true)
    try {
      await applicationAPI.addEvaluation(app.id, form)
      toast.success('Evaluation saved!')
      onSaved()
    } catch { toast.error('Save failed') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50 rounded-lg">
        <p className="font-semibold text-blue-900">{app.studentName}</p>
        <p className="text-xs text-blue-600">{app.rollNumber} · CGPA: {app.cgpa?.toFixed(2) ?? '—'}</p>
      </div>

      {SCORES.map(({ key, label }) => (
        <div key={key}>
          <div className="flex justify-between text-sm mb-1">
            <label className="font-medium text-gray-700">{label}</label>
            <span className="text-primary-600 font-bold">{form[key]} / 5</span>
          </div>
          <div className="flex gap-2">
            {[1,2,3,4,5].map(n => (
              <button key={n} type="button"
                onClick={() => set(key, n)}
                className={`flex-1 h-9 rounded-lg text-sm font-semibold border-2 transition-all
                  ${form[key] >= n
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-primary-300'}`}>
                {n}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div>
        <label className="label">Recommendation</label>
        <select className="input" value={form.recommendation}
          onChange={e => set('recommendation', e.target.value)}>
          {['SELECT','HOLD','REJECT'].map(r => <option key={r}>{r}</option>)}
        </select>
      </div>

      <div>
        <label className="label">Comments</label>
        <textarea className="input h-24 resize-none" placeholder="Evaluator comments…"
          value={form.evaluatorComments} onChange={e => set('evaluatorComments', e.target.value)} />
      </div>

      <div className="flex gap-3">
        <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
          {saving ? 'Saving…' : 'Save Evaluation'}
        </button>
        <button onClick={onClose} className="btn-secondary">Cancel</button>
      </div>
    </div>
  )
}

export default function DriveApplicants() {
  const { id } = useParams()
  const [drive, setDrive]       = useState(null)
  const [apps, setApps]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [evalApp, setEvalApp]   = useState(null)
  const [statusFilter, setStatusFilter] = useState('ALL')

  const load = () => {
    Promise.all([
      driveAPI.getById(id),
      applicationAPI.getForDrive(id),
    ]).then(([d, a]) => {
      setDrive(d.data.data)
      setApps(a.data.data || [])
    }).catch(() => toast.error('Failed to load'))
    .finally(() => setLoading(false))
  }

  useEffect(load, [id])

  const handleStatusChange = async (appId, status) => {
    try {
      await applicationAPI.updateStatus(appId, { status, remarks: '' })
      toast.success(`Status updated to ${status}`)
      setApps(prev => prev.map(a => a.id === appId ? { ...a, status } : a))
    } catch { toast.error('Update failed') }
  }

  const filtered = statusFilter === 'ALL' ? apps : apps.filter(a => a.status === statusFilter)

  if (loading) return <Spinner />

  return (
    <div className="space-y-6 fade-in">
      <PageHeader
        title={drive ? `Applicants — ${drive.companyName}` : 'Applicants'}
        subtitle={`${apps.length} total applications for ${drive?.title || '—'}`}
      />

      {/* Summary chips */}
      <div className="flex gap-2 flex-wrap">
        {['ALL', ...STATUSES].map(s => {
          const count = s === 'ALL' ? apps.length : apps.filter(a => a.status === s).length
          return (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all
                ${statusFilter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s} ({count})
            </button>
          )
        })}
      </div>

      {filtered.length === 0
        ? <EmptyState icon={Users} title="No applicants found" />
        : (
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Student','Roll No','Dept','CGPA','Applied On','Resume','Status','Actions'].map(h => (
                      <th key={h} className="table-th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(a => (
                    <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                      <td className="table-td">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700
                                          flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {a.studentName?.[0]}
                          </div>
                          <p className="font-medium text-sm text-gray-900">{a.studentName}</p>
                        </div>
                      </td>
                      <td className="table-td font-mono text-xs">{a.rollNumber}</td>
                      <td className="table-td">{a.department || '—'}</td>
                      <td className="table-td">
                        <span className={`font-semibold text-sm
                          ${a.cgpa >= 7.5 ? 'text-green-600' : a.cgpa >= 6 ? 'text-yellow-600' : 'text-red-500'}`}>
                          {a.cgpa?.toFixed(2) ?? '—'}
                        </span>
                      </td>
                      <td className="table-td text-xs text-gray-400">
                        {a.appliedAt ? new Date(a.appliedAt).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td className="table-td">
                        <ResumeViewer
                          studentId={a.studentId}
                          resumeName={a.resumeSnapshot ? a.resumeSnapshot.split('/').pop() : null}
                          hasResume={!!a.resumeSnapshot}
                          compact
                        />
                      </td>
                      <td className="table-td">
                        <div className="relative">
                          <select
                            value={a.status}
                            onChange={e => handleStatusChange(a.id, e.target.value)}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1 pr-6
                                       focus:outline-none focus:ring-1 focus:ring-primary-500
                                       bg-white cursor-pointer appearance-none"
                          >
                            {STATUSES.map(s => <option key={s}>{s}</option>)}
                          </select>
                          <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2
                                                             text-gray-400 pointer-events-none" />
                        </div>
                      </td>
                      <td className="table-td">
                        <button
                          onClick={() => setEvalApp(a)}
                          className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800
                                     font-semibold hover:bg-primary-50 px-2 py-1 rounded-lg transition-all"
                        >
                          <Star size={12} /> Evaluate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* Evaluation modal */}
      <Modal
        open={!!evalApp}
        onClose={() => setEvalApp(null)}
        title="Interview Evaluation"
        size="md"
      >
        {evalApp && (
          <EvalModal
            app={evalApp}
            onClose={() => setEvalApp(null)}
            onSaved={() => { setEvalApp(null); load() }}
          />
        )}
      </Modal>
    </div>
  )
}
