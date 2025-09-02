'use client';

import React from 'react';
import { User, Settings, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

export default function PrimePage() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="font-bold uppercase">Loading your operating system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 pb-32"> {/* Extra bottom padding for navigation grid */}
      {/* Coming Soon Hero */}
      <div className="text-center mb-12">
        <div className="text-8xl mb-6">🎯</div>
        <h1 className="font-black uppercase tracking-wider text-4xl mb-4 text-[var(--theme-text)]">
          Prime
        </h1>
        <p className="font-bold uppercase text-lg opacity-75 max-w-2xl mx-auto">
          Your personal operating system for values definition and daily reflection
        </p>
      </div>

      {/* Feature Preview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-[var(--theme-background)] border-4 border-black">
          <CardContent className="p-8 text-center">
            <User className="w-12 h-12 mx-auto mb-4 text-[var(--theme-primary)]" />
            <h3 className="font-black uppercase tracking-wider text-lg mb-2">
              Values Definition
            </h3>
            <p className="font-bold text-sm opacity-75">
              Define your north star principles that guide strategic decisions
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--theme-background)] border-4 border-black">
          <CardContent className="p-8 text-center">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-[var(--theme-primary)]" />
            <h3 className="font-black uppercase tracking-wider text-lg mb-2">
              Daily Reflection
            </h3>
            <p className="font-bold text-sm opacity-75">
              End-of-day stand-up style reflection with AI voice agent
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--theme-background)] border-4 border-black">
          <CardContent className="p-8 text-center">
            <Settings className="w-12 h-12 mx-auto mb-4 text-[var(--theme-primary)]" />
            <h3 className="font-black uppercase tracking-wider text-lg mb-2">
              System Prompt
            </h3>
            <p className="font-bold text-sm opacity-75">
              Your personal operating system configuration and preferences
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Future Feature Teasers */}
      <Card className="mb-8 border-4 border-black">
        <CardContent className="p-8">
          <h2 className="font-black uppercase tracking-wider text-xl mb-6 text-center">
            Coming in Prime v1.0
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold uppercase text-sm mb-3 text-[var(--theme-primary)]">
                Daily Workflow Integration
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-[var(--theme-primary)]">•</span>
                  <span>Morning intention setting</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--theme-primary)]">•</span>
                  <span>End-of-day reflection prompts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--theme-primary)]">•</span>
                  <span>Weekly review automation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--theme-primary)]">•</span>
                  <span>Values alignment scoring</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold uppercase text-sm mb-3 text-[var(--theme-primary)]">
                AI-Powered Features
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-[var(--theme-primary)]">•</span>
                  <span>Voice-enabled daily check-ins</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--theme-primary)]">•</span>
                  <span>Pattern recognition in reflections</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--theme-primary)]">•</span>
                  <span>Personalized insight generation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--theme-primary)]">•</span>
                  <span>Values-based project recommendations</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Beta Notice */}
      <Card className="bg-[var(--theme-accent)] border-8">
        <CardContent>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔮</span>
            <div>
              <h3 className="font-black uppercase tracking-wider mb-2">
                Prime Scaffolding Active
              </h3>
              <p className="font-bold text-sm">
                You&apos;re seeing the scaffolded Prime page with blue theme. This represents the future &quot;personal operating system&quot; 
                layer that will integrate AI-powered reflection, values definition, and daily workflow optimization. 
                Prime will be built on top of the solid foundation of TacticalMap, DeepFocus, and Analytics.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}