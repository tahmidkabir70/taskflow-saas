import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, ArrowRight, ShieldCheck, Zap, Lock, Mail, ArrowLeft } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

export const AuthPage: React.FC = () => {
  const { signIn, signUp, resetPassword, updatePassword, enableDemoMode, isRecovery } = useAuth();
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>(isRecovery ? 'forgot' : 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isRecovery) {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        const { error } = await updatePassword(password);
        if (error) throw error;
        setMessage('Password updated successfully! You are now signed in.');
        return;
      }

      if (authMode === 'signup') {
        const { error } = await signUp(email, password, name);
        if (error) throw error;
        setMessage('Registration successful! Please check your email to confirm or sign in directly.');
      } else if (authMode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) throw error;
      } else if (authMode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) throw error;
        setMessage('Password reset instructions sent to your email address.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      {/* Left Column: Brand & Hero Showcase */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 border-r border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-xl shadow-md">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">TaskFlow</span>
        </div>

        <div className="max-w-md space-y-6">
          <h1 className="text-4xl font-bold tracking-tight leading-tight text-white">
            Professional Task & Project Management SaaS
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Execute high-impact workflows, organize projects, track deadlines, and monitor real-time productivity statistics with enterprise-grade Supabase RLS security.
          </p>

          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <div className="p-1 rounded-full bg-blue-500/20 text-blue-400"><Zap className="w-4 h-4" /></div>
              <span>Lightning fast task CRUD & project tracking</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400"><ShieldCheck className="w-4 h-4" /></div>
              <span>Secure PostgreSQL Row Level Security (RLS)</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <div className="p-1 rounded-full bg-purple-500/20 text-purple-400"><Lock className="w-4 h-4" /></div>
              <span>Strict user data privacy & session persistence</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} TaskFlow SaaS. All rights reserved.
        </p>
      </div>

      {/* Right Column: Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-950">
        <div className="w-full max-w-md space-y-8 bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {isRecovery ? 'Set new password' : authMode === 'signup' ? 'Create your account' : authMode === 'forgot' ? 'Reset your password' : 'Welcome back'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isRecovery ? 'Enter your new secure password below' : authMode === 'signup' ? 'Get started with TaskFlow SaaS in seconds' : authMode === 'forgot' ? 'Enter your email to receive recovery instructions' : 'Sign in to access your workspace'}
            </p>
          </div>

          {!isSupabaseConfigured && !isRecovery && (
            <div className="p-4 bg-blue-950/50 border border-blue-900/50 rounded-xl space-y-2">
              <p className="text-xs font-semibold text-blue-300">Supabase keys not detected in environment.</p>
              <p className="text-xs text-blue-400/80">You can instantly test the complete application using our fully interactive Demo Mode.</p>
              <button
                type="button"
                onClick={enableDemoMode}
                className="w-full mt-2 py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <span>Enter Demo Mode</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-950/50 border border-red-900 rounded-lg text-xs text-red-400">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 bg-emerald-950/50 border border-emerald-900 rounded-lg text-xs text-emerald-300">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRecovery ? (
              <>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </>
            ) : (
              <>
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Mercer"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@company.com"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {authMode !== 'forgot' && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                        Password
                      </label>
                      {authMode === 'signin' && (
                        <button
                          type="button"
                          onClick={() => { setAuthMode('forgot'); setError(''); setMessage(''); }}
                          className="text-xs text-blue-400 hover:underline"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>
                {loading ? 'Processing...' : isRecovery ? 'Update Password' : authMode === 'signup' ? 'Create Account' : authMode === 'forgot' ? 'Send Reset Instructions' : 'Sign In'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {isSupabaseConfigured && !isRecovery && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={enableDemoMode}
                className="text-xs text-blue-400 hover:underline"
              >
                Or explore via Demo Mode
              </button>
            </div>
          )}

          {!isRecovery && (
            <div className="text-center pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
              {authMode === 'forgot' ? (
                <button
                  type="button"
                  onClick={() => { setAuthMode('signin'); setError(''); setMessage(''); }}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { setAuthMode(authMode === 'signin' ? 'signup' : 'signin'); setError(''); setMessage(''); }}
                  className="text-slate-400 hover:text-white transition-colors w-full text-center"
                >
                  {authMode === 'signin' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
