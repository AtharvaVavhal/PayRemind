'use client'

import { PaymentConfirmationTicket } from '@/components/ui/ticket-confirmation-card'
import { generateReceipt } from '@/lib/receipt'
import { Button } from '@/components/ui/button'
import { Download, MessageCircle, Home } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface Props {
  receiptNo: string
  studentName: string
  phone: string
  feeAmount: number
  month: string
  paidAt: string
}

export default function PaymentSuccessClient({ receiptNo, studentName, phone, feeAmount, month, paidAt }: Props) {
  const [downloading, setDownloading] = useState(false)

  async function handleDownload() {
    setDownloading(true)
    await generateReceipt({ studentName, phone, feeAmount, month, paidAt, ownerEmail: '', receiptNo })
    setDownloading(false)
  }

  function handleWhatsApp() {
    const monthLabel = new Date(month + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    const msg = `✅ Payment Confirmed!\n\nDear ${studentName},\nYour fee of ₹${feeAmount.toLocaleString('en-IN')} for ${monthLabel} has been received.\n\nReceipt No: ${receiptNo}\n\nThank you! 🙏`
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      {/* Decorative background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-500 rounded-full filter blur-[120px] opacity-25"
          style={{ animation: 'orb-float 8s ease-in-out infinite' }} />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-500 rounded-full filter blur-[120px] opacity-20"
          style={{ animation: 'orb-float 11s ease-in-out 2s infinite' }} />
        <div className="absolute top-2/3 left-1/3 w-64 h-64 bg-blue-400 rounded-full filter blur-[80px] opacity-15"
          style={{ animation: 'orb-float 7s ease-in-out 4s infinite' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-5 w-full max-w-sm">
        <PaymentConfirmationTicket
          receiptNo={receiptNo}
          amount={feeAmount}
          date={new Date(paidAt)}
          studentName={studentName}
          phone={phone}
          barcodeValue={receiptNo.replace('REC-', '')}
        />

        {/* Action buttons — stagger in after ticket settles */}
        <div className="flex flex-col gap-2 w-full">
          <Button
            className="w-full gap-2 bg-white text-indigo-700 hover:bg-white/90 font-semibold shadow-xl shadow-black/30 h-10"
            style={{ animation: 'rise 0.5s cubic-bezier(0.34,1.56,0.64,1) 2.0s both', opacity: 0 }}
            onClick={handleDownload}
            disabled={downloading}
          >
            <Download className="h-4 w-4" />
            {downloading ? 'Generating…' : 'Download PDF Receipt'}
          </Button>

          <Button
            className="w-full gap-2 bg-[#25D366] text-white hover:bg-[#1ebe5d] font-semibold shadow-xl shadow-black/30 h-10 border-0"
            style={{ animation: 'rise 0.5s cubic-bezier(0.34,1.56,0.64,1) 2.15s both', opacity: 0 }}
            onClick={handleWhatsApp}
          >
            <MessageCircle className="h-4 w-4" />
            Share on WhatsApp
          </Button>

          <Link href="/" className="w-full">
            <Button
              variant="ghost"
              className="w-full gap-2 text-white/50 hover:text-white hover:bg-white/10 h-10"
              style={{ animation: 'rise 0.5s ease-out 2.3s both', opacity: 0 }}
            >
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <p className="text-[11px] text-white/25 text-center pb-2 tracking-wide">
          PAYREMIND · payremind.in
        </p>
      </div>
    </>
  )
}
