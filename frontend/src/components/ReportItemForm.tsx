import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Upload, MapPin, Calendar, Tag, AlertCircle, ImagePlus, X, ArrowLeft,
  PackageSearch, Package, ShieldCheck, Lightbulb, Image as ImageIcon, Camera,
} from 'lucide-react'
import { api } from '../services/api'

const CATEGORIES = [
  { id: 1, name: 'Electronics' },
  { id: 2, name: 'Documents' },
  { id: 3, name: 'Accessories' },
  { id: 4, name: 'Clothing' },
  { id: 5, name: 'Bags' },
  { id: 6, name: 'Keys' },
  { id: 7, name: 'Other Items' },
]

const MAX_IMAGES = 5
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

interface FormState {
  title: string
  description: string
  locationFound: string
  dateFound: string
  color: string
  brand: string
  contactInfo: string
  lastSeenLocation: string
  categoryId: string
}

const emptyForm: FormState = {
  title: '',
  description: '',
  locationFound: '',
  dateFound: '',
  color: '',
  brand: '',
  contactInfo: '',
  lastSeenLocation: '',
  categoryId: '',
}

export default function ReportItemForm({ type }: { type: 'LOST' | 'FOUND' }) {
  const isLost = type === 'LOST'
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [dragging, setDragging] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraError, setCameraError] = useState('')

  const previews = useMemo(
    () => images.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [images],
  )
  useEffect(() => {
    return () => previews.forEach((p) => URL.revokeObjectURL(p.url))
  }, [previews])

  const set = (name: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [name]: value }))
    setErrors((e) => ({ ...e, [name]: '' }))
    setServerError('')
  }

  const addFiles = (files: FileList | null) => {
    if (!files) return
    const incoming = Array.from(files)
    const next = [...images]
    for (const file of incoming) {
      if (next.length >= MAX_IMAGES) break
      if (!file.type.startsWith('image/')) {
        setErrors((e) => ({ ...e, images: 'Only image files are allowed.' }))
        continue
      }
      if (file.size > MAX_SIZE) {
        setErrors((e) => ({ ...e, images: 'Each image must be under 10MB.' }))
        continue
      }
      next.push(file)
    }
    setImages(next)
    setErrors((e) => ({ ...e, images: '' }))
  }

  const removeImage = (index: number) => {
    setImages((imgs) => imgs.filter((_, i) => i !== index))
  }

  const openCamera = async () => {
    setCameraError('')
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      // fallback to native capture input
      cameraInputRef.current?.click()
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      setCameraOpen(true)
      // attach after render
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream
      }, 0)
    } catch (e) {
      setCameraError('Camera access was denied or is unavailable. You can still upload from your gallery.')
      cameraInputRef.current?.click()
    }
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setCameraOpen(false)
  }

  const capturePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob((blob) => {
      if (!blob) return
      const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' })
      if (images.length < MAX_IMAGES) {
        setImages((prev) => [...prev, file])
        setErrors((e) => ({ ...e, images: '' }))
      }
      stopCamera()
    }, 'image/jpeg', 0.92)
  }

  const validate = () => {
    const next: Record<string, string> = {}
    if (!form.title.trim()) next.title = 'Give the item a short, clear name.'
    if (!form.description.trim()) next.description = 'Add a description to help identify the item.'
    if (!form.categoryId) next.categoryId = 'Choose a category.'
    if (!form.dateFound) next.dateFound = 'Select the date.'
    if (!form.locationFound.trim()) next.locationFound = isLost ? 'Where did you last see it?' : 'Where did you find it?'
    if (Object.keys(next).length) setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setServerError('')
    if (!validate()) {
      const firstError = document.querySelector<HTMLElement>('[aria-invalid="true"]')
      firstError?.focus()
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        locationFound: form.locationFound.trim(),
        dateFound: `${form.dateFound}T00:00:00`,
        color: form.color.trim() || null,
        brand: form.brand.trim() || null,
        contactInfo: form.contactInfo.trim() || null,
        categoryId: Number(form.categoryId),
        ...(isLost ? { lastSeenLocation: form.lastSeenLocation.trim() || null } : {}),
      }

      const endpoint = isLost ? '/items/lost' : '/items/found'
      const response = await api.post(endpoint, payload)
      const itemId = response.data.id

      for (const image of images) {
        const data = new FormData()
        data.append('file', image)
        await api.post(`/upload/item/${itemId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }

      navigate(`/item/${itemId}`)
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to report the item. Please try again.'
      setServerError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const fieldError = (name: string) =>
    errors[name] ? (
      <p className="field-error" role="alert">
        <AlertCircle className="h-3.5 w-3.5" /> {errors[name]}
      </p>
    ) : null

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
          className="mt-4 flex items-start gap-4"
        >
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
              isLost ? 'bg-red-50 text-lost' : 'bg-emerald-50 text-found'
            }`}
          >
            {isLost ? <PackageSearch className="h-6 w-6" /> : <Package className="h-6 w-6" />}
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">
              Report a {isLost ? 'lost' : 'found'} item
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {isLost
                ? 'Tell the community what you are missing. The more detail, the better the match.'
                : 'Found something? List it here and help reunite it with its owner.'}
            </p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
          {serverError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-lost"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Item details */}
          <div className="card p-5 sm:p-6">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink-900">
              <Tag className="h-4 w-4 text-primary-600" /> Item details
            </h2>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="title" className="input-label">
                  Item name <span className="text-lost">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  aria-invalid={!!errors.title}
                  className={`input-field ${errors.title ? 'input-field-error' : ''}`}
                  placeholder={isLost ? 'e.g. Black Samsung phone' : 'e.g. Black backpack with laptop'}
                />
                {fieldError('title')}
              </div>

              <div>
                <label htmlFor="description" className="input-label">
                  Description <span className="text-lost">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  aria-invalid={!!errors.description}
                  className={`input-field ${errors.description ? 'input-field-error' : ''}`}
                  placeholder="Describe colour, brand, identifying marks, contents, or anything that helps identify it."
                />
                {fieldError('description')}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="categoryId" className="input-label">
                    Category <span className="text-lost">*</span>
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={form.categoryId}
                    onChange={(e) => set('categoryId', e.target.value)}
                    aria-invalid={!!errors.categoryId}
                    className={`input-field ${errors.categoryId ? 'input-field-error' : ''}`}
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {fieldError('categoryId')}
                </div>
                <div>
                  <label htmlFor="dateFound" className="input-label">
                    {isLost ? 'Date lost' : 'Date found'} <span className="text-lost">*</span>
                  </label>
                  <input
                    id="dateFound"
                    name="dateFound"
                    type="date"
                    value={form.dateFound}
                    onChange={(e) => set('dateFound', e.target.value)}
                    aria-invalid={!!errors.dateFound}
                    max={new Date().toISOString().split('T')[0]}
                    className={`input-field ${errors.dateFound ? 'input-field-error' : ''}`}
                  />
                  {fieldError('dateFound')}
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="card p-5 sm:p-6">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink-900">
              <MapPin className="h-4 w-4 text-primary-600" /> Location
            </h2>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="locationFound" className="input-label">
                  {isLost ? 'Location lost' : 'Location found'} <span className="text-lost">*</span>
                </label>
                <input
                  id="locationFound"
                  name="locationFound"
                  type="text"
                  value={form.locationFound}
                  onChange={(e) => set('locationFound', e.target.value)}
                  aria-invalid={!!errors.locationFound}
                  className={`input-field ${errors.locationFound ? 'input-field-error' : ''}`}
                  placeholder={isLost ? 'e.g. Library, 2nd floor' : 'e.g. Student Center entrance'}
                />
                {fieldError('locationFound')}
              </div>
              {isLost && (
                <div>
                  <label htmlFor="lastSeenLocation" className="input-label">
                    Last seen location <span className="font-normal text-gray-400">(optional)</span>
                  </label>
                  <input
                    id="lastSeenLocation"
                    name="lastSeenLocation"
                    type="text"
                    value={form.lastSeenLocation}
                    onChange={(e) => set('lastSeenLocation', e.target.value)}
                    className="input-field"
                    placeholder="A more specific spot, if you remember"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Extra details */}
          <div className="card p-5 sm:p-6">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink-900">
              <Calendar className="h-4 w-4 text-primary-600" /> Extra details
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="color" className="input-label">
                  Colour
                </label>
                <input
                  id="color"
                  name="color"
                  type="text"
                  value={form.color}
                  onChange={(e) => set('color', e.target.value)}
                  className="input-field"
                  placeholder="e.g. Black"
                />
              </div>
              <div>
                <label htmlFor="brand" className="input-label">
                  Brand
                </label>
                <input
                  id="brand"
                  name="brand"
                  type="text"
                  value={form.brand}
                  onChange={(e) => set('brand', e.target.value)}
                  className="input-field"
                  placeholder="e.g. Samsung"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="contactInfo" className="input-label">
                  Contact information <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  id="contactInfo"
                  name="contactInfo"
                  type="text"
                  value={form.contactInfo}
                  onChange={(e) => set('contactInfo', e.target.value)}
                  className="input-field"
                  placeholder="How can people reach you about this item?"
                />
              </div>
            </div>
          </div>

          {/* Photos */}
          <div className="card p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink-900">
                <ImageIcon className="h-4 w-4 text-primary-600" /> Photos
              </h2>
              <span className="text-xs text-gray-500">
                {images.length}/{MAX_IMAGES}
              </span>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragging(false)
                addFiles(e.dataTransfer.files)
              }}
              className={`mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
                dragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 bg-gray-50/50'
              }`}
            >
              <Upload className="h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="font-semibold text-primary-600 hover:text-primary-700"
                >
                  Click to upload
                </button>{' '}
                or drag and drop
              </p>
              <div className="mt-3 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary text-xs px-3 py-1.5"
                >
                  <Upload className="h-4 w-4" /> Upload from Gallery
                </button>
                <button
                  type="button"
                  onClick={openCamera}
                  className="btn-secondary text-xs px-3 py-1.5"
                >
                  <Camera className="h-4 w-4" /> Take Photo
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">PNG, JPG, WEBP up to 10MB each</p>
              <input
                ref={fileInputRef}
                id="images"
                name="images"
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => addFiles(e.target.files)}
                className="sr-only"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => addFiles(e.target.files)}
                className="sr-only"
              />
            </div>
            {fieldError('images')}

            {previews.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
                {previews.map((p, i) => (
                  <div key={p.url} className="group relative aspect-square overflow-hidden rounded-lg border border-hairline">
                    <img src={p.url} alt={`Preview ${i + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      aria-label={`Remove image ${i + 1}`}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink-900/70 text-white transition-colors hover:bg-lost"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {images.length < MAX_IMAGES && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 transition-colors hover:border-primary-400 hover:text-primary-600"
                  >
                    <ImagePlus className="h-6 w-6" />
                    <span className="text-[11px] font-medium">Add</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
            <p className="text-sm text-primary-800">
              <span className="font-semibold">Tip:</span>{' '}
              {isLost
                ? 'Share one detail only you would know (a scratch, a sticker, what was inside). Admins use it to verify the rightful owner.'
                : 'Keep one identifying detail back from the public description so the real owner can prove it is theirs.'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link to="/dashboard" className="btn-secondary sm:px-6">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary sm:px-6"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Submitting…
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" /> Submit report
                </>
              )}
            </button>
          </div>
          </form>

          {cameraOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
              <div className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-base font-semibold text-ink-900">Take Photo</h3>
                  <button type="button" onClick={stopCamera} className="text-gray-500 hover:text-lost">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {cameraError && <p className="text-sm text-lost mb-2">{cameraError}</p>}
                <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg bg-black" />
                <canvas ref={canvasRef} className="hidden" />
                <div className="mt-3 flex justify-end gap-2">
                  <button type="button" onClick={stopCamera} className="btn-secondary text-xs px-3 py-1.5">Cancel</button>
                  <button type="button" onClick={capturePhoto} className="btn-primary text-xs px-3 py-1.5">
                    <Camera className="h-4 w-4" /> Capture
                  </button>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  )
}