import { useState } from 'react'

interface LiveControlsProps {
  childId?: string
  isLiveMonitoring?: boolean
  onLiveListening?: () => void
}

export default function LiveControls({ childId, onLiveListening }: LiveControlsProps) {
  const [isLiveListening, setIsLiveListening] = useState(false)
  const [isScreenshotActive, setIsScreenshotActive] = useState(false)
  const [isSystemMonitoring, setIsSystemMonitoring] = useState(false)

  const handleLiveListening = () => {
    setIsLiveListening(!isLiveListening)
    console.log(`${isLiveListening ? 'Stopping' : 'Starting'} live listening for child:`, childId)
    if (onLiveListening) {
      onLiveListening()
    }
  }

  const handleScreenshot = () => {
    setIsScreenshotActive(!isScreenshotActive)
    console.log(`${isScreenshotActive ? 'Stopping' : 'Starting'} screenshots for child:`, childId)
  }

  const handleSystemMonitoring = () => {
    setIsSystemMonitoring(!isSystemMonitoring)
    console.log(`${isSystemMonitoring ? 'Stopping' : 'Starting'} system monitoring for child:`, childId)
  }

  const handleForceGPS = () => {
    console.log('Forcing GPS on for child:', childId)
  }

  return (
    <div className="card mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        <svg className="inline h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Advanced Root Controls
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={handleLiveListening}
          className={`flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
            isLiveListening
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          {isLiveListening ? 'Stop Live Listening' : 'Start Live Listening'}
        </button>

        <button
          onClick={handleScreenshot}
          className={`flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
            isScreenshotActive
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {isScreenshotActive ? 'Stop Screenshots' : 'Start Screenshots'}
        </button>

        <button
          onClick={handleSystemMonitoring}
          className={`flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
            isSystemMonitoring
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          {isSystemMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
        </button>

        <button
          onClick={handleForceGPS}
          className="flex items-center justify-center px-4 py-3 rounded-lg font-medium bg-orange-600 hover:bg-orange-700 text-white transition-colors"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Force GPS On
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${isLiveListening ? 'bg-green-400' : 'bg-gray-300'}`}></div>
            <span className="text-gray-600">Live Listening: {isLiveListening ? 'Active' : 'Inactive'}</span>
          </div>
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${isScreenshotActive ? 'bg-blue-400' : 'bg-gray-300'}`}></div>
            <span className="text-gray-600">Screenshots: {isScreenshotActive ? 'Active' : 'Inactive'}</span>
          </div>
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${isSystemMonitoring ? 'bg-purple-400' : 'bg-gray-300'}`}></div>
            <span className="text-gray-600">System Monitor: {isSystemMonitoring ? 'Active' : 'Inactive'}</span>
          </div>
        </div>
        <div className="text-green-600 font-semibold">
          All systems operational
        </div>
      </div>
    </div>
  )
}