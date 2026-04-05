import React, { useEffect, useState } from 'react'
import { studentAPI } from '../../services/api'
import { PageHeader, Badge, Spinner, EmptyState } from '../../components/common/UI'
import ResumeViewer from '../../components/common/ResumeViewer'
import { Users, Search } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ManageStudents({ viewOnly }) {
  const [students, setStudents] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [deptFilter, setDeptFilter] = useState('ALL')
  const [placedFilter, setPlacedFilter] = useState('ALL')

  useEffect(() => {
    studentAPI.getAll()
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
        s.lastName?.toLowerCase().includes(q) ||
        s.rollNumber?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q)
      )
    }
    if (deptFilter !== 'ALL') list = list.filter(s => s.department === deptFilter)
    if (placedFilter === 'PLACED')    list = list.filter(s => s.isPlaced)
    if (placedFilter === 'UNPLACED')  list = list.filter(s => !s.isPlaced)
    setFiltered(list)
  }, [search, deptFilter, placedFilter, students])

  const depts = ['ALL', ...new Set(students.map(s => s.department).filter(Boolean))]

  if (loading) return <Spinner />

  return (
    <div className="space-y-6 fade-in">
      <PageHeader title="Students" subtitle={`${filtered.length} of ${students.length} students`} />

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9 text-sm" placeholder="Search by name, roll, email…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-36 text-sm" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
          {depts.map(d => <option key={d}>{d}</option>)}
        </select>
        <select className="input w-36 text-sm" value={placedFilter} onChange={e => setPlacedFilter(e.target.value)}>
          <option value="ALL">All Status</option>
          <option value="PLACED">Placed</option>
          <option value="UNPLACED">Not Placed</option>
        </select>
      </div>

      {filtered.length === 0
        ? <EmptyState icon={Users} title="No students found" message="Try adjusting your filters." />
        : (
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Student','Roll No','Department','Batch','CGPA','Skills','Status','Company','Resume'].map(h => (
                      <th key={h} className="table-th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="table-td">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700
                                          flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {s.firstName?.[0]}{s.lastName?.[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{s.firstName} {s.lastName}</p>
                            <p className="text-xs text-gray-400">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-td font-mono text-xs">{s.rollNumber}</td>
                      <td className="table-td">{s.department || '—'}</td>
                      <td className="table-td">{s.batch || '—'}</td>
                      <td className="table-td">
                        <span className={`font-semibold ${s.cgpa >= 7.5 ? 'text-green-600' : s.cgpa >= 6 ? 'text-yellow-600' : 'text-red-500'}`}>
                          {s.cgpa?.toFixed(2) ?? '—'}
                        </span>
                      </td>
                      <td className="table-td text-xs max-w-[140px] truncate" title={s.skills}>{s.skills || '—'}</td>
                      <td className="table-td">
                        <Badge status={s.isPlaced ? 'SELECTED' : 'APPLIED'} />
                      </td>
                      <td className="table-td text-xs">{s.placedCompany || '—'}</td>
                      <td className="table-td">
                        <ResumeViewer
                          studentId={s.id}
                          resumeName={s.resumeOriginalName}
                          hasResume={!!s.resumeOriginalName}
                          compact
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </div>
  )
}
