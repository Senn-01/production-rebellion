/**
 * Vitest setup file for Production Rebellion
 * 
 * Global test configuration and environment setup
 */

import { beforeAll, afterAll } from 'vitest'

// Environment variable validation for tests
beforeAll(() => {
  // Ensure required environment variables are present
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ]

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`)
    }
  }
})

// Global cleanup
afterAll(() => {
  // Any global cleanup needed after tests
})