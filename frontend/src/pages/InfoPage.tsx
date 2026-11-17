import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Search, ShieldCheck, Recycle, ArrowRight, HelpCircle, FileText, Info,
  PackageSearch, CheckCircle2,
} from 'lucide-react'

const FAQS = [
  {
    q: 'How do I report a lost or found item?',
    a: 'Sign in, then choose “Report item” in the navigation and pick “Report a lost item” or “Report a found item”. Add a title, category, location, date, description and photos, then submit.',
  },
  {
    q: 'How does matching work?',
    a: 'Retrievr compares lost and found reports by category, keywords, colour, brand and location. When a likely pair is found, both reporters are notified so they can connect.',
  },
  {
    q: 'How do I claim an item?',
    a: 'Open the found item, tap “Claim this item”, and describe identifying details only the owner would know. An admin reviews the claim before the hand-off is approved.',
  },
  {
    q: 'Who verifies claims?',
    a: 'Every claim is reviewed by a campus admin. Admins can approve or reject a claim after checking the evidence you provide.',
  },
  {
    q: 'Is Retrievr free to use?',
    a: 'Yes. Reporting, searching and claiming items on Retrievr are completely free for the community.',
  },
]

type SectionKey = 'about' | 'faq' | 'privacy' | 'terms'

const META: Record<SectionKey, { title: string; subtitle: string; icon: typeof Info }> = {
  about: {
    title: 'About Retrievr',
    subtitle: 'A community Lost & Found that actually reunites people with their belongings.',
    icon: Info,
  },
  faq: {
    title: 'Frequently asked questions',
    subtitle: 'Everything you need to know about reporting, matching and claiming items.',
    icon: HelpCircle,
  },
  privacy: {
    title: 'Privacy policy',
    subtitle: 'How Retrievr collects, uses and protects your information.',
    icon: ShieldCheck,
  },
  terms: {
    title: 'Terms of service',
    subtitle: 'The ground rules for using the Retrievr platform.',
    icon: FileText,
  },
}

function slugFromPath(pathname: string): SectionKey {
  if (pathname.startsWith('/faq')) return 'faq'
  if (pathname.startsWith('/privacy')) return 'privacy'
  if (pathname.startsWith('/terms')) return 'terms'
  return 'about'
}

export default function InfoPage() {
  const { pathname } = useLocation()
  const key = slugFromPath(pathname)
  const meta = META[key]
  const Icon = meta.icon

  return (
    <div className="bg-canvas">
      <div className="container-narrow py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
            <Icon className="h-6 w-6" />
          </span>
          <h1 className="mt-5 font-display text-3xl font-bold text-ink-900 sm:text-4xl">
            {meta.title}
          </h1>
          <p className="mt-3 text-lg text-gray-600">{meta.subtitle}</p>
        </motion.div>

        <div className="mt-10 space-y-8">
          {key === 'about' && <AboutContent />}
          {key === 'faq' && <FaqContent />}
          {key === 'privacy' && (
            <Prose title="Our commitment">
              <p>
                Retrievr collects only the information needed to run a trustworthy Lost &amp; Found
                service: your name, email, role and the details you choose to publish with a report.
                Your password is stored as a one-way hash and is never visible to anyone, including
                admins.
              </p>
              <h3>What we store</h3>
              <p>
                Account details, the items you report, uploaded photos, claim messages and the
                notifications generated from them. We use this data to operate matching, verify
                claims and keep the community safe.
              </p>
              <h3>What we never do</h3>
              <p>
                We do not sell your personal information, and we do not share your contact details
                with other users without your involvement in a claim or hand-off.
              </p>
              <h3>Your choices</h3>
              <p>
                You can update your profile at any time and request removal of your reports by
                contacting support. Deleting an account removes your personal details from active
                use.
              </p>
            </Prose>
          )}
          {key === 'terms' && (
            <Prose title="Using Retrievr responsibly">
              <p>
                By using Retrievr you agree to report items honestly, provide accurate information,
                and treat other community members with respect. Reports must describe genuine lost or
                found belongings.
              </p>
              <h3>Claims and hand-offs</h3>
              <p>
                Only the rightful owner should claim an item. Submit truthful identifying details;
                false claims may result in your account being suspended. Admins make the final
                decision on every claim.
              </p>
              <h3>Prohibited content</h3>
              <p>
                Do not post unlawful, misleading, offensive or spam content. Do not upload images you
                do not have the right to share.
              </p>
              <h3>Availability</h3>
              <p>
                Retrievr is provided as a community service. We work to keep it reliable, but we
                cannot guarantee uninterrupted availability.
              </p>
            </Prose>
          )}
        </div>

        <div className="mt-12 rounded-2xl border border-hairline bg-white p-6 text-center">
          <p className="text-sm text-gray-600">
            Still have a question? We&apos;re happy to help.
          </p>
          <Link to="/search" className="btn-primary mt-4">
            Browse items <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

function AboutContent() {
  return (
    <>
      <Prose title="Lost something? Let's bring it back.">
        <p>
          Retrievr is a community Lost &amp; Found marketplace built for busy campuses and
          neighbourhoods. Instead of posters and group chats, everything lives in one searchable
          place — so belongings find their way home faster.
        </p>
      </Prose>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {[
          { icon: PackageSearch, title: 'Report it', body: 'Post a lost or found item in under a minute.' },
          { icon: Search, title: 'Match it', body: 'Smart matching surfaces likely pairs instantly.' },
          { icon: CheckCircle2, title: 'Reunite it', body: 'Verified claims keep every hand-off safe.' },
        ].map(({ icon: I, title, body }) => (
          <div key={title} className="card card-pad">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <I className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-display text-lg font-bold text-ink-900">{title}</h3>
            <p className="mt-1.5 text-sm text-gray-600">{body}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 rounded-2xl bg-ink-900 p-5 text-white">
        <Recycle className="h-8 w-8 shrink-0 text-accent-400" />
        <p className="text-sm text-white/80">
          Every reunion keeps a usable item in circulation. That&apos;s better for everyone.
        </p>
      </div>
    </>
  )
}

function FaqContent() {
  return (
    <div className="space-y-3">
      {FAQS.map((f, i) => (
        <details
          key={f.q}
          className="group card overflow-hidden"
          open={i === 0 ? true : undefined}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-left">
            <span className="font-display text-base font-semibold text-ink-900">{f.q}</span>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-transform duration-200 group-open:rotate-45">
              <span className="text-lg leading-none">+</span>
            </span>
          </summary>
          <div className="border-t border-hairline px-5 py-4 text-sm leading-relaxed text-gray-600">
            {f.a}
          </div>
        </details>
      ))}
    </div>
  )
}

function Prose({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card card-pad">
      <h2 className="font-display text-xl font-bold text-ink-900">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-gray-600 [&_h3]:mt-6 [&_h3]:font-display [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-ink-900">
        {children}
      </div>
    </div>
  )
}