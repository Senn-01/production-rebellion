'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function TacticalMapPage() {
  const { user, profile, signOut, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p>Loading your strategic workspace...</p>
        </div>
      </div>
    )
  }

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen p-8">
      <header className="mb-8 pb-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Production Rebellion</h1>
            <p className="text-gray-600 mt-1">Strategic workspace for mindful professionals</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium">{profile?.display_name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
              {profile?.is_beta_user && (
                <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full mt-1">
                  Beta User
                </span>
              )}
            </div>
            <button
              onClick={handleSignOut}
              className="bg-black text-white px-4 py-2 border-2 border-black hover:bg-white hover:text-black transition-colors duration-200"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="bg-white border-2 border-black p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">🎉 Welcome to Production Rebellion!</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              You&apos;ve successfully created your account and are now part of the beta testing program. 
              This is your strategic workspace where you&apos;ll be able to:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">📍</div>
                  <div>
                    <h3 className="font-semibold">TacticalMap (Coming Soon)</h3>
                    <p className="text-sm text-gray-600">
                      Visualize your projects on a cost/benefit matrix. Make strategic decisions through spatial clarity.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">⚡</div>
                  <div>
                    <h3 className="font-semibold">DeepFocus (Coming Soon)</h3>
                    <p className="text-sm text-gray-600">
                      Mindful work sessions with willpower tracking and gamified difficulty levels.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">📊</div>
                  <div>
                    <h3 className="font-semibold">Analytics (Coming Soon)</h3>
                    <p className="text-sm text-gray-600">
                      Data-driven insights with heatmaps, streaks, and achievement tracking.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">🎯</div>
                  <div>
                    <h3 className="font-semibold">Prime (Future)</h3>
                    <p className="text-sm text-gray-600">
                      Personal operating system with values definition and daily reflection.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6">
          <h3 className="font-semibold text-yellow-800 mb-2">Beta Testing Notice</h3>
          <p className="text-yellow-700 text-sm">
            You&apos;re among the first users of Production Rebellion! The core features are being built based on the 
            implementation plan. Your data may be reset after the beta period, and we&apos;ll notify you before any changes.
            Thank you for helping us build better productivity tools for knowledge workers.
          </p>
        </div>
      </main>
    </div>
  )
}