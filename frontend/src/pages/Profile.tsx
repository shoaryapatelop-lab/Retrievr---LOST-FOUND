import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  User, Mail, Phone, Building2, Save, AlertCircle, CheckCircle2, LogOut,
  ShieldCheck, Hash, ArrowLeft,
} from 'lucide-react'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

interface UserProfile {
  id: number
  email: string
  firstName: string
  lastName: string
  role: string
  rollNumber?: string
  employeeId?: string
  department?: string
  contact?: string
}

export default function Profile() {
  const { logout, refreshUser, user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/profile')
        setProfile(response.data)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const set = (name: keyof UserProfile, value: string) => {
    setProfile((p) => (p ? { ...p, [name]: value } : p))
    setSuccess(false)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      await api.put('/auth/profile', {
        firstName: profile.firstName,
        lastName: profile.lastName,
        department: profile.department,
        contact: profile.contact,
      })
      await refreshUser()
      setSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="container-narrow py-10">
        <div className="skeleton h-8 w-48" />
        <div className="card mt-6 p-6">
          <div className="skeleton h-16 w-16 rounded-full" />
          <div className="mt-4 space-y-3">
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-5/6" />
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container-narrow flex min-h-[50vh] items-center justify-center py-10">
        <div className="text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-lost">
            <AlertCircle className="h-8 w-8" />
          </span>
          <h2 className="mt-5 font-display text-2xl font-bold text-ink-900">Couldn&apos;t load profile</h2>
          <p className="mt-2 text-gray-600">{error || 'Please try again.'}</p>
          <Link to="/dashboard" className="btn-primary mt-6">
            Back to dashboard
          </Link>
        </div>
      </div>
    )
  }

  const isStudent = profile.role === 'STUDENT'

  return (
    <div className="bg-canvas">
      <div className="container-narrow py-8 sm:py-10">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:text-primary-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4"
        >
          <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">Profile settings</h1>
          <p className="mt-1 text-sm text-gray-600">Manage your account details and preferences.</p>
        </motion.div>

        {error && (
          <div role="alert" className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-lost">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Identity card */}
          <div className="card overflow-hidden">
            <div className="h-20 bg-gradient-to-r from-primary-600 to-primary-500" />
            <div className="px-5 pb-5 sm:px-6">
              <div className="-mt-8 flex items-end justify-between">
                <span className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-primary-100 font-display text-2xl font-bold text-primary-700">
                  {profile.firstName?.charAt(0).toUpperCase()}
                </span>
                <span className={`badge ${profile.role === 'ADMIN' ? 'badge-returned' : 'badge-available'}`}>
                  <ShieldCheck className="h-3.5 w-3.5" /> {profile.role}
                </span>
              </div>
              <div className="mt-3">
                <p className="font-display text-lg font-bold text-ink-900">
                  {profile.firstName} {profile.lastName}
                </p>
                <p className="text-sm text-gray-500">{profile.email}</p>
              </div>
            </div>
          </div>

          {/* Personal info */}
          <div className="card p-5 sm:p-6">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink-900">
              <User className="h-4 w-4 text-primary-600" /> Personal information
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="input-label">
                  First name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => set('firstName', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="input-label">
                  Last name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => set('lastName', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="email" className="input-label">
                  Email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="input-field pl-10"
                  />
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                </div>
                <p className="field-hint">Email address cannot be changed.</p>
              </div>
              {isStudent && (
                <div>
                  <label htmlFor="contact" className="input-label">
                    Contact number
                  </label>
                  <div className="relative">
                    <input
                      id="contact"
                      name="contact"
                      type="tel"
                      value={profile.contact || ''}
                      onChange={(e) => set('contact', e.target.value)}
                      className="input-field pl-10"
                      placeholder="Add a contact number"
                    />
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Role-specific */}
          <div className="card p-5 sm:p-6">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink-900">
              <Building2 className="h-4 w-4 text-primary-600" /> {isStudent ? 'Academic details' : 'Staff details'}
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {isStudent ? (
                <div>
                  <label htmlFor="rollNumber" className="input-label">
                    Roll number
                  </label>
                  <div className="relative">
                    <input
                      id="rollNumber"
                      name="rollNumber"
                      type="text"
                      value={profile.rollNumber || ''}
                      disabled
                      className="input-field pl-10"
                    />
                    <Hash className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  </div>
                  <p className="field-hint">Your roll number is locked by the registrar.</p>
                </div>
              ) : (
                <div>
                  <label htmlFor="employeeId" className="input-label">
                    Employee ID
                  </label>
                  <div className="relative">
                    <input
                      id="employeeId"
                      name="employeeId"
                      type="text"
                      value={profile.employeeId || ''}
                      disabled
                      className="input-field pl-10"
                    />
                    <Hash className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              )}
              <div>
                <label htmlFor="department" className="input-label">
                  Department
                </label>
                <div className="relative">
                  <input
                    id="department"
                    name="department"
                    type="text"
                    value={profile.department || ''}
                    onChange={(e) => set('department', e.target.value)}
                    className="input-field pl-10"
                    placeholder="Your department"
                  />
                  <Building2 className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleLogout}
              className="btn-secondary sm:px-6"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {success && (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-found">
                  <CheckCircle2 className="h-4 w-4" /> Saved
                </span>
              )}
              <button type="submit" disabled={saving} className="btn-primary sm:px-6">
                {saving ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Save changes
                  </>
                )}
              </button>
            </div>
          </div>

          {user?.role === 'ADMIN' && (
            <Link
              to="/admin"
              className="flex items-center justify-between rounded-xl border border-primary-200 bg-primary-50 p-4 transition-colors hover:bg-primary-100"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-primary-800">
                <ShieldCheck className="h-5 w-5" /> Open admin panel
              </span>
              <span className="text-sm text-primary-700">Go →</span>
            </Link>
          )}
        </form>
      </div>
    </div>
  )
}