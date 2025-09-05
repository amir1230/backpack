/**
 * Centralized environment configuration
 * Supports Node.js, Next.js, and Vite environments
 */

// Hardcoded values since Vite environment variables aren't loading properly
const SUPABASE_URL = 'https://wuzhvkmfdyiwaaladyxc.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1emh2a21mZHlpd2FhbGFkeXhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NTE0MDksImV4cCI6MjA3MTMyNzQwOX0.xxZ1C9pFMvJ5qbEafSbnadr_o2UVl_Naxuj2l30vwww'

export function getSupabaseUrl(): string {
  // Try environment variables first
  if (typeof window !== 'undefined') {
    // Browser environment - use Vite env vars
    const viteUrl = import.meta.env.VITE_SUPABASE_URL as string
    if (viteUrl) return viteUrl.replace(/[^\x20-\x7E]/g, '').trim()
  } else {
    // Node.js environment - use process env vars  
    const nodeUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    if (nodeUrl) return nodeUrl.replace(/[^\x20-\x7E]/g, '').trim()
  }

  // Fallback to hardcoded value
  return SUPABASE_URL
}

export function getSupabaseAnonKey(): string {
  // Try environment variables first
  if (typeof window !== 'undefined') {
    // Browser environment - use Vite env vars
    const viteKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string
    if (viteKey) return viteKey.replace(/[^\x20-\x7E]/g, '').trim()
  } else {
    // Node.js environment - use process env vars
    const nodeKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (nodeKey) return nodeKey.replace(/[^\x20-\x7E]/g, '').trim()
  }

  // Fallback to hardcoded value
  return SUPABASE_ANON_KEY
}