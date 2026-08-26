import React, { useEffect, useState } from 'react'
import { driveAPI } from '../../services/api'
import { PageHeader, Badge, Spinner, EmptyState, Modal } from '../../components/common/UI'
import { Briefcase, Plus, Edit2, Trash2, Mail } from 'lucide-react'
import toast from 'react-hot-toast'

const DEPTS = 'ALL,CSE,ECE,EEE,MECH,CIVIL,IT,AIDS,AIML'.split(',')
const STATUSES = ['UPCOMING','ACTIVE','COMPLETED','CANCELLED']

const emptyForm = {
  title: '', companyName: '', jobRole: '', jobType: 'Full-time',
  packageOffered: '', eligibleDepartments: 'ALL', minimumCgpa: '',
  applicationDeadline: '', driveDate: '', location: '',
  openings: '', requiredSkills: '', jobDescription: '', status: 'UPCOMING',
}

export default function ManageDrives() {
  const [drives, setDrives]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(false)
  const [form, setForm]       = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving]   = useState(false)

  const load = () => {
    setLoading(true)
    driveAPI.getAll()
      .then(r => setDrives(r.data.data || []))
      .catch(() => toast.error('Failed to load drives'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const openCreate = () => { setForm(emptyForm); setEditing(null); setModal(true) }
  const openEdit   = (d)  => {
    setForm({
      title: d.title, companyName: d.companyName, jobRole: d.jobRole || '',
      jobType: d.jobType || 'Full-time', packageOffered: d.packageOffered || '',
      eligibleDepartments: d.eligibleDepartments || 'ALL',
      minimumCgpa: d.minimumCgpa || '', applicationDeadline: d.applicationDeadline || '',
      driveDate: d.driveDate || '', location: d.location || '',
      openings: d.openings || '', requiredSkills: d.requiredSkills || '',
      jobDescription: d.jobDescription || '', status: d.status,
    })
    setEditing(d.id); setModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const payload = { ...form, packageOffered: +form.packageOffered || null,
        minimumCgpa: +form.minimumCgpa || null, openings: +form.openings || null }
      if (editing) await driveAPI.update(editing, payload)
      else         await driveAPI.create(payload)
      toast.success(editing ? 'Drive updated!' : 'Drive created!')
      if (!editing) {
        // Notify about email being sent to all students
        toast((t) => (
          <div className="flex items-center gap-3">
            <Mail size={18} className="text-blue-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">Students notified by email!</p>
              <p className="text-xs text-gray-500">
                All registered students have received a drive notification email.
              </p>
            </div>
          </div>
        ), { duration: 6000, icon: '📧' })
      }
      setModal(false); load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this drive?')) return
    try { await driveAPI.delete(id); toast.success('Deleted'); load() }
    catch { toast.error('Delete failed') }
  }

  if (loading) return <Spinner />

  return (
    <div className="space-y-6 fade-in">
      <PageHeader
        title="Placement Drives"
        subtitle={`${drives.length} total drives`}
        action={
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> New Drive
          </button>
        }
      />

      {drives.length === 0
        ? <EmptyState icon={Briefcase} title="No drives yet" message="Create your first placement drive." />
        : (
          <div className="grid gap-4">
            {drives.map(d => (
              <div key={d.id} className="card hover:shadow-card-hover transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-display font-bold text-gray-900">{d.title}</h3>
                      <Badge status={d.status} />
                    </div>
                    <p className="text-primary-600 font-semibold text-sm">{d.companyName}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                      {d.jobRole      && <span>💼 {d.jobRole}</span>}
                      {d.packageOffered && <span>💰 {d.packageOffered} LPA</span>}
                      {d.location     && <span>📍 {d.location}</span>}
                      {d.openings     && <span>🔢 {d.openings} openings</span>}
                      {d.minimumCgpa  && <span>📊 Min CGPA: {d.minimumCgpa}</span>}
                      {d.driveDate    && <span>📅 {d.driveDate}</span>}
                    </div>
                    {d.requiredSkills && (
                      <p className="text-xs text-gray-400 mt-1">Skills: {d.requiredSkills}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-gray-400">{d.totalApplications || 0} applied</span>
                    <button onClick={() => openEdit(d)}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => handleDelete(d.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      <Modal open={modal} onClose={() => setModal(false)}
             title={editing ? 'Edit Drive' : 'Create New Drive'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Drive Title *</label>
              <input className="input" value={form.title} onChange={e => set('title', e.target.value)} required />
            </div>
            <div>
              <label className="label">Company Name *</label>
              <input className="input" value={form.companyName} onChange={e => set('companyName', e.target.value)} required />
            </div>
            <div>
              <label className="label">Job Role</label>
              <input className="input" placeholder="Software Engineer" value={form.jobRole} onChange={e => set('jobRole', e.target.value)} />
            </div>
            <div>
              <label className="label">Package (LPA)</label>
              <input type="number" className="input" value={form.packageOffered} onChange={e => set('packageOffered', e.target.value)} />
            </div>
            <div>
              <label className="label">Job Type</label>
              <select className="input" value={form.jobType} onChange={e => set('jobType', e.target.value)}>
                {['Full-time','Part-time','Internship','Contract'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Eligible Departments</label>
              <select className="input" value={form.eligibleDepartments} onChange={e => set('eligibleDepartments', e.target.value)}>
                {DEPTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Minimum CGPA</label>
              <input type="number" step="0.1" min="0" max="10" className="input" value={form.minimumCgpa} onChange={e => set('minimumCgpa', e.target.value)} />
            </div>
            <div>
              <label className="label">Application Deadline</label>
              <input type="date" className="input" value={form.applicationDeadline} onChange={e => set('applicationDeadline', e.target.value)} />
            </div>
            <div>
              <label className="label">Drive Date</label>
              <input type="date" className="input" value={form.driveDate} onChange={e => set('driveDate', e.target.value)} />
            </div>
            <div>
              <label className="label">Location</label>
              <input className="input" value={form.location} onChange={e => set('location', e.target.value)} />
            </div>
            <div>
              <label className="label">Openings</label>
              <input type="number" className="input" value={form.openings} onChange={e => set('openings', e.target.value)} />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Required Skills</label>
              <input className="input" placeholder="Java, Spring Boot, MySQL" value={form.requiredSkills} onChange={e => set('requiredSkills', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="label">Job Description</label>
              <textarea className="input h-24 resize-none" value={form.jobDescription} onChange={e => set('jobDescription', e.target.value)} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving…' : (editing ? 'Update Drive' : 'Create Drive')}
            </button>
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
