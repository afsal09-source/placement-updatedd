import React, { useEffect, useState, useRef } from 'react'
import { studentAPI } from '../../services/api'
import { PageHeader, Spinner } from '../../components/common/UI'
import ResumeViewer from '../../components/common/ResumeViewer'
import { User, Upload, Save, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const DEPTS = ['CSE','ECE','EEE','MECH','CIVIL','IT','AIDS','AIML']

export default function MyProfile() {
  const [profile, setProfile] = useState(null)
  const [form, setForm]       = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  useEffect(() => {
    studentAPI.getMe()
      .then(r => {
        setProfile(r.data.data)
        const d = r.data.data
        setForm({
          cgpa: d.cgpa || '', phoneNumber: d.phoneNumber || '',
          address: d.address || '', linkedin: d.linkedin || '',
          github: d.github || '', skills: d.skills || '',
          department: d.department || 'CSE', batch: d.batch || '',
        })
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await studentAPI.updateMe({ ...form, cgpa: +form.cgpa || null })
      toast.success('Profile updated!')
      studentAPI.getMe().then(r => setProfile(r.data.data))
    } catch { toast.error('Update failed') }
    finally { setSaving(false) }
  }

  const handleResume = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') { toast.error('Only PDF files allowed'); return }
    setUploading(true)
    try {
      await studentAPI.uploadResume(file)
      toast.success('Resume uploaded!')
      studentAPI.getMe().then(r => setProfile(r.data.data))
    } catch { toast.error('Upload failed') }
    finally { setUploading(false); fileRef.current.value = '' }
  }

  if (loading) return <Spinner />

  return (
    <div className="space-y-6 fade-in max-w-3xl">
      <PageHeader title="My Profile" subtitle="Keep your profile updated to improve placement chances" />

      {/* Profile summary card */}
      {profile && (
        <div className="card bg-gradient-to-r from-blue-900 to-blue-700 text-white border-0">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold">
              {profile.firstName?.[0]}{profile.lastName?.[0]}
            </div>
            <div className="flex-1">
              <h2 className="font-display text-xl font-bold">{profile.firstName} {profile.lastName}</h2>
              <p className="text-blue-200 text-sm">{profile.email}</p>
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-blue-100">
                <span>🎓 {profile.rollNumber}</span>
                {profile.department && <span>🏛 {profile.department}</span>}
                {profile.batch      && <span>📅 {profile.batch}</span>}
              </div>
            </div>
            {profile.isPlaced && (
              <div className="flex items-center gap-2 bg-green-500/20 px-3 py-2 rounded-xl">
                <CheckCircle size={16} className="text-green-300" />
                <div className="text-right">
                  <p className="text-xs text-green-200">Placed at</p>
                  <p className="font-bold text-sm">{profile.placedCompany}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit form */}
      <form onSubmit={handleSave} className="card space-y-5">
        <h2 className="font-display font-bold text-gray-900 border-b border-gray-100 pb-3">Edit Information</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">CGPA (out of 10)</label>
            <input type="number" step="0.01" min="0" max="10" className="input"
              value={form.cgpa} onChange={e => set('cgpa', e.target.value)} placeholder="8.50" />
          </div>
          <div>
            <label className="label">Phone Number</label>
            <input className="input" value={form.phoneNumber}
              onChange={e => set('phoneNumber', e.target.value)} placeholder="+91 99999 99999" />
          </div>
          <div>
            <label className="label">Department</label>
            <select className="input" value={form.department} onChange={e => set('department', e.target.value)}>
              {DEPTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Batch</label>
            <input className="input" value={form.batch}
              onChange={e => set('batch', e.target.value)} placeholder="2021-2025" />
          </div>
          <div className="col-span-2">
            <label className="label">Skills (comma-separated)</label>
            <input className="input" value={form.skills}
              onChange={e => set('skills', e.target.value)}
              placeholder="Java, Python, React, MySQL, DSA…" />
          </div>
          <div>
            <label className="label">LinkedIn URL</label>
            <input className="input" value={form.linkedin}
              onChange={e => set('linkedin', e.target.value)} placeholder="linkedin.com/in/yourname" />
          </div>
          <div>
            <label className="label">GitHub URL</label>
            <input className="input" value={form.github}
              onChange={e => set('github', e.target.value)} placeholder="github.com/yourname" />
          </div>
          <div className="col-span-2">
            <label className="label">Address</label>
            <textarea className="input h-20 resize-none" value={form.address}
              onChange={e => set('address', e.target.value)} placeholder="Your address…" />
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
          <Save size={16} />
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      {/* Resume upload + view/download */}
      <div className="card">
        <h2 className="font-display font-bold text-gray-900 mb-4">Resume</h2>

        {/* View / Download — shown when resume exists */}
        {profile?.resumeOriginalName && (
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Current Resume
            </p>
            <ResumeViewer
              studentId={profile.id}
              resumeName={profile.resumeOriginalName}
              hasResume={!!profile.resumeOriginalName}
            />
          </div>
        )}

        {/* Upload button */}
        <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={handleResume} />
        <button
          type="button"
          onClick={() => fileRef.current.click()}
          disabled={uploading}
          className="btn-secondary flex items-center gap-2"
        >
          <Upload size={16} />
          {uploading
            ? 'Uploading…'
            : profile?.resumeOriginalName
              ? 'Replace Resume (PDF)'
              : 'Upload Resume (PDF)'}
        </button>
        <p className="text-xs text-gray-400 mt-2">Only PDF files are accepted. Max size: 10 MB.</p>
      </div>
    </div>
  )
}
