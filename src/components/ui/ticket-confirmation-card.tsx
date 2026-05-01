'use client'

import * as React from 'react'
import { IndianRupee } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Keyframes ────────────────────────────────────────────────────────────────
const STYLES = `
  @keyframes ticket-enter {
    0%   { opacity:0; transform: translateY(80px) scale(0.82); }
    55%  { transform: translateY(-14px) scale(1.03); opacity:1; }
    75%  { transform: translateY(7px) scale(0.99); }
    90%  { transform: translateY(-3px) scale(1.005); }
    100% { transform: translateY(0) scale(1); opacity:1; }
  }
  @keyframes shine-sweep {
    0%   { transform: translateX(-180%) skewX(-20deg); opacity:1; }
    100% { transform: translateX(280%) skewX(-20deg); opacity:1; }
  }
  @keyframes logo-drop {
    0%   { opacity:0; transform: translateY(-24px) scale(0.9); }
    70%  { transform: translateY(4px) scale(1.02); }
    100% { opacity:1; transform: translateY(0) scale(1); }
  }
  @keyframes pulse-ring {
    0%   { transform: scale(1); opacity:0.5; }
    100% { transform: scale(2.6); opacity:0; }
  }
  @keyframes check-circle {
    from { stroke-dashoffset: 66; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes check-mark {
    from { stroke-dashoffset: 30; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes rise {
    0%   { opacity:0; transform: translateY(22px); }
    100% { opacity:1; transform: translateY(0); }
  }
  @keyframes amount-pop {
    0%   { opacity:0; transform: scale(0.4); }
    65%  { transform: scale(1.18); }
    85%  { transform: scale(0.97); }
    100% { opacity:1; transform: scale(1); }
  }
  @keyframes scan-line {
    0%   { top: 10px; opacity:1; }
    90%  { top: 60px; opacity:1; }
    100% { top: 60px; opacity:0; }
  }
  @keyframes confetti-fall {
    0%   { transform: translateY(-10vh) rotate(0deg); opacity:1; }
    100% { transform: translateY(110vh) rotate(720deg); opacity:0; }
  }
  @keyframes orb-float {
    0%,100% { transform: translateY(0) scale(1); }
    40%     { transform: translateY(-28px) scale(1.06); }
    70%     { transform: translateY(16px) scale(0.94); }
  }
`

// ── Helpers ──────────────────────────────────────────────────────────────────
const s = (animation: string) => ({ style: { animation } })

function useCountUp(target: number, duration = 900, delay = 1200) {
  const [val, setVal] = React.useState(0)
  React.useEffect(() => {
    const start = Date.now() + delay
    let raf: number
    const tick = () => {
      const now = Date.now()
      if (now < start) { raf = requestAnimationFrame(tick); return }
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setVal(Math.round(target * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, delay])
  return val
}

// ── Sub-components ───────────────────────────────────────────────────────────
const DashedLine = ({ style }: { style?: React.CSSProperties }) => (
  <div className="w-full border-t-2 border-dashed border-border" aria-hidden="true" style={style} />
)

const AnimatedCheck = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path
      d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
      style={{ strokeDasharray: 66, strokeDashoffset: 66,
        animation: 'check-circle 0.7s ease-out 0.9s forwards' }}
    />
    <polyline
      points="22 4 12 14.01 9 11.01"
      style={{ strokeDasharray: 30, strokeDashoffset: 30,
        animation: 'check-mark 0.4s ease-out 1.6s forwards' }}
    />
  </svg>
)

const Barcode = ({ value }: { value: string }) => {
  const seed = value.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)
  const rng  = (s: number) => { const x = Math.sin(s) * 10000; return x - Math.floor(x) }
  const bars = Array.from({ length: 60 }).map((_, i) => ({ width: rng(seed + i) > 0.7 ? 2.5 : 1.5 }))
  const spacing = 1.5
  const totalW  = bars.reduce((a, b) => a + b.width + spacing, 0) - spacing
  const svgW = 250, svgH = 58
  let cx = (svgW - totalW) / 2

  return (
    <div className="flex flex-col items-center py-1">
      <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" width={svgW} height={svgH}
          viewBox={`0 0 ${svgW} ${svgH}`} aria-label={`Barcode ${value}`}
          className="fill-current text-foreground">
          {bars.map((bar, i) => {
            const x = cx; cx += bar.width + spacing
            return <rect key={i} x={x} y="8" width={bar.width} height="42" />
          })}
        </svg>
        {/* Scan line */}
        <div className="absolute left-0 right-0 h-0.5 bg-red-500/60 blur-[1px]"
          style={{ top: 8, animation: 'scan-line 1.2s ease-in-out 1.8s forwards', opacity: 0 }} />
      </div>
      <p className="text-sm text-muted-foreground tracking-[0.3em] mt-1">{value}</p>
    </div>
  )
}

const ConfettiExplosion = () => {
  const colors = ['#ef4444','#3b82f6','#22c55e','#eab308','#8b5cf6','#f97316','#ec4899']
  const pieces = Array.from({ length: 120 }).map((_, i) => ({
    left: `${Math.random() * 100}%`,
    top: `${-20 + Math.random() * 10}%`,
    color: colors[i % colors.length],
    rotate: Math.random() * 360,
    dur: 2.5 + Math.random() * 2.5,
    delay: Math.random() * 1.5,
    w: Math.random() > 0.5 ? 8 : 6,
    h: Math.random() > 0.5 ? 16 : 10,
  }))
  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
      {pieces.map((p, i) => (
        <div key={i} className="absolute rounded-sm"
          style={{
            left: p.left, top: p.top, width: p.w, height: p.h,
            backgroundColor: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animation: `confetti-fall ${p.dur}s ${p.delay}s linear forwards`,
          }} />
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export interface TicketProps extends React.HTMLAttributes<HTMLDivElement> {
  receiptNo: string
  amount: number
  date: Date
  studentName: string
  phone: string
  barcodeValue: string
}

const PaymentConfirmationTicket = React.forwardRef<HTMLDivElement, TicketProps>(
  ({ className, receiptNo, amount, date, studentName, phone, barcodeValue, ...props }, ref) => {
    const [showConfetti, setShowConfetti] = React.useState(false)
    const count = useCountUp(amount)

    React.useEffect(() => {
      const t1 = setTimeout(() => setShowConfetti(true), 200)
      const t2 = setTimeout(() => setShowConfetti(false), 7000)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }, [])

    const formattedDate = new Intl.DateTimeFormat('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(date).replace(',', ' •')

    const maskedPhone = phone.length >= 4 ? `+91 ••••••${phone.slice(-4)}` : phone

    return (
      <>
        <style>{STYLES}</style>
        {showConfetti && <ConfettiExplosion />}

        <div
          ref={ref}
          className={cn(
            'relative w-full max-w-sm bg-card text-card-foreground rounded-2xl font-sans z-10',
            'shadow-2xl shadow-black/40',
            className,
          )}
          style={{ animation: 'ticket-enter 0.85s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
          {...props}
        >
          {/* Shine sweep */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none z-20">
            <div className="absolute top-0 h-full w-2/5 bg-gradient-to-r from-transparent via-white/25 to-transparent"
              style={{ animation: 'shine-sweep 0.9s ease-out 1s forwards', transform: 'translateX(-180%) skewX(-20deg)' }} />
          </div>

          {/* Punch-out circles */}
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900 z-10" />
          <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900 z-10" />

          {/* Institution logo */}
          <div className="px-6 pt-5 pb-4 border-b border-border/40 flex justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/institution-logo.png" alt="Institution"
              className="h-28 w-auto max-w-full object-contain"
              style={{ animation: 'logo-drop 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.2s both' }} />
          </div>

          {/* Header */}
          <div className="pt-5 pb-3 px-6 flex flex-col items-center text-center">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-16 h-16 rounded-full bg-primary/20"
                style={{ animation: 'pulse-ring 1.1s ease-out 1.6s both' }} />
              <div className="absolute w-16 h-16 rounded-full bg-primary/15"
                style={{ animation: 'pulse-ring 1.1s ease-out 1.9s both' }} />
              <div className="p-3 bg-primary/10 rounded-full z-10"
                style={{ animation: 'rise 0.5s ease-out 0.6s both' }}>
                <div className="w-9 h-9 text-primary"><AnimatedCheck /></div>
              </div>
            </div>
            <h1 className="text-2xl font-semibold mt-4"
              style={{ animation: 'rise 0.5s ease-out 1.1s both', opacity: 0 }}>
              Payment Received!
            </h1>
            <p className="text-muted-foreground mt-1"
              style={{ animation: 'rise 0.5s ease-out 1.2s both', opacity: 0 }}>
              Fee collected successfully
            </p>
          </div>

          {/* Body */}
          <div className="px-7 pb-5 space-y-4">
            <DashedLine style={{ animation: 'rise 0.4s ease-out 1.25s both', opacity: 0 }} />

            {/* Receipt no + amount + date */}
            <div className="grid grid-cols-3 gap-3 text-left"
              style={{ animation: 'rise 0.5s ease-out 1.3s both', opacity: 0 }}>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Receipt No.</p>
                <p className="font-mono font-medium text-sm mt-0.5">{receiptNo}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase">Amount</p>
                <p className="font-semibold text-lg mt-0.5"
                  style={{ animation: 'amount-pop 0.6s cubic-bezier(0.34,1.56,0.64,1) 1.3s both', opacity: 0 }}>
                  ₹{count.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase">Date</p>
                <p className="font-medium text-xs mt-0.5 leading-relaxed">{formattedDate}</p>
              </div>
            </div>

            {/* Student */}
            <div className="bg-muted/50 p-4 rounded-lg flex items-center gap-4"
              style={{ animation: 'rise 0.5s ease-out 1.4s both', opacity: 0 }}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <IndianRupee className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{studentName}</p>
                <p className="text-muted-foreground font-mono text-sm tracking-wider">{maskedPhone}</p>
              </div>
            </div>

            <DashedLine style={{ animation: 'rise 0.4s ease-out 1.5s both', opacity: 0 }} />

            <div style={{ animation: 'rise 0.5s ease-out 1.6s both', opacity: 0 }}>
              <Barcode value={barcodeValue} />
            </div>

            {/* PayRemind footer */}
            <div className="flex items-center justify-center gap-1.5 -mt-1"
              style={{ animation: 'rise 0.5s ease-out 1.75s both', opacity: 0 }}>
              <span className="text-[10px] tracking-widest text-muted-foreground/40 uppercase">Powered by</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="PayRemind" className="h-5 w-auto opacity-40" />
            </div>
          </div>
        </div>
      </>
    )
  },
)

PaymentConfirmationTicket.displayName = 'PaymentConfirmationTicket'
export { PaymentConfirmationTicket }
