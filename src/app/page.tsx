'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// ── Stat counter ─────────────────────────────────────────────────────────────

function StatCounter({ target, prefix = '', suffix = '', duration = 2000 }: {
  target: number; prefix?: string; suffix?: string; duration?: number
}) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const start = Date.now()
        const tick = () => {
          const elapsed = Date.now() - start
          const progress = Math.min(elapsed / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setCount(Math.floor(eased * target))
          if (progress < 1) requestAnimationFrame(tick)
          else setCount(target)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.3 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return <div ref={ref}>{prefix}{count.toLocaleString('en-IN')}{suffix}</div>
}

// ── Check icon ────────────────────────────────────────────────────────────────

function Check({ className = 'text-green-500' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 shrink-0 ${className}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
    </svg>
  )
}

// ── Dashboard mockup ──────────────────────────────────────────────────────────

function DashboardMockup() {
  return (
    <div className="relative">
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        .animate-float { animation: float 4s ease-in-out infinite; }
      `}</style>

      <div className="animate-float">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 w-full max-w-sm mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-slate-800 text-sm">April 2025</span>
            <span className="text-xs text-indigo-600 font-medium">₹18,500 / ₹24,000</span>
          </div>
          {/* Progress */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4">
            <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: '77%' }} />
          </div>
          {/* Rows */}
          {[
            { name: 'Rahul Sharma', fee: '₹1,500', badge: 'Paid', color: 'bg-green-100 text-green-700', btn: null },
            { name: 'Priya Patel', fee: '₹1,200', badge: 'Overdue', color: 'bg-red-100 text-red-700', btn: 'WhatsApp' },
            { name: 'Amit Verma', fee: '₹2,000', badge: 'Pending', color: 'bg-yellow-100 text-yellow-700', btn: 'WhatsApp' },
          ].map((row) => (
            <div key={row.name} className="flex items-center justify-between py-2.5 border-t border-slate-100 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0">
                  {row.name[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-800 truncate">{row.name}</p>
                  <p className="text-xs text-slate-400">{row.fee}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${row.color}`}>{row.badge}</span>
                {row.btn && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500 text-white font-medium cursor-pointer">
                    {row.btn}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WhatsApp bubble */}
      <div className="mt-4 ml-4 max-w-xs">
        <div className="bg-[#dcf8c6] rounded-2xl rounded-tl-none px-4 py-3 shadow-md inline-block">
          <p className="text-xs text-slate-700 leading-relaxed">
            Namaste! Priya Patel ki is mahine ki fees ₹1,200 abhi pending hai. Kripya jald payment karein 🙏
          </p>
          <p className="text-xs text-slate-400 text-right mt-1">10:30 AM ✓✓</p>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const [annual, setAnnual] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    {
      q: 'Kya parents ko koi app download karni padegi?',
      a: 'Bilkul nahi. Sirf owner ko account banana hai. Parents ko kuch bhi install nahi karna — WhatsApp link directly unke phone pe open ho jaata hai.',
    },
    {
      q: 'Kya WhatsApp Business API ki zaroorat hai?',
      a: 'Nahi. Hum wa.me links use karte hain jo normal WhatsApp mein kaam karta hai — bilkul free, koi approval nahi chahiye, koi setup nahi.',
    },
    {
      q: 'Kya mera data safe hai?',
      a: 'Haan. Aapka data Supabase pe store hota hai — enterprise-grade encryption ke saath. Hum aapka data kabhi share nahi karte.',
    },
    {
      q: 'Free plan mein kya milta hai?',
      a: '3 students tak — WhatsApp reminders, live dashboard, payment tracking, aur digital receipts — forever free. Koi time limit nahi.',
    },
    {
      q: 'Payment kaise karein Pro ke liye?',
      a: 'Razorpay se — UPI, credit/debit card, netbanking sab accept hota hai. Monthly ya annual dono options available hain.',
    },
  ]

  return (
    <div className="min-h-screen text-slate-900 scroll-smooth">

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <Image src="/logo.svg" alt="PayRemind" width={148} height={44} className="h-10 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {[['How it works', '#how-it-works'], ['Pricing', '#pricing'], ['Features', '#features']].map(([label, href]) => (
              <a key={label} href={href} className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium">{label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors">
              Login
            </Link>
            <Link href="/login" className="text-sm font-semibold bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-14">

            {/* Left */}
            <div className="flex-1 max-w-xl">
              <span className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200">
                🇮🇳 Built for India&apos;s coaching classes
              </span>
              <h1 className="text-5xl sm:text-6xl font-extrabold leading-[1.1] tracking-tight text-slate-900 mb-6">
                Stop Chasing<br />
                <span className="text-indigo-600">Fees.</span> Start<br />
                Collecting Them.
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                Send WhatsApp reminders, track payments, and generate receipts — all in 2 minutes. Built for coaching class owners in Tier 2/3 India.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <Link href="/login" className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-base font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200">
                  Start Free — No Card Needed
                </Link>
                <a href="#how-it-works" className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-base font-semibold text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors">
                  See How It Works
                </a>
              </div>
              <p className="text-sm text-slate-500 mb-10">
                ✓ Free for 3 students &nbsp;·&nbsp; ✓ No app download &nbsp;·&nbsp; ✓ Works on any phone
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-8">
                {[
                  { target: 500, suffix: '+', label: 'Owners' },
                  { target: 2, prefix: '₹', suffix: 'Cr+ Tracked', label: '' },
                  { target: 2, suffix: ' min Setup', label: '' },
                ].map((s, i) => (
                  <div key={i} className="text-left">
                    <div className="text-3xl font-extrabold text-slate-900">
                      <StatCounter target={s.target} prefix={s.prefix ?? ''} suffix={s.suffix} />
                    </div>
                    {s.label && <p className="text-sm text-slate-500 mt-0.5">{s.label}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Dashboard mockup */}
            <div className="flex-shrink-0 w-full lg:w-auto lg:max-w-sm xl:max-w-md">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section className="bg-slate-900 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-3">
            Every coaching class owner faces the same problem
          </h2>
          <p className="text-slate-400 text-center mb-12 max-w-xl mx-auto">
            You didn&apos;t start a coaching class to spend your evenings chasing fees.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { icon: '😓', title: '2+ hours wasted', desc: 'Every month spent manually texting each parent the same reminder message over and over.' },
              { icon: '💸', title: '₹5,000–20,000 lost', desc: 'Monthly revenue lost because parents forget, and you feel awkward following up repeatedly.' },
              { icon: '📋', title: 'No payment record', desc: 'No idea who paid, who didn\'t — just a mess of WhatsApp chats and mental notes.' },
            ].map((card) => (
              <div key={card.title} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:-translate-y-1 transition-transform duration-200">
                <div className="text-3xl mb-3">{card.icon}</div>
                <h3 className="font-semibold text-white mb-2">{card.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOLUTION / FEATURES ── */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center mb-3">
            PayRemind solves this in 2 minutes
          </h2>
          <p className="text-slate-500 text-center mb-12 max-w-xl mx-auto">
            One dashboard. Zero spreadsheets. Automatic WhatsApp reminders.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: '📱', title: 'One-Click WhatsApp', desc: 'Pre-filled message opens instantly. No typing, no copy-paste — just tap Send.' },
              { icon: '✅', title: 'Live Payment Tracker', desc: 'See Paid / Pending / Overdue at a glance every month. Zero guesswork.' },
              { icon: '📄', title: 'Auto PDF Receipts', desc: 'Generate and WhatsApp receipts in one click. Look professional instantly.' },
            ].map((card) => (
              <div key={card.title} className="bg-white rounded-2xl border border-indigo-100 p-6 flex flex-col gap-3 hover:-translate-y-1 transition-transform duration-200 shadow-sm">
                <div className="text-3xl">{card.icon}</div>
                <h3 className="font-semibold text-slate-900">{card.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center mb-3">
            Up and running in 4 steps
          </h2>
          <p className="text-slate-500 text-center mb-14 max-w-xl mx-auto">
            No IT team. No training. No setup call needed.
          </p>
          <div className="flex flex-col gap-12">
            {[
              {
                step: '1', title: 'Add your students once',
                desc: 'Enter names, phone numbers, fee amounts, and due dates — or import a CSV. Done in under 2 minutes.',
                mockup: (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-md p-4 w-full max-w-xs">
                    <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">Add Student</p>
                    {[['Name', 'Rahul Sharma'], ['Phone', '91XXXXXXXXXX'], ['Fee', '₹1,500'], ['Due Day', '5th']].map(([l, v]) => (
                      <div key={l} className="mb-2">
                        <p className="text-xs text-slate-400 mb-0.5">{l}</p>
                        <div className="bg-slate-100 rounded-lg px-3 py-1.5 text-xs text-slate-600 font-medium">{v}</div>
                      </div>
                    ))}
                    <div className="mt-3 bg-indigo-600 text-white text-xs font-semibold rounded-lg py-2 text-center">Save Student</div>
                  </div>
                ),
              },
              {
                step: '2', title: 'Dashboard auto-loads monthly status',
                desc: 'Every month, PayRemind auto-creates payment records for all students. Open the dashboard and see who\'s paid and who hasn\'t.',
                mockup: (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-md p-4 w-full max-w-xs">
                    <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">May 2025</p>
                    {[
                      { n: 'Rahul Sharma', s: 'Paid', c: 'bg-green-100 text-green-700' },
                      { n: 'Priya Patel', s: 'Overdue', c: 'bg-red-100 text-red-700' },
                      { n: 'Amit Verma', s: 'Pending', c: 'bg-yellow-100 text-yellow-700' },
                    ].map(({ n, s, c }) => (
                      <div key={n} className="flex items-center justify-between py-1.5 border-t border-slate-100">
                        <span className="text-xs text-slate-700">{n}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c}`}>{s}</span>
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                step: '3', title: 'Click Send Reminder',
                desc: 'One click opens WhatsApp with a pre-filled personalised message. Just tap Send — it takes 3 seconds per student.',
                mockup: (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-md p-4 w-full max-w-xs">
                    <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">WhatsApp Preview</p>
                    <div className="bg-[#dcf8c6] rounded-2xl rounded-tl-none p-3 text-xs text-slate-700 leading-relaxed">
                      Namaste! Priya Patel ki fees ₹1,200 pending hai. Kripya jald payment karein 🙏
                    </div>
                    <div className="mt-3 bg-green-500 text-white text-xs font-semibold rounded-lg py-2 text-center">
                      Open in WhatsApp →
                    </div>
                  </div>
                ),
              },
              {
                step: '4', title: 'Mark Paid, download receipt',
                desc: 'When fee is collected, mark it paid. PayRemind generates a PDF receipt instantly — send it to the parent on WhatsApp.',
                mockup: (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-md p-4 w-full max-w-xs">
                    <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">Receipt</p>
                    <div className="border border-slate-200 rounded-lg p-3 text-xs">
                      <div className="flex justify-between mb-1"><span className="text-slate-400">Student</span><span className="text-slate-700 font-medium">Priya Patel</span></div>
                      <div className="flex justify-between mb-1"><span className="text-slate-400">Month</span><span className="text-slate-700 font-medium">May 2025</span></div>
                      <div className="flex justify-between mb-1"><span className="text-slate-400">Amount</span><span className="text-slate-700 font-medium">₹1,200</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Status</span><span className="text-green-600 font-medium">Paid ✓</span></div>
                    </div>
                    <div className="mt-3 bg-indigo-600 text-white text-xs font-semibold rounded-lg py-2 text-center">Download PDF</div>
                  </div>
                ),
              },
            ].map((item, idx) => (
              <div key={idx} className={`flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8`}>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0">
                      {item.step}
                    </div>
                    <h3 className="font-semibold text-slate-900 text-lg">{item.title}</h3>
                  </div>
                  <p className="text-slate-500 leading-relaxed pl-12">{item.desc}</p>
                </div>
                <div className="flex-shrink-0 flex justify-center w-full md:w-auto">
                  {item.mockup}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="text-5xl sm:text-6xl font-extrabold text-white mb-2">₹2,00,00,000+</div>
            <p className="text-indigo-200 text-lg">fees tracked by coaching class owners like you</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { quote: 'Pehle 2 ghante waste hote the. Ab 10 minute mein ho jaata hai.', name: 'Rajesh Sir', city: 'Nashik' },
              { quote: 'Pehle hi mahine ₹8,000 recover kiye jo pehle miss ho jaate the.', name: 'Priya Ma\'am', city: 'Nagpur' },
              { quote: '5 minute mein setup. Bahut easy hai, mera staff bhi use kar sakta hai.', name: 'Amit Sir', city: 'Jaipur' },
            ].map((t) => (
              <div key={t.name} className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20 hover:-translate-y-1 transition-transform duration-200">
                <div className="text-yellow-300 text-sm mb-3">⭐⭐⭐⭐⭐</div>
                <p className="text-white text-sm leading-relaxed mb-4 italic">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-indigo-200 text-xs">{t.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center mb-3">
            Simple, honest pricing
          </h2>
          <p className="text-slate-500 text-center mb-8 max-w-xl mx-auto">
            Start free. Upgrade when you grow.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <span className={`text-sm font-medium ${!annual ? 'text-slate-900' : 'text-slate-400'}`}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-12 h-6 rounded-full transition-colors ${annual ? 'bg-indigo-600' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${annual ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
            <span className={`text-sm font-medium ${annual ? 'text-slate-900' : 'text-slate-400'}`}>
              Annual <span className="text-green-600 font-semibold">Save 2 months</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Free */}
            <div className="rounded-2xl border border-slate-200 p-7 flex flex-col gap-5 hover:-translate-y-1 transition-transform duration-200">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Free</p>
                <p className="text-4xl font-extrabold text-slate-900">₹0</p>
                <p className="text-sm text-slate-400 mt-1">Forever free</p>
              </div>
              <ul className="flex flex-col gap-2.5 text-sm text-slate-600">
                {['Up to 3 students', 'WhatsApp reminders', 'Payment tracking', 'Digital receipts'].map((f) => (
                  <li key={f} className="flex items-center gap-2"><Check /> {f}</li>
                ))}
              </ul>
              <Link href="/login" className="mt-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors">
                Start Free
              </Link>
            </div>

            {/* Starter — Popular */}
            <div className="rounded-2xl border-2 border-indigo-600 bg-indigo-600 p-7 flex flex-col gap-5 shadow-xl shadow-indigo-200 relative hover:-translate-y-1 transition-transform duration-200">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  Most Popular
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-200 mb-1">Starter</p>
                <div className="flex items-end gap-1">
                  <p className="text-4xl font-extrabold text-white">{annual ? '₹83' : '₹99'}</p>
                  <p className="text-indigo-300 mb-1 text-sm">/month</p>
                </div>
                <p className="text-sm text-indigo-300 mt-1">{annual ? 'Billed ₹999/year' : 'Billed monthly'}</p>
              </div>
              <ul className="flex flex-col gap-2.5 text-sm text-indigo-100">
                {['Up to 30 students', 'Unlimited reminders', 'CSV bulk import', 'Batch management', 'Collection reports', 'Custom templates'].map((f) => (
                  <li key={f} className="flex items-center gap-2"><Check className="text-indigo-300" /> {f}</li>
                ))}
              </ul>
              <Link href="/login" className="mt-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold bg-white text-indigo-700 hover:bg-indigo-50 transition-colors">
                Get Started
              </Link>
            </div>

            {/* Growth */}
            <div className="rounded-2xl border border-slate-200 p-7 flex flex-col gap-5 hover:-translate-y-1 transition-transform duration-200">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Growth</p>
                <div className="flex items-end gap-1">
                  <p className="text-4xl font-extrabold text-slate-900">{annual ? '₹208' : '₹299'}</p>
                  <p className="text-slate-400 mb-1 text-sm">/month</p>
                </div>
                <p className="text-sm text-slate-400 mt-1">{annual ? 'Billed ₹2,499/year' : 'Billed monthly'}</p>
              </div>
              <ul className="flex flex-col gap-2.5 text-sm text-slate-600">
                {['Unlimited students', 'Everything in Starter', 'Priority support', 'Early feature access'].map((f) => (
                  <li key={f} className="flex items-center gap-2"><Check /> {f}</li>
                ))}
              </ul>
              <Link href="/login" className="mt-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Frequently asked questions
          </h2>
          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <span className="font-medium text-slate-900 text-sm">{faq.q}</span>
                  <span className="text-slate-400 shrink-0 text-lg">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-indigo-600 py-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
            Join 500+ coaching class owners
          </h2>
          <p className="text-indigo-200 text-lg mb-10 leading-relaxed">
            Start recovering your fees today — free forever for small classes.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-10 py-4 rounded-xl text-base font-semibold bg-white text-indigo-700 hover:bg-indigo-50 transition-colors shadow-md"
          >
            Get Started Free →
          </Link>
          <p className="mt-5 text-sm text-indigo-300">No credit card · Free for 3 students · Setup in 2 minutes</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-900 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-8">
            <div>
              <Image src="/logo-footer.svg" alt="PayRemind" width={140} height={42} className="h-10 w-auto mb-2" />
              <p className="text-slate-400 text-sm">Fee collection, simplified.</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {[['Dashboard', '/dashboard'], ['Pricing', '#pricing'], ['Login', '/login']].map(([l, h]) => (
                <Link key={l} href={h} className="text-slate-400 hover:text-white text-sm transition-colors">{l}</Link>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-slate-500 text-xs">Made with ❤️ for coaching class owners in India 🇮🇳</p>
            <p className="text-slate-500 text-xs">© 2025 PayRemind. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
