import { Link } from '@inertiajs/react'

const columns = [
  {
    title: 'Product',
    links: [
      { href: '#features', label: 'Features' },
      { href: '#pricing', label: 'Pricing' },
      { href: '/register', label: 'Get started' },
    ],
  },
  {
    title: 'Workspace',
    links: [
      { href: '/login', label: 'Log in' },
      { href: '/register', label: 'Sign up' },
      { href: '/dashboard', label: 'Dashboard' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '#testimonials', label: 'Customers' },
      { href: '#features', label: 'Product' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '#', label: 'Terms' },
      { href: '#', label: 'Privacy' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-6">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-[13px] font-medium">{column.title}</h3>
              <nav className="mt-2 flex flex-col gap-1">
                {column.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-[13px] text-muted-foreground hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-col items-start justify-between gap-2 border-t border-border pt-4 sm:flex-row sm:items-center">
          <span className="text-[13px] font-medium">ProjectFlow</span>
          <p className="text-[13px] text-muted-foreground">
            © {new Date().getFullYear()} ProjectFlow. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
