'use client'

import * as React from 'react'
import { IndianRupee } from 'lucide-react'
import { cn } from '@/lib/utils'

const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const DashedLine = () => (
  <div className="w-full border-t-2 border-dashed border-border" aria-hidden="true" />
)

const Barcode = ({ value }: { value: string }) => {
  const hashCode = (s: string) =>
    s.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
  const seed = hashCode(value)
  const random = (s: number) => {
    const x = Math.sin(s) * 10000
    return x - Math.floor(x)
  }

  const bars = Array.from({ length: 60 }).map((_, i) => ({
    width: random(seed + i) > 0.7 ? 2.5 : 1.5,
  }))

  const spacing = 1.5
  const totalWidth = bars.reduce((acc, b) => acc + b.width + spacing, 0) - spacing
  const svgW = 250
  const svgH = 70
  let currentX = (svgW - totalWidth) / 2

  return (
    <div className="flex flex-col items-center py-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        aria-label={`Barcode for ${value}`}
        className="fill-current text-foreground"
      >
        {bars.map((bar, i) => {
          const x = currentX
          currentX += bar.width + spacing
          return <rect key={i} x={x} y="10" width={bar.width} height="50" />
        })}
      </svg>
      <p className="text-sm text-muted-foreground tracking-[0.3em] mt-2">{value}</p>
    </div>
  )
}

const ConfettiExplosion = () => {
  const colors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#8b5cf6', '#f97316']
  return (
    <>
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-4"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${-20 + Math.random() * 10}%`,
              backgroundColor: colors[i % colors.length],
              transform: `rotate(${Math.random() * 360}deg)`,
              animation: `confetti-fall ${2.5 + Math.random() * 2.5}s ${Math.random() * 2}s linear forwards`,
            }}
          />
        ))}
      </div>
    </>
  )
}

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

    React.useEffect(() => {
      const t1 = setTimeout(() => setShowConfetti(true), 100)
      const t2 = setTimeout(() => setShowConfetti(false), 6000)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }, [])

    const formattedAmount = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)

    const formattedDate = new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date).replace(',', ' •')

    const maskedPhone = phone.length >= 4
      ? `+91 ••••••${phone.slice(-4)}`
      : phone

    return (
      <>
        {showConfetti && <ConfettiExplosion />}
        <div
          ref={ref}
          className={cn(
            'relative w-full max-w-sm bg-card text-card-foreground rounded-2xl shadow-lg font-sans z-10',
            'animate-in fade-in-0 zoom-in-95 duration-500',
            className,
          )}
          {...props}
        >
          {/* Ticket punch-out circles */}
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background" />
          <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background" />

          {/* Institution logo top-left */}
          <div className="px-6 pt-5 pb-3 border-b border-border/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/institution-logo.png"
              alt="Institution"
              className="h-9 w-auto object-contain object-left"
            />
          </div>

          {/* Header */}
          <div className="p-8 flex flex-col items-center text-center">
            <div className="p-3 bg-primary/10 rounded-full animate-in zoom-in-50 delay-300 duration-500">
              <CheckCircleIcon className="w-10 h-10 text-primary animate-in zoom-in-75 delay-500 duration-500" />
            </div>
            <h1 className="text-2xl font-semibold mt-4">Payment Received!</h1>
            <p className="text-muted-foreground mt-1">Fee collected successfully</p>
          </div>

          {/* Body */}
          <div className="px-8 pb-8 space-y-6">
            <DashedLine />

            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Receipt No.</p>
                <p className="font-mono font-medium text-sm">{receiptNo}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase">Amount</p>
                <p className="font-semibold text-lg">{formattedAmount}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground uppercase">Date &amp; Time</p>
              <p className="font-medium">{formattedDate}</p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <IndianRupee className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{studentName}</p>
                <p className="text-muted-foreground font-mono text-sm tracking-wider">{maskedPhone}</p>
              </div>
            </div>

            <DashedLine />

            <Barcode value={barcodeValue} />
          </div>
        </div>
      </>
    )
  },
)

PaymentConfirmationTicket.displayName = 'PaymentConfirmationTicket'

export { PaymentConfirmationTicket }
