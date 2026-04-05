import React, { useEffect, useState } from 'react'
import { coordinatorAPI } from '../../services/api'
import { PageHeader, Spinner, EmptyState, Modal, Badge } from '../../components/common/UI'
import {
  Building, Search, Star, Briefcase, Users, Eye,
  Globe, Phone, Calendar, Award, ChevronDown, ChevronRight,
  DollarSign, MapPin, Clock, BookOpen
} from 'lucide-react'
import toast from 'react-hot-toast'

function RatingStars({ rating }) {
  if (!rating) return <span className="text-xs text-gray-400">No ratings yet</span>
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={13}
          className={i <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
      ))}
      <span className="text-xs font-bold text-gray-700 ml-1">{rating.toFixed(1)}</span>
    </div>
  )
}

function DriveCard({ drive }) {
  const statusColors = {
    ACTIVE:    'bg-green-100 text-green-700',
    UPCOMING:  'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-gray-100 text-gray-600',
    CANCELLED: 'bg-red-100 text-red-600',
  }
  return (
    <div className="border border-gray-100 rounded-xl p-4 hover:border-primary-200 hover:bg-primary-50/30 transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-semibold text-gray-900 text-sm">{drive.title}</p>
          <p className="text-xs text-primary-600 font-medium mt-0.5">{drive.jobRole || 'Role TBD'}</p>
        </div>
        <span className={`badge text-xs flex-shrink-0 ${statusColors[drive.status] || 'bg-gray-100 text-gray-600'}`}>
          {drive.status}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-600">
        {drive.packageOffered  && <span className="flex items-center gap-1.5"><DollarSign size={11} className="text-green-500" /> {drive.packageOffered} LPA</span>}
        {drive.jobType         && <span className="flex items-center gap-1.5"><Briefcase size={11} className="text-blue-500" /> {drive.jobType}</span>}
        {drive.openings        && <span className="flex items-center gap-1.5"><Users size={11} className="text-purple-500" /> {drive.openings} openings</span>}
        {drive.location        && <span className="flex items-center gap-1.5"><MapPin size={11} className="text-red-400" /> {drive.location}</span>}
        {drive.minimumCgpa     && <span className="flex items-center gap-1.5"><Award size={11} className="text-orange-400" /> Min CGPA: {drive.minimumCgpa}</span>}
        {drive.driveDate       && <span className="flex items-center gap-1.5"><Calendar size={11} className="text-indigo-400" /> {drive.driveDate}</span>}
        {drive.applicationDeadline && <span className="flex items-center gap-1.5 text-red-500"><Clock size={11} /> Deadline: {drive.applicationDeadline}</span>}
        {drive.eligibleDepartments && <span className="flex items-center gap-1.5"><BookOpen size={11} className="text-teal-500" /> {drive.eligibleDepartments}</span>}
      </div>
      {drive.requiredSkills && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {drive.requiredSkills.split(',').map(sk => (
            <span key={sk} className="badge bg-indigo-50 text-indigo-600 text-xs">{sk.trim()}</span>
          ))}
        </div>
      )}
      <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
        <span className="flex items-center gap-1"><Users size={11} /> {drive.totalApplications} applied</span>
        <span className="flex items-center gap-1 text-green-600 font-semibold">✓ {drive.selectedCount} selected</span>
      </div>
    </div>
  )
}

export default function CoordinatorCompanies() {
  const [companies, setCompanies] = useState([])
  const [filtered, setFiltered]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [selected, setSelected]   = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [expandedDrives, setExpandedDrives] = useState({})

  useEffect(() => {
    coordinatorAPI.getCompanies()
      .then(r => { setCompanies(r.data.data || []); setFiltered(r.data.data || []) })
      .catch(() => toast.error('Failed to load companies'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!search) { setFiltered(companies); return }
    const q = search.toLowerCase()
    setFiltered(companies.filter(c =>
      c.companyName?.toLowerCase().includes(q) ||
      c.industry?.toLowerCase().includes(q)    ||
      c.recruiterName?.toLowerCase().includes(q)||
      c.drives?.some(d =>
        d.requiredSkills?.toLowerCase().includes(q) ||
        d.jobRole?.toLowerCase().includes(q)
      )
    ))
  }, [search, companies])

  const totalHires  = companies.reduce((s, c) => s + (c.totalHires || 0), 0)
  const totalDrives = companies.reduce((s, c) => s + (c.totalDrives || 0), 0)

  const toggleDrives = (id) => setExpandedDrives(p => ({ ...p, [id]: !p[id] }))
  const openDetail   = (c)  => { setSelected(c); setDetailOpen(true) }

  if (loading) return <Spinner />

  return (
    <div className="space-y-6 fade-in">
      <PageHeader
        title="Company & Drive Details"
        subtitle={`${companies.length} registered companies · ${totalDrives} total drives · ${totalHires} total hires`}
      />

      {/* Search */}
      <div className="card p-4 flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9 text-sm" placeholder="Search company, industry, skills, job role…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 flex-shrink-0">
          <Building size={15} className="text-primary-500" />
          <span className="font-medium">{filtered.length} found</span>
        </div>
      </div>

      {filtered.length === 0
        ? <EmptyState icon={Building} title="No companies found"
            message="No companies have registered yet or no matches for your search." />
        : (
          <div className="space-y-4">
            {filtered.map(company => (
              <div key={company.id} className="card hover:shadow-card-hover transition-shadow">

                {/* Company header row */}
                <div className="flex items-start gap-4">
                  {/* Logo placeholder */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200
                                  flex items-center justify-center flex-shrink-0 text-primary-700 font-display font-bold text-lg">
                    {company.companyName?.[0] || '?'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display font-bold text-gray-900 text-lg leading-tight">{company.companyName}</h3>
                        <p className="text-sm text-gray-500">{company.recruiterName} · {company.designation || 'HR'}</p>
                        <p className="text-xs text-gray-400">{company.recruiterEmail}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => openDetail(company)}
                          className="flex items-center gap-1 text-xs text-primary-600 hover:bg-primary-50
                                     border border-primary-200 px-3 py-1.5 rounded-lg font-semibold transition-all">
                          <Eye size={12} /> Details
                        </button>
                      </div>
                    </div>

                    {/* Tags row */}
                    <div className="flex flex-wrap gap-2 mt-2.5">
                      {company.industry     && <span className="badge bg-purple-50 text-purple-600">{company.industry}</span>}
                      {company.companySize  && <span className="badge bg-gray-100 text-gray-600">{company.companySize}</span>}
                      <span className="badge bg-blue-50 text-blue-600"><Briefcase size={10} className="mr-0.5" /> {company.totalDrives} drive{company.totalDrives !== 1 ? 's' : ''}</span>
                      <span className="badge bg-green-50 text-green-600"><Users size={10} className="mr-0.5" /> {company.totalHires} hired</span>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex-shrink-0 text-right">
                    <RatingStars rating={company.averageRating} />
                    {company.totalRatings > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">{company.totalRatings} review{company.totalRatings !== 1 ? 's' : ''}</p>
                    )}
                  </div>
                </div>

                {/* Drives section (collapsible) */}
                {company.drives?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => toggleDrives(company.id)}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-700
                                 hover:text-primary-700 transition-colors w-full text-left"
                    >
                      {expandedDrives[company.id]
                        ? <ChevronDown size={16} className="text-primary-500" />
                        : <ChevronRight size={16} className="text-gray-400" />}
                      {company.drives.length} Placement Drive{company.drives.length !== 1 ? 's' : ''}
                      <span className="ml-auto text-xs text-gray-400 font-normal">
                        {expandedDrives[company.id] ? 'Click to collapse' : 'Click to expand'}
                      </span>
                    </button>

                    {expandedDrives[company.id] && (
                      <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {company.drives.map(d => <DriveCard key={d.id} drive={d} />)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      {/* Company detail modal */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)}
             title={selected?.companyName} size="xl">
        {selected && (
          <div className="space-y-5">

            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-blue-900 to-indigo-800 rounded-xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-2xl font-bold">{selected.companyName}</h3>
                  <p className="text-blue-200 mt-0.5">{selected.industry || 'Industry not specified'}</p>
                  <div className="flex gap-3 mt-2 flex-wrap">
                    {selected.companySize && <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full">{selected.companySize}</span>}
                    {selected.companyWebsite && (
                      <a href={selected.companyWebsite.startsWith('http') ? selected.companyWebsite : `https://${selected.companyWebsite}`}
                         target="_blank" rel="noreferrer"
                         className="text-xs bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-full flex items-center gap-1 transition-all">
                        <Globe size={11} /> Website
                      </a>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-display font-bold">{selected.totalDrives}</p>
                  <p className="text-blue-300 text-sm">Drives Posted</p>
                  <p className="text-2xl font-bold text-green-300 mt-1">{selected.totalHires}</p>
                  <p className="text-blue-300 text-xs">Students Hired</p>
                </div>
              </div>
            </div>

            {/* Recruiter info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">HR Contact</p>
                <p className="font-semibold text-gray-900">{selected.recruiterName}</p>
                <p className="text-sm text-gray-500">{selected.designation}</p>
                <p className="text-sm text-primary-600 mt-1">{selected.recruiterEmail}</p>
                {selected.phoneNumber && (
                  <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-1">
                    <Phone size={12} /> {selected.phoneNumber}
                  </p>
                )}
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Rating</p>
                <RatingStars rating={selected.averageRating} />
                <p className="text-sm text-gray-500 mt-1">{selected.totalRatings || 0} student review{selected.totalRatings !== 1 ? 's' : ''}</p>
                <p className="text-xs text-gray-400 mt-2">
                  Registered: {selected.registeredAt ? new Date(selected.registeredAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                </p>
              </div>
            </div>

            {/* Description */}
            {selected.companyDescription && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">About Company</p>
                <p className="text-sm text-gray-700 leading-relaxed">{selected.companyDescription}</p>
              </div>
            )}

            {/* All drives */}
            {selected.drives?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  All Placement Drives ({selected.drives.length})
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                  {selected.drives.map(d => <DriveCard key={d.id} drive={d} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
