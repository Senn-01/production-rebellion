'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const { signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      const { error } = await signUp(email, password, displayName)
      
      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        // For email confirmation flow, show success message
        // For auto-confirm (development), redirect happens via auth state change
        setTimeout(() => {
          router.push('/tactical-map')
        }, 2000)
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="bg-green-50 border-l-4 border-green-400 p-6 mb-6">
            <div className="text-green-700">
              <h3 className="text-lg font-semibold mb-2">Welcome to Production Rebellion! 🎉</h3>
              <p className="text-sm">
                Your account has been created successfully. You&apos;re being redirected to your strategic workspace...
              </p>
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            This is your first step toward mindful productivity.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Value Proposition */}
      <div className="hidden lg:flex lg:w-1/2 bg-black text-white p-12 flex-col justify-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Join the<br />Rebellion
          </h1>
          <p className="text-xl mb-8 leading-relaxed">
            Beta access to the strategic workspace for mindful professionals
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">📍</div>
              <div>
                <h3 className="font-semibold mb-1">Cost/Benefit Matrix</h3>
                <p className="text-gray-300 text-sm">
                  Visualize all your projects spatially. Make strategic decisions through visual clarity.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="text-2xl">⚡</div>
              <div>
                <h3 className="font-semibold mb-1">XP System</h3>
                <p className="text-gray-300 text-sm">
                  Earn points for sessions, project completions, and achievements. Track meaningful progress.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="text-2xl">🎯</div>
              <div>
                <h3 className="font-semibold mb-1">Deep Focus Sessions</h3>
                <p className="text-gray-300 text-sm">
                  Mindful work tracking with willpower awareness. Understand your focus patterns.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="text-2xl">📊</div>
              <div>
                <h3 className="font-semibold mb-1">Analytics Dashboard</h3>
                <p className="text-gray-300 text-sm">
                  Strava-like feedback loops. See your progress, achievements, and performance trends.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-700">
            <p className="text-sm text-gray-400">
              Free during beta • Professional focus tools • No gaming fluff
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Create account
            </h2>
            <p className="mt-2 text-gray-600">
              Join beta testers building their strategic workspace
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="text-red-700 text-sm">{error}</div>
              </div>
            )}

            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                Display name
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-none shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                placeholder="How should we address you?"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-none shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-none shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                placeholder="Create a password (min 6 characters)"
              />
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="text-yellow-700 text-sm">
                <p className="font-medium mb-1">Beta Notice</p>
                <p>
                  Your data may be reset after the beta period. We&apos;ll notify you before any resets.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 px-4 border-2 border-black font-medium hover:bg-white hover:text-black transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'JOIN BETA →'}
            </button>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-black hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>

          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              By signing up, you agree to help us build better productivity tools for knowledge workers.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}