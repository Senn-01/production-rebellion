'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await signIn(email, password)
      
      if (error) {
        setError(error.message)
      } else {
        router.push('/tactical-map')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Value Proposition */}
      <div className="hidden lg:flex lg:w-1/2 bg-black text-white p-12 flex-col justify-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Production<br />Rebellion
          </h1>
          <p className="text-xl mb-8 leading-relaxed">
            Strategic workspace for mindful professionals
          </p>
          
          <div className="space-y-6">
            <div className="border-l-4 border-white pl-4">
              <h3 className="text-lg font-semibold mb-2">STRATEGIC MAP</h3>
              <p className="text-gray-300">
                Visualize project priorities spatially. See everything at once, understand trade-offs.
              </p>
            </div>
            
            <div className="border-l-4 border-white pl-4">
              <h3 className="text-lg font-semibold mb-2">DEEP FOCUS</h3>
              <p className="text-gray-300">
                Mindful work sessions with post-session awareness. Understand your patterns.
              </p>
            </div>
            
            <div className="border-l-4 border-white pl-4">
              <h3 className="text-lg font-semibold mb-2">META-LAYER</h3>
              <p className="text-gray-300">
                Above task management - understand the bigger picture and focus patterns.
              </p>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-700">
            <p className="text-sm text-gray-400">
              Beta access • Free during development • Professional productivity gains
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Welcome back
            </h2>
            <p className="mt-2 text-gray-600">
              Sign in to your Production Rebellion account
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="text-red-700 text-sm">{error}</div>
              </div>
            )}

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
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-none shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 px-4 border-2 border-black font-medium hover:bg-white hover:text-black transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'SIGN IN →'}
            </button>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="font-medium text-black hover:underline"
              >
                Create one here
              </Link>
            </p>
          </div>

          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Currently in beta • Free access • Data may be reset post-beta
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}