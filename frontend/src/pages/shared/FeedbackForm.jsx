import React, { useEffect, useState } from 'react'
import { feedbackAPI, driveAPI } from '../../services/api'
import { PageHeader } from '../../components/common/UI'
import { Star, Send, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

function StarRating({ label, value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(n)}
            className="transition-transform hover:scale-110"
          >
            <Star
              size={22}
              className={`transition-colors ${
                n <= (hover || value)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )
}

const FEEDBACK_TYPES = ['COMPANY', 'PLACEMENT_CELL', 'INTERVIEW_PROCESS', 'GENERAL']

export default function FeedbackForm() {
  const [drives, setDrives] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    driveId: '',
    type: 'GENERAL',
    overallRating: 0,
    interviewProcessRating: 0,
    companyRating: 0,
    placementCellRating: 0,
    comments: '',
    suggestions: '',
    isAnonymous: false,
  })

  useEffect(() => {
    driveAPI.getByStatus('COMPLETED')
      .then(r => setDrives(r.data.data || []))
      .catch(() => {})
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.overallRating === 0) { toast.error('Please provide an overall rating'); return }
    setSubmitting(true)
    try {
      await feedbackAPI.submit({
        ...form,
        driveId: form.driveId ? +form.driveId : null,
      })
      setSubmitted(true)
      toast.success('Feedback submitted successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center fade-in">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">
          Thank You for Your Feedback!
        </h2>
        <p className="text-gray-500 max-w-sm mb-6">
          Your feedback has been submitted and will be reviewed by the placement team.
          It helps us improve the placement process for everyone.
        </p>
        <button
          onClick={() => { setSubmitted(false); setForm({
            driveId: '', type: 'GENERAL', overallRating: 0, interviewProcessRating: 0,
            companyRating: 0, placementCellRating: 0, comments: '', suggestions: '', isAnonymous: false,
          })}}
          className="btn-primary"
        >
          Submit Another Feedback
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 fade-in max-w-2xl">
      <PageHeader
        title="Submit Feedback"
        subtitle="Help us improve the placement process at CAHCET"
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Type & Drive */}
        <div className="card space-y-4">
          <h2 className="font-display font-bold text-gray-900">Feedback Details</h2>

          <div>
            <label className="label">Feedback Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FEEDBACK_TYPES.map(t => (
                <button key={t} type="button"
                  onClick={() => set('type', t)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border-2 transition-all text-center
                    ${form.type === t
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  {t.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Related Drive (optional)</label>
            <select className="input" value={form.driveId} onChange={e => set('driveId', e.target.value)}>
              <option value="">— Select a drive (optional) —</option>
              {drives.map(d => (
                <option key={d.id} value={d.id}>
                  {d.companyName} — {d.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ratings */}
        <div className="card space-y-3">
          <h2 className="font-display font-bold text-gray-900">Ratings</h2>
          <StarRating label="Overall Experience *" value={form.overallRating}
            onChange={v => set('overallRating', v)} />
          <StarRating label="Interview Process" value={form.interviewProcessRating}
            onChange={v => set('interviewProcessRating', v)} />
          <StarRating label="Company Culture" value={form.companyRating}
            onChange={v => set('companyRating', v)} />
          <StarRating label="Placement Cell Support" value={form.placementCellRating}
            onChange={v => set('placementCellRating', v)} />
        </div>

        {/* Comments */}
        <div className="card space-y-4">
          <h2 className="font-display font-bold text-gray-900">Your Thoughts</h2>
          <div>
            <label className="label">Comments</label>
            <textarea
              className="input h-28 resize-none"
              placeholder="Share your experience, what went well, what was challenging…"
              value={form.comments}
              onChange={e => set('comments', e.target.value)}
            />
          </div>
          <div>
            <label className="label">Suggestions for Improvement</label>
            <textarea
              className="input h-24 resize-none"
              placeholder="Any suggestions to improve the placement process…"
              value={form.suggestions}
              onChange={e => set('suggestions', e.target.value)}
            />
          </div>

          {/* Anonymous toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={form.isAnonymous}
                onChange={e => set('isAnonymous', e.target.checked)}
              />
              <div className={`w-11 h-6 rounded-full transition-colors
                ${form.isAnonymous ? 'bg-primary-600' : 'bg-gray-200'}`}>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow
                  transition-transform ${form.isAnonymous ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Submit Anonymously</span>
              <p className="text-xs text-gray-400">Your name will not be visible to administrators</p>
            </div>
          </label>
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
          <Send size={16} />
          {submitting ? 'Submitting…' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  )
}
