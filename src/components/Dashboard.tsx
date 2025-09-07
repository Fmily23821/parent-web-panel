import { useState, useEffect, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import type { ChildData, Child } from '../lib/supabase'
import { getLinkedChildren, fetchChildData, supabase } from '../lib/supabase'
import Navbar from './Navbar'
import StatsOverview from './StatsOverview'
import MonitoringTabs from './MonitoringTabs'
import LiveControls from './LiveControls'
import DeviceLinkingPage from './DeviceLinkingPage'
import WebNotifications from './WebNotifications'

interface DashboardProps {
  user: User
}

export default function Dashboard({ user }: DashboardProps) {
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [childData, setChildData] = useState<ChildData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('Today')
  const [showDeviceLinking, setShowDeviceLinking] = useState(false)
  const [isLiveMonitoring, setIsLiveMonitoring] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [realTimeData, setRealTimeData] = useState<any>(null)
  const [hasRealData, setHasRealData] = useState(false)

  const addNotification = useCallback((notification: any) => {
    setNotifications(prev => [notification, ...prev.slice(0, 49)]) // Keep last 50
  }, [])

  const loadChildren = useCallback(async () => {
    try {
      if (!user?.id) {
        console.log('No user ID available')
        setLoading(false)
        return
      }
      
      console.log('Loading children for parent ID:', user.id)
      
      // Load real children from Supabase
      const realChildren = await getLinkedChildren(user.id)
      console.log('Real children loaded:', realChildren)
      
      // Only use real data from Supabase - no mock data
      if (realChildren.length > 0) {
        setChildren(realChildren)
        setSelectedChild(realChildren[0])
        console.log('✅ Selected real child from Supabase:', realChildren[0])
      } else {
        console.log('⚠️ No real children found in Supabase database')
        setChildren([])
        setSelectedChild(null)
      }
    } catch (error) {
      console.error('❌ Error loading children from Supabase:', error)
      // No mock data fallback - only real data
      setChildren([])
      setSelectedChild(null)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (user?.id) {
      loadChildren()
    }
  }, [user?.id, loadChildren]) // Include loadChildren in dependencies

  useEffect(() => {
    if (selectedChild) {
      loadChildData()
    }
  }, [selectedChild?.id, timeRange]) // Only depend on selectedChild.id

  // Real-time monitoring setup
  useEffect(() => {
    if (!selectedChild?.id || !isLiveMonitoring) {
      return
    }

    console.log('Setting up real-time monitoring for child:', selectedChild.id)
    
    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`child-monitoring-${selectedChild.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'locations'
      }, (payload: any) => {
        if (payload.new?.device_id === selectedChild.id) {
          setRealTimeData((prev: any) => ({
            ...prev,
            location: payload.new
          }))
          // Add notification for location update
          addNotification({
            type: 'location',
            message: `Location updated: ${payload.new?.lat?.toFixed(4)}, ${payload.new?.lng?.toFixed(4)}`,
            timestamp: new Date().toISOString()
          })
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'audio_clips'
      }, (payload: any) => {
        if (payload.new?.device_id === selectedChild.id) {
          setRealTimeData((prev: any) => ({
            ...prev,
            audio: payload.new
          }))
          addNotification({
            type: 'audio',
            message: `New audio recording: ${payload.new?.duration_s}s`,
            timestamp: new Date().toISOString()
          })
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications'
      }, (payload: any) => {
        if (payload.new?.device_id === selectedChild.id) {
          setRealTimeData((prev: any) => ({
            ...prev,
            notification: payload.new
          }))
          addNotification({
            type: 'notification',
            message: `New notification from ${payload.new?.app}: ${payload.new?.title}`,
            timestamp: new Date().toISOString()
          })
        }
      })
      .subscribe()

    return () => {
      console.log('Cleaning up real-time monitoring subscription')
      subscription.unsubscribe()
    }
  }, [selectedChild?.id, isLiveMonitoring, addNotification]) // Include addNotification

  const toggleLiveMonitoring = () => {
    setIsLiveMonitoring(!isLiveMonitoring)
    if (!isLiveMonitoring) {
      addNotification({
        type: 'system',
        message: 'Live monitoring started',
        timestamp: new Date().toISOString()
      })
    }
  }

  const loadChildData = async () => {
    if (!selectedChild) return

    try {
      setLoading(true)
      
      // Load ONLY real data from Supabase - no mock data fallback
      const realData = await fetchChildData(selectedChild.id, timeRange)
      
      if (realData) {
        // Check if we have any actual data
        const hasData = realData.locations.length > 0 || 
                       realData.audioClips.length > 0 || 
                       realData.callRecordings.length > 0 || 
                       realData.notifications.length > 0 || 
                       realData.keyloggerData.length > 0 || 
                       realData.systemActivity.length > 0 || 
                       realData.appUsage.length > 0 || 
                       realData.mediaItems.length > 0
        
        console.log('✅ Loaded real Supabase data:', realData)
        console.log('📊 Has real data:', hasData)
        
        setChildData(realData)
        setHasRealData(hasData)
      } else {
        console.log('⚠️ No real data available from Supabase')
        // Set empty data structure instead of mock data
        setChildData({
          locations: [],
          audioClips: [],
          callRecordings: [],
          notifications: [],
          keyloggerData: [],
          systemActivity: [],
          appUsage: [],
          mediaItems: []
        })
        setHasRealData(false)
      }
    } catch (error) {
      console.error('❌ Error loading child data from Supabase:', error)
      // Set empty data on error
      setChildData({
        locations: [],
        audioClips: [],
        callRecordings: [],
        notifications: [],
        keyloggerData: [],
        systemActivity: [],
        appUsage: [],
        mediaItems: []
      })
      setHasRealData(false)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      // Navigation will be handled by App.tsx auth state change
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading && !childData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // If user manually wants to link a device, show linking page
  if (showDeviceLinking) {
    return <DeviceLinkingPage onBack={() => setShowDeviceLinking(false)} parentId={user.id} onDeviceLinked={loadChildren} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        user={user} 
        onLogout={handleLogout}
        children={children}
        selectedChild={selectedChild}
        onChildSelect={setSelectedChild}
      />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Status Alert - Different based on children and data availability */}
        {children.length === 0 ? (
          <div className="mb-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">
                  📱 Ready to Link Child Device
                </h3>
                <p className="text-sm opacity-90">
                  Welcome to your monitoring dashboard. Link a child device to start monitoring.
                </p>
              </div>
            </div>
          </div>
        ) : hasRealData ? (
          <div className="mb-6 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">
                  ✅ Device Connected - Real Data Available
                </h3>
                <p className="text-sm opacity-90">
                  Monitoring {selectedChild?.full_name || 'child'} with live data from Supabase.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">
                  ⚠️ Device Connected - No Data Yet
                </h3>
                <p className="text-sm opacity-90">
                  {selectedChild?.full_name || 'Child'} is linked but hasn't sent data yet. Data will appear here once the child device starts monitoring.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Time Range Selector */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {children.length === 0 
                ? 'Parent Dashboard' 
                : hasRealData 
                  ? 'Monitoring Dashboard' 
                  : 'Device Dashboard'
              }
            </h1>
            <p className="text-gray-600">
              {children.length === 0
                ? 'Welcome to your parental control dashboard'
                : hasRealData 
                  ? `Real-time monitoring for ${selectedChild?.full_name || 'child'}`
                  : `Device linked: ${selectedChild?.full_name || 'child'} - Waiting for data`
              }
            </p>
          </div>
          {children.length > 0 && (
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                {['Today', 'Week', 'Month'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      timeRange === range
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowDeviceLinking(true)}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-green-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Link Another Device</span>
              </button>
            </div>
          )}
        </div>

        {/* Show different content based on children and data state */}
        {children.length === 0 ? (
          /* No children connected - show linking prompt */
          <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-purple-100 mb-6">
                <svg className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Child Devices Linked</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Link your child's device to start advanced monitoring with root-enabled features.
              </p>
              <button
                onClick={() => setShowDeviceLinking(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Link Child Device
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <StatsOverview data={childData} loading={loading} />

            {/* Show monitoring features only when we have real data */}
            {hasRealData ? (
          <>
            {/* Live Monitoring Toggle */}
            <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Live Monitoring</h3>
                  <p className="text-sm text-gray-600">Real-time monitoring with instant notifications</p>
                </div>
                <button
                  onClick={toggleLiveMonitoring}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isLiveMonitoring
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isLiveMonitoring ? 'Stop Live Monitoring' : 'Start Live Monitoring'}
                </button>
              </div>
              {isLiveMonitoring && (
                <div className="mt-4 flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-green-600 font-medium">Live monitoring active</span>
                  </div>
                  <div className="text-gray-500">
                    Last update: {realTimeData?.location ? new Date(realTimeData.location.recorded_at).toLocaleTimeString() : 'No data yet'}
                  </div>
                </div>
              )}
            </div>

            {/* Web Notifications */}
            <WebNotifications notifications={notifications} />

            {/* Live Controls */}
            <LiveControls 
              childId={selectedChild?.id} 
              onLiveListening={() => addNotification({
                type: 'system',
                message: 'Live listening triggered',
                timestamp: new Date().toISOString()
              })}
            />

            {/* Monitoring Tabs */}
            <MonitoringTabs 
              data={childData} 
              loading={loading}
              timeRange={timeRange}
              realTimeData={realTimeData}
              isLiveMonitoring={isLiveMonitoring}
            />
          </>
        ) : (
          /* Show waiting state when no data yet */
          <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-yellow-100 mb-4">
                <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Waiting for Data</h3>
              <p className="text-gray-600 mb-4">
                The child device is connected but hasn't started sending monitoring data yet.
              </p>
              <div className="text-sm text-gray-500">
                <p>• Make sure the child device has the monitoring app installed</p>
                <p>• Ensure the app has necessary permissions (location, microphone, etc.)</p>
                <p>• Check that the device is connected to the internet</p>
                <p>• Data will appear here once monitoring begins</p>
              </div>
              <button
                onClick={loadChildData}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Refresh Data
              </button>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  )
}