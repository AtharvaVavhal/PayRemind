'use client'

import { PaymentConfirmationTicket } from '@/components/ui/ticket-confirmation-card'

interface Props {
  receiptNo: string
  studentName: string
  phone: string
  feeAmount: number
  paidAt: string
}

export default function PaymentSuccessClient({ receiptNo, studentName, phone, feeAmount, paidAt }: Props) {
  return (
    <PaymentConfirmationTicket
      receiptNo={receiptNo}
      amount={feeAmount}
      date={new Date(paidAt)}
      studentName={studentName}
      phone={phone}
      barcodeValue={receiptNo.replace('REC-', '')}
    />
  )
}
