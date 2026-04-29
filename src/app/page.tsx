import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="PayRemind" width={120} height={36} className="h-9 w-auto" />
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="#how-it-works"
              className="hidden sm:block text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              How it works
            </Link>
            <Link
              href="#pricing"
              className="hidden sm:block text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="ml-2 inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24 text-center">
        <span className="inline-block mb-5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 tracking-wide uppercase">
          Built for coaching classes in India
        </span>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-slate-900">
          Stop Chasing Fees.<br />
          <span className="text-indigo-600">Start Collecting Them.</span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
          PayRemind automates fee reminders via WhatsApp, tracks payments month by month,
          and sends digital receipts — so you spend time teaching, not texting.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-xl text-base font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Start for free — no card needed
          </Link>
          <Link
            href="#how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-xl text-base font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            See how it works
          </Link>
        </div>
        <p className="mt-4 text-sm text-slate-400">Free for up to 3 students · No credit card required</p>
      </section>

      {/* Problem */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-900 mb-3">
            Sound familiar?
          </h2>
          <p className="text-center text-slate-500 mb-12 max-w-xl mx-auto">
            Every coaching class owner faces the same monthly headache.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                heading: 'Manually texting each parent',
                body: 'You open WhatsApp, find each contact, type the same message 30 times. It takes hours — and feels embarrassing.',
              },
              {
                heading: 'No idea who has paid',
                body: 'You rely on memory or scattered notes. By mid-month you\'ve lost track of who\'s paid and who\'s overdue.',
              },
              {
                heading: 'Parents ignore reminders',
                body: 'A single message gets forgotten. You follow up again and again, and the awkward conversation strains relationships.',
              },
            ].map((card) => (
              <div
                key={card.heading}
                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-red-500">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-7V5a1 1 0 112 0v6a1 1 0 11-2 0zm1 4a1.25 1.25 0 100-2.5A1.25 1.25 0 0010 15z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-900">{card.heading}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-900 mb-3">
            PayRemind fixes this in 2 minutes
          </h2>
          <p className="text-center text-slate-500 mb-12 max-w-xl mx-auto">
            One dashboard, zero spreadsheets, automatic WhatsApp reminders.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                icon: (
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-indigo-600">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                  </svg>
                ),
                heading: 'One-click WhatsApp reminders',
                body: 'Send personalised fee reminders to every student with a single click. No typing, no copy-paste.',
              },
              {
                icon: (
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-indigo-600">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                ),
                heading: 'Live payment dashboard',
                body: 'See exactly who has paid, who is pending, and who is overdue — updated in real time every month.',
              },
              {
                icon: (
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-indigo-600">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                ),
                heading: 'Instant digital receipts',
                body: 'Generate and send PDF receipts to parents on WhatsApp the moment a payment is marked paid.',
              },
            ].map((card) => (
              <div
                key={card.heading}
                className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6 flex flex-col gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-indigo-100 flex items-center justify-center shrink-0 shadow-sm">
                  {card.icon}
                </div>
                <h3 className="font-semibold text-slate-900">{card.heading}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-slate-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-900 mb-3">
            Up and running in 4 steps
          </h2>
          <p className="text-center text-slate-500 mb-14 max-w-xl mx-auto">
            No setup calls, no training, no IT team needed.
          </p>
          <div className="flex flex-col gap-6">
            {[
              {
                step: '1',
                title: 'Create your free account',
                desc: 'Sign up with your email. No credit card required. You\'re in within 30 seconds.',
              },
              {
                step: '2',
                title: 'Add your students',
                desc: 'Enter student names, phone numbers, fee amounts, and due dates — or import everyone at once from a CSV.',
              },
              {
                step: '3',
                title: 'Send WhatsApp reminders with one click',
                desc: 'On or after the due date, click the WhatsApp button. The app opens with a personalised message pre-filled — just hit Send.',
              },
              {
                step: '4',
                title: 'Mark paid and generate receipt',
                desc: 'When a fee is collected, mark it paid. PayRemind auto-generates a PDF receipt and lets you send it straight to the parent on WhatsApp.',
              },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-5 bg-white rounded-2xl border border-slate-200 p-6">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-900 mb-3">
            Simple, honest pricing
          </h2>
          <p className="text-center text-slate-500 mb-14 max-w-xl mx-auto">
            Start free. Upgrade only when you grow.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Free */}
            <div className="rounded-2xl border border-slate-200 p-7 flex flex-col gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Free</p>
                <p className="text-4xl font-extrabold text-slate-900">₹0</p>
                <p className="text-sm text-slate-400 mt-1">Forever free</p>
              </div>
              <ul className="flex flex-col gap-2 text-sm text-slate-600">
                {['Up to 3 students', 'WhatsApp reminders', 'Payment tracking', 'Digital receipts'].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="mt-auto inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors">
                Get started free
              </Link>
            </div>

            {/* Growth — highlighted */}
            <div className="rounded-2xl border-2 border-indigo-600 bg-indigo-600 p-7 flex flex-col gap-4 shadow-lg shadow-indigo-200 relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full tracking-wide uppercase">
                  Most Popular
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-200 mb-1">Pro</p>
                <p className="text-4xl font-extrabold text-white">₹99</p>
                <p className="text-sm text-indigo-300 mt-1">per month</p>
              </div>
              <ul className="flex flex-col gap-2 text-sm text-indigo-100">
                {[
                  'Unlimited students',
                  'Unlimited reminders',
                  'CSV bulk import',
                  'Batch management',
                  'Collection reports',
                  'Custom message templates',
                  'Priority support',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-300 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="mt-auto inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold bg-white text-indigo-700 hover:bg-indigo-50 transition-colors">
                Start Pro trial
              </Link>
            </div>

            {/* Annual */}
            <div className="rounded-2xl border border-slate-200 p-7 flex flex-col gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Annual</p>
                <div className="flex items-end gap-2">
                  <p className="text-4xl font-extrabold text-slate-900">₹2,499</p>
                </div>
                <p className="text-sm text-slate-400 mt-1">per year · save ₹689</p>
              </div>
              <ul className="flex flex-col gap-2 text-sm text-slate-600">
                {[
                  'Everything in Pro',
                  '2 months free',
                  'Early access to new features',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="mt-auto inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors">
                Get annual plan
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-900 mb-3">
            Coaching teachers love it
          </h2>
          <p className="text-center text-slate-500 mb-12 max-w-xl mx-auto">
            Real feedback from real teachers across India.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                quote: '"Pehle har mahine 2 ghante WhatsApp karna padta tha. Ab ek minute mein ho jaata hai. Bahut time bacha!"',
                name: 'Ramesh Gupta',
                role: 'Maths tutor, Pune',
              },
              {
                quote: '"The dashboard shows exactly who paid and who didn\'t. No more guessing. My collections went up 30% in the first month."',
                name: 'Priya Iyer',
                role: 'Science coach, Chennai',
              },
              {
                quote: '"Parents appreciate the receipt on WhatsApp. It looks professional and they trust me more. Very good app."',
                name: 'Suresh Patil',
                role: 'English classes, Nagpur',
              },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4">
                <p className="text-sm text-slate-600 leading-relaxed italic">{t.quote}</p>
                <div className="flex items-center gap-3 mt-auto pt-3 border-t border-slate-100">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-indigo-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
            Start recovering your fees today
          </h2>
          <p className="text-indigo-200 text-lg mb-10 leading-relaxed">
            Join hundreds of coaching teachers who send smarter reminders and collect fees on time — every month.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-base font-semibold bg-white text-indigo-700 hover:bg-indigo-50 transition-colors shadow-sm"
            >
              Create free account
            </Link>
            <Link
              href="#pricing"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-base font-semibold text-indigo-100 border border-indigo-400 hover:bg-indigo-500 transition-colors"
            >
              View pricing
            </Link>
          </div>
          <p className="mt-5 text-sm text-indigo-300">No credit card required · Free for up to 3 students</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Image src="/logo.svg" alt="PayRemind" width={120} height={36} className="h-9 w-auto opacity-70" />
          <p className="text-xs text-center sm:text-left">
            Fee tracking and WhatsApp reminders for coaching classes in India.
          </p>
          <p className="text-xs">&copy; {new Date().getFullYear()} PayRemind. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
