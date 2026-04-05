import React, { useState } from 'react'
import { FileText, Download, Eye, Loader2, AlertCircle } from 'lucide-react'
import { fileAPI } from '../../services/api'

/**
 * ResumeViewer — shows View and Download buttons for a student resume.
 * Works for Student (own), Recruiter, Admin, Coordinator.
 *
 * Props:
 *   studentId       — the student profile ID
 *   resumeName      — original filename to display
 *   hasResume       — boolean, whether a resume exists
 *   compact         — boolean, renders smaller inline version
 */
export default function ResumeViewer({ studentId, resumeName, hasResume, compact = false }) {
  const [viewLoading, setViewLoading]     = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)
  const [error, setError]                 = useState('')

  if (!hasResume || !studentId) {
    return (
      <div className={`flex items-center gap-2 text-gray-400 ${compact ? 'text-xs' : 'text-sm'}`}>
        <FileText size={compact ? 14 : 16} />
        <span>No resume uploaded</span>
      </div>
    )
  }

  // Opens the PDF inline in a new browser tab
  const handleView = async () => {
    setViewLoading(true)
    setError('')
    try {
      const res = await fileAPI.fetchResume(studentId, false)
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url  = URL.createObjectURL(blob)
      window.open(url, '_blank')
      // Revoke after a short delay to free memory
      setTimeout(() => URL.revokeObjectURL(url), 10000)
    } catch (e) {
      setError('Could not open resume. File may be missing on server.')
    } finally {
      setViewLoading(false)
    }
  }

  // Forces a file download
  const handleDownload = async () => {
    setDownloadLoading(true)
    setError('')
    try {
      const res = await fileAPI.fetchResume(studentId, true)
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = resumeName || `resume_${studentId}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 5000)
    } catch (e) {
      setError('Download failed. File may be missing on server.')
    } finally {
      setDownloadLoading(false)
    }
  }

  if (compact) {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <FileText size={13} className="text-primary-600 flex-shrink-0" />
          <span className="text-xs text-gray-600 truncate max-w-[140px]" title={resumeName}>
            {resumeName || 'resume.pdf'}
          </span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={handleView}
            disabled={viewLoading}
            className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800
                       hover:bg-primary-50 px-2 py-0.5 rounded transition-all font-medium"
          >
            {viewLoading
              ? <Loader2 size={11} className="animate-spin" />
              : <Eye size={11} />}
            View
          </button>
          <button
            onClick={handleDownload}
            disabled={downloadLoading}
            className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800
                       hover:bg-green-50 px-2 py-0.5 rounded transition-all font-medium"
          >
            {downloadLoading
              ? <Loader2 size={11} className="animate-spin" />
              : <Download size={11} />}
            Download
          </button>
        </div>
        {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* File name row */}
      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <FileText size={16} className="text-red-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">
            {resumeName || 'resume.pdf'}
          </p>
          <p className="text-xs text-gray-400">PDF Document</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleView}
          disabled={viewLoading}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg
                     border-2 border-primary-200 text-primary-700 hover:bg-primary-50
                     font-medium text-sm transition-all disabled:opacity-60"
        >
          {viewLoading
            ? <Loader2 size={15} className="animate-spin" />
            : <Eye size={15} />}
          {viewLoading ? 'Opening…' : 'View Resume'}
        </button>

        <button
          onClick={handleDownload}
          disabled={downloadLoading}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg
                     bg-green-600 hover:bg-green-700 text-white
                     font-medium text-sm transition-all disabled:opacity-60"
        >
          {downloadLoading
            ? <Loader2 size={15} className="animate-spin" />
            : <Download size={15} />}
          {downloadLoading ? 'Downloading…' : 'Download'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-100 rounded-lg">
          <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}
    </div>
  )
}
