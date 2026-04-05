import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { authAPI } from '../../services/api'
import { GraduationCap, Mail, CheckCircle, ArrowRight, RefreshCw, Shield } from 'lucide-react'

const ROLES = ['STUDENT', 'RECRUITER', 'COORDINATOR']
const DEPTS = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIDS', 'AIML']
const ROLE_REDIRECTS = { STUDENT: '/student', RECRUITER: '/recruiter', COORDINATOR: '/coordinator' }

// ── Step indicator ───────────────────────────────────────────────────────
function StepBadge({ step, current, label }) {
  const done   = current > step
  const active = current === step
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all
        ${done   ? 'bg-green-500 text-white'
        : active ? 'bg-primary-600 text-white ring-4 ring-primary-100'
        :          'bg-gray-100 text-gray-400'}`}>
        {done ? <CheckCircle size={18} /> : step}
      </div>
      <span className={`text-xs font-medium ${active ? 'text-primary-700' : done ? 'text-green-600' : 'text-gray-400'}`}>
        {label}
      </span>
    </div>
  )
}

function StepLine({ done }) {
  return <div className={`flex-1 h-0.5 mt-4 transition-all ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
}

export default function Register() {
  // 3 steps: 1=Enter email, 2=Enter OTP, 3=Fill details
  const [step, setStep]     = useState(1)
  const [email, setEmail]   = useState('')
  const [otp, setOtp]       = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  const [form, setForm] = useState({
    firstName: '', lastName: '', password: '', confirmPassword: '',
    role: 'STUDENT', rollNumber: '', department: 'CSE', batch: '',
    companyName: '', designation: '',
  })

  const { register } = useAuth()
  const navigate = useNavigate()

  // Resend countdown timer
  useEffect(() => {
    if (resendTimer <= 0) return
    const t = setTimeout(() => setResendTimer(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [resendTimer])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // ── Step 1: Send OTP ─────────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    setEmail(normalizedEmail)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      toast.error('Please enter a valid email address');
      return
    }

    setLoading(true)
    try {
      await authAPI.sendOtp(normalizedEmail)
      toast.success('OTP sent! Check your email inbox.')
      setStep(2)
      setResendTimer(60)
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to send OTP'
      toast.error(msg)
      if (!err.response) {
        toast.error('Unable to reach backend. Is the server running on http://localhost:8080?')
      }
    } finally { setLoading(false) }
  }

  // ── Step 2: Verify OTP ───────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return
    const next = [...otp]; next[index] = value; setOtp(next)
    // Auto-focus next box
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      document.getElementById('otp-5')?.focus()
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    const otpStr = otp.join('')
    if (otpStr.length < 6) { toast.error('Please enter all 6 digits'); return }
    setLoading(true)
    try {
      await authAPI.verifyOtp(email, otpStr)
      toast.success('Email verified! Complete your registration.')
      setStep(3)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP')
      // Reset on too-many-attempts
      if (err.response?.data?.message?.includes('Too many')) {
        setOtp(['','','','','',''])
      }
    } finally { setLoading(false) }
  }

  const handleResendOtp = async () => {
    if (resendTimer > 0) return
    const normalizedEmail = email.trim().toLowerCase()
    setEmail(normalizedEmail)

    setLoading(true)
    try {
      await authAPI.sendOtp(normalizedEmail)
      toast.success('New OTP sent!')
      setOtp(['','','','','',''])
      setResendTimer(60)
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to resend'
      toast.error(msg)
      if (!err.response) {
        toast.error('Unable to reach backend. Is the server running on http://localhost:8080?')
      }
    } finally { setLoading(false) }
  }

  // ── Step 3: Complete Registration ────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match'); return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters'); return
    }
    setLoading(true)
    try {
      const user = await register({ ...form, email })
      toast.success('Registration successful!')
      toast(`📧 Welcome email sent to ${email}`, { icon: '🎉', duration: 4000 })
      navigate(ROLE_REDIRECTS[user.role] || '/student')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg">
            <GraduationCap size={24} className="text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-gray-900 text-lg leading-tight">CAHCET Placement Portal</p>
            <p className="text-xs text-gray-500">C. Abdul Hakeem College of Engineering and Technology</p>
          </div>
        </div>

        {/* Step progress */}
        <div className="flex items-start gap-0 mb-6 px-2">
          <StepBadge step={1} current={step} label="Email" />
          <StepLine done={step > 1} />
          <StepBadge step={2} current={step} label="Verify OTP" />
          <StepLine done={step > 2} />
          <StepBadge step={3} current={step} label="Register" />
        </div>

        <div className="card shadow-xl border-0 fade-in">

          {/* ── STEP 1: Email entry ─────────────────────────────────── */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-bold text-gray-900 mb-1">Enter Your Email</h2>
                <p className="text-sm text-gray-500">We will send a 6-digit OTP to verify your email address before registration.</p>
              </div>

              <div>
                <label className="label">Email Address *</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email" className="input pl-9"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required autoFocus
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">Use a valid email — you will receive an OTP here.</p>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending OTP…</>
                  : <><Mail size={16} /> Send OTP to Email <ArrowRight size={16} /></>}
              </button>

              <p className="text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
              </p>
            </form>
          )}

          {/* ── STEP 2: OTP entry ───────────────────────────────────── */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-bold text-gray-900 mb-1">Enter OTP</h2>
                <p className="text-sm text-gray-500">
                  A 6-digit code was sent to <span className="font-semibold text-gray-800">{email}</span>
                </p>
              </div>

              {/* OTP boxes */}
              <div>
                <label className="label">6-Digit OTP</label>
                <div className="flex gap-2.5 justify-center my-2" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text" inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all
                        focus:outline-none focus:ring-0
                        ${digit
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 bg-gray-50 text-gray-900 focus:border-primary-400'}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-center text-gray-400 mt-2">
                  OTP expires in <span className="font-semibold text-orange-500">10 minutes</span>
                </p>
              </div>

              {/* Security notice */}
              <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <Shield size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  Never share this OTP. Max 5 attempts allowed. CAHCET will never ask for your OTP.
                </p>
              </div>

              <button type="submit" disabled={loading || otp.join('').length < 6} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Verifying…</>
                  : <><CheckCircle size={16} /> Verify OTP <ArrowRight size={16} /></>}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button type="button" onClick={() => setStep(1)} className="text-gray-500 hover:text-gray-700 flex items-center gap-1">
                  ← Change email
                </button>
                <button type="button" onClick={handleResendOtp} disabled={resendTimer > 0 || loading}
                  className="flex items-center gap-1 text-primary-600 hover:text-primary-800 disabled:text-gray-400 disabled:cursor-not-allowed font-medium">
                  <RefreshCw size={14} />
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 3: Registration form ──────────────────────────── */}
          {step === 3 && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle size={18} className="text-green-500" />
                  <h2 className="font-display text-xl font-bold text-gray-900">Complete Registration</h2>
                </div>
                <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                  ✓ Email <span className="font-semibold">{email}</span> verified successfully
                </p>
              </div>

              {/* Role selector */}
              <div>
                <label className="label">Register As *</label>
                <div className="flex gap-2">
                  {ROLES.map(r => (
                    <button key={r} type="button" onClick={() => set('role', r)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold border-2 transition-all
                        ${form.role === r ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">First Name *</label>
                  <input className="input" placeholder="First name" value={form.firstName}
                    onChange={e => set('firstName', e.target.value)} required />
                </div>
                <div>
                  <label className="label">Last Name *</label>
                  <input className="input" placeholder="Last name" value={form.lastName}
                    onChange={e => set('lastName', e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Password *</label>
                  <input type="password" className="input" placeholder="Min. 6 characters"
                    value={form.password} onChange={e => set('password', e.target.value)} minLength={6} required />
                </div>
                <div>
                  <label className="label">Confirm Password *</label>
                  <input type="password" className="input" placeholder="Re-enter password"
                    value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} required />
                </div>
              </div>

              {/* Student fields */}
              {form.role === 'STUDENT' && (
                <div className="grid grid-cols-3 gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div>
                    <label className="label">Roll Number *</label>
                    <input className="input" placeholder="21CSE001" value={form.rollNumber}
                      onChange={e => set('rollNumber', e.target.value)} required />
                  </div>
                  <div>
                    <label className="label">Department *</label>
                    <select className="input" value={form.department} onChange={e => set('department', e.target.value)}>
                      {DEPTS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Batch</label>
                    <input className="input" placeholder="2021-2025" value={form.batch}
                      onChange={e => set('batch', e.target.value)} />
                  </div>
                </div>
              )}

              {/* Recruiter fields */}
              {form.role === 'RECRUITER' && (
                <div className="grid grid-cols-2 gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <div>
                    <label className="label">Company Name *</label>
                    <input className="input" placeholder="Tech Corp Pvt Ltd" value={form.companyName}
                      onChange={e => set('companyName', e.target.value)} required />
                  </div>
                  <div>
                    <label className="label">Designation</label>
                    <input className="input" placeholder="HR Manager" value={form.designation}
                      onChange={e => set('designation', e.target.value)} />
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating Account…</>
                  : <><CheckCircle size={16} /> Create Account</>}
              </button>

              <p className="text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
              </p>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}
