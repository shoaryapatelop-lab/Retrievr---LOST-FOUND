import { Link } from 'react-router-dom'
import { Instagram, Mail, MapPin, ShieldCheck, Recycle, Search } from 'lucide-react'

const categoryLinks = ['Electronics', 'Documents', 'Accessories', 'Clothing', 'Bags', 'Keys']

const socials = [
  { icon: Instagram, label: 'Instagram', href: 'https://instagram.com' },
  { icon: Mail, label: 'Email', href: 'mailto:support@retrievr.app' },
]

export default function Footer() {
  return (
    <footer className="mt-auto bg-ink-900 text-white">
      <div className="container-page py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 font-display text-lg font-bold text-white">
                R
              </span>
              <span className="font-display text-xl font-bold">Retrievr</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              A smarter Lost &amp; Found marketplace. Report belongings, discover found items, and
              reconnect with what&apos;s yours.
            </p>
            <div className="mt-5 flex gap-3">
              {socials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white/90">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                { to: '/report/lost', label: 'Report Lost Item' },
                { to: '/report/found', label: 'Report Found Item' },
                { to: '/search', label: 'Browse Items' },
                { to: '/dashboard', label: 'My Dashboard' },
                { to: '/profile', label: 'Account' },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-white/60 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white/90">
              Categories
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {categoryLinks.map((c) => (
                <li key={c}>
                  <Link
                    to={`/search?category=${encodeURIComponent(c)}`}
                    className="text-white/60 transition-colors hover:text-white"
                  >
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + trust */}
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white/90">
              Get in Touch
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-white/60">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-white/40" /> support@retrievr.app
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-white/40" /> Main Campus, Student Union
              </li>
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs text-white/70">
                <ShieldCheck className="h-3.5 w-3.5 text-found" /> Verified claims
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs text-white/70">
                <Recycle className="h-3.5 w-3.5 text-accent-400" /> Reunite &amp; reuse
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-white/50 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Retrievr. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link to="/about" className="transition-colors hover:text-white">About</Link>
            <Link to="/faq" className="transition-colors hover:text-white">FAQ</Link>
            <Link to="/privacy" className="transition-colors hover:text-white">Privacy</Link>
            <Link to="/terms" className="transition-colors hover:text-white">Terms</Link>
            <span className="hidden items-center gap-1.5 sm:inline-flex">
              <Search className="h-3.5 w-3.5" /> Lost &amp; Found, reimagined
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}