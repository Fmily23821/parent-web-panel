import { useState, useEffect } from 'react'
import { generateLinkingCode, linkDeviceWithCode } from '../lib/supabase'

interface DeviceLinkingPageProps {
  onBack: () => void
  parentId?: string
  onDeviceLinked?: () => void
}

export default function DeviceLinkingPage({ onBack, parentId, onDeviceLinked }: DeviceLinkingPageProps) {
  const [deviceCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('')
  const [initializing, setInitializing] = useState(true)

  // Generate a real linking code from Supabase
  const generateDeviceCode = async () => {
    if (!parentId) {
      setError('Parent ID not available')
      return
    }
    
    try {
      setLoading(true)
      setError('') // Clear any previous errors
      const code = await generateLinkingCode(parentId)
      setGeneratedCode(code)
    } catch (error) {
      console.error('Error generating linking code:', error)
      setError('Failed to generate linking code')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (parentId) {
      setInitializing(false)
      generateDeviceCode()
    } else {
      setInitializing(false)
      setError('Parent ID not available')
    }
  }, [parentId])

  const handleLinkDevice = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (deviceCode.length !== 6) {
      setError('Device code must be exactly 6 characters')
      setLoading(false)
      return
    }

    try {
      // In real implementation, this would be called from the child device
      // For demo purposes, we'll simulate with a demo child ID
      const success = await linkDeviceWithCode(deviceCode, 'demo-child-id')
      if (success) {
        setSuccess(true)
        // Call the callback to refresh the children list
        if (onDeviceLinked) {
          setTimeout(() => {
            onDeviceLinked()
          }, 2000) // Wait 2 seconds to show success message, then refresh
        }
      } else {
        setError('Invalid or expired linking code')
      }
    } catch (error) {
      console.error('Device linking error:', error)
      setError('Failed to link device. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing device linking...</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-green-100 mb-6">
            <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Device Linked Successfully!</h2>
          <p className="text-gray-600 mb-6">Your child's device is now connected and monitoring has begun. You will be redirected to the dashboard shortly.</p>
          <button
            onClick={onBack}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg mb-4">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Link Child Device
          </h1>
          <p className="mt-2 text-gray-600">Connect your child's device to start monitoring</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Instructions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Setup Instructions
            </h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-xs font-semibold text-blue-600">1</span>
                </div>
                <div>
                  <p className="text-sm text-gray-700">Install the Child Protect app on your child's device</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-xs font-semibold text-blue-600">2</span>
                </div>
                <div>
                  <p className="text-sm text-gray-700">Open the app and select "Link to Parent"</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-xs font-semibold text-blue-600">3</span>
                </div>
                <div>
                  <p className="text-sm text-gray-700">Enter the 6-character code below</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-xs font-semibold text-green-600">✓</span>
                </div>
                <div>
                  <p className="text-sm text-gray-700">Device will be automatically linked</p>
                </div>
              </div>
            </div>
          </div>

          {/* Device Code */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="h-5 w-5 text-purple-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Device Linking Code
            </h3>

            {/* Generated Code Display */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Generated Code (Use this in the child app)
              </label>
              <div className="flex items-center space-x-3">
                <div className="flex-1 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
                  <div className="text-2xl font-mono font-bold text-gray-900 tracking-wider">
                    {generatedCode}
                  </div>
                </div>
                <button
                  onClick={generateDeviceCode}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Generate new code"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Manual Entry Form */}
            <form onSubmit={handleLinkDevice} className="space-y-4">

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                  <div className="flex">
                    <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || deviceCode.length !== 6}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Linking Device...
                  </div>
                ) : (
                  'Link Device'
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={onBack}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Secure Connection</h3>
              <p className="mt-1 text-sm text-green-700">
                All device connections are encrypted and secure. The 8-character code ensures only authorized devices can be linked to your account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}