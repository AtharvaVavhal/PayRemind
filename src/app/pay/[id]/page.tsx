import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Card, CardContent } from '@/components/ui/card'
import PaymentClientWrapper from './PaymentClientWrapper'
import PaymentSuccessClient from './PaymentSuccessClient'

// Update the type signature to treat params as a Promise
export default async function PublicPaymentPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // Await the params to extract the id
  const { id } = await params
  
  const supabase = await createServerSupabaseClient()
  
  // 1. Fetch payment and student info
  const { data: payment } = await supabase
    .from('payments')
    .select('*, students(*)')
    .eq('id', id)
    .single()

  if (!payment) return notFound()

  // Safely cast student data
  const student = payment.students as any 

  // Paid — show the animated ticket (no outer card, ticket is self-contained)
  if (payment.status === 'paid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 pt-4 pb-20">
        <PaymentSuccessClient
          receiptNo={payment.receipt_no ?? payment.id.slice(0, 8).toUpperCase()}
          studentName={student.name}
          phone={student.phone ?? ''}
          feeAmount={student.fee_amount}
          month={payment.month}
          paidAt={payment.paid_at ?? new Date().toISOString()}
        />
      </div>
    )
  }

  // Pending — show the payment form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4">
      <Card className="max-w-md w-full shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Fee Payment</h1>
              <p className="text-gray-500 mt-1">PayRemind Secure Checkout</p>
            </div>

            <div className="bg-gray-100 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Student Name:</span>
                <span className="font-medium">{student.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fee Month:</span>
                <span className="font-medium">{payment.month}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                <span className="text-gray-900 font-bold">Amount Due:</span>
                <span className="text-gray-900 font-bold text-lg">₹{student.fee_amount}</span>
              </div>
            </div>

            <PaymentClientWrapper
              paymentId={payment.id}
              studentName={student.name}
              feeAmount={student.fee_amount}
              razorpayKey={process.env.RAZORPAY_KEY_ID ?? ''}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}