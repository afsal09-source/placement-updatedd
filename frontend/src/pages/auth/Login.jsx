import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { GraduationCap, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck, TrendingUp, Users } from 'lucide-react'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const ROLE_REDIRECTS = {
    ADMIN: '/admin', STUDENT: '/student',
    RECRUITER: '/recruiter', COORDINATOR: '/coordinator',
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

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

  const features = [
    { icon: TrendingUp, title: 'AI-Powered Prediction', desc: 'Get smart placement probability scores' },
    { icon: ShieldCheck, title: 'Secure Platform', desc: 'End-to-end encrypted data protection' },
    { icon: Users, title: 'Direct Connections', desc: 'Link directly with top industry recruiters' }
  ]

  return (
    <div className="min-h-screen flex bg-[#f8fafc] overflow-hidden selection:bg-blue-200 selection:text-blue-900">
      {/* Left panel - Premium Animated Background */}
      <div className="hidden lg:flex w-1/2 relative bg-indigo-950 flex-col justify-between p-12 overflow-hidden text-white">
        {/* Dynamic mesh gradient background based on mouse */}
        <div 
          className="absolute inset-0 opacity-40 transition-transform duration-1000 ease-out z-0"
          style={{
            background: 'radial-gradient(circle 800px at 50% 50%, rgba(59, 130, 246, 0.4), transparent 80%)',
            transform: `translate(${(mousePosition.x - window.innerWidth / 2) * -0.02}px, ${(mousePosition.y - window.innerHeight / 2) * -0.02}px)`
          }}
        />
        <div 
          className="absolute inset-0 opacity-30 transition-transform duration-1000 ease-out z-0"
          style={{
            background: 'radial-gradient(circle 600px at 80% 20%, rgba(139, 92, 246, 0.4), transparent 80%)',
            transform: `translate(${(mousePosition.x - window.innerWidth / 2) * 0.03}px, ${(mousePosition.y - window.innerHeight / 2) * 0.03}px)`
          }}
        />
        
        {/* Animated pattern mask */}
        <div className="absolute inset-0 z-0 opacity-10 mix-blend-overlay"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        {/* Header */}
        <div className="relative z-10 flex items-center gap-3 fade-in">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-xl">
            <GraduationCap className="text-blue-300" size={26} />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight">CAHCET</h2>
            <p className="text-white/60 text-xs font-medium uppercase tracking-widest">Placement Portal</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 mt-12 mb-auto fade-in flex-1 flex flex-col justify-center" style={{ animationDelay: '0.1s' }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6 w-fit">
            <Sparkles size={14} className="text-blue-300" />
            <span className="text-xs font-medium text-blue-100">Smart Analytics System v2.0</span>
          </div>
          <h1 className="font-display text-5xl xl:text-6xl font-bold leading-tight mb-6 tracking-tight">
            Elevate your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300">
              career journey
            </span>
          </h1>
          <p className="text-lg text-white/70 max-w-md leading-relaxed">
            Experience the next generation of campus placements with AI-driven insights, skill gap analysis, and seamless recruiter connections.
          </p>
        </div>

        {/* Feature Cards Glassmorphism */}
        <div className="relative z-10 grid gap-4 fade-in" style={{ animationDelay: '0.2s' }}>
          {features.map((f, i) => (
            <div key={i} className="group flex items-start gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] hover:border-white/10 transition-all duration-300 backdrop-blur-md cursor-default">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300">
                <f.icon size={18} className="text-blue-300" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/90 mb-1">{f.title}</h3>
                <p className="text-xs text-white/50">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        {/* Subtely animated background blob for right side */}
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-100/50 rounded-full blur-3xl opacity-50 animate-pulse pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-72 h-72 bg-purple-100/50 rounded-full blur-3xl opacity-50 animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />

        <div className="w-full max-w-md relative z-10">
          {/* Mobile Header */}
          <div className="lg:hidden flex flex-col items-center text-center mb-10 fade-in">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg mb-4">
              <GraduationCap size={32} className="text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold text-gray-900">CAHCET Portal</h1>
            <p className="text-sm text-gray-500 mt-1">Smart Placement Analytics System</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white p-8 sm:p-10 fade-in transition-all duration-300 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
            <div className="mb-8">
              <h2 className="font-display text-3xl font-bold text-gray-900 tracking-tight mb-2">Welcome back</h2>
              <p className="text-sm text-gray-500">Please enter your details to sign in.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <Mail size={18} strokeWidth={2} />
                  </div>
                  <input
                    type="email" 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 outline-none placeholder-gray-400"
                    placeholder="you@cahcet.edu.in"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Password</label>
                  <button 
                    type="button" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (!form.email) {
                        toast.error('Please enter your email address first to reset password');
                        return;
                      }
                      toast.success(`Password reset instructions sent to ${form.email}`);
                    }}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline transition-all focus:outline-none"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <Lock size={18} strokeWidth={2} />
                  </div>
                  <input
                    type={showPwd ? 'text' : 'password'} 
                    className="w-full pl-10 pr-12 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 outline-none placeholder-gray-400"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    required
                  />
                  <button type="button" onClick={() => setShowPwd(s => !s)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none transition-colors">
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full relative overflow-hidden bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed group mt-2 shadow-lg shadow-gray-900/20 hover:shadow-gray-900/30"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </form>

            <div className="mt-8 text-center pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all">
                  Create an account
                </Link>
              </p>
            </div>
          </div>

          {/* Demo credentials */}
          <div className="mt-6 p-5 bg-white/60 backdrop-blur-md rounded-2xl border border-gray-200/50 text-xs text-gray-500 shadow-sm fade-in hover:bg-white/80 transition-colors" style={{ animationDelay: '0.2s' }}>
            <p className="font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
              <Sparkles size={16} className="text-amber-500"/> 
              Demo Credentials
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors cursor-pointer group" onClick={() => setForm({email: 'admin@cahcet.ac.in', password: 'admin'})}>
                <span className="block font-semibold text-gray-800 mb-1 flex items-center justify-between">
                  Admin <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity"/>
                </span>
                <span className="text-[11px] text-gray-500 font-medium">admin@cahcet.ac.in<br/><span className="text-gray-400">admin123  (try 'admin' for demo test)</span></span>
              </div>
              <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors cursor-pointer group" onClick={() => setForm({email: 'student@cahcet.ac.in', password: 'student123'})}>
                <span className="block font-semibold text-gray-800 mb-1 flex items-center justify-between">
                  Student <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity"/>
                </span>
                <span className="text-[11px] text-gray-500 font-medium">student@cahcet.ac.in<br/><span className="text-gray-400">student123</span></span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

