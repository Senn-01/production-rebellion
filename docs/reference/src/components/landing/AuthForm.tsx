import { useState } from 'react';
import { Eye, EyeOff, Zap } from 'lucide-react';
import { supabase } from '../../utils/supabase/client';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface AuthFormProps {
  onAuthSuccess: () => void;
}

export function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        // Use server for signup
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-f328b38c/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ email, password, name })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Signup failed');
        }

        // Auto-sign in after successful signup
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
      onAuthSuccess();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border-8 border-black shadow-[16px_16px_0px_#000000] p-8 transform -rotate-2">
      <div className="bg-black text-[#FDE047] border-4 border-black px-6 py-4 mb-8 text-center transform rotate-2">
        <h3 className="text-3xl font-black uppercase tracking-wider">
          {isSignUp ? 'JOIN THE REBELLION' : 'ENTER THE REALM'}
        </h3>
      </div>
      
      {error && (
        <div className="bg-red-500 border-8 border-black p-4 mb-6 shadow-[8px_8px_0px_#000000] transform rotate-1">
          <p className="text-lg font-black text-white uppercase tracking-wide">{error}</p>
        </div>
      )}

      <form onSubmit={handleAuth} className="space-y-6">
        {isSignUp && (
          <div>
            <label className="block text-lg font-black uppercase tracking-wide mb-3 transform -skew-x-1">NAME</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required={isSignUp}
              className="w-full border-8 border-black px-4 py-3 font-mono text-lg focus:outline-none focus:border-[#FDE047] focus:shadow-[8px_8px_0px_#FDE047] transition-all duration-100 transform focus:rotate-1"
              placeholder="YOUR NAME"
            />
          </div>
        )}
        
        <div>
          <label className="block text-lg font-black uppercase tracking-wide mb-3 transform skew-x-1">EMAIL</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border-8 border-black px-4 py-3 font-mono text-lg focus:outline-none focus:border-[#FDE047] focus:shadow-[8px_8px_0px_#FDE047] transition-all duration-100 transform focus:-rotate-1"
            placeholder="YOUR@EMAIL.COM"
          />
        </div>
        
        <div>
          <label className="block text-lg font-black uppercase tracking-wide mb-3 transform -skew-x-1">PASSWORD</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border-8 border-black px-4 py-3 font-mono text-lg focus:outline-none focus:border-[#FDE047] focus:shadow-[8px_8px_0px_#FDE047] transition-all duration-100 transform focus:rotate-1 pr-16"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 border-2 border-black hover:bg-white hover:text-black transition-all duration-100"
            >
              {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#FDE047] border-8 border-black font-black uppercase tracking-wider py-4 text-xl hover:bg-black hover:text-[#FDE047] transition-all duration-200 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_#000000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-[4px_4px_0px_#000000] shadow-[8px_8px_0px_#000000] disabled:opacity-50 transform hover:rotate-1"
        >
          {loading ? 'PROCESSING...' : (isSignUp ? 'JOIN REBELLION' : 'ENTER NOW')}
        </button>
      </form>
      
      <div className="mt-8 text-center">
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-lg font-black uppercase tracking-wide bg-black text-white border-4 border-black px-6 py-2 hover:bg-white hover:text-black transition-all duration-100 transform hover:-rotate-1"
        >
          {isSignUp ? 'Already rebel? Enter' : 'New rebel? Join'}
        </button>
      </div>
      
      <div className="mt-8 pt-6 border-t-4 border-black">
        <div className="bg-black text-[#FDE047] p-4 border-4 border-black shadow-[4px_4px_0px_#000000] transform rotate-1">
          <div className="flex items-center gap-3 text-base font-black uppercase tracking-wide">
            <Zap className="w-6 h-6" />
            <span>STRAIGHT TO TACTICAL MAP</span>
          </div>
        </div>
      </div>
    </div>
  );
}