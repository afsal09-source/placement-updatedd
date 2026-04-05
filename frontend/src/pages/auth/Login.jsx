import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { GraduationCap, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const ROLE_REDIRECTS = {
    ADMIN: '/admin', STUDENT: '/student',
    RECRUITER: '/recruiter', COORDINATOR: '/coordinator',
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.firstName}!`)
      navigate(ROLE_REDIRECTS[user.role] || '/student')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex-col items-center justify-center p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <GraduationCap size={40} />
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">CAHCET</h1>
          <p className="text-blue-200 text-lg mb-1">C. Abdul Hakeem College</p>
          <p className="text-blue-300 text-sm mb-8">of Engineering and Technology</p>
          <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/10 text-left">
            <h2 className="font-display font-bold text-xl mb-3">Smart Placement Analytics</h2>
            <ul className="space-y-2 text-blue-100 text-sm">
              {['AI-powered placement prediction','Real-time analytics dashboard','Skill gap analysis','Company rating system','Automated notifications'].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-300 flex-shrink-0" />{f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <GraduationCap size={22} className="text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-gray-900">CAHCET Placement Portal</p>
              <p className="text-xs text-gray-500">Smart Placement Analytics System</p>
            </div>
          </div>

          <div className="card shadow-xl border-0">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-1">Sign In</h2>
            <p className="text-sm text-gray-500 mb-6">Enter your credentials to access the portal</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email" className="input pl-9"
                    placeholder="you@cahcet.edu.in"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPwd ? 'text' : 'password'} className="input pl-9 pr-10"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    required
                  />
                  <button type="button" onClick={() => setShowPwd(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in…
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-5">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 font-semibold hover:underline">Register here</Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-700">
            <p className="font-semibold mb-1">Demo Credentials:</p>
            <p>Admin: admin@cahcet.ac.in / admin123</p>
            <p>Student: student@cahcet.ac.in / student123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
