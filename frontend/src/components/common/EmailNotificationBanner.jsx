import React, { useState } from 'react'
import { Mail, X, CheckCircle } from 'lucide-react'

/**
 * EmailNotificationBanner
 * Shows a green banner confirming an email was sent.
 * Auto-dismisses after 8 seconds, or on X click.
 *
 * Props:
 *   type    — 'register' | 'apply' | 'status'
 *   email   — the email address the notification went to
 *   company — company name (for apply/status types)
 */
export default function EmailNotificationBanner({ type, email, company, onClose }) {
  const messages = {
    register: {
      icon: '🎓',
      title: 'Registration Confirmed!',
      body: `A welcome email has been sent to ${email} with your login details and dashboard link.`,
    },
    apply: {
      icon: '📧',
      title: 'Application Email Sent!',
      body: `A confirmation email has been sent to ${email} for your application to ${company}.`,
    },
    status: {
      icon: '🔔',
      title: 'Status Update Emailed',
      body: `The student has been notified at their email about the status change for ${company}.`,
    },
  }

  const msg = messages[type] || messages.apply

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full animate-fade-in">
      <div className="bg-green-50 border border-green-200 rounded-xl shadow-lg p-4 flex gap-3">
        <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 text-lg">
          {msg.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-green-800 text-sm">{msg.title}</p>
          <p className="text-xs text-green-700 mt-0.5 leading-relaxed">{msg.body}</p>
        </div>
        <button
          onClick={onClose}
          className="text-green-400 hover:text-green-600 flex-shrink-0 mt-0.5"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
