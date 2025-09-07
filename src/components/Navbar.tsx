import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Child } from '../lib/supabase'

interface NavbarProps {
  user: User
  onLogout: () => void
  children: Child[]
  selectedChild: Child | null
  onChildSelect: (child: Child) => void
}

export default function Navbar({ user, onLogout, children, selectedChild, onChildSelect }: NavbarProps) {
  const [showChildMenu, setShowChildMenu] = useState(false)

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="ml-2 text-xl font-bold text-gray-900">Child Protect</span>
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Root Enabled
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Child Selector */}
            {children.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowChildMenu(!showChildMenu)}
                  className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {selectedChild?.full_name || 'Select Child'}
                  <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showChildMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    {children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => {
                          onChildSelect(child)
                          setShowChildMenu(false)
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          selectedChild?.id === child.id
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {child.full_name || child.email}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Live Status Indicator */}
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live</span>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">{user.email}</span>
              <button
                onClick={onLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}