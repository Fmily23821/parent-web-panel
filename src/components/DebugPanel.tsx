import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface DebugPanelProps {
  user: any
}

export default function DebugPanel({ user }: DebugPanelProps) {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runDebugChecks = async () => {
    setLoading(true)
    try {
      console.log('=== DEBUG CHECKS STARTING ===')
      
      // Check user info
      console.log('Current user:', user)
      
      // Check parent_child_links table
      const { data: links, error: linksError } = await supabase
        .from('parent_child_links')
        .select('*')
        .eq('parent_id', user?.id)
      
      console.log('Parent-child links:', links)
      console.log('Links error:', linksError)
      
      // Check user_profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'child')
      
      console.log('Child profiles:', profiles)
      console.log('Profiles error:', profilesError)
      
      // Check linking_codes table
      const { data: codes, error: codesError } = await supabase
        .from('linking_codes')
        .select('*')
        .eq('parent_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5)
      
      console.log('Recent linking codes:', codes)
      console.log('Codes error:', codesError)
      
      // Check if tables exist by trying to count rows
      const { count: linksCount, error: linksCountError } = await supabase
        .from('parent_child_links')
        .select('*', { count: 'exact', head: true })
      
      const { count: profilesCount, error: profilesCountError } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
      
      console.log('Table counts - Links:', linksCount, 'Profiles:', profilesCount)
      console.log('Count errors - Links:', linksCountError, 'Profiles:', profilesCountError)
      
      setDebugInfo({
        user,
        links,
        linksError,
        profiles,
        profilesError,
        codes,
        codesError,
        tableCounts: {
          linksCount,
          linksCountError,
          profilesCount,
          profilesCountError
        }
      })
      
      console.log('=== DEBUG CHECKS COMPLETE ===')
    } catch (error: any) {
      console.error('Debug check error:', error)
      setDebugInfo({ error: error?.message || 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  const createTestChild = async () => {
    setLoading(true)
    try {
      console.log('Creating test child device...')
      
      // Create a test child profile (let Supabase generate the ID)
      const { data: childProfile, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          email: `test-child-${Date.now()}@example.com`,
          role: 'child',
          full_name: 'Test Child Device'
        })
        .select()
        .single()
      
      if (profileError) {
        console.error('Error creating child profile:', profileError)
        alert('Error creating child profile: ' + profileError.message)
        return
      }
      
      console.log('Created child profile:', childProfile)
      
      // Create parent-child link
      const { data: link, error: linkError } = await supabase
        .from('parent_child_links')
        .insert({
          parent_id: user.id,
          child_id: childProfile.id,
          linking_code: 'TEST123',
          is_active: true
        })
        .select()
        .single()
      
      if (linkError) {
        console.error('Error creating parent-child link:', linkError)
        alert('Error creating parent-child link: ' + linkError.message)
        return
      }
      
      console.log('Created parent-child link:', link)
      
      alert('Test child device created successfully! Refresh the page to see it.')
      
    } catch (error: any) {
      console.error('Error creating test child:', error)
      alert('Error creating test child: ' + (error?.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-6 bg-gray-100 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">🔧 Debug Panel</h3>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={runDebugChecks}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Running Debug Checks...' : 'Run Debug Checks'}
        </button>
        <button
          onClick={createTestChild}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Test Child'}
        </button>
        <button
          onClick={() => window.location.reload()}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          Refresh Page
        </button>
      </div>
      
      {debugInfo && (
        <div className="mt-4 p-4 bg-white rounded-lg">
          <h4 className="font-semibold mb-2">Debug Results:</h4>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-96">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Instructions:</strong></p>
        <ol className="list-decimal list-inside space-y-1 mt-2">
          <li>Click "Run Debug Checks" to check database</li>
          <li>Click "Create Test Child" to create a test device</li>
          <li>Check browser console for detailed logs</li>
          <li>Look for any error messages</li>
          <li>Verify that parent_child_links has entries</li>
        </ol>
      </div>
    </div>
  )
}