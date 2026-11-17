import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react'
import { api } from '../services/api'
import AuthShell from '../components/AuthShell'

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) return setError('Please enter your email address.')
    if (!emailRe.test(email.trim())) return setError('Please enter a valid email address.')

    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email: email.trim() })
      setSent(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title={sent ? 'Check your inbox' : 'Forgot password'}
      subtitle={
        sent ? (
          <>We&apos;ve sent password reset instructions if that email is registered.</>
        ) : (
          <>
            Remembered it?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
              Back to sign in
            </Link>
          </>
        )
      }
    >
      {sent ? (
        <div className="text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-found">
            <CheckCircle2 className="h-9 w-9" />
          </span>
          <p className="mt-5 text-sm leading-relaxed text-gray-600">
            If an account exists for <span className="font-semibold text-ink-900">{email}</span>,
            you&apos;ll receive an email with a link to reset your password. The link expires after a
            short time.
          </p>
          <div className="mt-6 space-y-3">
            <Link to="/login" className="btn-primary w-full">
              Back to sign in
            </Link>
            <button
              type="button"
              onClick={() => {
                setSent(false)
                setEmail('')
              }}
              className="btn-ghost w-full"
            >
              Use a different email
            </button>
          </div>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-lost"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <div>
            <label htmlFor="email" className="input-label">
              Email address
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                className="input-field pl-10"
                placeholder="you@campus.edu"
              />
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              'Send reset link'
            )}
          </button>
          <Link
            to="/login"
            className="flex items-center justify-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="h-4 w-4" /> Back to sign in
          </Link>
        </form>
      )}
    </AuthShell>
  )
}