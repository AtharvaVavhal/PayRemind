'use client'

import { useRouter } from 'next/navigation'
import PaymentButton from '@/components/PaymentButton' // Adjust path if your button is elsewhere

interface Props {
  paymentId: string
  studentName: string
  feeAmount: number
}

export default function PaymentClientWrapper({ paymentId, studentName, feeAmount }: Props) {
  const router = useRouter()

  return (
    <div className="w-full flex justify-center">
      <PaymentButton 
        paymentId={paymentId}
        studentName={studentName}
        feeAmount={feeAmount}
        onSuccess={() => {
          // When Razorpay succeeds, refresh the page to show the "Payment Complete!" UI
          router.refresh()
        }}
      />
    </div>
  )
}