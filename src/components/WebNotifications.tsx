import { useState, useEffect } from 'react'

interface Notification {
  type: 'location' | 'audio' | 'notification' | 'system' | 'call' | 'keylogger' | 'screenshot'
  message: string
  timestamp: string
}

interface WebNotificationsProps {
  notifications: Notification[]
}

export default function WebNotifications({ notifications }: WebNotificationsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Count unread notifications (last 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
    const recent = notifications.filter(n => new Date(n.timestamp) > tenMinutesAgo)
    setUnreadCount(recent.length)
  }, [notifications])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'location':
        return '📍'
      case 'audio':
        return '🎤'
      case 'notification':
        return '🔔'
      case 'system':
        return '⚙️'
      case 'call':
        return '📞'
      case 'keylogger':
        return '⌨️'
      case 'screenshot':
        return '📸'
      default:
        return '📢'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'location':
        return 'border-blue-200 bg-blue-50'
      case 'audio':
        return 'border-green-200 bg-green-50'
      case 'notification':
        return 'border-yellow-200 bg-yellow-50'
      case 'system':
        return 'border-purple-200 bg-purple-50'
      case 'call':
        return 'border-red-200 bg-red-50'
      case 'keylogger':
        return 'border-orange-200 bg-orange-50'
      case 'screenshot':
        return 'border-indigo-200 bg-indigo-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="relative">
              <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12.828 7H4.828z" />
              </svg>
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </div>
              )}
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">Live Alerts & Notifications</h3>
              <p className="text-sm text-gray-600">
                {unreadCount > 0 ? `${unreadCount} new alerts` : 'No new alerts'}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <svg 
              className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <svg className="h-12 w-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12.828 7H4.828z" />
              </svg>
              <p>No notifications yet</p>
              <p className="text-sm">Start live monitoring to receive real-time alerts</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.slice(0, 20).map((notification, index) => (
                <div 
                  key={index}
                  className={`p-4 border-l-4 ${getNotificationColor(notification.type)}`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 text-lg mr-3">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>
                    <div className="flex-shrink-0 ml-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        notification.type === 'system' ? 'bg-purple-100 text-purple-800' :
                        notification.type === 'location' ? 'bg-blue-100 text-blue-800' :
                        notification.type === 'audio' ? 'bg-green-100 text-green-800' :
                        notification.type === 'notification' ? 'bg-yellow-100 text-yellow-800' :
                        notification.type === 'call' ? 'bg-red-100 text-red-800' :
                        notification.type === 'keylogger' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {notification.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}