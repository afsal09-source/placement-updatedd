import React, { useEffect, useState } from 'react'
import { coordinatorAPI } from '../../services/api'
import { PageHeader, Spinner, EmptyState, Modal, Badge } from '../../components/common/UI'
import ResumeViewer from '../../components/common/ResumeViewer'
import {
  Users, Search, Filter, Eye, TrendingUp, CheckCircle,
  GraduationCap, Phone, MapPin, Linkedin, Github, Star
} from 'lucide-react'
import toast from 'react-hot-toast'

function StatPill({ label, value, color = 'blue' }) {
  const colors = {
    blue:   'bg-blue-50 text-blue-700 border-blue-100',
    green:  'bg-green-50 text-green-700 border-green-100',
    orange: 'bg-orange-50 text-orange-700 border-orange-100',
    red:    'bg-red-50 text-red-700 border-red-100',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${colors[color]}`}>
      {label}: <strong>{value ?? '—'}</strong>
    </span>
  )
}

export default function CoordinatorStudents() {
  const [students, setStudents]   = useState([])
  const [filtered, setFiltered]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [deptFilter, setDept]     = useState('ALL')
  const [placedFilter, setPlaced] = useState('ALL')
  const [selected, setSelected]   = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)

  useEffect(() => {
    coordinatorAPI.getStudents()
      .then(r => { setStudents(r.data.data || []); setFiltered(r.data.data || []) })
      .catch(() => toast.error('Failed to load students'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let list = [...students]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(s =>
        s.firstName?.toLowerCase().includes(q) ||
        s.lastName?.toLowerCase().includes(q)  ||
        s.rollNumber?.toLowerCase().includes(q)||
        s.email?.toLowerCase().includes(q)     ||
        s.skills?.toLowerCase().includes(q)
      )
    }
    if (deptFilter !== 'ALL')     list = list.filter(s => s.department === deptFilter)
    if (placedFilter === 'PLACED')  list = list.filter(s => s.isPlaced)
    if (placedFilter === 'UNPLACED')list = list.filter(s => !s.isPlaced)
    setFiltered(list)
  }, [search, deptFilter, placedFilter, students])

  const depts = ['ALL', ...new Set(students.map(s => s.department).filter(Boolean))]
  const placedCount   = students.filter(s => s.isPlaced).length
  const unplacedCount = students.filter(s => !s.isPlaced).length

  const openDetail = (s) => { setSelected(s); setDetailOpen(true) }

  if (loading) return <Spinner />

  return (
    <div className="space-y-6 fade-in">
      <PageHeader
        title="Student Details"
        subtitle={`${filtered.length} of ${students.length} students`}
        action={
          <div className="flex gap-3">
            <StatPill label="Placed"   value={placedCount}   color="green" />
            <StatPill label="Unplaced" value={unplacedCount} color="orange" />
          </div>
        }
      />

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-52">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9 text-sm" placeholder="Search name, roll, email, skills…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-gray-400" />
          <select className="input w-36 text-sm" value={deptFilter} onChange={e => setDept(e.target.value)}>
            {depts.map(d => <option key={d}>{d}</option>)}
          </select>
          <select className="input w-36 text-sm" value={placedFilter} onChange={e => setPlaced(e.target.value)}>
            <option value="ALL">All Status</option>
            <option value="PLACED">Placed</option>
            <option value="UNPLACED">Not Placed</option>
          </select>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {depts.filter(d => d !== 'ALL').map(dept => {
          const count = students.filter(s => s.department === dept).length
          const pct   = count > 0 ? Math.round(students.filter(s => s.department === dept && s.isPlaced).length / count * 100) : 0
          return count > 0 ? (
            <div key={dept} className="card p-3 text-center border border-gray-100">
              <p className="font-display font-bold text-lg text-gray-900">{count}</p>
              <p className="text-xs text-gray-500 font-medium">{dept}</p>
              <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-xs text-green-600 mt-0.5">{pct}% placed</p>
            </div>
          ) : null
        })}
      </div>

      {/* Student table */}
      {filtered.length === 0
        ? <EmptyState icon={Users} title="No students found" message="Try adjusting your filters." />
        : (
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Student','Roll No','Dept','Batch','CGPA','Skills','Placement','Resume','Action'].map(h => (
                      <th key={h} className="table-th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="table-td">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700
                                          flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {s.firstName?.[0]}{s.lastName?.[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-900">{s.firstName} {s.lastName}</p>
                            <p className="text-xs text-gray-400">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-td font-mono text-xs text-gray-700">{s.rollNumber}</td>
                      <td className="table-td text-sm">{s.department || '—'}</td>
                      <td className="table-td text-sm">{s.batch || '—'}</td>
                      <td className="table-td">
                        <span className={`font-bold text-sm ${s.cgpa >= 8 ? 'text-green-600' : s.cgpa >= 6.5 ? 'text-blue-600' : s.cgpa ? 'text-orange-500' : 'text-gray-400'}`}>
                          {s.cgpa?.toFixed(2) ?? '—'}
                        </span>
                      </td>
                      <td className="table-td max-w-[160px]">
                        {s.skills
                          ? <div className="flex flex-wrap gap-1">
                              {s.skills.split(',').slice(0, 3).map(sk => (
                                <span key={sk} className="badge bg-blue-50 text-blue-600 text-xs">{sk.trim()}</span>
                              ))}
                              {s.skills.split(',').length > 3 && (
                                <span className="badge bg-gray-100 text-gray-500 text-xs">+{s.skills.split(',').length - 3}</span>
                              )}
                            </div>
                          : <span className="text-xs text-gray-400">—</span>
                        }
                      </td>
                      <td className="table-td">
                        {s.isPlaced ? (
                          <div>
                            <span className="badge bg-green-100 text-green-700 flex items-center gap-1">
                              <CheckCircle size={11} /> Placed
                            </span>
                            {s.placedCompany && <p className="text-xs text-gray-500 mt-0.5">{s.placedCompany}</p>}
                          </div>
                        ) : (
                          <span className="badge bg-orange-100 text-orange-600">Seeking</span>
                        )}
                      </td>
                      <td className="table-td">
                        <ResumeViewer
                          studentId={s.id}
                          resumeName={s.resumeOriginalName}
                          hasResume={!!s.resumeOriginalName}
                          compact
                        />
                      </td>
                      <td className="table-td">
                        <button onClick={() => openDetail(s)}
                          className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800
                                     hover:bg-primary-50 px-2 py-1.5 rounded-lg transition-all font-semibold">
                          <Eye size={13} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* Student detail modal */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)}
             title={`${selected?.firstName} ${selected?.lastName}`} size="lg">
        {selected && (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-900 to-blue-700 rounded-xl text-white">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold">
                {selected.firstName?.[0]}{selected.lastName?.[0]}
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-xl">{selected.firstName} {selected.lastName}</h3>
                <p className="text-blue-200 text-sm">{selected.email}</p>
                <div className="flex gap-3 mt-1.5 flex-wrap">
                  {selected.rollNumber && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">🎓 {selected.rollNumber}</span>}
                  {selected.department && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">🏛 {selected.department}</span>}
                  {selected.batch      && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">📅 {selected.batch}</span>}
                </div>
              </div>
              {selected.cgpa && (
                <div className="text-right">
                  <p className="text-blue-200 text-xs">CGPA</p>
                  <p className="font-display text-3xl font-bold">{selected.cgpa.toFixed(2)}</p>
                  <p className="text-blue-200 text-xs">/ 10.0</p>
                </div>
              )}
            </div>

            {/* Placement status */}
            {selected.isPlaced ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-xl">
                <CheckCircle size={20} className="text-green-600" />
                <div>
                  <p className="font-semibold text-green-800 text-sm">Placed at {selected.placedCompany}</p>
                  {selected.placedPackage && <p className="text-xs text-green-600">Package: {selected.placedPackage} LPA</p>}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-100 rounded-xl">
                <TrendingUp size={18} className="text-orange-500" />
                <p className="text-sm text-orange-700 font-medium">Currently seeking placement opportunities</p>
              </div>
            )}

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Phone,    label: 'Phone',    val: selected.phoneNumber },
                { icon: MapPin,   label: 'Address',  val: selected.address     },
                { icon: Linkedin, label: 'LinkedIn', val: selected.linkedin    },
                { icon: Github,   label: 'GitHub',   val: selected.github      },
              ].map(({ icon: Icon, label, val }) => val ? (
                <div key={label} className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-xl">
                  <Icon size={15} className="text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium">{label}</p>
                    <p className="text-sm text-gray-800 break-all">{val}</p>
                  </div>
                </div>
              ) : null)}
            </div>

            {/* Skills */}
            {selected.skills && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {selected.skills.split(',').map(sk => (
                    <span key={sk} className="badge bg-blue-100 text-blue-700 px-3 py-1">{sk.trim()}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Resume */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Resume</p>
              <ResumeViewer
                studentId={selected.id}
                resumeName={selected.resumeOriginalName}
                hasResume={!!selected.resumeOriginalName}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
