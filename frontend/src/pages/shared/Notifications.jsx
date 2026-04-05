import React, { useEffect, useState } from 'react'
import { notificationAPI } from '../../services/api'
import { PageHeader, Spinner, EmptyState } from '../../components/common/UI'
import { Bell, CheckCheck, Briefcase, TrendingUp, Info, Award } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'

const TYPE_CONFIG = {
  NEW_DRIVE:          { icon: Briefcase,  color: 'bg-blue-100 text-blue-600',   label: 'New Drive'          },
  APPLICATION_STATUS: { icon: TrendingUp, color: 'bg-purple-100 text-purple-600', label: 'Application Update' },
  SELECTION_RESULT:   { icon: Award,      color: 'bg-green-100 text-green-600', label: 'Selection Result'    },
  REMINDER:           { icon: Bell,       color: 'bg-yellow-100 text-yellow-600', label: 'Reminder'          },
  GENERAL:            { icon: Info,       color: 'bg-gray-100 text-gray-600',   label: 'General'             },
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading]             = useState(true)
  const [marking, setMarking]             = useState(false)

  const load = () => {
    notificationAPI.getAll()
      .then(r => setNotifications(r.data.data || []))
      .catch(() => toast.error('Failed to load notifications'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch { toast.error('Failed') }
  }

  const handleMarkAllRead = async () => {
    setMarking(true)
    try {
      await notificationAPI.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      toast.success('All marked as read')
    } catch { toast.error('Failed') }
    finally { setMarking(false) }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) return <Spinner />

  return (
    <div className="space-y-6 fade-in max-w-2xl">
      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
        action={unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={marking}
            className="btn-secondary flex items-center gap-2 text-sm py-2"
          >
            <CheckCheck size={15} />
            {marking ? 'Marking…' : 'Mark all read'}
          </button>
        )}
      />

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          message="You'll be notified about new drives, application updates, and more."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const cfg  = TYPE_CONFIG[n.type] || TYPE_CONFIG.GENERAL
            const Icon = cfg.icon
            const timeAgo = n.createdAt
              ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })
              : ''

            return (
              <div
                key={n.id}
                onClick={() => !n.read && handleMarkRead(n.id)}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer
                  ${!n.read
                    ? 'bg-blue-50 border-blue-100 hover:bg-blue-100'
                    : 'bg-white border-gray-100 hover:bg-gray-50 opacity-70'}`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                  <Icon size={18} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`text-sm font-semibold leading-snug ${!n.read ? 'text-gray-900' : 'text-gray-600'}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!n.read && (
                        <span className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`badge text-xs ${cfg.color}`}>{cfg.label}</span>
                    {timeAgo && <span className="text-xs text-gray-400">{timeAgo}</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
