'use client'

import { useRouter } from 'next/navigation'
import PaymentButton from '@/components/PaymentButton' // Adjust path if your button is elsewhere

interface Props {
  paymentId: string
  studentName: string
  feeAmount: number
  razorpayKey: string
}

export default function PaymentClientWrapper({ paymentId, studentName, feeAmount, razorpayKey }: Props) {
  const router = useRouter()

  return (
    <div className="w-full flex justify-center">
      <PaymentButton
        paymentId={paymentId}
        studentName={studentName}
        feeAmount={feeAmount}
        razorpayKey={razorpayKey}
        onSuccess={() => router.refresh()}
      />
    </div>
  )
}