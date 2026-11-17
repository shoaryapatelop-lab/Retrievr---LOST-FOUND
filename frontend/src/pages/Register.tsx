import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, Phone, AlertCircle, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AuthShell from '../components/AuthShell'

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Role = 'STUDENT' | 'ADMIN'

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'STUDENT' as Role,
  rollNumber: '',
  employeeId: '',
  department: '',
  contact: '',
}

export default function Register() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const set = (name: keyof typeof initialForm, value: string) => {
    setForm((f) => ({ ...f, [name]: value }))
    setErrors((e) => ({ ...e, [name]: '' }))
    setServerError('')
  }

  const validate = () => {
    const next: Record<string, string> = {}
    if (!form.firstName.trim()) next.firstName = 'First name is required.'
    if (!form.lastName.trim()) next.lastName = 'Last name is required.'
    if (!form.email.trim()) next.email = 'Email is required.'
    else if (!emailRe.test(form.email.trim())) next.email = 'Enter a valid email address.'
    if (!form.password) next.password = 'Password is required.'
    else if (form.password.length < 8) next.password = 'Use at least 8 characters.'
    if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match.'

    if (form.role === 'STUDENT') {
      if (!form.rollNumber.trim()) next.rollNumber = 'Roll number is required.'
      if (!form.department.trim()) next.department = 'Department is required.'
    } else {
      if (!form.employeeId.trim()) next.employeeId = 'Employee ID is required.'
      if (!form.department.trim()) next.department = 'Department is required.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError('')
    if (!validate()) return

    setLoading(true)
    try {
      await register({
        email: form.email.trim(),
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        role: form.role,
        ...(form.role === 'STUDENT'
          ? { rollNumber: form.rollNumber.trim(), department: form.department.trim(), contact: form.contact.trim() }
          : { employeeId: form.employeeId.trim(), department: form.department.trim() }),
      })
      navigate('/')
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fieldError = (name: string) =>
    errors[name] ? (
      <p className="field-error" role="alert">
        <AlertCircle className="h-3.5 w-3.5" /> {errors[name]}
      </p>
    ) : null

  return (
    <AuthShell
      title="Create your account"
      subtitle={
        <>
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
            Sign in
          </Link>
        </>
      }
      footer={
        <>
          By creating an account you agree to our{' '}
          <Link to="/terms" className="font-medium text-primary-600 hover:text-primary-700">
            Terms
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="font-medium text-primary-600 hover:text-primary-700">
            Privacy Policy
          </Link>
          .
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        {serverError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-lost"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="firstName" className="input-label">
              First name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              value={form.firstName}
              onChange={(e) => set('firstName', e.target.value)}
              className={`input-field ${errors.firstName ? 'input-field-error' : ''}`}
              placeholder="First name"
            />
            {fieldError('firstName')}
          </div>
          <div>
            <label htmlFor="lastName" className="input-label">
              Last name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              value={form.lastName}
              onChange={(e) => set('lastName', e.target.value)}
              className={`input-field ${errors.lastName ? 'input-field-error' : ''}`}
              placeholder="Last name"
            />
            {fieldError('lastName')}
          </div>
        </div>

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
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              className={`input-field pl-10 ${errors.email ? 'input-field-error' : ''}`}
              placeholder="you@campus.edu"
            />
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          </div>
          {fieldError('email')}
        </div>

        <div>
          <label htmlFor="role" className="input-label">
            I am a
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['STUDENT', 'ADMIN'] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => set('role', r)}
                aria-pressed={form.role === r}
                className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all ${
                  form.role === r
                    ? 'border-primary-500 bg-primary-50 text-primary-700 ring-1 ring-primary-500'
                    : 'border-hairline bg-white text-ink-800 hover:bg-gray-50'
                }`}
              >
                {form.role === r && <Check className="h-4 w-4" />}
                {r === 'STUDENT' ? 'Student' : 'Admin'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="password" className="input-label">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              className={`input-field pl-10 pr-10 ${errors.password ? 'input-field-error' : ''}`}
              placeholder="At least 8 characters"
            />
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-400 transition-colors hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {fieldError('password')}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="input-label">
            Confirm password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(e) => set('confirmPassword', e.target.value)}
              className={`input-field pl-10 ${errors.confirmPassword ? 'input-field-error' : ''}`}
              placeholder="Confirm password"
            />
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          </div>
          {fieldError('confirmPassword')}
        </div>

        {form.role === 'STUDENT' ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="rollNumber" className="input-label">
                Roll number
              </label>
              <input
                id="rollNumber"
                name="rollNumber"
                type="text"
                value={form.rollNumber}
                onChange={(e) => set('rollNumber', e.target.value)}
                className={`input-field ${errors.rollNumber ? 'input-field-error' : ''}`}
                placeholder="Roll number"
              />
              {fieldError('rollNumber')}
            </div>
            <div>
              <label htmlFor="department" className="input-label">
                Department
              </label>
              <input
                id="department"
                name="department"
                type="text"
                value={form.department}
                onChange={(e) => set('department', e.target.value)}
                className={`input-field ${errors.department ? 'input-field-error' : ''}`}
                placeholder="Department"
              />
              {fieldError('department')}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="contact" className="input-label">
                Contact number <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <div className="relative">
                <input
                  id="contact"
                  name="contact"
                  type="tel"
                  value={form.contact}
                  onChange={(e) => set('contact', e.target.value)}
                  className="input-field pl-10"
                  placeholder="Contact number"
                />
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="employeeId" className="input-label">
                Employee ID
              </label>
              <input
                id="employeeId"
                name="employeeId"
                type="text"
                value={form.employeeId}
                onChange={(e) => set('employeeId', e.target.value)}
                className={`input-field ${errors.employeeId ? 'input-field-error' : ''}`}
                placeholder="Employee ID"
              />
              {fieldError('employeeId')}
            </div>
            <div>
              <label htmlFor="adminDepartment" className="input-label">
                Department
              </label>
              <input
                id="adminDepartment"
                name="department"
                type="text"
                value={form.department}
                onChange={(e) => set('department', e.target.value)}
                className={`input-field ${errors.department ? 'input-field-error' : ''}`}
                placeholder="Department"
              />
              {fieldError('department')}
            </div>
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            'Create account'
          )}
        </button>
      </form>
    </AuthShell>
  )
}