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
    await generateReceipt({
      studentName,
      phone,
      feeAmount,
      month,
      paidAt,
      ownerEmail: '',
      receiptNo,
    })
    setDownloading(false)
  }

  function handleWhatsApp() {
    const monthLabel = new Date(month + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    const message = `✅ Payment Confirmed!\n\nDear ${studentName},\n\nYour fee of ₹${feeAmount.toLocaleString('en-IN')} for ${monthLabel} has been received.\n\nReceipt No: ${receiptNo}\n\nThank you! 🙏`
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm">
      <PaymentConfirmationTicket
        receiptNo={receiptNo}
        amount={feeAmount}
        date={new Date(paidAt)}
        studentName={studentName}
        phone={phone}
        barcodeValue={receiptNo.replace('REC-', '')}
      />

      {/* Action buttons */}
      <div className="flex flex-col gap-2 w-full">
        <Button
          className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={handleDownload}
          disabled={downloading}
        >
          <Download className="h-4 w-4" />
          {downloading ? 'Generating…' : 'Download PDF Receipt'}
        </Button>

        <Button
          variant="outline"
          className="w-full gap-2 border-green-500 text-green-700 hover:bg-green-50"
          onClick={handleWhatsApp}
        >
          <MessageCircle className="h-4 w-4" />
          Share on WhatsApp
        </Button>

        <Link href="/" className="w-full">
          <Button variant="ghost" className="w-full gap-2 text-muted-foreground">
            <Home className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <p className="text-xs text-muted-foreground/60 text-center pb-2">
        Powered by PayRemind · payremind.in
      </p>
    </div>
  )
}
