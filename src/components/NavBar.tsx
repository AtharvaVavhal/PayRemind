'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { supabase } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  userEmail: string
}

const navLinks = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Students', href: '/dashboard/students' },
]

export default function NavBar({ userEmail }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  function NavLinks({ onClick }: { onClick?: () => void }) {
    return (
      <>
        {navLinks.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            onClick={onClick}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm transition-colors',
              pathname === href
                ? 'bg-muted font-medium text-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {label}
          </Link>
        ))}
      </>
    )
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
        {/* Logo */}
        <Link href="/dashboard" className="shrink-0 text-lg font-bold text-primary">
          PayRemind
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 sm:flex">
          <NavLinks />
        </nav>

        {/* Desktop right */}
        <div className="hidden items-center gap-3 sm:flex">
          <span className="max-w-[180px] truncate text-sm text-muted-foreground">
            {userEmail}
          </span>
          <Button size="sm" variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Mobile menu toggle */}
        <Button
          size="icon-sm"
          variant="ghost"
          className="sm:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-3 sm:hidden">
          <nav className="flex flex-col gap-1">
            <NavLinks onClick={() => setMenuOpen(false)} />
          </nav>
          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
            <span className="max-w-[200px] truncate text-sm text-muted-foreground">
              {userEmail}
            </span>
            <Button size="sm" variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
